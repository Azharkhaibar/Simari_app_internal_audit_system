// src/stratejik/kpmr-stratejik/entities/kpmr-stratejik-skor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { KPMRStratejikDefinition } from './kpmr-stratejik-definisi.entity';

@Entity('kpmr_stratejik_skor_holding')
@Index(
  'IDX_KPMR_STRATEJIK_SCORE_DEF_QUARTER',
  ['definitionId', 'year', 'quarter'],
  {
    unique: true,
  },
)
export class KPMRStratejikScore {
  // ← Pastikan nama class-nya KPMRStratejikScore
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'definition_id' })
  definitionId: number;

  @ManyToOne(() => KPMRStratejikDefinition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'definition_id' })
  definition: KPMRStratejikDefinition;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 10 })
  quarter: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'section_skor',
  })
  sectionSkor: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;
}
