// src/modules/rekap-data/dto/rekap-data.dto.ts
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
export class GetRekapDataDto {
  @Type(() => Number)
  @IsNumber()
  year!: number;

  @IsEnum(Quarter)
  quarter!: Quarter;
}

export class GetTahunanDataDto {
  @Type(() => Number)
  @IsNumber()
  year!: number;
}

// DTO untuk update row
export class UpdateRekapRowDto {
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

// DTO untuk import
export class ImportRekapDataDto {
  @IsNumber()
  @Type(() => Number)
  year!: number;

  @IsEnum(Quarter)
  quarter!: Quarter;
}

// Response DTO
export class RekapDataResponseDto {
  investasiRows!: any[];
  pasarRows!: any[];
  likuiditasRows!: any[];
  operasionalRows!: any[];
  hukumRows!: any[];
  stratejikRows!: any[];
  kepatuhanRows!: any[];
  reputasiRows!: any[];
  operasionalSections!: any[];
  hukumSections!: any[];
  stratejikSections!: any[];
  kepatuhanSections!: any[];
  reputasiSections!: any[];
}

export class ImportResponseDto {
  totalImported!: number;
  investasiRows!: any[];
  pasarRows!: any[];
  likuiditasRows!: any[];
  operasionalRows!: any[];
  hukumRows!: any[];
  stratejikRows!: any[];
  kepatuhanRows!: any[];
  reputasiRows!: any[];
}
