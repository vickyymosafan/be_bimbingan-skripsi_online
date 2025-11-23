/**
 * DTO untuk update proposal
 */

import { PartialType } from '@nestjs/swagger';
import { CreateProposalDto } from './create-proposal.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @ApiPropertyOptional({
    description: 'Catatan revisi dari dosen',
    example: 'Perlu perbaikan pada bab metodologi...',
  })
  @IsOptional()
  @IsString()
  catatanRevisi?: string;

  @ApiPropertyOptional({
    description: 'Alasan penolakan proposal',
    example: 'Topik sudah pernah diteliti sebelumnya',
  })
  @IsOptional()
  @IsString()
  alasanPenolakan?: string;

  @ApiPropertyOptional({
    description: 'ID dosen penguji 1',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID dosen penguji 1 harus berupa UUID' })
  dosenPenguji1Id?: string;

  @ApiPropertyOptional({
    description: 'ID dosen penguji 2',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID dosen penguji 2 harus berupa UUID' })
  dosenPenguji2Id?: string;
}
