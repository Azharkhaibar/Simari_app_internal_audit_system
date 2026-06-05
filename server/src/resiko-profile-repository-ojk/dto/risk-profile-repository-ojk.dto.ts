// src/risk-profile-repository/dto/risk-profile-repository-ojk.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  ModuleTypeOjk,
  Quarter,
  CalculationMode,
} from '../entities/resiko-profile-repository-ojk.entity';

export class RiskProfileRepositoryOjkDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: ModuleTypeOjk })
  moduleType: ModuleTypeOjk;

  @ApiProperty()
  moduleName: string;

  @ApiProperty()
  year: number;

  @ApiProperty({ enum: Quarter })
  quarter: Quarter;

  // Data Section
  @ApiProperty()
  sectionId: number;

  @ApiProperty()
  no: string;

  @ApiProperty()
  sectionLabel: string;

  @ApiProperty()
  bobotSection: number;

  @ApiProperty()
  parameter: string;

  @ApiProperty({ required: false })
  sectionDescription: string | null;

  // Data Indikator
  @ApiProperty()
  subNo: string;

  @ApiProperty()
  indikator: string;

  @ApiProperty()
  bobotIndikator: number;

  // Analisis Risiko
  @ApiProperty({ required: false })
  sumberRisiko: string | null;

  @ApiProperty({ required: false })
  dampak: string | null;

  // Level Risiko
  @ApiProperty({ required: false })
  low: string | null;

  @ApiProperty({ required: false })
  lowToModerate: string | null;

  @ApiProperty({ required: false })
  moderate: string | null;

  @ApiProperty({ required: false })
  moderateToHigh: string | null;

  @ApiProperty({ required: false })
  high: string | null;

  // Metode Perhitungan
  @ApiProperty({ enum: CalculationMode })
  mode: CalculationMode;

  @ApiProperty({ required: false })
  formula: string | null;

  @ApiProperty()
  isPercent: boolean;

  // Faktor Perhitungan
  @ApiProperty({ required: false })
  pembilangLabel: string | null;

  @ApiProperty({ required: false })
  pembilangValue: number | null;

  @ApiProperty({ required: false })
  penyebutLabel: string | null;

  @ApiProperty({ required: false })
  penyebutValue: number | null;

  // Hasil
  @ApiProperty({ required: false })
  hasil: number | null;

  @ApiProperty({ required: false })
  hasilText: string | null;

  // Skor dan Bobot
  @ApiProperty()
  peringkat: number;

  @ApiProperty()
  weighted: number;

  @ApiProperty({ required: false })
  keterangan: string | null;

  // Metadata
  @ApiProperty()
  isValidated: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}