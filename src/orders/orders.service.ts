import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderFiltersDto } from './dto/order-filters.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

export interface OrderEntity {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  placedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedOrders {
  data: OrderEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const orderNumber = dto.orderNumber.trim();
    const exists = await this.orderModel.exists({ orderNumber });
    if (exists) {
      throw new ConflictException('El número de pedido ya está en uso.');
    }
    const order = await this.orderModel.create({
      ...dto,
      orderNumber,
      currency: dto.currency ?? 'USD',
      placedAt: dto.placedAt ?? new Date(),
    });
    return this.toEntity(order);
  }

  async list(filters: OrderFiltersDto): Promise<PaginatedOrders> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<OrderDocument> = {};

    if (filters.query) {
      const regex = new RegExp(filters.query.trim(), 'i');
      query.$or = [{ orderNumber: regex }, { customerName: regex }];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const sort = this.buildSort(filters.sort);

    const [data, total] = await Promise.all([
      this.orderModel.find(query).skip(skip).limit(limit).sort(sort).exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      data: data.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<OrderEntity> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return this.toEntity(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderEntity> {
    if (dto.orderNumber) {
      const number = dto.orderNumber.trim();
      const exists = await this.orderModel.exists({
        orderNumber: number,
        _id: { $ne: id },
      });
      if (exists) {
        throw new ConflictException('El número de pedido ya está en uso.');
      }
      dto.orderNumber = number;
    }

    const updated = await this.orderModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return this.toEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Pedido no encontrado');
    }
  }

  private buildSort(sort?: string): string {
    if (!sort) {
      return '-placedAt';
    }
    const [field, order] = sort.split(':');
    const direction = order === 'asc' ? '' : '-';
    return `${direction}${field}`;
  }

  private toEntity(doc: OrderDocument): OrderEntity {
    const obj = doc.toObject({ virtuals: false });
    return {
      id: obj._id.toString(),
      orderNumber: obj.orderNumber,
      customerName: obj.customerName,
      customerEmail: obj.customerEmail,
      status: obj.status,
      totalAmount: obj.totalAmount,
      currency: obj.currency,
      items: obj.items ?? [],
      placedAt: obj.placedAt,
      notes: obj.notes,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
