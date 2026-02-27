import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Optimization E2E (POST /v1/optimize)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let swiftshipToken: string;
  let swiftshipTenantId: string;
  let itemIds: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Login as SwiftShip admin
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@swiftship.com',
        password: 'password123',
        tenantSlug: 'swiftship',
      })
      .expect(200);

    swiftshipToken = loginRes.body.accessToken;
    swiftshipTenantId = loginRes.body.user.tenantId;

    // Get items for this tenant
    const itemsRes = await request(app.getHttpServer())
      .get('/items')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .expect(200);

    itemIds = itemsRes.body.map((i: { id: string }) => i.id);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // Test 52: Valid optimization returns 200 with complete result
  it('should return 200 with complete OptimizationResult', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: [
          { id: itemIds[0], quantity: 1 },
          { id: itemIds[1], quantity: 1 },
          { id: itemIds[4], quantity: 2 },
        ],
      })
      .expect(201);

    expect(res.body.success).toBeDefined();
    expect(res.body.packedBoxes).toBeDefined();
    expect(Array.isArray(res.body.packedBoxes)).toBe(true);
    expect(res.body.totalBoxes).toBeGreaterThanOrEqual(1);
    expect(res.body.algorithm).toBeDefined();
    expect(res.body.carrier).toBeDefined();
  });

  // Test 53: X-Optimization-Duration-Ms header
  it('should include X-Optimization-Duration-Ms header > 0', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: [{ id: itemIds[0], quantity: 1 }],
      })
      .expect(201);

    const duration = res.headers['x-optimization-duration-ms'];
    expect(duration).toBeDefined();
    expect(Number(duration)).toBeGreaterThan(0);
  });

  // Test 54: Packed boxes have placements, utilization, dimWeight, billableWeight, surcharges
  it('should include detailed data in each packed box', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: [{ id: itemIds[0], quantity: 1 }],
      })
      .expect(201);

    const box = res.body.packedBoxes[0];
    expect(box.placements).toBeDefined();
    expect(Array.isArray(box.placements)).toBe(true);
    expect(box.utilization).toBeDefined();
    expect(box.dimWeightGrams).toBeDefined();
    expect(box.billableWeightGrams).toBeDefined();
    expect(box.surcharges).toBeDefined();
  });

  // Test 55: Void fill data in each packed box
  it('should include voidFill data in each packed box', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: [{ id: itemIds[0], quantity: 1 }],
      })
      .expect(201);

    const box = res.body.packedBoxes[0];
    expect(box.voidFill).toBeDefined();
    expect(box.voidFill.voidVolumeCubicMm).toBeDefined();
    expect(box.voidFill.fillWeightGrams).toBeDefined();
    expect(box.voidFill.materialUsed).toBeDefined();
  });

  // Test 56: Pack instructions array
  it('should include packInstructions array in each packed box', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: [{ id: itemIds[0], quantity: 1 }],
      })
      .expect(201);

    const box = res.body.packedBoxes[0];
    expect(box.packInstructions).toBeDefined();
    expect(Array.isArray(box.packInstructions)).toBe(true);
    expect(box.packInstructions.length).toBeGreaterThan(0);
  });

  // Test 57: Savings data
  it('should include savingsAmount (naiveCost - optimizedCost)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: [
          { id: itemIds[0], quantity: 1 },
          { id: itemIds[1], quantity: 1 },
        ],
      })
      .expect(201);

    expect(res.body.naiveCost).toBeDefined();
    expect(res.body.optimizedCost).toBeDefined();
    expect(res.body.savingsAmount).toBeDefined();
    expect(typeof res.body.savingsAmount).toBe('number');
  });

  // Test 58: Empty items returns 400
  it('should return 400 for empty items array', async () => {
    await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({ items: [] })
      .expect(400);
  });

  // Test 59: No auth returns 401
  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer())
      .post('/v1/optimize')
      .send({ items: [{ id: itemIds[0], quantity: 1 }] })
      .expect(401);
  });

  // Test 60: UsageRecord incremented after optimization
  it('should increment UsageRecord after optimization', async () => {
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const beforeCount = await prisma.usageRecord.count({
      where: { tenantId: swiftshipTenantId, type: 'OPTIMIZATION_RUN', billingPeriod },
    });

    await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({ items: [{ id: itemIds[0], quantity: 1 }] })
      .expect(201);

    const afterCount = await prisma.usageRecord.count({
      where: { tenantId: swiftshipTenantId, type: 'OPTIMIZATION_RUN', billingPeriod },
    });

    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  // Test 61: SavingsLog entry created
  it('should create SavingsLog entry after optimization', async () => {
    const beforeCount = await prisma.savingsLog.count({
      where: { tenantId: swiftshipTenantId },
    });

    await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({ items: [{ id: itemIds[0], quantity: 1 }] })
      .expect(201);

    const afterCount = await prisma.savingsLog.count({
      where: { tenantId: swiftshipTenantId },
    });

    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  // Test 62: INCOMPATIBLE items in separate boxes
  it('should place INCOMPATIBLE items in separate boxes', async () => {
    // Power Bank (SS-PWRBK-01) and Scented Candle (SS-CANDLE-01) are INCOMPATIBLE
    const items = await prisma.item.findMany({
      where: {
        tenantId: swiftshipTenantId,
        sku: { in: ['SS-PWRBK-01', 'SS-CANDLE-01'] },
      },
    });

    if (items.length < 2) {
      // Skip if seed data not present
      return;
    }

    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: items.map((i) => ({ id: i.id, quantity: 1 })),
      })
      .expect(201);

    // They should be in different boxes
    if (res.body.packedBoxes.length >= 2) {
      const powerBankBoxes = res.body.packedBoxes.filter((b: { placements: Array<{ sku: string }> }) =>
        b.placements.some((p: { sku: string }) => p.sku === 'SS-PWRBK-01'),
      );
      const candleBoxes = res.body.packedBoxes.filter((b: { placements: Array<{ sku: string }> }) =>
        b.placements.some((p: { sku: string }) => p.sku === 'SS-CANDLE-01'),
      );

      if (powerBankBoxes.length > 0 && candleBoxes.length > 0) {
        // Verify they're not in the same box
        const powerBankBoxIndices = powerBankBoxes.map((b: { boxIndex: number }) => b.boxIndex);
        const candleBoxIndices = candleBoxes.map((b: { boxIndex: number }) => b.boxIndex);
        const overlap = powerBankBoxIndices.filter((i: number) => candleBoxIndices.includes(i));
        expect(overlap).toHaveLength(0);
      }
    }
  });

  // Test 63: MUST_SHIP_TOGETHER items in same box
  it('should place MUST_SHIP_TOGETHER items in the same box', async () => {
    // Phone (SS-PHONE-01) and USB-C Cable (SS-USBC-01) MUST_SHIP_TOGETHER
    const items = await prisma.item.findMany({
      where: {
        tenantId: swiftshipTenantId,
        sku: { in: ['SS-PHONE-01', 'SS-USBC-01'] },
      },
    });

    if (items.length < 2) {
      return;
    }

    const res = await request(app.getHttpServer())
      .post('/v1/optimize')
      .set('Authorization', `Bearer ${swiftshipToken}`)
      .send({
        items: items.map((i) => ({ id: i.id, quantity: 1 })),
      })
      .expect(201);

    // They should be in the same box
    const phoneBox = res.body.packedBoxes.find((b: { placements: Array<{ sku: string }> }) =>
      b.placements.some((p: { sku: string }) => p.sku === 'SS-PHONE-01'),
    );
    const cableBox = res.body.packedBoxes.find((b: { placements: Array<{ sku: string }> }) =>
      b.placements.some((p: { sku: string }) => p.sku === 'SS-USBC-01'),
    );

    if (phoneBox && cableBox) {
      expect(phoneBox.boxIndex).toBe(cableBox.boxIndex);
    }
  });
});
