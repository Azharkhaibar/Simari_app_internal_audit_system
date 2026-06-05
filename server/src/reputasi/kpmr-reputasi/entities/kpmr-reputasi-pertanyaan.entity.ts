// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/entities/kpmr-reputasi-pertanyaan.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { KPMRReputasiAspect } from './kpmr-reputasi-aspek.entity';
import { KPMRReputasiDefinition } from './kpmr-reputasi-definisi.entity';

@Entity('kpmr_reputasi_pertanyaan_holding')
@Index('IDX_KPMR_REPUTASI_QUESTION_ASPECT', ['year', 'aspekNo'])
export class KPMRReputasiQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @ManyToOne(() => KPMRReputasiAspect, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
  ])
  aspect: KPMRReputasiAspect;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KPMRReputasiDefinition, (definition) => definition.question)
  definitions: KPMRReputasiDefinition[];
}
