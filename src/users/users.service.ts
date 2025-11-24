import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PaginationDto } from '../common/pagination.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { Address, User, UserDocument, UserRole } from './schemas/user.schema';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsers {
  data: SafeUser[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(params: {
    email: string;
    passwordHash: string;
    name: string;
    roles?: UserRole[];
  }): Promise<SafeUser> {
    const email = params.email.trim().toLowerCase();

    const existing = await this.userModel.exists({ email });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.userModel.create({
      email,
      passwordHash: params.passwordHash,
      name: params.name,
      roles: params.roles ?? ['customer'],
    });

    return this.toSafeUser(user);
  }

  async findByEmail(
    email: string,
    options: { includePassword?: boolean } = {},
  ): Promise<UserDocument | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const query = this.userModel.findOne({ email: normalizedEmail });
    if (options.includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }
    return this.toSafeUser(user);
  }

  async getOrFail(id: string): Promise<SafeUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateMeDto): Promise<SafeUser> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { ...dto } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async addAddress(userId: string, dto: CreateAddressDto): Promise<SafeUser> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      ...dto,
      isDefault: dto.isDefault ?? user.addresses.length === 0,
    } as Address);

    await user.save();

    return this.toSafeUser(user);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<SafeUser> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const address = user.addresses.find(
      (addr: unknown) => (addr as { _id?: unknown })._id?.toString() === addressId,
    ) as (Address & { _id?: unknown }) | undefined;
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, dto);

    await user.save();

    return this.toSafeUser(user);
  }

  async removeAddress(userId: string, addressId: string): Promise<SafeUser> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const index = user.addresses.findIndex(
      (addr: unknown) => (addr as { _id?: unknown })._id?.toString() === addressId,
    );

    if (index === -1) {
      throw new NotFoundException('Address not found');
    }

    user.addresses.splice(index, 1);

    if (!user.addresses.some((addr) => addr.isDefault) && user.addresses[0]) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return this.toSafeUser(user);
  }

  async updateRoles(userId: string, dto: UpdateRolesDto): Promise<SafeUser> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            roles: dto.roles,
          },
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const result = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { passwordHash } },
        { new: false, runValidators: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async listUsers(
    pagination: PaginationDto,
    search?: string,
  ): Promise<PaginatedUsers> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<UserDocument> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ email: regex }, { name: regex }];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(this.buildSort(pagination.sort))
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: data.map((user) => this.toSafeUser(user)),
      total,
      page,
      limit,
    };
  }

  private buildSort(sort?: string): string {
    if (!sort) {
      return '-createdAt';
    }

    const [field, order] = sort.split(':');
    const direction = order === 'asc' ? '' : '-';

    return `${direction}${field}`;
  }

  public toSafeUser(user: UserDocument): SafeUser {
    const plain = user.toObject({ virtuals: false });
    return {
      id: plain._id.toString(),
      email: plain.email,
      name: plain.name,
      roles: plain.roles,
      addresses: plain.addresses ?? [],
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
