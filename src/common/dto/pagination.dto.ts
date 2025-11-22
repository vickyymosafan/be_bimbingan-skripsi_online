/**
 * Pagination DTO
 * DTO untuk parameter pagination
 */

import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Halaman yang ingin ditampilkan',
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page harus berupa angka bulat' })
  @Min(1, { message: 'Page minimal 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa angka bulat' })
  @Min(1, { message: 'Limit minimal 1' })
  @Max(100, { message: 'Limit maksimal 100' })
  limit?: number = 10;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }
}

export class PaginationResponseDto<T> {
  @ApiProperty({ description: 'Data hasil query' })
  data: T[];

  @ApiProperty({ description: 'Total data' })
  total: number;

  @ApiProperty({ description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ description: 'Jumlah data per halaman' })
  limit: number;

  @ApiProperty({ description: 'Total halaman' })
  totalPages: number;

  @ApiProperty({ description: 'Apakah ada halaman sebelumnya' })
  hasPrevious: boolean;

  @ApiProperty({ description: 'Apakah ada halaman selanjutnya' })
  hasNext: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasPrevious = page > 1;
    this.hasNext = page < this.totalPages;
  }
}
