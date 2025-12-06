import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  Length,
} from 'class-validator';

export class CreateVariantDto {
  @ApiPropertyOptional({ example: 'SKU-001', description: 'SKU único. Se genera automáticamente si no se proporciona.' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'El SKU debe contener mayúsculas, números o guiones.',
  })
  sku?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiPropertyOptional({ example: 'Red' })
  @IsOptional()
  @IsString()
  option1Value?: string;

  @ApiPropertyOptional({ example: 'L' })
  @IsOptional()
  @IsString()
  option2Value?: string;

  @ApiPropertyOptional({ example: 'Cotton' })
  @IsOptional()
  @IsString()
  option3Value?: string;

  @ApiPropertyOptional({
    type: 'object',
    example: { color: 'Black', size: 'M' },
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, string>;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 250.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'uuid-of-image' })
  @IsOptional()
  @IsString()
  imageId?: string;
}
