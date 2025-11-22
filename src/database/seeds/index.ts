/**
 * Main seed runner
 * Menjalankan semua seed data
 */

import { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Konfigurasi koneksi database untuk seeding
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sibmo_db',
  entities: ['src/**/*.entity.ts'],
  synchronize: false, // Jangan auto-sync saat seeding
  logging: true,
});

async function runSeeds() {
  try {
    console.log('🚀 Memulai proses seeding...\n');

    // Initialize connection
    await AppDataSource.initialize();
    console.log('✅ Koneksi database berhasil\n');

    // Run seeds
    console.log('👤 Seeding Users...');
    console.log('=========================');
    await seedUsers(AppDataSource);

    // Close connection
    await AppDataSource.destroy();
    console.log('\n✅ Seeding selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error saat seeding:', error);
    process.exit(1);
  }
}

// Run seeding
runSeeds();
