/**
 * Seed data untuk User
 * Membuat user default untuk setiap role
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/user/entities/user.entity';
import { UserRole } from '../../common/enums';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Default password (tidak perlu hash di sini, entity akan handle)
  const defaultPassword = 'Password123!';

  // Data seed untuk users
  const users = [
    // Admin
    {
      nama: 'Administrator SIBMO',
      email: 'admin@sibmo.ac.id',
      password: defaultPassword,
      role: UserRole.ADMIN,
      isActive: true,
      noTelepon: '081234567890',
    },

    // Dosen
    {
      nama: 'Dr. Budi Santoso, M.Kom',
      email: 'budi.santoso@dosen.ac.id',
      password: defaultPassword,
      role: UserRole.DOSEN,
      nip: '197501012000121001',
      isActive: true,
      noTelepon: '081234567891',
      jurusan: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    },
    {
      nama: 'Dr. Siti Nurhaliza, M.T',
      email: 'siti.nurhaliza@dosen.ac.id',
      password: defaultPassword,
      role: UserRole.DOSEN,
      nip: '198001012005012001',
      isActive: true,
      noTelepon: '081234567892',
      jurusan: 'Sistem Informasi',
      fakultas: 'Fakultas Ilmu Komputer',
    },
    {
      nama: 'Prof. Ahmad Dahlan, Ph.D',
      email: 'ahmad.dahlan@dosen.ac.id',
      password: defaultPassword,
      role: UserRole.DOSEN,
      nip: '196501011990031001',
      isActive: true,
      noTelepon: '081234567893',
      jurusan: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    },

    // Mahasiswa
    {
      nama: 'Andi Pratama',
      email: 'andi.pratama@mahasiswa.ac.id',
      password: defaultPassword,
      role: UserRole.MAHASISWA,
      nim: '2020001001',
      isActive: true,
      noTelepon: '082234567890',
      jurusan: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    },
    {
      nama: 'Dewi Lestari',
      email: 'dewi.lestari@mahasiswa.ac.id',
      password: defaultPassword,
      role: UserRole.MAHASISWA,
      nim: '2020001002',
      isActive: true,
      noTelepon: '082234567891',
      jurusan: 'Sistem Informasi',
      fakultas: 'Fakultas Ilmu Komputer',
    },
    {
      nama: 'Reza Firmansyah',
      email: 'reza.firmansyah@mahasiswa.ac.id',
      password: defaultPassword,
      role: UserRole.MAHASISWA,
      nim: '2020001003',
      isActive: true,
      noTelepon: '082234567892',
      jurusan: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    },
    {
      nama: 'Maya Anggraini',
      email: 'maya.anggraini@mahasiswa.ac.id',
      password: defaultPassword,
      role: UserRole.MAHASISWA,
      nim: '2020001004',
      isActive: true,
      noTelepon: '082234567893',
      jurusan: 'Sistem Informasi',
      fakultas: 'Fakultas Ilmu Komputer',
    },
    {
      nama: 'Fajar Nugroho',
      email: 'fajar.nugroho@mahasiswa.ac.id',
      password: defaultPassword,
      role: UserRole.MAHASISWA,
      nim: '2020001005',
      isActive: true,
      noTelepon: '082234567894',
      jurusan: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    },
  ];

  // Insert users ke database
  for (const userData of users) {
    // Cek apakah user sudah ada berdasarkan email
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(
        `✅ User ${userData.nama} (${userData.role}) berhasil dibuat`,
      );
    } else {
      console.log(`⚠️ User ${userData.nama} sudah ada, skip...`);
    }
  }

  console.log('\n📊 Summary Seed Users:');
  console.log('=========================');
  console.log('Total users yang akan dibuat: ', users.length);
  console.log('- Admin: 1 user');
  console.log('- Dosen: 3 users');
  console.log('- Mahasiswa: 5 users');
  console.log('\n🔐 Default Password untuk semua user: Password123!');
  console.log('=========================\n');
}
