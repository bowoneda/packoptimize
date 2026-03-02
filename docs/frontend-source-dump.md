# PackOptimize Frontend — Complete Source Dump

Generated: 2026-02-28

This file contains the complete, unabridged source code for every key frontend component in the PackOptimize web application.

---

## src/app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## src/app/providers.tsx

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

## src/app/(auth)/layout.tsx

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      {children}
    </div>
  );
}
```

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
import { PackageOpen, Loader2 } from "lucide-react";
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <PackageOpen className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Sign in to PackOptimize</CardTitle>
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
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

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
import { PackageOpen, Loader2 } from "lucide-react";
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <PackageOpen className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Start optimizing your packaging today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Company Name</Label>
            <Input
              id="tenantName"
              placeholder="Acme Corp"
              value={formData.tenantName}
              onChange={(e) => updateField("tenantName", e.target.value)}
            />
            {errors.tenantName && (
              <p className="text-sm text-destructive">{errors.tenantName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Company Slug</Label>
            <Input
              id="tenantSlug"
              placeholder="acme-corp"
              value={formData.tenantSlug}
              onChange={(e) => updateField("tenantSlug", e.target.value)}
            />
            {errors.tenantSlug && (
              <p className="text-sm text-destructive">{errors.tenantSlug}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

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
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[260px]">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

## src/components/layout/sidebar.tsx

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Box,
  Zap,
  Truck,
  Key,
  Settings,
  PackageOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/items", label: "Items", icon: Package },
  { href: "/boxes", label: "Boxes", icon: Box },
  { href: "/optimize", label: "Optimize", icon: Zap },
  { href: "/carrier-rules", label: "Carrier Rules", icon: Truck },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] border-r border-border bg-card md:block">
      <div className="flex h-14 items-center gap-2 border-b border-border px-6">
        <PackageOpen className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold tracking-tight">
          PackOptimize
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

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
import { LogOut, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";

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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:block">
          {user?.tenantName}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

## src/components/layout/mobile-sidebar.tsx

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Box,
  Zap,
  Truck,
  Key,
  Settings,
  PackageOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/items", label: "Items", icon: Package },
  { href: "/boxes", label: "Boxes", icon: Box },
  { href: "/optimize", label: "Optimize", icon: Zap },
  { href: "/carrier-rules", label: "Carrier Rules", icon: Truck },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-6">
        <PackageOpen className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold tracking-tight">
          PackOptimize
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

## src/app/(dashboard)/dashboard/page.tsx

```tsx
"use client";

import { useItems } from "@/hooks/use-items";
import { useBoxes } from "@/hooks/use-boxes";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { SavingsChart } from "@/components/dashboard/savings-chart";

export default function DashboardPage() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: boxes, isLoading: boxesLoading } = useBoxes();

  const isLoading = itemsLoading || boxesLoading;

  return (
    <div className="space-y-6">
      <KpiCards
        optimizationCount={0}
        totalSavings={0}
        itemCount={items?.length ?? 0}
        boxCount={boxes?.filter((b) => b.isActive)?.length ?? boxes?.length ?? 0}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentRuns runs={[]} isLoading={false} />
        <SavingsChart data={[]} isLoading={false} />
      </div>
    </div>
  );
}
```

## src/app/(dashboard)/items/page.tsx

```tsx
"use client";

import { useState } from "react";
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { ItemsTable } from "@/components/items/items-table";
import { ItemFormDialog } from "@/components/items/item-form-dialog";
import { CsvImportDialog } from "@/components/items/csv-import-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Item } from "@/types/api";

export default function ItemsPage() {
  const { data: items, isLoading } = useItems();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Item>) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...data });
        toast.success("Item updated");
      } else {
        await createItem.mutateAsync(data);
        toast.success("Item created");
      }
      setEditingItem(null);
    } catch {
      toast.error("Failed to save item");
      throw new Error("Failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteItem.mutateAsync(deletingItem.id);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
    setDeletingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Items</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog for packing optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <ItemsTable
          items={items ?? []}
          onEdit={handleEdit}
          onDelete={setDeletingItem}
        />
      )}

      <ItemFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSubmit={handleFormSubmit}
        isPending={createItem.isPending || updateItem.isPending}
      />

      <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />

      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingItem?.name}&quot; ({deletingItem?.sku}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

## src/app/(dashboard)/boxes/page.tsx

```tsx
"use client";

import { useState } from "react";
import { useBoxes, useCreateBox, useUpdateBox, useDeleteBox } from "@/hooks/use-boxes";
import { BoxesTable } from "@/components/boxes/boxes-table";
import { BoxFormDialog } from "@/components/boxes/box-form-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { BoxType } from "@/types/api";

export default function BoxesPage() {
  const { data: boxes, isLoading } = useBoxes();
  const createBox = useCreateBox();
  const updateBox = useUpdateBox();
  const deleteBox = useDeleteBox();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<BoxType | null>(null);
  const [deletingBox, setDeletingBox] = useState<BoxType | null>(null);

  const handleEdit = (box: BoxType) => {
    setEditingBox(box);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<BoxType>) => {
    try {
      if (editingBox) {
        await updateBox.mutateAsync({ id: editingBox.id, ...data });
        toast.success("Box type updated");
      } else {
        await createBox.mutateAsync(data);
        toast.success("Box type created");
      }
      setEditingBox(null);
    } catch {
      toast.error("Failed to save box type");
      throw new Error("Failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingBox) return;
    try {
      await deleteBox.mutateAsync(deletingBox.id);
      toast.success("Box type deleted");
    } catch {
      toast.error("Failed to delete box type");
    }
    setDeletingBox(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Box Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage your box types with inner/outer dimensions and pricing
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingBox(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Box Type
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <BoxesTable
          boxes={boxes ?? []}
          onEdit={handleEdit}
          onDelete={setDeletingBox}
        />
      )}

      <BoxFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingBox(null);
        }}
        box={editingBox}
        onSubmit={handleFormSubmit}
        isPending={createBox.isPending || updateBox.isPending}
      />

      <AlertDialog open={!!deletingBox} onOpenChange={() => setDeletingBox(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete box type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingBox?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

## src/app/(dashboard)/optimize/page.tsx

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSelector } from "@/components/optimize/item-selector";
import { OptionsConfig, type OptimizationOptions } from "@/components/optimize/options-config";
import { ResultsSummary } from "@/components/optimize/results-summary";
import { useItems } from "@/hooks/use-items";
import { useOptimize } from "@/hooks/use-optimize";
import type { OptimizeResponse } from "@/types/api";
import { Zap, CheckCircle, AlertTriangle, Package, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const PackingViewer = dynamic(() => import("@/components/three/packing-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-md border bg-slate-50">
      <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
    </div>
  ),
});

interface SelectedItem {
  id: string;
  quantity: number;
}

const STEPS = [
  { label: "Select Items", icon: Package },
  { label: "Configure", icon: Zap },
  { label: "Results", icon: CheckCircle },
];

export default function OptimizePage() {
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [options, setOptions] = useState<OptimizationOptions>({
    carrier: "FEDEX",
    optimizeFor: "COST",
    fillMaterial: "AIR_PILLOWS",
    includeFlatRate: true,
    maxBoxes: 10,
  });
  const [result, setResult] = useState<OptimizeResponse | null>(null);

  const { data: items, isLoading: itemsLoading } = useItems();
  const optimize = useOptimize();

  const handleRun = async () => {
    try {
      const response = await optimize.mutateAsync({
        items: selectedItems,
        carrier: options.carrier,
        optimizeFor: options.optimizeFor,
        fillMaterial: options.fillMaterial,
        includeFlatRate: options.includeFlatRate,
        maxBoxes: options.maxBoxes,
      });
      setResult(response);
      setStep(2);
    } catch {
      // Error toast is handled by the mutation
    }
  };

  const resetWizard = () => {
    setStep(0);
    setSelectedItems([]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Optimize Packing</h1>
          <p className="text-sm text-muted-foreground">
            Select items, configure options, and run the packing optimizer
          </p>
        </div>
        {step === 2 && (
          <Button variant="outline" onClick={resetWizard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Optimization
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isComplete = i < step;
          return (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && (
                <Separator className={`w-8 ${isComplete ? "bg-blue-600" : "bg-muted"}`} />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isComplete
                    ? "bg-blue-100 text-blue-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Items to Pack</CardTitle>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : items && items.length > 0 ? (
              <ItemSelector
                items={items}
                selected={selectedItems}
                onChange={setSelectedItems}
                onNext={() => setStep(1)}
              />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No items found. Add items first before running an optimization.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionsConfig
              options={options}
              onChange={setOptions}
              onBack={() => setStep(0)}
              onRun={handleRun}
              isRunning={optimize.isPending}
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && result && (
        <div className="space-y-6">
          <ResultsSummary result={result} />

          {/* 3D Packing Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3D Packing Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <PackingViewer packedBoxes={result.packedBoxes} />
            </CardContent>
          </Card>

          {/* Surcharge warnings */}
          {result.packedBoxes.some((b) => b.surcharges.length > 0) && (
            <div className="space-y-2">
              {result.packedBoxes.flatMap((box) =>
                box.surcharges.map((s, i) => (
                  <Alert
                    key={`${box.boxIndex}-${i}`}
                    variant="destructive"
                    className={
                      s.type.includes("AHS")
                        ? "border-amber-500 bg-amber-50 text-amber-800"
                        : "border-red-500 bg-red-50 text-red-800"
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Box {box.boxIndex} — {s.type}:</strong> ${s.amount.toFixed(2)} — {s.reason}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          )}

          {/* Pack instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pack Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.packedBoxes.map((box) => (
                <div key={box.boxIndex} className="space-y-2">
                  <p className="text-sm font-medium">Box {box.boxIndex}: {box.boxName}</p>
                  <ol className="list-decimal list-inside space-y-1 pl-2 text-sm text-muted-foreground">
                    {box.packInstructions.map((instr, i) => {
                      const isFragile = instr.toLowerCase().includes("fragile");
                      const isVoidFill =
                        instr.toLowerCase().includes("void") || instr.toLowerCase().includes("fill");
                      return (
                        <li
                          key={i}
                          className={
                            isFragile
                              ? "text-red-600 font-medium"
                              : isVoidFill
                              ? "text-blue-600"
                              : ""
                          }
                        >
                          {isFragile && <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />}
                          {instr}
                        </li>
                      );
                    })}
                  </ol>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Flat rate comparison */}
          {result.flatRateOptions && result.flatRateOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Flat Rate Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">Standard Optimization</span>
                  <span className="text-sm font-semibold">${result.totalCost.toFixed(2)}</span>
                </div>
                {result.flatRateOptions
                  .filter((opt) => opt.fits)
                  .map((opt) => {
                    const saves = result.totalCost - opt.cost;
                    const isCheaper = saves > 0;
                    return (
                      <div
                        key={opt.name}
                        className={`flex items-center justify-between rounded-md border p-3 ${
                          isCheaper ? "border-green-300 bg-green-50" : ""
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${opt.cost.toFixed(2)}</span>
                          {isCheaper && (
                            <Badge className="bg-green-100 text-green-700">
                              Save ${saves.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Savings summary */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Naive cost (no optimization)</p>
                  <p className="text-lg font-semibold">${result.naiveCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Optimized cost</p>
                  <p className="text-lg font-semibold text-green-700">${result.optimizedCost.toFixed(2)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-center text-sm font-medium text-green-700">
                Your optimization saved ${result.savingsAmount.toFixed(2)} ({result.savingsPercent.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
```

## src/app/(dashboard)/carrier-rules/page.tsx

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarrierRules } from "@/hooks/use-carrier-rules";
import { Truck } from "lucide-react";

function formatWeight(lbs: number) {
  return `${lbs} lbs`;
}

function formatLength(inches: number) {
  return `${inches}"`;
}

export default function CarrierRulesPage() {
  const { data: rules, isLoading } = useCarrierRules();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Carrier Rules</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const carriers = ["FEDEX", "UPS", "USPS"];
  const carrierLabels: Record<string, string> = {
    FEDEX: "FedEx",
    UPS: "UPS",
    USPS: "USPS",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Carrier Rules</h1>
        <p className="text-sm text-muted-foreground">
          Carrier size limits, DIM divisors, and surcharge thresholds
        </p>
      </div>

      <Tabs defaultValue="FEDEX">
        <TabsList>
          {carriers.map((c) => (
            <TabsTrigger key={c} value={c}>
              <Truck className="mr-1.5 h-3.5 w-3.5" />
              {carrierLabels[c]}
            </TabsTrigger>
          ))}
        </TabsList>

        {carriers.map((carrier) => {
          const rule = rules?.find((r) => r.carrier === carrier);
          if (!rule) return (
            <TabsContent key={carrier} value={carrier}>
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No rules found for {carrierLabels[carrier]}
                </CardContent>
              </Card>
            </TabsContent>
          );

          return (
            <TabsContent key={carrier} value={carrier}>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Size & Weight Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Row label="Max Length" value={formatLength(rule.maxLengthInches)} />
                    <Row label="Max Girth (L + 2W + 2H)" value={formatLength(rule.maxGirthInches)} />
                    <Row label="Max Weight" value={formatWeight(rule.maxWeightLbs)} />
                    <Row label="DIM Divisor" value={String(rule.dimDivisor)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Additional Handling (AHS) Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Row label="AHS Length Threshold" value={formatLength(rule.ahsLengthThreshold)} />
                    <Row label="AHS Width Threshold" value={formatLength(rule.ahsWidthThreshold)} />
                    <Row label="AHS Cubic Threshold" value={`${rule.ahsCubicThreshold} cu in`} />
                    <Row label="AHS Min Billable Weight" value={formatWeight(rule.ahsMinBillableWeight)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Oversize Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Row label="Oversize Cubic Threshold" value={`${rule.oversizeCubicThreshold} cu in`} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Surcharge Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(rule.surchargeRates).map(([type, amount]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {type.replace(/_/g, " ").toLowerCase()}
                        </span>
                        <Badge variant="secondary">${Number(amount).toFixed(2)}</Badge>
                      </div>
                    ))}
                    {Object.keys(rule.surchargeRates).length === 0 && (
                      <p className="text-sm text-muted-foreground">No surcharges configured</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
```

## src/app/(dashboard)/api-keys/page.tsx

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import type { ApiKey, CreateApiKeyResponse } from "@/types/api";
import { Key, Plus, Copy, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const PERMISSIONS = [
  { value: "optimize", label: "Optimize" },
  { value: "items:read", label: "Items: Read" },
  { value: "items:write", label: "Items: Write" },
  { value: "boxes:read", label: "Boxes: Read" },
  { value: "boxes:write", label: "Boxes: Write" },
];

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("none");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["optimize"]);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await api.get<ApiKey[]>("/api-keys");
      return res.data;
    },
  });

  const createKey = useMutation({
    mutationFn: async () => {
      let expiresAt: string | undefined;
      if (expiration !== "none") {
        const days = parseInt(expiration);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }
      const res = await api.post<CreateApiKeyResponse>("/api-keys", {
        name: name || undefined,
        permissions: selectedPermissions,
        expiresAt,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setNewKey(data);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    },
  });

  const handleCreate = () => {
    createKey.mutate();
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setNewKey(null);
      setName("");
      setExpiration("none");
      setSelectedPermissions(["optimize"]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKey ? "API Key Created" : "Create API Key"}</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <Alert className="border-amber-500 bg-amber-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save this key now — you will not be able to see it again.
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-2">
                  <Input value={newKey.key} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newKey.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleDialogClose(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Name (optional)</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My integration"
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 space-y-2">
                    {PERMISSIONS.map((perm) => (
                      <div key={perm.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPermissions.includes(perm.value)}
                          onCheckedChange={() => togglePermission(perm.value)}
                        />
                        <span className="text-sm">{perm.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Expiration</Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Never</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreate}
                  disabled={createKey.isPending || selectedPermissions.length === 0}
                >
                  {createKey.isPending ? "Creating..." : "Create Key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : keys && keys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono text-sm">{key.keyPrefix}...</TableCell>
                    <TableCell>{key.name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(key.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.lastUsedAt
                        ? format(new Date(key.lastUsedAt), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.expiresAt
                        ? format(new Date(key.expiresAt), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeKey.mutate(key.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Key className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No API keys yet. Create one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## src/app/(dashboard)/settings/page.tsx

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Tenant, BillingUsage } from "@/types/api";
import { Trash2, CreditCard, ArrowUpRight, ShoppingCart, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [defaultCarrier, setDefaultCarrier] = useState("FEDEX");
  const [defaultFillMaterial, setDefaultFillMaterial] = useState("AIR_PILLOWS");
  const [copied, setCopied] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: async () => {
      const res = await api.get<Tenant>("/tenants/current");
      return res.data;
    },
  });

  const { data: billingUsage, isLoading: isLoadingBilling } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: async () => {
      const res = await api.get<BillingUsage>("/v1/billing/usage");
      return res.data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (data: { defaultCarrier: string; defaultFillMaterial: string }) => {
      const res = await api.put("/tenants/settings", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const deleteTenant = useMutation({
    mutationFn: async () => {
      await api.delete("/tenants/current");
    },
    onSuccess: () => {
      toast.success("Tenant deleted");
      logout();
    },
    onError: () => {
      toast.error("Failed to delete tenant");
    },
  });

  const upgradeCheckout = useMutation({
    mutationFn: async (plan: string) => {
      const res = await api.post<{ checkoutUrl: string }>("/v1/billing/checkout", { plan });
      return res.data;
    },
    onSuccess: (data) => {
      window.open(data.checkoutUrl, "_blank");
    },
    onError: () => {
      toast.error("Failed to create checkout session");
    },
  });

  const manageSubscription = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ portalUrl: string }>("/v1/billing/portal");
      return res.data;
    },
    onSuccess: (data) => {
      window.open(data.portalUrl, "_blank");
    },
    onError: () => {
      toast.error("Failed to open billing portal");
    },
  });

  // Usage progress bar helpers
  const usagePercent = billingUsage
    ? billingUsage.includedOptimizations > 0
      ? Math.min(100, (billingUsage.usedOptimizations / billingUsage.includedOptimizations) * 100)
      : 0
    : 0;

  const usageColor =
    usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-yellow-500" : "bg-green-500";

  const isPaidPlan = billingUsage && billingUsage.plan !== "FREE";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and preferences
        </p>
      </div>

      {/* Tenant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Organization Name</Label>
                  <p className="text-sm font-medium">{tenant?.name ?? user?.tenantName ?? "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <p className="text-sm font-mono">{tenant?.slug ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Plan</Label>
                <Badge variant="secondary">{tenant?.plan ?? "Free"}</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing & Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <CardTitle className="text-base">Billing & Usage</CardTitle>
          </div>
          <CardDescription>
            Monitor your optimization usage and manage your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoadingBilling ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : billingUsage ? (
            <>
              {/* Current Plan */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Plan:</span>
                  <Badge
                    variant={isPaidPlan ? "default" : "secondary"}
                    className={isPaidPlan ? "bg-blue-600" : ""}
                  >
                    {billingUsage.plan}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Period: {billingUsage.billingPeriod}
                </span>
              </div>

              {/* Usage Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Optimizations this month</span>
                  <span className="font-medium">
                    {billingUsage.usedOptimizations}
                    {billingUsage.includedOptimizations > 0 &&
                      ` / ${billingUsage.includedOptimizations}`}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${usageColor}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {usagePercent >= 90 && !isPaidPlan && (
                  <p className="text-xs text-red-600">
                    You&apos;re approaching your free plan limit. Upgrade to continue optimizing.
                  </p>
                )}
              </div>

              {/* Overage Info */}
              {isPaidPlan && billingUsage.overageCount > 0 && (
                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {billingUsage.overageCount} overage optimization
                  {billingUsage.overageCount !== 1 ? "s" : ""} at $
                  {billingUsage.plan === "STARTER" ? "0.04" : "0.03"}/each = $
                  {billingUsage.overageCost.toFixed(2)}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!isPaidPlan ? (
                  <>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => upgradeCheckout.mutate("STARTER")}
                      disabled={upgradeCheckout.isPending}
                    >
                      {upgradeCheckout.isPending ? "Loading..." : "Upgrade to Starter — $99/mo"}
                      {!upgradeCheckout.isPending && <ArrowUpRight className="ml-1 h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => upgradeCheckout.mutate("GROWTH")}
                      disabled={upgradeCheckout.isPending}
                    >
                      Growth — $249/mo
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manageSubscription.mutate()}
                    disabled={manageSubscription.isPending}
                  >
                    {manageSubscription.isPending ? "Loading..." : "Manage Subscription"}
                    {!manageSubscription.isPending && <ArrowUpRight className="ml-1 h-3 w-3" />}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Unable to load billing information. Please try again later.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Shopify Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <CardTitle className="text-base">Shopify Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your Shopify store to get optimized shipping rates at checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant="secondary">Not Connected</Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Webhook URL</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono">
                {typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/v1/integrations/shopify/rates
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/api/proxy/v1/integrations/shopify/rates`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Instructions</Label>
            <p className="text-xs text-muted-foreground">
              1. In your Shopify admin, go to Settings &rarr; Shipping &rarr; Carrier accounts{" "}
              <br />
              2. Add a custom carrier service with the webhook URL above
              <br />
              3. Set the X-API-Key header to your PackOptimize API key
              <br />
              4. Shopify will send cart data and receive optimized shipping rates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Preferences</CardTitle>
          <CardDescription>These defaults are pre-selected when running optimizations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Default Carrier</Label>
              <Select value={defaultCarrier} onValueChange={setDefaultCarrier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEDEX">FedEx</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="USPS">USPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Fill Material</Label>
              <Select value={defaultFillMaterial} onValueChange={setDefaultFillMaterial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIR_PILLOWS">Air Pillows</SelectItem>
                  <SelectItem value="KRAFT_PAPER">Kraft Paper</SelectItem>
                  <SelectItem value="BUBBLE_WRAP">Bubble Wrap</SelectItem>
                  <SelectItem value="PACKING_PEANUTS">Packing Peanuts</SelectItem>
                  <SelectItem value="FOAM_IN_PLACE">Foam-in-Place</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() =>
              updateSettings.mutate({ defaultCarrier, defaultFillMaterial })
            }
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all its data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your organization, all items, box types,
                    optimization history, and API keys. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteTenant.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

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
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react";
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
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.getValue("sku")}</span>
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
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
      },
      {
        id: "dimensions",
        header: "Dimensions (mm)",
        cell: ({ row }) => {
          const item = row.original;
          return `${item.width} x ${item.height} x ${item.depth}`;
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
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
      },
      {
        accessorKey: "isFragile",
        header: "Fragile",
        cell: ({ row }) =>
          row.getValue("isFragile") ? (
            <Badge variant="destructive">Fragile</Badge>
          ) : null,
      },
      {
        accessorKey: "canRotate",
        header: "Rotate",
        cell: ({ row }) =>
          row.getValue("canRotate") ? (
            <Badge variant="secondary">Yes</Badge>
          ) : (
            <Badge variant="outline">No</Badge>
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
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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
      <Input
        placeholder="Search items..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

## src/components/items/item-form-dialog.tsx

```tsx
"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Item } from "@/types/api";

const positiveNum = z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive("Must be positive"));

const itemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  width: positiveNum,
  height: positiveNum,
  depth: positiveNum,
  weight: positiveNum,
  isFragile: z.boolean(),
  canRotate: z.boolean(),
  maxStackWeight: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()).nullable().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  onSubmit: (data: ItemFormValues) => Promise<void>;
  isPending: boolean;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isPending,
}: ItemFormDialogProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema) as Resolver<ItemFormValues>,
    defaultValues: {
      sku: "",
      name: "",
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      isFragile: false,
      canRotate: true,
      maxStackWeight: null,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        sku: item.sku,
        name: item.name,
        width: item.width,
        height: item.height,
        depth: item.depth,
        weight: item.weight,
        isFragile: item.isFragile,
        canRotate: item.canRotate,
        maxStackWeight: item.maxStackWeight,
      });
    } else {
      form.reset({
        sku: "",
        name: "",
        width: 0,
        height: 0,
        depth: 0,
        weight: 0,
        isFragile: false,
        canRotate: true,
        maxStackWeight: null,
      });
    }
  }, [item, form]);

  const handleSubmit = async (data: ItemFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ITEM-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Product name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxStackWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Stack Weight (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="isFragile"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="mt-0">Fragile</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canRotate"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="mt-0">Can Rotate</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {item ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## src/components/items/csv-import-dialog.tsx

```tsx
"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Loader2 } from "lucide-react";
import { useCreateItem } from "@/hooks/use-items";
import { toast } from "sonner";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CsvRow {
  sku: string;
  name: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  isFragile?: string;
  canRotate?: string;
  [key: string]: string | undefined;
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const createItem = useCreateItem();

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRows(results.data);
      },
    });
  }, []);

  const handleImport = async () => {
    setImporting(true);
    let created = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        await createItem.mutateAsync({
          sku: row.sku,
          name: row.name,
          width: Number(row.width),
          height: Number(row.height),
          depth: Number(row.depth),
          weight: Number(row.weight),
          isFragile: row.isFragile?.toLowerCase() === "true",
          canRotate: row.canRotate?.toLowerCase() !== "false",
        });
        created++;
      } catch {
        errors++;
      }
    }

    toast.success(`Imported ${created} items${errors > 0 ? `, ${errors} failed` : ""}`);
    setImporting(false);
    setRows([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Items from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {rows.length === 0 ? (
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Drop a CSV file or click to browse
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Required columns: sku, name, width, height, depth, weight
              </span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </label>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Preview ({Math.min(rows.length, 5)} of {rows.length} rows)
              </p>
              <div className="max-h-60 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>W</TableHead>
                      <TableHead>H</TableHead>
                      <TableHead>D</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.width}</TableCell>
                        <TableCell>{row.height}</TableCell>
                        <TableCell>{row.depth}</TableCell>
                        <TableCell>{row.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRows([])}>
                  Clear
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {rows.length} items
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## src/components/boxes/boxes-table.tsx

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
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import type { BoxType } from "@/types/api";

interface BoxesTableProps {
  boxes: BoxType[];
  onEdit: (box: BoxType) => void;
  onDelete: (box: BoxType) => void;
}

export function BoxesTable({ boxes, onEdit, onDelete }: BoxesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<BoxType>[]>(
    () => [
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
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
      },
      {
        id: "innerDims",
        header: "Inner (mm)",
        cell: ({ row }) => {
          const b = row.original;
          return `${b.innerWidth} x ${b.innerHeight} x ${b.innerDepth}`;
        },
      },
      {
        id: "outerDims",
        header: "Outer (mm)",
        cell: ({ row }) => {
          const b = row.original;
          return `${b.outerWidth} x ${b.outerHeight} x ${b.outerDepth}`;
        },
      },
      {
        accessorKey: "wallThickness",
        header: "Wall (mm)",
      },
      {
        accessorKey: "boxWeight",
        header: "Weight (g)",
      },
      {
        accessorKey: "maxWeight",
        header: "Max Weight (g)",
      },
      {
        accessorKey: "cost",
        header: "Cost ($)",
        cell: ({ row }) => `$${(row.getValue("cost") as number).toFixed(2)}`,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
          row.getValue("isActive") ? (
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const box = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(box)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(box)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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
    data: boxes,
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
      <Input
        placeholder="Search boxes..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No box types found.
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

## src/components/boxes/box-form-dialog.tsx

```tsx
"use client";

import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { BoxType } from "@/types/api";

const positiveNum = z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive());

const boxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  innerWidth: positiveNum,
  innerHeight: positiveNum,
  innerDepth: positiveNum,
  wallThickness: positiveNum,
  boxWeight: positiveNum,
  maxWeight: positiveNum,
  cost: positiveNum,
  isActive: z.boolean(),
});

type BoxFormValues = z.infer<typeof boxSchema>;

interface BoxFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  box?: BoxType | null;
  onSubmit: (data: BoxFormValues & { outerWidth: number; outerHeight: number; outerDepth: number }) => Promise<void>;
  isPending: boolean;
}

export function BoxFormDialog({
  open,
  onOpenChange,
  box,
  onSubmit,
  isPending,
}: BoxFormDialogProps) {
  const form = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema) as Resolver<BoxFormValues>,
    defaultValues: {
      name: "",
      innerWidth: 0,
      innerHeight: 0,
      innerDepth: 0,
      wallThickness: 3,
      boxWeight: 0,
      maxWeight: 0,
      cost: 0,
      isActive: true,
    },
  });

  const innerWidth = useWatch({ control: form.control, name: "innerWidth" });
  const innerHeight = useWatch({ control: form.control, name: "innerHeight" });
  const innerDepth = useWatch({ control: form.control, name: "innerDepth" });
  const wallThickness = useWatch({ control: form.control, name: "wallThickness" });

  const outerWidth = (innerWidth || 0) + 2 * (wallThickness || 0);
  const outerHeight = (innerHeight || 0) + 2 * (wallThickness || 0);
  const outerDepth = (innerDepth || 0) + 2 * (wallThickness || 0);

  useEffect(() => {
    if (box) {
      form.reset({
        name: box.name,
        innerWidth: box.innerWidth,
        innerHeight: box.innerHeight,
        innerDepth: box.innerDepth,
        wallThickness: box.wallThickness,
        boxWeight: box.boxWeight,
        maxWeight: box.maxWeight,
        cost: box.cost,
        isActive: box.isActive,
      });
    } else {
      form.reset({
        name: "",
        innerWidth: 0,
        innerHeight: 0,
        innerDepth: 0,
        wallThickness: 3,
        boxWeight: 0,
        maxWeight: 0,
        cost: 0,
        isActive: true,
      });
    }
  }, [box, form]);

  const handleSubmit = async (data: BoxFormValues) => {
    await onSubmit({
      ...data,
      outerWidth: data.innerWidth + 2 * data.wallThickness,
      outerHeight: data.innerHeight + 2 * data.wallThickness,
      outerDepth: data.innerDepth + 2 * data.wallThickness,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{box ? "Edit Box Type" : "Add Box Type"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Medium Box" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="innerWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inner W (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="innerHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inner H (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="innerDepth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inner D (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="wallThickness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wall Thickness (mm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">Calculated Outer Dims</p>
              <p className="text-sm">{outerWidth} x {outerHeight} x {outerDepth} mm</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="boxWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Box Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="mt-0">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {box ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## src/components/optimize/item-selector.tsx

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Item } from "@/types/api";

interface SelectedItem {
  id: string;
  quantity: number;
}

interface ItemSelectorProps {
  items: Item[];
  selected: SelectedItem[];
  onChange: (selected: SelectedItem[]) => void;
  onNext: () => void;
}

export function ItemSelector({ items, selected, onChange, onNext }: ItemSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIds = new Set(selected.map((s) => s.id));

  const toggleItem = (itemId: string) => {
    if (selectedIds.has(itemId)) {
      onChange(selected.filter((s) => s.id !== itemId));
    } else {
      onChange([...selected, { id: itemId, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    onChange(
      selected.map((s) => (s.id === itemId ? { ...s, quantity: Math.max(1, Math.min(100, quantity)) } : s))
    );
  };

  const totalUnits = selected.reduce((sum, s) => sum + s.quantity, 0);
  const totalWeight = selected.reduce((sum, s) => {
    const item = items.find((i) => i.id === s.id);
    return sum + (item?.weight ?? 0) * s.quantity;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{selected.length} items</Badge>
          <Badge variant="secondary">{totalUnits} units</Badge>
          <Badge variant="secondary">~{(totalWeight / 1000).toFixed(2)} kg</Badge>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-md border">
        {filtered.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const sel = selected.find((s) => s.id === item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 border-b px-4 py-3 last:border-b-0 ${
                isSelected ? "bg-blue-50/50" : ""
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku} &middot; {item.width}x{item.height}x{item.depth}mm &middot; {item.weight}g
                  {item.isFragile && " \u26A0 Fragile"}
                </p>
              </div>
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
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onNext}
          disabled={selected.length === 0}
        >
          Next: Configure Options
        </Button>
      </div>
    </div>
  );
}
```

## src/components/optimize/options-config.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface OptimizationOptions {
  carrier: string;
  optimizeFor: string;
  fillMaterial: string;
  includeFlatRate: boolean;
  maxBoxes: number;
}

interface OptionsConfigProps {
  options: OptimizationOptions;
  onChange: (options: OptimizationOptions) => void;
  onBack: () => void;
  onRun: () => void;
  isRunning: boolean;
}

export function OptionsConfig({
  options,
  onChange,
  onBack,
  onRun,
  isRunning,
}: OptionsConfigProps) {
  const update = (partial: Partial<OptimizationOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={options.carrier} onValueChange={(v) => update({ carrier: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEDEX">FedEx</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="USPS">USPS</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Optimize For</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={options.optimizeFor} onValueChange={(v) => update({ optimizeFor: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COST">Lowest Cost</SelectItem>
                <SelectItem value="SPACE">Best Space Utilization</SelectItem>
                <SelectItem value="FEWEST_BOXES">Fewest Boxes</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fill Material</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={options.fillMaterial} onValueChange={(v) => update({ fillMaterial: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AIR_PILLOWS">Air Pillows</SelectItem>
                <SelectItem value="KRAFT_PAPER">Kraft Paper</SelectItem>
                <SelectItem value="BUBBLE_WRAP">Bubble Wrap</SelectItem>
                <SelectItem value="PACKING_PEANUTS">Packing Peanuts</SelectItem>
                <SelectItem value="FOAM_IN_PLACE">Foam-in-Place</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Max Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min={1}
              max={50}
              value={options.maxBoxes}
              onChange={(e) => update({ maxBoxes: parseInt(e.target.value) || 10 })}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={options.includeFlatRate}
          onCheckedChange={(v) => update({ includeFlatRate: v })}
        />
        <Label>Include USPS Flat Rate Comparison</Label>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onRun} disabled={isRunning}>
          {isRunning ? "Optimizing..." : "Run Optimization"}
        </Button>
      </div>
    </div>
  );
}
```

## src/components/optimize/results-summary.tsx

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.totalBoxes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">${result.totalCost.toFixed(2)}</p>
              {result.savingsPercent > 0 && (
                <Badge className="bg-green-100 text-green-700">
                  -{result.savingsPercent.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(result.averageUtilization * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Execution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.executionTimeMs}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-box cost breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.packedBoxes.map((box: PackedBox) => (
            <div key={box.boxIndex} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Box {box.boxIndex}: {box.boxName}
                </span>
                <span className="text-sm font-semibold">${box.totalCost.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 pl-4 text-sm text-muted-foreground">
                <span>Box material:</span>
                <span>${box.boxMaterialCost.toFixed(2)}</span>
                <span>Actual weight:</span>
                <span>{(box.totalWeight / 1000).toFixed(2)} kg</span>
                <span>DIM weight:</span>
                <span className={box.dimWeightGrams > box.totalWeight ? "font-medium text-amber-600" : ""}>
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
          <div className="flex items-center justify-between font-semibold">
            <span>Grand Total</span>
            <span>${result.totalCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## src/components/dashboard/kpi-cards.tsx

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, DollarSign, Package, Box } from "lucide-react";

interface KpiCardsProps {
  optimizationCount: number;
  totalSavings: number;
  itemCount: number;
  boxCount: number;
  isLoading: boolean;
}

const cards = [
  { key: "optimizations", label: "Total Optimizations", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "savings", label: "Cumulative Savings", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { key: "items", label: "Items in Catalog", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "boxes", label: "Active Box Types", icon: Box, color: "text-amber-600", bg: "bg-amber-50" },
];

export function KpiCards({ optimizationCount, totalSavings, itemCount, boxCount, isLoading }: KpiCardsProps) {
  const values: Record<string, string> = {
    optimizations: optimizationCount.toLocaleString(),
    savings: `$${totalSavings.toFixed(2)}`,
    items: itemCount.toLocaleString(),
    boxes: boxCount.toLocaleString(),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">{values[card.key]}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Optimization Runs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
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
                <TableRow key={run.id}>
                  <TableCell className="text-sm">
                    {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{run.itemCount}</TableCell>
                  <TableCell>{run.boxCount}</TableCell>
                  <TableCell>${run.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      ${run.savingsAmount.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{run.carrier}</Badge>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Savings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No savings data yet. Run optimizations to see your savings trend.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Savings"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="savings" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

## src/components/three/packing-viewer.tsx

```tsx
"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PackedBoxScene } from "./packed-box-scene";
import type { PackedBox } from "@/types/api";

interface PackingViewerProps {
  packedBoxes: PackedBox[];
}

export default function PackingViewer({ packedBoxes }: PackingViewerProps) {
  // Calculate offsets so boxes are spaced along X axis
  const offsets = useMemo(() => {
    const result: number[] = [];
    let currentX = 0;

    for (let i = 0; i < packedBoxes.length; i++) {
      result.push(currentX);
      const box = packedBoxes[i].box;
      const gap = Math.max(box.innerWidth, box.innerDepth) * 0.2;
      currentX += box.innerWidth + gap;
    }

    return result;
  }, [packedBoxes]);

  // Calculate camera position based on total scene size
  const cameraPosition = useMemo((): [number, number, number] => {
    if (packedBoxes.length === 0) return [500, 400, 500];

    const lastOffset = offsets[offsets.length - 1] || 0;
    const lastBox = packedBoxes[packedBoxes.length - 1].box;
    const totalWidth = lastOffset + lastBox.innerWidth;
    const maxHeight = Math.max(...packedBoxes.map((b) => b.box.innerHeight));
    const maxDepth = Math.max(...packedBoxes.map((b) => b.box.innerDepth));

    const maxDim = Math.max(totalWidth, maxHeight, maxDepth);
    const distance = maxDim * 1.8;

    return [totalWidth / 2 + distance * 0.5, distance * 0.6, distance * 0.8];
  }, [packedBoxes, offsets]);

  // Camera target (center of scene)
  const cameraTarget = useMemo((): [number, number, number] => {
    if (packedBoxes.length === 0) return [0, 0, 0];

    const lastOffset = offsets[offsets.length - 1] || 0;
    const lastBox = packedBoxes[packedBoxes.length - 1].box;
    const totalWidth = lastOffset + lastBox.innerWidth;
    const maxHeight = Math.max(...packedBoxes.map((b) => b.box.innerHeight));
    const maxDepth = Math.max(...packedBoxes.map((b) => b.box.innerDepth));

    return [totalWidth / 2, maxHeight / 2, maxDepth / 2];
  }, [packedBoxes, offsets]);

  if (packedBoxes.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-md border bg-slate-50 text-muted-foreground">
        No packed boxes to display
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-md border bg-[#f8fafc]">
      <Canvas
        camera={{ position: cameraPosition, fov: 50, near: 1, far: 10000 }}
        style={{ borderRadius: "0.375rem" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[200, 400, 200]} intensity={0.8} />
        <directionalLight position={[-200, 300, -200]} intensity={0.3} />

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={100}
          maxDistance={3000}
          target={cameraTarget}
        />

        <gridHelper
          args={[2000, 40, "#cbd5e1", "#e2e8f0"]}
          position={[cameraTarget[0], -1, cameraTarget[2]]}
        />

        {packedBoxes.map((box, i) => (
          <PackedBoxScene
            key={box.boxIndex}
            packedBox={box}
            offsetX={offsets[i]}
          />
        ))}
      </Canvas>
    </div>
  );
}
```

## src/components/three/packed-box-scene.tsx

```tsx
"use client";

import { Html } from "@react-three/drei";
import { BoxWireframe } from "./box-wireframe";
import { ItemMesh } from "./item-mesh";
import type { PackedBox } from "@/types/api";

interface PackedBoxSceneProps {
  packedBox: PackedBox;
  offsetX?: number;
}

export function PackedBoxScene({ packedBox, offsetX = 0 }: PackedBoxSceneProps) {
  const { box, placements, utilization, boxIndex, boxName } = packedBox;

  const utilizationColor =
    utilization > 0.7 ? "#22C55E" : utilization > 0.4 ? "#F59E0B" : "#EF4444";

  return (
    <group position={[offsetX, 0, 0]}>
      <BoxWireframe
        width={box.innerWidth}
        height={box.innerHeight}
        depth={box.innerDepth}
      />

      {placements.map((placement, i) => (
        <ItemMesh key={`${placement.itemId}-${i}`} placement={placement} />
      ))}

      {/* Label above box */}
      <Html
        position={[box.innerWidth / 2, box.innerHeight + 40, box.innerDepth / 2]}
        center
        style={{ pointerEvents: "none", zIndex: 0 }}
        zIndexRange={[0, 0]}
      >
        <div className="text-center whitespace-nowrap">
          <p className="text-xs font-semibold text-slate-700">
            Box {boxIndex}: {boxName}
          </p>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: utilizationColor }}
            />
            Utilization: {(utilization * 100).toFixed(1)}%
          </p>
        </div>
      </Html>
    </group>
  );
}
```

## src/components/three/item-mesh.tsx

```tsx
"use client";

import { useState, useMemo, memo } from "react";
import { Html, Edges } from "@react-three/drei";
import type { Placement } from "@/types/api";

interface ItemMeshProps {
  placement: Placement;
}

function getItemColor(placement: Placement): { color: string; edgeColor: string } {
  if (placement.isFragile) {
    return { color: "#EF4444", edgeColor: "#B91C1C" };
  }
  if (placement.weight > 5000) {
    return { color: "#F59E0B", edgeColor: "#B45309" };
  }
  // Check if this looks like an insert material (no SKU or special name patterns)
  if (placement.sku === "" || placement.name.toLowerCase().includes("insert")) {
    return { color: "#3B82F6", edgeColor: "#1D4ED8" };
  }
  return { color: "#22C55E", edgeColor: "#15803D" };
}

function ItemMeshComponent({ placement }: ItemMeshProps) {
  const [hovered, setHovered] = useState(false);

  const { color, edgeColor } = useMemo(() => getItemColor(placement), [placement]);

  // Convert from corner position to center position for Three.js
  const position: [number, number, number] = [
    placement.x + placement.width / 2,
    placement.y + placement.height / 2,
    placement.z + placement.depth / 2,
  ];

  return (
    <mesh
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <boxGeometry args={[placement.width, placement.height, placement.depth]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={hovered ? 1.0 : 0.7}
        emissive={hovered ? color : "#000000"}
        emissiveIntensity={hovered ? 0.2 : 0}
      />
      <Edges color={edgeColor} threshold={15} />

      {hovered && (
        <Html
          position={[0, placement.height / 2 + 10, 0]}
          center
          style={{ pointerEvents: "none", zIndex: 50 }}
          zIndexRange={[50, 0]}
        >
          <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-lg whitespace-nowrap -translate-y-full mb-2">
            <p className="font-semibold">{placement.name}</p>
            <p className="text-muted-foreground">SKU: {placement.sku}</p>
            <p className="text-muted-foreground">
              {placement.width} x {placement.height} x {placement.depth} mm
            </p>
            <p className="text-muted-foreground">{placement.weight}g</p>
            {placement.rotation !== 0 && (
              <p className="text-blue-600">Rotated {placement.rotation}&deg;</p>
            )}
            {placement.isFragile && (
              <p className="text-red-600 font-medium">Fragile</p>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}

export const ItemMesh = memo(ItemMeshComponent);
```

## src/components/three/box-wireframe.tsx

```tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface BoxWireframeProps {
  width: number;
  height: number;
  depth: number;
}

export function BoxWireframe({ width, height, depth }: BoxWireframeProps) {
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, [width, height, depth]);

  return (
    <lineSegments
      geometry={geometry}
      position={[width / 2, height / 2, depth / 2]}
    >
      <lineBasicMaterial color="#94a3b8" />
    </lineSegments>
  );
}
```

## src/lib/api.ts

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

## src/lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## src/stores/auth-store.ts

```ts
import { create } from "zustand";
import type { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false });
  },
  initialize: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },
}));
```

## src/hooks/use-auth.ts

```ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/api";

export function useAuth() {
  const { token, user, isAuthenticated, login: storeLogin, logout: storeLogout, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = async (data: LoginRequest) => {
    const res = await api.post<LoginResponse>("/auth/login", data);
    storeLogin(res.data.accessToken, res.data.user);
    router.push("/dashboard");
  };

  const register = async (data: RegisterRequest) => {
    const res = await api.post<RegisterResponse>("/auth/register", data);
    storeLogin(res.data.accessToken, res.data.user);
    router.push("/dashboard");
  };

  const logout = () => {
    storeLogout();
    router.push("/login");
  };

  return { token, user, isAuthenticated, login, register, logout };
}
```

## src/hooks/use-items.ts

```ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Item } from "@/types/api";

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await api.get<Item[]>("/items");
      return res.data;
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Item>) => {
      const res = await api.post<Item>("/items", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Item> & { id: string }) => {
      const res = await api.put<Item>(`/items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
```

## src/hooks/use-boxes.ts

```ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { BoxType } from "@/types/api";

export function useBoxes() {
  return useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const res = await api.get<BoxType[]>("/box-types");
      return res.data;
    },
  });
}

export function useCreateBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<BoxType>) => {
      const res = await api.post<BoxType>("/box-types", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
}

export function useUpdateBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BoxType> & { id: string }) => {
      const res = await api.put<BoxType>(`/box-types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
}

export function useDeleteBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/box-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
}
```

## src/hooks/use-optimize.ts

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { OptimizeRequest, OptimizeResponse } from "@/types/api";

export function useOptimize() {
  return useMutation({
    mutationFn: async (data: OptimizeRequest) => {
      const res = await api.post<OptimizeResponse>("/v1/optimize", data);
      return res.data;
    },
  });
}
```

## src/hooks/use-carrier-rules.ts

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CarrierConstraint } from "@/types/api";

export function useCarrierRules() {
  return useQuery({
    queryKey: ["carrier-rules"],
    queryFn: async () => {
      const res = await api.get<CarrierConstraint[]>("/carrier-rules");
      return res.data;
    },
  });
}
```

## src/types/api.ts

```ts
// Auth
export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    tenantName: string;
  };
}

export interface RegisterRequest {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    tenantName: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

// Items
export interface Item {
  id: string;
  sku: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  isFragile: boolean;
  canRotate: boolean;
  maxStackWeight: number | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Box Types
export interface BoxType {
  id: string;
  name: string;
  innerWidth: number;
  innerHeight: number;
  innerDepth: number;
  outerWidth: number;
  outerHeight: number;
  outerDepth: number;
  wallThickness: number;
  boxWeight: number;
  maxWeight: number;
  cost: number;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// API Keys
export interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string | null;
  permissions: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  keyPrefix: string;
  name: string | null;
  permissions: string[];
  expiresAt: string | null;
}

// Carrier Rules
export interface CarrierConstraint {
  id: string;
  carrier: string;
  maxLengthInches: number;
  maxGirthInches: number;
  maxWeightLbs: number;
  dimDivisor: number;
  ahsCubicThreshold: number;
  oversizeCubicThreshold: number;
  ahsLengthThreshold: number;
  ahsWidthThreshold: number;
  ahsMinBillableWeight: number;
  surchargeRates: Record<string, number>;
}

// Optimization
export interface OptimizeItemInput {
  id: string;
  quantity: number;
}

export interface OptimizeRequest {
  items: OptimizeItemInput[];
  carrier?: string;
  optimizeFor?: string;
  maxBoxes?: number;
  includeFlatRate?: boolean;
  fillMaterial?: string;
  boxTypeIds?: string[];
}

export interface Placement {
  itemId: string;
  sku: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  originalWidth: number;
  originalHeight: number;
  originalDepth: number;
  weight: number;
  rotation: number;
  isFragile: boolean;
}

export interface Surcharge {
  type: string;
  amount: number;
  reason: string;
}

export interface VoidFillResult {
  voidVolumeCubicMm: number;
  voidVolumeCubicIn: number;
  fillWeightGrams: number;
  fillCostUsd: number;
  materialUsed: string;
}

export interface PackedBox {
  boxId: string;
  boxName: string;
  boxIndex: number;
  box: {
    id: string;
    name: string;
    innerWidth: number;
    innerHeight: number;
    innerDepth: number;
    outerWidth: number;
    outerHeight: number;
    outerDepth: number;
    boxWeight: number;
    maxWeight: number;
    cost: number;
  };
  placements: Placement[];
  utilization: number;
  itemsWeight: number;
  boxWeight: number;
  fillWeight: number;
  totalWeight: number;
  dimWeightGrams: number;
  billableWeightGrams: number;
  roundedOuterDims: { length: number; width: number; height: number };
  boxMaterialCost: number;
  estimatedShippingCost: number;
  surcharges: Surcharge[];
  totalCost: number;
  voidFill: VoidFillResult;
  packInstructions: string[];
}

export interface FlatRateOption {
  name: string;
  carrier: string;
  cost: number;
  fits: boolean;
  dimensions: { length: number; width: number; height: number };
}

export interface UnpackedItem {
  itemId: string;
  sku: string;
  name: string;
  reason: string;
}

export interface OptimizeResponse {
  success: boolean;
  packedBoxes: PackedBox[];
  unpackedItems: UnpackedItem[];
  totalBoxes: number;
  totalCost: number;
  totalWeight: number;
  totalBillableWeight: number;
  averageUtilization: number;
  naiveCost: number;
  optimizedCost: number;
  savingsAmount: number;
  savingsPercent: number;
  flatRateOptions: FlatRateOption[];
  algorithm: string;
  executionTimeMs: number;
  carrier: string;
}

// Optimization Run (for dashboard history)
export interface OptimizationRun {
  id: string;
  itemCount: number;
  boxCount: number;
  totalCost: number;
  savingsAmount: number;
  carrier: string;
  status: string;
  createdAt: string;
}

// Savings / Analytics
export interface SavingsSummary {
  totalSavings: number;
  totalRuns: number;
  averageSavingsPercent: number;
  history: { period: string; savings: number; runs: number }[];
}

// Usage
export interface UsageStats {
  billingPeriod: string;
  optimizationRuns: number;
  itemsCreated: number;
  apiCalls: number;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
}

// Billing
export interface BillingUsage {
  plan: string;
  includedOptimizations: number;
  usedOptimizations: number;
  billingPeriod: string;
  overageCount: number;
  overageCost: number;
}

// Insert Material
export interface InsertMaterial {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  alwaysInclude: boolean;
}
```

## src/app/globals.css

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
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
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

## next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://localhost:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
```

---

## Files Not Found

The following files from the original request do not exist as separate files:

- `src/lib/auth.ts` — does not exist
- `tailwind.config.ts` — does not exist (Tailwind v4 uses CSS-first config)
- `src/components/optimize/surcharge-warnings.tsx` — functionality is inline in optimize/page.tsx
- `src/components/optimize/pack-instructions.tsx` — functionality is inline in optimize/page.tsx
- `src/components/optimize/flat-rate-comparison.tsx` — functionality is inline in optimize/page.tsx
- `src/components/api-keys/api-keys-table.tsx` — functionality is inline in api-keys/page.tsx
- `src/components/api-keys/create-key-dialog.tsx` — functionality is inline in api-keys/page.tsx
- `src/components/carrier-rules/carrier-rules-display.tsx` — functionality is inline in carrier-rules/page.tsx

## shadcn/ui Components Installed

The following 24 `.tsx` files are found in `src/components/ui/` (standard shadcn components, contents not included):

alert-dialog.tsx, alert.tsx, avatar.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx, command.tsx, dialog.tsx, dropdown-menu.tsx, form.tsx, input.tsx, label.tsx, popover.tsx, progress.tsx, select.tsx, separator.tsx, sheet.tsx, skeleton.tsx, sonner.tsx, switch.tsx, table.tsx, tabs.tsx, tooltip.tsx
