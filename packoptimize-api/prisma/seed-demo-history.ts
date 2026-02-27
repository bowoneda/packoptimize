import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { selectOptimalBoxes } from '../src/optimization/engine/box-selector';
import { compareFlatRateOptions } from '../src/optimization/engine/flat-rate-comparator';
import type {
  AvailableBox,
  CarrierRules,
  CarrierType,
  OptimizationOptions,
  PackableItem,
} from '../src/optimization/engine/types';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_RUNS = 50;
const DAYS_BACK = 60;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
}

async function main() {
  console.log('=== Seeding Demo History ===\n');

  // Find SwiftShip tenant
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'swiftship' } });
  if (!tenant) {
    console.error('SwiftShip tenant not found. Run the main seed first.');
    process.exit(1);
  }

  // Find admin user
  const adminUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, role: 'ADMIN' },
  });

  // Clear previous demo data
  const oldDemoRuns = await prisma.optimizationRun.findMany({
    where: {
      tenantId: tenant.id,
      parameters: { path: ['isDemo'], equals: true },
    },
    select: { id: true },
  });

  if (oldDemoRuns.length > 0) {
    const oldIds = oldDemoRuns.map((r) => r.id);
    await prisma.savingsLog.deleteMany({ where: { optimizationRunId: { in: oldIds } } });
    await prisma.optimizationResult.deleteMany({ where: { optimizationRunId: { in: oldIds } } });
    await prisma.optimizationRun.deleteMany({ where: { id: { in: oldIds } } });
    console.log(`Cleared ${oldDemoRuns.length} old demo runs`);
  }

  // Load items and box types
  const items = await prisma.item.findMany({ where: { tenantId: tenant.id } });
  const boxTypes = await prisma.boxType.findMany({ where: { tenantId: tenant.id, isActive: true } });

  if (items.length === 0 || boxTypes.length === 0) {
    console.error('No items or box types found. Run the main seed first.');
    process.exit(1);
  }

  // Load carrier rules
  const carriers: CarrierType[] = ['FEDEX', 'UPS', 'USPS'];
  const carrierRulesMap = new Map<string, CarrierRules>();

  for (const carrier of carriers) {
    const dbRules = await prisma.carrierConstraint.findFirst({
      where: { carrier },
      orderBy: { effectiveDate: 'desc' },
    });
    if (dbRules) {
      const sr = (dbRules.surchargeRates as Record<string, number>) ?? {};
      carrierRulesMap.set(carrier, {
        carrier,
        maxLengthInches: dbRules.maxLengthInches,
        maxGirthInches: dbRules.maxGirthInches,
        maxWeightLbs: dbRules.maxWeightLbs,
        dimDivisor: dbRules.dimDivisor,
        ahsCubicThreshold: dbRules.ahsCubicThreshold,
        oversizeCubicThreshold: dbRules.oversizeCubicThreshold,
        ahsLengthThreshold: dbRules.ahsLengthThreshold,
        ahsWidthThreshold: dbRules.ahsWidthThreshold,
        ahsMinBillableWeight: dbRules.ahsMinBillableWeight,
        surchargeRates: {
          ahsDimension: sr['ahs'] ?? sr['ahsDimension'],
          ahsWeight: sr['ahsWeight'],
          oversize: sr['oversize'],
          unauthorized: sr['unauthorized'],
        },
      });
    }
  }

  const availableBoxes: AvailableBox[] = boxTypes.map((b) => ({
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

  console.log(`Found ${items.length} items, ${boxTypes.length} box types`);
  console.log(`Generating ${DEMO_RUNS} demo optimization runs...\n`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < DEMO_RUNS; i++) {
    // Random item selection: 2-8 items with random quantities
    const itemCount = randomInt(2, Math.min(8, items.length));
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, itemCount);

    const packableItems: PackableItem[] = selectedItems.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      width: item.width,
      height: item.height,
      depth: item.depth,
      weight: item.weight,
      isFragile: item.isFragile,
      canRotate: item.canRotate,
      maxStackWeight: item.maxStackWeight,
      quantity: randomInt(1, 5),
    }));

    // Random carrier and strategy
    const carrier = carriers[randomInt(0, carriers.length - 1)];
    const carrierRules = carrierRulesMap.get(carrier);
    if (!carrierRules) continue;

    const strategies = ['COST', 'SPACE', 'FEWEST_BOXES'] as const;
    const optimizeFor = strategies[randomInt(0, strategies.length - 1)];
    const fills = ['AIR_PILLOWS', 'KRAFT_PAPER', 'BUBBLE_WRAP'] as const;
    const fillMaterial = fills[randomInt(0, fills.length - 1)];

    const options: OptimizationOptions = {
      carrier,
      optimizeFor,
      maxBoxes: 10,
      includeFlatRate: true,
      fillMaterial,
      insertMaterials: [],
      compatibilityRules: [],
    };

    try {
      const startTime = Date.now();
      const { packedBoxes, unpackedItems, naiveCost } = selectOptimalBoxes(
        packableItems,
        availableBoxes,
        carrierRules,
        options,
      );

      if (packedBoxes.length === 0) {
        skipCount++;
        continue;
      }

      const executionTimeMs = Date.now() - startTime;
      const totalCost = packedBoxes.reduce((s, b) => s + b.totalCost, 0);
      const savingsAmount = naiveCost - totalCost;
      const runDate = randomDate(DAYS_BACK);

      // Save to database
      const run = await prisma.optimizationRun.create({
        data: {
          tenantId: tenant.id,
          userId: adminUser?.id ?? null,
          status: 'COMPLETED',
          algorithm: 'LAYER_BEST_FIT',
          parameters: {
            carrier,
            optimizeFor,
            maxBoxes: 10,
            fillMaterial,
            itemCount: packableItems.length,
            isDemo: true,
          },
          duration: executionTimeMs,
          startedAt: runDate,
          completedAt: new Date(runDate.getTime() + executionTimeMs),
          createdAt: runDate,
        },
      });

      for (const pb of packedBoxes) {
        await prisma.optimizationResult.create({
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

      await prisma.savingsLog.create({
        data: {
          tenantId: tenant.id,
          optimizationRunId: run.id,
          naiveBoxCost: naiveCost,
          optimizedCost: totalCost,
          savingsAmount,
          createdAt: runDate,
        },
      });

      // Create usage record
      const billingPeriod = `${runDate.getFullYear()}-${String(runDate.getMonth() + 1).padStart(2, '0')}`;
      await prisma.usageRecord.create({
        data: {
          tenantId: tenant.id,
          type: 'OPTIMIZATION_RUN',
          quantity: 1,
          billingPeriod,
          metadata: { isDemo: true },
          createdAt: runDate,
        },
      });

      successCount++;
      process.stdout.write(`\r  Progress: ${successCount}/${DEMO_RUNS} runs created`);
    } catch (error) {
      skipCount++;
    }
  }

  console.log(`\n\n=== Demo History Complete ===`);
  console.log(`Created: ${successCount} optimization runs`);
  console.log(`Skipped: ${skipCount} (items didn't fit or errors)`);

  // Quick summary
  const totalSavings = await prisma.savingsLog.aggregate({
    where: { tenantId: tenant.id },
    _sum: { savingsAmount: true },
    _count: true,
  });

  console.log(`\nTotal runs in DB: ${totalSavings._count}`);
  console.log(`Total savings: $${(totalSavings._sum.savingsAmount ?? 0).toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
