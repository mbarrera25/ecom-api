import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Promotion, PromotionDocument } from '../promotions/schemas/promotion.schema';
import { Variant } from '../variants/schemas/variant.schema';

/**
 * Interface for Applied Promotion Summary
 * Defines the structure of promotion information attached to a variant
 */
export interface AppliedPromotionSummary {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

/**
 * PricingEngineService
 *
 * Servicio central para calcular precios de productos considerando promociones activas.
 * Este servicio NO modifica los precios en la base de datos, solo calcula precios
 * finales basados en promociones activas.
 */
@Injectable()
export class PricingEngineService {
  constructor(
    @InjectModel(Promotion.name)
    private readonly promotionModel: Model<PromotionDocument>,
  ) {}

  /**
   * Encuentra todas las promociones activas que apliquen a una variante específica.
   *
   * @param variant - La variante del producto
   * @param productId - ID del producto al que pertenece la variante
   * @param categoryId - ID de la categoría del producto
   * @param channel - Canal de venta (ej: 'web', 'retail') - opcional
   * @param date - Fecha para validar vigencia de promociones (default: now)
   * @returns Array de promociones activas aplicables
   */
  async findActivePromotionsForVariant(
    variant: Variant,
    productId: string,
    categoryId: string,
    channel: string = 'web',
    date: Date = new Date(),
  ): Promise<PromotionDocument[]> {
    // Query base: promociones activas dentro del rango de fechas
    const query: any = {
      status: 'active',
      startDate: { $lte: date },
      endDate: { $gte: date },
    };

    // Filtrar por canal si se especifica
    // Si channels está vacío, aplica a todos los canales
    query.$or = [
      { channels: { $size: 0 } },
      { channels: channel },
    ];

    const allPromotions = await this.promotionModel.find(query).exec();

    // Filtrar por targetType
    const applicablePromotions = allPromotions.filter((promo) => {
      // 'all' aplica a todos los productos
      if (promo.targetType === 'all') {
        return true;
      }

      // 'category' aplica si la categoría coincide
      if (promo.targetType === 'category' && promo.targetReference) {
        return promo.targetReference === categoryId;
      }

      // 'product' aplica si el producto coincide
      if (promo.targetType === 'product' && promo.targetReference) {
        return promo.targetReference === productId;
      }

      return false;
    });

    return applicablePromotions;
  }

  /**
   * Aplica una promoción a un precio base y retorna el precio final.
   *
   * @param price - Precio base (variant.price)
   * @param promotion - Promoción a aplicar
   * @returns Precio final después de aplicar el descuento
   */
  applyPromotionToPrice(price: number, promotion: PromotionDocument): number {
    if (promotion.discountType === 'percentage') {
      // Descuento porcentual  
      const discount = (price * promotion.discountValue) / 100;
      return Math.max(0, price - discount);
    }

    if (promotion.discountType === 'fixed') {
      // Descuento fijo
      return Math.max(0, price - promotion.discountValue);
    }

    // Si el tipo de descuento no es reconocido, retornar precio original
    return price;
  }

  /**
   * Encuentra la mejor promoción para una variante (la que deje el menor precio).
   *
   * @param variant - La variante del producto
   * @param productId - ID del producto
   * @param categoryId - ID de la categoría
   * @param channel - Canal de venta (opcional)
   * @param date - Fecha para validación (default: now)
   * @returns Resumen de la mejor promoción aplicable, o null si no hay ninguna
   */
  async getBestPromotionForVariant(
    variant: Variant,
    productId: string,
    categoryId: string,
    channel: string = 'web',
    date: Date = new Date(),
  ): Promise<AppliedPromotionSummary | null> {
    const promotions = await this.findActivePromotionsForVariant(
      variant,
      productId,
      categoryId,
      channel,
      date,
    );

    if (promotions.length === 0) {
      return null;
    }

    // Evaluar cada promoción y encontrar la que deje el menor precio final
    let bestPromotion: PromotionDocument | null = null;
    let lowestPrice = variant.price;

    for (const promo of promotions) {
      const finalPrice = this.applyPromotionToPrice(variant.price, promo);
      if (finalPrice < lowestPrice) {
        lowestPrice = finalPrice;
        bestPromotion = promo;
      }
    }

    if (!bestPromotion) {
      return null;
    }

    // Retornar resumen de la promoción
    return {
      id: bestPromotion._id.toString(),
      name: bestPromotion.name,
      discountType: bestPromotion.discountType,
      discountValue: bestPromotion.discountValue,
    };
  }

  /**
   * Calcula el precio final de una variante considerando promociones activas.
   *
   * @param variant - La variante del producto
   * @param productId - ID del producto
   * @param categoryId - ID de la categoría
   * @param channel - Canal de venta (opcional)
   * @param date - Fecha para validación (default: now)
   * @returns Precio final calculado
   */
  async calculateFinalPrice(
    variant: Variant,
    productId: string,
    categoryId: string,
    channel: string = 'web',
    date: Date = new Date(),
  ): Promise<number> {
    const bestPromotion = await this.getBestPromotionForVariant(
      variant,
      productId,
      categoryId,
      channel,
      date,
    );

    if (!bestPromotion) {
      return variant.price;
    }

    // Necesitamos el objeto Promotion completo para aplicar el descuento
    // Por ahora, inferimos el cálculo desde el summary
    if (bestPromotion.discountType === 'percentage') {
      const discount = (variant.price * bestPromotion.discountValue) / 100;
      return Math.max(0, variant.price - discount);
    }

    if (bestPromotion.discountType === 'fixed') {
      return Math.max(0, variant.price - bestPromotion.discountValue);
    }

    return variant.price;
  }
}
