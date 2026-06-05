// src/entities/strategik/stratejik.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { StratejikSection } from './stratejik-section.entity';

export enum CalculationMode {
  RASIO = 'RASIO',
  NILAI_TUNGGAL = 'NILAI_TUNGGAL',
  TEKS = 'TEKS',
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

@Entity('indikators_stratejik_holding')
@Unique('UQ_STRATEJIK_PERIOD_SUBNO', ['year', 'quarter', 'subNo', 'sectionId'])
@Index('IDX_STRATEJIK_PERIOD', ['year', 'quarter'])
@Index('IDX_STRATEJIK_SECTION', ['sectionId'])
export class Stratejik {
  @PrimaryGeneratedColumn()
  id: number;

  // ========== PERIODE (Wajib) ==========
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: Quarter })
  quarter: Quarter;

  // ========== RELASI SECTION ==========
  @Column({ name: 'section_id' })
  sectionId: number;

  @ManyToOne(() => StratejikSection, (section) => section.stratejikIndicators, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: StratejikSection;

  // ========== DATA SECTION (Copy dari master) ==========
  @Column({ type: 'varchar', length: 50 })
  no: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'section_label',
  })
  sectionLabel: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'bobot_section',
  })
  bobotSection: number;

  // ========== DATA INDIKATOR ==========
  @Column({
    type: 'varchar',
    length: 50,
    name: 'sub_no',
  })
  subNo: string;

  @Column({ type: 'varchar', length: 1000 })
  indikator: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'bobot_indikator',
  })
  bobotIndikator: number;

  // ========== ANALISIS RISIKO ==========
  @Column({
    type: 'text',
    nullable: true,
    name: 'sumber_risiko',
  })
  sumberRisiko: string | null;

  @Column({ type: 'text', nullable: true })
  dampak: string | null;

  // ========== LEVEL RISIKO ==========
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  low: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    name: 'low_to_moderate',
  })
  lowToModerate: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  moderate: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    name: 'moderate_to_high',
  })
  moderateToHigh: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  high: string | null;

  // ========== METODE PERHITUNGAN ==========
  @Column({
    type: 'enum',
    enum: CalculationMode,
    default: CalculationMode.RASIO,
  })
  mode: CalculationMode;

  @Column({ type: 'text', nullable: true })
  formula: string | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_percent',
  })
  isPercent: boolean;

  // ========== FAKTOR PERHITUNGAN ==========
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'pembilang_label',
  })
  pembilangLabel: string | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'pembilang_value',
  })
  pembilangValue: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'penyebut_label',
  })
  penyebutLabel: string | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'penyebut_value',
  })
  penyebutValue: number | null;

  // ========== HASIL ==========
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 6,
    nullable: true,
  })
  hasil: number | null;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
    name: 'hasil_text',
  })
  hasilText: string | null;

  // ========== SKOR DAN BOBOT ==========
  @Column({ type: 'int' })
  peringkat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  weighted: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string | null;

  // ========== VALIDASI DATA ==========
  @Column({
    name: 'is_validated',
    type: 'boolean',
    default: false,
  })
  isValidated: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'validated_at',
  })
  validatedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'validated_by',
  })
  validatedBy: string | null;

  // ========== AUDIT TRAIL ==========
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'is_deleted',
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'created_by',
  })
  createdBy: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'updated_by',
  })
  updatedBy: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'deleted_by',
  })
  deletedBy: string | null;

  // ========== VERSIONING ==========
  @Column({
    type: 'int',
    default: 1,
  })
  version: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'revision_notes',
  })
  revisionNotes: string | null;
}
