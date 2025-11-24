import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductFiltersDto } from '../../products/dto/product-filters.dto';
import { PaginatedProductsResponseDto } from '../../products/dto/product-response.dto';
import { ProductsService } from '../../products/products.service';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoriesService } from '../categories.service';

@ApiTags('categories')
@Controller('api/v1/categories')
export class CategoriesStorefrontController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías activas para el storefront.' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  listCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.listStorefront();
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Listar productos por categoría (slug).' })
  @ApiOkResponse({ type: PaginatedProductsResponseDto })
  listCategoryProducts(
    @Param('slug') slug: string,
    @Query() filters: ProductFiltersDto,
  ) {
    return this.productsService.listByCategorySlug(slug, filters);
  }
}

