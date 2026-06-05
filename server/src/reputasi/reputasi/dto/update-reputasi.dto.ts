// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/dto/update-reputasi.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReputasiDto } from './create-reputasi.dto';

export class UpdateReputasiDto extends PartialType(CreateReputasiDto) {}
