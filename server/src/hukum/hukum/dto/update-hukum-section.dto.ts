// src/features/Dashboard/pages/RiskProfile/pages/Hukum/dto/update-hukum-section.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateHukumSectionDto } from './create-hukum-section.dto';

export class UpdateHukumSectionDto extends PartialType(CreateHukumSectionDto) {}
