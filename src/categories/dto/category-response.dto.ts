import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9b' })
  id: string;

  @ApiProperty({ example: 'Electrónica' })
  name: string;

  @ApiProperty({ example: 'electronica' })
  slug: string;

  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9a', nullable: true, required: false })
  parentId?: string | null;

  @ApiProperty({ type: String, isArray: true })
  path: string[];

  @ApiProperty({ enum: ['active', 'hidden', 'archived'] })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

