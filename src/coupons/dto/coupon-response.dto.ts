import { ApiProperty } from '@nestjs/swagger';

export class CouponResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string;

  @ApiProperty({ enum: ['percentage', 'fixed', 'free-shipping'] })
  type: string;

  @ApiProperty()
  value: number;

  @ApiProperty({ required: false, nullable: true })
  minOrderValue?: number;

  @ApiProperty({ type: String, format: 'date-time' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endDate: Date;

  @ApiProperty({ required: false, nullable: true })
  usageLimit?: number;

  @ApiProperty()
  usedCount: number;

  @ApiProperty({ enum: ['draft', 'active', 'expired'] })
  status: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class PaginatedCouponsResponseDto {
  @ApiProperty({ type: CouponResponseDto, isArray: true })
  data: CouponResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
