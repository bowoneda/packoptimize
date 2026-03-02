"use client";

import { usePathname, useRouter } from "next/navigation";
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
  "/api-docs": "API Documentation",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
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
            <DropdownMenuItem onClick={() => router.push("/profile")}>
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
