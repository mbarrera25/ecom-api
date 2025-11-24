import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { PaginatedProductsResponseDto, ProductResponseDto } from '../dto/product-response.dto';
import { ProductsService } from '../products.service';

@ApiTags('products')
@Controller('products')
export class ProductsStorefrontController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar productos para el storefront.' })
  @ApiOkResponse({ type: PaginatedProductsResponseDto })
  list(@Query() filters: ProductFiltersDto) {
    return this.productsService.listStorefront(filters);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener un producto por slug (storefront).' })
  @ApiOkResponse({ type: ProductResponseDto })
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.getActiveBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por id (storefront).' })
  @ApiOkResponse({ type: ProductResponseDto })
  getById(@Param('id') id: string) {
    return this.productsService.getActiveById(id);
  }
}
