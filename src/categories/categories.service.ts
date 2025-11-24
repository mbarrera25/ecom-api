import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: string[];
  status: Category['status'];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = this.normalizeSlug(dto.slug);

    const existing = await this.categoryModel.exists({ slug });
    if (existing) {
      throw new ConflictException('Category slug is already in use');
    }

    const { parentId, path } = await this.resolveParent(dto.parentId);

    const category = await this.categoryModel.create({
      name: dto.name.trim(),
      slug,
      parentId,
      path,
      status: dto.status ?? 'active',
    });

    return this.toEntity(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const categoryId = this.toObjectId(id);

    const updates: Record<string, unknown> = {};

    if (dto.slug) {
      const slug = this.normalizeSlug(dto.slug);
      const exists = await this.categoryModel.exists({
        slug,
        _id: { $ne: categoryId },
      });
      if (exists) {
        throw new ConflictException('Category slug is already in use');
      }
      updates.slug = slug;
    }

    if (dto.name !== undefined) {
      updates.name = dto.name.trim();
    }

    if (dto.status) {
      updates.status = dto.status;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updates.parentId = null;
        updates.path = [];
      } else {
        const parentInfo = await this.resolveParent(dto.parentId, categoryId);
        updates.parentId = parentInfo.parentId;
        updates.path = parentInfo.path;
      }
    }

    if (dto.parentId === undefined && Object.keys(updates).length === 0) {
      // No direct updates; ensure category exists
      const category = await this.categoryModel.findById(categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(
        categoryId,
        { $set: updates },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Category not found');
    }

    return this.toEntity(updated);
  }

  async archive(id: string): Promise<void> {
    const result = await this.categoryModel
      .findByIdAndUpdate(
        this.toObjectId(id),
        { $set: { status: 'archived' } },
        { new: false },
      )
      .exec();

    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }

  async listStorefront(): Promise<CategoryEntity[]> {
    const categories = await this.categoryModel
      .find({ status: 'active' })
      .sort({ name: 1 })
      .lean()
      .exec();
    return categories.map((category) => this.toEntity(category));
  }

  async listAdmin(): Promise<CategoryEntity[]> {
    const categories = await this.categoryModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return categories.map((category) => this.toEntity(category));
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const normalizedSlug = this.normalizeSlug(slug);
    const category = await this.categoryModel.findOne({ slug: normalizedSlug }).lean().exec();
    return category ? this.toEntity(category) : null;
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const category = await this.categoryModel.findById(id).lean().exec();
    return category ? this.toEntity(category) : null;
  }

  async getOrFail(id: string): Promise<CategoryEntity> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async resolveCategoryId(identifier: string): Promise<Types.ObjectId | null> {
    if (Types.ObjectId.isValid(identifier)) {
      return this.toObjectId(identifier);
    }

    const category = await this.categoryModel.findOne({ slug: this.normalizeSlug(identifier) }, { _id: 1 }).lean().exec();
    if (!category) {
      return null;
    }

    return category._id as Types.ObjectId;
  }

  private async resolveParent(
    parentId?: string,
    currentId?: Types.ObjectId,
  ): Promise<{ parentId: Types.ObjectId | null; path: Types.ObjectId[] }> {
    if (!parentId) {
      return { parentId: null, path: [] };
    }

    const parentObjectId = this.toObjectId(parentId);
    if (currentId && parentObjectId.equals(currentId)) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const parent = await this.categoryModel.findById(parentObjectId).lean().exec();
    if (!parent) {
      throw new NotFoundException('Parent category not found');
    }

    const parentPath: Types.ObjectId[] = Array.isArray(parent.path)
      ? parent.path.map((value) => this.toObjectId(value as any))
      : [];

    if (currentId && parentPath.some((value) => value.equals(currentId))) {
      throw new BadRequestException('Circular category hierarchy is not allowed');
    }

    return {
      parentId: parentObjectId,
      path: [...parentPath, parentObjectId],
    };
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

  private toEntity(category: CategoryDocument | (Category & { _id: Types.ObjectId })): CategoryEntity {
    const plain = typeof (category as any).toObject === 'function' ? (category as any).toObject() : category;
    return {
      id: plain._id.toString(),
      name: plain.name,
      slug: plain.slug,
      parentId: plain.parentId ? plain.parentId.toString() : null,
      path: Array.isArray(plain.path) ? plain.path.map((value: Types.ObjectId) => value.toString()) : [],
      status: plain.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
