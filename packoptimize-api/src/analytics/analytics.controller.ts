import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('savings')
  @ApiOperation({ summary: 'Get savings analytics for the current tenant' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', 'all'] })
  async getSavings(
    @CurrentTenant() tenantId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getSavings(tenantId, period);
  }
}
