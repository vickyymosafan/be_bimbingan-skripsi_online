/**
 * Entity untuk Bimbingan / Konsultasi
 */

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Proposal } from '../../proposal/entities/proposal.entity';
import { User } from '../../user/entities/user.entity';

export enum BimbinganStatus {
  DIJADWALKAN = 'DIJADWALKAN',
  BERLANGSUNG = 'BERLANGSUNG',
  SELESAI = 'SELESAI',
  DIBATALKAN = 'DIBATALKAN',
  DITUNDA = 'DITUNDA',
}

export enum BimbinganType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
}

@Entity('bimbingans')
@Index(['proposalId', 'tanggal']) // Composite index untuk query yang sering
export class Bimbingan extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  topik: string;

  @Column({ type: 'text', nullable: true })
  catatan?: string;

  @Column({ type: 'text', nullable: true })
  hasilBimbingan?: string;

  @Column({ type: 'date' })
  tanggal: Date;

  @Column({ type: 'time' })
  waktuMulai: string;

  @Column({ type: 'time', nullable: true })
  waktuSelesai?: string;

  @Column({
    type: 'enum',
    enum: BimbinganStatus,
    default: BimbinganStatus.DIJADWALKAN,
  })
  status: BimbinganStatus;

  @Column({
    type: 'enum',
    enum: BimbinganType,
    default: BimbinganType.OFFLINE,
  })
  tipeBimbingan: BimbinganType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lokasi?: string; // Untuk bimbingan offline

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkMeeting?: string; // Untuk bimbingan online

  @Column({ type: 'integer', default: 0 })
  nomorPertemuan: number;

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'text', nullable: true })
  agendaBimbingan?: string;

  @Column({ type: 'text', nullable: true })
  tugasSelanjutnya?: string;

  @Column({ type: 'integer', nullable: true })
  nilaiProgress?: number; // Progress dalam persen (0-100)

  @Column({ type: 'boolean', default: false })
  mahasiswaHadir: boolean;

  @Column({ type: 'boolean', default: false })
  dosenHadir: boolean;

  @Column({ type: 'text', nullable: true })
  alasanTidakHadir?: string;

  // File attachments (akan direlasikan dengan Dokumen)
  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[];

  // Relations
  @ManyToOne(() => Proposal, { eager: false })
  @JoinColumn({ name: 'proposalId' })
  proposal: Proposal;

  @Column({ type: 'uuid' })
  @Index()
  proposalId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'mahasiswaId' })
  mahasiswa: User;

  @Column({ type: 'uuid' })
  @Index()
  mahasiswaId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'dosenId' })
  dosen: User;

  @Column({ type: 'uuid' })
  @Index()
  dosenId: string;

  // Relations to other entities (will be uncommented when entities are created)
  // @OneToMany(() => DokumenRevisi, (dokumen) => dokumen.bimbingan)
  // dokumenRevisis?: DokumenRevisi[];
}
