// tatakelola-parameter.entity.ts

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
import { Tatakelola } from './tatakelola-ojk.entity';
import { TatakelolaNilai } from './tatakelola-produk-nilai.entity';

@Entity('tatakelola_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['tatakelolaId', 'nomor'])
@Index(['tatakelolaId', 'orderIndex'])
export class TatakelolaParameter {
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

  @Column({ name: 'tatakelola_ojk_id' })
  tatakelolaId: number;

  @ManyToOne(() => Tatakelola, (tatakelola) => tatakelola.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tatakelola_ojk_id' })
  tatakelola: Tatakelola;

  @OneToMany(() => TatakelolaNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: TatakelolaNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}