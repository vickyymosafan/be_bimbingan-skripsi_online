/**
 * DTO untuk login
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email user',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email harus diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    description: 'Password user',
    example: 'Password123!',
  })
  @IsNotEmpty({ message: 'Password harus diisi' })
  @IsString({ message: 'Password harus berupa string' })
  password: string;
}
