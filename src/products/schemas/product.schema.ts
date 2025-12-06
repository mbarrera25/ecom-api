import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type ProductStatus = 'draft' | 'active' | 'archived';

export class ProductImage {
  @Prop({ required: true })
  url: string;

  @Prop({ required: false, default: '' })
  altText: string;

  @Prop({ required: true, min: 0 })
  position: number;
}

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Product {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Map, of: MongooseSchema.Types.Mixed, default: {} })
  attributes: Record<string, string | number>;

  @Prop({ required: false, trim: true, maxlength: 50 })
  option1Name?: string;

  @Prop({ required: false, trim: true, maxlength: 50 })
  option2Name?: string;

  @Prop({ required: false, trim: true, maxlength: 50 })
  option3Name?: string;

  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

  @Prop({ required: false, trim: true, maxlength: 70 })
  seoTitle?: string;

  @Prop({ required: false, trim: true, maxlength: 160 })
  seoDescription?: string;

  @Prop({ required: true, enum: ['draft', 'active', 'archived'], default: 'draft' })
  status: ProductStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ title: 'text', description: 'text' });
