import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { CouponStatus, CouponType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER15', description: 'Código del cupón.' })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9\-]+$/, {
    message: 'El código solo puede contener letras, números y guiones.',
  })
  code: string;

  @ApiPropertyOptional({ example: '15% de descuento en la temporada' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ enum: ['percentage', 'fixed', 'free-shipping'], default: 'percentage' })
  @IsEnum(['percentage', 'fixed', 'free-shipping'])
  type: CouponType;

  @ApiProperty({ example: 15, description: 'Valor del cupón.' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 100, description: 'Monto mínimo del pedido' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ example: 500, description: 'Límite total de usos' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'expired'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'expired'])
  status?: CouponStatus;
}
