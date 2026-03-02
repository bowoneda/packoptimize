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
