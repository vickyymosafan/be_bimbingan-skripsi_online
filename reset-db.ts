/**
 * Script untuk reset database
 * Drop semua tabel dan recreate dari migration
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sibmo_db',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...\n');
    await AppDataSource.initialize();
    console.log('✅ Connected!\n');

    console.log('🗑️  Dropping all tables...\n');

    // Drop all tables
    await AppDataSource.query(`DROP SCHEMA public CASCADE;`);
    await AppDataSource.query(`CREATE SCHEMA public;`);
    await AppDataSource.query(`GRANT ALL ON SCHEMA public TO postgres;`);
    await AppDataSource.query(`GRANT ALL ON SCHEMA public TO public;`);

    console.log('✅ All tables dropped!\n');

    await AppDataSource.destroy();
    console.log('✅ Database reset complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run migration:run');
    console.log('   2. Run: npm run seed:run\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
