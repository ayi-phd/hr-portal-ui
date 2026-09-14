import type { components } from "./hr-policy-assistant.types";

/**
 * Client for the HR Policy Assistant backend (FastAPI), called directly from
 * the browser — see contracts/openapi-hr-policies-assistant.json for the
 * contract and CLAUDE.md for the architecture note. No auth for v0; CORS on
 * the backend must allow this app's origin.
 */

export type AskRequest = components["schemas"]["AskRequest"];
export type PolicyAnswer = components["schemas"]["PolicyAnswer"];
export type HttpValidationError = components["schemas"]["HTTPValidationError"];

const DEFAULT_BASE_URL = "http://localhost:8000";

/** Typical latency is ~5s; give real requests headroom before giving up. */
const DEFAULT_TIMEOUT_MS = 15_000;

export class PolicyAssistantError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PolicyAssistantError";
    this.status = status;
  }
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_HR_ASSISTANT_API_URL?.replace(/\/+$/, "") ||
    DEFAULT_BASE_URL
  );
}

export async function askPolicyQuestion(
  question: string,
  opts: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<PolicyAnswer> {
  const controller = new AbortController();
  const onOuterAbort = () => controller.abort();
  opts.signal?.addEventListener("abort", onOuterAbort);
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question } satisfies AskRequest),
      signal: controller.signal,
    });
  } catch {
    throw new PolicyAssistantError(
      controller.signal.aborted
        ? "The assistant took too long to respond."
        : "Could not reach the assistant service.",
    );
  } finally {
    clearTimeout(timeout);
    opts.signal?.removeEventListener("abort", onOuterAbort);
  }

  if (res.status === 422) {
    const body = (await res.json().catch(() => null)) as HttpValidationError | null;
    throw new PolicyAssistantError(
      body?.detail?.[0]?.msg ?? "That question couldn't be validated.",
      422,
    );
  }

  if (!res.ok) {
    // Backend documents a plain 500 today; treat any other non-2xx the same way.
    throw new PolicyAssistantError(
      "The assistant service returned an error.",
      res.status,
    );
  }

  return (await res.json()) as PolicyAnswer;
}
