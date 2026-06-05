// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/dto/update-kepatuhan-section.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateKepatuhanSectionDto } from './create-kepatuhan-section.dto';

export class UpdateKepatuhanSectionDto extends PartialType(
  CreateKepatuhanSectionDto,
) {}
