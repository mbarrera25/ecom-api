import { ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const categoryModel: any = {
    exists: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };
  let service: CategoriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(categoryModel);
  });

  it('lanza ConflictException cuando el slug ya existe', async () => {
    categoryModel.exists.mockResolvedValue(true);
    await expect(
      service.create({
        name: 'Electrónica',
        slug: 'electronica',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

