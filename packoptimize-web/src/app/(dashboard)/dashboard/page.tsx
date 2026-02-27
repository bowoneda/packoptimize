"use client";

import { useItems } from "@/hooks/use-items";
import { useBoxes } from "@/hooks/use-boxes";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { SavingsChart } from "@/components/dashboard/savings-chart";

export default function DashboardPage() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: boxes, isLoading: boxesLoading } = useBoxes();

  const isLoading = itemsLoading || boxesLoading;

  return (
    <div className="space-y-6">
      <KpiCards
        optimizationCount={0}
        totalSavings={0}
        itemCount={items?.length ?? 0}
        boxCount={boxes?.filter((b) => b.isActive)?.length ?? boxes?.length ?? 0}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentRuns runs={[]} isLoading={false} />
        <SavingsChart data={[]} isLoading={false} />
      </div>
    </div>
  );
}
