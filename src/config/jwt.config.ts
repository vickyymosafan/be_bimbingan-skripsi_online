/**
 * Konfigurasi JWT
 * Pengaturan untuk authentication token
 */

import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET || 'default-secret-key-change-this',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'SIBMO API',
      audience: 'SIBMO Client',
    },
  }),
);

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'default-secret-key-change-this',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};
