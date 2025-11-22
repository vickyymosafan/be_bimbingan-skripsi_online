/**
 * Migration untuk membuat tabel-tabel awal
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('MAHASISWA', 'DOSEN', 'ADMIN');
      CREATE TYPE "proposal_status_enum" AS ENUM ('DRAFT', 'DIAJUKAN', 'DITERIMA', 'DITOLAK', 'REVISI', 'SELESAI');
      CREATE TYPE "bimbingan_status_enum" AS ENUM ('DIJADWALKAN', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN', 'DITUNDA');
      CREATE TYPE "bimbingan_type_enum" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
      CREATE TYPE "dokumen_type_enum" AS ENUM ('PROPOSAL', 'BAB_1', 'BAB_2', 'BAB_3', 'BAB_4', 'BAB_5', 'LAMPIRAN', 'PRESENTASI', 'JURNAL', 'LAINNYA');
      CREATE TYPE "dokumen_status_enum" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REVISION_NEEDED');
      CREATE TYPE "progress_tahapan_enum" AS ENUM ('PROPOSAL', 'BAB_1', 'BAB_2', 'BAB_3', 'BAB_4', 'BAB_5', 'SEMINAR_PROPOSAL', 'PENGUMPULAN_DATA', 'ANALISIS_DATA', 'SEMINAR_HASIL', 'SIDANG_SKRIPSI', 'REVISI_AKHIR', 'SELESAI');
      CREATE TYPE "notifikasi_type_enum" AS ENUM ('BIMBINGAN', 'JADWAL', 'DOKUMEN', 'PROPOSAL', 'PROGRESS', 'SISTEM', 'REMINDER', 'PENGUMUMAN');
      CREATE TYPE "notifikasi_priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    `);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nama',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'nim',
            type: 'varchar',
            length: '20',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'nip',
            type: 'varchar',
            length: '20',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'role',
            type: 'user_role_enum',
            default: `'MAHASISWA'`,
          },
          {
            name: 'noTelepon',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'jurusan',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'fakultas',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'refreshToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create proposals table
    await queryRunner.createTable(
      new Table({
        name: 'proposals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'judul',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'deskripsi',
            type: 'text',
          },
          {
            name: 'abstrak',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bidangKajian',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'metodePenelitian',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'proposal_status_enum',
            default: `'DRAFT'`,
          },
          {
            name: 'catatanRevisi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'alasanPenolakan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tanggalPengajuan',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'tanggalDisetujui',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'targetSelesai',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'fileProposal',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'jumlahRevisi',
            type: 'integer',
            default: 0,
          },
          {
            name: 'mahasiswaId',
            type: 'uuid',
          },
          {
            name: 'dosenPembimbingId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'dosenPenguji1Id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'dosenPenguji2Id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['mahasiswaId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['dosenPembimbingId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['dosenPenguji1Id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['dosenPenguji2Id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create bimbingans table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'topik',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'catatan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hasilBimbingan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tanggal',
            type: 'date',
          },
          {
            name: 'waktuMulai',
            type: 'time',
          },
          {
            name: 'waktuSelesai',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'bimbingan_status_enum',
            default: `'DIJADWALKAN'`,
          },
          {
            name: 'tipeBimbingan',
            type: 'bimbingan_type_enum',
            default: `'OFFLINE'`,
          },
          {
            name: 'lokasi',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'linkMeeting',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'nomorPertemuan',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isUrgent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'agendaBimbingan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tugasSelanjutnya',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'nilaiProgress',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'mahasiswaHadir',
            type: 'boolean',
            default: false,
          },
          {
            name: 'dosenHadir',
            type: 'boolean',
            default: false,
          },
          {
            name: 'alasanTidakHadir',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'attachments',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'proposalId',
            type: 'uuid',
          },
          {
            name: 'mahasiswaId',
            type: 'uuid',
          },
          {
            name: 'dosenId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['proposalId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'proposals',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['mahasiswaId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['dosenId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_EMAIL',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_NIM',
        columnNames: ['nim'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_NIP',
        columnNames: ['nip'],
      }),
    );

    await queryRunner.createIndex(
      'proposals',
      new TableIndex({
        name: 'IDX_PROPOSAL_MAHASISWA',
        columnNames: ['mahasiswaId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'proposals',
      new TableIndex({
        name: 'IDX_PROPOSAL_DOSEN',
        columnNames: ['dosenPembimbingId'],
      }),
    );

    await queryRunner.createIndex(
      'bimbingans',
      new TableIndex({
        name: 'IDX_BIMBINGAN_PROPOSAL',
        columnNames: ['proposalId', 'tanggal'],
      }),
    );

    await queryRunner.createIndex(
      'bimbingans',
      new TableIndex({
        name: 'IDX_BIMBINGAN_MAHASISWA',
        columnNames: ['mahasiswaId'],
      }),
    );

    await queryRunner.createIndex(
      'bimbingans',
      new TableIndex({
        name: 'IDX_BIMBINGAN_DOSEN',
        columnNames: ['dosenId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('bimbingans', 'IDX_BIMBINGAN_DOSEN');
    await queryRunner.dropIndex('bimbingans', 'IDX_BIMBINGAN_MAHASISWA');
    await queryRunner.dropIndex('bimbingans', 'IDX_BIMBINGAN_PROPOSAL');
    await queryRunner.dropIndex('proposals', 'IDX_PROPOSAL_DOSEN');
    await queryRunner.dropIndex('proposals', 'IDX_PROPOSAL_MAHASISWA');
    await queryRunner.dropIndex('users', 'IDX_USER_NIP');
    await queryRunner.dropIndex('users', 'IDX_USER_NIM');
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL');

    // Drop tables
    await queryRunner.dropTable('bimbingans');
    await queryRunner.dropTable('proposals');
    await queryRunner.dropTable('users');

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS "notifikasi_priority_enum";
      DROP TYPE IF EXISTS "notifikasi_type_enum";
      DROP TYPE IF EXISTS "progress_tahapan_enum";
      DROP TYPE IF EXISTS "dokumen_status_enum";
      DROP TYPE IF EXISTS "dokumen_type_enum";
      DROP TYPE IF EXISTS "bimbingan_type_enum";
      DROP TYPE IF EXISTS "bimbingan_status_enum";
      DROP TYPE IF EXISTS "proposal_status_enum";
      DROP TYPE IF EXISTS "user_role_enum";
    `);
  }
}
