import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { BatchUpdateVariantsDto } from '../dto/batch-update-variants.dto';
import { VariantResponseDto } from '../dto/variant-response.dto';
import { VariantsService } from '../variants.service';

@ApiTags('admin/variants')
@ApiBearerAuth('JWT')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@Controller('admin')
export class AdminVariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get('products/:productId/variants')
  @ApiOperation({ summary: 'Listar variantes de un producto.' })
  @ApiOkResponse({ type: [VariantResponseDto] })
  list(@Param('productId') productId: string) {
    return this.variantsService.listByProduct(productId);
  }

  @Post('products/:productId/variants')
  @ApiOperation({ summary: 'Crear una variante para un producto.' })
  @ApiOkResponse({ type: VariantResponseDto })
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.variantsService.create(productId, dto);
  }

  @Patch('variants/:variantId')
  @ApiOperation({ summary: 'Actualizar una variante.' })
  @ApiOkResponse({ type: VariantResponseDto })
  update(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variantsService.update(variantId, dto);
  }

  @Delete('variants/:variantId')
  @ApiOperation({ summary: 'Eliminar una variante.' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async remove(@Param('variantId') variantId: string) {
    await this.variantsService.remove(variantId);
    return { success: true };
  }
  @Patch('variants/batch-update')
  @ApiOperation({ summary: 'Actualización masiva de variantes (precio, stock).' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async batchUpdate(@Body() dto: BatchUpdateVariantsDto) {
    await this.variantsService.batchUpdate(dto);
    return { success: true };
  }
}
