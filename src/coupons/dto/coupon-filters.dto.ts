import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { CouponStatus } from '../schemas/coupon.schema';
import { PaginationDto } from '../../common/pagination.dto';

export class CouponFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Texto de búsqueda por código', example: 'SUMMER' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'expired'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'expired'])
  status?: CouponStatus;
}
