import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { VariantsService } from './variants.service';

describe('VariantsService', () => {
  const variantModel: any = {
    exists: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
  const productsService: Partial<ProductsService> = {
    findById: jest.fn(),
  };
  let service: VariantsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VariantsService(
      variantModel,
      productsService as ProductsService,
    );
  });

  it('lanza ConflictException cuando el SKU ya existe', async () => {
    variantModel.exists.mockResolvedValue(true);
    await expect(
      service.create(new Types.ObjectId().toString(), {
        sku: 'SKU-001',
        price: 10,
        currency: 'usd',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lanza NotFoundException cuando el producto no existe', async () => {
    variantModel.exists.mockResolvedValue(false);
    (productsService.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create(new Types.ObjectId().toString(), {
        sku: 'SKU-002',
        price: 10,
        currency: 'usd',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

