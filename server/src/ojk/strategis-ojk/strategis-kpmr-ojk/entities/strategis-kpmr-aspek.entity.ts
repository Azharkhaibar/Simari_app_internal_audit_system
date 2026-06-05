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
import { KpmrStrategisOjk } from './strategis-kpmr-ojk.entity';
import { KpmrPertanyaanStrategis } from './strategis-kpmr-pertanyaan.entity';

@Entity('kpmr_aspek_strategis')
@Index(['kpmrOjkId', 'nomor'])
@Index(['kpmrOjkId', 'orderIndex'])
@Index(['kpmrOjkId', 'bobot'])
@Index(['kpmrOjkId', 'createdAt'])
export class KpmrAspekStrategis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nomor?: string;

  @Column()
  judul: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  bobot: number;

  @Column({ type: 'text', nullable: true })
  deskripsi?: string;

  @Column({ name: 'kpmr_ojk_id' })
  kpmrOjkId: number;

  @ManyToOne(() => KpmrStrategisOjk, (kpmr) => kpmr.aspekList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kpmr_ojk_id' })
  kpmrOjk: KpmrStrategisOjk;

  @OneToMany(() => KpmrPertanyaanStrategis, (pertanyaan) => pertanyaan.aspek, {
    cascade: true,
  })
  pertanyaanList?: KpmrPertanyaanStrategis[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'average_score',
  })
  averageScore?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rating?: string;

  @Column({ nullable: true, name: 'updated_by' })
  updatedBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
