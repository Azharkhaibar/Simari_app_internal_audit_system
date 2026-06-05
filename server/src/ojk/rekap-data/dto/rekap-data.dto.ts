import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// ==================== ENUMS ====================
export const VALID_CATEGORIES = [
  'pasar-produk',
  'likuiditas-produk',
  'kredit-produk',
  'konsentrasi-produk',
  'operasional',
  'hukum-regulatory',
  'kepatuhan-regulatory',
  'reputasi-regulatory',
  'strategis-regulatory',
  'investasi-regulatory',
  'rentabilitas-regulatory',
  'permodalan-regulatory',
  'tatakelola-regulatory',
] as const;

export type CategoryId = (typeof VALID_CATEGORIES)[number];

// ==================== QUERY DTO ====================
export class GetAllRekapDto {
  @ApiPropertyOptional({ description: 'Filter by year', example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Transform(({ value }) => parseInt(value, 10))
  year?: number;

  @ApiPropertyOptional({ description: 'Filter by quarter (1-4)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Transform(({ value }) => parseInt(value, 10))
  quarter?: number;

  @ApiPropertyOptional({
    description: 'Filter by categories',
    example: ['operasional', 'investasi-regulatory'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Search by judul or nomor',
    example: 'Reksa Dana',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by model', example: 'open_end' })
  @IsOptional()
  @IsString()
  @IsIn(['', 'tanpa_model', 'open_end', 'terstruktur'])
  model?: string;

  @ApiPropertyOptional({ description: 'Filter by prinsip', example: 'syariah' })
  @IsOptional()
  @IsString()
  @IsIn(['', 'syariah', 'konvensional'])
  prinsip?: string;

  @ApiPropertyOptional({ description: 'Filter by jenis', example: 'saham' })
  @IsOptional()
  @IsString()
  jenis?: string;

  @ApiPropertyOptional({
    description: 'Filter by underlying (comma separated)',
    example: 'indeks,obligasi',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());
    return value;
  })
  underlying?: string[];
}

// ==================== DTO UNTUK UPDATE NILAI ====================
export class UpdateNilaiValueDto {
  @ApiProperty({ description: 'Category ID', example: 'operasional' })
  @IsString()
  @IsIn(VALID_CATEGORIES)
  categoryId: CategoryId;

  @ApiProperty({ description: 'Parameter ID' })
  @IsInt()
  @Min(1)
  paramId: number;

  @ApiProperty({ description: 'Nilai/Item ID' })
  @IsInt()
  @Min(1)
  itemId: number;

  @ApiPropertyOptional({ description: 'Value untuk Tanpa Faktor' })
  @IsOptional()
  value?: string | number | null;

  @ApiPropertyOptional({ description: 'Value pembilang untuk Satu/Dua Faktor' })
  @IsOptional()
  valuePembilang?: string | number | null;

  @ApiPropertyOptional({ description: 'Value penyebut untuk Dua Faktor' })
  @IsOptional()
  valuePenyebut?: string | number | null;
}

// ==================== RESPONSE DTO ====================
export class RekapParameterResponseDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category Label' })
  categoryLabel: string;

  @ApiProperty({ description: 'Parameter ID' })
  id: number;

  @ApiProperty({ description: 'Year' })
  year: number;

  @ApiProperty({ description: 'Quarter' })
  quarter: number;

  @ApiProperty({ description: 'Nomor parameter' })
  nomor: string;

  @ApiProperty({ description: 'Judul parameter' })
  judul: string;

  @ApiProperty({ description: 'Bobot parameter' })
  bobot: number;

  @ApiProperty({ description: 'Kategori (model, prinsip, jenis, underlying)' })
  kategori: {
    model?: string;
    prinsip?: string;
    jenis?: string;
    underlying?: string[];
  };

  @ApiProperty({ description: 'Order index' })
  orderIndex: number;

  @ApiProperty({ description: 'Nilai list' })
  nilaiList: RekapNilaiResponseDto[];
}

export class RekapNilaiResponseDto {
  @ApiProperty({ description: 'Nilai ID' })
  id: number;

  @ApiProperty({ description: 'Nomor nilai' })
  nomor: string;

  @ApiProperty({ description: 'Bobot nilai' })
  bobot: number;

  @ApiProperty({ description: 'Portofolio' })
  portofolio: string;

  @ApiProperty({ description: 'Keterangan' })
  keterangan: string;

  @ApiProperty({ description: 'Judul nilai (type, text, value, dll)' })
  judul: {
    type?: string;
    text?: string;
    value?: string | number | null;
    pembilang?: string;
    valuePembilang?: string | number | null;
    penyebut?: string;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };

  @ApiProperty({ description: 'Risk indicator' })
  riskindikator?: {
    low?: string;
    lowToModerate?: string;
    moderate?: string;
    moderateToHigh?: string;
    high?: string;
  };

  @ApiProperty({ description: 'Order index' })
  orderIndex: number;
}

export class RekapDataResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Data grouped by category' })
  data: Record<string, RekapParameterResponseDto[]>;

  @ApiProperty({ description: 'Total categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Total parameters' })
  totalParameters: number;

  @ApiProperty({ description: 'Message' })
  message: string;
}

export class UpdateNilaiResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Updated data' })
  data?: RekapNilaiResponseDto;

  @ApiProperty({ description: 'Message' })
  message: string;
}
