import { Global, Module } from '@nestjs/common';
import { PrismaService, PrismaServiceWithoutTenant } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaServiceWithoutTenant],
  exports: [PrismaService, PrismaServiceWithoutTenant],
})
export class PrismaModule {}
