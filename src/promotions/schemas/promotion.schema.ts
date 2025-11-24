import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;
export type PromotionStatus = 'draft' | 'active' | 'expired';
export type PromotionDiscountType = 'percentage' | 'fixed';
export type PromotionTargetType = 'all' | 'category' | 'product';

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, enum: ['percentage', 'fixed'], default: 'percentage' })
  discountType: PromotionDiscountType;

  @Prop({ type: Number, required: true, min: 0 })
  discountValue: number;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: String, enum: ['draft', 'active', 'expired'], default: 'draft' })
  status: PromotionStatus;

  @Prop({ type: String, enum: ['all', 'category', 'product'], default: 'all' })
  targetType: PromotionTargetType;

  @Prop({ trim: true, required: false })
  targetReference?: string;

  @Prop({ type: [String], default: [] })
  channels: string[];

  createdAt: Date;

  updatedAt: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
