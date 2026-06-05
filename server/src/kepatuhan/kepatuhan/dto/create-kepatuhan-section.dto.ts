// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/dto/create-kepatuhan-section.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Quarter } from '../entities/kepatuhan.entity';

export class CreateKepatuhanSectionDto {
  @ApiProperty({ example: '6.1' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  no: string;

  @ApiProperty({ example: 'Pencapaian Rencana Bisnis Perusahaan' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  parameter: string;

  @ApiProperty({ example: 10, required: false, default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bobotSection?: number = 100;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number = 0;

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

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
