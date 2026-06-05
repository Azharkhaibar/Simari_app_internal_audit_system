// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/entities/kpmr-kepatuhan-pertanyaan.entity.ts
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
import { KPMRKepatuhanAspect } from './kpmr-kepatuhan-aspek.entity';
import { KPMRKepatuhanDefinition } from './kpmr-kepatuhan-definisi.entity';

@Entity('kpmr_kepatuhan_pertanyaan_holding')
@Index('IDX_KPMR_KEPATUHAN_QUESTION_ASPECT', ['year', 'aspekNo'])
export class KPMRKepatuhanQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @ManyToOne(() => KPMRKepatuhanAspect, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
  ])
  aspect: KPMRKepatuhanAspect;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KPMRKepatuhanDefinition, (definition) => definition.question)
  definitions: KPMRKepatuhanDefinition[];
}
