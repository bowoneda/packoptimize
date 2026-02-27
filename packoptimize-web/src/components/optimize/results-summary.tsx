"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { OptimizeResponse, PackedBox } from "@/types/api";

interface ResultsSummaryProps {
  result: OptimizeResponse;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.totalBoxes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">${result.totalCost.toFixed(2)}</p>
              {result.savingsPercent > 0 && (
                <Badge className="bg-green-100 text-green-700">
                  -{result.savingsPercent.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(result.averageUtilization * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Execution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.executionTimeMs}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-box cost breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.packedBoxes.map((box: PackedBox) => (
            <div key={box.boxIndex} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Box {box.boxIndex}: {box.boxName}
                </span>
                <span className="text-sm font-semibold">${box.totalCost.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 pl-4 text-sm text-muted-foreground">
                <span>Box material:</span>
                <span>${box.boxMaterialCost.toFixed(2)}</span>
                <span>Actual weight:</span>
                <span>{(box.totalWeight / 1000).toFixed(2)} kg</span>
                <span>DIM weight:</span>
                <span className={box.dimWeightGrams > box.totalWeight ? "font-medium text-amber-600" : ""}>
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
          <div className="flex items-center justify-between font-semibold">
            <span>Grand Total</span>
            <span>${result.totalCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
