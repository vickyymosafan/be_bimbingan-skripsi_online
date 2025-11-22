/**
 * Service untuk handle authentication logic
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { jwtConstants } from '../../../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register user baru
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Create user
    const user = await this.userService.create(registerDto);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update refresh token in database
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda tidak aktif');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update refresh token in database
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Convert to response DTO
    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      ...tokens,
      user: userResponse,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.updateRefreshToken(userId, null);
    return { message: 'Logout berhasil' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }

    // Hash refresh token untuk compare
    const refreshTokenMatches = user.refreshToken === refreshToken;

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update refresh token in database
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Convert to response DTO
    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      ...tokens,
      user: userResponse,
    };
  }

  /**
   * Validate user untuk strategy
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (user && (await user.validatePassword(password))) {
      return user;
    }

    return null;
  }

  /**
   * Generate access dan refresh token
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<Omit<AuthResponseDto, 'user'>> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload as any, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn,
    });

    // Generate refresh token
    const refreshToken = await this.jwtService.signAsync(payload as any, {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.getExpiresInSeconds(jwtConstants.expiresIn),
    };
  }

  /**
   * Update refresh token in database
   */
  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userService.updateRefreshToken(userId, refreshToken);
  }

  /**
   * Convert expires in string to seconds
   */
  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 3600; // default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 3600;
    }
  }
}
