import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';

export class BatchUpdateVariantItemDto {
  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9b' })
  @IsMongoId()
  id: string;

  @ApiPropertyOptional({ example: 199.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 250.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class BatchUpdateVariantsDto {
  @ApiProperty({ type: [BatchUpdateVariantItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateVariantItemDto)
  variants: BatchUpdateVariantItemDto[];
}
