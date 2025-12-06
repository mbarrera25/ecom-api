import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  url: string;

  @ApiProperty({ example: 'Product image description', required: false })
  altText?: string;

  @ApiProperty({ example: 0 })
  position: number;
}

export class ProductResponseDto {
  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9c' })
  id: string;

  @ApiProperty({ example: 'smartphone-xyz' })
  slug: string;

  @ApiProperty({ example: 'Smartphone XYZ' })
  title: string;

  @ApiProperty({ example: 'Descripción del producto', required: false, nullable: true })
  description?: string;

  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9b' })
  categoryId: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    },
  })
  attributes: Record<string, string | number>;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images: ProductImageResponseDto[];

  @ApiProperty({ example: 'SEO optimized title', required: false, nullable: true })
  seoTitle?: string;

  @ApiProperty({ example: 'SEO optimized description', required: false, nullable: true })
  seoDescription?: string;

  @ApiProperty({ enum: ['draft', 'active', 'archived'] })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: ProductResponseDto, isArray: true })
  data: ProductResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
