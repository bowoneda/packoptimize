import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ example: 'STARTER', enum: ['STARTER', 'GROWTH'] })
  @IsString()
  @IsIn(['STARTER', 'GROWTH'])
  plan!: 'STARTER' | 'GROWTH';
}
