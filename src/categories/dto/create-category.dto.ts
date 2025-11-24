import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { CategoryStatus } from '../schemas/category.schema';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electrónica' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'electronica' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Matches(/^[a-z0-9\-]+$/, {
    message: 'Slug solo puede contener minúsculas, números y guiones.',
  })
  slug: string;

  @ApiPropertyOptional({ example: '660f1f2b58e4a4e53f5a5d9b' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional({ enum: ['active', 'hidden', 'archived'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'hidden', 'archived'], {
    message: 'Estado inválido.',
  })
  status?: CategoryStatus;
}
