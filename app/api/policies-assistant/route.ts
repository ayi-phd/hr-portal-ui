import { answerFor } from "@/lib/policyAnswers";

/**
 * Streams a policy answer back token-by-token.
 *
 * v0 streams a canned response (see lib/policyAnswers). To make it real, swap
 * the `ReadableStream` body for a streaming model call and forward its chunks.
 * The citation is returned in the `X-Policy-Source` response header.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let question = "";
  try {
    const payload = (await request.json()) as { question?: unknown };
    question = typeof payload.question === "string" ? payload.question : "";
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!question.trim()) {
    return new Response("Missing 'question'", { status: 400 });
  }

  const { text, source } = answerFor(question);
  const encoder = new TextEncoder();
  const chunks = text.match(/\s+|\S+/g) ?? [text];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Policy-Source": source,
    },
  });
}
