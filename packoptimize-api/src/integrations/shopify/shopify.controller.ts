import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ShopifyService } from './shopify.service';
import { ShopifyRateRequestDto } from './dto/shopify-rate-request.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Integrations')
@ApiSecurity('api-key')
@Controller('v1/integrations/shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Post('rates')
  @ApiOperation({ summary: 'Shopify Carrier Service — calculate optimized shipping rates' })
  async calculateRates(
    @CurrentTenant() tenantId: string,
    @Body() dto: ShopifyRateRequestDto,
  ) {
    return this.shopifyService.calculateRates(tenantId, dto);
  }
}
