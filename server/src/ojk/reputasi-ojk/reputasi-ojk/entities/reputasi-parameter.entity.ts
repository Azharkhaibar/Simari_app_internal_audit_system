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
import { Reputasi } from './reputasi-ojk.entity';
import { ReputasiNilai } from './reputasi-nilai.entity';

@Entity('reputasi_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['reputasiId', 'nomor'])
@Index(['reputasiId', 'orderIndex'])
export class ReputasiParameter {
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

  @Column({ name: 'reputasi_ojk_id' })
  reputasiId: number;

  @ManyToOne(() => Reputasi, (reputasi) => reputasi.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reputasi_ojk_id' })
  reputasi: Reputasi;

  @OneToMany(() => ReputasiNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: ReputasiNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}