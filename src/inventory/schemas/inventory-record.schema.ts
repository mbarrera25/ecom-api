import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryRecordDocument = HydratedDocument<InventoryRecord>;
export type InventoryStatus = 'active' | 'inactive';

@Schema({ timestamps: true })
export class InventoryRecord {
  @Prop({ required: true, trim: true })
  sku: string;

  @Prop({ trim: true })
  productId?: string;

  @Prop({ required: true, trim: true })
  warehouse: string;

  @Prop({ type: Number, required: true, min: 0 })
  available: number;

  @Prop({ type: Number, required: true, min: 0 })
  reserved: number;

  @Prop({ type: Number, default: 0, min: 0 })
  reorderLevel?: number;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: InventoryStatus;

  @Prop({ trim: true })
  notes?: string;

  createdAt: Date;

  updatedAt: Date;
}

export const InventoryRecordSchema = SchemaFactory.createForClass(InventoryRecord);
