import { ApiProperty } from '@nestjs/swagger';

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string;

  @ApiProperty({ enum: ['percentage', 'fixed'] })
  discountType: string;

  @ApiProperty()
  discountValue: number;

  @ApiProperty({ type: String, format: 'date-time' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endDate: Date;

  @ApiProperty({ enum: ['draft', 'active', 'expired'] })
  status: string;

  @ApiProperty({ enum: ['all', 'category', 'product'] })
  targetType: string;

  @ApiProperty({ required: false, nullable: true })
  targetReference?: string;

  @ApiProperty({ type: String, isArray: true })
  channels: string[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class PaginatedPromotionsResponseDto {
  @ApiProperty({ type: PromotionResponseDto, isArray: true })
  data: PromotionResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
