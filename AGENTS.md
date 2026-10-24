<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

Guidance for Claude Code (and other coding agents) working in `frontend/` — the Next.js 16 App
Router client for BODA. See [`../README.md`](../README.md) for the product/stack overview and
quick start. This file covers the conventions you need to follow to add code that fits, not
product description.

## Commands

```bash
npm run dev      # http://localhost:3000, requires NEXT_PUBLIC_API_URL in .env.local pointing at the backend
npm run build    # production build — treat build warnings as errors, the README's bar is "zero warnings"
npm run lint      # eslint . via eslint.config.mjs (eslint-config-next core-web-vitals + typescript) — this works
npx tsc --noEmit  # strict mode is on; run this after any non-trivial change
```

No test files exist anywhere in this package (no Jest/Vitest/Playwright configured) — verify
behavior by running the dev server and exercising the actual page/flow, not by assuming coverage.

## Feature module pattern

Most product logic lives under `src/features/<name>/`, not `src/app/`. `src/app/**/page.tsx` files
should stay thin — compose feature components/hooks, don't inline data-fetching or business logic.
A feature directory is:

```
api.ts         thin axios wrapper (via src/services/api-client.ts), one function per endpoint
hooks.ts        TanStack Query hooks wrapping api.ts — this is where server state lives.
                 Query keys follow a per-feature `xKeys` factory object, e.g.
                 sellerKeys.products.list(storeId, params) -> ["seller","products","list",storeId,params].
                 Mutations toast on success/error (sonner) — keep that consistent.
schemas.ts      Zod schemas for that feature's forms (optional — only add one if the feature has
                 forms and no sibling feature's schema already covers it; e.g. address forms reuse
                 addresses/schemas.ts rather than duplicating)
components/     feature-scoped components; cross-feature UI goes in src/components/shared/ or
                 src/components/ui/ (shadcn/ui primitives), not copy-pasted into each feature
```

Not every feature has all of these — only add the pieces the feature actually needs (e.g. don't
create an empty `schemas.ts`).

## Forms

Always React Hook Form + Zod via `zodResolver`, schema co-located in the owning feature's
`schemas.ts`. **Use `z.number()` with `register("field", { valueAsNumber: true })`, not
`z.coerce.number()`** — coercion breaks the resolver's inferred TS types under this project's Zod
version (see the comment in `features/seller/schemas.ts`). For optional numeric fields that should
send `undefined` rather than `NaN`/`""`, use the project's `emptyToUndefined()` helper via
`setValueAs` rather than inventing another pattern.

## API layer & auth

`src/services/api-client.ts` is the one axios instance every request goes through — read its header
comment before touching auth. Key points:

- Tokens (access + refresh) live in the `auth-store` Zustand store, **persisted to `localStorage`**,
  not cookies. This is a deliberate, documented trade-off (separate-origin API, no easy httpOnly
  cookie path for an MVP) — don't "fix" it without understanding why, and don't assume SSR can read
  the session (it can't; see below).
- Response interceptor unwraps the backend's `{ success, data }` envelope — callers get `data`
  directly. Error responses (`{ statusCode, message, error, path, timestamp }`) are normalized into
  `ApiError` (`src/types/api.ts`).
- On a 401, exactly one silent refresh is attempted (deduped across concurrent requests via a
  module-level promise) and the original request retried once; failure triggers a hard logout +
  redirect to `/auth/login`. Don't add per-feature 401 handling — it's already centralized here.

**Role-gating is client-side only.** `/seller` and `/admin` layouts (`src/app/seller/layout.tsx`,
`src/app/admin/layout.tsx`) check `useAuthStore` after `useHasMounted()` and redirect if the role
doesn't match. `src/proxy.ts` (Next 16's renamed `middleware.ts` — see the Next-16 warning above)
has the right `matcher` for `/seller/*` and `/admin/*` but its `proxy()` function is currently a
no-op stub (see the TODO block in that file) — there is **no** server/edge-level auth check today.
If you add a new gated section, match the existing per-layout client guard pattern rather than
relying on the proxy, and note in your change if you're the one finally implementing the proxy.

`/account/*`, `/cart`, `/checkout` don't share a layout and each currently duplicates the same
`useHasMounted` + `useAuthStore` + redirect-`useEffect` block per page. If you're touching auth
guarding logic, grep for that pattern (`useHasMounted`) and update every occurrence, or better,
factor it into a shared layout/hook while you're in there.

## UI/design system

`src/components/ui/*` is shadcn/ui on Radix — use the existing primitives (button, dialog, sheet,
select, table, field, etc.) instead of hand-rolling markup. Use the `cn()` helper
(`src/lib/utils.ts`, clsx + tailwind-merge) for conditional classNames, not string concatenation.
Tailwind v4, CSS-first config in `globals.css` (no `tailwind.config.js`). Dark mode via
`next-themes` (`src/providers/theme-provider.tsx`) — support both themes on anything you build; see
the dataviz/artifact-design conventions if you're adding charts.

## Types (`src/types/*`)

Hand-written, no codegen against the backend — they drift. Several have comments noting a field was
corrected after hitting a real mismatch against the running API (e.g. `types/auth.ts`,
`types/api.ts`). When adding or trusting a type here, verify it against a real request/response
(Swagger at `/api/docs`, or an actual `curl`) rather than assuming the existing type is accurate —
past drift here has caused real bugs (see the README's "Verification" section for examples).
