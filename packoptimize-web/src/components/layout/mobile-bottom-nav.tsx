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
