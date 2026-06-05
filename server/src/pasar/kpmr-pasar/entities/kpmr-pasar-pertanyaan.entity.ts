// src/features/Dashboard/pages/RiskProfile/pages/Pasar/entities/kpmr-pasar-pertanyaan.entity.ts
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
import { KPMRPasarAspect } from './kpmr-pasar-aspek.entity';
import { KPMRPasarDefinition } from './kpmr-pasar-definisi.entity';

@Entity('kpmr_pasar_pertanyaan_holding')
@Index('IDX_KPMR_PASAR_QUESTION_ASPECT', ['year', 'aspekNo'])
export class KPMRPasarQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @ManyToOne(() => KPMRPasarAspect, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
  ])
  aspect: KPMRPasarAspect;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => KPMRPasarDefinition,
    (definition) => definition.question,
  )
  definitions: KPMRPasarDefinition[];
}