import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponFiltersDto } from './dto/coupon-filters.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

export interface CouponEntity {
  id: string;
  code: string;
  description?: string;
  type: string;
  value: number;
  minOrderValue?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usedCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedCoupons {
  data: CouponEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {}

  async create(dto: CreateCouponDto): Promise<CouponEntity> {
    const code = dto.code.trim().toUpperCase();
    const exists = await this.couponModel.exists({ code });
    if (exists) {
      throw new ConflictException('El código del cupón ya está en uso.');
    }

    const coupon = await this.couponModel.create({
      ...dto,
      code,
    });
    return this.toEntity(coupon);
  }

  async list(filters: CouponFiltersDto): Promise<PaginatedCoupons> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<CouponDocument> = {};

    if (filters.query) {
      query.code = { $regex: filters.query.trim(), $options: 'i' };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const sort = this.buildSort(filters.sort);

    const [data, total] = await Promise.all([
      this.couponModel.find(query).skip(skip).limit(limit).sort(sort).exec(),
      this.couponModel.countDocuments(query),
    ]);

    return {
      data: data.map((doc) => this.toEntity(doc)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<CouponEntity> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }
    return this.toEntity(coupon);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<CouponEntity> {
    const updates: Record<string, unknown> = { ...dto };
    if (dto.code) {
      updates.code = dto.code.trim().toUpperCase();
      const exists = await this.couponModel.exists({
        code: updates.code as string,
        _id: { $ne: id },
      });
      if (exists) {
        throw new ConflictException('El código del cupón ya está en uso.');
      }
    }

    const updated = await this.couponModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Cupón no encontrado');
    }

    return this.toEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Cupón no encontrado');
    }
  }

  private buildSort(sort?: string): string {
    if (!sort) {
      return '-createdAt';
    }
    const [field, order] = sort.split(':');
    const direction = order === 'asc' ? '' : '-';
    return `${direction}${field}`;
  }

  private toEntity(doc: CouponDocument): CouponEntity {
    const obj = doc.toObject({ virtuals: false });
    return {
      id: obj._id.toString(),
      code: obj.code,
      description: obj.description,
      type: obj.type,
      value: obj.value,
      minOrderValue: obj.minOrderValue,
      startDate: obj.startDate,
      endDate: obj.endDate,
      usageLimit: obj.usageLimit,
      usedCount: obj.usedCount,
      status: obj.status,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
