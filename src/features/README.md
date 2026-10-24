# features/

This directory holds feature-scoped code, organized by domain rather than by
file type. It's intentionally empty in this bootstrap pass — the app shell
and shared infrastructure (layout, providers, stores, services, ui
primitives) come first; feature passes fill this directory in afterward.

## Convention

Each subdirectory is a self-contained feature/domain, e.g.:

```
features/
├── auth/
│   ├── components/       # LoginForm, RegisterForm, ...
│   ├── hooks/             # useLogin, useRegister, useCurrentUser (React Query)
│   ├── schemas.ts         # re-exports or extends lib/validators/auth.ts if needed
│   └── types.ts           # feature-local types not shared elsewhere
├── stores/                # store discovery/listing/detail
├── products/               # product listing/detail
├── cart/                   # cart drawer, cart page, cart store/hooks
├── orders/                 # order history, order detail, order tracking
├── seller/                 # seller dashboard, product/order management
└── admin/                  # admin console
```

Rules of thumb:

- Routes in `app/` stay thin — they import from `features/*` and compose
  layout, not business logic.
- Cross-feature primitives (Header, Footer, ThemeToggle, generic UI) stay in
  the top-level `components/`, not inside a feature folder.
- Anything reusable across 2+ features (zod schemas, formatting helpers,
  generic hooks) belongs in `lib/`, `hooks/`, or `types/` at the src root,
  not duplicated per-feature.
- API calls go through `services/`; a feature's `hooks/` wrap those calls
  with React Query (`useQuery`/`useMutation`), they don't call `apiClient`
  directly from components.
