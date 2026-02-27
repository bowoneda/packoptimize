import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoxTypeDto } from './dto/create-box-type.dto';
import { UpdateBoxTypeDto } from './dto/update-box-type.dto';

@Injectable()
export class BoxTypesService {
  private readonly logger = new Logger(BoxTypesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBoxTypeDto) {
    return this.prisma.withTenantContext(async (tx) => {
      return tx.boxType.create({
        data: { tenantId, ...dto },
      });
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.withTenantContext(async (tx) => {
      return tx.boxType.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.withTenantContext(async (tx) => {
      const boxType = await tx.boxType.findFirst({
        where: { id, tenantId },
      });
      if (!boxType) {
        throw new NotFoundException(`BoxType with ID '${id}' not found`);
      }
      return boxType;
    });
  }

  async update(tenantId: string, id: string, dto: UpdateBoxTypeDto) {
    await this.findOne(tenantId, id);
    return this.prisma.withTenantContext(async (tx) => {
      return tx.boxType.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.withTenantContext(async (tx) => {
      return tx.boxType.delete({ where: { id } });
    });
  }
}
