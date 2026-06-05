// src/features/Dashboard/pages/RiskProfile/pages/Pasar/entities/kpmr-pasar-aspek.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { KPMRPasarQuestion } from './kpmr-pasar-pertanyaan.entity';

@Entity('kpmr_pasar_aspek_holding')
@Index('UQ_YEAR_ASPEK_NO_PASAR', ['year', 'aspekNo'], { unique: true })
export class KPMRPasarAspect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @Column({ type: 'varchar', length: 255, name: 'aspek_title' })
  aspekTitle: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'aspek_bobot' })
  aspekBobot: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KPMRPasarQuestion, (question) => question.aspect)
  questions: KPMRPasarQuestion[];
}