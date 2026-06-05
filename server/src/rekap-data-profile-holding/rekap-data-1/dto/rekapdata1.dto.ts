// src/rekap-data-1/dto/rekapdata1.dto.ts
import {
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ===================== SAVE BHz DTO =====================
export class SaveBhzDto {
  @IsNumber()
  year: number;

  @IsEnum(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  investasi: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pasar: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  likuiditas: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  operasional: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  hukum: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  strategis: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  kepatuhan: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  reputasi: number;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

// ===================== SAVE BVT DTO =====================
export class SaveBvtDto {
  @IsNumber()
  year: number;

  @IsEnum(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  investasi: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pasar: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  likuiditas: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  operasional: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  hukum: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  strategis: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  kepatuhan: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  reputasi: number;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

// ===================== RISK DETAIL DTO =====================
export class RiskDetailDto {
  @IsString()
  label: string;

  @IsNumber()
  inherent: number;

  @IsNumber()
  kpmr: number;

  @IsNumber()
  peringkat: number;
}

// ===================== SAVE REKAP RESULT DTO =====================
export class SaveRekapResultDto {
  @IsNumber()
  year: number;

  @IsEnum(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter: string;

  @IsNumber()
  kompositA: number;

  @IsNumber()
  kompositB: number;

  @IsNumber()
  totalPeringkat: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDetailDto)
  riskDetails: RiskDetailDto[];

  @IsString()
  @IsOptional()
  createdBy?: string;
}
