/**
 * Entry point untuk serverless deployment (Vercel)
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration for serverless
  if (
    configService.get('NODE_ENV') !== 'production' ||
    configService.get('ENABLE_SWAGGER') === 'true'
  ) {
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
  }

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!server) {
    server = await bootstrap();
  }
  return server(event, context, callback);
};
