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
import { PasarProdukParameter } from './pasar-produk-parameter.entity';

@Entity('pasar_produk_nilai_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['parameterId', 'nomor'])
@Index(['parameterId', 'orderIndex'])
export class PasarProdukNilai {
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

  @ManyToOne(() => PasarProdukParameter, (parameter) => parameter.nilaiList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parameter_id' })
  parameter: PasarProdukParameter;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}