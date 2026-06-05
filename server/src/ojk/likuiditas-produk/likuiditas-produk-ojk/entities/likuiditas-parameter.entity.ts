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
import { Likuiditas } from './likuiditas-ojk.entity';
import { LikuiditasNilai } from './likuiditas-nilai.entity';

@Entity('likuiditas_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['likuiditasId', 'nomor'])
@Index(['likuiditasId', 'orderIndex'])
export class LikuiditasParameter {
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

  @Column({ name: 'likuiditas_ojk_id' })
  likuiditasId: number;

  @ManyToOne(() => Likuiditas, (likuiditas) => likuiditas.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'likuiditas_ojk_id' })
  likuiditas: Likuiditas;

  @OneToMany(() => LikuiditasNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: LikuiditasNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}