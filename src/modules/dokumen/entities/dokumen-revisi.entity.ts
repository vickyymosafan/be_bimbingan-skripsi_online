/**
 * Entity untuk Dokumen Revisi
 */

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Bimbingan } from '../../bimbingan/entities/bimbingan.entity';
import { User } from '../../user/entities/user.entity';

export enum DokumenType {
  PROPOSAL = 'PROPOSAL',
  BAB_1 = 'BAB_1',
  BAB_2 = 'BAB_2',
  BAB_3 = 'BAB_3',
  BAB_4 = 'BAB_4',
  BAB_5 = 'BAB_5',
  LAMPIRAN = 'LAMPIRAN',
  PRESENTASI = 'PRESENTASI',
  JURNAL = 'JURNAL',
  LAINNYA = 'LAINNYA',
}

export enum DokumenStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REVISION_NEEDED = 'REVISION_NEEDED',
}

@Entity('dokumen_revisis')
@Index(['bimbinganId', 'versi'])
export class DokumenRevisi extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  namaFile: string;

  @Column({ type: 'varchar', length: 500 })
  urlFile: string;

  @Column({ type: 'integer', default: 1 })
  versi: number;

  @Column({
    type: 'enum',
    enum: DokumenType,
    default: DokumenType.LAINNYA,
  })
  tipeDokumen: DokumenType;

  @Column({
    type: 'enum',
    enum: DokumenStatus,
    default: DokumenStatus.DRAFT,
  })
  status: DokumenStatus;

  @Column({ type: 'text', nullable: true })
  komentar?: string;

  @Column({ type: 'text', nullable: true })
  feedbackDosen?: string;

  @Column({ type: 'integer', nullable: true })
  ukuranFile?: number; // dalam bytes

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType?: string;

  // Relations
  @ManyToOne(() => Bimbingan, { eager: false })
  @JoinColumn({ name: 'bimbinganId' })
  bimbingan: Bimbingan;

  @Column({ type: 'uuid' })
  @Index()
  bimbinganId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ type: 'uuid' })
  uploadedById: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  reviewedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;
}
