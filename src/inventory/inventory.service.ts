import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateInventoryRecordDto } from './dto/create-inventory-record.dto';
import { InventoryFiltersDto } from './dto/inventory-filters.dto';
import { UpdateInventoryRecordDto } from './dto/update-inventory-record.dto';
import { InventoryRecord, InventoryRecordDocument } from './schemas/inventory-record.schema';

export interface InventoryRecordEntity {
  id: string;
  sku: string;
  productId?: string;
  warehouse: string;
  available: number;
  reserved: number;
  reorderLevel?: number;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedInventory {
  data: InventoryRecordEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryRecord.name)
    private readonly inventoryModel: Model<InventoryRecordDocument>,
  ) {}

  async create(dto: CreateInventoryRecordDto): Promise<InventoryRecordEntity> {
    const record = await this.inventoryModel.create(dto);
    return this.toEntity(record);
  }

  async list(filters: InventoryFiltersDto): Promise<PaginatedInventory> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<InventoryRecordDocument> = {};

    if (filters.query) {
      const regex = new RegExp(filters.query.trim(), 'i');
      query.$or = [{ sku: regex }, { warehouse: regex }];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const sort = this.buildSort(filters.sort);

    const [data, total] = await Promise.all([
      this.inventoryModel.find(query).skip(skip).limit(limit).sort(sort).exec(),
      this.inventoryModel.countDocuments(query),
    ]);

    return {
      data: data.map((doc) => this.toEntity(doc)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<InventoryRecordEntity> {
    const record = await this.inventoryModel.findById(id).exec();
    if (!record) {
      throw new NotFoundException('Registro de inventario no encontrado');
    }
    return this.toEntity(record);
  }

  async update(id: string, dto: UpdateInventoryRecordDto): Promise<InventoryRecordEntity> {
    const updated = await this.inventoryModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Registro de inventario no encontrado');
    }
    return this.toEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.inventoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Registro de inventario no encontrado');
    }
  }

  private buildSort(sort?: string): string {
    if (!sort) {
      return '-updatedAt';
    }
    const [field, order] = sort.split(':');
    const direction = order === 'asc' ? '' : '-';
    return `${direction}${field}`;
  }

  private toEntity(doc: InventoryRecordDocument): InventoryRecordEntity {
    const obj = doc.toObject({ virtuals: false });
    return {
      id: obj._id.toString(),
      sku: obj.sku,
      productId: obj.productId,
      warehouse: obj.warehouse,
      available: obj.available,
      reserved: obj.reserved,
      reorderLevel: obj.reorderLevel,
      status: obj.status,
      notes: obj.notes,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
