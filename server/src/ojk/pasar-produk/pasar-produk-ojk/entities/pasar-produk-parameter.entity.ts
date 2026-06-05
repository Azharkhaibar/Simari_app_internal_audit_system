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
import { PasarProduk } from './pasar-produk-ojk.entity';
import { PasarProdukNilai } from './pasar-produk-nilai.entity';

@Entity('pasar_produk_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['pasarProdukId', 'nomor'])
@Index(['pasarProdukId', 'orderIndex'])
export class PasarProdukParameter {
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

  @Column({ name: 'pasar_produk_ojk_id' })
  pasarProdukId: number;

  @ManyToOne(() => PasarProduk, (pasarProduk) => pasarProduk.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pasar_produk_ojk_id' })
  pasarProduk: PasarProduk;

  @OneToMany(() => PasarProdukNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: PasarProdukNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}