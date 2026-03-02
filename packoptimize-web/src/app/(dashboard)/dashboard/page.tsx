"use client";

import { useItems } from "@/hooks/use-items";
import { useBoxes } from "@/hooks/use-boxes";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { SavingsChart } from "@/components/dashboard/savings-chart";
import { MobileAlertCard } from "@/components/dashboard/mobile-alert-card";
import { MobileKpiCards } from "@/components/dashboard/mobile-kpi-cards";
import { MobileRecentRuns } from "@/components/dashboard/mobile-recent-runs";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";

export default function DashboardPage() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: boxes, isLoading: boxesLoading } = useBoxes();

  const isLoading = itemsLoading || boxesLoading;

  const kpiProps = {
    optimizationCount: 0,
    totalSavings: 0,
    itemCount: items?.length ?? 0,
    boxCount: boxes?.filter((b) => b.isActive)?.length ?? boxes?.length ?? 0,
    isLoading,
  };

  return (
    <>
      {/* ===== MOBILE DASHBOARD (< md) ===== */}
      <div className="md:hidden space-y-4">
        <OnboardingChecklist
          hasBoxes={(boxes?.length ?? 0) > 0}
          hasItems={(items?.length ?? 0) > 0}
          hasRuns={false}
        />
        <MobileAlertCard />
        <MobileKpiCards {...kpiProps} />
        <MobileRecentRuns runs={[]} isLoading={false} />
      </div>

      {/* ===== DESKTOP DASHBOARD (≥ md) ===== */}
      <div className="hidden md:block space-y-6">
        <OnboardingChecklist
          hasBoxes={(boxes?.length ?? 0) > 0}
          hasItems={(items?.length ?? 0) > 0}
          hasRuns={false}
        />
        <KpiCards {...kpiProps} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentRuns runs={[]} isLoading={false} />
          <SavingsChart data={[]} isLoading={false} />
        </div>
      </div>
    </>
  );
}
