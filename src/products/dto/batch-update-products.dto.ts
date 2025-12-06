import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMongoId } from 'class-validator';

export class BatchUpdateProductsDto {
  @ApiProperty({ example: ['660f1f2b58e4a4e53f5a5d9b', '660f1f2b58e4a4e53f5a5d9c'] })
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @ApiProperty({ enum: ['draft', 'active', 'archived'], example: 'active' })
  @IsEnum(['draft', 'active', 'archived'])
  status: 'draft' | 'active' | 'archived';
}
