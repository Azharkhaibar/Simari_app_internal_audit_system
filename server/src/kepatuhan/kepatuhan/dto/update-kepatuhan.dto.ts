// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/dto/update-kepatuhan.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateKepatuhanDto } from './create-kepatuhan.dto';

export class UpdateKepatuhanDto extends PartialType(CreateKepatuhanDto) {}
