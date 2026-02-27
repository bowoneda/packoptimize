import { Module } from '@nestjs/common';
import { BoxTypesController } from './box-types.controller';
import { BoxTypesService } from './box-types.service';

@Module({
  controllers: [BoxTypesController],
  providers: [BoxTypesService],
  exports: [BoxTypesService],
})
export class BoxTypesModule {}
