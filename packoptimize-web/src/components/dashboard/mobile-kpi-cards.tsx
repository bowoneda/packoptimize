"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TrendUp, TrendDown, DotsThree } from "@phosphor-icons/react";

interface MobileKpiCardsProps {
  optimizationCount: number;
  totalSavings: number;
  itemCount: number;
  boxCount: number;
  isLoading: boolean;
}

export function MobileKpiCards({
  optimizationCount,
  totalSavings,
  itemCount,
  boxCount,
  isLoading,
}: MobileKpiCardsProps) {
  const metrics = [
    { label: "Daily Savings", value: `$${totalSavings.toFixed(0)}`, trend: "+35%", up: true },
    { label: "Boxes Used", value: boxCount.toLocaleString(), trend: `${optimizationCount} runs`, up: true },
    { label: "Items", value: itemCount.toLocaleString(), trend: "In catalog", up: null },
    { label: "Optimizations", value: optimizationCount.toLocaleString(), trend: "Total", up: null },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[#8B95A5] text-[10px] font-medium">{metric.label}</p>
            <DotsThree size={14} className="text-[#8B95A5]" weight="bold" />
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <h4 className="font-bold text-[#0B4228] text-lg">{metric.value}</h4>
          )}
          {metric.up !== null ? (
            <span
              className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                metric.up ? "text-[#7AD427]" : "text-red-500"
              }`}
            >
              {metric.up ? <TrendUp size={10} /> : <TrendDown size={10} />}
              {metric.trend}
            </span>
          ) : (
            <span className="text-[10px] text-[#8B95A5] mt-1 block">{metric.trend}</span>
          )}
        </div>
      ))}
    </div>
  );
}
