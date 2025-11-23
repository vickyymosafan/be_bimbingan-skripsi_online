/**
 * Entry point aplikasi untuk local development
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // CORS configuration
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Throw error jika ada properti yang tidak diizinkan
      transform: true, // Auto transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SIBMO API')
    .setDescription(
      'API Documentation untuk Sistem Informasi Bimbingan Tugas Akhir',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints untuk autentikasi user')
    .addTag('Users', 'Endpoints untuk manajemen user')
    .addTag('Proposals', 'Endpoints untuk manajemen proposal tugas akhir')
    .addTag('Bimbingan', 'Endpoints untuk manajemen bimbingan')
    .addTag('Dokumen', 'Endpoints untuk manajemen dokumen')
    .addTag('Jadwal', 'Endpoints untuk manajemen jadwal konsultasi')
    .addTag('Progress', 'Endpoints untuk manajemen progress tugas akhir')
    .addTag('Notifikasi', 'Endpoints untuk manajemen notifikasi')
    .addTag('Dashboard', 'Endpoints untuk dashboard analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(
    `🌍 Environment: ${configService.get('NODE_ENV') || 'development'}`,
  );
}

void bootstrap();
