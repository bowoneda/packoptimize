"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightning } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/empty-state";
import { format } from "date-fns";
import type { OptimizationRun } from "@/types/api";

interface RecentRunsProps {
  runs: OptimizationRun[];
  isLoading: boolean;
}

export function RecentRuns({ runs, isLoading }: RecentRunsProps) {
  return (
    <Card className="rounded-2xl sm:rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader>
        <CardTitle className="text-base text-[#0B4228]">Recent Optimization Runs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <EmptyState
            icon={Lightning}
            title="No optimization runs yet"
            description="Run your first optimization to see results here."
            actionLabel="Start Optimizing"
            actionHref="/optimize"
          />
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Boxes</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Carrier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id} className="hover:bg-[#F5F6F8] transition-colors">
                  <TableCell className="text-sm">
                    {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{run.itemCount}</TableCell>
                  <TableCell>{run.boxCount}</TableCell>
                  <TableCell>${run.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">
                      ${run.savingsAmount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">{run.carrier}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
