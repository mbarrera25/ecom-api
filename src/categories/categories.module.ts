import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { CategoriesService } from './categories.service';
import { AdminCategoriesController } from './controllers/categories.admin.controller';
import { CategoriesStorefrontController } from './controllers/categories.storefront.controller';
import { Category, CategorySchema } from './schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [CategoriesStorefrontController, AdminCategoriesController],
  providers: [CategoriesService, JwtAuthGuard, RolesGuard],
  exports: [CategoriesService],
})
export class CategoriesModule {}

