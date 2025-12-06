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
import { BatchUpdateVariantsDto } from './dto/batch-update-variants.dto';
import { Variant, VariantDocument } from './schemas/variant.schema';

export interface VariantEntity {
  id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  currency: string;
  option1Value?: string;
  option2Value?: string;
  option3Value?: string;
  options: Record<string, string>;
  stock?: number;
  barcode?: string;
  weight?: number;
  imageId?: string;
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
    // Generate SKU if not provided
    const sku = dto.sku ? this.normalizeSku(dto.sku) : await this.generateSku(productId);

    const exists = await this.variantModel.exists({ sku });
    if (exists) {
      throw new ConflictException('Variant SKU is already in use');
    }

    if (dto.compareAtPrice !== undefined && dto.compareAtPrice < dto.price) {
      throw new ConflictException('compareAtPrice must be greater than or equal to price');
    }

    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.variantModel.create({
      productId: new Types.ObjectId(product.id),
      sku,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      cost: dto.cost,
      currency: dto.currency.toUpperCase(),
      option1Value: dto.option1Value?.trim(),
      option2Value: dto.option2Value?.trim(),
      option3Value: dto.option3Value?.trim(),
      options: dto.options ?? {},
      stock: dto.stock,
      barcode: dto.barcode,
      weight: dto.weight,
      imageId: dto.imageId,
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

    if (dto.compareAtPrice !== undefined) {
      const price = dto.price !== undefined ? dto.price : (await this.variantModel.findById(id))?.price;
      if (price !== undefined && dto.compareAtPrice < price) {
        throw new ConflictException('compareAtPrice must be greater than or equal to price');
      }
      updates.compareAtPrice = dto.compareAtPrice;
    }

    if (dto.cost !== undefined) {
      updates.cost = dto.cost;
    }

    if (dto.currency !== undefined) {
      updates.currency = dto.currency.toUpperCase();
    }

    if (dto.option1Value !== undefined) {
      updates.option1Value = dto.option1Value?.trim();
    }
    if (dto.option2Value !== undefined) {
      updates.option2Value = dto.option2Value?.trim();
    }
    if (dto.option3Value !== undefined) {
      updates.option3Value = dto.option3Value?.trim();
    }

    if (dto.options !== undefined) {
      updates.options = dto.options;
    }

    if (dto.stock !== undefined) {
      updates.stock = dto.stock;
    }

    if (dto.barcode !== undefined) {
      updates.barcode = dto.barcode;
    }

    if (dto.weight !== undefined) {
      updates.weight = dto.weight;
    }

    if (dto.imageId !== undefined) {
      updates.imageId = dto.imageId;
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

  async batchUpdate(dto: BatchUpdateVariantsDto): Promise<void> {
    const session = await this.variantModel.db.startSession();
    session.startTransaction();

    try {
      for (const item of dto.variants) {
        const updates: Record<string, unknown> = {};
        if (item.price !== undefined) updates.price = item.price;
        if (item.compareAtPrice !== undefined) updates.compareAtPrice = item.compareAtPrice;
        if (item.stock !== undefined) updates.stock = item.stock;

        if (Object.keys(updates).length > 0) {
          await this.variantModel.findByIdAndUpdate(item.id, { $set: updates }).session(session);
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
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
      compareAtPrice: plain.compareAtPrice,
      cost: plain.cost,
      currency: plain.currency,
      option1Value: plain.option1Value,
      option2Value: plain.option2Value,
      option3Value: plain.option3Value,
      options,
      stock: plain.stock,
      barcode: plain.barcode,
      weight: plain.weight,
      imageId: plain.imageId,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  /**
   * Generates a unique SKU for a variant
   * Format: PROD-{productId}-VAR-{count}
   */
  private async generateSku(productId: string): Promise<string> {
    const count = await this.variantModel.countDocuments({ productId: new Types.ObjectId(productId) });
    const product = await this.productsService.findById(productId);
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Create SKU from product slug and variant count
    const slugPart = product.slug
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    
    const variantNumber = (count + 1).toString().padStart(3, '0');
    
    return `${slugPart}-VAR-${variantNumber}`;
  }
}
