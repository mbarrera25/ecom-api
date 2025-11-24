import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Promotion, PromotionSchema } from './schemas/promotion.schema';
import { PromotionsService } from './promotions.service';
import { AdminPromotionsController } from './controllers/promotions.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Promotion.name,
        schema: PromotionSchema,
      },
    ]),
  ],
  controllers: [AdminPromotionsController],
  providers: [PromotionsService, JwtAuthGuard, RolesGuard],
  exports: [PromotionsService],
})
export class PromotionsModule {}
