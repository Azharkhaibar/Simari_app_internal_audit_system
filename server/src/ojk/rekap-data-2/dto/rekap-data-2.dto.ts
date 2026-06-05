// rekap-data.dto.ts
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== REQUEST DTO ====================
export class RekapDataQueryDto {
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
// Frontend expect: json.map(item => ({ id, nama, inherentSummary, kpmrSummary }))
export class CategorySummaryDto {
  @ApiProperty({ description: 'ID kategori', example: 'operasional' })
  id: string;

  @ApiProperty({ description: 'Nama kategori', example: 'Operasional' })
  nama: string;

  @ApiProperty({
    description:
      'Nilai inherent risk (dari summary.totalWeighted atau hasil hitung)',
    example: 2.8,
  })
  inherentSummary: number;

  @ApiProperty({
    description: 'Nilai KPMR (dari summary.averageScore atau hasil hitung)',
    example: 3.2,
  })
  kpmrSummary: number;
}
