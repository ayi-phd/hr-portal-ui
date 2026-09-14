# Fractal HR Portal

Corporate HR web portal — Next.js (App Router) + React + TypeScript.
Scaffolded from the design canvas in [`design/`](./design) (`fractal-hr-portal.html`
plus the `*.dc.html` artboard sources), kept for reference. Nothing in `design/`
is part of the build.

## Getting started

```bash
npm install
npm run dev
```

Open **http://localhost:3000/hr-portal** (note the `/hr-portal` — the app sets
`basePath: "/hr-portal"` in `next.config.mjs` so dev matches how it's deployed;
the bare root `/` is a 404) — you'll be sent to `/hr-portal/login`.

The Policies Assistant calls a separate FastAPI backend directly from the
browser (`NEXT_PUBLIC_HR_ASSISTANT_API_URL`, default `http://localhost:8000`
in dev — see `.env.example`). Run that backend locally, or point the var at a
deployed instance, for the assistant page to answer questions.

## Deployment

This app is a **static export** (`output: "export"` in `next.config.mjs`) —
`npm run build` produces plain files in `out/` with no Node server involved.
It's meant to be deployed as a folder of static assets (e.g. S3 + CloudFront)
served at `https://fractalai.cloud/hr-portal/*`. Consequences:

- **No Next.js API routes can exist here** — anything server-side (the
  Policies Assistant today, Documents upload eventually) must be a separate
  backend called directly from the browser.
- `next start` doesn't work with this config; `npm run start` previews `out/`
  with `serve` instead — for `basePath` reasons a plain `serve out` won't
  resolve `/hr-portal/...` locally the way the real deployment will (files sit
  at `out/*.html`, not `out/hr-portal/*.html`); this is a local-preview quirk,
  not a build problem.
- Deploying: upload the contents of `out/` under the `hr-portal/` prefix in
  the target S3 bucket, matching CloudFront's path pattern for that origin.

## Routes

| Path                  | Page                                                        |
| --------------------- | ------------------------------------------------------------ |
| `/login`              | Login form (auth disabled — any input signs you in)          |
| `/`                   | Employee home dashboard                                      |
| `/policies-assistant` | Q&A over HR policies, backed by the real assistant API       |
| `/documents`          | Drag-and-drop file picker — **UI placeholder, no backend**   |

(Paths above are relative to the `/hr-portal` basePath.) The Policies
Assistant has no Next.js API route — see `lib/api/hrPolicyAssistant.ts` — and
neither does Documents; "Upload" there just simulates success locally.

## Structure

```
app/
  layout.tsx              root layout — fonts, <AuthProvider>
  login/                  login screen (no nav)
  (app)/                  signed-in shell (RequireAuth + TopNav)
    layout.tsx
    page.tsx              /  — dashboard
    policies-assistant/    calls the backend directly (no proxy route)
    documents/             UI placeholder only, no network call
components/                AuthProvider, RequireAuth, TopNav, Icon
lib/
  api/
    hrPolicyAssistant.ts          typed client for POST /ask
    hr-policy-assistant.types.ts  generated — `npm run gen:api`, don't hand-edit
  exampleQuestions.ts       empty-state starter prompts
contracts/
  openapi-hr-policies-assistant.json   vendored backend contract (source for gen:api)
```

## What's a placeholder (wire these up next)

- **Auth** — `components/AuthProvider.tsx` fakes a session in `sessionStorage`.
  Replace with a real provider (NextAuth.js, Clerk, custom session cookie) and
  move route protection into `middleware.ts`.
- **Documents** — UI only; no API exists yet at all. When a real upload
  endpoint exists (a FastAPI route, not a Next.js one — this app can't host
  one), wire it the same way `lib/api/hrPolicyAssistant.ts` wires the
  Policies Assistant.
- **Dashboard data** — greeting, balances, payday, benefits, announcements and
  to-dos in `app/(app)/page.tsx` are sample constants.
- **Role-based tabs** — for v0 every tab (including the HR-admin "Documents"
  tab) shows in the employee view. Gate the tab set by role later.
- **Policies Assistant backend** — real endpoint now, but v0: no auth, no
  conversation history (each question is self-contained), no streaming.

## Design tokens

All colors / radii / spacing live as CSS custom properties in
`app/globals.css`; fonts are Bricolage Grotesque (display) + Figtree (body)
via `next/font`.
