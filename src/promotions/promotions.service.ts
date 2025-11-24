import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Promotion, PromotionDocument } from './schemas/promotion.schema';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { PromotionFiltersDto } from './dto/promotion-filters.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

export interface PromotionEntity {
  id: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  status: string;
  targetType: string;
  targetReference?: string;
  channels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPromotions {
  data: PromotionEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name)
    private readonly promotionModel: Model<PromotionDocument>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<PromotionEntity> {
    await this.ensureDateOrder(dto.startDate, dto.endDate);
    const promotion = await this.promotionModel.create({
      ...dto,
      targetType: dto.targetType ?? 'all',
      channels: dto.channels ?? [],
    });
    return this.toEntity(promotion);
  }

  async list(filters: PromotionFiltersDto): Promise<PaginatedPromotions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<PromotionDocument> = {};

    if (filters.query) {
      query.name = { $regex: filters.query.trim(), $options: 'i' };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const sort = this.buildSort(filters.sort);

    const [data, total] = await Promise.all([
      this.promotionModel.find(query).skip(skip).limit(limit).sort(sort).exec(),
      this.promotionModel.countDocuments(query),
    ]);

    return {
      data: data.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<PromotionEntity> {
    const promotion = await this.promotionModel.findById(id).exec();
    if (!promotion) {
      throw new NotFoundException('Promoción no encontrada');
    }
    return this.toEntity(promotion);
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<PromotionEntity> {
    if (dto.startDate && dto.endDate) {
      await this.ensureDateOrder(dto.startDate, dto.endDate);
    }

    const updated = await this.promotionModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...dto,
            channels: dto.channels ?? undefined,
          },
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Promoción no encontrada');
    }

    return this.toEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.promotionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Promoción no encontrada');
    }
  }

  private async ensureDateOrder(start: Date | string, end: Date | string): Promise<void> {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) {
      throw new ConflictException('La fecha de inicio no puede ser posterior a la fecha de fin.');
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

  private toEntity(doc: PromotionDocument): PromotionEntity {
    const obj = doc.toObject({ virtuals: false });
    return {
      id: obj._id.toString(),
      name: obj.name,
      description: obj.description,
      discountType: obj.discountType,
      discountValue: obj.discountValue,
      startDate: obj.startDate,
      endDate: obj.endDate,
      status: obj.status,
      targetType: obj.targetType,
      targetReference: obj.targetReference,
      channels: obj.channels ?? [],
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
