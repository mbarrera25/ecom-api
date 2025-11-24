import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryStatus = 'active' | 'hidden' | 'archived';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Category {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: Category.name, default: null })
  parentId?: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], default: [] })
  path: Types.ObjectId[];

  @Prop({ required: true, enum: ['active', 'hidden', 'archived'], default: 'active' })
  status: CategoryStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<Category>;

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ path: 1 });
