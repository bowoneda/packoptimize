import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production API Key', description: 'A label for the API key' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: ['optimize', 'items:read', 'boxes:read'],
    description: 'Permissions for this key',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00Z', description: 'Expiration date' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
