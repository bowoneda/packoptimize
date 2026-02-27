import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BatchOrderItemDto {
  @ApiProperty({ description: 'Item ID from catalog' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Quantity' })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}

class BatchOrderDto {
  @ApiProperty({ description: 'Your order identifier' })
  @IsString()
  orderId!: string;

  @ApiProperty({ type: [BatchOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchOrderItemDto)
  items!: BatchOrderItemDto[];
}

export class BatchOptimizeRequestDto {
  @ApiProperty({ type: [BatchOrderDto], description: 'Orders to optimize (max 100)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BatchOrderDto)
  orders!: BatchOrderDto[];

  @ApiPropertyOptional({ enum: ['FEDEX', 'UPS', 'USPS'], default: 'FEDEX' })
  @IsOptional()
  @IsEnum(['FEDEX', 'UPS', 'USPS'])
  carrier?: string;

  @ApiPropertyOptional({ enum: ['COST', 'SPACE', 'FEWEST_BOXES'], default: 'COST' })
  @IsOptional()
  @IsEnum(['COST', 'SPACE', 'FEWEST_BOXES'])
  optimizeFor?: string;

  @ApiPropertyOptional({
    enum: ['AIR_PILLOWS', 'KRAFT_PAPER', 'BUBBLE_WRAP', 'PACKING_PEANUTS', 'FOAM_IN_PLACE'],
    default: 'AIR_PILLOWS',
  })
  @IsOptional()
  @IsEnum(['AIR_PILLOWS', 'KRAFT_PAPER', 'BUBBLE_WRAP', 'PACKING_PEANUTS', 'FOAM_IN_PLACE'])
  fillMaterial?: string;
}
