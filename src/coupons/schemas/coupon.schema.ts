import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

export type CouponType = 'percentage' | 'fixed' | 'free-shipping';
export type CouponStatus = 'draft' | 'active' | 'expired';

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  code: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, enum: ['percentage', 'fixed', 'free-shipping'], default: 'percentage' })
  type: CouponType;

  @Prop({ type: Number, required: true, min: 0 })
  value: number;

  @Prop({ type: Number, default: 0, min: 0 })
  minOrderValue?: number;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  usageLimit?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  usedCount: number;

  @Prop({ type: String, enum: ['draft', 'active', 'expired'], default: 'draft' })
  status: CouponStatus;

  createdAt: Date;

  updatedAt: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
