/**
 * Service untuk handle business logic User
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserRole } from '../../../common/enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Buat user baru
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validasi email unik
    if (await this.userRepository.isEmailExist(createUserDto.email)) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Validasi NIM untuk mahasiswa
    if (createUserDto.role === UserRole.MAHASISWA) {
      if (!createUserDto.nim) {
        throw new BadRequestException('NIM harus diisi untuk mahasiswa');
      }
      if (await this.userRepository.isNimExist(createUserDto.nim)) {
        throw new ConflictException('NIM sudah terdaftar');
      }
    }

    // Validasi NIP untuk dosen
    if (createUserDto.role === UserRole.DOSEN) {
      if (!createUserDto.nip) {
        throw new BadRequestException('NIP harus diisi untuk dosen');
      }
      if (await this.userRepository.isNipExist(createUserDto.nip)) {
        throw new ConflictException('NIP sudah terdaftar');
      }
    }

    // Buat user
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    return this.toResponseDto(savedUser);
  }

  /**
   * Cari semua user
   */
  async findAll(role?: UserRole): Promise<UserResponseDto[]> {
    let users: User[];

    if (role) {
      users = await this.userRepository.findByRole(role);
    } else {
      users = await this.userRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    return users.map((user) => this.toResponseDto(user));
  }

  /**
   * Cari user berdasarkan ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return this.toResponseDto(user);
  }

  /**
   * Cari user berdasarkan email (untuk internal use)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Cari user berdasarkan ID (untuk internal use, return full entity)
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  /**
   * Cari semua dosen aktif
   */
  async findActiveDosen(): Promise<UserResponseDto[]> {
    const dosen = await this.userRepository.findActiveDosen();
    return dosen.map((user) => this.toResponseDto(user));
  }

  /**
   * Update user
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(id);

    // Validasi NIM jika diupdate
    if (updateUserDto.nim && user.role === UserRole.MAHASISWA) {
      const existingUser = await this.userRepository.findByNim(
        updateUserDto.nim,
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('NIM sudah terdaftar');
      }
    }

    // Validasi NIP jika diupdate
    if (updateUserDto.nip && user.role === UserRole.DOSEN) {
      const existingUser = await this.userRepository.findByNip(
        updateUserDto.nip,
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('NIP sudah terdaftar');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  /**
   * Ganti password user
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    // Validasi password lama
    const isPasswordValid = await user.validatePassword(
      changePasswordDto.oldPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password lama tidak sesuai');
    }

    // Update password
    await user.updatePassword(changePasswordDto.newPassword);
    await this.userRepository.save(user);

    return { message: 'Password berhasil diubah' };
  }

  /**
   * Soft delete user
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    await this.userRepository.softDeleteUser(id);
    return { message: `User ${user.nama} berhasil dihapus` };
  }

  /**
   * Restore soft deleted user
   */
  async restore(id: string): Promise<UserResponseDto> {
    await this.userRepository.restoreUser(id);
    const user = await this.findById(id);
    return this.toResponseDto(user);
  }

  /**
   * Update refresh token (untuk auth)
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, refreshToken);
  }

  /**
   * Convert entity ke response DTO
   */
  private toResponseDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
