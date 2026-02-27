import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];
if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
  console.error('Error: Set a real STRIPE_SECRET_KEY in .env before running this script.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const PRODUCT_NAME = 'PackOptimize Subscription';

const PLANS = [
  { name: 'Free Tier', amount: 0, interval: 'month' as const, metadata: { plan: 'FREE', included_optimizations: '100' } },
  { name: 'Starter', amount: 9900, interval: 'month' as const, metadata: { plan: 'STARTER', included_optimizations: '2000' } },
  { name: 'Growth', amount: 24900, interval: 'month' as const, metadata: { plan: 'GROWTH', included_optimizations: '10000' } },
];

const OVERAGE_PRICES = [
  { plan: 'STARTER', unitAmount: 4, nickname: 'Starter Overage ($0.04/optimization)' },
  { plan: 'GROWTH', unitAmount: 3, nickname: 'Growth Overage ($0.03/optimization)' },
];

async function findOrCreateProduct(): Promise<string> {
  const products = await stripe.products.list({ limit: 100 });
  const existing = products.data.find((p) => p.name === PRODUCT_NAME && p.active);
  if (existing) {
    console.log(`✓ Product already exists: ${existing.id}`);
    return existing.id;
  }
  const product = await stripe.products.create({
    name: PRODUCT_NAME,
    description: 'Multi-tenant packaging optimization SaaS platform',
  });
  console.log(`✓ Created product: ${product.id}`);
  return product.id;
}

async function findOrCreatePrices(productId: string): Promise<Map<string, string>> {
  const priceMap = new Map<string, string>();
  const existingPrices = await stripe.prices.list({ product: productId, limit: 100 });

  for (const plan of PLANS) {
    const existing = existingPrices.data.find(
      (p) => p.active && p.metadata?.plan === plan.metadata.plan && p.type === 'recurring' && !p.billing_scheme?.includes('metered'),
    );
    if (existing) {
      console.log(`✓ Price for ${plan.name} already exists: ${existing.id}`);
      priceMap.set(plan.metadata.plan, existing.id);
      continue;
    }
    const price = await stripe.prices.create({
      product: productId,
      currency: 'usd',
      unit_amount: plan.amount,
      recurring: { interval: plan.interval },
      nickname: plan.name,
      metadata: plan.metadata,
    });
    console.log(`✓ Created price for ${plan.name}: ${price.id}`);
    priceMap.set(plan.metadata.plan, price.id);
  }

  return priceMap;
}

async function findOrCreateMeter(): Promise<string> {
  const meters = await stripe.billing.meters.list({ limit: 100 });
  const existing = meters.data.find((m) => m.event_name === 'optimization_run' && m.status === 'active');
  if (existing) {
    console.log(`✓ Billing meter already exists: ${existing.id}`);
    return existing.id;
  }
  const meter = await stripe.billing.meters.create({
    display_name: 'Optimization Usage',
    event_name: 'optimization_run',
    default_aggregation: { formula: 'sum' },
    value_settings: { event_payload_key: 'value' },
  });
  console.log(`✓ Created billing meter: ${meter.id}`);
  return meter.id;
}

async function findOrCreateOveragePrices(productId: string, meterId: string): Promise<void> {
  const existingPrices = await stripe.prices.list({ product: productId, limit: 100 });

  for (const overage of OVERAGE_PRICES) {
    const existing = existingPrices.data.find(
      (p) => p.active && p.metadata?.plan === overage.plan && p.metadata?.type === 'overage',
    );
    if (existing) {
      console.log(`✓ Overage price for ${overage.plan} already exists: ${existing.id}`);
      continue;
    }
    const price = await stripe.prices.create({
      product: productId,
      currency: 'usd',
      unit_amount: overage.unitAmount,
      recurring: {
        interval: 'month',
        meter: meterId,
        usage_type: 'metered',
      },
      nickname: overage.nickname,
      metadata: { plan: overage.plan, type: 'overage' },
    });
    console.log(`✓ Created overage price for ${overage.plan}: ${price.id}`);
  }
}

async function main() {
  console.log('=== PackOptimize Stripe Setup ===\n');

  const productId = await findOrCreateProduct();
  const priceMap = await findOrCreatePrices(productId);
  const meterId = await findOrCreateMeter();
  await findOrCreateOveragePrices(productId, meterId);

  console.log('\n=== Setup Complete ===');
  console.log('Product ID:', productId);
  console.log('Meter ID:', meterId);
  console.log('Price IDs:');
  for (const [plan, priceId] of priceMap) {
    console.log(`  ${plan}: ${priceId}`);
  }
  console.log('\nYou can verify in your Stripe Dashboard: https://dashboard.stripe.com/test/products');
}

main().catch((err) => {
  console.error('Stripe setup failed:', err.message);
  process.exit(1);
});
