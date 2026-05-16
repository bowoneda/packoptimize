## LESSONS.md

---

### 2026-05-16 — Prisma 7 Runtime Client Requires Adapter, Not datasourceUrl
**Context:** Deploying NestJS backend to Railway/Fly.io with Prisma 7.
**What happened:** `PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions` — app crashed on every deploy.
**Root cause:** Prisma 7 completely removed `datasources` and `datasourceUrl` from `PrismaClientOptions`. The only connection mechanism is `adapter: SqlDriverAdapterFactory`.
**Fix/Pattern:** In both PrismaService constructors use `@prisma/adapter-pg`:
```typescript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
super({ adapter })
```
Use `process.env.DATABASE_URL` directly — do NOT inject ConfigService (PrismaModule doesn't import ConfigModule). `prisma.config.js` is CLI-only; it does NOT feed the runtime client.
**Watch for:** Any Prisma 7 upgrade or new PrismaService instance. The adapter must always be explicitly passed.
**Affected files/systems:** `packoptimize-api/src/prisma/prisma.service.ts`, `prisma.service-without-tenant.ts`

---

### 2026-05-16 — Redis lazyConnect is Mandatory for NestJS Bootstrap
**Context:** NestJS app deployed to Railway with `@nestjs-modules/ioredis`.
**What happened:** App never reached `app.listen()` — health check timed out silently. No crash, no error.
**Root cause:** `@nestjs-modules/ioredis` blocks NestJS bootstrap while waiting for Redis connection. Without `lazyConnect: true`, the module hangs indefinitely if Redis isn't immediately reachable at startup.
**Fix/Pattern:** Always add `options: { lazyConnect: true }` to the RedisModule config. Redis connections will be established on first use, not at bootstrap.
**Watch for:** Any new Redis-backed module or service added to the app.
**Affected files/systems:** `packoptimize-api/src/app.module.ts` (RedisModule config)

---

### 2026-05-16 — Fly.io prisma db push Must Be release_command, Not Dockerfile CMD
**Context:** Running `prisma db push` as part of app startup on Fly.io.
**What happened:** App hangs during first startup — health check times out before app starts listening.
**Root cause:** Running `prisma db push` in the Dockerfile CMD means the ephemeral startup machine runs it, then the app starts — but Fly health checks time out waiting. `release_command` in fly.toml runs it as a separate step before machines update.
**Fix/Pattern:** Set `release_command = "npx prisma db push"` in `fly.toml`. Never put it in the Dockerfile CMD. Also: `prisma db push --skip-generate` does NOT exist in Prisma 7.
**Watch for:** Any schema changes requiring migration on Fly.io.
**Affected files/systems:** `packoptimize-api/fly.toml`, `packoptimize-api/Dockerfile`

---

### 2026-05-16 — NestJS at 256MB OOMs on Fly.io; Needs 512MB Minimum
**Context:** Deploying NestJS with Swagger, Prisma, and all app modules to Fly.io shared-cpu-1x.
**What happened:** App starts, health check passes once, then `Out of memory: Killed process`.
**Root cause:** NestJS + Swagger + Prisma adapter + all modules together need more than 256MB at runtime.
**Fix/Pattern:** Set `memory = "512mb"` in the `[[vm]]` section of `packoptimize-api/fly.toml`.
**Watch for:** Any increase in module count or large library additions to the API.
**Affected files/systems:** `packoptimize-api/fly.toml`

---

### 2026-05-16 — Dockerfile Required Over Nixpacks for Node Version Guarantee
**Context:** Railway/Fly.io deployment of NestJS backend.
**What happened:** Nixpacks defaulted to Node 18; Prisma 7 requires Node 20+. Silent runtime failures.
**Fix/Pattern:** Always use a Dockerfile with `FROM node:22-alpine` for the API. Do NOT rely on Nixpacks for the backend. Do NOT use `npm prune --production` — it strips modules NestJS needs at runtime.
**Watch for:** Any new deployment target or CI environment.
**Affected files/systems:** `packoptimize-api/Dockerfile`

---

### 2026-05-16 — Web .dockerignore is Critical for Deploy Speed
**Context:** Deploying packoptimize-web to Fly.io.
**What happened:** Deploys took 15+ minutes — `node_modules` (70MB+) was being uploaded as build context.
**Fix/Pattern:** Always add `.dockerignore` to the web app root with `node_modules`, `.next`, `.git`. Without it, every deploy uploads the full dependency tree.
**Affected files/systems:** `packoptimize-web/.dockerignore`

---

### 2026-05-16 — Audit Finding: JWT in localStorage is XSS-Vulnerable
**Context:** Full engineering audit of the production app.
**What happened:** Auth tokens are stored in `localStorage` and read by JavaScript on every request.
**Root cause:** Any successful XSS attack on any page can read `localStorage` and steal the JWT.
**Fix/Pattern:** Migrate to httpOnly cookies. API sets `Set-Cookie` on login; frontend sends cookies automatically. JavaScript cannot read httpOnly cookies — XSS cannot steal them.
**Watch for:** Any new auth flow or third-party script added to the frontend.
**Affected files/systems:** `packoptimize-web/src/stores/auth-store.ts`, `src/lib/api.ts`, `packoptimize-api/src/auth/auth.controller.ts`

---

### 2026-05-16 — Audit Finding: Unbounded findMany on List Endpoints
**Context:** Full engineering audit — reviewing Prisma queries.
**What happened:** `items.service.ts:findAll()` and `box-types.service.ts` fetch ALL records for a tenant with no `take`/`skip`. At scale, this means megabyte responses and potential OOM.
**Fix/Pattern:** Always add `take: N` default to `findMany` on list endpoints. Add cursor-based pagination when lists can grow unboundedly.
**Watch for:** Any new `findMany` without a `take` clause.
**Affected files/systems:** `packoptimize-api/src/items/items.service.ts`, `src/box-types/box-types.service.ts`, `src/analytics/analytics.service.ts`

---

### 2026-05-16 — Zod v4 Breaking Changes from v3
**Context:** Using Zod for frontend form validation with react-hook-form.
**What happened:** `z.coerce.number()` types input as `unknown` (not `number`). `.errors` renamed to `.issues` on ZodError.
**Fix/Pattern:**
- Cast resolver: `zodResolver(schema) as Resolver<FormValues>`
- Or use: `z.union([z.string(), z.number()]).transform(Number).pipe(z.number())`
- Use `.issues` not `.errors` on ZodError
**Watch for:** Any Zod schema using `coerce` or catching ZodError.
**Affected files/systems:** All frontend forms using Zod + react-hook-form

---

### 2026-05-16 — Recharts v3 Tooltip Formatter Typing
**Context:** Using Recharts v3 for analytics charts.
**What happened:** Tooltip `formatter` value param typed as `number | undefined` — causes type errors when doing arithmetic.
**Fix/Pattern:** Wrap value in `Number(value)` before arithmetic in tooltip formatters.
**Affected files/systems:** `packoptimize-web/src/app/(dashboard)/analytics/page.tsx`

---

### 2026-05-16 — Turbopack Windows Panic After Config Changes
**Context:** Running Next.js 16 dev server with Turbopack on Windows 11.
**What happened:** Dev server panics with "creating new process" error after config file changes.
**Fix/Pattern:** Delete `.next/` directory and restart the dev server.
**Watch for:** Any change to `next.config.ts` or significant file structure changes.
**Affected files/systems:** `packoptimize-web/.next/` (cache)

---

### 2026-05-16 — NestJS E2E Tests With httpOnly Cookie Auth
**Context:** Migrated JWT from localStorage to httpOnly cookies. E2E tests broke because they read `res.body.accessToken`.
**What happened:** `optimization.e2e.spec.ts` used `loginRes.body.accessToken` to get a Bearer token; after migration, the token is set as a `Set-Cookie` header and not in the body at all. All 12 tests failed with 401.
**Fix/Pattern:** Three changes needed:
1. Import `cookie-parser` with `require()` (not `import * as`) in the test file — ts-jest resolves it differently
2. Call `app.use(cookieParser())` on the test app (main.ts middleware is not applied in tests)
3. Extract the cookie: `arr.map(c => c.split(";")[0]).join("; ")` — strip `Path=/; HttpOnly` before sending as a request `Cookie` header
```typescript
const rawCookies = res.headers["set-cookie"] as string[] | string | undefined;
const arr = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
cookie = arr.map(c => c.split(";")[0]).join("; ");
// then: .set("Cookie", cookie)
```
**Watch for:** Any NestJS E2E test that authenticates via login endpoint after the cookie migration.
**Affected files/systems:** `optimization.e2e.spec.ts`, `security.e2e.spec.ts`
