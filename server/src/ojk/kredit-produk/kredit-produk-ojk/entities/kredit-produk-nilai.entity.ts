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
import { KreditParameter } from './kredit-produk-parameter.entity';

@Entity('kredit_nilai_ojk')
@Index(['parameterId', 'nomor'])
@Index(['parameterId', 'orderIndex'])
export class KreditNilai {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nomor?: string;

  @Column({ type: 'json', nullable: true })
  judul?: {
    type?: string;
    text?: string;
    value?: string | number | null;
    pembilang?: string;
    valuePembilang?: string | number | null;
    penyebut?: string;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  bobot: number;

  @Column({ nullable: true })
  portofolio?: string;

  @Column({ type: 'text', nullable: true })
  keterangan?: string;

  @Column({ type: 'json', nullable: true })
  riskindikator?: {
    low?: string;
    lowToModerate?: string;
    moderate?: string;
    moderateToHigh?: string;
    high?: string;
  };

  @Column({ name: 'parameter_id' })
  parameterId: number;

  @ManyToOne(() => KreditParameter, (parameter) => parameter.nilaiList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parameter_id' })
  parameter: KreditParameter;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}