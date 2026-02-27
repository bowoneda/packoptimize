import { Controller, Post, Req, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Stripe from 'stripe';
import { BillingService } from './billing.service';
import { Public } from '../common/decorators/public.decorator';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@ApiTags('Billing')
@Controller('v1/billing')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string;

  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey && secretKey !== 'sk_test_placeholder') {
      this.stripe = new Stripe(secretKey);
    } else {
      this.stripe = null;
    }
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
  }

  @Post('webhook')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(@Req() req: RawBodyRequest) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Raw body not available');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody, sig, this.webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : err}`);
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.log(`Received webhook event: ${event.type} (${event.id})`);
    await this.billingService.handleWebhookEvent(event);

    return { received: true };
  }
}
