import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

class OrderItem {
  @Prop({ required: true, trim: true })
  sku: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, trim: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, trim: true })
  customerEmail: string;

  @Prop({ type: String, enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' })
  status: OrderStatus;

  @Prop({ type: Number, required: true, min: 0 })
  totalAmount: number;

  @Prop({ trim: true, default: 'USD' })
  currency: string;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ type: Date, default: () => new Date() })
  placedAt: Date;

  @Prop({ trim: true })
  notes?: string;

  createdAt: Date;

  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
