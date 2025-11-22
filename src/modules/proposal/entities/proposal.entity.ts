/**
 * Entity untuk Proposal Tugas Akhir
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
import { User } from '../../user/entities/user.entity';

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  DIAJUKAN = 'DIAJUKAN',
  DITERIMA = 'DITERIMA',
  DITOLAK = 'DITOLAK',
  REVISI = 'REVISI',
  SELESAI = 'SELESAI',
}

@Entity('proposals')
@Index(['mahasiswaId', 'status']) // Composite index untuk query yang sering
export class Proposal extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  judul: string;

  @Column({ type: 'text' })
  deskripsi: string;

  @Column({ type: 'text', nullable: true })
  abstrak?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bidangKajian?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  metodePenelitian?: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.DRAFT,
  })
  status: ProposalStatus;

  @Column({ type: 'text', nullable: true })
  catatanRevisi?: string;

  @Column({ type: 'text', nullable: true })
  alasanPenolakan?: string;

  @Column({ type: 'date', nullable: true })
  tanggalPengajuan?: Date;

  @Column({ type: 'date', nullable: true })
  tanggalDisetujui?: Date;

  @Column({ type: 'date', nullable: true })
  targetSelesai?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileProposal?: string; // URL file proposal PDF

  @Column({ type: 'integer', default: 0 })
  jumlahRevisi: number;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'mahasiswaId' })
  mahasiswa: User;

  @Column({ type: 'uuid' })
  @Index()
  mahasiswaId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'dosenPembimbingId' })
  dosenPembimbing?: User;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  dosenPembimbingId?: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'dosenPenguji1Id' })
  dosenPenguji1?: User;

  @Column({ type: 'uuid', nullable: true })
  dosenPenguji1Id?: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'dosenPenguji2Id' })
  dosenPenguji2?: User;

  @Column({ type: 'uuid', nullable: true })
  dosenPenguji2Id?: string;

  // Relations to other entities
  @OneToMany(() => Bimbingan, (bimbingan) => bimbingan.proposal)
  bimbingans?: Bimbingan[];

  // @OneToMany(() => JadwalKonsultasi, (jadwal) => jadwal.proposal)
  // jadwals?: JadwalKonsultasi[];

  // @OneToMany(() => Progress, (progress) => progress.proposal)
  // progressList?: Progress[];
}

// Import Bimbingan entity
import { Bimbingan } from '../../bimbingan/entities/bimbingan.entity';
