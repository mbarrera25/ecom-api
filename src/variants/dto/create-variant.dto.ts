import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'El SKU debe contener mayúsculas, números o guiones.',
  })
  sku: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  currency: string;

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
}
