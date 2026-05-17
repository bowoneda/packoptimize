/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => ReturnType<
  typeof import('cookie-parser')
>;
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaServiceWithoutTenant } from '../../prisma/prisma.service';

describe('Admin Module (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaServiceWithoutTenant;
  let regularCookie: string; // swiftship admin (not super admin)
  let superAdminCookie: string;
  let swiftshipTenantId: string;

  function extractCookie(res: request.Response): string {
    const rawCookies = res.headers['set-cookie'] as
      | string[]
      | string
      | undefined;
    const arr = Array.isArray(rawCookies)
      ? rawCookies
      : rawCookies
        ? [rawCookies]
        : [];
    return arr.map((c) => c.split(';')[0]).join('; ');
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaServiceWithoutTenant);

    // Promote swiftship admin to super admin for this test run
    await prisma.user.updateMany({
      where: { email: 'admin@swiftship.com' },
      data: { isSuperAdmin: true },
    });

    // Login as super admin
    const superRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@swiftship.com',
        password: 'password123',
        tenantSlug: 'swiftship',
      })
      .expect(200);
    superAdminCookie = extractCookie(superRes);
    swiftshipTenantId = superRes.body.user.tenantId;

    // Login as regular (techdirect admin — not super admin)
    const regularRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@techdirect.com',
        password: 'password123',
        tenantSlug: 'techdirect',
      })
      .expect(200);
    regularCookie = extractCookie(regularRes);
  }, 30000);

  afterAll(async () => {
    // Clean up: demote super admin
    await prisma.user.updateMany({
      where: { email: 'admin@swiftship.com' },
      data: { isSuperAdmin: false },
    });
    await app.close();
  });

  // ─── GET /admin/stats ───────────────────────────────────────────────────────

  it('GET /admin/stats — 401 when unauthenticated', () => {
    return request(app.getHttpServer()).get('/admin/stats').expect(401);
  });

  it('GET /admin/stats — 403 for regular tenant user', () => {
    return request(app.getHttpServer())
      .get('/admin/stats')
      .set('Cookie', regularCookie)
      .expect(403);
  });

  it('GET /admin/stats — 200 with correct shape for super admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/stats')
      .set('Cookie', superAdminCookie)
      .expect(200);

    expect(res.body).toMatchObject({
      tenantCount: expect.any(Number),
      userCount: expect.any(Number),
      completedOptimizationCount: expect.any(Number),
      planBreakdown: expect.any(Object),
      recentTenants: expect.any(Array),
    });
    expect(res.body.tenantCount).toBeGreaterThanOrEqual(2);
  });

  // ─── GET /admin/tenants ──────────────────────────────────────────────────────

  it('GET /admin/tenants — 403 for regular user', () => {
    return request(app.getHttpServer())
      .get('/admin/tenants')
      .set('Cookie', regularCookie)
      .expect(403);
  });

  it('GET /admin/tenants — returns all tenants with _count', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/tenants')
      .set('Cookie', superAdminCookie)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    const tenant = res.body[0];
    expect(tenant).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      slug: expect.any(String),
      plan: expect.any(String),
      isActive: expect.any(Boolean),
      _count: {
        users: expect.any(Number),
        items: expect.any(Number),
        optimizationRuns: expect.any(Number),
        apiKeys: expect.any(Number),
      },
    });
  });

  // ─── GET /admin/tenants/:id ─────────────────────────────────────────────────

  it('GET /admin/tenants/:id — 400 for invalid UUID', () => {
    return request(app.getHttpServer())
      .get('/admin/tenants/not-a-uuid')
      .set('Cookie', superAdminCookie)
      .expect(400);
  });

  it('GET /admin/tenants/:id — 404 for unknown UUID', () => {
    return request(app.getHttpServer())
      .get('/admin/tenants/00000000-0000-0000-0000-000000000000')
      .set('Cookie', superAdminCookie)
      .expect(404);
  });

  it('GET /admin/tenants/:id — 200 with full detail for super admin', async () => {
    const res = await request(app.getHttpServer())
      .get(`/admin/tenants/${swiftshipTenantId}`)
      .set('Cookie', superAdminCookie)
      .expect(200);

    expect(res.body).toMatchObject({
      id: swiftshipTenantId,
      users: expect.any(Array),
      dailyRuns: expect.any(Array),
      totalSavings: expect.any(Number),
    });
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  // ─── PUT /admin/tenants/:id/status ─────────────────────────────────────────

  it('PUT /admin/tenants/:id/status — 403 for regular user', () => {
    return request(app.getHttpServer())
      .put(`/admin/tenants/${swiftshipTenantId}/status`)
      .set('Cookie', regularCookie)
      .send({ isActive: false })
      .expect(403);
  });

  it('PUT /admin/tenants/:id/status — suspends a tenant', async () => {
    // Use techdirect so we don't lock out our own super admin session
    const tenantsRes = await request(app.getHttpServer())
      .get('/admin/tenants')
      .set('Cookie', superAdminCookie)
      .expect(200);
    const techdirect = tenantsRes.body.find(
      (t: { slug: string }) => t.slug === 'techdirect',
    );

    const res = await request(app.getHttpServer())
      .put(`/admin/tenants/${techdirect.id}/status`)
      .set('Cookie', superAdminCookie)
      .send({ isActive: false })
      .expect(200);

    expect(res.body).toMatchObject({ id: techdirect.id, isActive: false });
  });

  it('PUT /admin/tenants/:id/status — suspended tenant login returns 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@techdirect.com',
        password: 'password123',
        tenantSlug: 'techdirect',
      })
      .expect(401);
  });

  it('PUT /admin/tenants/:id/status — reactivates a tenant', async () => {
    const tenantsRes = await request(app.getHttpServer())
      .get('/admin/tenants')
      .set('Cookie', superAdminCookie)
      .expect(200);
    const techdirect = tenantsRes.body.find(
      (t: { slug: string }) => t.slug === 'techdirect',
    );

    const res = await request(app.getHttpServer())
      .put(`/admin/tenants/${techdirect.id}/status`)
      .set('Cookie', superAdminCookie)
      .send({ isActive: true })
      .expect(200);

    expect(res.body).toMatchObject({ id: techdirect.id, isActive: true });
  });
});
