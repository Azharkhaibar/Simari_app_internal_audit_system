import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { HukumParameter } from './hukum-paramater.entity';

@Entity('hukum_ojk')
@Index(['year', 'quarter'], { unique: true })
export class HukumOjk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  quarter: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => HukumParameter, (parameter) => parameter.hukum, {
    cascade: true,
    eager: false,
  })
  parameters?: HukumParameter[];

  @Column({ type: 'json', nullable: true })
  summary?: {
    totalWeighted?: number;
    summaryBg?: string;
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

  @Column({ default: false, name: 'is_locked' })
  isLocked?: boolean;

  @Column({ nullable: true, name: 'locked_at' })
  lockedAt?: Date;

  @Column({ nullable: true, name: 'locked_by' })
  lockedBy?: string;

  @Column({ nullable: true, type: 'text', name: 'notes' })
  notes?: string;
}
