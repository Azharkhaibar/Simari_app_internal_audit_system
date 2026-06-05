import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';

export class MonthlyValueDto {
  @IsOptional()
  @IsNumber()
  num?: number | null;

  @IsOptional()
  @IsNumber()
  den?: number | null;

  @IsOptional()
  @IsNumber()
  man?: number | null;
}

export class CreateRasDto {
  @IsNotEmpty({ message: 'Tahun wajib diisi' })
  @IsNumber({}, { message: 'Tahun harus berupa angka' })
  @Type(() => Number)
  year: number;

  @IsNotEmpty({ message: 'Kategori risiko wajib diisi' })
  @IsString({ message: 'Kategori risiko harus berupa teks' })
  riskCategory: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  no?: number;

  @IsNotEmpty({ message: 'Parameter wajib diisi' }) // ✅ Wajib diisi
  @IsString({ message: 'Parameter harus berupa teks' })
  parameter: string;

  @IsOptional()
  @IsString()
  statement?: string;

  @IsOptional()
  @IsString()
  formulasi?: string;

  @IsOptional()
  @IsString()
  riskStance?: string;

  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  @IsString()
  dataTypeExplanation?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rkapTarget?: string;

  @IsOptional()
  @IsString()
  rasLimit?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasNumeratorDenominator?: boolean;

  @IsOptional()
  @IsString()
  numeratorLabel?: string;

  @IsOptional()
  @IsString()
  denominatorLabel?: string;

  @IsOptional()
  @IsObject()
  monthlyValues?: Record<
    number,
    {
      num?: number | null;
      den?: number | null;
      man?: number | null;
    }
  >;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  tindakLanjut?: any;
}
