import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateItemDto) {
    return this.prisma.withTenantContext(async (tx) => {
      try {
        return await tx.item.create({
          data: {
            tenantId,
            ...dto,
            metadata: (dto.metadata as Prisma.InputJsonValue) ?? {},
          },
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          throw new ConflictException(`Item with SKU '${dto.sku}' already exists`);
        }
        throw error;
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.withTenantContext(async (tx) => {
      return tx.item.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.withTenantContext(async (tx) => {
      const item = await tx.item.findFirst({
        where: { id, tenantId },
      });
      if (!item) {
        throw new NotFoundException(`Item with ID '${id}' not found`);
      }
      return item;
    });
  }

  async update(tenantId: string, id: string, dto: UpdateItemDto) {
    await this.findOne(tenantId, id);
    const { metadata, ...rest } = dto;
    return this.prisma.withTenantContext(async (tx) => {
      return tx.item.update({
        where: { id },
        data: {
          ...rest,
          ...(metadata !== undefined ? { metadata: metadata as Prisma.InputJsonValue } : {}),
        },
      });
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.withTenantContext(async (tx) => {
      return tx.item.delete({ where: { id } });
    });
  }
}
