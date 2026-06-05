// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/dto/create-stratejik.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  Length,
  ValidateIf,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CalculationMode, Quarter } from '../entities/stratejik.entity';

export class CreateStratejikDto {
  @ApiProperty({ example: 2024 })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: 'Q1', enum: Quarter })
  @IsNotEmpty()
  @IsEnum(Quarter)
  quarter: Quarter;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  sectionId: number;

  @ApiProperty({ example: '6.1' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  no: string;

  @ApiProperty({ example: 'Pencapaian Rencana Bisnis Perusahaan' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  sectionLabel: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bobotSection: number;

  @ApiProperty({ example: '6.1.1' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  subNo: string;

  @ApiProperty({ example: 'Pencapaian KPI Kuartal' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 1000)
  indikator: string;

  @ApiProperty({ example: 25 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bobotIndikator: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sumberRisiko?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dampak?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  low?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  lowToModerate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  moderate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  moderateToHigh?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  high?: string;

  @ApiProperty({ enum: CalculationMode, default: CalculationMode.RASIO })
  @IsNotEmpty()
  @IsEnum(CalculationMode)
  mode: CalculationMode = CalculationMode.RASIO;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  formula?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPercent?: boolean = false;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.mode === CalculationMode.RASIO)
  @IsOptional()
  @IsString()
  @Length(0, 255)
  pembilangLabel?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.mode === CalculationMode.RASIO)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pembilangValue?: number;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.mode !== CalculationMode.TEKS)
  @IsOptional()
  @IsString()
  @Length(0, 255)
  penyebutLabel?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.mode !== CalculationMode.TEKS)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  penyebutValue?: number;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.mode !== CalculationMode.TEKS)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hasil?: number;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.mode === CalculationMode.TEKS)
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  hasilText?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  peringkat: number;

  @ApiProperty({ example: 0.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weighted: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keterangan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
