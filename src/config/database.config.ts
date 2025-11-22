/**
 * Konfigurasi database PostgreSQL
 * Menggunakan TypeORM dengan optimasi untuk serverless
 */

import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sibmo_db',

    // Entity akan di-load otomatis
    autoLoadEntities: true,

    // Synchronize hanya untuk development
    synchronize: process.env.NODE_ENV === 'development',

    // Logging
    logging: process.env.NODE_ENV === 'development',

    // Connection pooling untuk serverless
    extra: {
      // Koneksi pool untuk optimasi serverless
      max: 20, // Maximum koneksi dalam pool
      min: 5, // Minimum koneksi dalam pool
      idle: 10000, // Idle timeout
      acquire: 30000, // Acquire timeout
      evict: 30000, // Eviction timeout

      // SSL untuk production (Vercel)
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    },

    // Retry configuration untuk resiliensi
    retryAttempts: 10,
    retryDelay: 3000,
    verboseRetryLog: process.env.NODE_ENV === 'development',

    // Migration configuration
    migrations: ['dist/database/migrations/*.js'],
    migrationsTableName: 'migrations',
    migrationsRun: process.env.NODE_ENV === 'production',
  }),
);
