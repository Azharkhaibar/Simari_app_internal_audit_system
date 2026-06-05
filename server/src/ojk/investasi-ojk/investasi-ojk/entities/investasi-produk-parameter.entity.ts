import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Investasi } from './investasi-ojk.entity';
import { InvestasiNilai } from './investasi-produk-nilai.entity';

@Entity('investasi_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['investasiId', 'nomor'])
@Index(['investasiId', 'orderIndex'])
export class InvestasiParameter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nomor?: string;

  @Column({ nullable: false })
  judul: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  bobot: number;

  @Column({ type: 'json', nullable: true })
  kategori?: {
    model?: string;
    prinsip?: string;
    jenis?: string;
    underlying?: string[];
  };

  @Column({ name: 'investasi_ojk_id' })
  investasiId: number;

  @ManyToOne(() => Investasi, (investasi) => investasi.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'investasi_ojk_id' })
  investasi: Investasi;

  @OneToMany(() => InvestasiNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: InvestasiNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}