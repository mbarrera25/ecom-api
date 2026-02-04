import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingEngineService } from './pricing-engine.service';
import { Promotion } from '../promotions/schemas/promotion.schema';
import { Variant } from '../variants/schemas/variant.schema';

describe('PricingEngineService', () => {
  let service: PricingEngineService;
  let promotionModel: Model<Promotion>;

  // Mock data
  const mockVariant: Variant = {
    _id: '64abc123' as any,
    productId: '64product' as any,
    sku: 'TEST-SKU',
    price: 100,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Variant;

  const mockPromotionPercentage: Promotion = {
    _id: '64promo1' as any,
    name: '10% Off',
    discountType: 'percentage',
    discountValue: 10,
    status: 'active',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    targetType: 'all',
    channels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Promotion;

  const mockPromotionFixed: Promotion = {
    _id: '64promo2' as any,
    name: '$15 Off',
    discountType: 'fixed',
    discountValue: 15,
    status: 'active',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    targetType: 'all',
    channels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Promotion;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingEngineService,
        {
          provide: getModelToken(Promotion.name),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PricingEngineService>(PricingEngineService);
    promotionModel = module.get<Model<Promotion>>(getModelToken(Promotion.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyPromotionToPrice', () => {
    it('should apply percentage discount correctly', () => {
      const finalPrice = service.applyPromotionToPrice(100, mockPromotionPercentage);
      expect(finalPrice).toBe(90); // 100 - 10%
    });

    it('should apply fixed discount correctly', () => {
      const finalPrice = service.applyPromotionToPrice(100, mockPromotionFixed);
      expect(finalPrice).toBe(85); // 100 - 15
    });

    it('should not return negative prices', () => {
      const largeDiscount: Promotion = {
        ...mockPromotionFixed,
        discountValue: 150,
      };
      const finalPrice = service.applyPromotionToPrice(100, largeDiscount);
      expect(finalPrice).toBe(0); // Not negative
      expect(finalPrice).toBeGreaterThanOrEqual(0);
    });

    it('should handle percentage that results in zero', () => {
      const fullDiscount: Promotion = {
        ...mockPromotionPercentage,
        discountValue: 100,
      };
      const finalPrice = service.applyPromotionToPrice(100, fullDiscount);
      expect(finalPrice).toBe(0);
    });
  });

  describe('findActivePromotionsForVariant', () => {
    it('should find active promotions with no filters', async () => {
      const mockPromotions = [mockPromotionPercentage];
      
      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPromotions),
      } as any);

      const result = await service.findActivePromotionsForVariant(
        mockVariant,
        '64product',
        '64category',
        'web',
        new Date('2025-06-15'),
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('10% Off');
    });

    it('should filter out expired promotions', async () => {
      const expiredPromotion: Promotion = {
        ...mockPromotionPercentage,
        endDate: new Date('2024-01-01'),
      };

      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.findActivePromotionsForVariant(
        mockVariant,
        '64product',
        '64category',
        'web',
        new Date('2025-06-15'),
      );

      expect(result).toHaveLength(0);
    });

    it('should filter promotions by category', async () => {
      const categoryPromotion: Promotion = {
        ...mockPromotionPercentage,
        targetType: 'category',
        targetReference: '64category',
      };

      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([categoryPromotion]),
      } as any);

      const result = await service.findActivePromotionsForVariant(
        mockVariant,
        '64product',
        '64category',
        'web',
        new Date('2025-06-15'),
      );

      expect(result).toHaveLength(1);
      expect(result[0].targetType).toBe('category');
    });
  });

  describe('getBestPromotionForVariant', () => {
    it('should return null when no promotions are active', async () => {
      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.getBestPromotionForVariant(
        mockVariant,
        '64product',
        '64category',
      );

      expect(result).toBeNull();
    });

    it('should return the promotion with lowest final price', async () => {
      // 10% off = 90
      // $15 off = 85 <- Best
      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPromotionPercentage, mockPromotionFixed]),
      } as any);

      const result = await service.getBestPromotionForVariant(
        mockVariant,
        '64product',
        '64category',
      );

      expect(result).not.toBeNull();
      expect(result!.name).toBe('$15 Off');
      expect(result!.discountType).toBe('fixed');
      expect(result!.discountValue).toBe(15);
    });

    it('should return promotion summary with correct structure', async () => {
      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPromotionPercentage]),
      } as any);

      const result = await service.getBestPromotionForVariant(
        mockVariant,
        '64product',
        '64category',
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('discountType');
      expect(result).toHaveProperty('discountValue');
    });
  });

  describe('calculateFinalPrice', () => {
    it('should return original price when no promotions', async () => {
      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const finalPrice = await service.calculateFinalPrice(
        mockVariant,
        '64product',
        '64category',
      );

      expect(finalPrice).toBe(100);
    });

    it('should return discounted price when promotion exists', async () => {
      jest.spyOn(promotionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPromotionPercentage]),
      } as any);

      const finalPrice = await service.calculateFinalPrice(
        mockVariant,
        '64product',
        '64category',
      );

      expect(finalPrice).toBe(90); // 100 - 10%
    });
  });

  describe('Edge Cases', () => {
    it('should handle variant with price = 0', () => {
      const zeroVariant = { ...mockVariant, price: 0 };
      const finalPrice = service.applyPromotionToPrice(0, mockPromotionPercentage);
      expect(finalPrice).toBe(0);
    });

    it('should handle very small prices correctly', () => {
      const smallPrice = 0.01;
      const finalPrice = service.applyPromotionToPrice(smallPrice, mockPromotionPercentage);
      expect(finalPrice).toBeLessThan(smallPrice);
      expect(finalPrice).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large discounts', () => {
      const largeDiscount: Promotion = {
        ...mockPromotionFixed,
        discountValue: 999999,
      };
      const finalPrice = service.applyPromotionToPrice(100, largeDiscount);
      expect(finalPrice).toBe(0);
    });
  });
});
