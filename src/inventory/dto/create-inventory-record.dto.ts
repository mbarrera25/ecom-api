import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import type { InventoryStatus } from '../schemas/inventory-record.schema';

export class CreateInventoryRecordDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  sku: string;

  @ApiPropertyOptional({ example: '660f1f2b....' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: 'MX-01' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  warehouse: string;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  available: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reserved: number;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: InventoryStatus;

  @ApiPropertyOptional({ example: 'Estiba A-12' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
