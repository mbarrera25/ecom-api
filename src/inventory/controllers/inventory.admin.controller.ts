import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { InventoryService } from '../inventory.service';
import { CreateInventoryRecordDto } from '../dto/create-inventory-record.dto';
import { UpdateInventoryRecordDto } from '../dto/update-inventory-record.dto';
import { InventoryFiltersDto } from '../dto/inventory-filters.dto';
import { InventoryRecordResponseDto, PaginatedInventoryResponseDto } from '../dto/inventory-response.dto';

@ApiTags('admin/inventory')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de inventario.' })
  @ApiOkResponse({ type: InventoryRecordResponseDto })
  create(@Body() dto: CreateInventoryRecordDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar inventario.' })
  @ApiOkResponse({ type: PaginatedInventoryResponseDto })
  list(@Query() filters: InventoryFiltersDto) {
    return this.inventoryService.list(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de inventario.' })
  @ApiOkResponse({ type: InventoryRecordResponseDto })
  findOne(@Param('id') id: string) {
    return this.inventoryService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de inventario.' })
  @ApiOkResponse({ type: InventoryRecordResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryRecordDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de inventario.' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
