// tatakelola-inherent.dto.ts

import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  IsNotEmpty,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

// === ENUMS ===
export enum KategoriModel {
  TANPA_MODEL = 'tanpa_model',
  OPEN_END = 'open_end',
  TERSTRUKTUR = 'terstruktur',
}

export enum KategoriUnderlying {
  INDEKS = 'indeks',
  EBA = 'eba',
  DINFRA = 'dinfra',
  OBLIGASI = 'obligasi',
}

export enum KategoriPrinsip {
  SYARIAH = 'syariah',
  KONVENSIONAL = 'konvensional',
}

export enum KategoriJenis {
  PASAR_UANG = 'pasar_uang',
  PENDAPATAN_TETAP = 'pendapatan_tetap',
  CAMPURAN = 'campuran',
  SAHAM = 'saham',
  INDEKS = 'indeks',
  TERPROTEKSI = 'terproteksi',
}

export enum JudulType {
  TANPA_FAKTOR = 'Tanpa Faktor',
  SATU_FAKTOR = 'Satu Faktor',
  DUA_FAKTOR = 'Dua Faktor',
}

// === SUBCLASSES ===

export class KategoriDto {
  @IsOptional()
  @IsString()
  @IsIn(['tanpa_model', 'open_end', 'terstruktur'], {
    message: 'Model harus salah satu dari: tanpa_model, open_end, terstruktur',
  })
  model?: string;

  @IsOptional()
  @IsString()
  @IsIn(['syariah', 'konvensional'], {
    message: 'Prinsip harus salah satu dari: syariah, konvensional',
  })
  prinsip?: string;

  @IsOptional()
  @IsString()
  @IsIn(
    [
      'pasar_uang',
      'pendapatan_tetap',
      'campuran',
      'saham',
      'indeks',
      'terproteksi',
    ],
    {
      message:
        'Jenis harus salah satu dari: pasar_uang, pendapatan_tetap, campuran, saham, indeks, terproteksi',
    },
  )
  jenis?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['indeks', 'eba', 'dinfra', 'obligasi'], { each: true })
  underlying?: string[];
}

export class JudulDto {
  @IsOptional()
  @IsEnum(JudulType)
  type?: JudulType;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  value?: string | number | null;

  @IsOptional()
  @IsString()
  pembilang?: string;

  @IsOptional()
  valuePembilang?: string | number | null;

  @IsOptional()
  @IsString()
  penyebut?: string;

  @IsOptional()
  valuePenyebut?: string | number | null;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsBoolean()
  percent?: boolean;
}

export class RiskindikatorDto {
  @IsOptional()
  @IsString()
  low?: string;

  @IsOptional()
  @IsString()
  lowToModerate?: string;

  @IsOptional()
  @IsString()
  moderate?: string;

  @IsOptional()
  @IsString()
  moderateToHigh?: string;

  @IsOptional()
  @IsString()
  high?: string;
}

// === MAIN DTOs ===

// DTO untuk membuat Tatakelola (header)
export class CreateTatakelolaDto {
  @IsInt()
  @Min(2000)
  year: number;

  @IsInt()
  @Min(1)
  @Max(4)
  quarter: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  version?: string;
}

// DTO untuk update Tatakelola
export class UpdateTatakelolaDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  summary?: {
    totalWeighted?: number;
    summaryBg?: string;
    computedAt?: Date;
  };

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @IsOptional()
  @IsString()
  lockedBy?: string;

  @IsOptional()
  lockedAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

// DTO untuk Parameter (Create)
export class CreateParameterDto {
  @IsOptional()
  @IsString()
  nomor?: string;

  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  bobot: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => KategoriDto)
  kategori?: KategoriDto;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

// DTO untuk Parameter (Update)
export class UpdateParameterDto {
  @IsOptional()
  @IsString()
  nomor?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  judul?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bobot?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => KategoriDto)
  kategori?: KategoriDto;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

// DTO untuk Nilai (Create)
export class CreateNilaiDto {
  @IsOptional()
  @IsString()
  nomor?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => JudulDto)
  judul: JudulDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  bobot: number;

  @IsOptional()
  @IsString()
  portofolio?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RiskindikatorDto)
  riskindikator?: RiskindikatorDto;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

// DTO untuk Nilai (Update)
export class UpdateNilaiDto {
  @IsOptional()
  @IsString()
  nomor?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => JudulDto)
  judul?: JudulDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bobot?: number;

  @IsOptional()
  @IsString()
  portofolio?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RiskindikatorDto)
  riskindikator?: RiskindikatorDto;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

// DTO untuk Reorder Parameters
export class ReorderParametersDto {
  @IsArray()
  @IsInt({ each: true })
  parameterIds: number[];
}

// DTO untuk Reorder Nilai
export class ReorderNilaiDto {
  @IsArray()
  @IsInt({ each: true })
  nilaiIds: number[];
}

// DTO untuk Summary
export class UpdateSummaryDto {
  @IsOptional()
  @IsNumber()
  totalWeighted?: number;

  @IsOptional()
  @IsString()
  summaryBg?: string;

  @IsOptional()
  computedAt?: Date;
}

// DTO untuk Import/Export
export class ExportImportMetadataDto {
  @IsInt()
  @Min(2000)
  year: number;

  @IsInt()
  @Min(1)
  @Max(4)
  quarter: number;

  @IsOptional()
  @IsString()
  exportedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalParameters?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalNilai?: number;
}

export class ExportParameterDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  nomor?: string;

  @IsString()
  judul: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  bobot: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => KategoriDto)
  kategori?: KategoriDto;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExportNilaiDto)
  nilaiList?: ExportNilaiDto[];
}

export class ExportNilaiDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  nomor?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => JudulDto)
  judul: JudulDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  bobot: number;

  @IsOptional()
  @IsString()
  portofolio?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RiskindikatorDto)
  riskindikator?: RiskindikatorDto;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class ImportExportDto {
  @ValidateNested()
  @Type(() => ExportImportMetadataDto)
  metadata: ExportImportMetadataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExportParameterDto)
  parameters: ExportParameterDto[];
}