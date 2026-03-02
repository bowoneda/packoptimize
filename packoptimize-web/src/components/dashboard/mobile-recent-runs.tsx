"use client";

import { Cube, DotsThree } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { OptimizationRun } from "@/types/api";

interface MobileRecentRunsProps {
  runs: OptimizationRun[];
  isLoading: boolean;
}

export function MobileRecentRuns({ runs, isLoading }: MobileRecentRunsProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm text-[#0B4228]">Recent Optimizations</h3>
        <DotsThree size={18} className="text-[#8B95A5]" weight="bold" />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#8B95A5]">
          No runs yet. Run your first optimization.
        </p>
      ) : (
        <div className="space-y-4">
          {runs.slice(0, 5).map((run) => (
            <div key={run.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#0B4228]">
                  <Cube size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0B4228]">
                    {run.itemCount} items
                  </p>
                  <p className="text-[10px] text-[#8B95A5]">
                    {run.boxCount} box{run.boxCount !== 1 ? "es" : ""} · {run.carrier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {run.savingsAmount > 0 ? (
                  <p className="text-xs font-bold text-[#7AD427]">
                    Saved ${run.savingsAmount.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-[#8B95A5]">No savings</p>
                )}
                <p className="text-[10px] text-[#8B95A5]">
                  {formatDistanceToNow(new Date(run.createdAt), { addSuffix: false })} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
