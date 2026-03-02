"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartLineUp } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SavingsChartProps {
  data: { period: string; savings: number; runs: number }[];
  isLoading: boolean;
}

export function SavingsChart({ data, isLoading }: SavingsChartProps) {
  return (
    <Card className="rounded-2xl sm:rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader>
        <CardTitle className="text-base text-[#0B4228]">Savings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[200px] sm:h-[300px]">
            <EmptyState
              icon={ChartLineUp}
              title="No savings data yet"
              description="Run optimizations to track your shipping cost savings over time."
              actionLabel="Run Optimization"
              actionHref="/optimize"
            />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250} className="sm:[&]:!h-[300px]">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#8B95A5" />
              <YAxis tick={{ fontSize: 12 }} stroke="#8B95A5" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Savings"]}
                contentStyle={{ borderRadius: "16px", border: "1px solid #E8EAED" }}
              />
              <Bar dataKey="savings" fill="#0B4228" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
