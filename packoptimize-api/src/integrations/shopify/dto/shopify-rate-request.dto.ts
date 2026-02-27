import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShopifyAddress {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;
}

class ShopifyItem {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty()
  @IsNumber()
  quantity!: number;

  @ApiProperty({ description: 'Weight in grams' })
  @IsNumber()
  grams!: number;

  @ApiProperty({ description: 'Price in cents' })
  @IsNumber()
  price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  properties?: Record<string, string>;
}

class ShopifyRate {
  @ApiProperty({ type: ShopifyAddress })
  @ValidateNested()
  @Type(() => ShopifyAddress)
  origin!: ShopifyAddress;

  @ApiProperty({ type: ShopifyAddress })
  @ValidateNested()
  @Type(() => ShopifyAddress)
  destination!: ShopifyAddress;

  @ApiProperty({ type: [ShopifyItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopifyItem)
  items!: ShopifyItem[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;
}

export class ShopifyRateRequestDto {
  @ApiProperty({ type: ShopifyRate })
  @ValidateNested()
  @Type(() => ShopifyRate)
  rate!: ShopifyRate;
}
