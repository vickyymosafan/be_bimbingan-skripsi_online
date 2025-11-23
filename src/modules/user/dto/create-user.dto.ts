/**
 * DTO untuk membuat user baru
 */

import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nama lengkap user',
    example: 'John Doe',
  })
  @IsNotEmpty({ message: 'Nama harus diisi' })
  @IsString({ message: 'Nama harus berupa string' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  nama: string;

  @ApiProperty({
    description: 'Email user',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email harus diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(100, { message: 'Email maksimal 100 karakter' })
  email: string;

  @ApiProperty({
    description: 'Password user (minimal 6 karakter)',
    example: 'Password123!',
  })
  @IsNotEmpty({ message: 'Password harus diisi' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{6,}$/, {
    message: 'Password harus mengandung huruf kecil, huruf besar, dan angka',
  })
  password: string;

  @ApiProperty({
    description: 'Role user dalam sistem',
    enum: UserRole,
    example: UserRole.MAHASISWA,
  })
  @IsNotEmpty({ message: 'Role harus diisi' })
  @IsEnum(UserRole, { message: 'Role tidak valid' })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'NIM mahasiswa (wajib untuk role MAHASISWA)',
    example: '12345678',
  })
  @ValidateIf((o: CreateUserDto) => o.role === UserRole.MAHASISWA)
  @IsNotEmpty({ message: 'NIM harus diisi untuk mahasiswa' })
  @IsString({ message: 'NIM harus berupa string' })
  @MaxLength(20, { message: 'NIM maksimal 20 karakter' })
  nim?: string;

  @ApiPropertyOptional({
    description: 'NIP dosen (wajib untuk role DOSEN)',
    example: '198701012015041001',
  })
  @ValidateIf((o: CreateUserDto) => o.role === UserRole.DOSEN)
  @IsNotEmpty({ message: 'NIP harus diisi untuk dosen' })
  @IsString({ message: 'NIP harus berupa string' })
  @MaxLength(20, { message: 'NIP maksimal 20 karakter' })
  nip?: string;

  @ApiPropertyOptional({
    description: 'Nomor telepon user',
    example: '081234567890',
  })
  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa string' })
  @Matches(/^(\+62|62|0)[0-9]{9,13}$/, {
    message: 'Format nomor telepon tidak valid',
  })
  noTelepon?: string;

  @ApiPropertyOptional({
    description: 'Jurusan user',
    example: 'Teknik Informatika',
  })
  @IsOptional()
  @IsString({ message: 'Jurusan harus berupa string' })
  @MaxLength(100, { message: 'Jurusan maksimal 100 karakter' })
  jurusan?: string;

  @ApiPropertyOptional({
    description: 'Fakultas user',
    example: 'Fakultas Ilmu Komputer',
  })
  @IsOptional()
  @IsString({ message: 'Fakultas harus berupa string' })
  @MaxLength(100, { message: 'Fakultas maksimal 100 karakter' })
  fakultas?: string;
}
