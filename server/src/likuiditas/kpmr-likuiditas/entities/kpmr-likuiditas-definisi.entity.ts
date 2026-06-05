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
import { KPMRLikuiditasQuestion } from './kpmr-likuiditas-pertanyaan.entity';
import { KPMRLikuiditasScore } from './kpmr-likuiditas-skor.entity';

@Entity('kpmr_likuiditas_definisi_holding')
@Index(
  'IDX_KPMR_LIKUIDITAS_DEF_YEAR_ASPECT',
  ['year', 'aspekNo', 'sectionNo'],
  {
    unique: true,
  },
)
export class KPMRLikuiditasDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, name: 'aspek_no' })
  aspekNo: string;

  @Column({ type: 'varchar', length: 255, name: 'aspek_title' })
  aspekTitle: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'aspek_bobot',
    default: 0,
  })
  aspekBobot: number;

  @Column({ type: 'varchar', length: 50, name: 'section_no' })
  sectionNo: string;

  @ManyToOne(() => KPMRLikuiditasQuestion, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'year', referencedColumnName: 'year' },
    { name: 'aspek_no', referencedColumnName: 'aspekNo' },
    { name: 'section_no', referencedColumnName: 'sectionNo' },
  ])
  question: KPMRLikuiditasQuestion;

  @Column({ type: 'text', name: 'section_title' })
  sectionTitle: string;

  @Column({ type: 'text', nullable: true, name: 'level_1' })
  level1: string | null;

  @Column({ type: 'text', nullable: true, name: 'level_2' })
  level2: string | null;

  @Column({ type: 'text', nullable: true, name: 'level_3' })
  level3: string | null;

  @Column({ type: 'text', nullable: true, name: 'level_4' })
  level4: string | null;

  @Column({ type: 'text', nullable: true, name: 'level_5' })
  level5: string | null;

  @Column({ type: 'text', nullable: true })
  evidence: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;

  @OneToMany(() => KPMRLikuiditasScore, (score) => score.definition)
  scores: KPMRLikuiditasScore[];
}
