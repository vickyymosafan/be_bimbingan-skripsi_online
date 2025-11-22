/**
 * DTO untuk registrasi user baru
 */

import { CreateUserDto } from '../../user/dto/create-user.dto';
import { OmitType } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {
  @ApiProperty({
    description:
      'Role user dalam sistem (hanya MAHASISWA atau DOSEN yang bisa register)',
    enum: [UserRole.MAHASISWA, UserRole.DOSEN],
    example: UserRole.MAHASISWA,
  })
  @IsEnum([UserRole.MAHASISWA, UserRole.DOSEN], {
    message: 'Hanya MAHASISWA atau DOSEN yang dapat melakukan registrasi',
  })
  role: UserRole.MAHASISWA | UserRole.DOSEN;
}
