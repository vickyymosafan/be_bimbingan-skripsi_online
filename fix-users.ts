/**
 * Script to fix user passwords in database
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sibmo_db',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  logging: true,
});

async function fixPasswords() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    // Hash password properly
    const correctPassword = await bcrypt.hash('Password123!', 10);

    // Update all test users with correct password
    const emails = [
      'admin@sibmo.ac.id',
      'budi.santoso@dosen.ac.id',
      'siti.nurhaliza@dosen.ac.id',
      'ahmad.dahlan@dosen.ac.id',
      'andi.pratama@mahasiswa.ac.id',
      'dewi.lestari@mahasiswa.ac.id',
      'reza.firmansyah@mahasiswa.ac.id',
      'maya.anggraini@mahasiswa.ac.id',
      'fajar.nugroho@mahasiswa.ac.id',
    ];

    for (const email of emails) {
      await AppDataSource.query(
        `UPDATE users SET password = $1 WHERE email = $2`,
        [correctPassword, email],
      );
      console.log(`✅ Fixed password for: ${email}`);
    }

    await AppDataSource.destroy();
    console.log('\n✅ All passwords fixed!');
    console.log('🔐 Password for all users: Password123!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPasswords();
