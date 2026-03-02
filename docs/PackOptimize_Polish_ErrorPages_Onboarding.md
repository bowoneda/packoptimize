# PackOptimize — Error Pages, Onboarding, Empty States, API Docs, SEO & Polish

## Context

This prompt brings the app from "demo-ready" to "shippable." It covers six gaps:

1. **Error pages** — custom 404 and 500 pages (currently showing Next.js defaults)
2. **Onboarding flow** — guided setup for first-time users with empty accounts
3. **Empty states** — proper zero-states with illustrations and CTAs for every data-driven page
4. **API documentation page** — developer reference for the REST API
5. **SEO & Open Graph** — metadata for the landing page
6. **Loading skeleton consistency** — uniform loading patterns across all pages

Design system: Pine-900 (#0B4228), Neon-500 (#91E440), Surface-50 (#F5F6F8), Surface-100 (#E8EAED), Text-muted (#8B95A5). Inter font. Phosphor Icons. Rounded-full buttons, rounded-2xl/3xl cards.

Apply every file exactly as written. Do NOT change types, hooks, API, or state logic.

---

## PART 1: ERROR PAGES

### 1A. Create `src/app/not-found.tsx`

Next.js uses this for all 404s automatically.

```tsx
import Link from "next/link";
import { Intersect, MagnifyingGlass, House, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F6F8] px-5">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B4228]">
            <Intersect size={18} weight="bold" className="text-[#91E440]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0B4228]">PackOptimize</span>
        </Link>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-100">
          <MagnifyingGlass size={36} className="text-[#8B95A5]" />
        </div>

        {/* Text */}
        <h1 className="text-5xl font-extrabold text-[#0B4228]">404</h1>
        <p className="mt-2 text-lg font-semibold text-[#0B4228]">Page not found</p>
        <p className="mt-2 text-sm text-[#8B95A5]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0B4228] px-6 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            <House size={16} />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8EAED] bg-white px-6 text-sm font-semibold text-[#0B4228] transition-all hover:bg-[#F5F6F8]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 1B. Create `src/app/error.tsx`

Next.js uses this for runtime errors (500-level). Must be a client component.

```tsx
"use client";

import Link from "next/link";
import { Intersect, WarningCircle, ArrowCounterClockwise, House } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F6F8] px-5">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B4228]">
            <Intersect size={18} weight="bold" className="text-[#91E440]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0B4228]">PackOptimize</span>
        </Link>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 border border-red-100">
          <WarningCircle size={36} className="text-red-400" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold text-[#0B4228]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#8B95A5]">
          An unexpected error occurred. This has been logged and we&apos;re working on it.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs font-mono text-[#8B95A5] bg-white rounded-lg px-3 py-1.5 border border-gray-100 inline-block">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0B4228] px-6 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            <ArrowCounterClockwise size={16} />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8EAED] bg-white px-6 text-sm font-semibold text-[#0B4228] transition-all hover:bg-[#F5F6F8]"
          >
            <House size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 1C. Create `src/app/(dashboard)/error.tsx`

Dashboard-specific error boundary. Same layout but within the dashboard shell.

```tsx
"use client";

import { WarningCircle, ArrowCounterClockwise } from "@phosphor-icons/react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
        <WarningCircle size={28} className="text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-[#0B4228]">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-[#8B95A5]">
        An error occurred loading this page. Try again or go back to the dashboard.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs font-mono text-[#8B95A5] bg-white rounded-lg px-3 py-1.5 border border-gray-100">
          {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
      >
        <ArrowCounterClockwise size={14} />
        Try Again
      </button>
    </div>
  );
}
```

---

## PART 2: ONBOARDING FLOW

First-time users land on an empty dashboard with zero data. The onboarding flow detects this and guides them through setup.

### 2A. Create `src/components/onboarding/onboarding-checklist.tsx`

A persistent checklist card that appears on the dashboard when the user has incomplete setup. It tracks three milestones: add boxes, add items, run first optimization.

```tsx
"use client";

import Link from "next/link";
import {
  Package,
  Cube,
  Lightning,
  Check,
  CaretRight,
  Confetti,
} from "@phosphor-icons/react";

interface OnboardingChecklistProps {
  hasBoxes: boolean;
  hasItems: boolean;
  hasRuns: boolean;
}

const steps = [
  {
    key: "boxes" as const,
    title: "Add your box inventory",
    description: "Define the boxes you use for shipping — inner dimensions, cost, and weight.",
    href: "/boxes",
    icon: Cube,
    cta: "Add Boxes",
  },
  {
    key: "items" as const,
    title: "Add your product catalog",
    description: "Enter your items with dimensions, weight, fragility, and rotation settings.",
    href: "/items",
    icon: Package,
    cta: "Add Items",
  },
  {
    key: "optimize" as const,
    title: "Run your first optimization",
    description: "Select items, choose a carrier, and let the 3D engine find the best fit.",
    href: "/optimize",
    icon: Lightning,
    cta: "Start Optimizing",
  },
];

export function OnboardingChecklist({
  hasBoxes,
  hasItems,
  hasRuns,
}: OnboardingChecklistProps) {
  const completion: Record<string, boolean> = {
    boxes: hasBoxes,
    items: hasItems,
    optimize: hasRuns,
  };

  const completedCount = Object.values(completion).filter(Boolean).length;
  const allComplete = completedCount === 3;

  if (allComplete) return null;

  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-[#0B4228]">Get started with PackOptimize</h3>
          <p className="text-sm text-[#8B95A5] mt-0.5">
            Complete these steps to start saving on shipping.
          </p>
        </div>
        <span className="text-xs font-bold text-[#91E440] bg-[#91E440]/10 rounded-full px-2.5 py-1 shrink-0">
          {completedCount}/3
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 mb-5 h-1.5 w-full rounded-full bg-[#E8EAED] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0B4228] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isDone = completion[step.key];
          // Find the first incomplete step
          const firstIncompleteKey = steps.find((s) => !completion[s.key])?.key;
          const isCurrent = step.key === firstIncompleteKey;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                isDone
                  ? "border-[#91E440]/30 bg-[#91E440]/5"
                  : isCurrent
                  ? "border-[#0B4228]/15 bg-[#F5F6F8]"
                  : "border-gray-100 bg-white opacity-60"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isDone
                    ? "bg-[#91E440] text-[#0B4228]"
                    : isCurrent
                    ? "bg-[#0B4228] text-[#91E440]"
                    : "bg-[#E8EAED] text-[#8B95A5]"
                }`}
              >
                {isDone ? <Check size={18} weight="bold" /> : <step.icon size={18} />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isDone ? "text-[#0B4228] line-through decoration-[#91E440]" : "text-[#0B4228]"
                  }`}
                >
                  {step.title}
                </p>
                {!isDone && (
                  <p className="text-xs text-[#8B95A5] mt-0.5 hidden sm:block">{step.description}</p>
                )}
              </div>

              {/* CTA */}
              {!isDone && isCurrent && (
                <Link
                  href={step.href}
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-[#0B4228] px-4 text-xs font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97] shrink-0"
                >
                  {step.cta}
                  <CaretRight size={12} weight="bold" />
                </Link>
              )}
              {isDone && (
                <span className="text-xs font-bold text-[#91E440] shrink-0">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 2B. Update `src/app/(dashboard)/dashboard/page.tsx`

Add the onboarding checklist to the dashboard. It shows only when setup is incomplete.

**After the existing imports, add:**

```tsx
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
```

**In the return statement, add the checklist ABOVE the KPI cards (both mobile and desktop sections):**

For the **desktop section** (`hidden md:block`), insert at the top of the `space-y-6` div:

```tsx
<OnboardingChecklist
  hasBoxes={(boxes?.length ?? 0) > 0}
  hasItems={(items?.length ?? 0) > 0}
  hasRuns={false}
/>
```

For the **mobile section** (`md:hidden`), insert at the top of the `space-y-4` div (BEFORE `MobileAlertCard`):

```tsx
<OnboardingChecklist
  hasBoxes={(boxes?.length ?? 0) > 0}
  hasItems={(items?.length ?? 0) > 0}
  hasRuns={false}
/>
```

**Note:** `hasRuns` is hardcoded to `false` because runs aren't fetched on the dashboard yet. When you add a `useOptimizationRuns` hook later, wire it in.

---

## PART 3: EMPTY STATES

Replace every plain-text empty message with an illustrated, actionable empty state. Each includes an icon, headline, description, and a primary CTA.

### 3A. Create `src/components/shared/empty-state.tsx`

Reusable empty state component.

```tsx
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F6F8] border border-gray-100">
        <IconComponent size={28} className="text-[#8B95A5]" />
      </div>
      <h3 className="text-base font-bold text-[#0B4228]">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-[#8B95A5]">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            {actionLabel}
            <CaretRight size={14} weight="bold" />
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            {actionLabel}
            <CaretRight size={14} weight="bold" />
          </button>
        )
      )}
    </div>
  );
}
```

### 3B. Apply empty states to each page

Import `EmptyState` from `@/components/shared/empty-state` in each file. Then replace the current empty messages.

---

**In `src/components/dashboard/recent-runs.tsx`:**

Replace:
```tsx
<p className="py-8 text-center text-sm text-muted-foreground">
  No optimization runs yet. Go to Optimize to run your first optimization.
</p>
```

With:
```tsx
<EmptyState
  icon={Lightning}
  title="No optimization runs yet"
  description="Run your first optimization to see results here."
  actionLabel="Start Optimizing"
  actionHref="/optimize"
/>
```

Import at top: `import { Lightning } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

---

**In `src/components/dashboard/savings-chart.tsx`:**

Replace:
```tsx
<div className="flex h-[300px] items-center justify-center">
  <p className="text-sm text-muted-foreground">
    No savings data yet. Run optimizations to see your savings trend.
  </p>
</div>
```

With:
```tsx
<div className="h-[200px] sm:h-[300px]">
  <EmptyState
    icon={ChartLineUp}
    title="No savings data yet"
    description="Run optimizations to track your shipping cost savings over time."
    actionLabel="Run Optimization"
    actionHref="/optimize"
  />
</div>
```

Import at top: `import { ChartLineUp } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

---

**In `src/components/items/items-table.tsx`:**

Replace the desktop table empty state:
```tsx
<TableCell colSpan={columns.length} className="h-24 text-center">
  No items found.
</TableCell>
```

With:
```tsx
<TableCell colSpan={columns.length}>
  <EmptyState
    icon={Package}
    title="No items in your catalog"
    description="Add your first item to start optimizing shipments."
  />
</TableCell>
```

Import: `import { Package } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

Also replace the mobile card view empty state (from the Mobile UI prompt):
```tsx
<p className="py-8 text-center text-sm text-[#8B95A5]">No items found.</p>
```

With:
```tsx
<EmptyState
  icon={Package}
  title="No items in your catalog"
  description="Add your first item to start optimizing shipments."
/>
```

---

**In `src/components/boxes/boxes-table.tsx`:**

Replace:
```tsx
<TableCell colSpan={columns.length} className="h-24 text-center">
  No box types found.
</TableCell>
```

With:
```tsx
<TableCell colSpan={columns.length}>
  <EmptyState
    icon={Cube}
    title="No box types defined"
    description="Add your box inventory with dimensions and costs to start optimizing."
  />
</TableCell>
```

Import: `import { Cube } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

---

**In `src/app/(dashboard)/api-keys/page.tsx`:**

Replace:
```tsx
<div className="py-8 text-center text-muted-foreground">
  <Key className="mx-auto h-12 w-12 mb-3 opacity-50" />
  <p>No API keys yet. Create one to get started.</p>
</div>
```

With:
```tsx
<EmptyState
  icon={Key}
  title="No API keys yet"
  description="Create an API key to integrate PackOptimize with your WMS or Shopify store."
  actionLabel="Create API Key"
  onAction={() => setCreateOpen(true)}
/>
```

Import: `import { Key } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

---

**In the optimize page item selector (`src/components/optimize/item-selector.tsx`):**

Replace:
```tsx
<p>No items found. Add items first before running an optimization.</p>
```

With:
```tsx
<EmptyState
  icon={Package}
  title="No items in your catalog"
  description="Add products to your item catalog first, then come back to optimize."
  actionLabel="Add Items"
  actionHref="/items"
/>
```

Import: `import { Package } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

---

**In `src/app/(dashboard)/carrier-rules/page.tsx`:**

Replace the "No rules found" empty state:
```tsx
<CardContent className="py-8 text-center text-muted-foreground">
  No rules found for {carrierLabels[carrier]}
</CardContent>
```

With:
```tsx
<CardContent>
  <EmptyState
    icon={Truck}
    title={`No rules for ${carrierLabels[carrier]}`}
    description="Carrier rules are loaded from your API. Check your backend configuration."
  />
</CardContent>
```

Import: `import { Truck } from "@phosphor-icons/react";`
Import: `import { EmptyState } from "@/components/shared/empty-state";`

---

## PART 4: API DOCUMENTATION PAGE

A developer-facing page within the dashboard showing endpoint reference, auth info, and request/response examples.

### 4A. Create `src/app/(dashboard)/api-docs/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Key,
  Lock,
  Lightning,
  Cube,
  Package,
  Books,
  Copy,
  Check,
  CaretDown,
  CaretRight,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import Link from "next/link";

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  auth: boolean;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[method] || "bg-gray-100 text-gray-700"}`}>
      {method}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function EndpointCard({ method, path, description, requestBody, responseBody, auth }: EndpointProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full p-4 sm:p-5 text-left hover:bg-[#F5F6F8]/50 transition-colors"
      >
        <MethodBadge method={method} />
        <code className="text-sm font-semibold text-[#0B4228] font-mono">{path}</code>
        {auth && <Lock size={12} className="text-[#8B95A5]" />}
        <span className="flex-1 text-sm text-[#8B95A5] truncate hidden sm:block">{description}</span>
        {expanded ? (
          <CaretDown size={14} className="text-[#8B95A5] shrink-0" />
        ) : (
          <CaretRight size={14} className="text-[#8B95A5] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-4">
          <p className="text-sm text-[#8B95A5]">{description}</p>

          {requestBody && (
            <div>
              <p className="text-xs font-bold text-[#0B4228] mb-2 uppercase tracking-wider">Request Body</p>
              <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
                <CopyButton text={requestBody} />
                <pre className="text-xs text-white/80 leading-relaxed font-mono"><code>{requestBody}</code></pre>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-[#0B4228] mb-2 uppercase tracking-wider">Response</p>
            <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
              <CopyButton text={responseBody} />
              <pre className="text-xs text-white/80 leading-relaxed font-mono"><code>{responseBody}</code></pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const endpoints: EndpointProps[] = [
  {
    method: "POST",
    path: "/v1/optimize",
    description: "Run a packing optimization for selected items and carrier.",
    auth: true,
    requestBody: `{
  "items": [
    { "id": "item_abc123", "quantity": 3 },
    { "id": "item_def456", "quantity": 1 }
  ],
  "carrier": "FEDEX",
  "optimizeFor": "COST",
  "fillMaterial": "AIR_PILLOWS",
  "includeFlatRate": true,
  "maxBoxes": 10
}`,
    responseBody: `{
  "totalCost": 12.45,
  "naiveCost": 18.90,
  "savingsAmount": 6.45,
  "savingsPercent": 34.1,
  "packedBoxes": [
    {
      "boxId": "box_med_12x10x8",
      "boxName": "Medium 12×10×8",
      "placements": [...],
      "dimWeight": 4.2,
      "actualWeight": 3.1,
      "billedWeight": 4.2,
      "surcharges": []
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/items",
    description: "List all items in your catalog.",
    auth: true,
    responseBody: `[
  {
    "id": "item_abc123",
    "sku": "MUG-01",
    "name": "Ceramic Mug",
    "width": 100,
    "height": 95,
    "depth": 100,
    "weight": 340,
    "isFragile": true,
    "canRotate": false
  }
]`,
  },
  {
    method: "POST",
    path: "/v1/items",
    description: "Create a new item in your catalog.",
    auth: true,
    requestBody: `{
  "sku": "PLATE-LG",
  "name": "Large Dinner Plate",
  "width": 280,
  "height": 25,
  "depth": 280,
  "weight": 520,
  "isFragile": true,
  "canRotate": true,
  "maxStackWeight": 2000
}`,
    responseBody: `{
  "id": "item_ghi789",
  "sku": "PLATE-LG",
  "name": "Large Dinner Plate",
  ...
}`,
  },
  {
    method: "GET",
    path: "/v1/box-types",
    description: "List all box types in your inventory.",
    auth: true,
    responseBody: `[
  {
    "id": "box_sm_8x6x4",
    "name": "Small 8×6×4",
    "innerWidth": 203,
    "innerHeight": 152,
    "innerDepth": 102,
    "cost": 0.85,
    "isActive": true
  }
]`,
  },
  {
    method: "POST",
    path: "/v1/box-types",
    description: "Create a new box type.",
    auth: true,
    requestBody: `{
  "name": "Large 18×14×12",
  "innerWidth": 457,
  "innerHeight": 356,
  "innerDepth": 305,
  "wallThickness": 3,
  "boxWeight": 450,
  "maxWeight": 22000,
  "cost": 2.10,
  "isActive": true
}`,
    responseBody: `{
  "id": "box_lg_18x14x12",
  "name": "Large 18×14×12",
  ...
}`,
  },
  {
    method: "GET",
    path: "/v1/carrier-rules/:carrier",
    description: "Get carrier surcharge rules and size/weight limits.",
    auth: true,
    responseBody: `{
  "carrier": "FEDEX",
  "maxLength": 2743,
  "maxGirth": 3302,
  "maxWeight": 68039,
  "dimDivisor": 5000,
  "surcharges": {
    "additionalHandling": {
      "lengthThreshold": 1219,
      "widthThreshold": 762,
      "weightThreshold": 22680,
      "fee": 16.00
    },
    "oversize": {
      "lengthThreshold": 2438,
      "girthThreshold": 3048,
      "fee": 95.00
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/v1/billing/usage",
    description: "Get current billing period usage.",
    auth: true,
    responseBody: `{
  "plan": "growth",
  "optimizationsUsed": 2847,
  "optimizationsLimit": 10000,
  "periodStart": "2026-02-01T00:00:00Z",
  "periodEnd": "2026-02-28T23:59:59Z"
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0B4228]">API Documentation</h2>
        <p className="text-sm text-[#8B95A5]">
          Reference for the PackOptimize REST API. Authenticate all requests with your API key.
        </p>
      </div>

      {/* Auth section */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Key size={18} /> Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#8B95A5]">
            Include your API key in the <code className="text-xs font-mono bg-[#F5F6F8] px-1.5 py-0.5 rounded text-[#0B4228]">Authorization</code> header:
          </p>
          <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
            <CopyButton text='Authorization: Bearer pk_live_your_api_key_here' />
            <pre className="text-xs text-white/80 font-mono">
              <code>Authorization: Bearer pk_live_your_api_key_here</code>
            </pre>
          </div>
          <p className="text-xs text-[#8B95A5]">
            Create and manage API keys in{" "}
            <Link href="/api-keys" className="text-[#0B4228] font-semibold hover:underline">
              API Keys <ArrowSquareOut size={10} className="inline" />
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Books size={18} /> Base URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
            <CopyButton text="https://api.packoptimize.com" />
            <pre className="text-xs text-white/80 font-mono">
              <code>https://api.packoptimize.com</code>
            </pre>
          </div>
          <p className="text-xs text-[#8B95A5] mt-3">
            All endpoints are relative to this base URL. Responses are JSON with <code className="font-mono bg-[#F5F6F8] px-1 rounded">Content-Type: application/json</code>.
          </p>
        </CardContent>
      </Card>

      {/* Rate limits */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Lightning size={18} /> Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-[#F5F6F8] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">Free</p>
              <p className="text-lg font-bold text-[#0B4228] mt-1">100 req/min</p>
            </div>
            <div className="rounded-xl bg-[#F5F6F8] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">Growth</p>
              <p className="text-lg font-bold text-[#0B4228] mt-1">500 req/min</p>
            </div>
            <div className="rounded-xl bg-[#F5F6F8] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">Enterprise</p>
              <p className="text-lg font-bold text-[#0B4228] mt-1">Custom</p>
            </div>
          </div>
          <p className="text-xs text-[#8B95A5] mt-3">
            Rate limit headers are included in every response: <code className="font-mono bg-[#F5F6F8] px-1 rounded">X-RateLimit-Remaining</code> and <code className="font-mono bg-[#F5F6F8] px-1 rounded">X-RateLimit-Reset</code>.
          </p>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div>
        <h3 className="text-base font-bold text-[#0B4228] mb-4">Endpoints</h3>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <EndpointCard key={`${ep.method}-${ep.path}`} {...ep} />
          ))}
        </div>
      </div>

      {/* Error codes */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0B4228]">Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-[#8B95A5] font-medium text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left py-2 pr-4 text-[#8B95A5] font-medium text-xs uppercase tracking-wider">Meaning</th>
                  <th className="text-left py-2 text-[#8B95A5] font-medium text-xs uppercase tracking-wider">Resolution</th>
                </tr>
              </thead>
              <tbody className="text-[#111827]">
                {[
                  { code: "400", meaning: "Bad Request", resolution: "Check request body against the schema" },
                  { code: "401", meaning: "Unauthorized", resolution: "Include a valid API key in the Authorization header" },
                  { code: "403", meaning: "Forbidden", resolution: "Your API key lacks the required permission" },
                  { code: "404", meaning: "Not Found", resolution: "Check the resource ID or endpoint path" },
                  { code: "422", meaning: "Validation Error", resolution: "One or more fields failed validation — see response details" },
                  { code: "429", meaning: "Rate Limited", resolution: "Back off and retry after X-RateLimit-Reset" },
                  { code: "500", meaning: "Internal Error", resolution: "Retry once, then contact support if persistent" },
                ].map((err) => (
                  <tr key={err.code} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-4 font-mono font-bold text-xs">{err.code}</td>
                    <td className="py-2.5 pr-4 text-sm">{err.meaning}</td>
                    <td className="py-2.5 text-xs text-[#8B95A5]">{err.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4B. Add API Docs to sidebar nav

In `src/components/layout/sidebar.tsx`, add to the Reference nav section (after Carrier Rules, before Settings):

```tsx
{ href: "/api-docs", icon: Books, label: "API Docs" },
```

Import `Books` from `@phosphor-icons/react`.

### 4C. Add API Docs to header page titles

In `src/components/layout/header.tsx`, add to `pageTitles`:

```tsx
"/api-docs": "API Documentation",
"/profile": "Profile",
```

---

## PART 5: SEO & OPEN GRAPH

### 5A. Update `src/app/layout.tsx` with global metadata

Replace the existing `metadata` export:

```tsx
export const metadata: Metadata = {
  title: {
    default: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
    template: "%s | PackOptimize",
  },
  description:
    "Reduce DIM weight, avoid carrier surcharges, and save 15–40% on every shipment with AI-powered 3D bin-packing optimization.",
  keywords: [
    "bin packing",
    "shipping optimization",
    "DIM weight reduction",
    "3D packing",
    "carrier surcharge",
    "FedEx",
    "UPS",
    "USPS",
    "warehouse optimization",
    "packaging software",
  ],
  authors: [{ name: "PackOptimize" }],
  creator: "PackOptimize",
  metadataBase: new URL("https://packoptimize.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://packoptimize.com",
    siteName: "PackOptimize",
    title: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
    description:
      "Reduce DIM weight, avoid carrier surcharges, and save 15–40% on every shipment.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
    description:
      "Reduce DIM weight, avoid carrier surcharges, and save 15–40% on every shipment.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### 5B. Add page-level metadata to the landing page

Since `src/app/page.tsx` is a server component, add metadata export at the top of the file (before the default export):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
  description:
    "Stop overpaying for shipping boxes. PackOptimize uses 3D bin-packing algorithms to fit items into the smallest possible boxes — cutting DIM weight and saving 15–40% on every shipment.",
  alternates: {
    canonical: "https://packoptimize.com",
  },
};
```

### 5C. Add structured data (JSON-LD) to the landing page

Add this inside the top-level `<div>` in `page.tsx`, before the `<nav>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "PackOptimize",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "3D bin-packing optimization for warehouses. Reduce DIM weight and shipping costs.",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          name: "Free",
        },
        {
          "@type": "Offer",
          price: "49",
          priceCurrency: "USD",
          name: "Growth",
          billingIncrement: "P1M",
        },
      ],
    }),
  }}
/>
```

### 5D. Create OG image placeholder

Create a placeholder file at `public/og-image.png`. For now, a simple 1200×630 image. You can generate one later. Create a placeholder with a solid color:

```bash
# Run in project root
mkdir -p public
npx playwright-core install chromium 2>/dev/null || true
# If imagemagick or similar is available:
convert -size 1200x630 xc:#0B4228 -fill '#91E440' -font Inter -pointsize 48 -gravity center -annotate +0-30 'PackOptimize' -fill white -pointsize 24 -annotate +0+30 '3D Bin-Packing for Smarter Shipping' public/og-image.png 2>/dev/null || echo "Create public/og-image.png manually (1200x630)"
```

If ImageMagick isn't available, just create a `public/og-image.png` manually — any 1200×630 image with the logo and tagline.

---

## PART 6: LOADING SKELETON CONSISTENCY

Currently some pages use 5 skeletons, some use 3, some use different heights. Standardize across all pages.

### 6A. Create `src/components/shared/table-skeleton.tsx`

```tsx
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-4 px-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20 hidden sm:block" />
        <Skeleton className="h-4 w-16 hidden sm:block" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}
```

### 6B. Create `src/components/shared/card-skeleton.tsx`

```tsx
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  count?: number;
  height?: string;
}

export function CardSkeleton({ count = 4, height = "h-28" }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full rounded-2xl sm:rounded-3xl`} />
      ))}
    </div>
  );
}
```

### 6C. Apply consistent skeletons

**Items page** (`src/app/(dashboard)/items/page.tsx`):

Replace:
```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <Skeleton key={i} className="h-12 w-full" />
))}
```

With:
```tsx
<TableSkeleton rows={5} />
```

Import: `import { TableSkeleton } from "@/components/shared/table-skeleton";`
Remove the individual `Skeleton` import if it's no longer used elsewhere in the file.

---

**Boxes page** (`src/app/(dashboard)/boxes/page.tsx`):

Same replacement:
```tsx
<TableSkeleton rows={5} />
```

---

**Carrier rules page** (`src/app/(dashboard)/carrier-rules/page.tsx`):

Replace:
```tsx
{Array.from({ length: 3 }).map((_, i) => (
  <Skeleton key={i} className="h-64 w-full" />
))}
```

With:
```tsx
<TableSkeleton rows={3} />
```

---

**API keys page** (`src/app/(dashboard)/api-keys/page.tsx`):

Replace:
```tsx
{Array.from({ length: 3 }).map((_, i) => (
  <Skeleton key={i} className="h-10 w-full" />
))}
```

With:
```tsx
<TableSkeleton rows={3} />
```

---

**Optimize page item selector** (`src/components/optimize/item-selector.tsx`):

Replace:
```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <Skeleton key={i} className="h-14 w-full" />
))}
```

With:
```tsx
<TableSkeleton rows={5} />
```

---

## VERIFICATION

```bash
npm run build
```

Must pass with zero errors.

Test manually:
1. Visit `/nonexistent-route` — custom 404 page shows with PackOptimize branding
2. Dashboard with empty account — onboarding checklist appears with 3 steps, progress bar at 0%
3. Add a box → checklist updates to 1/3 with green checkmark
4. Items table with no data → icon + "No items in your catalog" + CTA
5. Boxes table with no data → icon + "No box types defined" + CTA
6. Savings chart empty → icon + "No savings data yet" + CTA
7. Recent runs empty → icon + "No optimization runs yet" + CTA
8. API keys empty → icon + "No API keys yet" + "Create API Key" button
9. Visit `/api-docs` — full endpoint reference with expandable cards, copy buttons, code blocks
10. View page source of `/` — OG tags, Twitter card tags, JSON-LD present
11. All loading states use consistent rounded-xl skeleton bars
12. Dashboard error → `error.tsx` renders with "Try Again" button
