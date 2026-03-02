# PackOptimize — Landing Page + Profile Page

## Context

The app has no landing page (visitors hit `/login` directly) and no profile page (the header dropdown "Profile" button does nothing). This prompt adds both.

**Design direction for the landing page:** Premium logistics SaaS — not a playful startup page, not a gradient-blob AI template. Think Flexport meets Linear. Clean typography with aggressive weight contrast, pine-900 as the dominant authority color, neon-500 used sparingly for emphasis, generous whitespace, real value propositions backed by specific numbers, and a product-forward hero that shows the actual UI rather than abstract illustrations.

Apply every file exactly as written. Do NOT change types, hooks, API, or state logic.

---

## PART A: LANDING PAGE

### A1. Create `src/app/page.tsx`

This is the root route `/`. It's a server component that renders the full marketing page.

```tsx
import Link from "next/link";
import {
  Cube,
  Intersect,
  ArrowRight,
  Package,
  ChartLineUp,
  ShieldCheck,
  Truck,
  Lightning,
  Code,
  ShoppingCart,
  Check,
  CaretRight,
  ArrowUpRight,
  Quotes,
} from "@phosphor-icons/react/dist/ssr";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] antialiased overflow-x-hidden">
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B4228]">
              <Intersect size={18} weight="bold" className="text-[#91E440]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0B4228]">
              PackOptimize
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[#8B95A5] transition-colors hover:text-[#0B4228]">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[#8B95A5] transition-colors hover:text-[#0B4228]">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-[#8B95A5] transition-colors hover:text-[#0B4228]">Pricing</a>
            <a href="#integrations" className="text-sm font-medium text-[#8B95A5] transition-colors hover:text-[#0B4228]">Integrations</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#0B4228] transition-colors hover:text-[#115C3A] sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
            >
              Start Free
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #E8EAED 1px, transparent 1px), linear-gradient(to bottom, #E8EAED 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom, white 40%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, white 40%, transparent)",
          }}
        />

        <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0B4228]/10 bg-[#0B4228]/[0.03] px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#91E440] animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-[#0B4228]">
                3D bin-packing intelligence for modern warehouses
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0B4228] sm:text-5xl lg:text-6xl">
              Stop overpaying{" "}
              <br className="hidden sm:block" />
              for shipping boxes
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#8B95A5] sm:text-lg">
              PackOptimize uses 3D bin-packing algorithms to fit your items into the smallest
              possible boxes — cutting DIM weight, dodging carrier surcharges, and saving 15–40%
              on every shipment.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0B4228] px-7 text-sm font-bold text-white shadow-[0_20px_40px_-10px_rgba(11,66,40,0.2)] transition-all hover:bg-[#115C3A] hover:shadow-[0_20px_40px_-10px_rgba(11,66,40,0.3)] active:scale-[0.97] sm:w-auto"
              >
                Get Started — It&apos;s Free
                <ArrowRight size={16} weight="bold" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E8EAED] bg-white px-7 text-sm font-semibold text-[#0B4228] transition-all hover:border-[#0B4228]/20 hover:bg-[#F5F6F8] sm:w-auto"
              >
                See how it works
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-6 text-xs text-[#8B95A5]">
              No credit card required · 1,000 free optimizations/mo · Cancel anytime
            </p>
          </div>

          {/* Product screenshot area */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="rounded-2xl border border-gray-200 bg-[#F5F6F8] p-2 shadow-[0_40px_80px_-20px_rgba(11,66,40,0.12)] sm:rounded-3xl sm:p-3">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-white sm:rounded-2xl">
                {/* Placeholder for actual product screenshot */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#F5F6F8] to-white">
                  {/* Mock dashboard preview */}
                  <div className="flex w-full max-w-2xl gap-4 px-8">
                    {/* KPI card mock */}
                    <div className="flex-1 rounded-2xl bg-[#0B4228] p-5 text-white">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">Total Savings</p>
                      <p className="mt-1.5 text-2xl font-bold">$12,847</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#91E440]">
                        <ChartLineUp size={10} /> +34.2% this month
                      </div>
                    </div>
                    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#8B95A5]">Runs Today</p>
                      <p className="mt-1.5 text-2xl font-bold text-[#0B4228]">247</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#91E440]">
                        <ChartLineUp size={10} /> +18 vs yesterday
                      </div>
                    </div>
                    <div className="hidden flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:block">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#8B95A5]">DIM Reduction</p>
                      <p className="mt-1.5 text-2xl font-bold text-[#0B4228]">38%</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#91E440]">
                        <ChartLineUp size={10} /> avg per shipment
                      </div>
                    </div>
                  </div>
                  {/* 3D packing illustration mock */}
                  <div className="flex w-full max-w-2xl gap-3 px-8">
                    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Cube size={16} className="text-[#0B4228]" />
                        <span className="text-xs font-semibold text-[#0B4228]">3D Packing View</span>
                      </div>
                      <div className="h-28 rounded-xl bg-[#F5F6F8] flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="h-8 w-8 rounded bg-[#0B4228]/80" />
                          <div className="h-8 w-12 rounded bg-[#91E440]/60" />
                          <div className="h-8 w-6 rounded bg-[#0B4228]/40" />
                          <div className="h-6 w-12 rounded bg-[#91E440]/40 col-span-2" />
                          <div className="h-6 w-8 rounded bg-[#0B4228]/60" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Truck size={16} className="text-[#0B4228]" />
                        <span className="text-xs font-semibold text-[#0B4228]">Carrier Comparison</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8B95A5]">FedEx Ground</span>
                          <span className="font-bold text-[#0B4228]">$8.42</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8B95A5]">UPS Ground</span>
                          <span className="font-bold text-[#0B4228]">$9.18</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#91E440]/10 px-2 py-1 text-xs">
                          <span className="font-semibold text-[#0B4228]">USPS Priority</span>
                          <span className="font-bold text-[#0B4228]">$6.95 ✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative shadow */}
            <div className="absolute -bottom-4 left-8 right-8 -z-10 h-12 rounded-3xl bg-[#0B4228]/5 blur-2xl" />
          </div>
        </div>
      </section>

      {/* ===== METRICS BAR ===== */}
      <section className="border-y border-gray-100 bg-[#FAFBFC]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4 sm:px-8 sm:py-12">
          {[
            { value: "38%", label: "Avg DIM weight reduction" },
            { value: "$4.20", label: "Avg saved per shipment" },
            { value: "< 200ms", label: "Optimization response time" },
            { value: "99.9%", label: "API uptime SLA" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-[#0B4228] sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-[#8B95A5] sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#91E440]">Features</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B4228] sm:text-4xl">
            Everything you need to ship smarter
          </h2>
          <p className="mt-4 text-base text-[#8B95A5]">
            One platform to optimize box selection, avoid carrier surcharges, and reduce your shipping spend.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Cube,
              title: "3D Bin-Packing",
              desc: "Advanced algorithms find the optimal box for any combination of items, respecting fragility, rotation, and weight constraints.",
            },
            {
              icon: Truck,
              title: "Carrier Surcharge Avoidance",
              desc: "Automatically checks FedEx, UPS, and USPS Additional Handling and Oversize thresholds before you ship.",
            },
            {
              icon: ChartLineUp,
              title: "Savings Analytics",
              desc: "Track cumulative savings, DIM weight reduction, and cost-per-shipment trends on a real-time dashboard.",
            },
            {
              icon: Lightning,
              title: "Sub-200ms API",
              desc: "REST API returns packing results in under 200 milliseconds. Fast enough for checkout-time optimization.",
            },
            {
              icon: ShieldCheck,
              title: "Flat Rate Detection",
              desc: "Compares custom box costs against USPS Priority Flat Rate options and picks the cheapest path automatically.",
            },
            {
              icon: Package,
              title: "Custom Box Library",
              desc: "Define your exact box inventory with inner/outer dimensions, costs, and weights. Activate or retire sizes anytime.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F6F8] text-[#0B4228] transition-colors group-hover:bg-[#0B4228] group-hover:text-[#91E440]">
                <feature.icon size={22} />
              </div>
              <h3 className="text-base font-bold text-[#0B4228]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8B95A5]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="bg-[#0B4228]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#91E440]">How It Works</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Three steps to smaller boxes
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Define your catalog",
                desc: "Add your items (dimensions, weight, fragility) and box inventory. Import via CSV or enter manually.",
              },
              {
                step: "02",
                title: "Run optimization",
                desc: "Select items for a shipment and hit Run. Our 3D packing engine finds the optimal box and arrangement in < 200ms.",
              },
              {
                step: "03",
                title: "Ship and save",
                desc: "Get a visual 3D packing layout, carrier cost comparison, and surcharge warnings. Ship with confidence.",
              },
            ].map((step) => (
              <div key={step.step} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
                <span className="text-4xl font-extrabold text-[#91E440]/20">{step.step}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#91E440]">Trusted</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B4228] sm:text-4xl">
            Warehouses ship smarter with PackOptimize
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              quote: "We reduced our average shipment cost by 22% in the first month. The surcharge detection alone paid for itself.",
              name: "Sarah Kim",
              role: "Ops Manager, GreenLeaf Goods",
            },
            {
              quote: "The API integration with our WMS took 30 minutes. Now every order gets optimized at checkout automatically.",
              name: "Marcus Chen",
              role: "CTO, BoxDrop Fulfillment",
            },
            {
              quote: "We were using boxes two sizes too large on 40% of shipments. PackOptimize showed us that on day one.",
              name: "Priya Mehta",
              role: "Supply Chain Lead, Artisan Direct",
            },
          ].map((testimonial) => (
            <div key={testimonial.name} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Quotes size={24} className="text-[#E8EAED]" weight="fill" />
              <p className="mt-3 text-sm leading-relaxed text-[#111827]">{testimonial.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F6F8] text-xs font-bold text-[#0B4228]">
                  {testimonial.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B4228]">{testimonial.name}</p>
                  <p className="text-xs text-[#8B95A5]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="border-t border-gray-100 bg-[#FAFBFC]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#91E440]">Pricing</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B4228] sm:text-4xl">
              Simple, predictable pricing
            </h2>
            <p className="mt-4 text-base text-[#8B95A5]">
              Start free. Upgrade when you need more volume.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-[#8B95A5]">Free</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#0B4228]">$0</span>
                <span className="text-sm text-[#8B95A5]">/mo</span>
              </div>
              <p className="mt-3 text-sm text-[#8B95A5]">
                For small shops exploring optimization.
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-[#111827]">
                {["1,000 optimizations/mo", "10 box types", "10 items", "Dashboard analytics", "Community support"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-[#91E440]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex h-11 items-center justify-center rounded-full border border-[#E8EAED] text-sm font-semibold text-[#0B4228] transition-all hover:border-[#0B4228]/20 hover:bg-[#F5F6F8]"
              >
                Get Started
              </Link>
            </div>

            {/* Growth — highlighted */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#0B4228] bg-white p-7 shadow-[0_20px_40px_-10px_rgba(11,66,40,0.12)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#91E440] px-4 py-1 text-xs font-bold text-[#0B4228]">
                Most Popular
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#0B4228]">Growth</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#0B4228]">$49</span>
                <span className="text-sm text-[#8B95A5]">/mo</span>
              </div>
              <p className="mt-3 text-sm text-[#8B95A5]">
                For growing warehouses with daily volume.
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-[#111827]">
                {[
                  "10,000 optimizations/mo",
                  "Unlimited box types",
                  "Unlimited items",
                  "REST API access",
                  "Carrier rule engine",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-[#91E440]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex h-11 items-center justify-center rounded-full bg-[#0B4228] text-sm font-bold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-[#8B95A5]">Enterprise</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#0B4228]">Custom</span>
              </div>
              <p className="mt-3 text-sm text-[#8B95A5]">
                For high-volume fulfillment operations.
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-[#111827]">
                {[
                  "Unlimited optimizations",
                  "Custom SLA",
                  "Dedicated API endpoints",
                  "Shopify + WMS integration",
                  "Onboarding & training",
                  "Account manager",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-[#91E440]" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:sales@packoptimize.com"
                className="mt-8 flex h-11 items-center justify-center rounded-full border border-[#E8EAED] text-sm font-semibold text-[#0B4228] transition-all hover:border-[#0B4228]/20 hover:bg-[#F5F6F8]"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section id="integrations" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#91E440]">Integrations</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B4228] sm:text-4xl">
              Fits into your existing workflow
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#8B95A5]">
              Connect PackOptimize to your Shopify store for automatic order optimization at checkout,
              or integrate directly via our REST API into any WMS, ERP, or fulfillment platform.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: ShoppingCart,
                  title: "Shopify",
                  desc: "One-click install. Auto-optimize every order at checkout.",
                },
                {
                  icon: Code,
                  title: "REST API",
                  desc: "Full API with key management, permissions, and usage tracking.",
                },
                {
                  icon: Package,
                  title: "CSV Import",
                  desc: "Bulk-import your item catalog and box inventory in seconds.",
                },
              ].map((integration) => (
                <div key={integration.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F6F8] text-[#0B4228]">
                    <integration.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B4228]">{integration.title}</h3>
                    <p className="mt-0.5 text-sm text-[#8B95A5]">{integration.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code snippet preview */}
          <div className="rounded-2xl border border-gray-200 bg-[#0B4228] p-6 shadow-lg sm:rounded-3xl sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
              <span className="ml-3 text-xs text-white/40">optimize.ts</span>
            </div>
            <pre className="overflow-x-auto text-xs leading-relaxed text-white/80 sm:text-sm">
              <code>{`const result = await fetch(
  "https://api.packoptimize.com/v1/optimize",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer pk_live_...",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        { sku: "MUG-01", qty: 3 },
        { sku: "PLATE-LG", qty: 1 },
      ],
      carrier: "FEDEX",
    }),
  }
);

// → { box: "MED-12x10x8", cost: "$6.42",
//     savings: "$3.18", dimWeight: "4.2 lbs" }`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-[#0B4228]">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start saving on every shipment
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/60">
            Set up your box inventory and item catalog in minutes. Your first 1,000 optimizations are free — no credit card needed.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#91E440] px-7 text-sm font-bold text-[#0B4228] shadow-lg transition-all hover:bg-[#A4EA5A] active:scale-[0.97] sm:w-auto"
            >
              Create Free Account
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition-all hover:bg-white/5 sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B4228]">
                  <Intersect size={18} weight="bold" className="text-[#91E440]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[#0B4228]">PackOptimize</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-[#8B95A5]">
                3D bin-packing intelligence for warehouses that refuse to overpay for shipping.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B95A5]">Product</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#features" className="text-[#111827] hover:text-[#0B4228]">Features</a></li>
                <li><a href="#pricing" className="text-[#111827] hover:text-[#0B4228]">Pricing</a></li>
                <li><a href="#integrations" className="text-[#111827] hover:text-[#0B4228]">Integrations</a></li>
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">API Docs</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B95A5]">Company</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">About</a></li>
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">Blog</a></li>
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">Changelog</a></li>
                <li><a href="mailto:support@packoptimize.com" className="text-[#111827] hover:text-[#0B4228]">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B95A5]">Legal</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">Privacy Policy</a></li>
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">Terms of Service</a></li>
                <li><a href="#" className="text-[#111827] hover:text-[#0B4228]">DPA</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            <p className="text-xs text-[#8B95A5]">
              © {new Date().getFullYear()} PackOptimize. All rights reserved.
            </p>
            <div className="flex gap-5 text-[#8B95A5]">
              <a href="#" className="transition-colors hover:text-[#0B4228]" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="transition-colors hover:text-[#0B4228]" aria-label="GitHub">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              </a>
              <a href="#" className="transition-colors hover:text-[#0B4228]" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

**NOTE:** This file uses server-component Phosphor icon imports (`@phosphor-icons/react/dist/ssr`). If the project doesn't have this path available, change all icon imports to use the standard client-side import and add `"use client";` at the top of the file.

### A2. Update root redirect (if one exists)

Check if there's a redirect in `next.config.js` or middleware that sends `/` → `/login`. If so, remove it — the landing page is now at `/`.

---

## PART B: PROFILE PAGE

### B1. Create `src/app/(dashboard)/profile/page.tsx`

User-level page covering: personal info display, password change, notification preferences, and session info.

```tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  EnvelopeSimple,
  Lock,
  Bell,
  ShieldCheck,
  SignOut,
  Eye,
  EyeSlash,
  Check,
  Buildings,
  DeviceMobile,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Notification preferences (local state — wire to API when backend supports it)
  const [emailOptimizations, setEmailOptimizations] = useState(true);
  const [emailBilling, setEmailBilling] = useState(true);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(false);

  const changePassword = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.put("/auth/password", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: () => {
      toast.error("Failed to update password. Check your current password.");
    },
  });

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const roleBadgeColor =
    user?.role === "OWNER"
      ? "bg-[#91E440] text-[#0B4228]"
      : user?.role === "ADMIN"
      ? "bg-[#0B4228] text-white"
      : "bg-[#E8EAED] text-[#8B95A5]";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0B4228]">Profile</h2>
        <p className="text-sm text-[#8B95A5]">
          Manage your personal account settings
        </p>
      </div>

      {/* ===== USER INFO ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <User size={18} /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar + name area */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B4228] text-xl font-bold text-[#91E440] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#0B4228] truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={`rounded-full text-[10px] font-bold px-2.5 py-0.5 ${roleBadgeColor}`}>
                  {user?.role}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-[#8B95A5]">
                  <Buildings size={12} />
                  {user?.tenantName}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info rows */}
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-[#8B95A5] w-32 shrink-0 text-sm">Email</Label>
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <EnvelopeSimple size={14} className="text-[#8B95A5]" />
                {user?.email}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-[#8B95A5] w-32 shrink-0 text-sm">User ID</Label>
              <code className="text-xs font-mono text-[#8B95A5] bg-[#F5F6F8] px-2 py-1 rounded-lg break-all">
                {user?.id}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-[#8B95A5] w-32 shrink-0 text-sm">Tenant ID</Label>
              <code className="text-xs font-mono text-[#8B95A5] bg-[#F5F6F8] px-2 py-1 rounded-lg break-all">
                {user?.tenantId}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== CHANGE PASSWORD ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Lock size={18} /> Change Password
          </CardTitle>
          <CardDescription className="text-[#8B95A5]">
            Update your password. You&apos;ll need your current password to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-[#8B95A5]">Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl bg-[#F5F6F8] border-gray-200 pr-10 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B95A5] hover:text-[#0B4228] transition-colors"
              >
                {showPasswords ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-[#8B95A5]">New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[#8B95A5]">Confirm New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords don&apos;t match</p>
          )}

          <Button
            onClick={handlePasswordSubmit}
            disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
            className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full text-sm font-semibold px-6"
          >
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* ===== NOTIFICATION PREFERENCES ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Bell size={18} /> Notifications
          </CardTitle>
          <CardDescription className="text-[#8B95A5]">
            Choose which email notifications you receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Optimization alerts</p>
              <p className="text-xs text-[#8B95A5]">Get notified when an optimization run completes</p>
            </div>
            <Switch
              checked={emailOptimizations}
              onCheckedChange={setEmailOptimizations}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Billing updates</p>
              <p className="text-xs text-[#8B95A5]">Invoices, payment confirmations, and usage warnings</p>
            </div>
            <Switch
              checked={emailBilling}
              onCheckedChange={setEmailBilling}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Weekly savings report</p>
              <p className="text-xs text-[#8B95A5]">Summary of your weekly shipping savings</p>
            </div>
            <Switch
              checked={emailWeeklyReport}
              onCheckedChange={setEmailWeeklyReport}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== SECURITY ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <ShieldCheck size={18} /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Active session</p>
              <p className="text-xs text-[#8B95A5] flex items-center gap-1 mt-0.5">
                <DeviceMobile size={12} /> Current browser · Signed in now
              </p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="rounded-full text-sm font-semibold w-full sm:w-auto"
            >
              <SignOut size={14} className="mr-1.5" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### B2. Wire the header "Profile" button

In `src/components/layout/header.tsx`, the dropdown currently has:

```tsx
<DropdownMenuItem onClick={() => {}}>
  <User size={16} className="mr-2" />
  Profile
</DropdownMenuItem>
```

**Replace with:**

```tsx
<DropdownMenuItem onClick={() => router.push("/profile")}>
  <User size={16} className="mr-2" />
  Profile
</DropdownMenuItem>
```

Add `useRouter` import at top:
```tsx
import { usePathname, useRouter } from "next/navigation";
```

And inside the component function:
```tsx
const router = useRouter();
```

### B3. Add Profile to sidebar nav

In `src/components/layout/sidebar.tsx`, add Profile under the Reference section items (before Settings):

```tsx
{ href: "/profile", icon: User, label: "Profile" },
```

Import `User` from `@phosphor-icons/react` at the top if not already imported.

---

## VERIFICATION

```bash
npm run build
```

Must pass with zero errors.

Test:
1. Visit `/` — full landing page loads, nav links work, CTAs link to `/register` and `/login`
2. Sign in → go to `/profile` — all user info displays, password form validates, notification toggles work
3. Header dropdown → "Profile" navigates to `/profile`
4. Sidebar shows Profile link
5. Mobile: landing page is responsive (hero stacks, features 1-col, pricing stacks, footer stacks)
6. Mobile: profile page cards are full-width with proper padding
