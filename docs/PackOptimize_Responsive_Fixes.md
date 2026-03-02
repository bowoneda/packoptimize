# PackOptimize — Responsive & Screen-Friendliness Fixes

## Instructions for Claude Code

This prompt fixes every responsive, overflow, spacing, and mobile-friendliness issue across the entire frontend. Apply each fix in order. Run `npm run build` after completing all changes.

**DO NOT change any logic, hooks, API calls, types, or state.** Only touch layout classes, padding, grid breakpoints, overflow handling, and font sizes.

---

## 1. Dashboard Layout — Main Content Padding

**File:** `src/app/(dashboard)/layout.tsx`

The main content area uses `p-6 lg:p-8` but on very small screens (<375px) this eats into usable width. Also the sidebar width pushes content off on tablets.

**Find:**
```tsx
<main className="p-6 lg:p-8">{children}</main>
```

**Replace with:**
```tsx
<main className="px-4 py-5 sm:p-6 lg:p-8">{children}</main>
```

---

## 2. KPI Cards — Text Overflow on Small Screens

**File:** `src/components/dashboard/kpi-cards.tsx`

The `text-4xl font-bold` KPI numbers (e.g. `$12,400.00`) will overflow the card on phones under 360px. The 3xl padding and 12h icon boxes are also oversized for mobile.

**Fix — in ALL 4 card divs**, apply these class changes:

For the dark primary card:
```tsx
<div className="bg-[#0B4228] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
```

For ALL white cards:
```tsx
<div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
```

For ALL icon containers inside cards:
```tsx
<div className="w-10 h-10 sm:w-12 sm:h-12 ...">
```

For ALL KPI values:
```tsx
<h3 className="text-2xl sm:text-4xl font-bold tracking-tight ...">
```

For the grid container:
```tsx
<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
```

This makes cards 2-up on all phones (not single column which wastes space) with smaller padding and text that scales up on larger screens.

---

## 3. Dashboard Page — Chart & Runs Grid

**File:** `src/app/(dashboard)/dashboard/page.tsx`

The `lg:grid-cols-2` grid for RecentRuns and SavingsChart is fine, but both components inside need horizontal scroll protection on their table/chart content.

**Find:**
```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
```

**Replace with:**
```tsx
<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
```

---

## 4. Recent Runs Table — Horizontal Overflow on Mobile

**File:** `src/components/dashboard/recent-runs.tsx`

A 6-column table will overflow on mobile. Wrap in horizontal scroll container.

**Find:**
```tsx
) : (
  <Table>
```

**Replace with:**
```tsx
) : (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
  <Table className="min-w-[500px]">
```

And add the closing `</div>` after `</Table>`:
```tsx
  </Table>
  </div>
```

---

## 5. Savings Chart — Responsive Height

**File:** `src/components/dashboard/savings-chart.tsx`

The chart has a fixed 300px height which is fine on desktop but wastes space relative to the card on mobile, and the empty state also uses `h-[300px]`.

**Find:**
```tsx
<ResponsiveContainer width="100%" height={300}>
```

**Replace with:**
```tsx
<ResponsiveContainer width="100%" height={250} className="sm:[&]:!h-[300px]">
```

Also for the empty state:
```tsx
<div className="flex h-[200px] sm:h-[300px] items-center justify-center">
```

---

## 6. Items Page — Header Buttons Stack on Mobile

**File:** `src/app/(dashboard)/items/page.tsx`

The header has title on left and two buttons on right. On narrow screens the buttons wrap ugly. Stack on mobile.

**Find:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-lg font-semibold">Items</h2>
    <p className="text-sm text-muted-foreground">
      Manage your product catalog for packing optimization
    </p>
  </div>
  <div className="flex gap-2">
```

**Replace with:**
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-lg font-semibold">Items</h2>
    <p className="text-sm text-muted-foreground">
      Manage your product catalog for packing optimization
    </p>
  </div>
  <div className="flex gap-2 shrink-0">
```

Apply the SAME pattern to `src/app/(dashboard)/boxes/page.tsx` (title + Add Box Type button).

---

## 7. Items Table — Mobile Overflow & Column Hiding

**File:** `src/components/items/items-table.tsx`

A 7-column table overflows badly on mobile. Two fixes: horizontal scroll wrapper AND hide less-important columns on small screens.

**Wrap the table in a scroll container.** Find:
```tsx
<div className="rounded-3xl border border-gray-100 overflow-hidden bg-white">
  <Table>
```

**Replace with:**
```tsx
<div className="rounded-3xl border border-gray-100 overflow-hidden bg-white">
  <div className="overflow-x-auto">
  <Table className="min-w-[700px]">
```

And close the inner div after `</Table>`:
```tsx
  </Table>
  </div>
</div>
```

Additionally, make the search input full-width on mobile:
```tsx
<div className="relative w-full sm:max-w-sm">
```

---

## 8. Boxes Table — Same Scroll Treatment

**File:** `src/components/boxes/boxes-table.tsx`

Apply the exact same horizontal scroll wrapper as items-table above: `overflow-x-auto` inner div with `min-w-[650px]` on the Table.

---

## 9. Item Form Dialog — Grid Collapse on Mobile

**File:** `src/components/items/item-form-dialog.tsx`

The form uses `grid-cols-2` for SKU/Name and `grid-cols-3` for W/H/D which cramps on phones.

**Find:**
```tsx
<div className="grid grid-cols-2 gap-4">
```
(the SKU + Name row)

**Replace with:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

**Find:**
```tsx
<div className="grid grid-cols-3 gap-4">
```
(the W/H/D row)

**Replace with:**
```tsx
<div className="grid grid-cols-3 gap-2 sm:gap-4">
```
(keep 3-col since dimensions are small inputs, but tighten gap)

**Find:**
```tsx
<div className="grid grid-cols-2 gap-4">
```
(the Weight + Max Stack Weight row)

**Replace with:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

Also the dialog itself — ensure it doesn't overflow the viewport:
**Find:**
```tsx
<DialogContent className="max-w-md">
```

**Replace with:**
```tsx
<DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
```

---

## 10. Box Form Dialog — Same Grid Fixes

**File:** `src/components/boxes/box-form-dialog.tsx`

Apply the same pattern:

**3-column inner dims grid:** keep `grid-cols-3` but reduce gap:
```tsx
<div className="grid grid-cols-3 gap-2 sm:gap-4">
```

**3-column weight/maxWeight/cost grid:** same:
```tsx
<div className="grid grid-cols-3 gap-2 sm:gap-4">
```

**Dialog content:**
```tsx
<DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
```

---

## 11. Optimize Page — Step Indicator Overflow

**File:** `src/app/(dashboard)/optimize/page.tsx`

The step indicator is a horizontal flex with 3 pill-shaped steps + separators. On phones <375px they wrap or overflow.

**Find the step indicator wrapper:**
```tsx
<div className="flex items-center gap-2">
  {STEPS.map((s, i) => {
```

**Replace with:**
```tsx
<div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
  {STEPS.map((s, i) => {
```

**Reduce step pill padding on mobile.** Find the step pill className:
```tsx
className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
```

**Replace with:**
```tsx
className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
```

**Also fix the separator width for mobile:**
```tsx
<Separator className={`w-5 sm:w-8 ${isComplete ? "bg-[#0B4228]" : "bg-[#E8EAED]"}`} />
```

---

## 12. Optimize Page — Header with New Optimization Button

The "Optimize Packing" title and "New Optimization" button can clash on mobile.

**Find:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">Optimize Packing</h1>
```

**Replace with:**
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Optimize Packing</h1>
```

---

## 13. Item Selector — Layout on Mobile

**File:** `src/components/optimize/item-selector.tsx`

The header has search input + 3 summary badges on the same row. On mobile they collide.

**Find:**
```tsx
<div className="flex items-center justify-between">
  <Input
    placeholder="Search items..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="max-w-sm"
  />
  <div className="flex items-center gap-3 text-sm text-muted-foreground">
```

**Replace with:**
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <Input
    placeholder="Search items..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full sm:max-w-sm rounded-full bg-[#F5F6F8] border-gray-200"
  />
  <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground flex-wrap">
```

Also the item list rows — the checkbox + item info + quantity input row. On very narrow screens the quantity input can fall off:

**Find:**
```tsx
<div
  key={item.id}
  className={`flex items-center gap-4 border-b px-4 py-3 last:border-b-0 ${
```

**Replace with:**
```tsx
<div
  key={item.id}
  className={`flex items-center gap-2 sm:gap-4 border-b px-3 sm:px-4 py-3 last:border-b-0 ${
```

And the quantity input wrapper — make it not shrink:
**Find:**
```tsx
{isSelected && (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground">Qty:</span>
    <Input
      type="number"
      min={1}
      max={100}
      value={sel?.quantity ?? 1}
      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
      className="w-16 h-8 text-center"
    />
  </div>
)}
```

**Replace with:**
```tsx
{isSelected && (
  <div className="flex items-center gap-1.5 shrink-0">
    <span className="text-xs text-muted-foreground hidden sm:inline">Qty:</span>
    <Input
      type="number"
      min={1}
      max={100}
      value={sel?.quantity ?? 1}
      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
      className="w-14 sm:w-16 h-8 text-center text-sm"
    />
  </div>
)}
```

And the item info text — ensure it truncates:
**Find:**
```tsx
<div className="flex-1 min-w-0">
  <p className="text-sm font-medium truncate">{item.name}</p>
  <p className="text-xs text-muted-foreground">
    {item.sku} &middot; {item.width}x{item.height}x{item.depth}mm &middot; {item.weight}g
```

**Replace with:**
```tsx
<div className="flex-1 min-w-0">
  <p className="text-sm font-medium truncate">{item.name}</p>
  <p className="text-xs text-muted-foreground truncate">
    {item.sku} · {item.width}×{item.height}×{item.depth}mm · {item.weight}g
```

---

## 14. Options Config — Cards Grid on Mobile

**File:** `src/components/optimize/options-config.tsx`

**Find:**
```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
```

**Replace with:**
```tsx
<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
```

Also the bottom button row — stack on mobile:
**Find:**
```tsx
<div className="flex justify-between">
  <Button variant="outline" onClick={onBack}>
    Back
  </Button>
  <Button className="bg-[#0B4228]...
```

**Replace with:**
```tsx
<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
  <Button variant="outline" onClick={onBack} className="rounded-full w-full sm:w-auto">
    Back
  </Button>
  <Button className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md hover:shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] active:scale-95 transition-all duration-300 w-full sm:w-auto" onClick={onRun} disabled={isRunning}>
    {isRunning ? "Optimizing..." : "Run Optimization"}
  </Button>
```

This puts the primary action on top on mobile (column-reverse) and makes both buttons full-width.

---

## 15. Results Summary — Card Grid on Mobile

**File:** `src/components/optimize/results-summary.tsx`

**Find:**
```tsx
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
```

**Replace with:**
```tsx
<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
```

And the KPI values inside:
```tsx
<p className="text-2xl sm:text-3xl font-bold ...">
```
(Do this for ALL 4 value elements — the text-3xl is too big on a 2-col mobile card)

Also the cost breakdown grid inside the cost card:
**Find:**
```tsx
<div className="grid grid-cols-2 gap-x-8 gap-y-1 pl-4 text-sm text-[#8B95A5]">
```

**Replace with:**
```tsx
<div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-1 pl-2 sm:pl-4 text-xs sm:text-sm text-[#8B95A5]">
```

---

## 16. Optimize Page — Flat Rate & Savings Cards

Still in `src/app/(dashboard)/optimize/page.tsx`:

**Flat rate comparison items** — the flex row with name + cost + badge can overflow:
**Find:**
```tsx
<div
  key={opt.name}
  className={`flex items-center justify-between rounded-md border p-3 ${
```

**Replace with:**
```tsx
<div
  key={opt.name}
  className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border p-3 gap-2 ${
```

**Savings summary** — the naive vs optimized row:
**Find:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm text-muted-foreground">Naive cost (no optimization)</p>
    <p className="text-lg font-semibold">${result.naiveCost.toFixed(2)}</p>
  </div>
  <div className="text-right">
    <p className="text-sm text-muted-foreground">Optimized cost</p>
    <p className="text-lg font-semibold text-[#7AD427]">${result.optimizedCost.toFixed(2)}</p>
  </div>
</div>
```

**Replace with:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-xs sm:text-sm text-muted-foreground">Naive cost (no optimization)</p>
    <p className="text-base sm:text-lg font-semibold">${result.naiveCost.toFixed(2)}</p>
  </div>
  <div className="text-right">
    <p className="text-xs sm:text-sm text-muted-foreground">Optimized cost</p>
    <p className="text-base sm:text-lg font-semibold text-[#7AD427]">${result.optimizedCost.toFixed(2)}</p>
  </div>
</div>
```

---

## 17. 3D Viewer — Responsive Height

**File:** `src/components/three/packing-viewer.tsx`

The viewer has a fixed `h-[500px]` which takes up most of a phone screen.

**Find:**
```tsx
<div className="h-[500px] w-full rounded-3xl border bg-[#F5F6F8]">
```
(or whatever the current height class is)

**Replace with:**
```tsx
<div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8]">
```

Also the empty state:
```tsx
<div className="flex h-[250px] sm:h-[400px] items-center justify-center rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8] text-[#8B95A5]">
```

And the loading placeholder (in optimize/page.tsx where PackingViewer is dynamically imported):
```tsx
loading: () => (
  <div className="flex h-[300px] sm:h-[400px] lg:h-[500px] items-center justify-center rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8]">
    <p className="text-sm text-[#8B95A5]">Loading 3D viewer...</p>
  </div>
),
```

---

## 18. API Keys Page — Table Overflow & Dialog

**File:** `src/app/(dashboard)/api-keys/page.tsx`

The API keys table has 7 columns. Wrap in scroll container:

**Find the `<Table>` inside the Card:**
Add `<div className="overflow-x-auto">` before `<Table className="min-w-[600px]">` and `</div>` after `</Table>`.

**The Create Key dialog** — ensure it doesn't overflow on mobile:
**Find:**
```tsx
<DialogContent>
```

**Replace with:**
```tsx
<DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
```

**The header row** (title + Create Key button):
**Find:**
```tsx
<div className="flex items-center justify-between">
```

**Replace with:**
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

---

## 19. Carrier Rules Page — Tabs & Cards

**File:** `src/app/(dashboard)/carrier-rules/page.tsx`

**The tab triggers may overflow on small screens.** The TabsList needs horizontal scroll:
**Find:**
```tsx
<TabsList>
```

**Replace with:**
```tsx
<TabsList className="flex w-full overflow-x-auto">
```

**The 2-column card grid inside each tab:**
**Find:**
```tsx
<div className="grid gap-4 md:grid-cols-2">
```

**Replace with:**
```tsx
<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
```

**The surcharge rates section** — the key-value rows with Badge:
Already fine since they're simple flex rows, but ensure the Badge doesn't force line break:
```tsx
<Badge variant="secondary" className="rounded-full shrink-0">${Number(amount).toFixed(2)}</Badge>
```

---

## 20. Settings Page — Multiple Layout Fixes

**File:** `src/app/(dashboard)/settings/page.tsx`

**Organization info grid:**
**Find:**
```tsx
<div className="grid grid-cols-2 gap-4">
```

**Replace with:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

**Billing action buttons** — they can overflow on mobile:
**Find (free plan buttons):**
```tsx
<div className="flex gap-3">
  {!isPaidPlan ? (
    <>
      <Button size="sm" className="bg-[#0B4228]...
```

**Replace with:**
```tsx
<div className="flex flex-col sm:flex-row gap-3">
  {!isPaidPlan ? (
    <>
      <Button size="sm" className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm"
```

Both upgrade buttons should get `w-full sm:w-auto` and `text-xs sm:text-sm` so the "$99/mo" text doesn't overflow on narrow screens.

**Webhook URL code block** — overflows on mobile:
**Find:**
```tsx
<code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono">
```

**Replace with:**
```tsx
<code className="flex-1 rounded-xl bg-[#F5F6F8] px-3 py-2 text-[10px] sm:text-xs font-mono break-all">
```

The `break-all` ensures the long URL wraps instead of overflowing.

**Default preferences grid:**
**Find:**
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
```

This is already responsive — good. But the Save Preferences button:
```tsx
<Button className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full ... w-full sm:w-auto"
```

**Danger zone** — the flex row with description + delete button:
**Find:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm font-medium">Delete Organization</p>
```

**Replace with:**
```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p className="text-sm font-medium">Delete Organization</p>
```

---

## 21. CSV Import Dialog — Mobile Friendliness

**File:** `src/components/items/csv-import-dialog.tsx`

The dialog needs max-height and scroll on mobile. Find the DialogContent and add:
```tsx
<DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
```

If there's a preview table inside, wrap it in `<div className="overflow-x-auto">`.

---

## 22. Auth Pages — Small Screen Polish

**Files:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

The Card uses `max-w-md` which is fine, but on phones under 375px the card hits the edges. The auth layout needs horizontal padding.

**Find in auth layout:**
```tsx
<div className="flex min-h-screen items-center justify-center bg-[#E8EAED]">
```

**Replace with:**
```tsx
<div className="flex min-h-screen items-center justify-center bg-[#E8EAED] px-4">
```

---

## 23. Sidebar — Viewport Height Safety

**File:** `src/components/layout/sidebar.tsx`

On shorter laptops the upgrade box at the bottom can get cut off. Add overflow scroll to the nav area.

**Find:**
```tsx
<div className="flex-1 space-y-8">
```

**Replace with:**
```tsx
<div className="flex-1 space-y-8 overflow-y-auto">
```

---

## 24. Header — Touch Target Sizing

**File:** `src/components/layout/header.tsx`

The mobile menu button and avatar are fine at 8x8/w-8, but ensure the Sheet trigger has good touch area:

**Find:**
```tsx
<Button variant="ghost" size="icon" className="md:hidden">
  <List size={20} />
</Button>
```

**Replace with:**
```tsx
<Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
  <List size={20} />
</Button>
```

---

## 25. All Page Titles — Consistent Responsive Sizing

Apply this pattern to EVERY page that has a title `text-2xl`:

```tsx
<h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
```

Affected files:
- `src/app/(dashboard)/optimize/page.tsx` — "Optimize Packing"
- `src/app/(dashboard)/api-keys/page.tsx` — "API Keys"
- `src/app/(dashboard)/settings/page.tsx` — "Settings"
- `src/app/(dashboard)/carrier-rules/page.tsx` — "Carrier Rules"

Pages that use `text-lg` for titles (Items, Boxes) are already fine.

---

## 26. Global — Card Border Radius on Mobile

Every `rounded-3xl` card (1.5rem = 24px) looks oversized on mobile. This is a bulk fix:

Do a global search-and-replace in the following files ONLY (not in ui/ components):

**In all files within `src/app/(dashboard)/` and `src/components/`:**

Find: `rounded-3xl` on Card wrappers and custom divs (NOT buttons, NOT badges)
Replace with: `rounded-2xl sm:rounded-3xl`

This gives 16px radius on mobile (clean, tight) and 24px on tablet+ (spacious, premium).

Apply to these specific elements:
- All `<Card className="rounded-3xl ...">` usages
- All custom card divs like `<div className="bg-white rounded-3xl ...">` and `<div className="bg-[#0B4228] rounded-3xl ...">`
- The sidebar upgrade box
- Table wrapper divs

Do NOT change `rounded-3xl` on these:
- `<nav>` pills in sidebar (keep `rounded-full`)
- Buttons (keep `rounded-full`)
- Badges (keep `rounded-full`)

---

## 27. Global — Button Sizing Consistency

Ensure all primary action buttons have minimum touch targets and don't overflow their containers:

In every file where a primary button exists, add `min-h-[44px]` to ensure touch accessibility:

```tsx
className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 min-h-[44px] px-5 sm:px-6"
```

This applies to:
- "Add Item" / "Add Box Type" buttons
- "Run Optimization" button
- "Create Key" button
- "Save Preferences" button
- Auth form submit buttons (already full-width, so just add `min-h-[44px]`)

---

## Verification Checklist

After applying all changes, test at these viewport widths:

1. **320px** (iPhone SE) — nothing overflows, text truncates, grids are 1-2 col
2. **375px** (iPhone 14) — comfortable spacing, all buttons tappable
3. **768px** (iPad) — sidebar hidden, content uses full width
4. **1024px** (iPad landscape) — sidebar visible, content shifts right
5. **1440px** (desktop) — full layout, max breathing room

Run:
```bash
npm run build
```

Must pass with zero errors.
