// src/rekap-data-1/entities/rekap-result.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('rekap1_result_holding')
@Index('UQ_REKAP_RESULT_YEAR_QUARTER', ['year', 'quarter'], { unique: true })
export class RekapResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: ['Q1', 'Q2', 'Q3', 'Q4'] })
  quarter: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'komposit_a' })
  kompositA: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'komposit_b' })
  kompositB: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'total_peringkat' })
  totalPeringkat: number;

  @Column({ type: 'json', name: 'risk_details' })
  riskDetails: RiskDetail[];

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'created_by' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// Interface untuk risk details
export interface RiskDetail {
  label: string;
  inherent: number;
  kpmr: number;
  peringkat: number;
}
