import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@ApiTags('admin/categories')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una categoría.' })
  @ApiOkResponse({ type: CategoryResponseDto })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías (admin).' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  list() {
    return this.categoriesService.listAdmin();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría.' })
  @ApiOkResponse({ type: CategoryResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archivar una categoría.' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async archive(@Param('id') id: string) {
    await this.categoriesService.archive(id);
    return { success: true };
  }
}
