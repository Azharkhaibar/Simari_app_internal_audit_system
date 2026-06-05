import { PartialType } from '@nestjs/swagger';
import { CreatePermodalanOjkDto } from './create-permodalan-ojk.dto';

export class UpdatePermodalanOjkDto extends PartialType(CreatePermodalanOjkDto) {}
