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
import { format } from "date-fns";
import type { OptimizationRun } from "@/types/api";

interface RecentRunsProps {
  runs: OptimizationRun[];
  isLoading: boolean;
}

export function RecentRuns({ runs, isLoading }: RecentRunsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Optimization Runs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No optimization runs yet. Go to Optimize to run your first optimization.
          </p>
        ) : (
          <Table>
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
                <TableRow key={run.id}>
                  <TableCell className="text-sm">
                    {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{run.itemCount}</TableCell>
                  <TableCell>{run.boxCount}</TableCell>
                  <TableCell>${run.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      ${run.savingsAmount.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{run.carrier}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
