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
import { KepatuhanOjk } from './kepatuhan-ojk.entity';
import { KepatuhanNilai } from './kepatuhan-nilai.entity';

@Entity('kepatuhan_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['kepatuhanId', 'nomor'])
@Index(['kepatuhanId', 'orderIndex'])
export class KepatuhanParameter {
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

  @Column({ name: 'kepatuhan_ojk_id' })
  kepatuhanId: number;

  @ManyToOne(() => KepatuhanOjk, (kepatuhan) => kepatuhan.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kepatuhan_ojk_id' })
  kepatuhan: KepatuhanOjk;

  @OneToMany(() => KepatuhanNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: KepatuhanNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}