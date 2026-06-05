// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/dto/update-stratejik-section.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateStratejikSectionDto } from './create-stratejik-section.dto';

export class UpdateStratejikSectionDto extends PartialType(
  CreateStratejikSectionDto,
) {}
