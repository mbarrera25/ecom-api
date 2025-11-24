import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';
import type { InventoryStatus } from '../schemas/inventory-record.schema';

export class InventoryFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Buscar por SKU o almacén', example: 'SKU-001' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: InventoryStatus;
}
