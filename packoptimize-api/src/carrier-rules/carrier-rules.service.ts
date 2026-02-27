import { Injectable, Logger } from '@nestjs/common';
import { Carrier } from '@prisma/client';
import { PrismaServiceWithoutTenant } from '../prisma/prisma.service';

@Injectable()
export class CarrierRulesService {
  private readonly logger = new Logger(CarrierRulesService.name);

  constructor(private readonly prisma: PrismaServiceWithoutTenant) {}

  async findAll() {
    return this.prisma.carrierConstraint.findMany({
      orderBy: [{ carrier: 'asc' }, { effectiveDate: 'desc' }],
    });
  }

  async findByCarrier(carrier: Carrier) {
    return this.prisma.carrierConstraint.findMany({
      where: { carrier },
      orderBy: { effectiveDate: 'desc' },
    });
  }
}
