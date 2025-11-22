/**
 * JWT Refresh Token Strategy untuk Passport
 * Validasi refresh token
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { Request } from 'express';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        'default-refresh-secret-change-this',
      passReqToCallback: true,
    });
  }

  /**
   * Validate refresh token payload
   */
  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }

    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User tidak aktif');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }

    return user;
  }
}
