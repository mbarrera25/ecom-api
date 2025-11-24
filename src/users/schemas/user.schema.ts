import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserRole = 'customer' | 'admin';

@Schema({ _id: true })
export class Address {
  @Prop({ required: true, trim: true })
  line1: string;

  @Prop({ trim: true })
  line2?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ required: true, trim: true })
  zip: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;
}

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [String], enum: ['customer', 'admin'], default: ['customer'] })
  roles: UserRole[];

  @Prop({ type: [Address], default: [] })
  addresses: Address[];

  createdAt: Date;

  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

export const AddressSchema = SchemaFactory.createForClass(Address);
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    if (ret?.passwordHash) {
      delete ret.passwordHash;
    }
    return ret;
  },
});
