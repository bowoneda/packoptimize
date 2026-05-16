# PackOptimize — Claude Code Reference

## Project structure

```
packoptimize-api/   NestJS backend (port 3000)
packoptimize-web/   Next.js 16 frontend (port 3001)
load-tests/         k6 load test scripts
docs/               Specs and runbooks
  runbooks/         backup-restore.md, rollback.md, staging-setup.md
```

## Dev commands

```bash
# Backend
cd packoptimize-api
npm run start:dev       # watch mode
npm run test            # unit + E2E tests (jest)
npm run lint            # ESLint (must stay 0 errors)
npx prisma studio       # DB browser at localhost:5555
npm run seed            # seed tenants, users, items, boxes
npm run seed:demo       # add 50 demo optimization runs (swiftship)

# Frontend
cd packoptimize-web
npm run dev             # Next.js dev on port 3001
npm test                # Vitest unit tests (24 tests)
npm run test:e2e        # Playwright E2E (requires API running)
```

## Test credentials

| Tenant | Email | Password | Slug |
|---|---|---|---|
| SwiftShip Logistics | admin@swiftship.com | password123 | swiftship |
| TechDirect | admin@techdirect.com | password123 | techdirect |

## Architecture decisions

**Auth**: JWT stored as httpOnly cookie `access_token` (set on login/register, cleared on logout). `jwt.strategy.ts` reads from cookie OR `Authorization: Bearer` header — Bearer supports API key flows, cookie supports web UI.

**Multi-tenancy**: All queries run inside `withTenantContext(tenantId)` which sets a Postgres `SET app.tenant_id` variable used by RLS policies. Cross-tenant access returns 404.

**API proxy**: Frontend calls `/api/proxy/:path*` → Next.js rewrites to `API_URL` (env var, defaults to `http://localhost:3000`). Never call the API directly from client components.

**Billing**: FREE plan hard-blocked at 100 optimizations/month. `billing.service.ts` checks count before each optimization. Stripe meter reports usage after optimization (fire-and-forget, errors don't fail the request).

**3D viewer**: `dynamic(() => import(...), { ssr: false })` required for all React Three Fiber components.

## Key files

| File | Purpose |
|---|---|
| `packoptimize-api/src/optimization/engine/` | Core bin-packing algorithm (63 unit tests) |
| `packoptimize-api/src/billing/billing.service.ts` | Stripe checkout, portal, usage metering |
| `packoptimize-api/src/auth/auth.controller.ts` | Login/register/logout, sets httpOnly cookie |
| `packoptimize-api/src/common/guards/combined-auth.guard.ts` | JWT cookie + API key guard |
| `packoptimize-api/src/security/__tests__/security.e2e.spec.ts` | 13 tenant isolation + auth tests |
| `packoptimize-web/src/lib/api.ts` | Axios instance (baseURL: /api/proxy, withCredentials: true) |
| `packoptimize-web/src/stores/auth-store.ts` | Zustand auth store (no token, cookie is httpOnly) |
| `packoptimize-web/src/types/api.ts` | All API request/response types |
| `packoptimize-web/e2e/` | Playwright E2E specs (auth, dashboard, optimize) |
| `load-tests/optimize.js` | k6 load test for /v1/optimize |

## Deployment

| Environment | API | Web |
|---|---|---|
| Production | packoptimize-api.fly.dev | packoptimize-web.fly.dev |
| Staging | packoptimize-api-staging.fly.dev | packoptimize-web-staging.fly.dev |

Deploy: `flyctl deploy` from within the app directory (requires `flyctl` in PATH).
Staging: push to `staging` branch → GitHub Actions deploys automatically.

## Known gotchas

- **Prisma 7**: `PrismaClient` requires `adapter: new PrismaPg({ connectionString })`. No `datasources` or `datasourceUrl` options.
- **TS import**: Use `import cookieParser from 'cookie-parser'` (not `import * as`). Use `import type` for types in decorated function signatures.
- **Turbopack on Windows**: If it panics, delete `.next/` and restart.
- **Port order**: Start backend first (port 3000), then frontend (port 3001). Frontend can grab 3000 before backend on Windows.
- **Zod v4**: `.issues` not `.errors` on ZodError. `z.coerce.number()` types as `unknown` — cast resolver: `zodResolver(schema) as Resolver<FormValues>`.
- **Prisma db push**: Use `db push` not `migrate dev` — DB was created with push and migrate dev sees schema drift.
- **Playwright E2E**: Needs live API + web server. `playwright.config.ts` auto-starts Next.js via `webServer`. Set `API_URL=http://localhost:3000` if API is not on default port.

## Design system

Icons: `@phosphor-icons/react` (NOT lucide-react)  
Colors: Pine green `#0B4228` (primary), Neon green `#91E440` (accent)  
Cards: `rounded-2xl sm:rounded-3xl`  
Buttons: `rounded-full`, `min-h-[44px]`  
Font: Inter via `--font-inter`

See `LESSONS.md` for non-obvious cross-session technical lessons.
