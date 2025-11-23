/**
 * Repository untuk Proposal
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Proposal, ProposalStatus } from './entities/proposal.entity';

@Injectable()
export class ProposalRepository extends Repository<Proposal> {
  constructor(private dataSource: DataSource) {
    super(Proposal, dataSource.createEntityManager());
  }

  /**
   * Mencari proposal berdasarkan mahasiswa ID
   */
  async findByMahasiswaId(mahasiswaId: string): Promise<Proposal[]> {
    return this.find({
      where: { mahasiswaId },
      relations: [
        'mahasiswa',
        'dosenPembimbing',
        'dosenPenguji1',
        'dosenPenguji2',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mencari proposal berdasarkan dosen pembimbing ID
   */
  async findByDosenPembimbingId(
    dosenPembimbingId: string,
  ): Promise<Proposal[]> {
    return this.find({
      where: { dosenPembimbingId },
      relations: ['mahasiswa', 'dosenPembimbing'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mencari proposal berdasarkan status
   */
  async findByStatus(status: ProposalStatus): Promise<Proposal[]> {
    return this.find({
      where: { status },
      relations: ['mahasiswa', 'dosenPembimbing'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mencari proposal dengan filter kompleks
   */
  async findWithFilters(filters: {
    status?: ProposalStatus;
    mahasiswaId?: string;
    dosenPembimbingId?: string;
    searchTerm?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Proposal[]> {
    const queryBuilder: SelectQueryBuilder<Proposal> = this.createQueryBuilder(
      'proposal',
    )
      .leftJoinAndSelect('proposal.mahasiswa', 'mahasiswa')
      .leftJoinAndSelect('proposal.dosenPembimbing', 'dosenPembimbing')
      .leftJoinAndSelect('proposal.dosenPenguji1', 'dosenPenguji1')
      .leftJoinAndSelect('proposal.dosenPenguji2', 'dosenPenguji2');

    // Filter by status
    if (filters.status) {
      queryBuilder.andWhere('proposal.status = :status', {
        status: filters.status,
      });
    }

    // Filter by mahasiswa
    if (filters.mahasiswaId) {
      queryBuilder.andWhere('proposal.mahasiswaId = :mahasiswaId', {
        mahasiswaId: filters.mahasiswaId,
      });
    }

    // Filter by dosen pembimbing
    if (filters.dosenPembimbingId) {
      queryBuilder.andWhere('proposal.dosenPembimbingId = :dosenPembimbingId', {
        dosenPembimbingId: filters.dosenPembimbingId,
      });
    }

    // Search by title or description
    if (filters.searchTerm) {
      queryBuilder.andWhere(
        '(LOWER(proposal.judul) LIKE LOWER(:searchTerm) OR LOWER(proposal.deskripsi) LIKE LOWER(:searchTerm))',
        { searchTerm: `%${filters.searchTerm}%` },
      );
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere(
        'proposal.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      );
    }

    return queryBuilder.orderBy('proposal.createdAt', 'DESC').getMany();
  }

  /**
   * Mendapatkan statistik proposal
   */
  async getStatistics(
    userId?: string,
    role?: string,
  ): Promise<{
    total: number;
    draft: number;
    diajukan: number;
    diterima: number;
    ditolak: number;
    revisi: number;
  }> {
    const queryBuilder = this.createQueryBuilder('proposal');

    // Filter berdasarkan role
    if (userId && role === 'MAHASISWA') {
      queryBuilder.where('proposal.mahasiswaId = :userId', { userId });
    } else if (userId && role === 'DOSEN') {
      queryBuilder.where('proposal.dosenPembimbingId = :userId', { userId });
    }

    const stats = await queryBuilder
      .select('proposal.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('proposal.status')
      .getRawMany<{ status: string; count: string }>();

    const result = {
      total: 0,
      draft: 0,
      diajukan: 0,
      diterima: 0,
      ditolak: 0,
      revisi: 0,
    };

    stats.forEach((stat) => {
      const count = parseInt(stat.count, 10);
      result.total += count;

      const status = stat.status.toLowerCase();
      if (status in result) {
        result[status as keyof typeof result] = count;
      }
    });

    return result;
  }

  /**
   * Mendapatkan proposal yang perlu direview oleh dosen
   */
  async findPendingReview(dosenId: string): Promise<Proposal[]> {
    return this.find({
      where: [
        { dosenPembimbingId: dosenId, status: ProposalStatus.DIAJUKAN },
        { dosenPembimbingId: dosenId, status: ProposalStatus.REVISI },
      ],
      relations: ['mahasiswa'],
      order: { tanggalPengajuan: 'ASC' },
    });
  }

  /**
   * Update status proposal dengan validasi
   */
  async updateStatus(
    proposalId: string,
    newStatus: ProposalStatus,
    additionalData?: Partial<Proposal>,
  ): Promise<Proposal> {
    const proposal = await this.findOne({
      where: { id: proposalId },
      relations: ['mahasiswa', 'dosenPembimbing'],
    });

    if (!proposal) {
      throw new Error('Proposal tidak ditemukan');
    }

    // Update status
    proposal.status = newStatus;

    // Update additional data if provided
    if (additionalData) {
      Object.assign(proposal, additionalData);
    }

    // Set tanggal berdasarkan status
    if (newStatus === ProposalStatus.DIAJUKAN && !proposal.tanggalPengajuan) {
      proposal.tanggalPengajuan = new Date();
    } else if (
      newStatus === ProposalStatus.DITERIMA &&
      !proposal.tanggalDisetujui
    ) {
      proposal.tanggalDisetujui = new Date();
    }

    // Increment revisi counter jika status REVISI
    if (newStatus === ProposalStatus.REVISI) {
      proposal.jumlahRevisi = (proposal.jumlahRevisi || 0) + 1;
    }

    return this.save(proposal);
  }
}
