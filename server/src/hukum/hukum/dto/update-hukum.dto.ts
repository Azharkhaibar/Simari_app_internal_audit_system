// src/features/Dashboard/pages/RiskProfile/pages/Hukum/dto/update-hukum.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateHukumDto } from './create-hukum.dto';

export class UpdateHukumDto extends PartialType(CreateHukumDto) {}
