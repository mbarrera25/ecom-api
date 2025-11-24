import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CouponsService } from '../coupons.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponFiltersDto } from '../dto/coupon-filters.dto';
import { CouponResponseDto, PaginatedCouponsResponseDto } from '../dto/coupon-response.dto';

@ApiTags('admin/coupons')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un cupón.' })
  @ApiOkResponse({ type: CouponResponseDto })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cupones.' })
  @ApiOkResponse({ type: PaginatedCouponsResponseDto })
  list(@Query() filters: CouponFiltersDto) {
    return this.couponsService.list(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cupón.' })
  @ApiOkResponse({ type: CouponResponseDto })
  findOne(@Param('id') id: string) {
    return this.couponsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cupón.' })
  @ApiOkResponse({ type: CouponResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cupón.' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
