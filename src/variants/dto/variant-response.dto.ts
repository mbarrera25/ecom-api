import { ApiProperty } from '@nestjs/swagger';

export class VariantResponseDto {
  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9f' })
  id: string;

  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9c' })
  productId: string;

  @ApiProperty({ example: 'SKU-001' })
  sku: string;

  @ApiProperty({ example: 199.99 })
  price: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  options: Record<string, string>;

  @ApiProperty({ example: 10, required: false, nullable: true })
  stock?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;
}
