# PackOptimize — Day 1 Claude Code Prompt

## Copy everything below this line into Claude Code:

---

## Project: PackOptimize — Multi-Tenant Packaging Optimization SaaS

Build the NestJS backend foundation for a packaging optimization platform. This is Day 1 — project scaffolding, database, authentication, and tenant isolation.

### Tech Stack
- **Backend**: NestJS with TypeScript (strict mode)
- **ORM**: Prisma with PostgreSQL
- **Auth**: JWT (passport-jwt) + API Key (hash-only pattern)
- **Tenant Isolation**: PostgreSQL Row-Level Security (RLS) via nestjs-cls (AsyncLocalStorage)
- **Validation**: class-validator + class-transformer
- **Docs**: @nestjs/swagger (OpenAPI 3.0)
- **Logging**: nestjs-pino (structured JSON)
- **Rate Limiting**: @nestjs/throttler

### Step 1: Initialize NestJS Project

```bash
nest new packoptimize-api --package-manager npm --strict
cd packoptimize-api
```

Install all required dependencies:

```bash
# Core
npm install @prisma/client @nestjs/config class-validator class-transformer

# Auth
npm install @nestjs/passport @nestjs/jwt passport passport-jwt passport-headerapikey bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Tenant isolation
npm install nestjs-cls

# API docs
npm install @nestjs/swagger

# Logging
npm install nestjs-pino pino-http pino-pretty

# Rate limiting
npm install @nestjs/throttler

# Stripe (for later, install now)
npm install stripe @golevelup/nestjs-stripe

# Redis (for rate limiting backing + later caching)
npm install ioredis @nestjs-modules/ioredis

# Dev tools
npm install -D prisma @types/passport-jwt
npx prisma init
```

### Step 2: Docker Compose

Create `docker-compose.yml` in the project root with:

- **postgres-dev**: PostgreSQL 17, port 5432, database `packoptimize_dev`, user `packoptimize`, password `packoptimize_dev_pw`
- **postgres-test**: PostgreSQL 17, port 5433, database `packoptimize_test`, user `packoptimize`, password `packoptimize_test_pw`
- **redis**: Redis 7, port 6379

Use named volumes for data persistence. Add health checks on all services.

CRITICAL: Development and test databases MUST be separate containers on different ports. The test database is wiped between test runs. Never share a database between dev and test.

Create a `.env` file:
```
DATABASE_URL="postgresql://packoptimize:packoptimize_dev_pw@localhost:5432/packoptimize_dev?schema=public"
TEST_DATABASE_URL="postgresql://packoptimize:packoptimize_test_pw@localhost:5433/packoptimize_test?schema=public"
JWT_SECRET="packoptimize-dev-jwt-secret-change-in-production"
JWT_EXPIRATION="24h"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
PORT=3000
```

Create `.env.example` with the same keys but placeholder values.

### Step 3: Prisma Schema

Create the full Prisma schema at `prisma/schema.prisma`. Use UUID for all IDs (`@default(uuid())`). Every tenant-scoped model has a `tenantId` field with an `@@index([tenantId])`.

**Models to create:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Plan {
  FREE
  STARTER
  GROWTH
  ENTERPRISE
}

enum Role {
  ADMIN
  OPERATOR
  VIEWER
}

enum OptimizationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum CompatibilityRule {
  INCOMPATIBLE
  MUST_SHIP_TOGETHER
}

enum PackagingCategory {
  BOX
  POLY_MAILER
  PADDED_ENVELOPE
  TUBE
  CUSTOM
}

enum Carrier {
  FEDEX
  UPS
  USPS
}

enum UsageType {
  OPTIMIZATION_RUN
  API_CALL
}

model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  settings  Json     @default("{}")
  isActive  Boolean  @default(true)
  stripeCustomerId String? @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users              User[]
  items              Item[]
  boxTypes           BoxType[]
  packagingTypes     PackagingType[]
  itemCompatibilities ItemCompatibility[]
  insertMaterials    InsertMaterial[]
  optimizationRuns   OptimizationRun[]
  apiKeys            ApiKey[]
  usageRecords       UsageRecord[]
  savingsLogs        SavingsLog[]
}

model User {
  id           String   @id @default(uuid())
  tenantId     String
  email        String
  passwordHash String
  role         Role     @default(OPERATOR)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant           Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  apiKeys          ApiKey[]
  optimizationRuns OptimizationRun[]

  @@unique([tenantId, email])
  @@index([tenantId])
}

model Item {
  id             String  @id @default(uuid())
  tenantId       String
  sku            String
  name           String
  width          Float   // mm
  height         Float   // mm
  depth          Float   // mm
  weight         Float   // grams
  isFragile      Boolean @default(false)
  canRotate      Boolean @default(true)
  maxStackWeight Float?  // grams - max weight this item can support on top
  metadata       Json    @default("{}")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, sku])
  @@index([tenantId])
}

model BoxType {
  id            String  @id @default(uuid())
  tenantId      String
  name          String
  // Inner dimensions (items must fit within these)
  innerWidth    Float   // mm
  innerHeight   Float   // mm
  innerDepth    Float   // mm
  // Outer dimensions (carriers measure these)
  outerWidth    Float   // mm
  outerHeight   Float   // mm
  outerDepth    Float   // mm
  wallThickness Float   // mm
  boxWeight     Float   // grams (weight of empty box)
  maxWeight     Float   // grams (max total content weight)
  cost          Float   // USD (material cost of box)
  isActive      Boolean @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant             Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  optimizationResults OptimizationResult[]

  @@index([tenantId])
}

model PackagingType {
  id          String           @id @default(uuid())
  tenantId    String
  name        String
  category    PackagingCategory
  maxWidth    Float?   // mm
  maxHeight   Float?   // mm
  maxDepth    Float?   // mm
  maxWeight   Float?   // grams
  cost        Float    // USD
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model ItemCompatibility {
  id       String            @id @default(uuid())
  tenantId String
  itemIdA  String
  itemIdB  String
  rule     CompatibilityRule
  createdAt DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, itemIdA, itemIdB])
  @@index([tenantId])
}

model InsertMaterial {
  id            String  @id @default(uuid())
  tenantId      String
  name          String
  width         Float   // mm
  height        Float   // mm
  depth         Float   // mm
  weight        Float   // grams
  alwaysInclude Boolean @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model OptimizationRun {
  id          String             @id @default(uuid())
  tenantId    String
  userId      String?
  status      OptimizationStatus @default(PENDING)
  algorithm   String             @default("EB-AFIT")
  parameters  Json               @default("{}")
  duration    Int?               // milliseconds
  errorMsg    String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime           @default(now())

  tenant  Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user    User?               @relation(fields: [userId], references: [id])
  results OptimizationResult[]
  savings SavingsLog?

  @@index([tenantId])
  @@index([tenantId, status])
}

model OptimizationResult {
  id              String @id @default(uuid())
  optimizationRunId String
  boxTypeId       String?
  boxIndex        Int    // 1st box, 2nd box, etc.
  utilization     Float  // 0-1
  placements      Json   // Array of { itemId, x, y, z, rotation }
  voidFillVolume  Float? // cubic mm
  totalWeight     Float? // grams (items + box + fill)
  dimWeight       Float? // grams
  billableWeight  Float? // grams
  surcharges      Json   @default("[]") // Array of { type, amount, reason }
  packInstructions Json  @default("[]") // Array of instruction strings
  createdAt       DateTime @default(now())

  optimizationRun OptimizationRun @relation(fields: [optimizationRunId], references: [id], onDelete: Cascade)
  boxType         BoxType?        @relation(fields: [boxTypeId], references: [id])
}

model ApiKey {
  id          String    @id @default(uuid())
  tenantId    String
  userId      String
  keyHash     String    @unique  // SHA-256 hash only
  keyPrefix   String    // First 12 chars for identification
  permissions String[]  @default(["optimize", "items:read", "boxes:read"])
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([keyHash])
}

model UsageRecord {
  id            String    @id @default(uuid())
  tenantId      String
  type          UsageType
  quantity      Int       @default(1)
  billingPeriod String    // "2026-02"
  metadata      Json      @default("{}")
  createdAt     DateTime  @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, billingPeriod])
}

model SavingsLog {
  id              String @id @default(uuid())
  tenantId        String
  optimizationRunId String @unique
  naiveBoxCost    Float  // What a simple "smallest box that fits" would cost
  optimizedCost   Float  // What our algorithm recommends
  savingsAmount   Float  // naiveBoxCost - optimizedCost
  createdAt       DateTime @default(now())

  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  optimizationRun OptimizationRun @relation(fields: [optimizationRunId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model CarrierConstraint {
  id                String   @id @default(uuid())
  carrier           Carrier
  maxLengthInches   Float
  maxGirthInches    Float    // Length + 2*(Width + Height)
  maxWeightLbs      Float
  dimDivisor        Int
  ahsCubicThreshold Float?   // Additional Handling Surcharge cubic inch threshold
  oversizeCubicThreshold Float? // Oversize cubic inch threshold
  ahsLengthThreshold Float?  // AHS longest side threshold (inches)
  ahsWidthThreshold  Float?  // AHS second-longest side threshold (inches)
  ahsMinBillableWeight Float? // Minimum billable weight when AHS triggers (lbs)
  surchargeRates    Json     @default("{}") // { ahs: amount, oversize: amount }
  effectiveDate     DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([carrier, effectiveDate])
  @@index([carrier])
}
```

Run the migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Create RLS Migration

Create a custom SQL migration at `prisma/migrations/YYYYMMDD_rls_policies/migration.sql`:

```sql
-- Create a function to get current tenant ID from session variable
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS TEXT AS $$
  SELECT current_setting('app.tenant_id', true);
$$ LANGUAGE sql STABLE;

-- Apply RLS policies to all tenant-scoped tables
-- Pattern: USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id())

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_user ON "User" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_item ON "Item" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "BoxType" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_boxtype ON "BoxType" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "PackagingType" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_packagingtype ON "PackagingType" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "ItemCompatibility" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_itemcompat ON "ItemCompatibility" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "InsertMaterial" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_insertmaterial ON "InsertMaterial" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "OptimizationRun" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_optrun ON "OptimizationRun" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_apikey ON "ApiKey" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_usage ON "UsageRecord" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "SavingsLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_savings ON "SavingsLog" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

-- IMPORTANT: Create a non-superuser role for the application
-- Superusers bypass RLS, so the app must connect as a regular user
-- This is handled at the connection level via DATABASE_URL credentials
```

IMPORTANT: The database user in DATABASE_URL must NOT be a superuser, as PostgreSQL superusers bypass RLS. Make sure the `packoptimize` user created by Docker is a regular user, not a superuser.

### Step 5: NestJS Module Structure

Create the following module structure:

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts        // @Roles('ADMIN', 'OPERATOR')
│   │   ├── current-user.decorator.ts // @CurrentUser() extracts user from request
│   │   └── current-tenant.decorator.ts // @CurrentTenant() extracts tenantId from CLS
│   ├── guards/
│   │   ├── combined-auth.guard.ts    // Accepts JWT OR API Key
│   │   ├── roles.guard.ts           // Checks user role against @Roles()
│   │   └── tenant.guard.ts          // Extracts tenantId, stores in CLS
│   ├── interceptors/
│   │   └── tenant-context.interceptor.ts  // Sets Prisma tenant context
│   ├── filters/
│   │   └── http-exception.filter.ts  // Consistent error format { statusCode, message, error }
│   └── pipes/
│       └── validation.pipe.ts        // Global validation with class-validator
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts            // Extended with tenant context via CLS
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts           // POST /auth/register, POST /auth/login
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── api-key.strategy.ts
│   └── dto/
│       ├── register.dto.ts          // { email, password, tenantName, tenantSlug }
│       └── login.dto.ts             // { email, password, tenantSlug }
├── tenants/
│   ├── tenants.module.ts
│   ├── tenants.controller.ts
│   └── tenants.service.ts
├── items/
│   ├── items.module.ts
│   ├── items.controller.ts          // Full CRUD + CSV import
│   ├── items.service.ts
│   └── dto/
│       ├── create-item.dto.ts
│       └── update-item.dto.ts
├── box-types/
│   ├── box-types.module.ts
│   ├── box-types.controller.ts
│   ├── box-types.service.ts
│   └── dto/
│       ├── create-box-type.dto.ts
│       └── update-box-type.dto.ts
├── api-keys/
│   ├── api-keys.module.ts
│   ├── api-keys.controller.ts
│   ├── api-keys.service.ts
│   └── dto/
│       └── create-api-key.dto.ts
└── carrier-rules/
    ├── carrier-rules.module.ts
    ├── carrier-rules.controller.ts
    └── carrier-rules.service.ts
```

### Step 6: Prisma Service with Tenant Context

The PrismaService must use nestjs-cls to automatically set the tenant context on every query. This is the critical architectural piece.

```typescript
// prisma.service.ts pattern:
// 1. Inject ClsService
// 2. Use Prisma client extension ($extends)
// 3. In the extension's $allOperations hook:
//    a. Get tenantId from cls.get('TENANT_ID')
//    b. If tenantId exists, wrap query in transaction:
//       - SET app.tenant_id = tenantId (via SET LOCAL for transaction scope)
//       - Execute the original query
//    c. If no tenantId (e.g., during auth), execute query normally
```

### Step 7: Authentication Flow

**JWT Strategy:**
- Extract JWT from Authorization: Bearer <token> header
- Validate token signature with JWT_SECRET
- Decode payload: { sub: userId, email, tenantId, role }
- Attach user object to request

**API Key Strategy:**
- Extract key from X-API-Key header
- Hash the provided key with SHA-256
- Look up keyHash in ApiKey table (bypass RLS for this lookup — use a separate Prisma client without tenant extension)
- Check expiration
- Update lastUsedAt
- Attach user object with tenantId and permissions to request

**CombinedAuthGuard:**
- Tries JWT first, falls back to API Key
- If both fail, return 401

**Registration flow:**
- POST /auth/register: Create Tenant + Admin User in a transaction
- Hash password with bcrypt (10 rounds)
- Return JWT token

**Login flow:**
- POST /auth/login: Find user by email + tenantSlug
- Verify password with bcrypt.compare
- Update lastLoginAt
- Return JWT token

### Step 8: Tenant Guard with CLS

```typescript
// TenantGuard (runs after AuthGuard):
// 1. Get user from request (attached by AuthGuard)
// 2. Extract tenantId from user
// 3. Store tenantId in CLS: cls.set('TENANT_ID', tenantId)
// 4. All subsequent Prisma queries in this request will use this tenantId via RLS
```

Apply guards globally in this order: CombinedAuthGuard → TenantGuard → RolesGuard

For public routes (register, login, health), use @Public() decorator to skip auth.

### Step 9: Global Configuration

In main.ts:
- Enable CORS
- Use global ValidationPipe with { whitelist: true, forbidNonWhitelisted: true, transform: true }
- Use global HttpExceptionFilter for consistent error responses
- Set up Swagger at /api/docs with title "PackOptimize API", version "1.0"
- Enable raw body for Stripe webhook route (future)
- Use nestjs-pino LoggerModule

### Step 10: Seed Script

Create `prisma/seed.ts` that runs idempotently (uses upsert, not create):

**Tenant 1: SwiftShip Logistics**
- Admin: admin@swiftship.com / password123
- Operator: ops@swiftship.com / password123  
- Viewer: viewer@swiftship.com / password123

**Tenant 2: TechDirect**
- Admin: admin@techdirect.com / password123
- Operator: ops@techdirect.com / password123
- Viewer: viewer@techdirect.com / password123

**Carrier Constraints (system-level, no tenantId):**
- FedEx: maxLength 108in, maxGirth 165in, maxWeight 150lbs, dimDivisor 139, AHS cubic >10368, oversize >17280, AHS length >48in, AHS width >30in, AHS min billable 40lbs
- UPS: maxLength 108in, maxGirth 165in, maxWeight 150lbs, dimDivisor 139, AHS cubic >10368, oversize >17280
- USPS: maxLength 108in (L+G combined), maxGirth 108in, maxWeight 70lbs, dimDivisor 166, no AHS cubic

Don't add items or boxes to tenants yet — that comes later with the demo seed data.

Add to package.json:
```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

### Step 11: Health Check Endpoint

GET /health returns:
```json
{
  "status": "ok",
  "timestamp": "2026-02-26T12:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### IMPORTANT RULES FOR THIS BUILD:

1. Use strict TypeScript — no `any` types, no ts-ignore comments
2. Every DTO must have Swagger decorators (@ApiProperty) with examples
3. Every controller method must have Swagger decorators (@ApiOperation, @ApiResponse)
4. All errors return consistent format: `{ statusCode: number, message: string, error: string }`
5. No console.log — use NestJS Logger (which routes through Pino)
6. All passwords hashed with bcrypt, all API keys stored as SHA-256 hash only
7. .env is in .gitignore, .env.example is committed
8. The Prisma client that handles API key lookups must bypass RLS (separate client instance without the tenant extension)

### After completing all steps, run these verification commands:

```bash
docker-compose up -d
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
# In another terminal:
curl http://localhost:3000/health
curl http://localhost:3000/api/docs-json | head -20
```

All three curl commands should return valid responses.
