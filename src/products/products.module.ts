import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsStorefrontController } from './controllers/products.storefront.controller';
import { AdminProductsController } from './controllers/products.admin.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from '../variants/schemas/variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
    ]),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [ProductsStorefrontController, AdminProductsController],
  providers: [ProductsService, JwtAuthGuard, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}

