import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Pagina solicitada', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de elementos por pagina', example: 10, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Campo y orden para ordenar los resultados. Ej: createdAt:desc',
    example: 'createdAt:desc',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
