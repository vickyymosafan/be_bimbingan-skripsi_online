/**
 * Controller untuk handle authentication endpoints
 */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register user baru
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register user baru (Mahasiswa atau Dosen)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User berhasil didaftarkan',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email/NIM/NIP sudah terdaftar',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Data tidak valid',
  })
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);
    return {
      status: 'success',
      message: 'Registrasi berhasil',
      data,
    };
  }

  /**
   * Login user
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login berhasil',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Email atau password salah',
  })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return {
      status: 'success',
      message: 'Login berhasil',
      data,
    };
  }

  /**
   * Logout user
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout berhasil',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token tidak valid',
  })
  async logout(@CurrentUser() user: User) {
    const result = await this.authService.logout(user.id);
    return {
      status: 'success',
      message: result.message,
    };
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token menggunakan refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token berhasil direfresh',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token tidak valid',
  })
  async refreshToken(@CurrentUser() user: User, @Req() req: Request) {
    const refreshToken = req.get('Authorization')?.replace('Bearer ', '');
    const data = await this.authService.refreshToken(user.id, refreshToken);
    return {
      status: 'success',
      message: 'Token berhasil direfresh',
      data,
    };
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile user yang sedang login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile berhasil diambil',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token tidak valid',
  })
  getProfile(@CurrentUser() user: User) {
    return {
      status: 'success',
      message: 'Profile berhasil diambil',
      data: user,
    };
  }

  /**
   * Validate token
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token valid',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token tidak valid',
  })
  validateToken(@CurrentUser() user: User) {
    return {
      status: 'success',
      message: 'Token valid',
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
