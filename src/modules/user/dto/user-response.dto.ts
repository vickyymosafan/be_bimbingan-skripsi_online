/**
 * DTO untuk response user
 * Exclude sensitive data seperti password
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'ID user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Nama lengkap user',
    example: 'John Doe',
  })
  nama: string;

  @Expose()
  @ApiProperty({
    description: 'Email user',
    example: 'user@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'NIM mahasiswa',
    example: '12345678',
    required: false,
  })
  nim?: string;

  @Expose()
  @ApiProperty({
    description: 'NIP dosen',
    example: '198701012015041001',
    required: false,
  })
  nip?: string;

  @Expose()
  @ApiProperty({
    description: 'Role user dalam sistem',
    enum: UserRole,
    example: UserRole.MAHASISWA,
  })
  role: UserRole;

  @Expose()
  @ApiProperty({
    description: 'Nomor telepon user',
    example: '081234567890',
    required: false,
  })
  noTelepon?: string;

  @Expose()
  @ApiProperty({
    description: 'Jurusan user',
    example: 'Teknik Informatika',
    required: false,
  })
  jurusan?: string;

  @Expose()
  @ApiProperty({
    description: 'Fakultas user',
    example: 'Fakultas Ilmu Komputer',
    required: false,
  })
  fakultas?: string;

  @Expose()
  @ApiProperty({
    description: 'Status aktif user',
    example: true,
  })
  isActive: boolean;

  @Expose()
  @Type(() => Date)
  @ApiProperty({
    description: 'Tanggal pembuatan user',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @ApiProperty({
    description: 'Tanggal update terakhir',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
