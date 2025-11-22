/**
 * Entity untuk Progress Tugas Akhir
 */

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Proposal } from '../../proposal/entities/proposal.entity';

export enum ProgressTahapan {
  PROPOSAL = 'PROPOSAL',
  BAB_1 = 'BAB_1',
  BAB_2 = 'BAB_2',
  BAB_3 = 'BAB_3',
  BAB_4 = 'BAB_4',
  BAB_5 = 'BAB_5',
  SEMINAR_PROPOSAL = 'SEMINAR_PROPOSAL',
  PENGUMPULAN_DATA = 'PENGUMPULAN_DATA',
  ANALISIS_DATA = 'ANALISIS_DATA',
  SEMINAR_HASIL = 'SEMINAR_HASIL',
  SIDANG_SKRIPSI = 'SIDANG_SKRIPSI',
  REVISI_AKHIR = 'REVISI_AKHIR',
  SELESAI = 'SELESAI',
}

@Entity('progress')
@Index(['proposalId', 'tahapan'])
export class Progress extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ProgressTahapan,
  })
  tahapan: ProgressTahapan;

  @Column({ type: 'integer', default: 0 })
  persentase: number; // 0-100

  @Column({ type: 'text', nullable: true })
  deskripsi?: string;

  @Column({ type: 'date', nullable: true })
  tanggalMulai?: Date;

  @Column({ type: 'date', nullable: true })
  tanggalSelesai?: Date;

  @Column({ type: 'date', nullable: true })
  targetSelesai?: Date;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'text', nullable: true })
  catatan?: string;

  @Column({ type: 'text', nullable: true })
  hambatan?: string;

  @Column({ type: 'simple-array', nullable: true })
  milestones?: string[]; // Sub-tahapan yang harus diselesaikan

  @Column({ type: 'integer', default: 0 })
  jumlahRevisi: number;

  // Relations
  @ManyToOne(() => Proposal, { eager: false })
  @JoinColumn({ name: 'proposalId' })
  proposal: Proposal;

  @Column({ type: 'uuid' })
  @Index()
  proposalId: string;
}
