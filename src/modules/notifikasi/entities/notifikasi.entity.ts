/**
 * Entity untuk Notifikasi
 */

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export enum NotifikasiType {
  BIMBINGAN = 'BIMBINGAN',
  JADWAL = 'JADWAL',
  DOKUMEN = 'DOKUMEN',
  PROPOSAL = 'PROPOSAL',
  PROGRESS = 'PROGRESS',
  SISTEM = 'SISTEM',
  REMINDER = 'REMINDER',
  PENGUMUMAN = 'PENGUMUMAN',
}

export enum NotifikasiPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('notifikasis')
@Index(['userId', 'isRead', 'createdAt'])
export class Notifikasi extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  judul: string;

  @Column({ type: 'text' })
  pesan: string;

  @Column({
    type: 'enum',
    enum: NotifikasiType,
    default: NotifikasiType.SISTEM,
  })
  tipe: NotifikasiType;

  @Column({
    type: 'enum',
    enum: NotifikasiPriority,
    default: NotifikasiPriority.MEDIUM,
  })
  prioritas: NotifikasiPriority;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl?: string; // URL untuk navigasi ketika notifikasi diklik

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any; // Data tambahan dalam format JSON

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date; // Untuk notifikasi terjadwal

  @Column({ type: 'boolean', default: false })
  isSent: boolean; // Untuk tracking push notification

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Untuk menonaktifkan notifikasi tanpa menghapus

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender?: User; // User yang mengirim notifikasi (jika ada)

  @Column({ type: 'uuid', nullable: true })
  senderId?: string;
}
