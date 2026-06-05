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
import { HukumOjk } from './hukum-ojk.entity';
import { HukumNilai } from './hukum-nilai.entity';

@Entity('hukum_parameters_ojk')
// ========== ⬇️ DIUBAH: index ⬇️ ==========
@Index(['hukumId', 'nomor'])
@Index(['hukumId', 'orderIndex'])
export class HukumParameter {
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

  @Column({ name: 'hukum_ojk_id' })
  hukumId: number;

  @ManyToOne(() => HukumOjk, (hukum) => hukum.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hukum_ojk_id' })
  hukum: HukumOjk;

  @OneToMany(() => HukumNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: HukumNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}