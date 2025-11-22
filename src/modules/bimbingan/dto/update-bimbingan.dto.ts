/**
 * DTO untuk update bimbingan
 */

import { PartialType } from '@nestjs/swagger';
import { CreateBimbinganDto } from './create-bimbingan.dto';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBimbinganDto extends PartialType(CreateBimbinganDto) {
  @ApiPropertyOptional({
    description: 'Hasil dari bimbingan',
    example: 'Mahasiswa sudah memahami konsep penelitian dengan baik',
  })
  @IsOptional()
  @IsString()
  hasilBimbingan?: string;

  @ApiPropertyOptional({
    description: 'Tugas yang harus dikerjakan untuk pertemuan selanjutnya',
    example: 'Melengkapi BAB III dan menyiapkan instrumen penelitian',
  })
  @IsOptional()
  @IsString()
  tugasSelanjutnya?: string;

  @ApiPropertyOptional({
    description: 'Nilai progress tugas akhir (0-100)',
    example: 45,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  nilaiProgress?: number;

  @ApiPropertyOptional({
    description: 'Apakah mahasiswa hadir',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  mahasiswaHadir?: boolean;

  @ApiPropertyOptional({
    description: 'Apakah dosen hadir',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  dosenHadir?: boolean;

  @ApiPropertyOptional({
    description: 'Alasan tidak hadir',
    example: 'Sakit',
  })
  @IsOptional()
  @IsString()
  alasanTidakHadir?: string;
}
