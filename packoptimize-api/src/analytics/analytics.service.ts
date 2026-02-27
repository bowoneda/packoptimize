import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSavings(tenantId: string, period: string = '30d') {
    return this.prisma.withTenantContext(async (tx) => {
      const now = new Date();
      let periodStart: Date;

      switch (period) {
        case '7d':
          periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          periodStart = new Date('2020-01-01');
          break;
        case '30d':
        default:
          periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get all savings logs in period
      const savingsLogs = await tx.savingsLog.findMany({
        where: {
          tenantId,
          createdAt: { gte: periodStart },
        },
        include: {
          optimizationRun: {
            select: {
              id: true,
              parameters: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Summary
      const totalOptimizations = savingsLogs.length;
      const totalSavings = savingsLogs.reduce((s, l) => s + l.savingsAmount, 0);
      const totalNaive = savingsLogs.reduce((s, l) => s + l.naiveBoxCost, 0);
      const averageSavingsPercent = totalNaive > 0
        ? (totalSavings / totalNaive) * 100
        : 0;

      // Get optimization results for utilization
      const runIds = savingsLogs.map((l) => l.optimizationRunId);
      const optimizationResults = runIds.length > 0
        ? await tx.optimizationResult.findMany({
            where: { optimizationRunId: { in: runIds } },
            select: { optimizationRunId: true, utilization: true },
          })
        : [];

      const avgUtilByRun = new Map<string, number>();
      const runUtilGroups = new Map<string, number[]>();
      for (const r of optimizationResults) {
        const arr = runUtilGroups.get(r.optimizationRunId) ?? [];
        arr.push(r.utilization);
        runUtilGroups.set(r.optimizationRunId, arr);
      }
      for (const [runId, utils] of runUtilGroups) {
        avgUtilByRun.set(runId, utils.reduce((a, b) => a + b, 0) / utils.length);
      }

      const totalBoxesUsed = optimizationResults.length;
      const averageUtilization = avgUtilByRun.size > 0
        ? [...avgUtilByRun.values()].reduce((a, b) => a + b, 0) / avgUtilByRun.size
        : 0;

      // Timeline (group by date)
      const timelineMap = new Map<string, { optimizations: number; savings: number; utilizations: number[] }>();
      for (const log of savingsLogs) {
        const date = log.createdAt.toISOString().split('T')[0];
        const entry = timelineMap.get(date) ?? { optimizations: 0, savings: 0, utilizations: [] };
        entry.optimizations++;
        entry.savings += log.savingsAmount;
        const util = avgUtilByRun.get(log.optimizationRunId);
        if (util !== undefined) entry.utilizations.push(util);
        timelineMap.set(date, entry);
      }

      const timeline = [...timelineMap.entries()].map(([date, data]) => ({
        date,
        optimizations: data.optimizations,
        savings: parseFloat(data.savings.toFixed(2)),
        avgUtilization: data.utilizations.length > 0
          ? parseFloat((data.utilizations.reduce((a, b) => a + b, 0) / data.utilizations.length).toFixed(4))
          : 0,
      }));

      // Top savings items — extract from run parameters
      const itemSavings = new Map<string, { name: string; timesOptimized: number; totalSavings: number }>();
      for (const log of savingsLogs) {
        const params = log.optimizationRun?.parameters as Record<string, unknown> | null;
        const itemCount = (params?.itemCount as number) ?? 1;
        const perItemSavings = log.savingsAmount / itemCount;

        // We track per-run, not per-item (we don't have per-item breakdown in savings)
        const runKey = `run-${log.optimizationRunId}`;
        if (!itemSavings.has(runKey)) {
          itemSavings.set(runKey, {
            name: `Optimization Run`,
            timesOptimized: 1,
            totalSavings: log.savingsAmount,
          });
        }
      }

      // Instead, return top runs by savings
      const topSavingsItems = savingsLogs
        .filter((l) => l.savingsAmount > 0)
        .sort((a, b) => b.savingsAmount - a.savingsAmount)
        .slice(0, 10)
        .map((l) => ({
          optimizationRunId: l.optimizationRunId,
          naiveCost: parseFloat(l.naiveBoxCost.toFixed(2)),
          optimizedCost: parseFloat(l.optimizedCost.toFixed(2)),
          savings: parseFloat(l.savingsAmount.toFixed(2)),
          date: l.createdAt.toISOString().split('T')[0],
        }));

      return {
        summary: {
          totalOptimizations,
          totalSavings: parseFloat(totalSavings.toFixed(2)),
          averageSavingsPercent: parseFloat(averageSavingsPercent.toFixed(1)),
          averageUtilization: parseFloat(averageUtilization.toFixed(4)),
          totalBoxesUsed,
          periodStart: periodStart.toISOString().split('T')[0],
          periodEnd: now.toISOString().split('T')[0],
        },
        timeline,
        topSavingsItems,
      };
    });
  }
}
