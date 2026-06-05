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
import { KPMRLikuiditasAspect } from './kpmr-likuiditas-aspek.entity';
import { KPMRLikuiditasDefinition } from './kpmr-likuiditas-definisi.entity';

@Entity('kpmr_likuiditas_pertanyaan_holding')
@Index('IDX_KPMR_LIKUIDITAS_QUESTION_ASPECT', ['year', 'aspekNo'])
export class KPMRLikuiditasQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @ManyToOne(() => KPMRLikuiditasAspect, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
  ])
  aspect: KPMRLikuiditasAspect;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => KPMRLikuiditasDefinition,
    (definition) => definition.question,
  )
  definitions: KPMRLikuiditasDefinition[];
}
