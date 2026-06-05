// src/rekap-data-1/entities/bhz-config.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('bhz_config_holding_rekap1')
@Index('UQ_BHZ_YEAR_QUARTER', ['year', 'quarter'], { unique: true })
export class BhzConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: ['Q1', 'Q2', 'Q3', 'Q4'] })
  quarter: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  investasi: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  pasar: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  likuiditas: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  operasional: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  hukum: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  strategis: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  kepatuhan: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
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
