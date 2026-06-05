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
import { Rentabilitas } from './rentabilitas-ojk.entity';
import { RentabilitasNilai } from './rentabilitas-nilai.entity';

@Entity('rentabilitas_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['rentabilitasId', 'nomor'])
@Index(['rentabilitasId', 'orderIndex'])
export class RentabilitasParameter {
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

  @Column({ name: 'rentabilitas_ojk_id' })
  rentabilitasId: number;

  @ManyToOne(() => Rentabilitas, (rentabilitas) => rentabilitas.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rentabilitas_ojk_id' })
  rentabilitas: Rentabilitas;

  @OneToMany(() => RentabilitasNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: RentabilitasNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}