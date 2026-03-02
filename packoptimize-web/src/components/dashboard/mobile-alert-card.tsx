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
