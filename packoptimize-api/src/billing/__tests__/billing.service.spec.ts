import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { BillingService } from '../billing.service';
import { PrismaServiceWithoutTenant } from '../../prisma/prisma.service';

// Mock Stripe
const mockStripeCheckoutSessionsCreate = jest.fn();
const mockStripeBillingPortalSessionsCreate = jest.fn();
const mockStripeBillingMeterEventsCreate = jest.fn();
const mockStripeCustomersCreate = jest.fn();
const mockStripePricesList = jest.fn();
const mockStripePricesRetrieve = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: { create: mockStripeCustomersCreate },
    checkout: { sessions: { create: mockStripeCheckoutSessionsCreate } },
    billingPortal: { sessions: { create: mockStripeBillingPortalSessionsCreate } },
    billing: { meterEvents: { create: mockStripeBillingMeterEventsCreate } },
    prices: { list: mockStripePricesList, retrieve: mockStripePricesRetrieve },
    webhooks: { constructEvent: jest.fn() },
  }));
});

describe('BillingService', () => {
  let service: BillingService;
  let prisma: Record<string, any>;

  const mockTenantFree = {
    id: 'tenant-1',
    name: 'Test Tenant',
    slug: 'test',
    plan: 'FREE',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  };

  const mockTenantStarter = {
    id: 'tenant-2',
    name: 'Starter Tenant',
    slug: 'starter',
    plan: 'STARTER',
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: 'sub_test123',
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      usageRecord: {
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaServiceWithoutTenant,
          useValue: prisma,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                STRIPE_SECRET_KEY: 'sk_test_real_key',
                STRIPE_WEBHOOK_SECRET: 'whsec_test',
                FRONTEND_URL: 'http://localhost:3001',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPlanLimit', () => {
    it('should block FREE tenant at 100 usage', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantFree);
      prisma.usageRecord.aggregate.mockResolvedValue({ _sum: { quantity: 100 } });

      const result = await service.checkPlanLimit('tenant-1');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Free plan limit reached');
    });

    it('should allow FREE tenant at 50 usage', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantFree);
      prisma.usageRecord.aggregate.mockResolvedValue({ _sum: { quantity: 50 } });

      const result = await service.checkPlanLimit('tenant-1');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow STARTER tenant at 2001 usage (overage)', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantStarter);

      const result = await service.checkPlanLimit('tenant-2');

      expect(result.allowed).toBe(true);
    });

    it('should throw NotFoundException for unknown tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.checkPlanLimit('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsage', () => {
    it('should return correct plan, limits, and usage for FREE tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantFree);
      prisma.usageRecord.aggregate.mockResolvedValue({ _sum: { quantity: 42 } });

      const result = await service.getUsage('tenant-1');

      expect(result.plan).toBe('FREE');
      expect(result.includedOptimizations).toBe(100);
      expect(result.usedOptimizations).toBe(42);
      expect(result.overageCount).toBe(0);
      expect(result.overageCost).toBe(0);
    });

    it('should calculate overage for STARTER tenant over limit', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantStarter);
      prisma.usageRecord.aggregate.mockResolvedValue({ _sum: { quantity: 2050 } });

      const result = await service.getUsage('tenant-2');

      expect(result.plan).toBe('STARTER');
      expect(result.includedOptimizations).toBe(2000);
      expect(result.usedOptimizations).toBe(2050);
      expect(result.overageCount).toBe(50);
      expect(result.overageCost).toBe(2.0); // 50 * $0.04
    });

    it('should return 0 usage when no records exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantFree);
      prisma.usageRecord.aggregate.mockResolvedValue({ _sum: { quantity: null } });

      const result = await service.getUsage('tenant-1');

      expect(result.usedOptimizations).toBe(0);
      expect(result.overageCount).toBe(0);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a Stripe checkout session with correct params', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantFree);
      mockStripeCustomersCreate.mockResolvedValue({ id: 'cus_new123' });
      prisma.tenant.update.mockResolvedValue({});
      mockStripePricesList.mockResolvedValue({
        data: [
          {
            id: 'price_starter',
            type: 'recurring',
            metadata: { plan: 'STARTER' },
            active: true,
          },
        ],
      });
      mockStripeCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/test_session',
      });

      const result = await service.createCheckoutSession('tenant-1', 'STARTER');

      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/test_session');
      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_new123',
          mode: 'subscription',
          success_url: 'http://localhost:3001/settings?billing=success',
          cancel_url: 'http://localhost:3001/settings?billing=cancelled',
        }),
      );
    });
  });

  describe('handleWebhookEvent', () => {
    it('should update tenant plan on checkout.session.completed', async () => {
      prisma.tenant.update.mockResolvedValue({});

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { tenantId: 'tenant-1', plan: 'GROWTH' },
            customer: 'cus_123',
            subscription: 'sub_456',
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          plan: 'GROWTH',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_456',
        },
      });
    });

    it('should downgrade to FREE on subscription.deleted', async () => {
      prisma.tenant.findFirst.mockResolvedValue(mockTenantStarter);
      prisma.tenant.update.mockResolvedValue({});

      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_test123',
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-2' },
        data: { plan: 'FREE', stripeSubscriptionId: null },
      });
    });
  });

  describe('reportUsageToStripe', () => {
    it('should send meter event for paid tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantStarter);
      mockStripeBillingMeterEventsCreate.mockResolvedValue({});

      await service.reportUsageToStripe('tenant-2');

      expect(mockStripeBillingMeterEventsCreate).toHaveBeenCalledWith({
        event_name: 'optimization_run',
        payload: {
          stripe_customer_id: 'cus_test123',
          value: '1',
        },
      });
    });

    it('should skip meter event for FREE tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantFree);

      await service.reportUsageToStripe('tenant-1');

      expect(mockStripeBillingMeterEventsCreate).not.toHaveBeenCalled();
    });

    it('should not throw if Stripe call fails', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenantStarter);
      mockStripeBillingMeterEventsCreate.mockRejectedValue(new Error('Stripe error'));

      await expect(service.reportUsageToStripe('tenant-2')).resolves.not.toThrow();
    });
  });
});
