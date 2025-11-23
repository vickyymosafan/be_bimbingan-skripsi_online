/**
 * DTO untuk membuat bimbingan baru
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsNumber,
  Min,
  IsMilitaryTime,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BimbinganStatus, BimbinganType } from '../entities/bimbingan.entity';

export class CreateBimbinganDto {
  @ApiProperty({
    description: 'ID proposal yang dibimbing',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'ID proposal harus berupa UUID' })
  @IsNotEmpty({ message: 'ID proposal tidak boleh kosong' })
  proposalId: string;

  @ApiProperty({
    description: 'Topik bimbingan',
    example: 'Pembahasan BAB II Tinjauan Pustaka',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Topik tidak boleh kosong' })
  @MinLength(5, { message: 'Topik minimal 5 karakter' })
  @MaxLength(255, { message: 'Topik maksimal 255 karakter' })
  topik: string;

  @ApiPropertyOptional({
    description: 'Agenda atau hal yang akan dibahas',
    example: 'Membahas referensi penelitian terkait',
  })
  @IsOptional()
  @IsString()
  agendaBimbingan?: string;

  @ApiProperty({
    description: 'Tanggal bimbingan',
    example: '2024-06-15',
  })
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  @IsNotEmpty({ message: 'Tanggal tidak boleh kosong' })
  tanggal: string;

  @ApiProperty({
    description: 'Waktu mulai bimbingan (format HH:MM)',
    example: '09:00',
  })
  @IsMilitaryTime({ message: 'Format waktu mulai tidak valid (HH:MM)' })
  @IsNotEmpty({ message: 'Waktu mulai tidak boleh kosong' })
  waktuMulai: string;

  @ApiPropertyOptional({
    description: 'Waktu selesai bimbingan (format HH:MM)',
    example: '10:30',
  })
  @IsOptional()
  @IsMilitaryTime({ message: 'Format waktu selesai tidak valid (HH:MM)' })
  waktuSelesai?: string;

  @ApiPropertyOptional({
    description: 'Status bimbingan',
    enum: BimbinganStatus,
    default: BimbinganStatus.DIJADWALKAN,
  })
  @IsOptional()
  @IsEnum(BimbinganStatus, { message: 'Status bimbingan tidak valid' })
  status?: BimbinganStatus;

  @ApiProperty({
    description: 'Tipe bimbingan',
    enum: BimbinganType,
    default: BimbinganType.OFFLINE,
  })
  @IsEnum(BimbinganType, { message: 'Tipe bimbingan tidak valid' })
  tipeBimbingan: BimbinganType;

  @ApiPropertyOptional({
    description: 'Lokasi bimbingan (untuk offline)',
    example: 'Ruang Dosen Lt. 3',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lokasi?: string;

  @ApiPropertyOptional({
    description: 'Link meeting (untuk online)',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Format URL tidak valid' })
  @MaxLength(500)
  linkMeeting?: string;

  @ApiPropertyOptional({
    description: 'Apakah bimbingan mendesak',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({
    description: 'Catatan awal bimbingan',
    example: 'Mahasiswa diminta membawa draft BAB II',
  })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({
    description: 'Nomor pertemuan ke-',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  nomorPertemuan?: number;
}
