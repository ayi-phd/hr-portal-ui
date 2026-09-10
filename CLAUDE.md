# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # dev server at http://localhost:3000
npm run build            # production build (also runs lint + type-check)
npm run start            # serve the production build
npm run lint             # next lint (eslint-config-next / core-web-vitals)
npx tsc --noEmit         # type-check only
```

There is no test suite in this repo yet — no test runner is configured.

## Architecture

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

### Policies Assistant (streaming)

`lib/policyAnswers.ts` maps a question to a canned answer + citation by keyword;
it is shared by the API route (never import UI into it, keep it framework-free).
`app/api/policies-assistant/route.ts` POSTs → streams the answer text as
`text/plain` chunks via a `ReadableStream`, with the citation in the
`X-Policy-Source` response header. `app/(app)/policies-assistant/page.tsx`
reads `response.body.getReader()` and appends chunks to the last message.
Making it real = swap the stream body for a model call and replace `answerFor`
with retrieval over the policy corpus.

### Documents upload

`app/(app)/documents/page.tsx` keeps `File` objects in component state, filters
by extension (`.pdf` / `.docx` / `.md`) client-side, and on "Upload" POSTs a
`FormData` (field name `files`) to `app/api/documents/route.ts`, which
re-validates and echoes metadata. Nothing is persisted — add storage +
per-document records + indexing there.

## `design/` is not part of the app

`design/` holds the Claude Design canvas (`fractal-hr-portal.html` + `*.dc.html`
artboards + `canvas.json`) the UI was scaffolded from. Next.js never reads it.
It is the source of truth for the visual design; regenerate it with the
`/design` skill operating on the files in `design/`, not by hand-editing the
seeded `.html`.

## `contracts/` — backend API spec

`contracts/` holds the vendored OpenAPI contract for the backend the frontend
talks to (currently empty — `.gitkeep` placeholder). Not part of the Next
build. When populated it is the input for a typed API client: generate types
from it rather than hand-writing request/response shapes, and keep the vendored
copy in sync with the backend's canonical spec (see `contracts/README.md` once
added).

## Known placeholders (v0)

Auth, the assistant's retrieval/model call, document storage, all dashboard
figures (sample constants at the top of `app/(app)/page.tsx`), and role-based
tab sets — the HR-admin "Documents" tab is currently shown to every user.

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
