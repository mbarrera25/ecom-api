import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Nombre público del usuario.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}

