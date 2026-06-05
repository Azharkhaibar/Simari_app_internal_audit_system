// kepatuhan-kpmr.dto.ts
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
  IsNotEmpty,
  IsIn,
  IsDate,
  IsEnum,
  IsPositive,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== ENUMS ====================
export enum QuarterEnum {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum RatingEnum {
  STRONG = 'Strong',
  SATISFACTORY = 'Satisfactory',
  FAIR = 'Fair',
  MARGINAL = 'Marginal',
  UNSATISFACTORY = 'Unsatisfactory',
}

// ==================== HELPER TRANSFORMERS ====================
const transformNumber = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (value === 'undefined' || value === 'null') {
    return undefined;
  }
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return undefined;
  }
  return num;
};

const transformQuarter = ({ value }) => {
  if (!value && value !== 0) return undefined;
  if (typeof value === 'string') {
    const upper = value.trim().toUpperCase();
    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(upper)) {
      return upper;
    }
  }
  const num = Number(value);
  if (!isNaN(num) && num >= 1 && num <= 4) {
    return `Q${num}`;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
      return `Q${parsed}`;
    }
  }
  return undefined;
};

const transformIdToString = ({ value }) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toString();
  }
  if (typeof value === 'object' && value !== null && value.id) {
    return value.id.toString();
  }
  return undefined;
};

// ==================== SUBCLASSES ====================
export class KpmrSkorDto {
  @ApiPropertyOptional({ description: 'Skor Q1', example: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(transformNumber)
  Q1?: number;

  @ApiPropertyOptional({ description: 'Skor Q2', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(transformNumber)
  Q2?: number;

  @ApiPropertyOptional({ description: 'Skor Q3', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(transformNumber)
  Q3?: number;

  @ApiPropertyOptional({ description: 'Skor Q4', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(transformNumber)
  Q4?: number;
}

export class KpmrIndicatorDto {
  @ApiPropertyOptional({
    description: 'Deskripsi untuk skor 1 (Strong)',
    example: 'Sangat baik...',
  })
  @IsOptional()
  @IsString()
  strong?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi untuk skor 2 (Satisfactory)',
    example: 'Memuaskan...',
  })
  @IsOptional()
  @IsString()
  satisfactory?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi untuk skor 3 (Fair)',
    example: 'Cukup...',
  })
  @IsOptional()
  @IsString()
  fair?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi untuk skor 4 (Marginal)',
    example: 'Marginal...',
  })
  @IsOptional()
  @IsString()
  marginal?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi untuk skor 5 (Unsatisfactory)',
    example: 'Tidak memuaskan...',
  })
  @IsOptional()
  @IsString()
  unsatisfactory?: string;
}

export class KpmrSummaryDto {
  @ApiPropertyOptional({ description: 'Total skor', example: 85.5 })
  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @ApiPropertyOptional({ description: 'Rata-rata skor', example: 3.42 })
  @IsOptional()
  @IsNumber()
  averageScore?: number;

  @ApiPropertyOptional({
    description: 'Rating',
    enum: RatingEnum,
    example: 'Fair',
  })
  @IsOptional()
  @IsEnum(RatingEnum)
  rating?: RatingEnum;

  @ApiPropertyOptional({ description: 'Tanggal perhitungan' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  computedAt?: Date;
}

// ==================== MAIN DTOs ====================
export class CreateKpmrKepatuhanOjkDto {
  @ApiProperty({ description: 'Tahun KPMR', example: 2024 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ description: 'Quarter (1-4)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(4)
  quarter: number;

  @ApiPropertyOptional({ description: 'Apakah aktif', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Dibuat oleh', example: 'admin' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Versi template', example: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Catatan tambahan',
    example: 'Initial data',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Summary data', type: KpmrSummaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => KpmrSummaryDto)
  summary?: KpmrSummaryDto;

  @ApiPropertyOptional({
    type: () => [CreateKpmrAspekKepatuhanDto],
    description: 'Daftar aspek',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKpmrAspekKepatuhanDto)
  aspekList?: CreateKpmrAspekKepatuhanDto[];
}

export class UpdateKpmrKepatuhanOjkDto {
  @ApiPropertyOptional({ description: 'Tahun KPMR', example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: 'Quarter (1-4)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiPropertyOptional({ description: 'Apakah aktif', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Summary data', type: KpmrSummaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => KpmrSummaryDto)
  summary?: KpmrSummaryDto;

  @ApiPropertyOptional({ description: 'Apakah terkunci', example: false })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Dikunci oleh', example: 'supervisor' })
  @IsOptional()
  @IsString()
  lockedBy?: string;

  @ApiPropertyOptional({ description: 'Tanggal terkunci' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lockedAt?: Date;

  @ApiPropertyOptional({
    description: 'Catatan tambahan',
    example: 'Perubahan data',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Diupdate oleh', example: 'admin' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class CreateKpmrAspekKepatuhanDto {
  @ApiPropertyOptional({ description: 'Nomor aspek', example: '1.1' })
  @IsOptional()
  @IsString()
  nomor?: string;

  @ApiProperty({
    description: 'Judul aspek',
    example: 'Governance & Leadership',
  })
  @IsString()
  @IsNotEmpty()
  judul: string;

  @ApiProperty({ description: 'Bobot aspek dalam persen', example: 25.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(transformNumber)
  bobot: number;

  @ApiPropertyOptional({
    description: 'Deskripsi aspek',
    example: 'Penilaian governance...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deskripsi?: string;

  @ApiPropertyOptional({
    description: 'ID KPMR OJK (jika bukan nested create)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  kpmrOjkId?: number;

  @ApiPropertyOptional({ description: 'Index urutan', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Skor rata-rata', example: 3.75 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  averageScore?: number;

  @ApiPropertyOptional({
    description: 'Rating',
    example: 'Fair',
    enum: RatingEnum,
  })
  @IsOptional()
  @IsEnum(RatingEnum)
  rating?: RatingEnum;

  @ApiPropertyOptional({ description: 'Diupdate oleh', example: 'admin' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Catatan', example: 'Perlu perbaikan' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: () => [CreateKpmrPertanyaanKepatuhanDto],
    description: 'Daftar pertanyaan',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKpmrPertanyaanKepatuhanDto)
  pertanyaanList?: CreateKpmrPertanyaanKepatuhanDto[];
}

export class UpdateKpmrAspekKepatuhanDto {
  @ApiPropertyOptional({ description: 'Nomor aspek', example: '1.1' })
  @IsOptional()
  @IsString()
  nomor?: string;

  @ApiPropertyOptional({
    description: 'Judul aspek',
    example: 'Governance & Leadership',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.judul !== undefined)
  judul?: string;

  @ApiPropertyOptional({
    description: 'Bobot aspek dalam persen',
    example: 25.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bobot?: number;

  @ApiPropertyOptional({
    description: 'Deskripsi aspek',
    example: 'Penilaian governance...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'Index urutan', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Skor rata-rata', example: 3.75 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  averageScore?: number;

  @ApiPropertyOptional({
    description: 'Rating',
    example: 'Fair',
    enum: RatingEnum,
  })
  @IsOptional()
  @IsEnum(RatingEnum)
  rating?: RatingEnum;

  @ApiPropertyOptional({ description: 'Diupdate oleh', example: 'admin' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Catatan', example: 'Perlu perbaikan' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateKpmrPertanyaanKepatuhanDto {
  @ApiPropertyOptional({ description: 'Nomor pertanyaan', example: '1.1.1' })
  @IsOptional()
  @IsString()
  nomor?: string;

  @ApiProperty({
    description: 'Teks pertanyaan',
    example:
      'Apakah dewan direksi memiliki komitmen terhadap manajemen risiko?',
  })
  @IsString()
  @IsNotEmpty()
  pertanyaan: string;

  @ApiPropertyOptional({ description: 'Skor per quarter' })
  @IsOptional()
  @ValidateNested()
  @Type(() => KpmrSkorDto)
  @Transform(
    ({ value }) => {
      if (!value) return {};
      const result: any = {};
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q) => {
        result[q] = value[q] ?? undefined;
      });
      return result;
    },
    { toClassOnly: true },
  )
  skor?: KpmrSkorDto;

  @ApiPropertyOptional({ description: 'Indicator/description level' })
  @IsOptional()
  @ValidateNested()
  @Type(() => KpmrIndicatorDto)
  indicator?: KpmrIndicatorDto;

  @ApiPropertyOptional({
    description: 'Evidence/bukti',
    example: 'Dokumen kebijakan...',
  })
  @IsOptional()
  @IsString()
  evidence?: string;

  @ApiPropertyOptional({
    description: 'Catatan',
    example: 'Perlu dokumen tambahan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  catatan?: string;

  @ApiPropertyOptional({ description: 'ID Aspek (jika bukan nested create)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  aspekId?: number;

  @ApiPropertyOptional({ description: 'Index urutan', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

export class UpdateKpmrPertanyaanKepatuhanDto {
  @ApiPropertyOptional({ description: 'Nomor pertanyaan', example: '1.1.1' })
  @IsOptional()
  @IsString()
  nomor?: string;

  @ApiPropertyOptional({
    description: 'Teks pertanyaan',
    example:
      'Apakah dewan direksi memiliki komitmen terhadap manajemen risiko?',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.pertanyaan !== undefined)
  pertanyaan?: string;

  @ApiPropertyOptional({ description: 'Skor per quarter' })
  @IsOptional()
  @ValidateNested()
  @Type(() => KpmrSkorDto)
  skor?: KpmrSkorDto;

  @ApiPropertyOptional({ description: 'Indicator/description level' })
  @IsOptional()
  @ValidateNested()
  @Type(() => KpmrIndicatorDto)
  indicator?: KpmrIndicatorDto;

  @ApiPropertyOptional({
    description: 'Evidence/bukti',
    example: 'Dokumen kebijakan...',
  })
  @IsOptional()
  @IsString()
  evidence?: string;

  @ApiPropertyOptional({
    description: 'Catatan',
    example: 'Perlu dokumen tambahan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  catatan?: string;

  @ApiPropertyOptional({ description: 'Index urutan', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

// ==================== FRONTEND RESPONSE DTOs ====================
export class FrontendKpmrResponseDto {
  @ApiProperty({ description: 'ID KPMR' })
  @Transform(transformIdToString)
  id: string;

  @ApiProperty({ description: 'Tahun', example: 2024 })
  year: number;

  @ApiProperty({ description: 'Quarter', example: 1 })
  quarter: number;

  @ApiPropertyOptional({ description: 'Apakah aktif', example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Apakah terkunci', example: false })
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Versi template', example: '1.0.0' })
  version?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Summary data', type: KpmrSummaryDto })
  summary?: KpmrSummaryDto;

  @ApiPropertyOptional({ description: 'Daftar aspek' })
  @Transform(({ value }) =>
    value?.map((aspek) => plainToInstance(FrontendAspekResponseDto, aspek)),
  )
  aspekList?: FrontendAspekResponseDto[];
}

export class FrontendAspekResponseDto {
  @ApiProperty({ description: 'ID Aspek' })
  @Transform(transformIdToString)
  id: string;

  @ApiPropertyOptional({ description: 'Nomor aspek', example: '1.1' })
  nomor?: string;

  @ApiProperty({ description: 'Judul aspek', example: 'Governance' })
  judul: string;

  @ApiProperty({ description: 'Bobot aspek', example: '25.5' })
  @Transform(({ value }) => value?.toString())
  bobot: string;

  @ApiPropertyOptional({ description: 'Deskripsi aspek' })
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'Index urutan', example: 0 })
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Skor rata-rata', example: 3.75 })
  averageScore?: number;

  @ApiPropertyOptional({
    description: 'Rating',
    example: 'Fair',
    enum: RatingEnum,
  })
  rating?: RatingEnum;

  @ApiPropertyOptional({ description: 'Daftar pertanyaan' })
  @Transform(({ value }) =>
    value?.map((q) => plainToInstance(FrontendPertanyaanResponseDto, q)),
  )
  pertanyaanList?: FrontendPertanyaanResponseDto[];
}

export class FrontendPertanyaanResponseDto {
  @ApiProperty({ description: 'ID Pertanyaan' })
  @Transform(transformIdToString)
  id: string;

  @ApiPropertyOptional({ description: 'Nomor pertanyaan', example: '1.1.1' })
  nomor?: string;

  @ApiProperty({ description: 'Pertanyaan' })
  pertanyaan: string;

  @ApiPropertyOptional({ description: 'Skor per quarter' })
  @Transform(({ value }) => ({
    Q1: value?.Q1 ?? undefined,
    Q2: value?.Q2 ?? undefined,
    Q3: value?.Q3 ?? undefined,
    Q4: value?.Q4 ?? undefined,
  }))
  skor?: {
    Q1?: number;
    Q2?: number;
    Q3?: number;
    Q4?: number;
  };

  @ApiPropertyOptional({
    description: 'Indicator/description level',
    type: KpmrIndicatorDto,
  })
  indicator?: KpmrIndicatorDto;

  @ApiPropertyOptional({ description: 'Evidence/bukti' })
  evidence?: string;

  @ApiPropertyOptional({ description: 'Catatan' })
  catatan?: string;

  @ApiPropertyOptional({ description: 'Index urutan', example: 0 })
  orderIndex?: number;
}

// ==================== REORDER DTOs ====================
export class ReorderAspekDto {
  @ApiProperty({ description: 'Array ID aspek dalam urutan baru' })
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  aspekIds: number[];
}

export class ReorderPertanyaanDto {
  @ApiProperty({ description: 'Array ID pertanyaan dalam urutan baru' })
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  pertanyaanIds: number[];
}

// ==================== SKOR DTOs ====================
export class UpdateSkorDto {
  @ApiProperty({ description: 'Quarter yang diupdate', example: 'Q1' })
  @IsString()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  @Transform(transformQuarter)
  quarter: string;

  @ApiProperty({ description: 'Nilai skor (1-5)', example: 4 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(transformNumber)
  skor: number;

  @ApiPropertyOptional({ description: 'Diupdate oleh', example: 'reviewer' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class SkorUpdateItemDto {
  @ApiProperty({ description: 'ID Pertanyaan' })
  @IsInt()
  @IsPositive()
  pertanyaanId: number;

  @ApiProperty({ description: 'Quarter', example: 'Q1' })
  @IsString()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  @Transform(transformQuarter)
  quarter: string;

  @ApiProperty({ description: 'Nilai skor' })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(transformNumber)
  skor: number;
}

export class BulkUpdateSkorDto {
  @ApiProperty({ type: () => [SkorUpdateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkorUpdateItemDto)
  updates: SkorUpdateItemDto[];
}

// ==================== SUMMARY DTO ====================
export class UpdateSummaryDto {
  @ApiPropertyOptional({ description: 'Total skor', example: 85.5 })
  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @ApiPropertyOptional({ description: 'Rata-rata skor', example: 3.42 })
  @IsOptional()
  @IsNumber()
  averageScore?: number;

  @ApiPropertyOptional({
    description: 'Rating',
    enum: RatingEnum,
    example: 'Fair',
  })
  @IsOptional()
  @IsEnum(RatingEnum)
  rating?: RatingEnum;

  @ApiPropertyOptional({ description: 'Tanggal perhitungan' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  computedAt?: Date;
}