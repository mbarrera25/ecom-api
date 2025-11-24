import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Variant {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true, uppercase: true, unique: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, trim: true, uppercase: true, maxlength: 10 })
  currency: string;

  @Prop({ type: Map, of: String, default: {} })
  options: Record<string, string>;

  @Prop({ required: false, min: 0 })
  stock?: number;

  createdAt: Date;
  updatedAt: Date;
}

export type VariantDocument = HydratedDocument<Variant>;

export const VariantSchema = SchemaFactory.createForClass(Variant);

VariantSchema.index({ productId: 1 });
VariantSchema.index({ sku: 1 }, { unique: true });
