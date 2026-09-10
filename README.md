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

Open http://localhost:3000 — you'll be sent to `/login`.

## Routes

| Path                   | Page                                                        |
| ---------------------- | ---------------------------------------------------------- |
| `/login`               | Login form (auth disabled — any input signs you in)        |
| `/`                    | Employee home dashboard                                     |
| `/policies-assistant`  | Streaming Q&A over HR policies                              |
| `/documents`           | Drag-and-drop upload for `.pdf` / `.docx` / `.md` policies |

`/api/policies-assistant` streams an answer; `/api/documents` accepts the
uploads. Both currently return **placeholder data**.

## Structure

```
app/
  layout.tsx              root layout — fonts, <AuthProvider>
  login/                  login screen (no nav)
  (app)/                  signed-in shell (RequireAuth + TopNav)
    layout.tsx
    page.tsx              /  — dashboard
    policies-assistant/
    documents/
  api/
    policies-assistant/   POST -> streamed text, X-Policy-Source header
    documents/            POST multipart/form-data (field: "files")
components/               AuthProvider, RequireAuth, TopNav, Icon
lib/policyAnswers.ts      canned answer matching (swap for real retrieval)
```

## What's a placeholder (wire these up next)

- **Auth** — `components/AuthProvider.tsx` fakes a session in `sessionStorage`.
  Replace with a real provider (NextAuth.js, Clerk, custom session cookie) and
  move route protection into `middleware.ts`.
- **Policies Assistant** — `lib/policyAnswers.ts` + the API route stream a
  canned response. Replace with retrieval over your policy corpus + a model.
- **Documents** — the API route validates and echoes; nothing is stored. Add
  object storage, a document record per file, and indexing.
- **Dashboard data** — greeting, balances, payday, benefits, announcements and
  to-dos in `app/(app)/page.tsx` are sample constants.
- **Role-based tabs** — for v0 every tab (including the HR-admin "Documents"
  tab) shows in the employee view. Gate the tab set by role later.

## Design tokens

All colors / radii / spacing live as CSS custom properties in
`app/globals.css`; fonts are Bricolage Grotesque (display) + Figtree (body)
via `next/font`.
