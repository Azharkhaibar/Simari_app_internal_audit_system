// src/entities/strategik/reputasi-section.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Quarter, Reputasi } from './reputasi.entity';

@Entity('sections_reputasi_holding')
@Index(
  'IDX_REPUTASI_SECTION_PERIOD_UNIQUE',
  ['year', 'quarter', 'no', 'parameter'],
  { unique: true },
)
export class ReputasiSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: ['Q1', 'Q2', 'Q3', 'Q4'] })
  quarter: Quarter;

  @Column({ type: 'varchar', length: 50 })
  no: string;

  @Column({
    name: 'bobot_section',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100,
  })
  bobotSection: number;

  @Column({ type: 'varchar', length: 500 })
  parameter: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'is_deleted',
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  createdBy: string | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy: string | null;

  @OneToMany(() => Reputasi, (reputasi) => reputasi.section)
  reputasiIndicators: Reputasi[];
}
