/**
 * User Repository
 * Repository untuk akses data user
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * Cari user berdasarkan email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  /**
   * Cari user berdasarkan ID
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Cari user berdasarkan NIM
   */
  async findByNim(nim: string): Promise<User | null> {
    return this.repository.findOne({
      where: { nim },
    });
  }

  /**
   * Cari user berdasarkan NIP
   */
  async findByNip(nip: string): Promise<User | null> {
    return this.repository.findOne({
      where: { nip },
    });
  }

  /**
   * Cari user berdasarkan refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.repository.findOne({
      where: { refreshToken },
    });
  }

  /**
   * Cari semua user dengan pagination
   */
  async findAllWithPagination(
    page: number,
    limit: number,
    where?: FindOptionsWhere<User>,
  ): Promise<[User[], number]> {
    return this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Cari semua dosen
   */
  async findAllDosen(): Promise<User[]> {
    return this.repository.find({
      where: { role: UserRole.DOSEN, isActive: true },
      order: { nama: 'ASC' },
    });
  }

  /**
   * Cari semua mahasiswa
   */
  async findAllMahasiswa(): Promise<User[]> {
    return this.repository.find({
      where: { role: UserRole.MAHASISWA, isActive: true },
      order: { nama: 'ASC' },
    });
  }

  /**
   * Buat user baru
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.repository.update(id, { refreshToken });
  }

  /**
   * Update last login
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateLastLogin(_id: string): Promise<void> {
    // TODO: Add lastLogin field to User entity if needed
    // await this.repository.update(_id, { lastLogin: new Date() });
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  /**
   * Check if email exists
   */
  async isEmailExists(email: string, excludeId?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Check if NIM exists
   */
  async isNimExists(nim: string, excludeId?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('user')
      .where('user.nim = :nim', { nim });

    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Check if NIP exists
   */
  async isNipExists(nip: string, excludeId?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('user')
      .where('user.nip = :nip', { nip });

    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
