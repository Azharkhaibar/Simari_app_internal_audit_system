// src/features/Dashboard/pages/RiskProfile/pages/Pasar/dto/kpmr-pasar.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// KPMR ASPECT DTO (Master Aspek)
// ============================================================================
export class CreateKPMRPasarAspectDto {
  @ApiProperty({ example: 2024, description: 'Tahun data' })
  @IsNotEmpty({ message: 'Tahun tidak boleh kosong' })
  @IsInt({ message: 'Tahun harus berupa angka' })
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: 'Aspek 1', description: 'Nomor aspek' })
  @IsNotEmpty({ message: 'Nomor aspek tidak boleh kosong' })
  @IsString({ message: 'Nomor aspek harus berupa string' })
  @Length(1, 50, { message: 'Nomor aspek maksimal 50 karakter' })
  aspekNo: string;

  @ApiProperty({
    example: 'Tata Kelola Risiko Pasar',
    description: 'Judul aspek',
  })
  @IsNotEmpty({ message: 'Judul aspek tidak boleh kosong' })
  @IsString({ message: 'Judul aspek harus berupa string' })
  @Length(1, 255, { message: 'Judul aspek maksimal 255 karakter' })
  aspekTitle: string;

  @ApiProperty({ example: 30, description: 'Bobot aspek dalam persen' })
  @IsNotEmpty({ message: 'Bobot aspek tidak boleh kosong' })
  @IsNumber({}, { message: 'Bobot aspek harus berupa angka' })
  @Min(0, { message: 'Bobot aspek minimal 0' })
  @Max(100, { message: 'Bobot aspek maksimal 100' })
  @Type(() => Number)
  aspekBobot: number;
}

export class UpdateKPMRPasarAspectDto {
  @ApiPropertyOptional({ example: 'Aspek 1' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  aspekNo?: string;

  @ApiPropertyOptional({ example: 'Tata Kelola Risiko Pasar' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  aspekTitle?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  aspekBobot?: number;
}

// ============================================================================
// KPMR QUESTION DTO (Master Pertanyaan)
// ============================================================================
export class CreateKPMRPasarQuestionDto {
  @ApiProperty({ example: 2024, description: 'Tahun data' })
  @IsNotEmpty({ message: 'Tahun tidak boleh kosong' })
  @IsInt({ message: 'Tahun harus berupa angka' })
  @Type(() => Number)
  year: number;

  @ApiProperty({
    example: 'Aspek 1',
    description: 'Nomor aspek yang memiliki pertanyaan ini',
  })
  @IsNotEmpty({ message: 'Nomor aspek tidak boleh kosong' })
  @IsString({ message: 'Nomor aspek harus berupa string' })
  @Length(1, 50, { message: 'Nomor aspek maksimal 50 karakter' })
  aspekNo: string;

  @ApiProperty({ example: '1', description: 'Nomor section/pertanyaan' })
  @IsNotEmpty({ message: 'Nomor section tidak boleh kosong' })
  @IsString({ message: 'Nomor section harus berupa string' })
  @Length(1, 50, { message: 'Nomor section maksimal 50 karakter' })
  sectionNo: string;

  @ApiProperty({
    example:
      'Bagaimana perumusan tingkat risiko pasar yang akan diambil?',
    description: 'Teks pertanyaan section',
  })
  @IsNotEmpty({ message: 'Judul pertanyaan tidak boleh kosong' })
  @IsString({ message: 'Judul pertanyaan harus berupa string' })
  sectionTitle: string;
}

export class UpdateKPMRPasarQuestionDto {
  @ApiPropertyOptional({ example: 'Aspek 1' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  aspekNo?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  sectionNo?: string;

  @ApiPropertyOptional({
    example:
      'Bagaimana perumusan tingkat risiko pasar yang akan diambil?',
  })
  @IsOptional()
  @IsString()
  sectionTitle?: string;
}

// ============================================================================
// KPMR DEFINITION DTO (Year-Level)
// ============================================================================
export class CreateKPMRPasarDefinitionDto {
  @ApiProperty({ example: 2024, description: 'Tahun data' })
  @IsNotEmpty({ message: 'Tahun tidak boleh kosong' })
  @IsInt({ message: 'Tahun harus berupa angka bulat' })
  @Min(2000, { message: 'Tahun minimal 2000' })
  @Max(2100, { message: 'Tahun maksimal 2100' })
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: 'Aspek 1', description: 'Nomor aspek' })
  @IsNotEmpty({ message: 'Nomor aspek tidak boleh kosong' })
  @IsString({ message: 'Nomor aspek harus berupa string' })
  @Length(1, 50, { message: 'Nomor aspek maksimal 50 karakter' })
  aspekNo: string;

  @ApiProperty({
    example: 'Tata Kelola Risiko Pasar',
    description: 'Judul aspek',
  })
  @IsNotEmpty({ message: 'Judul aspek tidak boleh kosong' })
  @IsString({ message: 'Judul aspek harus berupa string' })
  @Length(1, 255, { message: 'Judul aspek maksimal 255 karakter' })
  aspekTitle: string;

  @ApiProperty({ example: 30, description: 'Bobot aspek dalam persen' })
  @IsNotEmpty({ message: 'Bobot aspek tidak boleh kosong' })
  @IsNumber({}, { message: 'Bobot aspek harus berupa angka' })
  @Min(0, { message: 'Bobot aspek minimal 0' })
  @Max(100, { message: 'Bobot aspek maksimal 100' })
  @Type(() => Number)
  aspekBobot: number;

  @ApiProperty({ example: '1', description: 'Nomor section/pertanyaan' })
  @IsNotEmpty({ message: 'Nomor section tidak boleh kosong' })
  @IsString({ message: 'Nomor section harus berupa string' })
  @Length(1, 50, { message: 'Nomor section maksimal 50 karakter' })
  sectionNo: string;

  @ApiProperty({
    example:
      'Bagaimana perumusan tingkat risiko pasar yang akan diambil?',
    description: 'Teks pertanyaan section',
  })
  @IsNotEmpty({ message: 'Judul section tidak boleh kosong' })
  @IsString({ message: 'Judul section harus berupa string' })
  sectionTitle: string;

  @ApiPropertyOptional({ example: 'Deskripsi untuk level 1 (Strong)' })
  @IsOptional()
  @IsString()
  level1?: string;

  @ApiPropertyOptional({ example: 'Deskripsi untuk level 2 (Satisfactory)' })
  @IsOptional()
  @IsString()
  level2?: string;

  @ApiPropertyOptional({ example: 'Deskripsi untuk level 3 (Fair)' })
  @IsOptional()
  @IsString()
  level3?: string;

  @ApiPropertyOptional({ example: 'Deskripsi untuk level 4 (Marginal)' })
  @IsOptional()
  @IsString()
  level4?: string;

  @ApiPropertyOptional({ example: 'Deskripsi untuk level 5 (Unsatisfactory)' })
  @IsOptional()
  @IsString()
  level5?: string;

  @ApiPropertyOptional({ example: 'Dokumen pendukung, kebijakan, dll' })
  @IsOptional()
  @IsString()
  evidence?: string;
}

export class UpdateKPMRPasarDefinitionDto {
  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ example: 'Aspek 1' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  aspekNo?: string;

  @ApiPropertyOptional({ example: 'Tata Kelola Risiko Pasar' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  aspekTitle?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  aspekBobot?: number;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  sectionNo?: string;

  @ApiPropertyOptional({
    example:
      'Bagaimana perumusan tingkat risiko pasar yang akan diambil?',
  })
  @IsOptional()
  @IsString()
  sectionTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence?: string;
}

// ============================================================================
// KPMR SCORE DTO (Quarter-Level)
// ============================================================================
export class CreateKPMRPasarScoreDto {
  @ApiProperty({ description: 'ID definisi' })
  @IsNotEmpty({ message: 'Definition ID tidak boleh kosong' })
  @IsInt({ message: 'Definition ID harus berupa angka' })
  @Type(() => Number)
  definitionId: number;

  @ApiProperty({ example: 2024, description: 'Tahun data' })
  @IsNotEmpty({ message: 'Tahun tidak boleh kosong' })
  @IsInt({ message: 'Tahun harus berupa angka bulat' })
  @Min(2000, { message: 'Tahun minimal 2000' })
  @Max(2100, { message: 'Tahun maksimal 2100' })
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: 'Q1', description: 'Triwulan (Q1, Q2, Q3, Q4)' })
  @IsNotEmpty({ message: 'Quarter tidak boleh kosong' })
  @IsString({ message: 'Quarter harus berupa string' })
  quarter: string;

  @ApiPropertyOptional({
    example: 85,
    description: 'Skor untuk triwulan ini (0-100)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Section skor harus berupa angka' })
  @Min(0, { message: 'Skor minimal 0' })
  @Max(100, { message: 'Skor maksimal 100' })
  @Type(() => Number)
  sectionSkor?: number;
}

export class UpdateKPMRPasarScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  definitionId?: number;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ example: 'Q1' })
  @IsOptional()
  @IsString()
  quarter?: string;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  sectionSkor?: number;
}