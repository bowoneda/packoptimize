# PackOptimize — Week 2: Frontend Dashboard + 3D Visualization

## Context

The NestJS backend is fully functional:
- Auth (JWT + API Key), multi-tenant RLS, CRUD endpoints all working
- Packing algorithm with 63 tests passing: DIM weight, carrier validation, void fill, pack instructions, compatibility rules
- POST /v1/optimize returns complete optimization results
- Swagger docs at /api/docs
- Seed data: SwiftShip (25 items, 8 boxes, compatibility rules, inserts) and TechDirect (15 items, 5 boxes)
- Backend runs on http://localhost:3000

## What We're Building

A Next.js 14+ frontend dashboard with App Router that provides:
1. Authentication (login/register)
2. Dashboard overview with KPI cards and savings metrics
3. Item management with CRUD and CSV import
4. Box inventory management with inner/outer dimensions
5. Optimization wizard (select items → configure → run → view results)
6. **3D packing visualization** with React Three Fiber
7. Carrier rules reference page
8. API key management
9. Settings page

## Tech Stack

```bash
npx create-next-app@latest packoptimize-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd packoptimize-web

# UI Components
npx shadcn@latest init
# When prompted: TypeScript: yes, style: Default, base color: Slate, CSS variables: yes
npx shadcn@latest add button card input label select table tabs badge dialog sheet dropdown-menu toast separator avatar command popover form alert switch tooltip progress skeleton

# State management + data fetching
npm install zustand @tanstack/react-query axios

# Forms + validation
npm install react-hook-form @hookform/resolvers zod

# Tables
npm install @tanstack/react-table

# Charts
npm install recharts

# 3D Visualization
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three

# File handling
npm install papaparse
npm install -D @types/papaparse

# Utilities
npm install lucide-react date-fns clsx
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    // Root layout with providers
│   ├── page.tsx                      // Redirect to /dashboard or /login
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx                // Sidebar + header layout
│       ├── dashboard/page.tsx        // Overview with KPIs
│       ├── items/page.tsx            // Item management
│       ├── boxes/page.tsx            // Box inventory
│       ├── optimize/page.tsx         // Optimization wizard
│       ├── optimize/results/[id]/page.tsx  // Results with 3D viewer
│       ├── carrier-rules/page.tsx    // Carrier constraints reference
│       ├── api-keys/page.tsx         // API key management
│       └── settings/page.tsx         // Tenant settings
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx               // Main navigation sidebar
│   │   ├── header.tsx                // Top bar with user menu
│   │   └── breadcrumb.tsx
│   ├── items/
│   │   ├── items-table.tsx           // Data table with sort/filter
│   │   ├── item-form-dialog.tsx      // Create/edit item modal
│   │   └── csv-import-dialog.tsx     // CSV upload and preview
│   ├── boxes/
│   │   ├── boxes-table.tsx
│   │   └── box-form-dialog.tsx
│   ├── optimize/
│   │   ├── item-selector.tsx         // Step 1: Select items + quantities
│   │   ├── options-config.tsx        // Step 2: Carrier, fill material, etc.
│   │   ├── results-summary.tsx       // Cost breakdown, savings
│   │   ├── surcharge-warnings.tsx    // Orange/red surcharge alerts
│   │   ├── pack-instructions.tsx     // Numbered pack steps
│   │   └── flat-rate-comparison.tsx  // Flat rate vs standard comparison
│   ├── three/
│   │   ├── packing-viewer.tsx        // Main 3D canvas (dynamic import, ssr: false)
│   │   ├── packed-box-scene.tsx      // Single box with items inside
│   │   ├── item-mesh.tsx             // Individual item rendering
│   │   └── box-wireframe.tsx         // Transparent container
│   ├── dashboard/
│   │   ├── kpi-cards.tsx             // Total optimizations, savings, items count
│   │   ├── recent-runs.tsx           // Last 10 optimization runs
│   │   └── savings-chart.tsx         // Recharts line/bar chart
│   ├── api-keys/
│   │   ├── api-keys-table.tsx
│   │   └── create-key-dialog.tsx
│   └── carrier-rules/
│       └── carrier-rules-display.tsx
├── lib/
│   ├── api.ts                        // Axios instance with auth interceptor
│   ├── auth.ts                       // Auth utilities (token storage, redirect)
│   └── utils.ts                      // Helpers (format currency, weight conversion)
├── hooks/
│   ├── use-auth.ts                   // Auth state hook
│   ├── use-items.ts                  // TanStack Query hooks for items
│   ├── use-boxes.ts                  // TanStack Query hooks for boxes
│   ├── use-optimize.ts              // Optimization mutation hook
│   └── use-carrier-rules.ts         // Carrier rules query hook
├── stores/
│   └── auth-store.ts                 // Zustand store for auth state
└── types/
    └── api.ts                        // TypeScript types matching API responses
```

## Step 1: API Client + Auth Store

### lib/api.ts
Create an Axios instance that:
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3000`)
- Automatically attaches JWT from localStorage as `Authorization: Bearer <token>`
- On 401 response, clears token and redirects to /login
- Has typed helper methods: `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, `api.delete<T>()`

### stores/auth-store.ts
Zustand store with:
```typescript
interface AuthState {
  token: string | null;
  user: { id: string; email: string; role: string; tenantId: string; tenantName: string } | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void; // Load from localStorage on mount
}
```

### types/api.ts
Define all TypeScript interfaces matching the API response shapes:
- `Item`, `BoxType`, `PackagingType`, `ApiKey`, `CarrierConstraint`
- `OptimizationResult`, `PackedBox`, `Placement`, `Surcharge`, `VoidFillResult`
- `OptimizeRequest`, `OptimizeResponse`
- `SavingsSummary`, `UsageStats`
- `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`

## Step 2: Layout + Navigation

### Root Layout (app/layout.tsx)
- Wrap with TanStack QueryClientProvider and Toaster (from shadcn)
- Set metadata: title "PackOptimize", description "Packaging Optimization Platform"

### Dashboard Layout (app/(dashboard)/layout.tsx)
- Check auth on mount — redirect to /login if no token
- Sidebar on the left (fixed, 260px wide), main content on the right
- Header at top with breadcrumb, user avatar, and logout button

### Sidebar (components/layout/sidebar.tsx)
Navigation items with icons (from lucide-react):
- Dashboard (LayoutDashboard icon)
- Items (Package icon)
- Boxes (Box icon)
- Optimize (Zap icon)
- Carrier Rules (Truck icon)
- API Keys (Key icon)
- Settings (Settings icon)

Active item highlighted with accent color. Logo/brand at top: "PackOptimize" with a small box icon.

Use a professional, clean design. Color scheme: slate/gray base with blue accent (#2563EB for primary actions). NOT overly colorful — this is a B2B SaaS tool.

## Step 3: Auth Pages

### Login Page (app/(auth)/login/page.tsx)
- Clean centered card layout
- Fields: Email, Password, Tenant Slug (or dropdown if we want)
- "Sign in" button → POST /auth/login → store token → redirect to /dashboard
- Link to /register
- Show toast on error

### Register Page (app/(auth)/register/page.tsx)
- Fields: Tenant Name, Tenant Slug (auto-generated from name), Email, Password, Confirm Password
- Zod validation: email format, password min 8 chars, passwords match, slug lowercase alphanumeric + hyphens
- POST /auth/register → store token → redirect to /dashboard

## Step 4: Dashboard Overview

### KPI Cards (4 cards in a row):
1. **Total Optimizations** — count from GET /usage (current billing period)
2. **Cumulative Savings** — total savingsAmount from GET /analytics/savings
3. **Items in Catalog** — count from GET /items
4. **Active Box Types** — count from GET /box-types

Each card: icon, label, big number, small trend indicator if data available.

### Recent Optimization Runs
Table showing last 10 runs: date, item count, boxes used, total cost, savings, status.
Click a row to view full results.

### Savings Chart
Recharts BarChart or AreaChart showing savings over time (by week or month).
Use the data from GET /analytics/savings.
If no historical data, show a placeholder message.

## Step 5: Item Management Page

### Items Table (items-table.tsx)
Use @tanstack/react-table with:
- Columns: SKU, Name, Dimensions (W×H×D mm), Weight (g), Fragile (badge), Can Rotate (badge), Actions
- Server-side data: GET /items (for the demo, client-side is fine since we have <100 items)
- Sort by clicking column headers
- Search/filter input at top
- "Add Item" button opens dialog
- Row actions: Edit, Delete (with confirmation)

### Item Form Dialog (item-form-dialog.tsx)
React Hook Form + Zod validation:
- SKU (required, string)
- Name (required, string)
- Width, Height, Depth (required, positive numbers, in mm)
- Weight (required, positive number, in grams)
- Is Fragile (toggle switch)
- Can Rotate (toggle switch, default true)
- Max Stack Weight (optional, positive number, in grams)

On submit: POST /items (create) or PUT /items/:id (edit).
Show toast on success/error.

### CSV Import Dialog (csv-import-dialog.tsx)
1. File upload zone (drag and drop or click to browse)
2. Parse CSV with PapaParse
3. Show preview table of first 5 rows
4. Column mapping: map CSV columns to item fields (auto-detect where possible)
5. "Import" button → POST /items/import
6. Show results: X items created, Y skipped, Z errors

## Step 6: Box Inventory Page

### Boxes Table
Columns: Name, Inner Dims (W×H×D mm), Outer Dims, Wall Thickness, Box Weight (g), Max Weight (g), Cost ($), Active (badge), Actions

### Box Form Dialog
Fields:
- Name (required)
- Inner Width, Height, Depth (required, positive, mm)
- Wall Thickness (required, positive, mm) — auto-calculates outer dims: outer = inner + 2*wall
- Box Weight (required, positive, grams)
- Max Weight (required, positive, grams)
- Cost (required, positive, USD)
- Is Active (toggle)

Show calculated outer dimensions in real-time as user types inner dims and wall thickness.

## Step 7: Optimization Wizard (THE KEY PAGE)

This is a multi-step wizard that guides the user through running an optimization.

### URL: /optimize

### Step 1: Select Items
- Display all items in a selectable table/grid
- Each item has a checkbox and a quantity input (default 1, min 1, max 100)
- Search/filter bar at top
- Show running totals: "X items selected, Y total units, ~Z kg total weight"
- "Next" button enabled when at least 1 item selected

### Step 2: Configure Options
- **Carrier**: Radio group or select — FedEx, UPS, USPS (with logos or icons)
- **Optimize For**: Radio group — Lowest Cost, Best Space Utilization, Fewest Boxes
- **Fill Material**: Select dropdown — Air Pillows, Kraft Paper, Bubble Wrap, Packing Peanuts, Foam-in-Place
- **Include Flat Rate Comparison**: Toggle switch (default on)
- **Max Boxes**: Number input (default 10)
- Optional: Select specific box types to consider (multi-select from tenant's active boxes)

### Step 3: Results
After clicking "Run Optimization":
- Show loading state with spinner and "Optimizing packing for X items..."
- On success, display ALL of the following:

#### 3a: Summary Cards (top row)
- Total Boxes Used
- Total Cost (with savings badge showing % saved)
- Average Utilization (as percentage)
- Execution Time (ms)

#### 3b: 3D Packing Visualization (main content area)
- The React Three Fiber 3D viewer (see Step 8 below for full spec)
- If multiple boxes, show tabs or a horizontal scroll to switch between boxes

#### 3c: Cost Breakdown Panel (right side or below)
For each box:
- Box type name and material cost
- DIM weight vs actual weight comparison
- Billable weight (highlighted if DIM > actual)
- Surcharges (each listed with amount and reason)
- Estimated shipping cost
- Box total cost
- Grand total across all boxes

#### 3d: Surcharge Warnings
If any surcharges triggered, show alert banners:
- Orange for AHS surcharges
- Red for Oversize or Unauthorized surcharges
- Include the specific reason and dollar amount

#### 3e: Pack Instructions Panel
For each box, display numbered instructions:
- Step number and text
- FRAGILE items highlighted with a warning icon
- Void fill step in a different color

#### 3f: Flat Rate Comparison (if enabled)
If flat rate options available, show a comparison card:
- "Standard Optimization: $X.XX" vs "USPS Medium Flat Rate: $Y.YY — Save $Z.ZZ"
- Highlight the cheaper option in green

#### 3g: Savings Summary
- Naive cost (no optimization) vs Optimized cost
- Dollar savings and percentage
- "Your optimization saved $X.XX (Y.Y%)"

## Step 8: 3D Packing Visualization — DETAILED SPEC

This is the visual centerpiece. It must be impressive and correct.

### File: components/three/packing-viewer.tsx

CRITICAL: This component and all R3F components must be dynamically imported with `{ ssr: false }` in Next.js to avoid SSR hydration errors.

```typescript
// In the page or parent component:
import dynamic from 'next/dynamic';
const PackingViewer = dynamic(() => import('@/components/three/packing-viewer'), { ssr: false });
```

### Scene Setup:
- Canvas with `camera={{ position: [500, 400, 500], fov: 50 }}`
- OrbitControls from @react-three/drei with:
  - enableDamping: true
  - dampingFactor: 0.1
  - minDistance: 100
  - maxDistance: 2000
- Lighting:
  - ambientLight intensity 0.5 (soft fill)
  - directionalLight position [200, 400, 200] intensity 0.8 (main light)
  - directionalLight position [-200, 300, -200] intensity 0.3 (back fill)
- Grid: gridHelper on the XZ plane (subtle, gray, for spatial reference)
- Background: white or very light gray (#f8fafc)

### Box Rendering (box-wireframe.tsx):
- Render the container box as a **transparent wireframe**:
  - Use `<lineSegments>` with EdgesGeometry from a BoxGeometry matching box inner dimensions
  - Line color: #94a3b8 (slate-400)
  - Line width: 1 (note: linewidth > 1 only works with Line2 from drei, use <Line> from drei if needed)
- Position box so its bottom-left-back corner is at origin (0, 0, 0):
  - Box center: (innerWidth/2, innerHeight/2, innerDepth/2)

### Item Rendering (item-mesh.tsx):
For each placement in the packed box:
- Create a `<mesh>` with `<boxGeometry args={[width, height, depth]}>`
- Position: (x + width/2, y + height/2, z + depth/2) — convert from corner position to center position
- Color based on item properties:
  - **Red** (#EF4444, opacity 0.7): isFragile === true
  - **Amber** (#F59E0B, opacity 0.7): weight > 5000g (heavy items)
  - **Green** (#22C55E, opacity 0.7): normal items
  - **Blue** (#3B82F6, opacity 0.7): insert materials
- Material: `<meshStandardMaterial color={color} transparent opacity={0.7} />`
- Add `<Edges>` from drei for wireframe outline on each item (helps distinguish adjacent items)
  - Edge color: darker version of the item color
  - Threshold: 15 (angle threshold for edge detection)

### Hover Interaction:
- On hover over an item mesh, show a tooltip with:
  - Item name and SKU
  - Dimensions as placed (W × H × D mm)
  - Weight (grams)
  - Rotation applied (if any)
- Use `<Html>` from @react-three/drei for the tooltip, positioned above the hovered item
- Change the hovered item's opacity to 1.0 and add a slight emissive glow
- Use `onPointerOver` and `onPointerOut` events on the mesh

### Multiple Boxes:
When the result has multiple packed boxes:
- Render each box in the scene, spaced along the X-axis
- Gap between boxes: 20% of the largest box's width
- Each box has a label above it using `<Html>` from drei:
  - "Box 1: Medium Box" 
  - "Utilization: 78%"
  - Small colored dot: green if utilization > 70%, yellow if 40-70%, red if < 40%

### Controls:
- Add a "Reset View" button (outside the canvas) that resets camera to default position
- Optional: Add a "Box" selector (dropdown or tabs) that focuses the camera on a specific box
- Optional: Toggle wireframe/solid rendering

### Scale:
All dimensions in the engine are in millimeters. Render at 1:1 scale (1 unit = 1mm).
The camera positions and distances should account for boxes typically being 200-700mm in each dimension.

### Performance:
- Use React.memo on ItemMesh components
- For boxes with 20+ items, consider using instancedMesh for identical item geometries
- Keep material objects stable (useMemo) to avoid re-creation on re-render

## Step 9: API Key Management Page

### API Keys Table
Columns: Key Prefix (show `pk_live_xxxx...`), Created, Last Used, Permissions, Expires, Actions (Revoke)

### Create Key Dialog
- Name/description (optional)
- Permissions checkboxes: optimize, items:read, items:write, boxes:read, boxes:write
- Expiration: None, 30 days, 90 days, 1 year
- On create: show the full key ONCE in a copiable field with a warning "Save this key — you won't see it again"

## Step 10: Carrier Rules Page

Display carrier constraints in a clean, readable format. Data from GET /carrier-rules.

For each carrier (FedEx, UPS, USPS), show a card with:
- Maximum dimensions (length, girth)
- Maximum weight
- DIM divisor
- AHS thresholds (length, width, cubic volume)
- Oversize thresholds
- AHS minimum billable weight
- Surcharge amounts

Use a tab layout: one tab per carrier. Or three cards side by side.

## Step 11: Settings Page

- **Tenant Info**: Name, slug (read-only), plan badge
- **Default Carrier**: Select dropdown (FedEx/UPS/USPS)
- **Default Fill Material**: Select dropdown
- **Insert Materials**: List with add/remove (name, dimensions, weight, always-include toggle)
- **Danger Zone**: Delete tenant (with confirmation dialog)

## Step 12: Responsive Design

The dashboard must work well at:
- 1920px (full desktop)
- 1440px (laptop)
- 1024px (small laptop / tablet landscape)
- 768px (tablet portrait) — sidebar collapses to hamburger menu

Use Tailwind responsive classes. The 3D viewer should fill available width and have a minimum height of 400px.

## Step 13: Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Create `.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## IMPORTANT BUILD RULES

1. All components use TypeScript with strict types — no `any`
2. Use shadcn/ui components for ALL UI elements (buttons, inputs, cards, dialogs, tables, badges, etc.)
3. Use Tailwind CSS exclusively — no inline styles, no CSS modules
4. Color scheme: slate base, blue-600 primary (#2563EB), professional B2B aesthetic
5. All data fetching through TanStack Query hooks — never fetch in components directly
6. All forms use React Hook Form + Zod schemas
7. Toast notifications for all success/error states
8. Loading skeletons (from shadcn) while data is fetching
9. Empty states with helpful messages when no data exists
10. All dates formatted with date-fns
11. 3D components dynamically imported with { ssr: false }
12. No console.log in production code
13. Every page must have a page title set via metadata or document.title

## TESTING / VERIFICATION

After building everything, verify these manually:

1. Open http://localhost:3001 (or whatever port Next.js runs on)
2. Login page renders → login with admin@swiftship.com / password123 / swiftship
3. Dashboard shows KPI cards with real data
4. Navigate to Items → table shows 25 SwiftShip items
5. Click "Add Item" → fill form → submit → new item appears in table
6. Navigate to Boxes → table shows 8 box types with inner AND outer dimensions
7. Navigate to Optimize:
   a. Step 1: Select 3-4 items with quantities
   b. Step 2: Choose FedEx, Lowest Cost, Air Pillows
   c. Click "Run Optimization"
   d. Results page shows:
      - Summary cards (boxes, cost, utilization, time)
      - 3D visualization with items colored correctly inside wireframe box
      - 3D viewer: mouse drag rotates, scroll zooms
      - Hover over an item in 3D → tooltip shows name/SKU/dimensions
      - Cost breakdown with DIM weight vs actual weight
      - Pack instructions with numbered steps and FRAGILE warnings
      - Savings comparison (naive vs optimized)
8. Navigate to Carrier Rules → FedEx/UPS/USPS constraints displayed
9. Navigate to API Keys → create a key → key shown once → table shows prefix
10. Logout → redirects to login → cannot access dashboard without auth

Run through this checklist fully. Fix any issues before declaring complete.
