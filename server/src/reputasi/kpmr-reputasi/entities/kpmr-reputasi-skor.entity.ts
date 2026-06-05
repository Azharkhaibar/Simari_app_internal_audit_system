// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/entities/kpmr-reputasi-skor.entity.ts
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
import { KPMRReputasiDefinition } from './kpmr-reputasi-definisi.entity';

@Entity('kpmr_reputasi_skor_holding')
@Index(
  'IDX_KPMR_REPUTASI_SCORE_DEF_QUARTER',
  ['definitionId', 'year', 'quarter'],
  {
    unique: true,
  },
)
export class KPMRReputasiScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'definition_id' })
  definitionId: number;

  @ManyToOne(() => KPMRReputasiDefinition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'definition_id' })
  definition: KPMRReputasiDefinition;

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
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? Number(value) : null),
    },
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
