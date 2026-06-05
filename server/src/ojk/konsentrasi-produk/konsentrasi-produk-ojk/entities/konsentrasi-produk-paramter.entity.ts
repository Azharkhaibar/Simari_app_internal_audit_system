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
import { KonsentrasiProdukOjk } from './konsentrasi-produk-ojk.entity';
import { KonsentrasiNilai } from './konsentrasi-produk-nilai.entity';

@Entity('konsentrasi_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['konsentrasiId', 'nomor'])
@Index(['konsentrasiId', 'orderIndex'])
export class KonsentrasiParameter {
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

  @Column({ name: 'konsentrasi_ojk_id' })
  konsentrasiId: number;

  @ManyToOne(() => KonsentrasiProdukOjk, (konsentrasi) => konsentrasi.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'konsentrasi_ojk_id' })
  konsentrasi: KonsentrasiProdukOjk;

  @OneToMany(() => KonsentrasiNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: KonsentrasiNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}