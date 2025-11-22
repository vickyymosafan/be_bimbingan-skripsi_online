/**
 * Controller untuk handle HTTP requests User
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserRole } from '../../../common/enums';
// Import guards akan ditambahkan nanti
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../common/guards/roles.guard';
// import { Roles } from '../../../common/decorators/roles.decorator';
// import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Buat user baru (Admin only)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat user baru' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User berhasil dibuat',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email/NIM/NIP sudah terdaftar',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Data tidak valid',
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return {
      status: 'success',
      message: 'User berhasil dibuat',
      data,
    };
  }

  /**
   * Ambil semua user
   */
  @Get()
  @ApiOperation({ summary: 'Ambil semua user' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter berdasarkan role',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List user berhasil diambil',
    type: [UserResponseDto],
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  async findAll(@Query('role') role?: UserRole) {
    const data = await this.userService.findAll(role);
    return {
      status: 'success',
      message: 'Data user berhasil diambil',
      data,
    };
  }

  /**
   * Ambil daftar dosen aktif
   */
  @Get('dosen/active')
  @ApiOperation({ summary: 'Ambil daftar dosen aktif' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List dosen aktif berhasil diambil',
    type: [UserResponseDto],
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async findActiveDosen() {
    const data = await this.userService.findActiveDosen();
    return {
      status: 'success',
      message: 'Data dosen aktif berhasil diambil',
      data,
    };
  }

  /**
   * Ambil profile user sendiri
   */
  @Get('profile')
  @ApiOperation({ summary: 'Ambil profile user yang sedang login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile berhasil diambil',
    type: UserResponseDto,
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async getProfile(/*@CurrentUser() user: User*/) {
    // Placeholder untuk implementasi dengan auth
    // const data = await this.userService.findOne(user.id);
    return {
      status: 'success',
      message: 'Profile berhasil diambil',
      // data,
    };
  }

  /**
   * Ganti password user sendiri
   */
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ganti password user yang sedang login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password berhasil diubah',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Password lama tidak sesuai',
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async changePassword(
    /*@CurrentUser() user: User,*/
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // Placeholder untuk implementasi dengan auth
    // const result = await this.userService.changePassword(user.id, changePasswordDto);
    return {
      status: 'success',
      message: 'Password berhasil diubah',
    };
  }

  /**
   * Ambil user berdasarkan ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Ambil user berdasarkan ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User berhasil diambil',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User tidak ditemukan',
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.userService.findOne(id);
    return {
      status: 'success',
      message: 'Data user berhasil diambil',
      data,
    };
  }

  /**
   * Update user
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User berhasil diupdate',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User tidak ditemukan',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'NIM/NIP sudah terdaftar',
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.userService.update(id, updateUserDto);
    return {
      status: 'success',
      message: 'User berhasil diupdate',
      data,
    };
  }

  /**
   * Hapus user (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus user (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User berhasil dihapus',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User tidak ditemukan',
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.userService.remove(id);
    return {
      status: 'success',
      message: result.message,
    };
  }

  /**
   * Restore user yang dihapus
   */
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore user yang dihapus' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User berhasil direstore',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User tidak ditemukan',
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.userService.restore(id);
    return {
      status: 'success',
      message: 'User berhasil direstore',
      data,
    };
  }
}
