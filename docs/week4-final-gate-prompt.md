# PackOptimize — Week 4: Final Gate — Stress Testing, Security, Deployment, Demo

## Context

The full application is built and functional:
- NestJS backend with 63+ tests: packing algorithm, DIM weight, carrier validation, void fill, pack instructions, compatibility rules
- Stripe billing (test mode): checkout, portal, usage metering, plan limits
- Shopify Carrier Service webhook endpoint
- Batch optimization endpoint
- Analytics with 50+ historical demo runs
- Next.js frontend: dashboard, items, boxes, optimization wizard, 3D viewer, carrier rules, API keys, settings, billing
- Docker configuration and GitHub Actions CI

## What We're Doing This Week

This is the final quality gate. We're not building new features — we're making everything bulletproof and deployable. By the end of this week:
1. Every edge case is tested
2. Security vulnerabilities are patched
3. The app is deployed to a live URL
4. The demo flow is rehearsed and documented
5. The README is comprehensive

---

## Part 1: Stress Tests (Day 1)

Create a stress test file at `src/__tests__/stress.spec.ts`. These tests verify the system handles real-world load without crashing, leaking memory, or corrupting data.

### Concurrent Request Tests

```typescript
// Test: 20 concurrent optimization requests don't crash the server
// Create 20 promises that each POST /v1/optimize with different items
// All 20 should return 200/201 with valid results
// No two results should be mixed up (each request gets its own items back)

// Test: 50 concurrent item creation requests
// All 50 should succeed with unique IDs
// No duplicate items created

// Test: 20 concurrent requests from 2 different tenants
// 10 from SwiftShip, 10 from TechDirect (concurrent)
// SwiftShip results only contain SwiftShip items
// TechDirect results only contain TechDirect items
// ZERO cross-tenant data leakage under concurrent load
```

### Performance Tests

```typescript
// Test: Optimization with 10 items completes in < 100ms
// Measure using performance.now() or Date.now()
// Assert response header X-Optimization-Duration-Ms < 100

// Test: Optimization with 30 items completes in < 500ms

// Test: Optimization with 50 items completes in < 2000ms

// Test: 100 sequential optimizations (5 items each) complete in < 30 seconds total
// This simulates a busy period — ~3 optimizations per second

// Test: Batch optimization with 20 orders completes in < 30 seconds
```

### Memory and Stability Tests

```typescript
// Test: Optimization with 100 items does not crash (OOM check)
// Run optimization, verify response is valid, process doesn't exit
// If the server only has the 25 SwiftShip items, select items with high quantities

// Test: Optimization with items that result in 10+ boxes completes without error
// Use many large items that each need their own box

// Test: Rapid sequential calls (no delay between requests)
// Send 50 requests back-to-back, verify all return valid responses
// Check no requests get stuck or timeout
```

### Database Stress

```typescript
// Test: Create 500 items rapidly, then query them all
// All 500 should be retrievable
// No duplicates, no missing items

// Test: Run optimization while simultaneously creating/updating items
// Optimization should use the items that existed when it started
// No dirty reads or partial data
```

---

## Part 2: Security Hardening (Day 2)

Create security tests at `src/__tests__/security.spec.ts`.

### Authentication Tests

```typescript
// Test: Request with no Authorization header and no X-API-Key returns 401
// Test: Request with Authorization: Bearer <invalid-token> returns 401
// Test: Request with X-API-Key: <invalid-key> returns 401
// Test: JWT with tampered payload (change tenantId to another tenant's ID)
//       → Should return 401 (signature verification fails)
// Test: JWT signed with a different secret → returns 401
// Test: Expired JWT (create token with expiresIn: '0s') → returns 401
// Test: API key that has been deleted/revoked → returns 401
// Test: Expired API key (expiresAt in the past) → returns 401
```

### Tenant Isolation Tests

```typescript
// Test: Tenant A's JWT used to GET /items → returns only Tenant A items
// Test: Tenant A's JWT used to GET /items/:tenantBItemId → returns 404 (not 200)
// Test: Tenant A's JWT used to PUT /items/:tenantBItemId → returns 404 (not updated)
// Test: Tenant A's JWT used to DELETE /items/:tenantBItemId → returns 404 (not deleted)
// Test: Tenant A's API key used to POST /v1/optimize with Tenant B's item IDs
//       → Items not found (treated as missing items, not as a data leak)
// Test: Create item as Tenant A, then query as Tenant B — not visible
//       Do this for: items, box-types, api-keys, optimization-runs
```

### Input Validation / Injection Tests

```typescript
// Test: SQL injection in item name
//   name: "'; DROP TABLE \"Item\"; --"
//   → Item created successfully with that literal string as name
//   → Table still exists, query items returns results

// Test: SQL injection in search/filter query parameter
//   GET /items?search='; DROP TABLE "Item"; --
//   → Returns 200 with empty or filtered results, no SQL error

// Test: XSS in item name
//   name: "<script>alert('xss')</script>"
//   → Item created with that literal string
//   → When retrieved via API, returned as plain text (not executed)

// Test: Extremely long string (10,000 chars) in item name → 400 Bad Request

// Test: Negative dimensions
//   width: -100, height: -50, depth: -25
//   → 400 validation error

// Test: Zero dimensions
//   width: 0 → 400 validation error

// Test: Non-numeric dimensions
//   width: "abc" → 400 validation error

// Test: Item with huge dimensions (999999999mm)
//   → Item creates but optimization flags it as exceeding all boxes

// Test: Request body > 1MB → should return 413 or 400 (NestJS body limit)

// Test: Array of 1000 items in optimization request → should return 400 (max 500)

// Test: Nested object depth attack (deeply nested JSON) → should not crash
```

### RBAC Tests

```typescript
// Test: VIEWER role cannot POST /items (403)
// Test: VIEWER role cannot PUT /items/:id (403)
// Test: VIEWER role cannot DELETE /items/:id (403)
// Test: VIEWER role CAN GET /items (200)
// Test: VIEWER role CAN POST /v1/optimize (200) — viewers can run optimizations
// Test: OPERATOR role can CRUD items and boxes (200)
// Test: OPERATOR role cannot POST /api-keys (403) — Admin only
// Test: OPERATOR role cannot POST /billing/checkout (403) — Admin only
// Test: ADMIN role can do everything (200 across all endpoints)
```

### Rate Limiting Tests

```typescript
// Test: Exceed optimization rate limit (3 requests per second)
//   Send 5 rapid requests → at least one returns 429

// Test: Rate limit response includes Retry-After header

// Test: After waiting the retry period, requests succeed again
```

---

## Part 3: Error Handling Audit (Day 2)

Go through every endpoint and verify error responses are consistent:

```typescript
// Every 400 error returns: { statusCode: 400, message: "...", error: "Bad Request" }
// Every 401 error returns: { statusCode: 401, message: "Unauthorized", error: "Unauthorized" }
// Every 403 error returns: { statusCode: 403, message: "Forbidden", error: "Forbidden" }
// Every 404 error returns: { statusCode: 404, message: "Not Found", error: "Not Found" }
// Every 409 error returns: { statusCode: 409, message: "...", error: "Conflict" }
// Every 429 error returns: { statusCode: 429, message: "...", error: "Too Many Requests" }

// NO endpoint returns a raw Prisma error (PrismaClientKnownRequestError) to the client
// NO endpoint returns a stack trace to the client
// NO endpoint returns a 500 with internal details
```

Create a global exception filter test that verifies:
```typescript
// Test: Prisma unique constraint violation → 409 Conflict with readable message
// Test: Prisma record not found → 404 Not Found
// Test: Prisma connection error → 503 Service Unavailable
// Test: Unhandled exception → 500 Internal Server Error with generic message (no stack trace)
```

---

## Part 4: Data Integrity Tests (Day 3)

```typescript
// Test: Run optimization → SavingsLog created with correct naiveCost and optimizedCost
//       Verify: savingsAmount = naiveCost - optimizedCost (not negative for well-optimized runs)

// Test: Run optimization → UsageRecord incremented for correct billing period (YYYY-MM format)

// Test: Run optimization → OptimizationRun has status COMPLETED, duration > 0, completedAt set

// Test: Run optimization → OptimizationResult entries match the packedBoxes in the API response
//       Number of results = number of packed boxes

// Test: Delete a BoxType that has been used in an OptimizationResult
//       → Should either: soft-delete (isActive=false) or return 409 Conflict
//       → Should NOT cascade delete the optimization results

// Test: Delete an Item that has been used in an OptimizationResult
//       → Same: soft-delete or 409, never cascade delete results

// Test: Optimization with items that have no available boxes
//       → Returns success=true but with all items in unpackedItems array, packedBoxes empty
//       → Does NOT throw a 500 error

// Test: Optimization where naiveCost < optimizedCost (it happens sometimes with small orders)
//       → Savings should show as negative correctly, not crash or show NaN
```

---

## Part 5: Frontend Error State Tests (Day 3)

Tell Claude Code to verify these manually or add Playwright/Cypress tests if time permits:

```
Frontend checklist:
1. Stop the backend → frontend shows "Cannot connect to server" error, not a blank page
2. Login with wrong password → error toast appears, form is not cleared
3. Navigate to Items with no items → shows "No items yet" empty state
4. Navigate to Boxes with no boxes → shows "No box types yet" empty state
5. Run optimization with no boxes in the system → shows "Add box types first" message
6. CSV import with invalid file → shows error, does not crash
7. Create item with duplicate SKU → shows conflict error message
8. Session expires (delete token from localStorage) → redirects to login on next action
9. Rapid-click "Run Optimization" button → does not send multiple requests (button disabled during loading)
10. 3D viewer with 0 packed boxes (all items unpacked) → shows message, not empty canvas
```

---

## Part 6: Deploy to Live URL (Day 4)

### Option A: Railway (Recommended for simplicity)
```
1. Create Railway account (railway.app)
2. Create new project
3. Add PostgreSQL service (Railway managed)
4. Add Redis service (Railway managed)  
5. Deploy backend from packoptimize-api directory
   - Set environment variables (DATABASE_URL auto-configured, add JWT_SECRET, STRIPE keys, etc.)
   - Set start command: npx prisma migrate deploy && node dist/main.js
6. Deploy frontend from packoptimize-web directory
   - Set NEXT_PUBLIC_API_URL to the backend's Railway URL
7. Run seed: railway run npx prisma db seed && railway run npm run seed:demo
```

### Option B: DigitalOcean App Platform
```
1. Create DigitalOcean account
2. Create App from GitHub repo
3. Add managed PostgreSQL database
4. Add managed Redis
5. Configure build and run commands
6. Set environment variables
```

### Option C: Vercel (frontend) + Railway (backend)
```
1. Deploy packoptimize-web to Vercel (automatic from GitHub)
2. Deploy packoptimize-api to Railway
3. Set NEXT_PUBLIC_API_URL in Vercel to Railway backend URL
4. Configure CORS on backend to allow Vercel domain
```

### Post-Deployment Verification
```bash
# Replace with your actual URLs
BACKEND_URL="https://your-backend.railway.app"
FRONTEND_URL="https://your-frontend.vercel.app"

# Health check
curl $BACKEND_URL/health

# Swagger docs
curl $BACKEND_URL/api/docs-json | head -20

# Login
curl -X POST $BACKEND_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swiftship.com","password":"password123","tenantSlug":"swiftship"}'

# Open frontend in browser
open $FRONTEND_URL
```

### CORS Configuration

Update the backend's main.ts to allow the frontend domain:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',           // Local dev
    process.env.FRONTEND_URL,          // Production frontend
  ],
  credentials: true,
});
```

---

## Part 7: Final README + Documentation (Day 4)

### Project Root README (packoptimize/README.md)

This README is what the client sees. It must be comprehensive but scannable.

Sections:
1. **Title + one-line description**
2. **Screenshots** (add after deployment — 3D viewer, dashboard, optimization results)
3. **Architecture Overview** — tech stack diagram (text-based or Mermaid)
4. **Key Features** — bullet list of everything built
5. **Quick Start** — local dev setup in 5 steps (clone, docker-compose up, migrate, seed, start)
6. **API Documentation** — link to Swagger docs + key endpoint summary
7. **Architecture Decisions** — brief section on:
   - Why NestJS (module system, TypeScript-first, enterprise patterns)
   - Why PostgreSQL RLS for multi-tenancy (database-enforced isolation)
   - Why layer-based bin-packing algorithm (optimal balance of speed and accuracy)
   - Why React Three Fiber for 3D visualization (declarative, React-native)
8. **Project Structure** — tree view of both api and web directories
9. **Testing** — how to run tests, coverage report
10. **Deployment** — production deployment instructions
11. **License** — MIT

### API README (packoptimize-api/README.md)

Backend-specific documentation:
- Setup instructions
- Environment variables reference (every .env key explained)
- Database schema overview
- Module structure
- Testing guide
- Deployment guide

### Frontend README (packoptimize-web/README.md)

Frontend-specific documentation:
- Setup instructions
- Environment variables
- Component structure
- 3D visualization notes

---

## Part 8: Demo Script (Day 5)

Create a file at `docs/DEMO_SCRIPT.md` that documents the exact demo flow for recording a Loom video or presenting to the client:

```markdown
# PackOptimize Demo Script (3-5 minutes)

## Setup
- Backend running at [live URL]
- Frontend running at [live URL]
- Browser: Chrome, clear cache, no dev tools visible

## Flow

### 1. Login (15 seconds)
- Open the app → show the login page
- Login as admin@swiftship.com (SwiftShip Logistics)
- Mention: "Multi-tenant system — each client gets their own isolated environment"

### 2. Dashboard Overview (30 seconds)
- Point out KPI cards: total optimizations, cumulative savings, items, boxes
- Show the savings chart trending upward
- Mention: "Real-time analytics tracking ROI for every optimization"

### 3. Item Catalog (20 seconds)
- Navigate to Items
- Scroll through the 25 products with dimensions
- Show search/filter
- Mention: "Full product catalog with dimensions, fragility settings, and compatibility rules"
- Quick show: CSV import button (don't actually import)

### 4. Box Inventory (15 seconds)
- Navigate to Boxes
- Point out inner vs outer dimensions, wall thickness, box weight
- Mention: "We track both inner and outer dimensions — items fit inside, carriers measure outside"

### 5. Run Optimization — THE MAIN EVENT (90 seconds)
- Navigate to Optimize
- Select 5-6 items: Laptop, Phone, USB-C Cable, Ceramic Mug (x2), Board Game
  (This gives a mix: fragile, heavy, compatibility rule, different sizes)
- Set carrier to FedEx, optimize for Cost, Air Pillows fill
- Click "Run Optimization"
- When results load:
  a. "Look — the algorithm packed everything into X boxes at Y% average utilization"
  b. Show 3D viewer — rotate the view, zoom in
  c. Hover over items — "Each item is positioned with exact coordinates"
  d. Point out: "Fragile items in red are placed on top, heavy items on the bottom"
  e. Scroll to cost breakdown — "DIM weight vs actual weight, billable weight calculated per carrier rules"
  f. Show pack instructions — "These are warehouse-ready — your packers follow these step by step"
  g. Show savings — "Optimized vs naive: X% cost reduction"

### 6. Carrier Rules (15 seconds)
- Navigate to Carrier Rules
- Show FedEx tab — surcharge thresholds
- Mention: "The engine validates against all carrier constraints — AHS, oversize, girth limits"

### 7. API Documentation (20 seconds)
- Open Swagger docs in new tab
- Show the /v1/optimize endpoint with request/response schema
- Mention: "API-first design — integrates with Shopify, WooCommerce, or any custom system"

### 8. Tenant Isolation (15 seconds)
- Logout
- Login as admin@techdirect.com (TechDirect)
- Show completely different items (all electronics, all fragile)
- Mention: "Complete tenant isolation via PostgreSQL Row-Level Security"

### Closing (15 seconds)
- "This is a working prototype with a real 3D bin-packing engine, carrier-aware DIM weight optimization, Stripe billing integration, and a Shopify-ready webhook. Ready to discuss taking this to production."
```

---

## FINAL GATE — COMPLETE TEST SUITE

Run the ENTIRE test suite one final time:

```bash
cd packoptimize-api
npm run test -- --verbose --forceExit --coverage
```

### Required Results:
- **All tests pass** — zero failures
- **Coverage on critical modules > 80%**:
  - src/optimization/engine/* — the algorithm code
  - src/auth/* — authentication
  - src/billing/* — billing logic
- **No skipped tests** — every test runs

### Then verify deployment:
```bash
# Docker build succeeds
docker build -t packoptimize-api ./packoptimize-api
# Container starts and health check passes
docker run -d -p 3000:3000 --name po-test packoptimize-api
sleep 5
curl http://localhost:3000/health
docker stop po-test && docker rm po-test
```

### Final Manual Walkthrough:
Run through the demo script above on the LIVE deployed URL (not localhost).
Every step must work. If anything fails on the live URL that works locally, it's a deployment configuration issue — fix it.

---

## DELIVERABLES CHECKLIST

When this week is complete, you should have:

- [ ] All backend tests passing (63+ original + new stress/security/data integrity tests)
- [ ] Live backend URL returning healthy
- [ ] Live frontend URL loading correctly
- [ ] Demo script documented and rehearsed
- [ ] Loom video recorded (3-5 minutes)
- [ ] README comprehensive with architecture decisions
- [ ] Swagger docs accessible on live URL
- [ ] Docker build succeeds
- [ ] GitHub Actions CI pipeline defined (runs on push)
- [ ] .env.example files in both projects
- [ ] No console.log, no hardcoded secrets, no any types in codebase
- [ ] Clean git history with meaningful commit messages
