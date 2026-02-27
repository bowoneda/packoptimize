import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateApiKeyDto) {
    const rawKey = `pk_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12);

    const apiKey = await this.prisma.withTenantContext(async (tx) => {
      return tx.apiKey.create({
        data: {
          tenantId,
          userId,
          keyHash,
          keyPrefix,
          permissions: dto.permissions ?? ['optimize', 'items:read', 'boxes:read'],
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      });
    });

    return {
      id: apiKey.id,
      key: rawKey,
      keyPrefix,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.withTenantContext(async (tx) => {
      return tx.apiKey.findMany({
        where: { tenantId },
        select: {
          id: true,
          keyPrefix: true,
          permissions: true,
          expiresAt: true,
          lastUsedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async revoke(tenantId: string, id: string) {
    return this.prisma.withTenantContext(async (tx) => {
      const key = await tx.apiKey.findFirst({
        where: { id, tenantId },
      });
      if (!key) {
        throw new NotFoundException(`API key not found`);
      }
      return tx.apiKey.delete({ where: { id } });
    });
  }
}
