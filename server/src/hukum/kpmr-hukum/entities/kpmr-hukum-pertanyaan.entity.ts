// src/features/Dashboard/pages/RiskProfile/pages/Hukum/entities/kpmr-hukum-pertanyaan.entity.ts
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
import { KPMRHukumAspect } from './kpmr-hukum-aspek.entity';
import { KPMRHukumDefinition } from './kpmr-hukum-definisi.entity';

@Entity('kpmr_hukum_pertanyaan_holding')
@Index('IDX_KPMR_HUKUM_QUESTION_ASPECT', ['year', 'aspekNo'])
export class KPMRHukumQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @ManyToOne(() => KPMRHukumAspect, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
  ])
  aspect: KPMRHukumAspect;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KPMRHukumDefinition, (definition) => definition.question)
  definitions: KPMRHukumDefinition[];
}
