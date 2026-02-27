import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { selectOptimalBoxes } from './engine/box-selector';
import { compareFlatRateOptions } from './engine/flat-rate-comparator';
import {
  AvailableBox,
  CarrierRules,
  CarrierType,
  CompatibilityRule,
  FillMaterial,
  InsertItem,
  OptimizationOptions,
  OptimizationResult,
  OptimizeTarget,
  PackableItem,
} from './engine/types';
import { OptimizeRequestDto } from './dto/optimize-request.dto';
import { BatchOptimizeRequestDto } from './dto/batch-optimize-request.dto';

@Injectable()
export class OptimizationService {
  private readonly logger = new Logger(OptimizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

  async optimize(
    tenantId: string,
    userId: string | null,
    request: OptimizeRequestDto,
  ): Promise<OptimizationResult> {
    const startTime = Date.now();

    // Check plan limits before running optimization
    const planCheck = await this.billingService.checkPlanLimit(tenantId);
    if (!planCheck.allowed) {
      throw new ForbiddenException(planCheck.reason);
    }

    return this.prisma.withTenantContext(async (tx) => {
      // 1. Load items from DB
      const itemIds = request.items.map((i) => i.id);
      const dbItems = await tx.item.findMany({
        where: { tenantId, id: { in: itemIds } },
      });

      // Verify all items exist
      const foundIds = new Set(dbItems.map((i) => i.id));
      for (const reqItem of request.items) {
        if (!foundIds.has(reqItem.id)) {
          throw new NotFoundException(`Item with ID '${reqItem.id}' not found`);
        }
      }

      // 2. Load box types
      const boxWhereClause: { tenantId: string; isActive: boolean; id?: { in: string[] } } = {
        tenantId,
        isActive: true,
      };
      if (request.boxTypeIds && request.boxTypeIds.length > 0) {
        boxWhereClause.id = { in: request.boxTypeIds };
      }
      const dbBoxTypes = await tx.boxType.findMany({
        where: boxWhereClause,
      });

      if (dbBoxTypes.length === 0) {
        throw new NotFoundException('No active box types found for this tenant');
      }

      // 3. Load carrier rules
      const carrier = (request.carrier ?? 'FEDEX') as CarrierType;
      const dbCarrierRules = await tx.carrierConstraint.findFirst({
        where: { carrier },
        orderBy: { effectiveDate: 'desc' },
      });

      if (!dbCarrierRules) {
        throw new NotFoundException(`No carrier rules found for ${carrier}`);
      }

      // 4. Load insert materials (alwaysInclude = true)
      const dbInserts = await tx.insertMaterial.findMany({
        where: { tenantId, alwaysInclude: true },
      });

      // 5. Load compatibility rules for request items
      const dbCompatRules = await tx.itemCompatibility.findMany({
        where: {
          tenantId,
          OR: [
            { itemIdA: { in: itemIds } },
            { itemIdB: { in: itemIds } },
          ],
        },
      });

      // 6. Map to engine types
      const packableItems: PackableItem[] = request.items.map((reqItem) => {
        const dbItem = dbItems.find((i) => i.id === reqItem.id)!;
        return {
          id: dbItem.id,
          sku: dbItem.sku,
          name: dbItem.name,
          width: dbItem.width,
          height: dbItem.height,
          depth: dbItem.depth,
          weight: dbItem.weight,
          isFragile: dbItem.isFragile,
          canRotate: dbItem.canRotate,
          maxStackWeight: dbItem.maxStackWeight,
          quantity: reqItem.quantity,
        };
      });

      const availableBoxes: AvailableBox[] = dbBoxTypes.map((b) => ({
        id: b.id,
        name: b.name,
        innerWidth: b.innerWidth,
        innerHeight: b.innerHeight,
        innerDepth: b.innerDepth,
        outerWidth: b.outerWidth,
        outerHeight: b.outerHeight,
        outerDepth: b.outerDepth,
        boxWeight: b.boxWeight,
        maxWeight: b.maxWeight,
        cost: b.cost,
      }));

      const surchargeRates = dbCarrierRules.surchargeRates as Record<string, number> ?? {};
      const carrierRules: CarrierRules = {
        carrier,
        maxLengthInches: dbCarrierRules.maxLengthInches,
        maxGirthInches: dbCarrierRules.maxGirthInches,
        maxWeightLbs: dbCarrierRules.maxWeightLbs,
        dimDivisor: dbCarrierRules.dimDivisor,
        ahsCubicThreshold: dbCarrierRules.ahsCubicThreshold,
        oversizeCubicThreshold: dbCarrierRules.oversizeCubicThreshold,
        ahsLengthThreshold: dbCarrierRules.ahsLengthThreshold,
        ahsWidthThreshold: dbCarrierRules.ahsWidthThreshold,
        ahsMinBillableWeight: dbCarrierRules.ahsMinBillableWeight,
        surchargeRates: {
          ahsDimension: surchargeRates['ahs'] ?? surchargeRates['ahsDimension'],
          ahsWeight: surchargeRates['ahsWeight'],
          oversize: surchargeRates['oversize'],
          unauthorized: surchargeRates['unauthorized'],
        },
      };

      const insertMaterials: InsertItem[] = dbInserts.map((ins) => ({
        id: ins.id,
        name: ins.name,
        width: ins.width,
        height: ins.height,
        depth: ins.depth,
        weight: ins.weight,
      }));

      const compatibilityRules: CompatibilityRule[] = dbCompatRules.map((r) => ({
        itemIdA: r.itemIdA,
        itemIdB: r.itemIdB,
        rule: r.rule as 'INCOMPATIBLE' | 'MUST_SHIP_TOGETHER',
      }));

      const options: OptimizationOptions = {
        carrier,
        optimizeFor: (request.optimizeFor ?? 'COST') as OptimizeTarget,
        maxBoxes: request.maxBoxes ?? 10,
        includeFlatRate: request.includeFlatRate ?? true,
        fillMaterial: (request.fillMaterial ?? 'AIR_PILLOWS') as FillMaterial,
        insertMaterials,
        compatibilityRules,
      };

      // 7. Run optimization
      const { packedBoxes, unpackedItems, naiveCost } = selectOptimalBoxes(
        packableItems,
        availableBoxes,
        carrierRules,
        options,
      );

      // 8. Flat rate comparison
      const flatRateOptions =
        options.includeFlatRate
          ? compareFlatRateOptions(
              packableItems,
              packedBoxes.reduce((s, b) => s + b.totalCost, 0),
              carrier,
            )
          : [];

      const executionTimeMs = Date.now() - startTime;

      // Build result
      const totalCost = packedBoxes.reduce((s, b) => s + b.totalCost, 0);
      const totalWeight = packedBoxes.reduce((s, b) => s + b.totalWeight, 0);
      const totalBillableWeight = packedBoxes.reduce(
        (s, b) => s + b.billableWeightGrams,
        0,
      );
      const averageUtilization =
        packedBoxes.length > 0
          ? packedBoxes.reduce((s, b) => s + b.utilization, 0) / packedBoxes.length
          : 0;

      const savingsAmount = naiveCost - totalCost;
      const savingsPercent = naiveCost > 0 ? (savingsAmount / naiveCost) * 100 : 0;

      const result: OptimizationResult = {
        success: unpackedItems.length === 0,
        packedBoxes,
        unpackedItems,
        totalBoxes: packedBoxes.length,
        totalCost,
        totalWeight,
        totalBillableWeight,
        averageUtilization,
        naiveCost,
        optimizedCost: totalCost,
        savingsAmount,
        savingsPercent,
        flatRateOptions,
        algorithm: 'LAYER_BEST_FIT',
        executionTimeMs,
        carrier,
      };

      // 9. Save OptimizationRun
      const run = await tx.optimizationRun.create({
        data: {
          tenantId,
          userId,
          status: 'COMPLETED',
          algorithm: result.algorithm,
          parameters: {
            carrier,
            optimizeFor: options.optimizeFor,
            maxBoxes: options.maxBoxes,
            fillMaterial: options.fillMaterial,
            itemCount: packableItems.length,
          },
          duration: executionTimeMs,
          startedAt: new Date(startTime),
          completedAt: new Date(),
        },
      });

      // 10. Save OptimizationResult(s)
      for (const pb of packedBoxes) {
        await tx.optimizationResult.create({
          data: {
            optimizationRunId: run.id,
            boxTypeId: pb.boxId.startsWith('flat-rate-') ? null : pb.boxId,
            boxIndex: pb.boxIndex,
            utilization: pb.utilization,
            placements: JSON.parse(JSON.stringify(pb.placements)),
            voidFillVolume: pb.voidFill.voidVolumeCubicMm,
            totalWeight: pb.totalWeight,
            dimWeight: pb.dimWeightGrams,
            billableWeight: pb.billableWeightGrams,
            surcharges: JSON.parse(JSON.stringify(pb.surcharges)),
            packInstructions: pb.packInstructions,
          },
        });
      }

      // 11. Save SavingsLog
      await tx.savingsLog.create({
        data: {
          tenantId,
          optimizationRunId: run.id,
          naiveBoxCost: naiveCost,
          optimizedCost: totalCost,
          savingsAmount,
        },
      });

      // 12. Increment UsageRecord
      const now = new Date();
      const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await tx.usageRecord.create({
        data: {
          tenantId,
          type: 'OPTIMIZATION_RUN',
          quantity: 1,
          billingPeriod,
        },
      });

      // 13. Report usage to Stripe (fire-and-forget)
      this.billingService.reportUsageToStripe(tenantId).catch(() => {
        // Errors already logged inside reportUsageToStripe
      });

      this.logger.log(
        `Optimization completed: ${packedBoxes.length} boxes, ${executionTimeMs}ms, savings: $${savingsAmount.toFixed(2)}`,
      );

      return result;
    });
  }

  async batchOptimize(
    tenantId: string,
    userId: string | null,
    request: BatchOptimizeRequestDto,
  ) {
    const batchId = crypto.randomUUID();
    const results: Array<{
      orderId: string;
      status: 'COMPLETED' | 'FAILED';
      result?: OptimizationResult;
      error?: string;
    }> = [];

    let totalBoxes = 0;
    let totalCost = 0;
    let totalSavings = 0;
    let totalUtilization = 0;
    let completedCount = 0;
    let failedCount = 0;

    for (const order of request.orders) {
      try {
        const result = await this.optimize(tenantId, userId, {
          items: order.items,
          carrier: request.carrier,
          optimizeFor: request.optimizeFor,
          fillMaterial: request.fillMaterial,
        });

        results.push({ orderId: order.orderId, status: 'COMPLETED', result });
        totalBoxes += result.totalBoxes;
        totalCost += result.totalCost;
        totalSavings += result.savingsAmount;
        totalUtilization += result.averageUtilization;
        completedCount++;
      } catch (error) {
        results.push({
          orderId: order.orderId,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failedCount++;
      }
    }

    return {
      batchId,
      totalOrders: request.orders.length,
      completed: completedCount,
      failed: failedCount,
      results,
      summary: {
        totalBoxes,
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalSavings: parseFloat(totalSavings.toFixed(2)),
        averageUtilization: completedCount > 0
          ? parseFloat((totalUtilization / completedCount).toFixed(4))
          : 0,
      },
    };
  }
}
