import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaServiceWithoutTenant } from '../prisma/prisma.service';
import type {
  AdminTenantDetail,
  AdminTenantSummary,
  PlatformStats,
} from './dto/admin-tenant.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaServiceWithoutTenant) {}

  async getPlatformStats(): Promise<PlatformStats> {
    const [
      tenantCount,
      userCount,
      completedOptimizationCount,
      planRows,
      recentTenants,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.optimizationRun.count({ where: { status: 'COMPLETED' } }),
      this.prisma.tenant.groupBy({ by: ['plan'], _count: { id: true } }),
      this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, plan: true, createdAt: true },
      }),
    ]);

    const planBreakdown = Object.fromEntries(
      planRows.map((r) => [r.plan, r._count.id]),
    );

    return {
      tenantCount,
      userCount,
      completedOptimizationCount,
      planBreakdown,
      recentTenants,
    };
  }

  async findAllTenants(): Promise<AdminTenantSummary[]> {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            items: true,
            optimizationRuns: true,
            apiKeys: true,
          },
        },
      },
    });
  }

  async findOneTenant(id: string): Promise<AdminTenantDetail> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            items: true,
            optimizationRuns: true,
            apiKeys: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            isSuperAdmin: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // 30-day daily run counts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const runs = await this.prisma.optimizationRun.findMany({
      where: { tenantId: id, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, number>();
    for (const run of runs) {
      const day = run.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
    const dailyRuns = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const savingsAgg = await this.prisma.savingsLog.aggregate({
      where: { tenantId: id },
      _sum: { savingsAmount: true },
    });

    return {
      ...tenant,
      dailyRuns,
      totalSavings: savingsAgg._sum.savingsAmount ?? 0,
    };
  }

  async updateTenantStatus(
    id: string,
    isActive: boolean,
    adminUserId: string,
  ): Promise<{ id: string; isActive: boolean }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    this.logger.warn(
      `Admin action: tenant ${id} set isActive=${isActive} by admin ${adminUserId}`,
    );

    return updated;
  }
}
