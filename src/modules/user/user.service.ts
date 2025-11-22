/**
 * User Service
 * Business logic untuk user management
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  PaginationDto,
  PaginationResponseDto,
} from '../../common/dto/pagination.dto';
import { MESSAGES } from '../../utils/constants';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Create new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validasi email unique
    const emailExists = await this.userRepository.isEmailExists(
      createUserDto.email,
    );
    if (emailExists) {
      throw new ConflictException(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Validasi NIM unique untuk mahasiswa
    if (createUserDto.role === UserRole.MAHASISWA && createUserDto.nim) {
      const nimExists = await this.userRepository.isNimExists(
        createUserDto.nim,
      );
      if (nimExists) {
        throw new ConflictException(MESSAGES.NIM_ALREADY_EXISTS);
      }
    }

    // Validasi NIP unique untuk dosen
    if (createUserDto.role === UserRole.DOSEN && createUserDto.nip) {
      const nipExists = await this.userRepository.isNipExists(
        createUserDto.nip,
      );
      if (nipExists) {
        throw new ConflictException(MESSAGES.NIP_ALREADY_EXISTS);
      }
    }

    // Create user
    const user = await this.userRepository.create(createUserDto);

    return this.toResponseDto(user);
  }

  /**
   * Get all users with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
    role?: UserRole,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const where = role ? { role } : undefined;

    const [users, total] = await this.userRepository.findAllWithPagination(
      paginationDto.page,
      paginationDto.limit,
      where,
    );

    const data = users.map((user) => this.toResponseDto(user));

    return new PaginationResponseDto(
      data,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  /**
   * Get all dosen
   */
  async findAllDosen(): Promise<UserResponseDto[]> {
    const dosen = await this.userRepository.findAllDosen();
    return dosen.map((user) => this.toResponseDto(user));
  }

  /**
   * Get all mahasiswa
   */
  async findAllMahasiswa(): Promise<UserResponseDto[]> {
    const mahasiswa = await this.userRepository.findAllMahasiswa();
    return mahasiswa.map((user) => this.toResponseDto(user));
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    return this.toResponseDto(user);
  }

  /**
   * Get user by email (for auth)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Get user by refresh token (for auth)
   */
  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.userRepository.findByRefreshToken(refreshToken);
  }

  /**
   * Update user
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId?: string,
  ): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    // Only allow users to update their own profile or admin
    if (currentUserId && currentUserId !== id && user.role !== UserRole.ADMIN) {
      throw new BadRequestException(MESSAGES.UNAUTHORIZED);
    }

    // Validasi NIM unique jika diupdate
    if (updateUserDto.nim && user.role === UserRole.MAHASISWA) {
      const nimExists = await this.userRepository.isNimExists(
        updateUserDto.nim,
        id,
      );
      if (nimExists) {
        throw new ConflictException(MESSAGES.NIM_ALREADY_EXISTS);
      }
    }

    // Validasi NIP unique jika diupdate
    if (updateUserDto.nip && user.role === UserRole.DOSEN) {
      const nipExists = await this.userRepository.isNipExists(
        updateUserDto.nip,
        id,
      );
      if (nipExists) {
        throw new ConflictException(MESSAGES.NIP_ALREADY_EXISTS);
      }
    }

    // Update user
    const updatedUser = await this.userRepository.update(id, updateUserDto);

    return this.toResponseDto(updatedUser);
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.updateRefreshToken(id, refreshToken);
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  /**
   * Delete user (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    await this.userRepository.softDelete(id);
  }

  /**
   * Transform user entity to response DTO
   */
  private toResponseDto(user: User): UserResponseDto {
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
