import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaServiceWithoutTenant } from '../prisma/prisma.service';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 100,
  STARTER: 2000,
  GROWTH: 10000,
  ENTERPRISE: Infinity,
};

const OVERAGE_RATES: Record<string, number> = {
  STARTER: 0.04,
  GROWTH: 0.03,
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe | null;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaServiceWithoutTenant,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey && secretKey !== 'sk_test_placeholder') {
      this.stripe = new Stripe(secretKey);
    } else {
      this.stripe = null;
      this.logger.warn('Stripe is not configured — billing features disabled');
    }
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
  }

  async getOrCreateStripeCustomer(tenantId: string): Promise<string> {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (tenant.stripeCustomerId) {
      return tenant.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      name: tenant.name,
      metadata: { tenantId: tenant.id, slug: tenant.slug },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customer.id },
    });

    this.logger.log(`Created Stripe customer ${customer.id} for tenant ${tenantId}`);
    return customer.id;
  }

  async createCheckoutSession(tenantId: string, plan: 'STARTER' | 'GROWTH'): Promise<{ checkoutUrl: string }> {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const customerId = await this.getOrCreateStripeCustomer(tenantId);

    // Find the price by searching for prices with matching plan metadata
    const prices = await this.stripe.prices.list({
      lookup_keys: undefined,
      limit: 100,
      active: true,
    });
    const price = prices.data.find(
      (p) => p.metadata?.plan === plan && p.type === 'recurring' && p.metadata?.type !== 'overage',
    );

    if (!price) {
      throw new BadRequestException(`No Stripe price found for plan ${plan}. Run npm run stripe:setup first.`);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${this.frontendUrl}/settings?billing=success`,
      cancel_url: `${this.frontendUrl}/settings?billing=cancelled`,
      metadata: { tenantId, plan },
    });

    return { checkoutUrl: session.url! };
  }

  async createPortalSession(tenantId: string): Promise<{ portalUrl: string }> {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant?.stripeCustomerId) {
      throw new BadRequestException('No Stripe subscription found for this tenant');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${this.frontendUrl}/settings`,
    });

    return { portalUrl: session.url };
  }

  async getUsage(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const usage = await this.prisma.usageRecord.aggregate({
      where: {
        tenantId,
        billingPeriod,
        type: 'OPTIMIZATION_RUN',
      },
      _sum: { quantity: true },
    });

    const used = usage._sum.quantity ?? 0;
    const included = PLAN_LIMITS[tenant.plan] ?? 100;
    const overageCount = Math.max(0, used - included);
    const overageRate = OVERAGE_RATES[tenant.plan] ?? 0;

    return {
      plan: tenant.plan,
      includedOptimizations: included === Infinity ? -1 : included,
      usedOptimizations: used,
      billingPeriod,
      overageCount,
      overageCost: parseFloat((overageCount * overageRate).toFixed(2)),
    };
  }

  async checkPlanLimit(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Only FREE plan is hard-blocked
    if (tenant.plan !== 'FREE') {
      return { allowed: true };
    }

    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const usage = await this.prisma.usageRecord.aggregate({
      where: {
        tenantId,
        billingPeriod,
        type: 'OPTIMIZATION_RUN',
      },
      _sum: { quantity: true },
    });

    const used = usage._sum.quantity ?? 0;
    const limit = PLAN_LIMITS.FREE;

    if (used >= limit) {
      return {
        allowed: false,
        reason: `Free plan limit reached (${limit}/month). Upgrade to continue.`,
      };
    }

    return { allowed: true };
  }

  async reportUsageToStripe(tenantId: string): Promise<void> {
    if (!this.stripe) return;

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant?.stripeCustomerId || tenant.plan === 'FREE') return;

    try {
      await this.stripe.billing.meterEvents.create({
        event_name: 'optimization_run',
        payload: {
          stripe_customer_id: tenant.stripeCustomerId,
          value: '1',
        },
      });
      this.logger.debug(`Reported usage to Stripe for tenant ${tenantId}`);
    } catch (error) {
      // Don't let Stripe errors break the optimization flow
      this.logger.error(`Failed to report usage to Stripe: ${error instanceof Error ? error.message : error}`);
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan;

        if (tenantId && plan) {
          await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan: plan as 'STARTER' | 'GROWTH',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
          this.logger.log(`Tenant ${tenantId} upgraded to ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (tenant) {
          const priceId = subscription.items.data[0]?.price?.id;
          if (priceId) {
            const price = await this.stripe!.prices.retrieve(priceId);
            const plan = price.metadata?.plan;
            if (plan && ['STARTER', 'GROWTH'].includes(plan)) {
              await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { plan: plan as 'STARTER' | 'GROWTH' },
              });
              this.logger.log(`Tenant ${tenant.id} subscription updated to ${plan}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (tenant) {
          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: { plan: 'FREE', stripeSubscriptionId: null },
          });
          this.logger.log(`Tenant ${tenant.id} downgraded to FREE (subscription deleted)`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (tenant) {
          this.logger.warn(`Payment failed for tenant ${tenant.id} (invoice ${invoice.id})`);
        }
        break;
      }

      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`);
    }
  }
}
