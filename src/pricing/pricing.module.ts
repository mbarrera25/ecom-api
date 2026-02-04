import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Promotion, PromotionSchema } from '../promotions/schemas/promotion.schema';
import { PricingEngineService } from './pricing-engine.service';

/**
 * PricingModule
 *
 * Módulo centralizado para la gestión de precios y aplicación de promociones.
 * Exporta el PricingEngineService para ser usado por otros módulos (ej: ProductsModule).
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
    ]),
  ],
  providers: [PricingEngineService],
  exports: [PricingEngineService],
})
export class PricingModule {}
