import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { OptimizationService } from './optimization.service';
import { OptimizeRequestDto } from './dto/optimize-request.dto';
import { OptimizeResponseDto } from './dto/optimize-response.dto';
import { BatchOptimizeRequestDto } from './dto/batch-optimize-request.dto';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Optimization')
@ApiBearerAuth()
@Controller('v1')
export class OptimizationController {
  constructor(private readonly optimizationService: OptimizationService) {}

  @Post('optimize')
  @ApiOperation({ summary: 'Run packing optimization for a set of items' })
  @ApiResponse({ status: 200, description: 'Optimization result', type: OptimizeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Items or box types not found' })
  async optimize(
    @Body() request: OptimizeRequestDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.optimizationService.optimize(
      tenantId,
      user?.userId ?? null,
      request,
    );

    res.setHeader('X-Optimization-Duration-Ms', result.executionTimeMs.toString());

    return result;
  }

  @Post('optimize/batch')
  @ApiOperation({ summary: 'Batch optimize multiple orders' })
  @ApiResponse({ status: 200, description: 'Batch optimization results' })
  async batchOptimize(
    @Body() request: BatchOptimizeRequestDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.optimizationService.batchOptimize(tenantId, user?.userId ?? null, request);
  }
}
