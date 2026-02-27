import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OptimizeItemDto {
  @ApiProperty({ example: 'item-uuid-here', description: 'Item ID from your catalog' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 2, description: 'Quantity of this item to pack' })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}

export class OptimizeRequestDto {
  @ApiProperty({ type: [OptimizeItemDto], description: 'Items to optimize packing for' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => OptimizeItemDto)
  items!: OptimizeItemDto[];

  @ApiPropertyOptional({ enum: ['FEDEX', 'UPS', 'USPS'], default: 'FEDEX' })
  @IsOptional()
  @IsEnum(['FEDEX', 'UPS', 'USPS'])
  carrier?: string;

  @ApiPropertyOptional({ enum: ['COST', 'SPACE', 'FEWEST_BOXES'], default: 'COST' })
  @IsOptional()
  @IsEnum(['COST', 'SPACE', 'FEWEST_BOXES'])
  optimizeFor?: string;

  @ApiPropertyOptional({ default: 10, description: 'Maximum number of boxes to use' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxBoxes?: number;

  @ApiPropertyOptional({ default: true, description: 'Include flat-rate box comparison' })
  @IsOptional()
  @IsBoolean()
  includeFlatRate?: boolean;

  @ApiPropertyOptional({
    enum: ['AIR_PILLOWS', 'KRAFT_PAPER', 'BUBBLE_WRAP', 'PACKING_PEANUTS', 'FOAM_IN_PLACE'],
    default: 'AIR_PILLOWS',
  })
  @IsOptional()
  @IsEnum(['AIR_PILLOWS', 'KRAFT_PAPER', 'BUBBLE_WRAP', 'PACKING_PEANUTS', 'FOAM_IN_PLACE'])
  fillMaterial?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Additional box type IDs to consider (besides tenant defaults)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  boxTypeIds?: string[];
}
