"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, DollarSign, Package, Box } from "lucide-react";

interface KpiCardsProps {
  optimizationCount: number;
  totalSavings: number;
  itemCount: number;
  boxCount: number;
  isLoading: boolean;
}

const cards = [
  { key: "optimizations", label: "Total Optimizations", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "savings", label: "Cumulative Savings", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { key: "items", label: "Items in Catalog", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "boxes", label: "Active Box Types", icon: Box, color: "text-amber-600", bg: "bg-amber-50" },
];

export function KpiCards({ optimizationCount, totalSavings, itemCount, boxCount, isLoading }: KpiCardsProps) {
  const values: Record<string, string> = {
    optimizations: optimizationCount.toLocaleString(),
    savings: `$${totalSavings.toFixed(2)}`,
    items: itemCount.toLocaleString(),
    boxes: boxCount.toLocaleString(),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">{values[card.key]}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
