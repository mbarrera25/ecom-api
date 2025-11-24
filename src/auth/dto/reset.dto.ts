import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recibido para restablecer la contraseña.' })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Minimum 8 characters, upper, lower, number and special char.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must include uppercase, lowercase, number and special character.',
  })
  password: string;
}

