import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Carrier } from '@prisma/client';
import { CarrierRulesService } from './carrier-rules.service';

@ApiTags('Carrier Rules')
@ApiBearerAuth()
@Controller('carrier-rules')
export class CarrierRulesController {
  constructor(private readonly carrierRulesService: CarrierRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all carrier constraints' })
  @ApiResponse({ status: 200, description: 'List of carrier constraints' })
  async findAll() {
    return this.carrierRulesService.findAll();
  }

  @Get(':carrier')
  @ApiOperation({ summary: 'Get constraints for a specific carrier' })
  @ApiResponse({ status: 200, description: 'Carrier constraints' })
  async findByCarrier(@Param('carrier') carrier: Carrier) {
    return this.carrierRulesService.findByCarrier(carrier);
  }
}
