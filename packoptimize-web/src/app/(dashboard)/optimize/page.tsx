"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSelector } from "@/components/optimize/item-selector";
import { OptionsConfig, type OptimizationOptions } from "@/components/optimize/options-config";
import { ResultsSummary } from "@/components/optimize/results-summary";
import { useItems } from "@/hooks/use-items";
import { useOptimize } from "@/hooks/use-optimize";
import type { OptimizeResponse } from "@/types/api";
import { Cube, CheckCircle, Warning, ListDashes, ArrowLeft } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

const PackingViewer = dynamic(() => import("@/components/three/packing-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] sm:h-[400px] lg:h-[500px] items-center justify-center bg-[#F5F6F8] rounded-2xl sm:rounded-3xl border border-gray-100">
      <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
    </div>
  ),
});

interface SelectedItem {
  id: string;
  quantity: number;
}

const STEPS = [
  { label: "Select Items", icon: ListDashes },
  { label: "Configure", icon: Cube },
  { label: "Results", icon: CheckCircle },
];

export default function OptimizePage() {
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [options, setOptions] = useState<OptimizationOptions>({
    carrier: "FEDEX",
    optimizeFor: "COST",
    fillMaterial: "AIR_PILLOWS",
    includeFlatRate: true,
    maxBoxes: 10,
  });
  const [result, setResult] = useState<OptimizeResponse | null>(null);

  const { data: items, isLoading: itemsLoading } = useItems();
  const optimize = useOptimize();

  const handleRun = async () => {
    try {
      const response = await optimize.mutateAsync({
        items: selectedItems,
        carrier: options.carrier,
        optimizeFor: options.optimizeFor,
        fillMaterial: options.fillMaterial,
        includeFlatRate: options.includeFlatRate,
        maxBoxes: options.maxBoxes,
      });
      setResult(response);
      setStep(2);
    } catch {
      // Error toast is handled by the mutation
    }
  };

  const resetWizard = () => {
    setStep(0);
    setSelectedItems([]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Optimize Packing</h1>
          <p className="text-sm text-muted-foreground">
            Select items, configure options, and run the packing optimizer
          </p>
        </div>
        {step === 2 && (
          <Button variant="outline" className="rounded-full" onClick={resetWizard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Optimization
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isComplete = i < step;
          return (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <div className={`h-px flex-1 min-w-3 mx-1 sm:mx-2 ${isComplete ? "bg-[#0B4228]" : "bg-[#E8EAED]"}`} />
              )}
              <div
                className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#0B4228] text-white"
                    : isComplete
                    ? "bg-[#91E440]/20 text-[#0B4228]"
                    : "bg-[#E8EAED] text-[#8B95A5]"
                }`}
              >
                <Icon size={14} />
                {s.label}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      {step === 0 && (
        <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
          <CardHeader>
            <CardTitle>Select Items to Pack</CardTitle>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : items && items.length > 0 ? (
              <ItemSelector
                items={items}
                selected={selectedItems}
                onChange={setSelectedItems}
                onNext={() => setStep(1)}
              />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <ListDashes size={48} className="mx-auto mb-3 opacity-50" />
                <p>No items found. Add items first before running an optimization.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
          <CardHeader>
            <CardTitle>Configure Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionsConfig
              options={options}
              onChange={setOptions}
              onBack={() => setStep(0)}
              onRun={handleRun}
              isRunning={optimize.isPending}
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && result && (
        <div className="space-y-6">
          <ResultsSummary result={result} />

          {/* 3D Packing Visualization */}
          <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
            <CardHeader>
              <CardTitle className="text-base">3D Packing Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <PackingViewer packedBoxes={result.packedBoxes} />
            </CardContent>
          </Card>

          {/* Surcharge warnings */}
          {result.packedBoxes.some((b) => b.surcharges.length > 0) && (
            <div className="space-y-2">
              {result.packedBoxes.flatMap((box) =>
                box.surcharges.map((s, i) => (
                  <Alert
                    key={`${box.boxIndex}-${i}`}
                    variant="destructive"
                    className={
                      s.type.includes("AHS")
                        ? "border-amber-500 bg-amber-50 text-amber-800 rounded-2xl"
                        : "border-red-500 bg-red-50 text-red-800 rounded-2xl"
                    }
                  >
                    <Warning size={16} />
                    <AlertDescription>
                      <strong>Box {box.boxIndex} — {s.type}:</strong> ${s.amount.toFixed(2)} — {s.reason}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          )}

          {/* Pack instructions */}
          <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
            <CardHeader>
              <CardTitle className="text-base">Pack Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.packedBoxes.map((box) => (
                <div key={box.boxIndex} className="space-y-2">
                  <p className="text-sm font-medium">Box {box.boxIndex}: {box.boxName}</p>
                  <ol className="list-decimal list-inside space-y-1 pl-2 text-sm text-muted-foreground">
                    {box.packInstructions.map((instr, i) => {
                      const isFragile = instr.toLowerCase().includes("fragile");
                      const isVoidFill =
                        instr.toLowerCase().includes("void") || instr.toLowerCase().includes("fill");
                      return (
                        <li
                          key={i}
                          className={
                            isFragile
                              ? "text-red-600 font-medium"
                              : isVoidFill
                              ? "text-[#7AD427]"
                              : ""
                          }
                        >
                          {isFragile && <Warning size={14} className="inline mr-1" />}
                          {instr}
                        </li>
                      );
                    })}
                  </ol>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Flat rate comparison */}
          {result.flatRateOptions && result.flatRateOptions.length > 0 && (
            <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-base">Flat Rate Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border p-3 gap-2">
                  <span className="text-sm font-medium">Standard Optimization</span>
                  <span className="text-sm font-semibold">${result.totalCost.toFixed(2)}</span>
                </div>
                {result.flatRateOptions
                  .filter((opt) => opt.fits)
                  .map((opt) => {
                    const saves = result.totalCost - opt.cost;
                    const isCheaper = saves > 0;
                    return (
                      <div
                        key={opt.name}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border p-3 gap-2 ${
                          isCheaper ? "border-[#91E440] bg-[#E8F5EE]" : ""
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${opt.cost.toFixed(2)}</span>
                          {isCheaper && (
                            <Badge className="bg-[#91E440] text-[#0B4228] rounded-full font-bold">
                              Save ${saves.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Savings summary */}
          <Card className="border-[#0B4228]/10 bg-[#E8F5EE]/50 rounded-2xl sm:rounded-3xl">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Naive cost (no optimization)</p>
                  <p className="text-base sm:text-lg font-semibold">${result.naiveCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">Optimized cost</p>
                  <p className="text-base sm:text-lg font-semibold text-[#7AD427]">${result.optimizedCost.toFixed(2)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-center text-sm font-medium text-[#7AD427]">
                Your optimization saved ${result.savingsAmount.toFixed(2)} ({result.savingsPercent.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
