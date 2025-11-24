import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { Variant, VariantDocument } from '../variants/schemas/variant.schema';

export interface ProductEntity {
  id: string;
  slug: string;
  title: string;
  description?: string;
  categoryId: string;
  attributes: Record<string, string | number>;
  images: string[];
  status: Product['status'];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProducts {
  data: ProductEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const slug = this.normalizeSlug(dto.slug);

    const exists = await this.productModel.exists({ slug });
    if (exists) {
      throw new ConflictException('Product slug is already in use');
    }

    const categoryId = await this.resolveCategoryId(dto.categoryId);
    if (!categoryId) {
      throw new NotFoundException('Category not found');
    }

    const product = await this.productModel.create({
      slug,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      categoryId,
      attributes: dto.attributes ?? {},
      images: dto.images ?? [],
      status: dto.status ?? 'draft',
    });

    return this.toEntity(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const productId = this.toObjectId(id);

    const updates: Record<string, unknown> = {};

    if (dto.slug) {
      const slug = this.normalizeSlug(dto.slug);
      const exists = await this.productModel.exists({
        slug,
        _id: { $ne: productId },
      });
      if (exists) {
        throw new ConflictException('Product slug is already in use');
      }
      updates.slug = slug;
    }

    if (dto.title !== undefined) {
      updates.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      updates.description = dto.description?.trim();
    }

    if (dto.categoryId !== undefined) {
      const categoryId = await this.resolveCategoryId(dto.categoryId);
      if (!categoryId) {
        throw new NotFoundException('Category not found');
      }
      updates.categoryId = categoryId;
    }

    if (dto.attributes !== undefined) {
      updates.attributes = dto.attributes;
    }

    if (dto.images !== undefined) {
      updates.images = dto.images;
    }

    if (dto.status !== undefined) {
      updates.status = dto.status;
    }

    const updated = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $set: updates },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return this.toEntity(updated);
  }

  async archive(id: string): Promise<void> {
    const result = await this.productModel
      .findByIdAndUpdate(
        this.toObjectId(id),
        { $set: { status: 'archived' } },
        { new: false },
      )
      .exec();

    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async listStorefront(filters: ProductFiltersDto): Promise<PaginatedProducts> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const { query, empty } = await this.buildQuery(filters, true);
    if (empty) {
      return { data: [], total: 0, page, limit };
    }

    const sort = this.buildSort(filters.sort);

    const [items, total] = await Promise.all([
      this.productModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean()
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return {
      data: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
    };
  }

  async listAdmin(filters: ProductFiltersDto): Promise<PaginatedProducts> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const { query, empty } = await this.buildQuery(filters, false);
    if (empty) {
      return { data: [], total: 0, page, limit };
    }

    const sort = this.buildSort(filters.sort);

    const [items, total] = await Promise.all([
      this.productModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean()
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return {
      data: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const product = await this.productModel.findById(id).lean().exec();
    return product ? this.toEntity(product) : null;
  }

  async getActiveById(id: string): Promise<ProductEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Product not found');
    }
    const product = await this.productModel
      .findOne({ _id: new Types.ObjectId(id), status: 'active' })
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toEntity(product);
  }

  async getOrFail(id: string): Promise<ProductEntity> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await this.productModel
      .findOne({ slug: this.normalizeSlug(slug) })
      .lean()
      .exec();
    return product ? this.toEntity(product) : null;
  }

  async getActiveBySlug(slug: string): Promise<ProductEntity> {
    const product = await this.productModel
      .findOne({ slug: this.normalizeSlug(slug), status: 'active' })
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toEntity(product);
  }

  async listByCategorySlug(
    slug: string,
    filters: ProductFiltersDto,
  ): Promise<PaginatedProducts> {
    const categoryId = await this.categoriesService.resolveCategoryId(slug);
    if (!categoryId) {
      return { data: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 10 };
    }

    return this.listStorefront({
      ...filters,
      category: categoryId.toString(),
    });
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (id instanceof Types.ObjectId) {
      return id;
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid identifier');
    }
    return new Types.ObjectId(id);
  }

  private async resolveCategoryId(idOrSlug: string): Promise<Types.ObjectId | null> {
    return this.categoriesService.resolveCategoryId(idOrSlug);
  }

  private buildSort(sort?: string): Record<string, 1 | -1> {
    if (!sort) {
      return { createdAt: -1 };
    }

    const [field, order = 'desc'] = sort.split(':');
    const direction = order.toLowerCase() === 'asc' ? 1 : -1;

    if (field === 'price') {
      // Sorting by price requires aggregation; not supported directly here.
      return { createdAt: -1 };
    }

    return { [field]: direction as 1 | -1 };
  }

  private async buildQuery(
    filters: ProductFiltersDto,
    enforceActive: boolean,
  ): Promise<{ query: FilterQuery<ProductDocument>; empty: boolean }> {
    const query: FilterQuery<ProductDocument> = {};

    if (enforceActive) {
      query.status = 'active';
    }

    if (filters.q) {
      query.$text = { $search: filters.q };
    }

    if (filters.category) {
      const categoryId = await this.categoriesService.resolveCategoryId(filters.category);
      if (!categoryId) {
        return { query, empty: true };
      }
      query.categoryId = categoryId;
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const priceRange: Record<string, number> = {};
      if (filters.priceMin !== undefined) {
        priceRange.$gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        priceRange.$lte = filters.priceMax;
      }

      const productIds = await this.variantModel.distinct('productId', {
        price: priceRange,
      });

      if (!productIds.length) {
        return { query, empty: true };
      }

      query._id = { $in: productIds };
    }

    return { query, empty: false };
  }

  private toEntity(product: ProductDocument | (Product & { _id: Types.ObjectId })): ProductEntity {
    const plain = typeof (product as any).toObject === 'function' ? (product as any).toObject() : product;
    const attributes =
      plain.attributes instanceof Map ? Object.fromEntries(plain.attributes) : plain.attributes ?? {};
    return {
      id: plain._id.toString(),
      slug: plain.slug,
      title: plain.title,
      description: plain.description,
      categoryId: plain.categoryId.toString(),
      attributes,
      images: plain.images ?? [],
      status: plain.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
