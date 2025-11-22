/**
 * Repository untuk User entity
 * Menghandle database operations untuk User
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../../../common/enums';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * Cari user berdasarkan email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
    });
  }

  /**
   * Cari user berdasarkan NIM
   */
  async findByNim(nim: string): Promise<User | null> {
    return this.findOne({
      where: { nim },
    });
  }

  /**
   * Cari user berdasarkan NIP
   */
  async findByNip(nip: string): Promise<User | null> {
    return this.findOne({
      where: { nip },
    });
  }

  /**
   * Cari user berdasarkan role
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return this.find({
      where: { role },
    });
  }

  /**
   * Cari semua dosen yang aktif
   */
  async findActiveDosen(): Promise<User[]> {
    return this.find({
      where: {
        role: UserRole.DOSEN,
        isActive: true,
      },
    });
  }

  /**
   * Cari mahasiswa berdasarkan jurusan
   */
  async findMahasiswaByJurusan(jurusan: string): Promise<User[]> {
    return this.find({
      where: {
        role: UserRole.MAHASISWA,
        jurusan,
        isActive: true,
      },
    });
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.update(userId, { refreshToken });
  }

  /**
   * Cek apakah email sudah terdaftar
   */
  async isEmailExist(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }

  /**
   * Cek apakah NIM sudah terdaftar
   */
  async isNimExist(nim: string): Promise<boolean> {
    const count = await this.count({ where: { nim } });
    return count > 0;
  }

  /**
   * Cek apakah NIP sudah terdaftar
   */
  async isNipExist(nip: string): Promise<boolean> {
    const count = await this.count({ where: { nip } });
    return count > 0;
  }

  /**
   * Soft delete user
   */
  async softDeleteUser(userId: string): Promise<void> {
    await this.softDelete(userId);
  }

  /**
   * Restore soft deleted user
   */
  async restoreUser(userId: string): Promise<void> {
    await this.restore(userId);
  }
}
