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
import { Kredit } from './kredit-produk-ojk.entity';
import { KreditNilai } from './kredit-produk-nilai.entity';

@Entity('kredit_parameters_ojk')
@Index(['kreditId', 'nomor'])
@Index(['kreditId', 'orderIndex'])
export class KreditParameter {
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

  @Column({ name: 'kredit_ojk_id' })
  kreditId: number;

  @ManyToOne(() => Kredit, (kredit) => kredit.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kredit_ojk_id' })
  kredit: Kredit;

  @OneToMany(() => KreditNilai, (nilai) => nilai.parameter, {
    cascade: true,
  })
  nilaiList?: KreditNilai[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;
}