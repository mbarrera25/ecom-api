import { ApiProperty } from '@nestjs/swagger';

export class InventoryRecordResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty({ required: false, nullable: true })
  productId?: string;

  @ApiProperty()
  warehouse: string;

  @ApiProperty()
  available: number;

  @ApiProperty()
  reserved: number;

  @ApiProperty({ required: false, nullable: true })
  reorderLevel?: number;

  @ApiProperty({ enum: ['active', 'inactive'] })
  status: string;

  @ApiProperty({ required: false, nullable: true })
  notes?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class PaginatedInventoryResponseDto {
  @ApiProperty({ type: InventoryRecordResponseDto, isArray: true })
  data: InventoryRecordResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
