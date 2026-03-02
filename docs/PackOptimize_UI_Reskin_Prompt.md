# PackOptimize — UI Reskin Prompt (Complete Code)

## Instructions for Claude Code

Apply the new UI design system to the PackOptimize frontend. Every file below contains the COMPLETE rewritten code — replace the existing file content entirely with what's provided here. DO NOT change any file not listed. DO NOT modify types, hooks, API client, or state logic.

**Execution order:**
1. Install Phosphor icons: `npm install @phosphor-icons/react`
2. Apply each file below in the order listed
3. Run `npm run build` after every 5 files to catch errors early
4. Final verification: `npm run build` must pass clean

---

## src/app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PackOptimize",
  description: "Packaging Optimization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## src/app/globals.css

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Brand colors */
  --color-pine-900: #0B4228;
  --color-pine-800: #115C3A;
  --color-pine-700: #17754B;
  --color-pine-50: #E8F5EE;
  --color-neon-400: #A4EA5A;
  --color-neon-500: #91E440;
  --color-neon-600: #7AD427;
  --color-surface-50: #F5F6F8;
  --color-surface-100: #E8EAED;
  --color-surface-200: #D1D5DB;
  --color-text-main: #111827;
  --color-text-muted: #8B95A5;
}

:root {
  --radius: 0.75rem;
  --background: #F5F6F8;
  --foreground: #111827;
  --card: #FFFFFF;
  --card-foreground: #111827;
  --popover: #FFFFFF;
  --popover-foreground: #111827;
  --primary: #0B4228;
  --primary-foreground: #FFFFFF;
  --secondary: #F5F6F8;
  --secondary-foreground: #111827;
  --muted: #F5F6F8;
  --muted-foreground: #8B95A5;
  --accent: #F5F6F8;
  --accent-foreground: #111827;
  --destructive: #EF4444;
  --border: #E8EAED;
  --input: #E8EAED;
  --ring: #0B4228;
  --chart-1: #0B4228;
  --chart-2: #91E440;
  --chart-3: #17754B;
  --chart-4: #A4EA5A;
  --chart-5: #7AD427;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #111827;
  --sidebar-primary: #0B4228;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F5F6F8;
  --sidebar-accent-foreground: #111827;
  --sidebar-border: #E8EAED;
  --sidebar-ring: #0B4228;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
```

---

## src/app/(auth)/layout.tsx

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E8EAED]">
      {children}
    </div>
  );
}
```

---

## src/app/(auth)/login/page.tsx

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Intersect, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password, tenantSlug });
      toast.success("Logged in successfully");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Login failed";
      toast.error(message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B4228]">
          <Intersect size={24} className="text-[#91E440]" weight="bold" />
        </div>
        <CardTitle className="text-2xl text-[#0B4228]">Sign in to PackOptimize</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Tenant</Label>
            <Input
              id="tenantSlug"
              placeholder="your-company-slug"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              required
              className="rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
            />
          </div>
          <Button type="submit" className="w-full bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300" disabled={loading}>
            {loading && <SpinnerGap size={16} className="mr-2 animate-spin" />}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#0B4228] hover:underline">
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## src/app/(auth)/register/page.tsx

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Intersect, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  tenantName: z.string().min(2, "Tenant name must be at least 2 characters"),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    tenantName: "",
    tenantSlug: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const updateField = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    if (field === "tenantName") {
      updated.tenantSlug = generateSlug(value);
    }
    setFormData(updated);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await register({
        tenantName: formData.tenantName,
        tenantSlug: formData.tenantSlug,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Account created successfully");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Registration failed";
      toast.error(message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]";

  return (
    <Card className="w-full max-w-md rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B4228]">
          <Intersect size={24} className="text-[#91E440]" weight="bold" />
        </div>
        <CardTitle className="text-2xl text-[#0B4228]">Create your account</CardTitle>
        <CardDescription>
          Start optimizing your packaging today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Company Name</Label>
            <Input id="tenantName" placeholder="Acme Corp" value={formData.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} className={inputCls} />
            {errors.tenantName && <p className="text-sm text-destructive">{errors.tenantName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Company Slug</Label>
            <Input id="tenantSlug" placeholder="acme-corp" value={formData.tenantSlug} onChange={(e) => updateField("tenantSlug", e.target.value)} className={inputCls} />
            {errors.tenantSlug && <p className="text-sm text-destructive">{errors.tenantSlug}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@company.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className={inputCls} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Min 8 characters" value={formData.password} onChange={(e) => updateField("password", e.target.value)} className={inputCls} />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} className={inputCls} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" className="w-full bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300" disabled={loading}>
            {loading && <SpinnerGap size={16} className="mr-2 animate-spin" />}
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#0B4228] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## src/app/(dashboard)/layout.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

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
      <Sidebar />
      <div className="md:pl-[280px]">
        <Header />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
```

---

## src/components/layout/sidebar.tsx

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SquaresFour,
  Cube,
  ListDashes,
  Package,
  Books,
  Key,
  Gear,
  Intersect,
} from "@phosphor-icons/react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/optimize", label: "Optimize", icon: Cube },
  { href: "/items", label: "Items", icon: ListDashes },
  { href: "/boxes", label: "Boxes", icon: Package },
];

const referenceItems = [
  { href: "/carrier-rules", label: "Carrier Rules", icon: Books },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/settings", label: "Settings", icon: Gear },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderNav = (items: typeof menuItems) =>
    items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors",
            isActive
              ? "bg-[#0B4228] text-white shadow-md"
              : "text-[#8B95A5] hover:text-[#0B4228] hover:bg-[#F5F6F8]"
          )}
        >
          <item.icon size={18} weight={isActive ? "fill" : "regular"} className={isActive ? "text-[#91E440]" : ""} />
          {item.label}
        </Link>
      );
    });

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[280px] bg-white border-r border-[#E8EAED] md:flex md:flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-10 h-10 bg-[#0B4228] rounded-xl flex items-center justify-center">
          <Intersect size={20} className="text-[#91E440]" weight="bold" />
        </div>
        <span className="font-bold text-xl text-[#0B4228] tracking-tight">PackOpt</span>
      </div>

      {/* Menu */}
      <div className="flex-1 space-y-8">
        <div>
          <p className="text-xs text-[#8B95A5] font-medium mb-4 pl-4 uppercase tracking-wider">Menu</p>
          <nav className="space-y-2">{renderNav(menuItems)}</nav>
        </div>
        <div>
          <p className="text-xs text-[#8B95A5] font-medium mb-4 pl-4 uppercase tracking-wider">Reference</p>
          <nav className="space-y-2">{renderNav(referenceItems)}</nav>
        </div>
      </div>

      {/* Upgrade Box */}
      <div className="bg-[#0B4228] rounded-3xl p-5 text-white mt-auto relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-3">
          <Intersect size={14} className="text-[#91E440]" weight="bold" />
        </div>
        <h4 className="font-bold mb-1 text-sm">Upgrade Pro</h4>
        <p className="text-white/60 text-xs mb-4 leading-relaxed">Discover the benefit of an upgraded account</p>
        <button className="w-full bg-[#115C3A] text-[#91E440] py-2 rounded-full text-xs font-bold border border-[#17754B] hover:bg-[#17754B] transition-colors">
          Upgrade $49/mo
        </button>
      </div>
    </aside>
  );
}
```

---

## src/components/layout/mobile-sidebar.tsx

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SquaresFour,
  Cube,
  ListDashes,
  Package,
  Books,
  Key,
  Gear,
  Intersect,
} from "@phosphor-icons/react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/optimize", label: "Optimize", icon: Cube },
  { href: "/items", label: "Items", icon: ListDashes },
  { href: "/boxes", label: "Boxes", icon: Package },
];

const referenceItems = [
  { href: "/carrier-rules", label: "Carrier Rules", icon: Books },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/settings", label: "Settings", icon: Gear },
];

export function MobileSidebar() {
  const pathname = usePathname();

  const renderNav = (items: typeof menuItems) =>
    items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors",
            isActive
              ? "bg-[#0B4228] text-white shadow-md"
              : "text-[#8B95A5] hover:text-[#0B4228] hover:bg-[#F5F6F8]"
          )}
        >
          <item.icon size={18} weight={isActive ? "fill" : "regular"} className={isActive ? "text-[#91E440]" : ""} />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-10 h-10 bg-[#0B4228] rounded-xl flex items-center justify-center">
          <Intersect size={20} className="text-[#91E440]" weight="bold" />
        </div>
        <span className="font-bold text-xl text-[#0B4228] tracking-tight">PackOpt</span>
      </div>
      <div className="flex-1 space-y-8">
        <div>
          <p className="text-xs text-[#8B95A5] font-medium mb-4 pl-4 uppercase tracking-wider">Menu</p>
          <nav className="space-y-2">{renderNav(menuItems)}</nav>
        </div>
        <div>
          <p className="text-xs text-[#8B95A5] font-medium mb-4 pl-4 uppercase tracking-wider">Reference</p>
          <nav className="space-y-2">{renderNav(referenceItems)}</nav>
        </div>
      </div>
    </div>
  );
}
```

---

## src/components/layout/header.tsx

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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";
import { SignOut, User, List } from "@phosphor-icons/react";

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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#E8EAED] bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <List size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-bold text-[#0B4228]">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-[#8B95A5] sm:block">
          {user?.tenantName}
        </span>
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

---

## src/components/dashboard/kpi-cards.tsx

```tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Lightning, ChartLineUp, ListDashes, Package } from "@phosphor-icons/react";

interface KpiCardsProps {
  optimizationCount: number;
  totalSavings: number;
  itemCount: number;
  boxCount: number;
  isLoading: boolean;
}

export function KpiCards({ optimizationCount, totalSavings, itemCount, boxCount, isLoading }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Primary dark card */}
      <div className="bg-[#0B4228] rounded-3xl p-6 text-white shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Lightning size={24} className="text-white" weight="fill" />
          </div>
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold shadow-sm">Active</span>
        </div>
        <p className="text-white/80 text-sm font-medium mb-1">Total Optimizations</p>
        {isLoading ? <Skeleton className="h-10 w-24 bg-white/20" /> : (
          <h3 className="text-4xl font-bold tracking-tight">{optimizationCount.toLocaleString()}</h3>
        )}
      </div>

      {/* Savings card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-[#F5F6F8] rounded-2xl flex items-center justify-center border border-gray-100">
            <ChartLineUp size={24} className="text-[#8B95A5]" />
          </div>
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold shadow-sm">Savings</span>
        </div>
        <p className="text-[#8B95A5] text-sm font-medium mb-1">Cumulative Savings</p>
        {isLoading ? <Skeleton className="h-10 w-24" /> : (
          <h3 className="text-4xl font-bold text-[#0B4228] tracking-tight">${totalSavings.toFixed(2)}</h3>
        )}
      </div>

      {/* Items card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-[#F5F6F8] rounded-2xl flex items-center justify-center border border-gray-100">
            <ListDashes size={24} className="text-[#8B95A5]" />
          </div>
        </div>
        <p className="text-[#8B95A5] text-sm font-medium mb-1">Items in Catalog</p>
        {isLoading ? <Skeleton className="h-10 w-24" /> : (
          <h3 className="text-4xl font-bold text-[#0B4228] tracking-tight">{itemCount.toLocaleString()}</h3>
        )}
      </div>

      {/* Boxes card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-[#F5F6F8] rounded-2xl flex items-center justify-center border border-gray-100">
            <Package size={24} className="text-[#8B95A5]" />
          </div>
        </div>
        <p className="text-[#8B95A5] text-sm font-medium mb-1">Active Box Types</p>
        {isLoading ? <Skeleton className="h-10 w-24" /> : (
          <h3 className="text-4xl font-bold text-[#0B4228] tracking-tight">{boxCount.toLocaleString()}</h3>
        )}
      </div>
    </div>
  );
}
```

---

## src/components/dashboard/savings-chart.tsx

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SavingsChartProps {
  data: { period: string; savings: number; runs: number }[];
  isLoading: boolean;
}

export function SavingsChart({ data, isLoading }: SavingsChartProps) {
  return (
    <Card className="rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader>
        <CardTitle className="text-base text-[#0B4228]">Savings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-[#8B95A5]">
              No savings data yet. Run optimizations to see your savings trend.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#8B95A5" />
              <YAxis tick={{ fontSize: 12 }} stroke="#8B95A5" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Savings"]}
                contentStyle={{ borderRadius: "16px", border: "1px solid #E8EAED" }}
              />
              <Bar dataKey="savings" fill="#0B4228" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## src/components/dashboard/recent-runs.tsx

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { OptimizationRun } from "@/types/api";

interface RecentRunsProps {
  runs: OptimizationRun[];
  isLoading: boolean;
}

export function RecentRuns({ runs, isLoading }: RecentRunsProps) {
  return (
    <Card className="rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader>
        <CardTitle className="text-base text-[#0B4228]">Recent Optimization Runs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8B95A5]">
            No optimization runs yet. Go to Optimize to run your first optimization.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Boxes</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Carrier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id} className="hover:bg-[#F5F6F8] transition-colors">
                  <TableCell className="text-sm">
                    {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{run.itemCount}</TableCell>
                  <TableCell>{run.boxCount}</TableCell>
                  <TableCell>${run.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">
                      ${run.savingsAmount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">{run.carrier}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## src/app/(dashboard)/items/page.tsx

The Items page only needs button class changes and icon swaps. Replace ONLY these specific parts in the existing file:

**Icon imports** — change:
```tsx
import { Plus, Upload } from "lucide-react";
```
to:
```tsx
import { Plus, DownloadSimple } from "@phosphor-icons/react";
```

**Import CSV button** — change:
```tsx
<Button variant="outline" onClick={() => setCsvOpen(true)}>
  <Upload className="mr-2 h-4 w-4" />
  Import CSV
</Button>
```
to:
```tsx
<Button variant="outline" onClick={() => setCsvOpen(true)} className="rounded-full border-gray-200 hover:bg-[#F5F6F8]">
  <DownloadSimple size={16} className="mr-2" />
  Import CSV
</Button>
```

**Add Item button** — change:
```tsx
<Button className="bg-blue-600 hover:bg-blue-700" ...>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```
to:
```tsx
<Button className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300" ...>
  <Plus size={16} className="mr-2" />
  Add Item
</Button>
```

Apply the same pattern to `src/app/(dashboard)/boxes/page.tsx` — swap `Plus` from lucide to phosphor, change `bg-blue-600 hover:bg-blue-700` to `bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300`.

---

## src/components/items/items-table.tsx

```tsx
"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThree, Pencil, Trash, ArrowsDownUp, MagnifyingGlass } from "@phosphor-icons/react";
import type { Item } from "@/types/api";

interface ItemsTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function ItemsTable({ items, onEdit, onDelete }: ItemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SKU
            <ArrowsDownUp size={12} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-[#0B4228]">{row.getValue("sku")}</span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowsDownUp size={12} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-[#0B4228]">{row.getValue("name")}</span>
        ),
      },
      {
        id: "dimensions",
        header: "Dimensions (mm)",
        cell: ({ row }) => {
          const item = row.original;
          return <span className="text-[#8B95A5]">{item.width} × {item.height} × {item.depth}</span>;
        },
      },
      {
        accessorKey: "weight",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Weight (g)
            <ArrowsDownUp size={12} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-[#8B95A5]">{row.getValue<number>("weight").toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "isFragile",
        header: "Fragile",
        cell: ({ row }) =>
          row.getValue("isFragile") ? (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Fragile</span>
          ) : null,
      },
      {
        accessorKey: "canRotate",
        header: "Rotate",
        cell: ({ row }) =>
          row.getValue("canRotate") ? (
            <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">Yes</span>
          ) : (
            <Badge variant="outline" className="rounded-full">No</Badge>
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <DotsThree size={16} weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(item)}
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A5]" />
        <Input
          placeholder="Search items..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
        />
      </div>
      <div className="rounded-3xl border border-gray-100 overflow-hidden bg-white">
        <Table>
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
  );
}
```

---

## src/components/items/item-form-dialog.tsx

Only class changes needed. In the existing file, make these replacements:

1. **Import** — change `import { Loader2 } from "lucide-react"` to `import { SpinnerGap } from "@phosphor-icons/react"`

2. **Submit button** — change `className="bg-blue-600 hover:bg-blue-700"` to `className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full"`

3. **Cancel button** — add `className="rounded-full"`

4. **Loader icon** — change `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` to `<SpinnerGap size={16} className="mr-2 animate-spin" />`

Apply the SAME 4 changes to `src/components/boxes/box-form-dialog.tsx`.

Additionally in `box-form-dialog.tsx`, change the calculated outer dims display:
```tsx
<div className="rounded-md bg-muted p-3">
```
to:
```tsx
<div className="rounded-2xl bg-[#F5F6F8] border border-gray-100 p-3">
```

---

## src/components/boxes/boxes-table.tsx

Apply the same search input + table styling pattern as items-table.tsx above. Additionally, add a cube icon before each box name. In the `name` column cell, replace the plain text with:

```tsx
cell: ({ row }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-[#E8EAED] flex items-center justify-center text-[#8B95A5]">
      <Cube size={18} />
    </div>
    <span className="font-semibold text-[#0B4228]">{row.getValue("name")}</span>
  </div>
),
```

Import `Cube` from `@phosphor-icons/react`. Also change the `isActive` badge column:

```tsx
cell: ({ row }) =>
  row.getValue("isActive") ? (
    <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">Active</span>
  ) : (
    <span className="bg-[#D1D5DB] text-[#8B95A5] px-3 py-1 rounded-full text-xs font-bold">Inactive</span>
  ),
```

Inactive rows should add `className="opacity-60"` on the TableRow.

---

## src/components/optimize/item-selector.tsx

Replace these classes in the existing file:

1. Selected item highlight: `bg-blue-50/50` → `bg-[#E8F5EE]/50`
2. Next button: `bg-blue-600 hover:bg-blue-700` → `bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300`
3. Summary badges: change all `variant="secondary"` Badge components to:
   `<span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">{value}</span>`
4. Search input: add `className="rounded-full bg-[#F5F6F8] border-gray-200"`
5. Fragile warning text `⚠ Fragile`: keep as-is (already red-ish)

---

## src/components/optimize/options-config.tsx

Replace these classes in the existing file:

1. All Card components: add `className="rounded-3xl border-gray-100"`
2. Run Optimization button: `className="bg-blue-600 hover:bg-blue-700"` → `className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md hover:shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] active:scale-95 transition-all duration-300"`
3. Back button: add `className="rounded-full"`

---

## src/components/optimize/results-summary.tsx

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OptimizeResponse, PackedBox } from "@/types/api";

interface ResultsSummaryProps {
  result: OptimizeResponse;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-[#0B4228] rounded-3xl p-6 text-white shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] transition-transform hover:-translate-y-1 duration-300">
          <p className="text-white/70 text-sm font-medium mb-2">Total Boxes</p>
          <p className="text-3xl font-bold">{result.totalBoxes}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <p className="text-[#8B95A5] text-sm font-medium mb-2">Total Cost</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-[#0B4228]">${result.totalCost.toFixed(2)}</p>
            {result.savingsPercent > 0 && (
              <span className="bg-[#91E440] text-[#0B4228] px-2 py-0.5 rounded-full text-xs font-bold">
                -{result.savingsPercent.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <p className="text-[#8B95A5] text-sm font-medium mb-2">Avg Utilization</p>
          <p className="text-3xl font-bold text-[#0B4228]">{(result.averageUtilization * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <p className="text-[#8B95A5] text-sm font-medium mb-2">Execution Time</p>
          <p className="text-3xl font-bold text-[#0B4228]">{result.executionTimeMs}ms</p>
        </div>
      </div>

      {/* Per-box cost breakdown */}
      <Card className="rounded-3xl border-gray-100">
        <CardHeader>
          <CardTitle className="text-base text-[#0B4228]">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.packedBoxes.map((box: PackedBox) => (
            <div key={box.boxIndex} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0B4228]">
                  Box {box.boxIndex}: {box.boxName}
                </span>
                <span className="text-sm font-bold text-[#0B4228]">${box.totalCost.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 pl-4 text-sm text-[#8B95A5]">
                <span>Box material:</span>
                <span>${box.boxMaterialCost.toFixed(2)}</span>
                <span>Actual weight:</span>
                <span>{(box.totalWeight / 1000).toFixed(2)} kg</span>
                <span>DIM weight:</span>
                <span className={box.dimWeightGrams > box.totalWeight ? "font-medium text-orange-600" : ""}>
                  {(box.dimWeightGrams / 1000).toFixed(2)} kg
                  {box.dimWeightGrams > box.totalWeight && " (billed)"}
                </span>
                <span>Billable weight:</span>
                <span>{(box.billableWeightGrams / 1000).toFixed(2)} kg</span>
                <span>Void fill ({box.voidFill.materialUsed}):</span>
                <span>${box.voidFill.fillCostUsd.toFixed(2)}</span>
                {box.surcharges.map((s, i) => (
                  <span key={i} className="col-span-2 text-red-600">
                    Surcharge: {s.type} — ${s.amount.toFixed(2)} ({s.reason})
                  </span>
                ))}
              </div>
              <Separator />
            </div>
          ))}
          <div className="flex items-center justify-between font-bold text-[#0B4228]">
            <span>Grand Total</span>
            <span>${result.totalCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## src/app/(dashboard)/optimize/page.tsx

Apply these specific changes to the existing file (do NOT rewrite the whole file — just replace these sections):

**1. Icon imports** — change:
```tsx
import { Zap, CheckCircle, AlertTriangle, Package, ArrowLeft } from "lucide-react";
```
to:
```tsx
import { Cube, CheckCircle, Warning, ListDashes, ArrowLeft } from "@phosphor-icons/react";
```

**2. STEPS array** — change:
```tsx
const STEPS = [
  { label: "Select Items", icon: Package },
  { label: "Configure", icon: Zap },
  { label: "Results", icon: CheckCircle },
];
```
to:
```tsx
const STEPS = [
  { label: "Select Items", icon: ListDashes },
  { label: "Configure", icon: Cube },
  { label: "Results", icon: CheckCircle },
];
```

**3. Step indicator classes** — change:
```tsx
isActive ? "bg-blue-600 text-white" : isComplete ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
```
to:
```tsx
isActive ? "bg-[#0B4228] text-white" : isComplete ? "bg-[#91E440]/20 text-[#0B4228]" : "bg-[#E8EAED] text-[#8B95A5]"
```

**4. Step icon** — change `<Icon className="h-3.5 w-3.5" />` to `<Icon size={14} />`

**5. Step connector** — change `isComplete ? "bg-blue-600" : "bg-muted"` to `isComplete ? "bg-[#0B4228]" : "bg-[#E8EAED]"`

**6. New Optimization button** — add `className="rounded-full"` to the existing variant="outline"

**7. All Card components in step content** — add `className="rounded-3xl border-gray-100"`

**8. Surcharge alerts** — change:
- `<AlertTriangle className="h-4 w-4" />` to `<Warning size={16} />`
- AHS class: keep `border-amber-500 bg-amber-50 text-amber-800` but add `rounded-2xl`
- Oversize class: keep `border-red-500 bg-red-50 text-red-800` but add `rounded-2xl`

**9. Pack instructions** — change:
- `<AlertTriangle className="inline h-3.5 w-3.5 mr-1" />` to `<Warning size={14} className="inline mr-1" />`
- Void fill color: `text-blue-600` → `text-[#7AD427]`

**10. Flat rate comparison** — change:
- `border-green-300 bg-green-50` → `border-[#91E440] bg-[#E8F5EE]`
- `bg-green-100 text-green-700` badge → `bg-[#91E440] text-[#0B4228] rounded-full font-bold`

**11. Savings summary card** — change:
```tsx
<Card className="border-green-200 bg-green-50/50">
```
to:
```tsx
<Card className="border-[#0B4228]/10 bg-[#E8F5EE]/50 rounded-3xl">
```
Change `text-green-700` → `text-[#7AD427]`

**12. 3D viewer loading** — change `bg-slate-50` → `bg-[#F5F6F8] rounded-3xl border border-gray-100`

---

## src/components/three/packing-viewer.tsx

Only change the container styling. In the existing file:

1. Empty state div: change `bg-slate-50` to `bg-[#F5F6F8] rounded-3xl border border-gray-100`
2. Canvas wrapper: change `bg-[#f8fafc]` to `bg-[#F5F6F8]` and `rounded-md` to `rounded-3xl`
3. Canvas style: change `borderRadius: "0.375rem"` to `borderRadius: "1.5rem"`

Leave ALL Three.js code (camera, lights, OrbitControls, grid, scenes) completely untouched.

---

## src/components/three/packed-box-scene.tsx

Only change the label text colors. In the Html label:
- `text-slate-700` → `text-[#0B4228]`
- `text-slate-500` → `text-[#8B95A5]`

---

## src/components/three/item-mesh.tsx

Only change the tooltip container class:
- `rounded-md border bg-white px-3 py-2 text-xs shadow-lg` → `rounded-2xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)]`
- `text-blue-600` (rotation) → `text-[#0B4228]`

---

## Remaining pages — search-and-replace only

For `src/app/(dashboard)/carrier-rules/page.tsx`:
- `import { Truck } from "lucide-react"` → `import { Books } from "@phosphor-icons/react"`
- `<Truck className="mr-1.5 h-3.5 w-3.5" />` → `<Books size={14} className="mr-1.5" />`
- All Card: add `className="rounded-3xl border-gray-100"`

For `src/app/(dashboard)/api-keys/page.tsx`:
- Replace all lucide imports with Phosphor equivalents (Key, Plus, Copy, Trash, Warning)
- `bg-blue-600 hover:bg-blue-700` → `bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300`
- Badge variant="secondary" for permissions → add `className="rounded-full"`
- All Card: add `rounded-3xl border-gray-100`

For `src/app/(dashboard)/settings/page.tsx`:
- Replace all lucide imports with Phosphor equivalents (Trash, CreditCard, ArrowUpRight, ShoppingCart, Copy, Check)
- ALL `bg-blue-600 hover:bg-blue-700` → `bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300`
- ALL `bg-blue-600` on Badge → `bg-[#0B4228]`
- Plan badge: add `rounded-full`
- `bg-muted` webhook code block → `bg-[#F5F6F8] rounded-xl`
- Danger zone Card: `border-red-200` → `border-red-200 rounded-3xl`
- All other Card: add `rounded-3xl border-gray-100`

---

## FINAL — Global search-and-replace checklist

After all files above are applied, do a global search across `src/` for any remaining instances of:

1. `bg-blue-600` — replace with `bg-[#0B4228]`
2. `hover:bg-blue-700` — replace with `hover:bg-[#115C3A]`
3. `text-blue-600` — replace with `text-[#0B4228]`
4. `text-blue-700` — replace with `text-[#0B4228]`
5. `bg-blue-50` — replace with `bg-[#E8F5EE]`
6. `bg-blue-100` — replace with `bg-[#E8EAED]`

Do NOT touch files in `src/components/ui/` (shadcn internals) or any `.ts` files (hooks, stores, api, types).

Then run: `npm run build`

All pages must compile with zero errors.
