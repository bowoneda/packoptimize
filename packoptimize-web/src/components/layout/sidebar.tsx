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
  User,
} from "@phosphor-icons/react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/optimize", label: "Optimize", icon: Cube },
  { href: "/items", label: "Items", icon: ListDashes },
  { href: "/boxes", label: "Boxes", icon: Package },
];

const referenceItems = [
  { href: "/carrier-rules", label: "Carrier Rules", icon: Books },
  { href: "/api-docs", label: "API Docs", icon: Books },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/profile", label: "Profile", icon: User },
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
      <div className="flex-1 space-y-8 overflow-y-auto">
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
      <div className="bg-[#0B4228] rounded-2xl sm:rounded-3xl p-5 text-white mt-auto relative overflow-hidden">
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
