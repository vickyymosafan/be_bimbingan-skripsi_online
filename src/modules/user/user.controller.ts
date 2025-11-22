/**
 * User Controller
 * Endpoint untuk user management
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  PaginationDto,
  PaginationResponseDto,
} from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { MESSAGES } from '../../utils/constants';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User berhasil dibuat',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email/NIM/NIP sudah terdaftar',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: MESSAGES.CREATE_SUCCESS,
      data: user,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiQuery({
    name: 'role',
    enum: UserRole,
    required: false,
    description: 'Filter by role',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users',
    type: PaginationResponseDto<UserResponseDto>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('role') role?: UserRole,
  ) {
    return this.userService.findAll(paginationDto, role);
  }

  @Get('dosen')
  @ApiOperation({ summary: 'Get all dosen (active only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of dosen',
    type: [UserResponseDto],
  })
  async findAllDosen() {
    const dosen = await this.userService.findAllDosen();
    return {
      data: dosen,
    };
  }

  @Get('mahasiswa')
  @Roles(UserRole.ADMIN, UserRole.DOSEN)
  @ApiOperation({ summary: 'Get all mahasiswa (Admin & Dosen only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of mahasiswa',
    type: [UserResponseDto],
  })
  async findAllMahasiswa() {
    const mahasiswa = await this.userService.findAllMahasiswa();
    return {
      data: mahasiswa,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.userService.findOne(user.id);
    return {
      data: profile,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User detail',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User tidak ditemukan',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);
    return {
      data: user,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    const user = await this.userService.update(
      id,
      updateUserDto,
      currentUser.id,
    );
    return {
      message: MESSAGES.UPDATE_SUCCESS,
      data: user,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete, Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User berhasil dihapus',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User tidak ditemukan',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.remove(id);
  }
}
