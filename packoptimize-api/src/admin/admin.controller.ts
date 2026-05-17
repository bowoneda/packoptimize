import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateTenantStatusDto } from './dto/update-status.dto';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform-wide KPI stats (super admin only)' })
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('tenants')
  @ApiOperation({
    summary: 'List all tenants with usage counts (super admin only)',
  })
  findAllTenants() {
    return this.adminService.findAllTenants();
  }

  @Get('tenants/:id')
  @ApiOperation({
    summary: 'Get tenant detail with users and 30-day usage (super admin only)',
  })
  findOneTenant(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOneTenant(id);
  }

  @Put('tenants/:id/status')
  @ApiOperation({
    summary: 'Suspend or reactivate a tenant (super admin only)',
  })
  updateTenantStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.updateTenantStatus(id, dto.isActive, user.userId);
  }
}
