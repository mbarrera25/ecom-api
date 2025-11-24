import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { PromotionsService } from '../promotions.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionFiltersDto } from '../dto/promotion-filters.dto';
import { PaginatedPromotionsResponseDto, PromotionResponseDto } from '../dto/promotion-response.dto';

@ApiTags('admin/promotions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/promotions')
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una promoción.' })
  @ApiOkResponse({ type: PromotionResponseDto })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar promociones.' })
  @ApiOkResponse({ type: PaginatedPromotionsResponseDto })
  list(@Query() filters: PromotionFiltersDto) {
    return this.promotionsService.list(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una promoción.' })
  @ApiOkResponse({ type: PromotionResponseDto })
  findOne(@Param('id') id: string) {
    return this.promotionsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una promoción.' })
  @ApiOkResponse({ type: PromotionResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una promoción.' })
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
