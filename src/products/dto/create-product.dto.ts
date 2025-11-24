import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ProductStatus } from '../schemas/product.schema';

export class CreateProductDto {
  @ApiProperty({ example: 'smartphone-xyz' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Matches(/^[a-z0-9\-]+$/, {
    message: 'Slug solo puede contener minúsculas, números y guiones.',
  })
  slug: string;

  @ApiProperty({ example: 'Smartphone XYZ' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9b' })
  @IsMongoId()
  categoryId: string;

  @ApiPropertyOptional({
    type: 'object',
    example: { color: 'black', weight: '150g' },
    additionalProperties: {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    },
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string | number>;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'active', 'archived'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: ProductStatus;
}
