// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/dto/update-stratejik.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStratejikDto } from './create-stratejik.dto';

export class UpdateStratejikDto extends PartialType(CreateStratejikDto) {}
