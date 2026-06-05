// src/entities/repository/risk-profile-repository.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ViewEntity,
  ViewColumn,
} from 'typeorm';

export enum ModuleType {
  KEPATUHAN = 'KEPATUHAN',
  REPUTASI = 'REPUTASI',
  INVESTASI = 'INVESTASI',
  LIKUIDITAS = 'LIKUIDITAS',
  OPERASIONAL = 'OPERASIONAL',
  STRATEGIK = 'STRATEGIK',
  HUKUM = 'HUKUM',
  PASAR = 'PASAR',
}

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

@ViewEntity({
  name: 'risk_profile_repository_holding_view',
  expression: `
    -- KEPATUHAN (SUDAH DIPERBAIKI)
    SELECT 
      'KEPATUHAN' AS "moduleType",
      k.id,
      k.year,
      k.quarter,
      k.section_id AS "sectionId",
      k.no,
      k.section_label AS "sectionLabel",
      k.bobot_section AS "bobotSection",
      k.sub_no AS "subNo",
      k.indikator,
      k.bobot_indikator AS "bobotIndikator",
      k.sumber_risiko AS "sumberRisiko",
      k.dampak,
      k.low,
      k.low_to_moderate AS "lowToModerate",
      k.moderate,
      k.moderate_to_high AS "moderateToHigh",
      k.high,
      k.mode,
      k.formula,
      k.is_percent AS "isPercent",
      k.pembilang_label AS "pembilangLabel",
      k.pembilang_value AS "pembilangValue",
      k.penyebut_label AS "penyebutLabel",
      k.penyebut_value AS "penyebutValue",
      k.hasil,
      k.hasil_text AS "hasilText",
      k.peringkat,
      k.weighted,
      k.keterangan,
      k.is_validated AS "isValidated",
      k.created_at AS "createdAt",
      k.updated_at AS "updatedAt",
      ks.parameter AS "parameter",
      ks.description AS "sectionDescription"
    FROM indikators_kepatuhan_holding k
    LEFT JOIN sections_kepatuhan_holding ks ON k.section_id = ks.id
    
    UNION ALL

    -- REPUTASI (SUDAH DIPERBAIKI)
    SELECT 
      'REPUTASI' AS "moduleType",
      r.id,
      r.year,
      r.quarter,
      r.section_id AS "sectionId",
      r.no,
      r.section_label AS "sectionLabel",
      r.bobot_section AS "bobotSection",
      r.sub_no AS "subNo",
      r.indikator,
      r.bobot_indikator AS "bobotIndikator",
      r.sumber_risiko AS "sumberRisiko",
      r.dampak,
      r.low,
      r.low_to_moderate AS "lowToModerate",
      r.moderate,
      r.moderate_to_high AS "moderateToHigh",
      r.high,
      r.mode,
      r.formula,
      r.is_percent AS "isPercent",
      r.pembilang_label AS "pembilangLabel",
      r.pembilang_value AS "pembilangValue",
      r.penyebut_label AS "penyebutLabel",
      r.penyebut_value AS "penyebutValue",
      r.hasil,
      r.hasil_text AS "hasilText",
      r.peringkat,
      r.weighted,
      r.keterangan,
      r.is_validated AS "isValidated",
      r.created_at AS "createdAt",
      r.updated_at AS "updatedAt",
      rs.parameter AS "parameter",
      rs.description AS "sectionDescription"
    FROM indikators_reputasi_holding r
    LEFT JOIN sections_reputasi_holding rs ON r.section_id = rs.id
    
    UNION ALL
    
    -- INVESTASI (SUDAH DIPERBAIKI)
    SELECT 
      'INVESTASI' AS "moduleType",
      i.id,
      i.year,
      i.quarter,
      i.section_id AS "sectionId",
      i.no,
      i.section_label AS "sectionLabel",
      i.bobot_section AS "bobotSection",
      i.sub_no AS "subNo",
      i.indikator,
      i.bobot_indikator AS "bobotIndikator",
      i.sumber_risiko AS "sumberRisiko",
      i.dampak,
      i.low,
      i.low_to_moderate AS "lowToModerate",
      i.moderate,
      i.moderate_to_high AS "moderateToHigh",
      i.high,
      i.mode,
      i.formula,
      i.is_percent AS "isPercent",
      i.pembilang_label AS "pembilangLabel",
      i.pembilang_value AS "pembilangValue",
      i.penyebut_label AS "penyebutLabel",
      i.penyebut_value AS "penyebutValue",
      i.hasil,
      i.hasil_text AS "hasilText",
      i.peringkat,
      i.weighted,
      i.keterangan,
      i.is_validated AS "isValidated",
      i.created_at AS "createdAt",
      i.updated_at AS "updatedAt",
      isec.parameter AS "parameter",
      isec.description AS "sectionDescription"
    FROM indikators_investasi_holding i
    LEFT JOIN sections_investasi_holding isec ON i.section_id = isec.id
    
    UNION ALL
    
    -- LIKUIDITAS (SUDAH DIPERBAIKI)
    SELECT 
      'LIKUIDITAS' AS "moduleType",
      l.id,
      l.year,
      l.quarter,
      l.section_id AS "sectionId",
      l.no,
      l.section_label AS "sectionLabel",
      l.bobot_section AS "bobotSection",
      l.sub_no AS "subNo",
      l.indikator,
      l.bobot_indikator AS "bobotIndikator",
      l.sumber_risiko AS "sumberRisiko",
      l.dampak,
      l.low,
      l.low_to_moderate AS "lowToModerate",
      l.moderate,
      l.moderate_to_high AS "moderateToHigh",
      l.high,
      l.mode,
      l.formula,
      l.is_percent AS "isPercent",
      l.pembilang_label AS "pembilangLabel",
      l.pembilang_value AS "pembilangValue",
      l.penyebut_label AS "penyebutLabel",
      l.penyebut_value AS "penyebutValue",
      l.hasil,
      l.hasil_text AS "hasilText",
      l.peringkat,
      l.weighted,
      l.keterangan,
      l.is_validated AS "isValidated",
      l.created_at AS "createdAt",
      l.updated_at AS "updatedAt",
      ls.parameter AS "parameter",
      ls.description AS "sectionDescription"
    FROM indikators_likuiditas_holding l
    LEFT JOIN sections_likuiditas_holding ls ON l.section_id = ls.id
    
    UNION ALL
    
    -- OPERASIONAL (SUDAH DIPERBAIKI)
    SELECT 
      'OPERASIONAL' AS "moduleType",
      o.id,
      o.year,
      o.quarter,
      o.section_id AS "sectionId",
      o.no,
      o.section_label AS "sectionLabel",
      o.bobot_section AS "bobotSection",
      o.sub_no AS "subNo",
      o.indikator,
      o.bobot_indikator AS "bobotIndikator",
      o.sumber_risiko AS "sumberRisiko",
      o.dampak,
      o.low,
      o.low_to_moderate AS "lowToModerate",
      o.moderate,
      o.moderate_to_high AS "moderateToHigh",
      o.high,
      o.mode,
      o.formula,
      o.is_percent AS "isPercent",
      o.pembilang_label AS "pembilangLabel",
      o.pembilang_value AS "pembilangValue",
      o.penyebut_label AS "penyebutLabel",
      o.penyebut_value AS "penyebutValue",
      o.hasil,
      o.hasil_text AS "hasilText",
      o.peringkat,
      o.weighted,
      o.keterangan,
      o.is_validated AS "isValidated",
      o.created_at AS "createdAt",
      o.updated_at AS "updatedAt",
      os.parameter AS "parameter",
      os.description AS "sectionDescription"
    FROM indikators_operasional_holding o
    LEFT JOIN sections_operasional_holding os ON o.section_id = os.id
    
    UNION ALL
    
    -- STRATEGIK (SUDAH DIPERBAIKI)
    SELECT 
      'STRATEGIK' AS "moduleType",
      s.id,
      s.year,
      s.quarter,
      s.section_id AS "sectionId",
      s.no,
      s.section_label AS "sectionLabel",
      s.bobot_section AS "bobotSection",
      s.sub_no AS "subNo",
      s.indikator,
      s.bobot_indikator AS "bobotIndikator",
      s.sumber_risiko AS "sumberRisiko",
      s.dampak,
      s.low,
      s.low_to_moderate AS "lowToModerate",
      s.moderate,
      s.moderate_to_high AS "moderateToHigh",
      s.high,
      s.mode,
      s.formula,
      s.is_percent AS "isPercent",
      s.pembilang_label AS "pembilangLabel",
      s.pembilang_value AS "pembilangValue",
      s.penyebut_label AS "penyebutLabel",
      s.penyebut_value AS "penyebutValue",
      s.hasil,
      s.hasil_text AS "hasilText",
      s.peringkat,
      s.weighted,
      s.keterangan,
      s.is_validated AS "isValidated",
      s.created_at AS "createdAt",
      s.updated_at AS "updatedAt",
      ss.parameter AS "parameter",
      ss.description AS "sectionDescription"
    FROM indikators_stratejik_holding s
    LEFT JOIN sections_stratejik_holding ss ON s.section_id = ss.id
    
    UNION ALL
    
    -- HUKUM (SUDAH DIPERBAIKI)
    SELECT 
      'HUKUM' AS "moduleType",
      h.id,
      h.year,
      h.quarter,
      h.section_id AS "sectionId",
      h.no,
      h.section_label AS "sectionLabel",
      h.bobot_section AS "bobotSection",
      h.sub_no AS "subNo",
      h.indikator,
      h.bobot_indikator AS "bobotIndikator",
      h.sumber_risiko AS "sumberRisiko",
      h.dampak,
      h.low,
      h.low_to_moderate AS "lowToModerate",
      h.moderate,
      h.moderate_to_high AS "moderateToHigh",
      h.high,
      h.mode,
      h.formula,
      h.is_percent AS "isPercent",
      h.pembilang_label AS "pembilangLabel",
      h.pembilang_value AS "pembilangValue",
      h.penyebut_label AS "penyebutLabel",
      h.penyebut_value AS "penyebutValue",
      h.hasil,
      h.hasil_text AS "hasilText",
      h.peringkat,
      h.weighted,
      h.keterangan,
      h.is_validated AS "isValidated",
      h.created_at AS "createdAt",
      h.updated_at AS "updatedAt",
      hs.parameter AS "parameter",
      hs.description AS "sectionDescription"
    FROM indikators_hukum_holding h
    LEFT JOIN sections_hukum_holding hs ON h.section_id = hs.id
    
    UNION ALL
    
    -- PASAR (SUDAH DIPERBAIKI)
    SELECT 
      'PASAR' AS "moduleType",
      p.id,
      p.year,
      p.quarter,
      p.section_id AS "sectionId",
      p.no,
      p.section_label AS "sectionLabel",
      p.bobot_section AS "bobotSection",
      p.sub_no AS "subNo",
      p.indikator,
      p.bobot_indikator AS "bobotIndikator",
      p.sumber_risiko AS "sumberRisiko",
      p.dampak,
      p.low,
      p.low_to_moderate AS "lowToModerate",
      p.moderate,
      p.moderate_to_high AS "moderateToHigh",
      p.high,
      p.mode,
      p.formula,
      p.is_percent AS "isPercent",
      p.pembilang_label AS "pembilangLabel",
      p.pembilang_value AS "pembilangValue",
      p.penyebut_label AS "penyebutLabel",
      p.penyebut_value AS "penyebutValue",
      p.hasil,
      p.hasil_text AS "hasilText",
      p.peringkat,
      p.weighted,
      p.keterangan,
      p.is_validated AS "isValidated",
      p.created_at AS "createdAt",
      p.updated_at AS "updatedAt",
      ps.parameter AS "parameter",
      ps.description AS "sectionDescription"
    FROM indikators_pasar_holding p
    LEFT JOIN sections_pasar_holding ps ON p.section_id = ps.id
  `,
})
@Index('IDX_REPOSITORY_MODULE', ['moduleType'])
@Index('IDX_REPOSITORY_PERIOD', ['year', 'quarter'])
@Index('IDX_REPOSITORY_YEAR_QUARTER_MODULE', ['year', 'quarter', 'moduleType'])
export class RiskProfileRepositoryView {
  @ViewColumn()
  moduleType: ModuleType;

  @PrimaryGeneratedColumn()
  id: number;

  // ========== PERIODE ==========
  @ViewColumn()
  year: number;

  @ViewColumn()
  quarter: Quarter;

  // ========== RELASI ==========
  @ViewColumn()
  sectionId: number;

  // ========== DATA SECTION ==========
  @ViewColumn()
  no: string;

  @ViewColumn({ name: 'sectionLabel' })
  sectionLabel: string;

  @ViewColumn({ name: 'bobotSection' })
  bobotSection: number;

  @ViewColumn()
  parameter: string;

  @ViewColumn({ name: 'sectionDescription' })
  sectionDescription: string | null;

  // ========== DATA INDIKATOR ==========
  @ViewColumn({ name: 'subNo' })
  subNo: string;

  @ViewColumn()
  indikator: string;

  @ViewColumn({ name: 'bobotIndikator' })
  bobotIndikator: number;

  // ========== ANALISIS RISIKO ==========
  @ViewColumn({ name: 'sumberRisiko' })
  sumberRisiko: string | null;

  @ViewColumn()
  dampak: string | null;

  // ========== LEVEL RISIKO ==========
  @ViewColumn()
  low: string | null;

  @ViewColumn({ name: 'lowToModerate' })
  lowToModerate: string | null;

  @ViewColumn()
  moderate: string | null;

  @ViewColumn({ name: 'moderateToHigh' })
  moderateToHigh: string | null;

  @ViewColumn()
  high: string | null;

  // ========== METODE PERHITUNGAN ==========
  @ViewColumn()
  mode: CalculationMode;

  @ViewColumn()
  formula: string | null;

  @ViewColumn({ name: 'isPercent' })
  isPercent: boolean;

  // ========== FAKTOR PERHITUNGAN ==========
  @ViewColumn({ name: 'pembilangLabel' })
  pembilangLabel: string | null;

  @ViewColumn({ name: 'pembilangValue' })
  pembilangValue: number | null;

  @ViewColumn({ name: 'penyebutLabel' })
  penyebutLabel: string | null;

  @ViewColumn({ name: 'penyebutValue' })
  penyebutValue: number | null;

  // ========== HASIL ==========
  @ViewColumn()
  hasil: number | null;

  @ViewColumn({ name: 'hasilText' })
  hasilText: string | null;

  // ========== SKOR DAN BOBOT ==========
  @ViewColumn()
  peringkat: number;

  @ViewColumn()
  weighted: number;

  @ViewColumn()
  keterangan: string | null;

  // ========== VALIDASI ==========
  @ViewColumn({ name: 'isValidated' })
  isValidated: boolean;

  // ========== AUDIT TRAIL ==========
  @ViewColumn({ name: 'createdAt' })
  createdAt: Date;

  @ViewColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
