import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateBoxTypeDto {
  @ApiProperty({ example: 'Small Box', description: 'Box type name' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 280, description: 'Inner width in mm' })
  @IsNumber()
  @Min(0)
  innerWidth!: number;

  @ApiProperty({ example: 200, description: 'Inner height in mm' })
  @IsNumber()
  @Min(0)
  innerHeight!: number;

  @ApiProperty({ example: 150, description: 'Inner depth in mm' })
  @IsNumber()
  @Min(0)
  innerDepth!: number;

  @ApiProperty({ example: 290, description: 'Outer width in mm' })
  @IsNumber()
  @Min(0)
  outerWidth!: number;

  @ApiProperty({ example: 210, description: 'Outer height in mm' })
  @IsNumber()
  @Min(0)
  outerHeight!: number;

  @ApiProperty({ example: 160, description: 'Outer depth in mm' })
  @IsNumber()
  @Min(0)
  outerDepth!: number;

  @ApiProperty({ example: 5, description: 'Wall thickness in mm' })
  @IsNumber()
  @Min(0)
  wallThickness!: number;

  @ApiProperty({ example: 200, description: 'Weight of empty box in grams' })
  @IsNumber()
  @Min(0)
  boxWeight!: number;

  @ApiProperty({ example: 10000, description: 'Maximum content weight in grams' })
  @IsNumber()
  @Min(0)
  maxWeight!: number;

  @ApiProperty({ example: 0.50, description: 'Material cost of box in USD' })
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiPropertyOptional({ example: true, description: 'Whether the box type is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
