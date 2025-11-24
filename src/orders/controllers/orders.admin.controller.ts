import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { OrdersService } from '../orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderFiltersDto } from '../dto/order-filters.dto';
import { OrderResponseDto, PaginatedOrdersResponseDto } from '../dto/order-response.dto';

@ApiTags('admin/orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pedido manualmente.' })
  @ApiOkResponse({ type: OrderResponseDto })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos.' })
  @ApiOkResponse({ type: PaginatedOrdersResponseDto })
  list(@Query() filters: OrderFiltersDto) {
    return this.ordersService.list(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido.' })
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.ordersService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pedido.' })
  @ApiOkResponse({ type: OrderResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pedido.' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
