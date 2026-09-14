# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # dev server at http://localhost:3000/hr-portal
npm run build            # static export to out/ (also runs lint + type-check)
npm run start            # preview the exported out/ with `serve` (NOT `next start` — see below)
npm run lint             # next lint (eslint-config-next / core-web-vitals)
npx tsc --noEmit         # type-check only
npm run gen:api          # regenerate lib/api/hr-policy-assistant.types.ts from contracts/
```

There is no test suite in this repo yet — no test runner is configured.

## Architecture

**Static export, no Next.js server.** `next.config.mjs` sets `output: "export"`
and `basePath: "/hr-portal"`: `npm run build` produces plain files in `out/`
(HTML/CSS/JS) deployed to S3 + CloudFront at `https://fractalai.cloud/hr-portal/*`
alongside other apps on the same distribution/bucket — there is no Node
runtime in production. This is why the app has **no Next.js API routes**: they
cannot exist in a static export. `next start` does not work with this config
(`npm run start` uses `serve` on `out/` instead) — this only matters for local
verification, not for how the app is actually hosted. Any future server-side
need (the Policies Assistant, Documents upload, auth) is met by calling an
external backend directly from the browser, never by adding a route back into
`app/api/`.

Next.js 14 **App Router** + React 18 + TypeScript. Styling is **CSS Modules**
(`*.module.css` next to each component/page) layered over a design-token system:
every color, radius, and spacing value is a CSS custom property defined in
`app/globals.css` (`--accent`, `--bg`, `--ink-*`, `--radius-*`, ...). Fonts are
Bricolage Grotesque (display) + Figtree (body) wired through `next/font` in
`app/layout.tsx` as `--font-display` / `--font-body`. Prefer editing/adding
tokens over hard-coding values. Path alias `@/*` maps to the repo root.

### Auth + route layout (the load-bearing structure)

Auth is a **client-only placeholder** — no backend, no `middleware.ts`.

- `components/AuthProvider.tsx` holds `authed` in React state, mirrored to
  `sessionStorage`. `login()` accepts anything and routes to `/`; `logout()`
  clears and routes to `/login`. Mounted once in the root `app/layout.tsx`.
- `app/(app)/` is a **route group** = the signed-in shell. Its
  `layout.tsx` wraps children in `<RequireAuth>` (redirects to `/login` when
  not authed) + `<TopNav>`. Every page under `(app)/` (`/`,
  `/policies-assistant`, `/documents`) inherits that guard and nav.
- `app/login/page.tsx` lives **outside** the group — no guard, no nav.

To add a signed-in page, put it under `app/(app)/`. To change route
protection, replace the client `RequireAuth` approach with real auth +
`middleware.ts`.

### Policies Assistant (real backend, called directly from the browser)

`app/(app)/policies-assistant/page.tsx` calls `askPolicyQuestion()` in
`lib/api/hrPolicyAssistant.ts`, which POSTs straight to the FastAPI backend's
`POST /ask` (base URL from `NEXT_PUBLIC_HR_ASSISTANT_API_URL`, see below) —
**there is no Next.js proxy route for this**, by design: no auth in v0, and
CORS on the backend is what makes the direct call possible (see
`contracts/openapi-hr-policies-assistant.json`, `servers`). The backend is
single-shot/stateless (no conversation history) and does not stream — the UI
shows a "thinking" (pulsing-dots) state, then renders the full answer plus a
pill per `sources[]` entry once the response resolves. Request/response types
(`AskRequest`, `PolicyAnswer`) come from the generated
`lib/api/hr-policy-assistant.types.ts` — regenerate it (`npm run gen:api`)
after any contract change rather than hand-editing it. `lib/exampleQuestions.ts`
only holds the empty-state starter prompts now; it has no answer logic.

Env vars: `.env.development` / `.env.production` pin the API base URL per
environment (both committed — no secrets, just a public URL); override locally
with a gitignored `.env.local`.

### Documents upload — UI placeholder, no backend

`app/(app)/documents/page.tsx` is intentionally placeholder-only: drag-and-drop,
the file list, and extension filtering (`.pdf` / `.docx` / `.md`) are real and
fully client-side, but "Upload" just flips each file's status to "uploaded"
locally (a `setTimeout`, no network call) — there is no API route for this
(there was one; it was removed because a static export can't host it — see
Architecture above) and nothing is persisted. When a real endpoint exists it
will be called the same way the Policies Assistant calls its backend (direct
`fetch` to a FastAPI URL), not a Next.js route.

## `design/` is not part of the app

`design/` holds the Claude Design canvas (`fractal-hr-portal.html` + `*.dc.html`
artboards + `canvas.json`) the UI was scaffolded from. Next.js never reads it.
It is the source of truth for the visual design; regenerate it with the
`/design` skill operating on the files in `design/`, not by hand-editing the
seeded `.html`.

## `contracts/` — backend API spec

`contracts/openapi-hr-policies-assistant.json` is the vendored OpenAPI contract
for the FastAPI backend (`GET /health`, `POST /ask`; `servers` lists prod
`https://api.fractalai.cloud` and local dev `http://localhost:8000` — no
"test"/staging URL yet). Not part of the Next build. It's the input for
`npm run gen:api`; regenerate types after any contract change instead of
hand-editing `lib/api/hr-policy-assistant.types.ts`. This is a **vendored
copy** — the backend repo owns the canonical spec, so re-sync this file when
it changes there (no automated sync exists yet).

## Known placeholders (v0)

Auth, the entire document-upload backend (UI only, no API at all — see above),
all dashboard figures (sample constants at the top of `app/(app)/page.tsx`),
and role-based tab sets — the HR-admin "Documents" tab is currently shown to
every user. The Policies Assistant calls a real backend, but that backend is
itself a placeholder (single canned-ish answer path) and has no conversation
memory (self-contained questions only, by design for v0).

## Git Flow

- `main` is the production branch.
- `develop` is the default working branch.
- All feature branches start from `develop`.

For each new task or feature:

1. Ask whether I want a new feature branch.
2. If yes, find the greatest `NNN` among existing `feat/NNN-*` branches and create `feat/NNN-brief-feature-name` from `develop`, incrementing `NNN` by 1.
3. Implement and test the task on that branch.
4. When complete, stage changes and draft a commit message beginning with the task number, e.g. `Feature 003 Implement Tree-sitter predicates`. **Ask for approval before committing.**
5. After commit approval, commit the changes. **Ask for approval before pushing.**
6. After push, prompt: **"Please create a PR `feat/NNN-...` → `develop` in GitHub, review it, and let me know when it's merged."**
7. After merge is explicitly confirmed:
   ```bash
   git switch develop
   git pull origin develop
   ```
8. Never delete local branches.
**Never commit, push, or switch branches without explicit approval at that step. Never delete local branches. **
