/**
 * Service untuk mengelola Bimbingan
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Bimbingan, BimbinganStatus } from './entities/bimbingan.entity';
import { CreateBimbinganDto } from './dto/create-bimbingan.dto';
import { UpdateBimbinganDto } from './dto/update-bimbingan.dto';
import { ProposalService } from '../proposal/proposal.service';
import { UserRole } from '../../common/enums';

interface UserContext {
  id: string;
  role: UserRole;
}

interface BimbinganFilters {
  status?: BimbinganStatus;
  proposalId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface FinishBimbinganData {
  hasilBimbingan?: string;
  tugasSelanjutnya?: string;
  nilaiProgress?: number;
  catatan?: string;
}

@Injectable()
export class BimbinganService {
  constructor(
    @InjectRepository(Bimbingan)
    private bimbinganRepository: Repository<Bimbingan>,
    private proposalService: ProposalService,
  ) {}

  /**
   * Membuat jadwal bimbingan baru
   */

  async create(
    createBimbinganDto: CreateBimbinganDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userRole: UserRole,
  ): Promise<Bimbingan> {
    // Validasi proposal exists dan user memiliki akses
    const proposal = await this.proposalService.findOne(
      createBimbinganDto.proposalId,
    );

    // Set mahasiswa dan dosen ID berdasarkan proposal
    const bimbingan = this.bimbinganRepository.create({
      ...createBimbinganDto,
      mahasiswaId: proposal.mahasiswaId,
      dosenId: proposal.dosenPembimbingId,
      status: createBimbinganDto.status || BimbinganStatus.DIJADWALKAN,
    });

    // Auto increment nomor pertemuan jika tidak diset
    if (!bimbingan.nomorPertemuan) {
      const lastBimbingan = await this.bimbinganRepository.findOne({
        where: { proposalId: createBimbinganDto.proposalId },
        order: { nomorPertemuan: 'DESC' },
      });
      bimbingan.nomorPertemuan = lastBimbingan
        ? lastBimbingan.nomorPertemuan + 1
        : 1;
    }

    return this.bimbinganRepository.save(bimbingan);
  }

  /**
   * Mendapatkan semua bimbingan dengan filter
   */
  async findAll(
    user: UserContext,
    filters?: BimbinganFilters,
  ): Promise<Bimbingan[]> {
    interface WhereCondition {
      mahasiswaId?: string;
      dosenId?: string;
      status?: BimbinganStatus;
      proposalId?: string;
      tanggal?: ReturnType<typeof Between>;
    }

    const where: WhereCondition = {};

    // Filter berdasarkan role
    if (user.role === UserRole.MAHASISWA) {
      where.mahasiswaId = user.id;
    } else if (user.role === UserRole.DOSEN) {
      where.dosenId = user.id;
    }

    // Apply additional filters
    if (filters?.status) where.status = filters.status;
    if (filters?.proposalId) where.proposalId = filters.proposalId;
    if (filters?.startDate && filters?.endDate) {
      where.tanggal = Between(filters.startDate, filters.endDate);
    }

    return this.bimbinganRepository.find({
      where,
      relations: ['proposal', 'mahasiswa', 'dosen'],
      order: { tanggal: 'DESC', waktuMulai: 'DESC' },
    });
  }

  /**
   * Mendapatkan detail bimbingan
   */
  async findOne(id: string, user?: UserContext): Promise<Bimbingan> {
    const bimbingan = await this.bimbinganRepository.findOne({
      where: { id },
      relations: ['proposal', 'mahasiswa', 'dosen'],
    });

    if (!bimbingan) {
      throw new NotFoundException('Bimbingan tidak ditemukan');
    }

    // Validasi akses
    if (user && !this.canAccessBimbingan(bimbingan, user)) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke bimbingan ini',
      );
    }

    return bimbingan;
  }

  /**
   * Update bimbingan
   */
  async update(
    id: string,
    updateBimbinganDto: UpdateBimbinganDto,
    user: UserContext,
  ): Promise<Bimbingan> {
    const bimbingan = await this.findOne(id);

    if (!this.canUpdateBimbingan(bimbingan, user)) {
      throw new ForbiddenException('Anda tidak dapat mengubah bimbingan ini');
    }

    Object.assign(bimbingan, updateBimbinganDto);
    return this.bimbinganRepository.save(bimbingan);
  }

  /**
   * Hapus bimbingan
   */
  async remove(id: string, user: UserContext): Promise<void> {
    const bimbingan = await this.findOne(id);

    if (!this.canDeleteBimbingan(bimbingan, user)) {
      throw new ForbiddenException('Anda tidak dapat menghapus bimbingan ini');
    }

    await this.bimbinganRepository.softRemove(bimbingan);
  }

  /**
   * Mulai bimbingan
   */
  async startBimbingan(id: string, user: UserContext): Promise<Bimbingan> {
    const bimbingan = await this.findOne(id);

    if (bimbingan.status !== BimbinganStatus.DIJADWALKAN) {
      throw new BadRequestException('Bimbingan tidak dalam status dijadwalkan');
    }

    bimbingan.status = BimbinganStatus.BERLANGSUNG;

    // Set kehadiran
    if (user.id === bimbingan.mahasiswaId) {
      bimbingan.mahasiswaHadir = true;
    } else if (user.id === bimbingan.dosenId) {
      bimbingan.dosenHadir = true;
    }

    return this.bimbinganRepository.save(bimbingan);
  }

  /**
   * Selesaikan bimbingan
   */
  async finishBimbingan(
    id: string,
    data: FinishBimbinganData,
    user: UserContext,
  ): Promise<Bimbingan> {
    const bimbingan = await this.findOne(id);

    if (user.role !== UserRole.DOSEN || user.id !== bimbingan.dosenId) {
      throw new ForbiddenException(
        'Hanya dosen pembimbing yang dapat menyelesaikan bimbingan',
      );
    }

    if (
      bimbingan.status !== BimbinganStatus.BERLANGSUNG &&
      bimbingan.status !== BimbinganStatus.DIJADWALKAN
    ) {
      throw new BadRequestException('Bimbingan tidak dapat diselesaikan');
    }

    bimbingan.status = BimbinganStatus.SELESAI;
    bimbingan.waktuSelesai = new Date().toTimeString().split(' ')[0];

    if (data.hasilBimbingan) bimbingan.hasilBimbingan = data.hasilBimbingan;
    if (data.tugasSelanjutnya)
      bimbingan.tugasSelanjutnya = data.tugasSelanjutnya;
    if (data.nilaiProgress) bimbingan.nilaiProgress = data.nilaiProgress;
    if (data.catatan) bimbingan.catatan = data.catatan;

    return this.bimbinganRepository.save(bimbingan);
  }

  /**
   * Batalkan bimbingan
   */
  async cancelBimbingan(
    id: string,
    alasan: string,
    user: UserContext,
  ): Promise<Bimbingan> {
    const bimbingan = await this.findOne(id);

    if (!this.canCancelBimbingan(bimbingan, user)) {
      throw new ForbiddenException(
        'Anda tidak dapat membatalkan bimbingan ini',
      );
    }

    if (bimbingan.status === BimbinganStatus.SELESAI) {
      throw new BadRequestException(
        'Bimbingan yang sudah selesai tidak dapat dibatalkan',
      );
    }

    bimbingan.status = BimbinganStatus.DIBATALKAN;
    bimbingan.alasanTidakHadir = alasan;

    return this.bimbinganRepository.save(bimbingan);
  }

  /**
   * Mendapatkan jadwal bimbingan mendatang
   */
  async getUpcomingBimbingan(
    userId: string,
    userRole: UserRole,
  ): Promise<Bimbingan[]> {
    interface WhereCondition {
      status: ReturnType<typeof In>;
      tanggal: ReturnType<typeof Between>;
      mahasiswaId?: string;
      dosenId?: string;
    }

    const where: WhereCondition = {
      status: In([BimbinganStatus.DIJADWALKAN, BimbinganStatus.DITUNDA]),
      tanggal: Between(
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ), // 30 days ahead
    };

    if (userRole === UserRole.MAHASISWA) {
      where.mahasiswaId = userId;
    } else if (userRole === UserRole.DOSEN) {
      where.dosenId = userId;
    }

    return this.bimbinganRepository.find({
      where,
      relations: ['proposal', 'mahasiswa', 'dosen'],
      order: { tanggal: 'ASC', waktuMulai: 'ASC' },
    });
  }

  /**
   * Mendapatkan riwayat bimbingan
   */
  async getBimbinganHistory(
    proposalId: string,
    user: UserContext,
  ): Promise<Bimbingan[]> {
    // Validate access to proposal
    await this.proposalService.findOne(proposalId, user);

    return this.bimbinganRepository.find({
      where: {
        proposalId,
        status: BimbinganStatus.SELESAI,
      },
      relations: ['mahasiswa', 'dosen'],
      order: { nomorPertemuan: 'DESC' },
    });
  }

  // Helper methods
  private canAccessBimbingan(bimbingan: Bimbingan, user: UserContext): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.id === bimbingan.mahasiswaId) return true;
    if (user.id === bimbingan.dosenId) return true;
    return false;
  }

  private canUpdateBimbingan(bimbingan: Bimbingan, user: UserContext): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.id === bimbingan.dosenId) return true;
    if (
      user.id === bimbingan.mahasiswaId &&
      bimbingan.status === BimbinganStatus.DIJADWALKAN
    )
      return true;
    return false;
  }

  private canDeleteBimbingan(bimbingan: Bimbingan, user: UserContext): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.id === bimbingan.dosenId) return true;
    return false;
  }

  private canCancelBimbingan(bimbingan: Bimbingan, user: UserContext): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.id === bimbingan.dosenId) return true;
    if (user.id === bimbingan.mahasiswaId) return true;
    return false;
  }
}
