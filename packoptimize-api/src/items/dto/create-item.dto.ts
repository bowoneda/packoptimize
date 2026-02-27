import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min } from 'class-validator';
import type { Prisma } from '@prisma/client';

export class CreateItemDto {
  @ApiProperty({ example: 'SKU-001', description: 'Unique SKU identifier' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Widget A', description: 'Item name' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 100, description: 'Width in mm' })
  @IsNumber()
  @Min(0)
  width!: number;

  @ApiProperty({ example: 50, description: 'Height in mm' })
  @IsNumber()
  @Min(0)
  height!: number;

  @ApiProperty({ example: 75, description: 'Depth in mm' })
  @IsNumber()
  @Min(0)
  depth!: number;

  @ApiProperty({ example: 500, description: 'Weight in grams' })
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiPropertyOptional({ example: false, description: 'Whether item is fragile' })
  @IsBoolean()
  @IsOptional()
  isFragile?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether item can be rotated' })
  @IsBoolean()
  @IsOptional()
  canRotate?: boolean;

  @ApiPropertyOptional({ example: 2000, description: 'Max weight this item can support on top (grams)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStackWeight?: number;

  @ApiPropertyOptional({ example: {}, description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Prisma.InputJsonValue;
}
