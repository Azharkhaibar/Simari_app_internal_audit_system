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
import { Operasional } from './operasional-ojk.entity';
import { OperasionalNilai } from './operasional-produk-nilai.entity';

@Entity('operasional_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['operasionalId', 'nomor'])
@Index(['operasionalId', 'orderIndex'])
export class OperasionalParameter {
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

  @Column({ name: 'operasional_ojk_id' })
  operasionalId: number;

  @ManyToOne(() => Operasional, (operasional) => operasional.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'operasional_ojk_id' })
  operasional: Operasional;

  @OneToMany(() => OperasionalNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: OperasionalNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}
