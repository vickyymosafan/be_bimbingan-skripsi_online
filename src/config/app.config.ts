/**
 * Konfigurasi aplikasi
 * Mengelola environment variables dan pengaturan aplikasi
 */

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  isServerless: process.env.IS_SERVERLESS === 'true',

  // Konfigurasi CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Konfigurasi Swagger
  swagger: {
    title: process.env.SWAGGER_TITLE || 'SIBMO API',
    description:
      process.env.SWAGGER_DESCRIPTION ||
      'REST API untuk Sistem Bimbingan Tugas Akhir',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'api-docs',
  },

  // Konfigurasi file upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
  },
}));
