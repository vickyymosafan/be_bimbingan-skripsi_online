/**
 * DTO untuk membuat proposal baru
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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalStatus } from '../entities/proposal.entity';

export class CreateProposalDto {
  @ApiProperty({
    description: 'Judul proposal tugas akhir',
    example: 'Sistem Informasi Bimbingan Tugas Akhir Berbasis Web',
    minLength: 10,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Judul tidak boleh kosong' })
  @MinLength(10, { message: 'Judul minimal 10 karakter' })
  @MaxLength(255, { message: 'Judul maksimal 255 karakter' })
  judul: string;

  @ApiProperty({
    description: 'Deskripsi detail proposal',
    example: 'Penelitian ini bertujuan untuk mengembangkan sistem...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  @MinLength(50, { message: 'Deskripsi minimal 50 karakter' })
  deskripsi: string;

  @ApiPropertyOptional({
    description: 'Abstrak proposal',
    example: 'Abstrak berisi ringkasan penelitian...',
  })
  @IsOptional()
  @IsString()
  @MinLength(100, { message: 'Abstrak minimal 100 karakter' })
  abstrak?: string;

  @ApiPropertyOptional({
    description: 'Bidang kajian penelitian',
    example: 'Sistem Informasi',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bidangKajian?: string;

  @ApiPropertyOptional({
    description: 'Metode penelitian yang digunakan',
    example: 'Metode Waterfall',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metodePenelitian?: string;

  @ApiPropertyOptional({
    description: 'Status proposal',
    enum: ProposalStatus,
    default: ProposalStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProposalStatus, { message: 'Status tidak valid' })
  status?: ProposalStatus;

  @ApiPropertyOptional({
    description: 'ID dosen pembimbing',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID dosen pembimbing harus berupa UUID' })
  dosenPembimbingId?: string;

  @ApiPropertyOptional({
    description: 'Target tanggal selesai',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  targetSelesai?: string;

  @ApiPropertyOptional({
    description: 'URL file proposal PDF',
    example: '/uploads/proposals/proposal-123.pdf',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileProposal?: string;
}
