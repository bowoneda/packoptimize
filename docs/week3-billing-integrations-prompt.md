# PackOptimize — Week 3: Billing, Integrations, and Demo Polish

## Context

Backend is fully functional with 63+ tests passing:
- Auth (JWT + API Key), multi-tenant RLS, CRUD endpoints
- Packing algorithm with DIM weight, carrier validation, void fill, pack instructions, compatibility rules
- POST /v1/optimize returns complete optimization results with correct cost-aware box selection
- Seed data: SwiftShip (25 items, 8 boxes) and TechDirect (15 items, 5 boxes)

Frontend dashboard is live:
- Login/Register, Dashboard overview, Item management, Box inventory
- Optimization wizard with 3D packing visualization (React Three Fiber)
- Pack instructions, cost breakdown, surcharge warnings, savings summary
- Carrier rules, API keys, Settings pages

## What We're Building This Week

1. **Stripe billing** — Real test-mode integration with subscriptions and metered usage
2. **Shopify Carrier Service webhook** — Receives cart data, returns optimized shipping rates
3. **CSV import for items** — Full implementation with column mapping and validation
4. **Batch optimization endpoint** — Process multiple orders in one request
5. **ROI analytics endpoint** — Historical savings data for the dashboard
6. **Historical optimization runs** — Generate 50+ fake runs for demo analytics
7. **Docker + deployment prep** — Dockerfile, docker-compose.prod, health checks
8. **Final demo polish** — Fix any remaining UI issues, ensure smooth demo flow

---

## Part 1: Stripe Billing (Days 1-2)

### 1A: Stripe Setup

You need a real Stripe test-mode account. The keys go in .env:

```env
STRIPE_SECRET_KEY=sk_test_... (from Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe CLI or dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_... (for frontend checkout redirect)
```

If Stripe keys are placeholder/missing, create the full module structure anyway with the real logic — it will work once real test keys are added. Use conditional checks so the app doesn't crash if Stripe is unconfigured.

### 1B: Stripe Products and Prices

Create a setup script at `scripts/stripe-setup.ts` that creates the Stripe products and prices programmatically (idempotent — check if they exist first):

```
Product: PackOptimize Subscription
  Price 1: Free Tier — $0/month (metadata: plan=FREE, included_optimizations=100)
  Price 2: Starter — $99/month (metadata: plan=STARTER, included_optimizations=2000)
  Price 3: Growth — $249/month (metadata: plan=GROWTH, included_optimizations=10000)

Billing Meter: optimization_usage
  Event name: optimization_run
  Aggregation: sum
  Value key: quantity

Metered Price (attached to each paid product):
  Starter overage: $0.04 per optimization above 2000
  Growth overage: $0.03 per optimization above 10000
```

### 1C: Billing Module (Backend)

```
src/billing/
├── billing.module.ts
├── billing.controller.ts
├── billing.service.ts
├── stripe-webhook.controller.ts
└── dto/
    ├── create-checkout.dto.ts
    └── billing-portal.dto.ts
```

#### Endpoints:

**POST /v1/billing/checkout**
- Auth: JWT (Admin only)
- Body: `{ plan: 'STARTER' | 'GROWTH' }`
- Logic:
  1. Find or create Stripe customer for tenant (store stripeCustomerId on Tenant model)
  2. Create Stripe Checkout Session with the selected plan's price
  3. Set success_url to `{FRONTEND_URL}/settings?billing=success`
  4. Set cancel_url to `{FRONTEND_URL}/settings?billing=cancelled`
  5. Return `{ checkoutUrl: session.url }`

**POST /v1/billing/portal**
- Auth: JWT (Admin only)
- Logic:
  1. Get tenant's stripeCustomerId
  2. Create Stripe Customer Portal session
  3. Return `{ portalUrl: session.url }`

**GET /v1/billing/usage**
- Auth: JWT
- Returns: `{ plan, includedOptimizations, usedOptimizations, billingPeriod, overageCount, overageCost }`

**POST /v1/billing/webhook** (Stripe webhooks)
- Auth: Stripe signature verification (NOT JWT)
- CRITICAL: This endpoint needs raw body parsing for signature verification
- Handle these events:
  - `checkout.session.completed` → Update tenant plan, store stripeCustomerId and stripeSubscriptionId
  - `customer.subscription.updated` → Update tenant plan if changed
  - `customer.subscription.deleted` → Downgrade tenant to FREE plan
  - `invoice.payment_failed` → Flag tenant (optional: send notification)

#### Usage Metering:

After each successful optimization in OptimizationService:
```typescript
// Report usage to Stripe Billing Meter
if (tenant.stripeCustomerId && tenant.plan !== 'FREE') {
  await this.stripe.billing.meterEvents.create({
    event_name: 'optimization_run',
    payload: {
      stripe_customer_id: tenant.stripeCustomerId,
      value: '1',
    },
  });
}
```

#### Plan-Based Rate Limiting:

Before running optimization, check usage:
```typescript
async checkPlanLimit(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
  const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
  const currentPeriod = format(new Date(), 'yyyy-MM');
  const usage = await this.prisma.usageRecord.aggregate({
    where: { tenantId, billingPeriod: currentPeriod, type: 'OPTIMIZATION_RUN' },
    _sum: { quantity: true },
  });
  const used = usage._sum.quantity || 0;
  const limits = { FREE: 100, STARTER: 2000, GROWTH: 10000, ENTERPRISE: Infinity };
  const limit = limits[tenant.plan];
  
  if (tenant.plan === 'FREE' && used >= limit) {
    return { allowed: false, reason: 'Free plan limit reached (100/month). Upgrade to continue.' };
  }
  // STARTER and GROWTH can exceed — overage is billed via Stripe meter
  return { allowed: true };
}
```

Only FREE plan is hard-blocked. Starter and Growth can exceed — Stripe handles overage billing.

### 1D: Billing Page (Frontend)

Add a billing section to the Settings page (or create a new /billing page):

- **Current Plan** badge (FREE / STARTER / GROWTH)
- **Usage Meter**: Progress bar showing "X of Y optimizations used this month"
  - Green if < 70%, yellow if 70-90%, red if > 90%
- **Upgrade Button**: Opens Stripe Checkout in new tab (for FREE users)
- **Manage Subscription**: Opens Stripe Customer Portal in new tab (for paid users)
- **Overage Info**: If on paid plan and exceeding included, show "Z overage optimizations at $0.04/each"

### 1E: Raw Body Configuration for Stripe Webhooks

CRITICAL: NestJS needs special configuration for Stripe webhook signature verification.

In `main.ts`, you need to configure raw body parsing ONLY for the webhook route:

```typescript
// Option 1: Use NestJS rawBody option
const app = await NestFactory.create(AppModule, {
  rawBody: true,
});

// In the webhook controller, access the raw body:
@Post('webhook')
async handleWebhook(@Req() req: RawBodyRequest<Request>) {
  const sig = req.headers['stripe-signature'];
  const event = this.stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    this.configService.get('STRIPE_WEBHOOK_SECRET'),
  );
  // ... handle event
}
```

---

## Part 2: Shopify Carrier Service Integration (Day 3)

### 2A: Shopify Webhook Endpoint

```
src/integrations/
├── integrations.module.ts
├── shopify/
│   ├── shopify.controller.ts
│   ├── shopify.service.ts
│   └── dto/
│       └── shopify-rate-request.dto.ts
```

**POST /v1/integrations/shopify/rates**
- Auth: API Key (X-API-Key header) — Shopify sends this with every request
- Content-Type: application/json

Shopify sends a payload like:
```json
{
  "rate": {
    "origin": { "country": "US", "postal_code": "90210", ... },
    "destination": { "country": "US", "postal_code": "10001", ... },
    "items": [
      {
        "name": "Widget Pro",
        "sku": "WP-001",
        "quantity": 2,
        "grams": 500,
        "price": 2999,
        "properties": {}
      }
    ],
    "currency": "USD"
  }
}
```

Logic:
1. Extract items from Shopify payload
2. Look up items by SKU in the tenant's catalog (matched via API key → tenantId)
3. For items not found by SKU, create temporary items using Shopify's grams and estimated dimensions
4. Run the optimization engine with the tenant's box types
5. Return Shopify-formatted rates:

```json
{
  "rates": [
    {
      "service_name": "Optimized Ground Shipping",
      "service_code": "packoptimize_ground",
      "total_price": 1247,
      "description": "2 boxes, 87% avg utilization",
      "currency": "USD",
      "min_delivery_date": "2026-03-05",
      "max_delivery_date": "2026-03-08"
    },
    {
      "service_name": "USPS Flat Rate (if cheaper)",
      "service_code": "packoptimize_flatrate",
      "total_price": 1020,
      "description": "USPS Small Flat Rate Box",
      "currency": "USD",
      "min_delivery_date": "2026-03-05",
      "max_delivery_date": "2026-03-08"
    }
  ]
}
```

Note: total_price is in CENTS (Shopify convention).

For the demo, this endpoint works with mock Shopify payloads — no real Shopify store or OAuth needed. The architecture proves you can handle the integration.

### 2B: Shopify Integration Page (Frontend)

Add a simple integration status page at /settings or within settings:
- Card showing "Shopify Integration"
- Status: "Not Connected" (for demo)
- Instructions: "Add your PackOptimize API key to your Shopify Carrier Service configuration"
- Show the webhook URL: `{API_URL}/v1/integrations/shopify/rates`
- Show example cURL command to test the endpoint

---

## Part 3: Batch Optimization (Day 3)

### 3A: Batch Endpoint

**POST /v1/optimize/batch**
- Auth: JWT or API Key
- Body:
```json
{
  "orders": [
    {
      "orderId": "ORD-001",
      "items": [
        { "id": "item-uuid", "quantity": 2 },
        { "id": "item-uuid-2", "quantity": 1 }
      ]
    },
    {
      "orderId": "ORD-002",
      "items": [
        { "id": "item-uuid-3", "quantity": 1 }
      ]
    }
  ],
  "carrier": "FEDEX",
  "optimizeFor": "COST",
  "fillMaterial": "AIR_PILLOWS"
}
```

- Maximum 100 orders per batch request
- Process each order sequentially (for the demo, no need for background workers)
- Return:
```json
{
  "batchId": "batch-uuid",
  "totalOrders": 2,
  "completed": 2,
  "failed": 0,
  "results": [
    {
      "orderId": "ORD-001",
      "status": "COMPLETED",
      "result": { /* full OptimizationResult */ }
    },
    {
      "orderId": "ORD-002",
      "status": "COMPLETED",
      "result": { /* full OptimizationResult */ }
    }
  ],
  "summary": {
    "totalBoxes": 3,
    "totalCost": 4.55,
    "totalSavings": 1.23,
    "averageUtilization": 0.76
  }
}
```

Each order counts as one optimization for usage metering.

---

## Part 4: Analytics Endpoint (Day 4)

### 4A: Savings Analytics

**GET /v1/analytics/savings**
- Auth: JWT
- Query params: `?period=30d` (or `7d`, `90d`, `all`)
- Returns:
```json
{
  "summary": {
    "totalOptimizations": 156,
    "totalSavings": 12400.50,
    "averageSavingsPercent": 18.7,
    "averageUtilization": 0.82,
    "totalBoxesUsed": 312,
    "periodStart": "2026-01-01",
    "periodEnd": "2026-02-28"
  },
  "timeline": [
    { "date": "2026-01-01", "optimizations": 5, "savings": 45.20, "avgUtilization": 0.79 },
    { "date": "2026-01-02", "optimizations": 8, "savings": 72.10, "avgUtilization": 0.83 },
    ...
  ],
  "topSavingsItems": [
    { "sku": "SS-YOGA-01", "name": "Yoga Mat", "timesOptimized": 23, "totalSavings": 890.50 },
    ...
  ]
}
```

### 4B: Generate Historical Demo Data

Create a seed script or extend the existing one to generate realistic historical optimization data for SwiftShip:

- **50 optimization runs** spread over the past 60 days
- Each run: randomly select 2-8 items from SwiftShip catalog with random quantities (1-5)
- Run the actual optimization engine for each (so results are real, not fake numbers)
- Save OptimizationRun, OptimizationResult, and SavingsLog entries
- This gives the dashboard real charts and analytics data

Script location: `prisma/seed-demo-history.ts`

Add a command to package.json:
```json
"seed:demo": "ts-node prisma/seed-demo-history.ts"
```

Run it after the normal seed. It should be idempotent — clear old demo runs before creating new ones (use a flag like metadata: { isDemo: true }).

---

## Part 5: Docker + Deployment Prep (Day 4)

### 5A: Backend Dockerfile (packoptimize-api/Dockerfile)

Multi-stage build:

```dockerfile
# Stage 1: Development
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# Stage 2: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
USER node
CMD ["dumb-init", "node", "dist/main.js"]
```

### 5B: docker-compose.prod.yml

Production-oriented compose file:
- **api**: Build from Dockerfile, port 3000, depends on postgres and redis
- **postgres**: PostgreSQL 17, named volume, NOT exposed to host (internal only)
- **redis**: Redis 7, NOT exposed to host
- Health checks on all services
- Environment variables from .env.production file
- Restart policy: unless-stopped

### 5C: Frontend Deployment

Add to `packoptimize-web/next.config.ts`:
```typescript
const nextConfig = {
  output: 'standalone', // For Docker deployment
  // OR leave default for Vercel deployment
};
```

Create `packoptimize-web/Dockerfile` if deploying via Docker (not Vercel):
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["node", "server.js"]
```

### 5D: GitHub Actions CI

Create `.github/workflows/ci.yml` at the project root:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: packoptimize
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: packoptimize_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    defaults:
      run:
        working-directory: packoptimize-api

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: packoptimize-api/package-lock.json
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://packoptimize:test_password@localhost:5433/packoptimize_test
      - run: npm run lint
      - run: npm run test -- --coverage --forceExit
        env:
          DATABASE_URL: postgresql://packoptimize:test_password@localhost:5433/packoptimize_test
          TEST_DATABASE_URL: postgresql://packoptimize:test_password@localhost:5433/packoptimize_test
          JWT_SECRET: test-jwt-secret
          REDIS_URL: redis://localhost:6379
      - run: npm run build

  build-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packoptimize-web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: packoptimize-web/package-lock.json
      - run: npm ci
      - run: npm run build
```

---

## Part 6: Demo Polish (Day 5)

### 6A: README.md (Project Root)

Create a comprehensive README at the project root (`packoptimize/README.md`):

```markdown
# PackOptimize — Packaging Optimization SaaS Platform

Multi-tenant SaaS platform that optimizes packaging decisions for shipping operations using 3D bin-packing algorithms. Reduces shipping costs by 15-30% through optimal box selection, DIM weight optimization, and carrier-aware surcharge avoidance.

## Architecture

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + React + shadcn/ui + Tailwind CSS
- **3D Visualization**: React Three Fiber + Three.js
- **Billing**: Stripe Subscriptions + Metered Usage
- **Auth**: JWT + API Key dual authentication
- **Multi-tenancy**: PostgreSQL Row-Level Security (RLS)

## Key Features

- 3D bin-packing algorithm with rotation, fragility, and weight constraints
- DIM weight calculation with 2025/2026 carrier rounding rules (FedEx, UPS, USPS)
- Carrier surcharge validation (Additional Handling, Oversize, girth limits)
- Cost-aware multi-box optimization (sometimes 2 small boxes beat 1 large box)
- Void fill calculation with material-specific weight/cost estimates
- Human-readable pack station instructions for warehouse workers
- Flat-rate box comparison engine
- Item compatibility rules (INCOMPATIBLE / MUST_SHIP_TOGETHER)
- Insert materials (packing slips, marketing inserts) factored into every optimization
- Shopify Carrier Service integration
- Batch optimization for high-volume operations
- ROI tracking and savings analytics
- Interactive 3D packing visualization

## Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- (Optional) Stripe CLI for webhook testing

### Setup
... (docker-compose up, migrations, seed, start commands)

## API Documentation
Swagger UI available at `http://localhost:3000/api/docs`

## Architecture Decisions
... (brief section on why NestJS, why RLS, why layer-based packing algorithm)
```

### 6B: Fix Any Remaining Issues

Run through this final checklist manually:

1. **Login flow**: Register new tenant → login → arrives at dashboard
2. **Dashboard**: KPI cards show real numbers, savings chart has data (from demo seed)
3. **Items**: Table loads, add/edit/delete work, search filters correctly
4. **Boxes**: Table shows inner + outer dims, wall thickness auto-calculates outer
5. **Optimize**: Full wizard flow works — select items → configure → run → 3D view + results
6. **3D Viewer**: Rotates, zooms, hover tooltips readable, colors correct
7. **Savings**: Shows positive savings (optimized < naive cost)
8. **Pack Instructions**: Clear numbered steps with FRAGILE warnings
9. **Carrier Rules**: All three carriers displayed with correct thresholds
10. **API Keys**: Create shows key once, table shows prefix only
11. **Swagger**: /api/docs loads with all endpoints documented
12. **Tenant Isolation**: Login as TechDirect — see different items/boxes than SwiftShip

### 6C: Error Handling Polish

Ensure all error states are handled gracefully:
- API offline → show "Cannot connect to server" message, not blank page
- Optimization with no boxes configured → show "Please add box types before optimizing"
- Empty states → show helpful messages ("No items yet. Add your first item to get started.")
- Network timeout → show retry button
- Invalid form data → field-level error messages (not just a toast)

### 6D: Loading States

Every page that fetches data should show:
- Skeleton loading components (from shadcn) while fetching
- Never a blank page while data loads
- Spinner on the optimization "Run" button while processing

---

## TESTING / VERIFICATION

After completing everything above, run these verifications:

### Backend Tests
```bash
cd packoptimize-api
npm run test -- --verbose --forceExit
```
All existing 63+ tests must still pass plus any new tests for billing/shopify/batch.

### New Tests to Add:

**Billing (billing.spec.ts or billing.e2e-spec.ts):**
1. POST /v1/billing/checkout without auth returns 401
2. POST /v1/billing/checkout with VIEWER role returns 403 (Admin only)
3. POST /v1/billing/checkout with valid admin auth returns checkoutUrl (or mock if no Stripe keys)
4. GET /v1/billing/usage returns current plan and usage count
5. Tenant on FREE plan: 101st optimization in a month returns 403 with upgrade message
6. Tenant on STARTER plan: 2001st optimization still succeeds (overage billed, not blocked)

**Shopify Integration (shopify.spec.ts):**
7. POST /v1/integrations/shopify/rates with valid API key + Shopify payload returns rates array
8. Each rate has: service_name, service_code, total_price (number in cents), currency
9. Invalid payload returns 400
10. No auth returns 401

**Batch Optimization (batch.spec.ts):**
11. POST /v1/optimize/batch with 3 orders returns results for all 3
12. Each order result has a full OptimizationResult
13. Summary has correct totalBoxes, totalCost, totalSavings
14. Empty orders array returns 400
15. More than 100 orders returns 400 with limit message

**Analytics (analytics.spec.ts):**
16. GET /v1/analytics/savings returns summary with totalOptimizations > 0 (after demo seed)
17. GET /v1/analytics/savings?period=7d returns filtered results
18. Timeline array has date entries with optimizations and savings

### Docker Verification
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
# Wait for health checks
sleep 10
curl http://localhost:3000/health
# Should return { status: 'ok', services: { database: 'connected', redis: 'connected' } }
docker-compose -f docker-compose.prod.yml down
```

### Manual E2E Demo Flow
Run through the entire demo as if presenting to the client:
1. Open browser to frontend
2. Login as SwiftShip admin
3. Show dashboard with savings chart and KPIs
4. Browse items (25 products), show CSV import works
5. Browse boxes (8 types with inner/outer dims)
6. Run optimization with 5-6 mixed items (include a fragile item)
7. Show 3D visualization — rotate, zoom, hover
8. Show pack instructions with FRAGILE warning
9. Show cost breakdown with DIM weight comparison
10. Show savings summary
11. Show carrier rules page
12. Show API keys management
13. Show Swagger docs at /api/docs
14. Switch to TechDirect — show tenant isolation (different items)

This demo flow should take 3-5 minutes and hit every feature the client listing asked for.
