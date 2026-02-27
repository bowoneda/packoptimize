import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@swiftship.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiProperty({ example: 'swiftship', description: 'Tenant slug to identify the tenant' })
  @IsString()
  @MinLength(1)
  tenantSlug!: string;
}
