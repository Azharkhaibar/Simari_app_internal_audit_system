// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/dto/update-reputasi-section.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateReputasiSectionDto } from './create-reputasi-section.dto';

export class UpdateReputasiSectionDto extends PartialType(
  CreateReputasiSectionDto,
) {}
