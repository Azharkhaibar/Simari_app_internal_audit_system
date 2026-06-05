// src/rekap/dto/rekap-data1.dto.ts
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetRekapData1Dto {
  @ApiPropertyOptional({ description: 'Tahun', example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Transform(({ value }) => parseInt(value, 10))
  year?: number;

  @ApiPropertyOptional({ description: 'Quarter (1-4)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Transform(({ value }) => parseInt(value, 10))
  quarter?: number;
}

export class KategoriSummaryDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category Label' })
  nama: string;

  @ApiProperty({ description: 'Inherent risk summary (0-5)' })
  inherentSummary: number;

  @ApiProperty({ description: 'KPMR average score (0-5)' })
  kpmrSummary: number;
}

export class RekapData1ResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({
    description: 'Summary data per category',
    type: [KategoriSummaryDto],
  })
  data: KategoriSummaryDto[];

  @ApiProperty({ description: 'Total categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Message' })
  message: string;
}