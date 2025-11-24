import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';
import type { OrderStatus } from '../schemas/order.schema';

export class OrderFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Buscar por número o cliente', example: 'ORD-1001' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status?: OrderStatus;
}
