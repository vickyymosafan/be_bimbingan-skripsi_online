/**
 * Service untuk mengelola Proposal
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ProposalRepository } from './proposal.repository';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { UserRole } from '../../common/enums';

interface UserContext {
  id: string;
  role: UserRole;
}

interface ProposalStatistics {
  total: number;
  draft: number;
  diajukan: number;
  diterima: number;
  ditolak: number;
  revisi: number;
}

@Injectable()
export class ProposalService {
  constructor(private readonly proposalRepository: ProposalRepository) {}

  /**
   * Membuat proposal baru
   */
  async create(
    createProposalDto: CreateProposalDto,
    mahasiswaId: string,
  ): Promise<Proposal> {
    // Cek apakah mahasiswa sudah memiliki proposal aktif
    const existingProposal = await this.proposalRepository.findOne({
      where: {
        mahasiswaId,
        status: ProposalStatus.DITERIMA,
      },
    });

    if (existingProposal) {
      throw new BadRequestException(
        'Anda sudah memiliki proposal yang diterima',
      );
    }

    const proposal = this.proposalRepository.create({
      ...createProposalDto,
      mahasiswaId,
      status: createProposalDto.status || ProposalStatus.DRAFT,
    });

    return this.proposalRepository.save(proposal);
  }

  /**
   * Mendapatkan semua proposal dengan filter
   */
  async findAll(
    user: UserContext,
    filters?: {
      status?: ProposalStatus;
      mahasiswaId?: string;
      dosenPembimbingId?: string;
      searchTerm?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Proposal[]> {
    const queryFilters: {
      status?: ProposalStatus;
      mahasiswaId?: string;
      dosenPembimbingId?: string;
      searchTerm?: string;
      startDate?: Date;
      endDate?: Date;
    } = { ...filters };

    // Filter berdasarkan role
    if (user.role === UserRole.MAHASISWA) {
      queryFilters.mahasiswaId = user.id;
    } else if (user.role === UserRole.DOSEN) {
      // Dosen bisa melihat proposal yang dia bimbing
      queryFilters.dosenPembimbingId = user.id;
    }
    // Admin bisa melihat semua

    return this.proposalRepository.findWithFilters(queryFilters);
  }

  /**
   * Mendapatkan proposal berdasarkan ID
   */
  async findOne(id: string, user?: UserContext): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: [
        'mahasiswa',
        'dosenPembimbing',
        'dosenPenguji1',
        'dosenPenguji2',
      ],
    });

    if (!proposal) {
      throw new NotFoundException('Proposal tidak ditemukan');
    }

    // Validasi akses
    if (user && !this.canAccessProposal(proposal, user)) {
      throw new ForbiddenException('Anda tidak memiliki akses ke proposal ini');
    }

    return proposal;
  }

  /**
   * Update proposal
   */
  async update(
    id: string,
    updateProposalDto: UpdateProposalDto,
    user: UserContext,
  ): Promise<Proposal> {
    const proposal = await this.findOne(id);

    // Validasi permission untuk update
    if (!this.canUpdateProposal(proposal, user)) {
      throw new ForbiddenException('Anda tidak dapat mengubah proposal ini');
    }

    // Mahasiswa hanya bisa update saat status DRAFT atau REVISI
    if (
      user.role === UserRole.MAHASISWA &&
      proposal.status !== ProposalStatus.DRAFT &&
      proposal.status !== ProposalStatus.REVISI
    ) {
      throw new BadRequestException(
        'Proposal hanya dapat diubah saat status DRAFT atau REVISI',
      );
    }

    Object.assign(proposal, updateProposalDto);
    return this.proposalRepository.save(proposal);
  }

  /**
   * Hapus proposal (soft delete)
   */
  async remove(id: string, user: UserContext): Promise<void> {
    const proposal = await this.findOne(id);

    // Hanya mahasiswa pemilik atau admin yang bisa hapus
    if (user.role !== UserRole.ADMIN && proposal.mahasiswaId !== user.id) {
      throw new ForbiddenException('Anda tidak dapat menghapus proposal ini');
    }

    // Tidak bisa hapus proposal yang sudah diterima
    if (proposal.status === ProposalStatus.DITERIMA) {
      throw new BadRequestException(
        'Proposal yang sudah diterima tidak dapat dihapus',
      );
    }

    await this.proposalRepository.softRemove(proposal);
  }

  /**
   * Ajukan proposal (ubah status ke DIAJUKAN)
   */
  async submitProposal(id: string, mahasiswaId: string): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.mahasiswaId !== mahasiswaId) {
      throw new ForbiddenException('Anda tidak dapat mengajukan proposal ini');
    }

    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new BadRequestException(
        'Hanya proposal dengan status DRAFT yang dapat diajukan',
      );
    }

    if (!proposal.dosenPembimbingId) {
      throw new BadRequestException(
        'Silakan pilih dosen pembimbing terlebih dahulu',
      );
    }

    return this.proposalRepository.updateStatus(id, ProposalStatus.DIAJUKAN);
  }

  /**
   * Approve proposal (untuk dosen)
   */
  async approveProposal(
    id: string,
    dosenId: string,
    data?: { dosenPenguji1Id?: string; dosenPenguji2Id?: string },
  ): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.dosenPembimbingId !== dosenId) {
      throw new ForbiddenException('Anda bukan dosen pembimbing proposal ini');
    }

    if (
      proposal.status !== ProposalStatus.DIAJUKAN &&
      proposal.status !== ProposalStatus.REVISI
    ) {
      throw new BadRequestException(
        'Proposal tidak dalam status yang dapat disetujui',
      );
    }

    return this.proposalRepository.updateStatus(
      id,
      ProposalStatus.DITERIMA,
      data,
    );
  }

  /**
   * Reject proposal (untuk dosen)
   */
  async rejectProposal(
    id: string,
    dosenId: string,
    alasanPenolakan: string,
  ): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.dosenPembimbingId !== dosenId) {
      throw new ForbiddenException('Anda bukan dosen pembimbing proposal ini');
    }

    if (proposal.status !== ProposalStatus.DIAJUKAN) {
      throw new BadRequestException(
        'Proposal tidak dalam status yang dapat ditolak',
      );
    }

    return this.proposalRepository.updateStatus(id, ProposalStatus.DITOLAK, {
      alasanPenolakan,
    });
  }

  /**
   * Request revisi proposal (untuk dosen)
   */
  async requestRevision(
    id: string,
    dosenId: string,
    catatanRevisi: string,
  ): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.dosenPembimbingId !== dosenId) {
      throw new ForbiddenException('Anda bukan dosen pembimbing proposal ini');
    }

    if (
      proposal.status !== ProposalStatus.DIAJUKAN &&
      proposal.status !== ProposalStatus.DITERIMA
    ) {
      throw new BadRequestException(
        'Proposal tidak dalam status yang dapat direvisi',
      );
    }

    return this.proposalRepository.updateStatus(id, ProposalStatus.REVISI, {
      catatanRevisi,
    });
  }

  /**
   * Mendapatkan statistik proposal
   */
  async getStatistics(user: UserContext): Promise<ProposalStatistics> {
    return this.proposalRepository.getStatistics(user.id, user.role);
  }

  /**
   * Mendapatkan proposal yang perlu direview
   */
  async getPendingReview(dosenId: string): Promise<Proposal[]> {
    return this.proposalRepository.findPendingReview(dosenId);
  }

  /**
   * Helper: Check if user can access proposal
   */
  private canAccessProposal(proposal: Proposal, user: UserContext): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.MAHASISWA && proposal.mahasiswaId === user.id)
      return true;
    if (user.role === UserRole.DOSEN) {
      return (
        proposal.dosenPembimbingId === user.id ||
        proposal.dosenPenguji1Id === user.id ||
        proposal.dosenPenguji2Id === user.id
      );
    }
    return false;
  }

  /**
   * Helper: Check if user can update proposal
   */
  private canUpdateProposal(proposal: Proposal, user: UserContext): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.MAHASISWA && proposal.mahasiswaId === user.id)
      return true;
    if (user.role === UserRole.DOSEN && proposal.dosenPembimbingId === user.id)
      return true;
    return false;
  }
}
