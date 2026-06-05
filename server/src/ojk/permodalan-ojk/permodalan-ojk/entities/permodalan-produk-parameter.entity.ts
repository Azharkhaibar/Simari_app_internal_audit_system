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
import { Permodalan } from './permodalan-ojk.entity';
import { PermodalanNilai } from './permodalan-produk-nilai.entity';

@Entity('permodalan_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['permodalanId', 'nomor'])
@Index(['permodalanId', 'orderIndex'])
export class PermodalanParameter {
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

  @Column({ name: 'permodalan_ojk_id' })
  permodalanId: number;

  @ManyToOne(() => Permodalan, (permodalan) => permodalan.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permodalan_ojk_id' })
  permodalan: Permodalan;

  @OneToMany(() => PermodalanNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: PermodalanNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}