import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  IsNumber,
} from 'class-validator';
import type { PromotionDiscountType, PromotionStatus, PromotionTargetType } from '../schemas/promotion.schema';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Black Friday 20%' })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  name: string;

  @ApiPropertyOptional({ example: 'Aplica para toda la tienda.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: ['percentage', 'fixed'], default: 'percentage' })
  @IsEnum(['percentage', 'fixed'])
  discountType: PromotionDiscountType;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'expired'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'expired'])
  status?: PromotionStatus;

  @ApiPropertyOptional({ enum: ['all', 'category', 'product'], default: 'all' })
  @IsOptional()
  @IsEnum(['all', 'category', 'product'])
  targetType?: PromotionTargetType;

  @ApiPropertyOptional({ example: '660f1f2b...' })
  @IsOptional()
  @IsString()
  targetReference?: string;

  @ApiPropertyOptional({ type: String, isArray: true, example: ['web', 'store'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];
}
