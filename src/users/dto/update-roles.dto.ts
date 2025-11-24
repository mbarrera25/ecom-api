import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsIn } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

const AVAILABLE_ROLES: UserRole[] = ['customer', 'admin'];

export class UpdateRolesDto {
  @ApiProperty({
    description: 'Listado de roles asignados al usuario.',
    example: ['customer', 'admin'],
    isArray: true,
    enum: AVAILABLE_ROLES,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(AVAILABLE_ROLES, { each: true })
  roles: UserRole[];
}
