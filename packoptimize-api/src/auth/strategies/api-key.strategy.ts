import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { createHash } from 'crypto';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PrismaServiceWithoutTenant } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'headerapikey') {
  private readonly logger = new Logger(ApiKeyStrategy.name);
  private readonly prismaService: PrismaServiceWithoutTenant;

  constructor(prisma: PrismaServiceWithoutTenant) {
    super({ header: 'X-API-Key', prefix: '' }, false);
    this.prismaService = prisma;
  }

  async validate(apiKey: string): Promise<RequestUser> {
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    const apiKeyRecord = await this.prismaService.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    await this.prismaService.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      userId: apiKeyRecord.userId,
      email: apiKeyRecord.user.email,
      tenantId: apiKeyRecord.tenantId,
      role: apiKeyRecord.user.role,
      permissions: apiKeyRecord.permissions,
    };
  }
}
