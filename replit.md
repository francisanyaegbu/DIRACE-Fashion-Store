# DIRACE Fashion Store

DIRACE is a premium monochrome fashion storefront ready to connect to Supabase for catalog, customer, order, and admin data.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Backend: Supabase will provide authentication, database, storage, and admin data
- Validation: Zod (`zod/v4`) for the shared API scaffold
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/dirace-store/src/App.tsx` — storefront routes, local UI state, and Supabase-ready connection states
- `artifacts/dirace-store/src/index.css` — DIRACE monochrome theme and responsive styling
- `artifacts/dirace-store/public/` — campaign imagery used by the editorial storefront
- `lib/api-spec/openapi.yaml` — retained health API scaffold only; product and account data are not implemented here

## Architecture decisions

- Product, account, order, and admin records are intentionally not mocked in the frontend.
- Supabase is the planned source of truth for authentication, catalog, wishlist, checkout, and inventory.
- The storefront currently renders explicit empty/connection states where live data will be inserted.

## Product

The storefront includes editorial brand pages, product discovery routes, cart and wishlist shells, checkout UI, account UI, contact/newsletter presentation, and an admin dashboard shell. Live records and authentication are intentionally deferred to Supabase.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
