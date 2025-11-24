import { ApiProperty } from '@nestjs/swagger';

class OrderItemResponseDto {
  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty({ enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] })
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: OrderItemResponseDto, isArray: true })
  items: OrderItemResponseDto[];

  @ApiProperty({ type: String, format: 'date-time' })
  placedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  notes?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: OrderResponseDto, isArray: true })
  data: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
