import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOne(tenantId: string) {
    return this.prisma.withTenantContext(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });
      if (!tenant) {
        throw new NotFoundException(`Tenant not found`);
      }
      return tenant;
    });
  }

  async update(tenantId: string, data: { name?: string; settings?: Prisma.InputJsonValue }) {
    return this.prisma.withTenantContext(async (tx) => {
      return tx.tenant.update({
        where: { id: tenantId },
        data,
      });
    });
  }
}
