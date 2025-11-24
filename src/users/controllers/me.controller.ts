import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { SafeUser, UsersService } from '../users.service';

@ApiTags('me')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'customer', )
@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el perfil actual.' })
  @ApiOkResponse({ type: UserResponseDto })
  getProfile(@CurrentUser('id') userId: string): Promise<SafeUser> {
    return this.usersService.getOrFail(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar información del perfil.' })
  @ApiOkResponse({ type: UserResponseDto })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMeDto,
  ): Promise<SafeUser> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Agregar una dirección al perfil.' })
  @ApiOkResponse({ type: UserResponseDto })
  addAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ): Promise<SafeUser> {
    return this.usersService.addAddress(userId, dto);
  }

  @Patch('addresses/:addressId')
  @ApiOperation({ summary: 'Actualizar una dirección existente.' })
  @ApiOkResponse({ type: UserResponseDto })
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<SafeUser> {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:addressId')
  @ApiOperation({ summary: 'Eliminar una dirección del perfil.' })
  @ApiOkResponse({ type: UserResponseDto })
  deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<SafeUser> {
    return this.usersService.removeAddress(userId, addressId);
  }
}
