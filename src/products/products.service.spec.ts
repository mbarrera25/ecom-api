import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const productModel: any = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
  };
  const variantModel: any = {
    distinct: jest.fn(),
  };
  const categoriesService: Partial<CategoriesService> = {
    resolveCategoryId: jest.fn(),
  };
  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(
      productModel,
      variantModel,
      categoriesService as CategoriesService,
    );
  });

  const createQueryChain = (items: any[]) => {
    const chain = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(items),
    };
    return chain;
  };

  it('aplica búsqueda por texto y categoría en listStorefront', async () => {
    const categoryId = new Types.ObjectId();
    (categoriesService.resolveCategoryId as jest.Mock).mockResolvedValue(categoryId);
    variantModel.distinct.mockResolvedValue([]);

    const now = new Date();
    const productDoc = {
      _id: new Types.ObjectId(),
      slug: 'product-slug',
      title: 'Product Title',
      description: 'Desc',
      categoryId,
      attributes: {},
      images: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    productModel.find.mockReturnValue(createQueryChain([productDoc]));
    productModel.countDocuments.mockResolvedValue(1);

    const filters: ProductFiltersDto = {
      page: 1,
      limit: 10,
      q: 'smartphone',
      category: 'electronics',
    } as any;

    const result = await service.listStorefront(filters);

    expect(result.total).toBe(1);
    expect(productModel.find).toHaveBeenCalledTimes(1);
    const query = productModel.find.mock.calls[0][0];
    expect(query.status).toBe('active');
    expect(query.$text).toEqual({ $search: 'smartphone' });
    expect(query.categoryId).toEqual(categoryId);
  });

  it('retorna lista vacía cuando filtros de precio no arrojan productos', async () => {
    variantModel.distinct.mockResolvedValue([]);
    const filters: ProductFiltersDto = {
      page: 1,
      limit: 10,
      priceMin: 100,
      priceMax: 200,
    } as any;

    const result = await service.listStorefront(filters);

    expect(result.total).toBe(0);
    expect(result.data).toHaveLength(0);
    expect(productModel.find).not.toHaveBeenCalled();
  });

  it('lanza ConflictException cuando el slug ya existe al crear', async () => {
    productModel.exists.mockResolvedValue(true);
    await expect(
      service.create({
        slug: 'duplicate-slug',
        title: 'Product',
        description: 'Desc',
        categoryId: new Types.ObjectId().toString(),
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
