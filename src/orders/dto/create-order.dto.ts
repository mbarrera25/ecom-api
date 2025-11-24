import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { OrderStatus } from '../schemas/order.schema';

class OrderItemDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiProperty({ example: 'Smartphone X' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 199.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'ORD-1001' })
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  orderNumber: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  customerName: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' })
  @IsEnum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status: OrderStatus;

  @ApiProperty({ example: 249.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @ApiProperty({ type: OrderItemDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  placedAt?: Date;

  @ApiPropertyOptional({ example: 'Entregar en horario matutino' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export { OrderItemDto };
