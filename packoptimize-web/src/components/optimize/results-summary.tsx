"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OptimizeResponse, PackedBox } from "@/types/api";

interface ResultsSummaryProps {
  result: OptimizeResponse;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="bg-[#0B4228] rounded-2xl sm:rounded-3xl p-6 text-white shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] transition-transform hover:-translate-y-1 duration-300">
          <p className="text-white/70 text-sm font-medium mb-2">Total Boxes</p>
          <p className="text-2xl sm:text-3xl font-bold">{result.totalBoxes}</p>
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <p className="text-[#8B95A5] text-sm font-medium mb-2">Total Cost</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-[#0B4228]">${result.totalCost.toFixed(2)}</p>
            {result.savingsPercent > 0 && (
              <span className="bg-[#91E440] text-[#0B4228] px-2 py-0.5 rounded-full text-xs font-bold">
                -{result.savingsPercent.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <p className="text-[#8B95A5] text-sm font-medium mb-2">Avg Utilization</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#0B4228]">{(result.averageUtilization * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <p className="text-[#8B95A5] text-sm font-medium mb-2">Execution Time</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#0B4228]">{result.executionTimeMs}ms</p>
        </div>
      </div>

      {/* Per-box cost breakdown */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
        <CardHeader>
          <CardTitle className="text-base text-[#0B4228]">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.packedBoxes.map((box: PackedBox) => (
            <div key={box.boxIndex} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0B4228]">
                  Box {box.boxIndex}: {box.boxName}
                </span>
                <span className="text-sm font-bold text-[#0B4228]">${box.totalCost.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-1 pl-2 sm:pl-4 text-xs sm:text-sm text-[#8B95A5]">
                <span>Box material:</span>
                <span>${box.boxMaterialCost.toFixed(2)}</span>
                <span>Actual weight:</span>
                <span>{(box.totalWeight / 1000).toFixed(2)} kg</span>
                <span>DIM weight:</span>
                <span className={box.dimWeightGrams > box.totalWeight ? "font-medium text-orange-600" : ""}>
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
          <div className="flex items-center justify-between font-bold text-[#0B4228]">
            <span>Grand Total</span>
            <span>${result.totalCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
