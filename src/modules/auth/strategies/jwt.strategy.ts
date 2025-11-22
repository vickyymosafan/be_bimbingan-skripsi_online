/**
 * JWT Strategy untuk Passport
 * Validasi dan extract JWT token
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'default-secret-key-change-this',
    });
  }

  /**
   * Validate JWT payload dan return user
   */
  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User tidak aktif');
    }

    return user;
  }
}
