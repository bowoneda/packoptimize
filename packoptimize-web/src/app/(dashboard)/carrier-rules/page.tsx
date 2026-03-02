"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCarrierRules } from "@/hooks/use-carrier-rules";
import { Books, Truck } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";

function formatWeight(lbs: number) {
  return `${lbs} lbs`;
}

function formatLength(inches: number) {
  return `${inches}"`;
}

export default function CarrierRulesPage() {
  const { data: rules, isLoading } = useCarrierRules();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Carrier Rules</h1>
        <TableSkeleton rows={3} />
      </div>
    );
  }

  const carriers = ["FEDEX", "UPS", "USPS"];
  const carrierLabels: Record<string, string> = {
    FEDEX: "FedEx",
    UPS: "UPS",
    USPS: "USPS",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Carrier Rules</h1>
        <p className="text-sm text-muted-foreground">
          Carrier size limits, DIM divisors, and surcharge thresholds
        </p>
      </div>

      <Tabs defaultValue="FEDEX">
        <TabsList className="flex w-full overflow-x-auto">
          {carriers.map((c) => (
            <TabsTrigger key={c} value={c}>
              <Books size={14} className="mr-1.5" />
              {carrierLabels[c]}
            </TabsTrigger>
          ))}
        </TabsList>

        {carriers.map((carrier) => {
          const rule = rules?.find((r) => r.carrier === carrier);
          if (!rule) return (
            <TabsContent key={carrier} value={carrier}>
              <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
                <CardContent>
                  <EmptyState
                    icon={Truck}
                    title={`No rules for ${carrierLabels[carrier]}`}
                    description="Carrier rules are loaded from your API. Check your backend configuration."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );

          return (
            <TabsContent key={carrier} value={carrier}>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-sm">Size & Weight Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Row label="Max Length" value={formatLength(rule.maxLengthInches)} />
                    <Row label="Max Girth (L + 2W + 2H)" value={formatLength(rule.maxGirthInches)} />
                    <Row label="Max Weight" value={formatWeight(rule.maxWeightLbs)} />
                    <Row label="DIM Divisor" value={String(rule.dimDivisor)} />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-sm">Additional Handling (AHS) Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Row label="AHS Length Threshold" value={formatLength(rule.ahsLengthThreshold)} />
                    <Row label="AHS Width Threshold" value={formatLength(rule.ahsWidthThreshold)} />
                    <Row label="AHS Cubic Threshold" value={`${rule.ahsCubicThreshold} cu in`} />
                    <Row label="AHS Min Billable Weight" value={formatWeight(rule.ahsMinBillableWeight)} />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-sm">Oversize Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Row label="Oversize Cubic Threshold" value={`${rule.oversizeCubicThreshold} cu in`} />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-sm">Surcharge Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(rule.surchargeRates).map(([type, amount]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {type.replace(/_/g, " ").toLowerCase()}
                        </span>
                        <Badge variant="secondary" className="shrink-0">${Number(amount).toFixed(2)}</Badge>
                      </div>
                    ))}
                    {Object.keys(rule.surchargeRates).length === 0 && (
                      <p className="text-sm text-muted-foreground">No surcharges configured</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
