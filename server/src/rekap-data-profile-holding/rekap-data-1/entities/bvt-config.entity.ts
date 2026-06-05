// src/rekap-data-1/entities/bvt-config.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('bvt_config_holding_rekap1')
@Index('UQ_BVT_YEAR_QUARTER', ['year', 'quarter'], { unique: true })
export class BvtConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: ['Q1', 'Q2', 'Q3', 'Q4'] })
  quarter: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  investasi: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  pasar: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  likuiditas: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  operasional: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  hukum: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  strategis: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  kepatuhan: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  reputasi: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'created_by' })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'updated_by' })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
