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
