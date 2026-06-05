import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { KpmrAspekInvestasi } from './investasi-kpmr-aspek.entity';

@Entity('kpmr_pertanyaan_investasi')
@Index(['aspekId', 'nomor'])
@Index(['aspekId', 'orderIndex'])
@Index(['aspekId', 'createdAt'])
export class KpmrPertanyaanInvestasi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nomor?: string;

  @Column({ type: 'text', nullable: false })
  pertanyaan: string;

  @Column({ type: 'json', nullable: true })
  skor?: {
    Q1?: number;
    Q2?: number;
    Q3?: number;
    Q4?: number;
  } = {};

  @Column({ type: 'json', nullable: true })
  indicator?: {
    strong?: string;
    satisfactory?: string;
    fair?: string;
    marginal?: string;
    unsatisfactory?: string;
  };

  @Column({ type: 'text', nullable: true })
  evidence?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  catatan?: string;

  @Column({ name: 'aspek_id' })
  aspekId: number;

  @ManyToOne(() => KpmrAspekInvestasi, (aspek) => aspek.pertanyaanList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'aspek_id' })
  aspek: KpmrAspekInvestasi;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}
