import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { PaginatedProductsResponseDto, ProductResponseDto } from '../dto/product-response.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsService } from '../products.service';

@ApiTags('admin/products')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un producto.' })
  @ApiOkResponse({ type: ProductResponseDto })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos (admin).' })
  @ApiOkResponse({ type: PaginatedProductsResponseDto })
  list(@Query() filters: ProductFiltersDto) {
    return this.productsService.listAdmin(filters);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto.' })
  @ApiOkResponse({ type: ProductResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archivar un producto.' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async archive(@Param('id') id: string) {
    await this.productsService.archive(id);
    return { success: true };
  }
}
