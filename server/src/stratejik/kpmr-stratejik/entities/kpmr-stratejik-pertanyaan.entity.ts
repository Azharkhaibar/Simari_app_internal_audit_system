// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/entities/kpmr-stratejik-pertanyaan.entity.ts
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
import { KPMRStratejikAspect } from './kpmr-stratejik-aspek.entity';
import { KPMRStratejikDefinition } from './kpmr-stratejik-definisi.entity';

@Entity('kpmr_stratejik_pertanyaan_holding')
@Index('IDX_KPMR_STRATEJIK_QUESTION_ASPECT', ['year', 'aspekNo'])
export class KPMRStratejikQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @ManyToOne(() => KPMRStratejikAspect, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
  ])
  aspect: KPMRStratejikAspect;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KPMRStratejikDefinition, (definition) => definition.question)
  definitions: KPMRStratejikDefinition[];
}
