import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { ProductsModule } from '../products/products.module';
import { AdminVariantsController } from './controllers/variants.admin.controller';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { VariantsService } from './variants.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [AdminVariantsController],
  providers: [VariantsService, JwtAuthGuard, RolesGuard],
  exports: [VariantsService],
})
export class VariantsModule {}

