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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* Primary dark card */}
      <div className="bg-[#0B4228] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Lightning size={24} className="text-white" weight="fill" />
          </div>
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold shadow-sm">Active</span>
        </div>
        <p className="text-white/80 text-sm font-medium mb-1">Total Optimizations</p>
        {isLoading ? <Skeleton className="h-10 w-24 bg-white/20" /> : (
          <h3 className="text-2xl sm:text-4xl font-bold tracking-tight">{optimizationCount.toLocaleString()}</h3>
        )}
      </div>

      {/* Savings card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F5F6F8] rounded-2xl flex items-center justify-center border border-gray-100">
            <ChartLineUp size={24} className="text-[#8B95A5]" />
          </div>
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold shadow-sm">Savings</span>
        </div>
        <p className="text-[#8B95A5] text-sm font-medium mb-1">Cumulative Savings</p>
        {isLoading ? <Skeleton className="h-10 w-24" /> : (
          <h3 className="text-2xl sm:text-4xl font-bold text-[#0B4228] tracking-tight">${totalSavings.toFixed(2)}</h3>
        )}
      </div>

      {/* Items card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F5F6F8] rounded-2xl flex items-center justify-center border border-gray-100">
            <ListDashes size={24} className="text-[#8B95A5]" />
          </div>
        </div>
        <p className="text-[#8B95A5] text-sm font-medium mb-1">Items in Catalog</p>
        {isLoading ? <Skeleton className="h-10 w-24" /> : (
          <h3 className="text-2xl sm:text-4xl font-bold text-[#0B4228] tracking-tight">{itemCount.toLocaleString()}</h3>
        )}
      </div>

      {/* Boxes card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F5F6F8] rounded-2xl flex items-center justify-center border border-gray-100">
            <Package size={24} className="text-[#8B95A5]" />
          </div>
        </div>
        <p className="text-[#8B95A5] text-sm font-medium mb-1">Active Box Types</p>
        {isLoading ? <Skeleton className="h-10 w-24" /> : (
          <h3 className="text-2xl sm:text-4xl font-bold text-[#0B4228] tracking-tight">{boxCount.toLocaleString()}</h3>
        )}
      </div>
    </div>
  );
}
