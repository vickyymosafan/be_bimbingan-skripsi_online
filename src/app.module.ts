/**
 * Module utama aplikasi SIBMO Backend
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

// Config
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Modules
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProposalModule } from './modules/proposal/proposal.module';
import { BimbinganModule } from './modules/bimbingan/bimbingan.module';
// import { DokumenModule } from './modules/dokumen/dokumen.module';
// import { JadwalModule } from './modules/jadwal/jadwal.module';
// import { ProgressModule } from './modules/progress/progress.module';
// import { NotifikasiModule } from './modules/notifikasi/notifikasi.module';
// import { DashboardModule } from './modules/dashboard/dashboard.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

// Base
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<Record<string, unknown>>('database');
        return dbConfig ?? {};
      },
      inject: [ConfigService],
    }),

    // Feature Modules
    UserModule,
    AuthModule,
    ProposalModule,
    BimbinganModule,
    // DokumenModule,
    // JadwalModule,
    // ProgressModule,
    // NotifikasiModule,
    // DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
