import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../schemas/user.schema';

class AddressResponseDto {
  @ApiProperty({ example: '123 Main St' })
  line1: string;

  @ApiProperty({ example: 'Suite 100', required: false, nullable: true })
  line2?: string;

  @ApiProperty({ example: 'Springfield' })
  city: string;

  @ApiProperty({ example: 'CA', required: false, nullable: true })
  state?: string;

  @ApiProperty({ example: '90210' })
  zip: string;

  @ApiProperty({ example: 'US' })
  country: string;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9c' })
  _id: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '660f1f2b58e4a4e53f5a5d9b' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: ['customer'], isArray: true })
  roles: string[];

  @ApiProperty({ type: AddressResponseDto, isArray: true })
  addresses: Address[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: UserResponseDto, isArray: true })
  data: UserResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

