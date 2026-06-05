// src/modules/rekap-data2/dto/rekap-data2.dto.ts
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum RiskSource {
  INVESTASI = 'INVESTASI',
  PASAR = 'PASAR',
  LIKUIDITAS = 'LIKUIDITAS',
  OPERASIONAL = 'OPERASIONAL',
  HUKUM = 'HUKUM',
  STRATEJIK = 'STRATEJIK',
  KEPATUHAN = 'KEPATUHAN',
  REPUTASI = 'REPUTASI',
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

// DTO untuk GET request
export class GetRekapData2Dto {
  @Type(() => Number)
  @IsNumber()
  year!: number;

  @IsEnum(Quarter)
  quarter!: Quarter;
}

export class GetTahunanData2Dto {
  @Type(() => Number)
  @IsNumber()
  year!: number;
}

// DTO untuk update row
export class UpdateRekapData2RowDto {
  @IsEnum(RiskSource)
  source!: RiskSource;

  @IsNumber()
  year!: number;

  @IsEnum(Quarter)
  quarter!: Quarter;

  @IsString()
  rowKey!: string;

  @IsString()
  field!: string;

  @IsOptional()
  value?: any;
}

// Response DTO
export interface NormalizedRow {
  id: number;
  year: number;
  quarter: string;
  source: string;
  no: string;
  subNo: string;
  sectionLabel: string;
  indikator: string;
  numeratorLabel: string;
  numeratorValue: number | null;
  pembilangLabel: string;
  pembilangValue: number | null;
  denominatorLabel: string;
  denominatorValue: number | null;
  penyebutLabel: string;
  penyebutValue: number | null;
  isPercent: boolean;
  mode: string;
  formula: string;
  hasil: number | null;
  hasilText: string | null;
  low: string;
  lowToModerate: string;
  moderate: string;
  moderateToHigh: string;
  high: string;
  peringkat: number;
  weighted: number;
  bobotSection: number;
  bobotIndikator: number;
  sumberRisiko: string;
  dampak: string;
  keterangan: string;
}

export interface RekapData2ResponseDto {
  investasiRows: NormalizedRow[];
  pasarRows: NormalizedRow[];
  likuiditasRows: NormalizedRow[];
  operasionalRows: NormalizedRow[];
  hukumRows: NormalizedRow[];
  stratejikRows: NormalizedRow[];
  kepatuhanRows: NormalizedRow[];
  reputasiRows: NormalizedRow[];
}

// Dashboard Response DTO
export interface DashboardRiskRow {
  label: string;
  inherent: number;
  kpmr: number;
  net: number;
}

export interface DashboardSkorProfil {
  inherent: number;
  kpmr: number;
  net: number;
}

export interface DashboardDataResponseDto {
  rows: DashboardRiskRow[];
  skorProfil: DashboardSkorProfil;
  isEmpty: boolean;
}

// Import Response DTO
export interface ImportResponseDto {
  totalImported: number;
  investasiRows: NormalizedRow[];
  pasarRows: NormalizedRow[];
  likuiditasRows: NormalizedRow[];
  operasionalRows: NormalizedRow[];
  hukumRows: NormalizedRow[];
  stratejikRows: NormalizedRow[];
  kepatuhanRows: NormalizedRow[];
  reputasiRows: NormalizedRow[];
}
