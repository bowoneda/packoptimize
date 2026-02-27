import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create Stripe Checkout session for plan upgrade' })
  async createCheckout(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(tenantId, dto.plan);
  }

  @Post('portal')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create Stripe Customer Portal session' })
  async createPortal(@CurrentTenant() tenantId: string) {
    return this.billingService.createPortalSession(tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current billing usage for this billing period' })
  async getUsage(@CurrentTenant() tenantId: string) {
    return this.billingService.getUsage(tenantId);
  }
}
