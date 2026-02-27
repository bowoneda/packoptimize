import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // --- Tenant 1: SwiftShip Logistics ---
  const swiftship = await prisma.tenant.upsert({
    where: { slug: 'swiftship' },
    update: {},
    create: {
      name: 'SwiftShip Logistics',
      slug: 'swiftship',
      plan: 'STARTER',
    },
  });
  console.log(`Tenant created: ${swiftship.name} (${swiftship.id})`);

  const swiftshipPasswordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: swiftship.id, email: 'admin@swiftship.com' } },
    update: {},
    create: {
      tenantId: swiftship.id,
      email: 'admin@swiftship.com',
      passwordHash: swiftshipPasswordHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: swiftship.id, email: 'ops@swiftship.com' } },
    update: {},
    create: {
      tenantId: swiftship.id,
      email: 'ops@swiftship.com',
      passwordHash: swiftshipPasswordHash,
      role: 'OPERATOR',
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: swiftship.id, email: 'viewer@swiftship.com' } },
    update: {},
    create: {
      tenantId: swiftship.id,
      email: 'viewer@swiftship.com',
      passwordHash: swiftshipPasswordHash,
      role: 'VIEWER',
    },
  });

  console.log('SwiftShip users created');

  // --- Tenant 2: TechDirect ---
  const techdirect = await prisma.tenant.upsert({
    where: { slug: 'techdirect' },
    update: {},
    create: {
      name: 'TechDirect',
      slug: 'techdirect',
      plan: 'GROWTH',
    },
  });
  console.log(`Tenant created: ${techdirect.name} (${techdirect.id})`);

  const techdirectPasswordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: techdirect.id, email: 'admin@techdirect.com' } },
    update: {},
    create: {
      tenantId: techdirect.id,
      email: 'admin@techdirect.com',
      passwordHash: techdirectPasswordHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: techdirect.id, email: 'ops@techdirect.com' } },
    update: {},
    create: {
      tenantId: techdirect.id,
      email: 'ops@techdirect.com',
      passwordHash: techdirectPasswordHash,
      role: 'OPERATOR',
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: techdirect.id, email: 'viewer@techdirect.com' } },
    update: {},
    create: {
      tenantId: techdirect.id,
      email: 'viewer@techdirect.com',
      passwordHash: techdirectPasswordHash,
      role: 'VIEWER',
    },
  });

  console.log('TechDirect users created');

  // --- Carrier Constraints (system-level, no tenantId) ---
  const effectiveDate = new Date('2026-01-01T00:00:00Z');

  // FedEx
  await prisma.carrierConstraint.upsert({
    where: { carrier_effectiveDate: { carrier: 'FEDEX', effectiveDate } },
    update: {},
    create: {
      carrier: 'FEDEX',
      maxLengthInches: 108,
      maxGirthInches: 165,
      maxWeightLbs: 150,
      dimDivisor: 139,
      ahsCubicThreshold: 10368,
      oversizeCubicThreshold: 17280,
      ahsLengthThreshold: 48,
      ahsWidthThreshold: 30,
      ahsMinBillableWeight: 40,
      surchargeRates: { ahs: 31.45, oversize: 110.00 },
      effectiveDate,
    },
  });

  // UPS
  await prisma.carrierConstraint.upsert({
    where: { carrier_effectiveDate: { carrier: 'UPS', effectiveDate } },
    update: {},
    create: {
      carrier: 'UPS',
      maxLengthInches: 108,
      maxGirthInches: 165,
      maxWeightLbs: 150,
      dimDivisor: 139,
      ahsCubicThreshold: 10368,
      oversizeCubicThreshold: 17280,
      ahsLengthThreshold: null,
      ahsWidthThreshold: null,
      ahsMinBillableWeight: null,
      surchargeRates: { ahs: 31.45, oversize: 110.00 },
      effectiveDate,
    },
  });

  // USPS
  await prisma.carrierConstraint.upsert({
    where: { carrier_effectiveDate: { carrier: 'USPS', effectiveDate } },
    update: {},
    create: {
      carrier: 'USPS',
      maxLengthInches: 108,
      maxGirthInches: 108,
      maxWeightLbs: 70,
      dimDivisor: 166,
      ahsCubicThreshold: null,
      oversizeCubicThreshold: null,
      ahsLengthThreshold: null,
      ahsWidthThreshold: null,
      ahsMinBillableWeight: null,
      surchargeRates: {},
      effectiveDate,
    },
  });

  console.log('Carrier constraints created');

  // --- SwiftShip: 25 Items ---
  const swiftshipItems = [
    // Electronics
    { sku: 'SS-LAPTOP-01', name: 'Laptop', width: 380, height: 260, depth: 25, weight: 2200, isFragile: true, canRotate: true, maxStackWeight: 5000 },
    { sku: 'SS-TABLET-01', name: 'Tablet', width: 250, height: 175, depth: 8, weight: 480, isFragile: true, canRotate: true, maxStackWeight: 3000 },
    { sku: 'SS-PHONE-01', name: 'Phone', width: 150, height: 72, depth: 8, weight: 185, isFragile: true, canRotate: true, maxStackWeight: 2000 },
    { sku: 'SS-USBC-01', name: 'USB-C Cable', width: 150, height: 100, depth: 30, weight: 45, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-MOUSE-01', name: 'Wireless Mouse', width: 115, height: 63, depth: 38, weight: 95, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-SPKR-01', name: 'Bluetooth Speaker', width: 180, height: 65, depth: 65, weight: 540, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-PWRBK-01', name: 'Power Bank', width: 140, height: 70, depth: 16, weight: 320, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-WCAM-01', name: 'Webcam', width: 90, height: 65, depth: 50, weight: 165, isFragile: true, canRotate: true, maxStackWeight: 3000 },
    // Apparel
    { sku: 'SS-TSHIRT-01', name: 'T-Shirt', width: 300, height: 250, depth: 30, weight: 200, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-JEANS-01', name: 'Jeans', width: 350, height: 300, depth: 50, weight: 850, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-SHOES-01', name: 'Running Shoes', width: 330, height: 210, depth: 120, weight: 650, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-JACKET-01', name: 'Winter Jacket', width: 400, height: 350, depth: 80, weight: 1200, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-SOCKS-01', name: 'Socks 3-Pack', width: 200, height: 150, depth: 40, weight: 180, isFragile: false, canRotate: true, maxStackWeight: null },
    // Home Goods
    { sku: 'SS-MUG-01', name: 'Ceramic Mug', width: 120, height: 100, depth: 100, weight: 380, isFragile: true, canRotate: false, maxStackWeight: 1000 },
    { sku: 'SS-CANDLE-01', name: 'Scented Candle', width: 80, height: 80, depth: 100, weight: 350, isFragile: true, canRotate: false, maxStackWeight: 2000 },
    { sku: 'SS-FRAME-01', name: 'Picture Frame', width: 350, height: 280, depth: 25, weight: 650, isFragile: true, canRotate: true, maxStackWeight: 2000 },
    { sku: 'SS-CUTBD-01', name: 'Cutting Board', width: 400, height: 250, depth: 20, weight: 900, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-COAST-01', name: 'Set of 4 Coasters', width: 110, height: 110, depth: 25, weight: 200, isFragile: false, canRotate: true, maxStackWeight: null },
    // Supplements
    { sku: 'SS-VITAM-01', name: 'Vitamin Bottle', width: 70, height: 70, depth: 130, weight: 250, isFragile: false, canRotate: false, maxStackWeight: null },
    { sku: 'SS-PROTN-01', name: 'Protein Powder Tub', width: 150, height: 150, depth: 200, weight: 1100, isFragile: false, canRotate: false, maxStackWeight: null },
    { sku: 'SS-FISHO-01', name: 'Fish Oil Bottle', width: 60, height: 60, depth: 110, weight: 200, isFragile: false, canRotate: false, maxStackWeight: null },
    // Misc
    { sku: 'SS-BOOK-01', name: 'Book (Hardcover)', width: 240, height: 170, depth: 25, weight: 450, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-BGAME-01', name: 'Board Game', width: 300, height: 300, depth: 80, weight: 1200, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-YOGA-01', name: 'Yoga Mat', width: 650, height: 150, depth: 150, weight: 1800, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'SS-WBOTL-01', name: 'Water Bottle', width: 75, height: 75, depth: 260, weight: 350, isFragile: false, canRotate: false, maxStackWeight: null },
  ];

  const createdSwiftshipItems: Array<{ id: string; sku: string }> = [];
  for (const item of swiftshipItems) {
    const created = await prisma.item.upsert({
      where: { tenantId_sku: { tenantId: swiftship.id, sku: item.sku } },
      update: {},
      create: { tenantId: swiftship.id, ...item },
    });
    createdSwiftshipItems.push({ id: created.id, sku: created.sku });
  }
  console.log(`SwiftShip: ${createdSwiftshipItems.length} items created`);

  // --- SwiftShip: 8 Box Types ---
  // Outer dims = inner + 2*wallThickness per dimension
  const swiftshipBoxTypes = [
    { name: 'Mini Box', innerWidth: 200, innerHeight: 150, innerDepth: 100, wallThickness: 3, boxWeight: 120, maxWeight: 5000, cost: 0.45 },
    { name: 'Small Box', innerWidth: 300, innerHeight: 250, innerDepth: 150, wallThickness: 3, boxWeight: 200, maxWeight: 10000, cost: 0.65 },
    { name: 'Medium Box', innerWidth: 400, innerHeight: 300, innerDepth: 200, wallThickness: 3.5, boxWeight: 350, maxWeight: 15000, cost: 0.95 },
    { name: 'Large Box', innerWidth: 500, innerHeight: 400, innerDepth: 300, wallThickness: 4, boxWeight: 550, maxWeight: 20000, cost: 1.45 },
    { name: 'XL Box', innerWidth: 600, innerHeight: 450, innerDepth: 350, wallThickness: 4, boxWeight: 750, maxWeight: 25000, cost: 1.85 },
    { name: 'Flat Box', innerWidth: 450, innerHeight: 350, innerDepth: 80, wallThickness: 3, boxWeight: 250, maxWeight: 10000, cost: 0.75 },
    { name: 'Long Box', innerWidth: 700, innerHeight: 200, innerDepth: 200, wallThickness: 4, boxWeight: 400, maxWeight: 15000, cost: 1.15 },
    { name: 'Laptop Box', innerWidth: 420, innerHeight: 310, innerDepth: 80, wallThickness: 5, boxWeight: 300, maxWeight: 8000, cost: 1.05 },
  ];

  for (const box of swiftshipBoxTypes) {
    const wt = box.wallThickness;
    await prisma.boxType.create({
      data: {
        tenantId: swiftship.id,
        name: box.name,
        innerWidth: box.innerWidth,
        innerHeight: box.innerHeight,
        innerDepth: box.innerDepth,
        outerWidth: box.innerWidth + 2 * wt,
        outerHeight: box.innerHeight + 2 * wt,
        outerDepth: box.innerDepth + 2 * wt,
        wallThickness: wt,
        boxWeight: box.boxWeight,
        maxWeight: box.maxWeight,
        cost: box.cost,
      },
    });
  }
  console.log(`SwiftShip: ${swiftshipBoxTypes.length} box types created`);

  // --- SwiftShip: Compatibility Rules ---
  const powerBankItem = createdSwiftshipItems.find((i) => i.sku === 'SS-PWRBK-01')!;
  const candleItem = createdSwiftshipItems.find((i) => i.sku === 'SS-CANDLE-01')!;
  const phoneItem = createdSwiftshipItems.find((i) => i.sku === 'SS-PHONE-01')!;
  const usbcItem = createdSwiftshipItems.find((i) => i.sku === 'SS-USBC-01')!;

  await prisma.itemCompatibility.create({
    data: {
      tenantId: swiftship.id,
      itemIdA: powerBankItem.id,
      itemIdB: candleItem.id,
      rule: 'INCOMPATIBLE',
    },
  });

  await prisma.itemCompatibility.create({
    data: {
      tenantId: swiftship.id,
      itemIdA: phoneItem.id,
      itemIdB: usbcItem.id,
      rule: 'MUST_SHIP_TOGETHER',
    },
  });
  console.log('SwiftShip: compatibility rules created');

  // --- SwiftShip: Insert Materials ---
  await prisma.insertMaterial.create({
    data: {
      tenantId: swiftship.id,
      name: 'Branded Packing Slip',
      width: 210,
      height: 297,
      depth: 0.5,
      weight: 15,
      alwaysInclude: true,
    },
  });

  await prisma.insertMaterial.create({
    data: {
      tenantId: swiftship.id,
      name: 'Thank You Card',
      width: 152,
      height: 102,
      depth: 1,
      weight: 8,
      alwaysInclude: true,
    },
  });
  console.log('SwiftShip: insert materials created');

  // --- TechDirect: 15 Electronics Items ---
  const techdirectItems = [
    { sku: 'TD-LAPTOP-15', name: '15" Laptop', width: 360, height: 250, depth: 20, weight: 2100, isFragile: true, canRotate: true, maxStackWeight: 4000 },
    { sku: 'TD-LAPTOP-13', name: '13" Laptop', width: 310, height: 215, depth: 18, weight: 1400, isFragile: true, canRotate: true, maxStackWeight: 4000 },
    { sku: 'TD-MONITOR-24', name: '24" Monitor', width: 570, height: 370, depth: 120, weight: 4500, isFragile: true, canRotate: false, maxStackWeight: 3000 },
    { sku: 'TD-MONITOR-27', name: '27" Monitor', width: 640, height: 410, depth: 130, weight: 5800, isFragile: true, canRotate: false, maxStackWeight: null },
    { sku: 'TD-KEYBOARD', name: 'Mechanical Keyboard', width: 440, height: 140, depth: 40, weight: 850, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'TD-MOUSE-PRO', name: 'Gaming Mouse', width: 130, height: 70, depth: 45, weight: 105, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'TD-HEADSET', name: 'Wireless Headset', width: 200, height: 180, depth: 100, weight: 320, isFragile: true, canRotate: true, maxStackWeight: 2000 },
    { sku: 'TD-WEBCAM-4K', name: '4K Webcam', width: 100, height: 70, depth: 55, weight: 180, isFragile: true, canRotate: true, maxStackWeight: 3000 },
    { sku: 'TD-SSD-EXT', name: 'External SSD', width: 100, height: 55, depth: 10, weight: 60, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'TD-DOCK-USB', name: 'USB-C Docking Station', width: 200, height: 85, depth: 35, weight: 380, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'TD-CHARGER', name: '100W GaN Charger', width: 70, height: 65, depth: 32, weight: 180, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'TD-TABLET-11', name: '11" Tablet', width: 250, height: 175, depth: 6, weight: 500, isFragile: true, canRotate: true, maxStackWeight: 3000 },
    { sku: 'TD-STYLUS', name: 'Digital Stylus', width: 165, height: 12, depth: 12, weight: 20, isFragile: false, canRotate: true, maxStackWeight: null },
    { sku: 'TD-EARBUDS', name: 'Wireless Earbuds', width: 65, height: 50, depth: 30, weight: 55, isFragile: true, canRotate: true, maxStackWeight: 5000 },
    { sku: 'TD-ROUTER', name: 'Wi-Fi Router', width: 230, height: 160, depth: 55, weight: 450, isFragile: false, canRotate: true, maxStackWeight: null },
  ];

  for (const item of techdirectItems) {
    await prisma.item.upsert({
      where: { tenantId_sku: { tenantId: techdirect.id, sku: item.sku } },
      update: {},
      create: { tenantId: techdirect.id, ...item },
    });
  }
  console.log(`TechDirect: ${techdirectItems.length} items created`);

  // --- TechDirect: 5 Box Types (extra padding) ---
  const techdirectBoxTypes = [
    { name: 'TD Small Padded', innerWidth: 280, innerHeight: 200, innerDepth: 120, wallThickness: 6, boxWeight: 250, maxWeight: 8000, cost: 0.85 },
    { name: 'TD Medium Padded', innerWidth: 380, innerHeight: 280, innerDepth: 180, wallThickness: 6, boxWeight: 400, maxWeight: 12000, cost: 1.25 },
    { name: 'TD Large Padded', innerWidth: 480, innerHeight: 380, innerDepth: 280, wallThickness: 7, boxWeight: 650, maxWeight: 18000, cost: 1.75 },
    { name: 'TD Monitor Box', innerWidth: 680, innerHeight: 440, innerDepth: 160, wallThickness: 8, boxWeight: 900, maxWeight: 20000, cost: 2.45 },
    { name: 'TD XL Padded', innerWidth: 580, innerHeight: 420, innerDepth: 320, wallThickness: 7, boxWeight: 800, maxWeight: 25000, cost: 2.15 },
  ];

  for (const box of techdirectBoxTypes) {
    const wt = box.wallThickness;
    await prisma.boxType.create({
      data: {
        tenantId: techdirect.id,
        name: box.name,
        innerWidth: box.innerWidth,
        innerHeight: box.innerHeight,
        innerDepth: box.innerDepth,
        outerWidth: box.innerWidth + 2 * wt,
        outerHeight: box.innerHeight + 2 * wt,
        outerDepth: box.innerDepth + 2 * wt,
        wallThickness: wt,
        boxWeight: box.boxWeight,
        maxWeight: box.maxWeight,
        cost: box.cost,
      },
    });
  }
  console.log(`TechDirect: ${techdirectBoxTypes.length} box types created`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
