/**
 * DTO untuk ganti password
 */

import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password lama user',
    example: 'OldPassword123!',
  })
  @IsNotEmpty({ message: 'Password lama harus diisi' })
  @IsString({ message: 'Password lama harus berupa string' })
  oldPassword: string;

  @ApiProperty({
    description: 'Password baru (minimal 6 karakter)',
    example: 'NewPassword123!',
  })
  @IsNotEmpty({ message: 'Password baru harus diisi' })
  @IsString({ message: 'Password baru harus berupa string' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{6,}$/, {
    message:
      'Password baru harus mengandung huruf kecil, huruf besar, dan angka',
  })
  newPassword: string;
}
