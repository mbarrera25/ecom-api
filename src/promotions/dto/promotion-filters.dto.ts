import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';
import type { PromotionStatus } from '../schemas/promotion.schema';

export class PromotionFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Texto de búsqueda por nombre', example: 'Black Friday' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'expired'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'expired'])
  status?: PromotionStatus;
}
