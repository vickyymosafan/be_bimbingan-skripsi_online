/**
 * Entity untuk User (Mahasiswa, Dosen, Admin)
 */

import { Entity, Column, Index, OneToMany, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  nama: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  nim?: string; // Untuk mahasiswa

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  nip?: string; // Untuk dosen

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MAHASISWA,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 15, nullable: true })
  noTelepon?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurusan?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fakultas?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;

  // Relations will be added later
  // @OneToMany(() => Proposal, (proposal) => proposal.mahasiswa)
  // proposalsMahasiswa?: Proposal[];

  // @OneToMany(() => Proposal, (proposal) => proposal.dosenPembimbing)
  // proposalsDosen?: Proposal[];

  /**
   * Hash password sebelum insert
   */
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * Validasi password
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Update password dengan hashing
   */
  async updatePassword(newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
  }
}
