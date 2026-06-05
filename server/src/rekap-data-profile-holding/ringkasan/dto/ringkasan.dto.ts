// src/modules/ringkasan/dto/ringkasan.dto.ts
import { IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export class GetRingkasanDto {
  @Type(() => Number)
  @IsNumber()
  year!: number;

  @IsEnum(Quarter)
  quarter!: Quarter;
}

// Response DTO
export interface RingkasanItem {
  id: number;
  year: number;
  quarter: string;
  riskType: string;
  sectionNo: string;
  sectionLabel: string;
  bobotSection: number;
  subNo: string;
  indikator: string;
  bobotIndikator: number;
  mode: string;
  isPercent: boolean;
  hasil: number | null;
  hasilText: string | null;
  peringkat: number;
}

export interface RingkasanGroup {
  riskType: string;
  sectionNo: string;
  sectionLabel: string;
  bobotSection: number;
  items: RingkasanItem[];
}

export interface RingkasanResponseDto {
  investasi: RingkasanGroup[];
  pasar: RingkasanGroup[];
  likuiditas: RingkasanGroup[];
  operasional: RingkasanGroup[];
  hukum: RingkasanGroup[];
  stratejik: RingkasanGroup[];
  kepatuhan: RingkasanGroup[];
  reputasi: RingkasanGroup[];
  riskTypeTotals: Record<string, number>;
}
