import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { PaginatedProductsResponseDto, ProductResponseDto } from '../dto/product-response.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { BatchUpdateProductsDto } from '../dto/batch-update-products.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID (admin).' })
  @ApiOkResponse({ type: ProductResponseDto })
  getById(@Param('id') id: string) {
    return this.productsService.getOrFail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto.' })
  @ApiOkResponse({ type: ProductResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archivar producto (soft delete).' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async archive(@Param('id') id: string) {
    await this.productsService.archive(id);
    return { success: true };
  }

  @Patch('batch-status')
  @ApiOperation({ summary: 'Actualización masiva de estado.' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async batchUpdateStatus(@Body() dto: BatchUpdateProductsDto) {
    await this.productsService.batchUpdateStatus(dto);
    return { success: true };
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar producto.' })
  @ApiOkResponse({ type: ProductResponseDto })
  async duplicate(@Param('id') id: string) {
    return this.productsService.duplicate(id);
  }
}
