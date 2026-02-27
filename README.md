# PackOptimize — Packaging Optimization SaaS Platform

Multi-tenant SaaS platform that optimizes packaging decisions for shipping operations using 3D bin-packing algorithms. Reduces shipping costs by 15-30% through optimal box selection, DIM weight optimization, and carrier-aware surcharge avoidance.

## Architecture

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 16 + React + shadcn/ui + Tailwind CSS
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
- Stripe billing with usage metering and overage pricing

## Quick Start

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- (Optional) Stripe CLI for webhook testing

### Setup

```bash
# 1. Start databases
cd packoptimize-api
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env  # Edit with your values

# 4. Push schema & seed
npx prisma db push
npx prisma db seed
npm run seed:demo      # Generate 50 demo optimization runs

# 5. (Optional) Set up Stripe test products
npm run stripe:setup

# 6. Start backend
npm run start:dev      # http://localhost:3000

# 7. Start frontend (new terminal)
cd ../packoptimize-web
npm install
npm run dev            # http://localhost:3001
```

### Test Credentials

| Tenant | Email | Password | Slug |
|--------|-------|----------|------|
| SwiftShip Logistics | admin@swiftship.com | password123 | swiftship |
| TechDirect | admin@techdirect.com | password123 | techdirect |

## API Documentation

Swagger UI available at `http://localhost:3000/api/docs`

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | JWT authentication |
| POST | /v1/optimize | Run packing optimization |
| POST | /v1/optimize/batch | Batch optimize multiple orders |
| GET | /v1/analytics/savings | Savings analytics with timeline |
| POST | /v1/billing/checkout | Create Stripe checkout session |
| GET | /v1/billing/usage | Current billing period usage |
| POST | /v1/integrations/shopify/rates | Shopify carrier service webhook |

## Production Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma db push

# Health check
curl http://localhost:3000/health
```

## Architecture Decisions

- **NestJS** — Enterprise-grade framework with dependency injection, guards, and decorators for clean multi-tenant architecture
- **Row-Level Security** — PostgreSQL RLS ensures tenant data isolation at the database level, not just application level
- **Layer-based packing** — Best-fit 3D bin-packing with rotation support balances accuracy and performance for real-time optimization
- **Stripe Billing Meters** — Usage-based billing with metered events enables pay-per-optimization pricing without custom billing infrastructure
- **Next.js App Router** — Server-side rendering with client-side interactivity, proxied API calls avoid CORS entirely
