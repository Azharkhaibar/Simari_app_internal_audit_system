// strategis-kpmr-ojk.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { KpmrAspekStrategis } from './strategis-kpmr-aspek.entity';

@Entity('kpmr_strategis_ojk')
@Index(['year', 'quarter'])  // ✅ HAPUS { unique: true }
@Index(['isActive', 'year', 'quarter'])
@Index(['createdAt'])
export class KpmrStrategisOjk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  quarter: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => KpmrAspekStrategis, (aspek) => aspek.kpmrOjk, {
    cascade: true,
    eager: false,
  })
  aspekList?: KpmrAspekStrategis[];

  @Column({ type: 'json', nullable: true })
  summary?: {
    totalScore?: number;
    averageScore?: number;
    rating?: string;
    computedAt?: Date;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;

  @Column({ nullable: true, name: 'updated_by' })
  updatedBy?: string;

  @Column({ default: '1.0.0', name: 'version' })
  version?: string;

  @Column({ default: false, name: 'is_locked', nullable: true })
  isLocked?: boolean;

  @Column({ nullable: true, name: 'locked_at' })
  lockedAt?: Date;

  @Column({ nullable: true, name: 'locked_by' })
  lockedBy?: string;

  @Column({ nullable: true, type: 'text', name: 'notes' })
  notes?: string;
}