import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Variant, VariantDocument } from './schemas/variant.schema';

export interface VariantEntity {
  id: string;
  productId: string;
  sku: string;
  price: number;
  currency: string;
  options: Record<string, string>;
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class VariantsService {
  constructor(
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async create(productId: string, dto: CreateVariantDto): Promise<VariantEntity> {
    const normalizedSku = this.normalizeSku(dto.sku);

    const exists = await this.variantModel.exists({ sku: normalizedSku });
    if (exists) {
      throw new ConflictException('Variant SKU is already in use');
    }

    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.variantModel.create({
      productId: new Types.ObjectId(product.id),
      sku: normalizedSku,
      price: dto.price,
      currency: dto.currency.toUpperCase(),
      options: dto.options ?? {},
      stock: dto.stock,
    });

    return this.toEntity(variant);
  }

  async update(variantId: string, dto: UpdateVariantDto): Promise<VariantEntity> {
    const id = this.toObjectId(variantId);

    const updates: Record<string, unknown> = {};

    if (dto.sku) {
      const normalizedSku = this.normalizeSku(dto.sku);
      const exists = await this.variantModel.exists({
        sku: normalizedSku,
        _id: { $ne: id },
      });
      if (exists) {
        throw new ConflictException('Variant SKU is already in use');
      }
      updates.sku = normalizedSku;
    }

    if (dto.price !== undefined) {
      updates.price = dto.price;
    }

    if (dto.currency !== undefined) {
      updates.currency = dto.currency.toUpperCase();
    }

    if (dto.options !== undefined) {
      updates.options = dto.options;
    }

    if (dto.stock !== undefined) {
      updates.stock = dto.stock;
    }

    const updated = await this.variantModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Variant not found');
    }

    return this.toEntity(updated);
  }

  async remove(variantId: string): Promise<void> {
    const removed = await this.variantModel.findByIdAndDelete(this.toObjectId(variantId)).exec();
    if (!removed) {
      throw new NotFoundException('Variant not found');
    }
  }

  async listByProduct(productId: string): Promise<VariantEntity[]> {
    if (!Types.ObjectId.isValid(productId)) {
      return [];
    }
    const variants = await this.variantModel
      .find({ productId: new Types.ObjectId(productId) })
      .lean()
      .exec();
    return variants.map((variant) => this.toEntity(variant));
  }

  private normalizeSku(sku: string): string {
    return sku.trim().toUpperCase();
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (id instanceof Types.ObjectId) {
      return id;
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Variant not found');
    }
    return new Types.ObjectId(id);
  }

  private toEntity(variant: VariantDocument | (Variant & { _id: Types.ObjectId })): VariantEntity {
    const plain = typeof (variant as any).toObject === 'function' ? (variant as any).toObject() : variant;
    const options =
      plain.options instanceof Map ? Object.fromEntries(plain.options) : plain.options ?? {};
    return {
      id: plain._id.toString(),
      productId: plain.productId.toString(),
      sku: plain.sku,
      price: plain.price,
      currency: plain.currency,
      options,
      stock: plain.stock,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
