import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class ProductFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Búsqueda por texto (title/description).' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por texto (alias de q).' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'ID o slug de categoría.',
    example: '660f1f2b58e4a4e53f5a5d9b',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo.', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @ApiPropertyOptional({ description: 'Precio máximo.', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;
}
