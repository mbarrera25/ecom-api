import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/pagination.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UpdateRolesDto } from '../dto/update-roles.dto';
import { PaginatedUsersResponseDto, UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../users.service';

@ApiTags('admin/users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (admin).' })
  @ApiQuery({ name: 'q', required: false, description: 'Filtro por nombre o email.' })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  listUsers(@Query() pagination: PaginationDto, @Query('q') search?: string) {
    return this.usersService.listUsers(pagination, search);
  }

  @Patch(':id/roles')
  @ApiOperation({ summary: 'Actualizar roles de un usuario.' })
  @ApiOkResponse({ type: UserResponseDto })
  updateRoles(@Param('id') userId: string, @Body() dto: UpdateRolesDto) {
    return this.usersService.updateRoles(userId, dto);
  }
}
