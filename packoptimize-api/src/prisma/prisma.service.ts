import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly cls: ClsService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Execute a callback within tenant context by setting the PostgreSQL session variable.
   * This enables RLS policies to filter data by tenant.
   */
  async withTenantContext<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> {
    const tenantId = this.cls.get('TENANT_ID') as string | undefined;
    if (!tenantId) {
      return callback(this);
    }

    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
      return callback(tx as unknown as PrismaClient);
    });
  }
}

/**
 * A separate PrismaClient instance that does NOT use tenant context.
 * Used for operations that need to bypass RLS (e.g., API key lookups during auth).
 */
@Injectable()
export class PrismaServiceWithoutTenant extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaServiceWithoutTenant.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma (no-tenant) connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
