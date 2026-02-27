import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BoxTypesService } from './box-types.service';
import { CreateBoxTypeDto } from './dto/create-box-type.dto';
import { UpdateBoxTypeDto } from './dto/update-box-type.dto';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Box Types')
@ApiBearerAuth()
@Controller('box-types')
export class BoxTypesController {
  constructor(private readonly boxTypesService: BoxTypesService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Create a new box type' })
  @ApiResponse({ status: 201, description: 'Box type created successfully' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateBoxTypeDto) {
    return this.boxTypesService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all box types for the current tenant' })
  @ApiResponse({ status: 200, description: 'List of box types' })
  async findAll(@CurrentTenant() tenantId: string) {
    return this.boxTypesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single box type by ID' })
  @ApiResponse({ status: 200, description: 'Box type found' })
  @ApiResponse({ status: 404, description: 'Box type not found' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.boxTypesService.findOne(tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Update a box type' })
  @ApiResponse({ status: 200, description: 'Box type updated' })
  @ApiResponse({ status: 404, description: 'Box type not found' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoxTypeDto,
  ) {
    return this.boxTypesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a box type' })
  @ApiResponse({ status: 200, description: 'Box type deleted' })
  @ApiResponse({ status: 404, description: 'Box type not found' })
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.boxTypesService.remove(tenantId, id);
  }
}
