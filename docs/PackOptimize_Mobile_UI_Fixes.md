# PackOptimize — Mobile Interface & Responsive Fixes

## Context

The UI kit specifies a completely different mobile experience from desktop. Mobile is NOT "responsive desktop" — it has its own layout pattern:

- **Floating bottom nav** (pine-900 pill with 4 icon buttons) replaces the sidebar
- **Greeting-style header** ("Hello" + user name + avatar + search bar) replaces the desktop header bar
- **Card-based lists** replace tables on mobile
- **Compact metric cards** (2-col grid, smaller padding/text) replace the large KPI cards
- **All content** has bottom padding to clear the floating nav

Apply every file below exactly as written. DO NOT change types, hooks, API, or state logic.

**Execution order:**
1. Create new components (MobileBottomNav, MobileHeader)
2. Update dashboard layout to switch between desktop/mobile
3. Update dashboard components with mobile variants
4. Update all page layouts for mobile spacing
5. Update tables with mobile card views
6. Apply remaining responsive fixes
7. Run `npm run build`

---

## PART A: NEW MOBILE COMPONENTS

### A1. Create `src/components/layout/mobile-bottom-nav.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SquaresFour,
  ListDashes,
  Cube,
  Gear,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/dashboard", icon: SquaresFour, label: "Home" },
  { href: "/items", icon: ListDashes, label: "Items" },
  { href: "/optimize", icon: Cube, label: "Optimize" },
  { href: "/settings", icon: Gear, label: "Settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-4 right-4 z-50 md:hidden">
      <nav className="bg-[#0B4228] rounded-[2rem] p-2 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95",
                isActive
                  ? "bg-[#91E440] text-[#0B4228] shadow-sm"
                  : "text-white/60 hover:text-white"
              )}
              aria-label={item.label}
            >
              <item.icon
                size={22}
                weight={isActive ? "fill" : "regular"}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

### A2. Create `src/components/layout/mobile-header.tsx`

```tsx
"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MagnifyingGlass } from "@phosphor-icons/react";

export function MobileHeader() {
  const user = useAuthStore((s) => s.user);

  const displayName = user?.tenantName || user?.email?.split("@")[0] || "User";
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="px-5 pt-3 pb-4 bg-white md:hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#8B95A5] text-xs">Hello</p>
          <h2 className="text-[#0B4228] font-bold text-lg">{displayName}!</h2>
        </div>
        <Avatar className="h-10 w-10 border border-gray-200">
          <AvatarFallback className="bg-[#E8EAED] text-[#0B4228] text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="relative">
        <MagnifyingGlass
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95A5]"
        />
        <input
          type="text"
          placeholder="Search items or runs..."
          className="w-full bg-[#F5F6F8] rounded-full py-2.5 pl-9 pr-4 text-xs focus:outline-none border border-transparent focus:border-[#0B4228]/20 transition-colors"
        />
      </div>
    </div>
  );
}
```

### A3. Create `src/components/dashboard/mobile-recent-runs.tsx`

This replaces the table on mobile with a card-based list matching the UI kit.

```tsx
"use client";

import { Cube, DotsThree } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { OptimizationRun } from "@/types/api";

interface MobileRecentRunsProps {
  runs: OptimizationRun[];
  isLoading: boolean;
}

export function MobileRecentRuns({ runs, isLoading }: MobileRecentRunsProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm text-[#0B4228]">Recent Optimizations</h3>
        <DotsThree size={18} className="text-[#8B95A5]" weight="bold" />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#8B95A5]">
          No runs yet. Run your first optimization.
        </p>
      ) : (
        <div className="space-y-4">
          {runs.slice(0, 5).map((run) => (
            <div key={run.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#0B4228]">
                  <Cube size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0B4228]">
                    {run.itemCount} items
                  </p>
                  <p className="text-[10px] text-[#8B95A5]">
                    {run.boxCount} box{run.boxCount !== 1 ? "es" : ""} · {run.carrier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {run.savingsAmount > 0 ? (
                  <p className="text-xs font-bold text-[#7AD427]">
                    Saved ${run.savingsAmount.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-[#8B95A5]">No savings</p>
                )}
                <p className="text-[10px] text-[#8B95A5]">
                  {formatDistanceToNow(new Date(run.createdAt), { addSuffix: false })} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### A4. Create `src/components/dashboard/mobile-kpi-cards.tsx`

Compact 2-col metric grid matching the UI kit mobile.

```tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TrendUp, TrendDown, DotsThree } from "@phosphor-icons/react";

interface MobileKpiCardsProps {
  optimizationCount: number;
  totalSavings: number;
  itemCount: number;
  boxCount: number;
  isLoading: boolean;
}

export function MobileKpiCards({
  optimizationCount,
  totalSavings,
  itemCount,
  boxCount,
  isLoading,
}: MobileKpiCardsProps) {
  const metrics = [
    { label: "Daily Savings", value: `$${totalSavings.toFixed(0)}`, trend: "+35%", up: true },
    { label: "Boxes Used", value: boxCount.toLocaleString(), trend: `${optimizationCount} runs`, up: true },
    { label: "Items", value: itemCount.toLocaleString(), trend: "In catalog", up: null },
    { label: "Optimizations", value: optimizationCount.toLocaleString(), trend: "Total", up: null },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[#8B95A5] text-[10px] font-medium">{metric.label}</p>
            <DotsThree size={14} className="text-[#8B95A5]" weight="bold" />
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <h4 className="font-bold text-[#0B4228] text-lg">{metric.value}</h4>
          )}
          {metric.up !== null ? (
            <span
              className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                metric.up ? "text-[#7AD427]" : "text-red-500"
              }`}
            >
              {metric.up ? <TrendUp size={10} /> : <TrendDown size={10} />}
              {metric.trend}
            </span>
          ) : (
            <span className="text-[10px] text-[#8B95A5] mt-1 block">{metric.trend}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### A5. Create `src/components/dashboard/mobile-alert-card.tsx`

The pine-900 savings alert card from the UI kit mobile.

```tsx
"use client";

import { CaretRight } from "@phosphor-icons/react";
import Link from "next/link";

export function MobileAlertCard() {
  return (
    <div className="bg-[#0B4228] rounded-3xl p-5 text-white relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#91E440] animate-pulse" />
        <span className="text-[#91E440] text-[10px] font-bold uppercase tracking-wider">
          Savings Alert
        </span>
      </div>
      <h3 className="text-base font-semibold leading-tight mb-3">
        Run your first optimization to start saving on shipping
      </h3>
      <Link
        href="/optimize"
        className="text-white/80 text-xs flex items-center gap-1 hover:text-white transition-colors"
      >
        Start Optimizing <CaretRight size={12} />
      </Link>
    </div>
  );
}
```

---

## PART B: UPDATE DASHBOARD LAYOUT

### B1. Replace `src/app/(dashboard)/layout.tsx`

The layout now shows desktop header + sidebar on md+, and mobile header + bottom nav on mobile.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize();
    setReady(true);
  }, [initialize]);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F6F8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4228] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      <div className="md:pl-[280px]">
        {/* Desktop header — hidden on mobile */}
        <Header />

        {/* Mobile header — visible only on mobile */}
        <MobileHeader />

        {/* Main content — extra bottom padding on mobile for floating nav */}
        <main className="px-4 py-4 sm:px-6 sm:py-5 lg:p-8 pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* Floating bottom nav — visible only on mobile */}
      <MobileBottomNav />
    </div>
  );
}
```

### B2. Update `src/components/layout/header.tsx`

Hide the desktop header on mobile since MobileHeader replaces it. Also remove the Sheet/MobileSidebar since bottom nav replaces it.

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOut, User } from "@phosphor-icons/react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/items": "Items",
  "/boxes": "Box Inventory",
  "/optimize": "Optimize",
  "/carrier-rules": "Carrier Rules",
  "/api-keys": "API Keys",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || "PackOptimize";

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-20 hidden md:flex h-14 items-center justify-between border-b border-[#E8EAED] bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <h1 className="text-lg font-bold text-[#0B4228]">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#8B95A5]">{user?.tenantName}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#E8EAED] text-[#0B4228] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-[#8B95A5]">{user?.role}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}}>
              <User size={16} className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <SignOut size={16} className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

Key change: `hidden md:flex` on the header — invisible on mobile.

---

## PART C: UPDATE DASHBOARD PAGE

### C1. Replace `src/app/(dashboard)/dashboard/page.tsx`

Desktop shows the existing KPI cards + chart + table grid. Mobile shows the alert card + compact metrics + list-style runs.

```tsx
"use client";

import { useItems } from "@/hooks/use-items";
import { useBoxes } from "@/hooks/use-boxes";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { SavingsChart } from "@/components/dashboard/savings-chart";
import { MobileAlertCard } from "@/components/dashboard/mobile-alert-card";
import { MobileKpiCards } from "@/components/dashboard/mobile-kpi-cards";
import { MobileRecentRuns } from "@/components/dashboard/mobile-recent-runs";

export default function DashboardPage() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: boxes, isLoading: boxesLoading } = useBoxes();

  const isLoading = itemsLoading || boxesLoading;

  const kpiProps = {
    optimizationCount: 0,
    totalSavings: 0,
    itemCount: items?.length ?? 0,
    boxCount: boxes?.filter((b) => b.isActive)?.length ?? boxes?.length ?? 0,
    isLoading,
  };

  return (
    <>
      {/* ===== MOBILE DASHBOARD (< md) ===== */}
      <div className="md:hidden space-y-4">
        <MobileAlertCard />
        <MobileKpiCards {...kpiProps} />
        <MobileRecentRuns runs={[]} isLoading={false} />
      </div>

      {/* ===== DESKTOP DASHBOARD (≥ md) ===== */}
      <div className="hidden md:block space-y-6">
        <KpiCards {...kpiProps} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentRuns runs={[]} isLoading={false} />
          <SavingsChart data={[]} isLoading={false} />
        </div>
      </div>
    </>
  );
}
```

---

## PART D: MOBILE-FRIENDLY TABLE ALTERNATIVES

Tables don't work on small screens. On mobile, show card-based lists instead. On desktop, show the full table.

### D1. Update `src/components/items/items-table.tsx`

Add a mobile card view. Add this component at the bottom of the file (inside the same file, before the final export or after the table component), and update the main return to switch between them.

Add this helper inside the file, after the existing `ItemsTable` function:

```tsx
function MobileItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0B4228] truncate">{item.name}</p>
          <p className="text-[11px] font-mono text-[#8B95A5]">{item.sku}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <DotsThree size={16} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil size={16} className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
              <Trash size={16} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8B95A5]">
        <span>{item.width} × {item.height} × {item.depth} mm</span>
        <span>{item.weight}g</span>
      </div>
      <div className="flex gap-1.5 mt-2">
        {item.isFragile && (
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">Fragile</span>
        )}
        {item.canRotate && (
          <span className="bg-[#91E440] text-[#0B4228] px-2 py-0.5 rounded-full text-[10px] font-bold">Rotate</span>
        )}
      </div>
    </div>
  );
}
```

Then update the `ItemsTable` return statement. Replace the existing return with:

```tsx
return (
  <div className="space-y-4">
    <div className="relative w-full sm:max-w-sm">
      <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A5]" />
      <Input
        placeholder="Search items..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="pl-10 rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
      />
    </div>

    {/* Mobile card view */}
    <div className="md:hidden space-y-3">
      {table.getRowModel().rows.length ? (
        table.getRowModel().rows.map((row) => (
          <MobileItemCard
            key={row.id}
            item={row.original}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="py-8 text-center text-sm text-[#8B95A5]">No items found.</p>
      )}
    </div>

    {/* Desktop table view */}
    <div className="hidden md:block rounded-3xl border border-gray-100 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[#8B95A5] text-sm font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-[#F5F6F8] transition-colors border-b border-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#8B95A5]">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);
```

### D2. Update `src/components/boxes/boxes-table.tsx`

Same pattern — add a mobile card view. Add this helper component:

```tsx
function MobileBoxCard({
  box,
  onEdit,
  onDelete,
}: {
  box: BoxType;
  onEdit: (box: BoxType) => void;
  onDelete: (box: BoxType) => void;
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 p-4 shadow-sm",
      !box.isActive && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E8EAED] flex items-center justify-center text-[#8B95A5] shrink-0">
            <Cube size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B4228] truncate">{box.name}</p>
            <p className="text-[11px] text-[#8B95A5]">${box.cost.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {box.isActive ? (
            <span className="bg-[#91E440] text-[#0B4228] px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span>
          ) : (
            <span className="bg-[#D1D5DB] text-[#8B95A5] px-2 py-0.5 rounded-full text-[10px] font-bold">Inactive</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DotsThree size={16} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={() => onEdit(box)}>
                <Pencil size={16} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(box)}>
                <Trash size={16} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex gap-4 text-[11px] text-[#8B95A5] mt-1">
        <span>Inner: {box.innerWidth}×{box.innerHeight}×{box.innerDepth}</span>
        <span>Max: {(box.maxWeight / 1000).toFixed(1)}kg</span>
      </div>
    </div>
  );
}
```

Import `cn` from `@/lib/utils` and `Cube` from `@phosphor-icons/react` at the top of the file.

Then update the return to show `md:hidden` card list + `hidden md:block` table, same pattern as items-table above.

---

## PART E: RESPONSIVE FIXES FOR ALL REMAINING PAGES

### E1. All page headers — stack title + buttons on mobile

Apply this pattern to these files:
- `src/app/(dashboard)/items/page.tsx`
- `src/app/(dashboard)/boxes/page.tsx`
- `src/app/(dashboard)/api-keys/page.tsx`
- `src/app/(dashboard)/optimize/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/carrier-rules/page.tsx`

**Find** (in each file):
```tsx
<div className="flex items-center justify-between">
```

**Replace with:**
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

Also reduce title size on mobile. Change any `text-2xl` heading to:
```tsx
className="text-xl sm:text-2xl font-semibold tracking-tight"
```

And change any `text-lg` heading to:
```tsx
className="text-base sm:text-lg font-semibold"
```

### E2. All form dialogs — viewport-safe sizing

Apply to ALL DialogContent across the codebase:
- `src/components/items/item-form-dialog.tsx`
- `src/components/items/csv-import-dialog.tsx`
- `src/components/boxes/box-form-dialog.tsx`
- `src/app/(dashboard)/api-keys/page.tsx` (Create Key dialog)

**Find:**
```tsx
<DialogContent className="max-w-md">
```
or
```tsx
<DialogContent>
```

**Replace with:**
```tsx
<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto">
```

This ensures dialogs never overflow the viewport on any screen size.

### E3. Form grid collapses

**In `src/components/items/item-form-dialog.tsx`:**

SKU + Name row:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

W/H/D row — keep 3 cols but tighten gap:
```tsx
<div className="grid grid-cols-3 gap-2 sm:gap-4">
```

Weight + Max Stack row:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

**In `src/components/boxes/box-form-dialog.tsx`:**

3-col grids — tighten gap:
```tsx
<div className="grid grid-cols-3 gap-2 sm:gap-4">
```

### E4. Optimize page — step indicators

**In `src/app/(dashboard)/optimize/page.tsx`:**

Step indicator wrapper:
```tsx
<div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
```

Step pills:
```tsx
className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
```

Separator:
```tsx
<Separator className={`w-4 sm:w-8 shrink-0 ${isComplete ? "bg-[#0B4228]" : "bg-[#E8EAED]"}`} />
```

### E5. Optimize page — options buttons stack on mobile

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
  <Button className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 w-full sm:w-auto" onClick={onRun} disabled={isRunning}>
    {isRunning ? "Optimizing..." : "Run Optimization"}
  </Button>
```

### E6. Item selector — mobile-friendly layout

**In `src/components/optimize/item-selector.tsx`:**

Header (search + badges):
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <Input
    placeholder="Search items..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full sm:max-w-sm rounded-full bg-[#F5F6F8] border-gray-200"
  />
  <div className="flex items-center gap-2 flex-wrap">
```

Each item row — tighter padding:
```tsx
className={`flex items-center gap-2 sm:gap-4 border-b px-3 sm:px-4 py-3 last:border-b-0 ${
```

Quantity input — compact:
```tsx
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
```

Item info — truncate:
```tsx
<p className="text-xs text-muted-foreground truncate">
```

### E7. Results summary — responsive values

**In `src/components/optimize/results-summary.tsx`:**

KPI values inside the summary cards:
```tsx
<p className="text-2xl sm:text-3xl font-bold ...">
```

Cost breakdown grid:
```tsx
<div className="grid grid-cols-2 gap-x-3 sm:gap-x-8 gap-y-1 pl-2 sm:pl-4 text-xs sm:text-sm text-[#8B95A5]">
```

### E8. 3D viewer — responsive height

**In `src/components/three/packing-viewer.tsx`:**

Canvas wrapper:
```tsx
<div className="h-[280px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8]">
```

Empty state:
```tsx
<div className="flex h-[200px] sm:h-[400px] items-center justify-center rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8] text-[#8B95A5]">
```

Loading placeholder (in optimize/page.tsx dynamic import):
```tsx
loading: () => (
  <div className="flex h-[280px] sm:h-[400px] lg:h-[500px] items-center justify-center rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8]">
    <p className="text-sm text-[#8B95A5]">Loading 3D viewer...</p>
  </div>
),
```

### E9. API keys page — table scroll + dialog fix

**In `src/app/(dashboard)/api-keys/page.tsx`:**

Wrap the Table in: `<div className="overflow-x-auto"><Table className="min-w-[600px]">...</Table></div>`

### E10. Carrier rules — tabs scroll + card grid

**In `src/app/(dashboard)/carrier-rules/page.tsx`:**

TabsList:
```tsx
<TabsList className="flex w-full overflow-x-auto scrollbar-none">
```

Card grid inside tabs:
```tsx
<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
```

### E11. Settings page — multiple mobile fixes

**In `src/app/(dashboard)/settings/page.tsx`:**

Org info grid:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

Billing action buttons:
```tsx
<div className="flex flex-col sm:flex-row gap-3">
```

Both upgrade buttons add: `w-full sm:w-auto text-xs sm:text-sm`

Webhook URL:
```tsx
<code className="flex-1 rounded-xl bg-[#F5F6F8] px-3 py-2 text-[10px] sm:text-xs font-mono break-all">
```

Danger zone row:
```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
```

### E12. Auth pages — edge padding

**In `src/app/(auth)/layout.tsx`:**

```tsx
<div className="flex min-h-screen items-center justify-center bg-[#E8EAED] px-4">
```

### E13. Savings summary card (optimize page) — responsive

**Find:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm text-muted-foreground">Naive cost (no optimization)</p>
    <p className="text-lg font-semibold">${result.naiveCost.toFixed(2)}</p>
```

**Replace with:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-xs sm:text-sm text-muted-foreground">Naive cost</p>
    <p className="text-base sm:text-lg font-semibold">${result.naiveCost.toFixed(2)}</p>
```

Same for the optimized cost side.

### E14. Flat rate comparison — stack on mobile

```tsx
<div
  key={opt.name}
  className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border p-3 gap-2 ${
```

---

## PART F: GLOBAL CARD RADIUS FIX

Every `rounded-3xl` on cards/containers is too large on small mobile screens (24px radius on a 320px-wide card looks disproportionate).

Do a find-and-replace across `src/app/(dashboard)/` and `src/components/` (NOT `src/components/ui/`):

On Card wrappers and custom card divs only:
- `rounded-3xl` → `rounded-2xl sm:rounded-3xl`

Do NOT change:
- Buttons (keep `rounded-full`)
- Badges (keep `rounded-full`)
- Sidebar nav pills (keep `rounded-full`)
- Bottom nav (keep `rounded-[2rem]`)

---

## VERIFICATION

Test at these widths:
1. **320px** — bottom nav visible, greeting header, card-based lists, 2-col compact metrics
2. **375px** — same as above, comfortable spacing
3. **768px (md breakpoint)** — switches to desktop: sidebar appears, desktop header, full tables, large KPI cards
4. **1024px+** — full desktop layout

```bash
npm run build
```

Must pass with zero errors.
