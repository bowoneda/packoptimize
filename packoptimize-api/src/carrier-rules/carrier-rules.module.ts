import { Module } from '@nestjs/common';
import { CarrierRulesController } from './carrier-rules.controller';
import { CarrierRulesService } from './carrier-rules.service';

@Module({
  controllers: [CarrierRulesController],
  providers: [CarrierRulesService],
  exports: [CarrierRulesService],
})
export class CarrierRulesModule {}
