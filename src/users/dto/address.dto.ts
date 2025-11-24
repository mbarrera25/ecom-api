import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class BaseAddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Primary address line.' })
  @IsString()
  @MaxLength(255)
  line1: string;

  @ApiPropertyOptional({ example: 'Suite 100', description: 'Secondary address line.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiProperty({ example: 'Springfield', description: 'City or locality.' })
  @IsString()
  @MaxLength(120)
  city: string;

  @ApiPropertyOptional({ example: 'CA', description: 'State, province or region.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @ApiProperty({ example: '90210', description: 'Postal or ZIP code.' })
  @IsString()
  @MaxLength(20)
  zip: string;

  @ApiProperty({ example: 'US', description: 'Country code or name.' })
  @IsString()
  @MaxLength(120)
  country: string;

  @ApiPropertyOptional({ example: true, description: 'Mark address as default.' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateAddressDto extends BaseAddressDto {}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: '123 Main St', description: 'Primary address line.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line1?: string;

  @ApiPropertyOptional({ example: 'Suite 100', description: 'Secondary address line.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiPropertyOptional({ example: 'Springfield', description: 'City or locality.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'CA', description: 'State, province or region.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @ApiPropertyOptional({ example: '90210', description: 'Postal or ZIP code.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zip?: string;

  @ApiPropertyOptional({ example: 'US', description: 'Country code or name.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @ApiPropertyOptional({ example: true, description: 'Mark address as default.' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

