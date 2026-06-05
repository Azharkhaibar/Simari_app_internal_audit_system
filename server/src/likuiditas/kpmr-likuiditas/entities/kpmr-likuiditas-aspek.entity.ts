import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { KPMRLikuiditasQuestion } from './kpmr-likuiditas-pertanyaan.entity';

@Entity('kpmr_likuiditas_aspek_holding')
@Index('UQ_YEAR_ASPEK_NO_LIKUIDITAS', ['year', 'aspekNo'], { unique: true })
export class KPMRLikuiditasAspect {
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

  @OneToMany(() => KPMRLikuiditasQuestion, (question) => question.aspect)
  questions: KPMRLikuiditasQuestion[];
}
