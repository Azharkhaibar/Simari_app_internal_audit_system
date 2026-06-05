// peringkat-komposit.dto.ts
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ==================== REQUEST DTO ====================
export class PeringkatKompositQueryDto {
  @ApiProperty({ description: 'Tahun data', example: 2024 })
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiProperty({ description: 'Quarter (1-4)', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;
}

// ==================== RESPONSE DTO ====================
export class PeringkatKompositItemDto {
  @ApiProperty({ description: 'ID kategori', example: 'operasional' })
  id: string;

  @ApiProperty({ description: 'Nama kategori', example: 'Operasional' })
  nama: string;

  @ApiProperty({ description: 'Nilai inherent risk (summary.totalWeighted)', example: 2.8 })
  inherentSummary: number;

  @ApiProperty({ description: 'Nilai KPMR (summary.averageScore)', example: 3.2 })
  kpmrSummary: number;
}