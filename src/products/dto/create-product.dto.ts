import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ProductStatus } from '../schemas/product.schema';

export class ProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Product image description' })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  position: number;
}

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

  @ApiPropertyOptional({ example: 'Color' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  option1Name?: string;

  @ApiPropertyOptional({ example: 'Size' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  option2Name?: string;

  @ApiPropertyOptional({ example: 'Material' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  option3Name?: string;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ example: 'SEO optimized title', maxLength: 70 })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'SEO optimized description for search engines', maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'archived'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: ProductStatus;
}
