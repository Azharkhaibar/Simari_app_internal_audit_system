import { PartialType } from '@nestjs/swagger';
import { CreatePermodalanKpmrOjkDto } from './create-permodalan-kpmr-ojk.dto';

export class UpdatePermodalanKpmrOjkDto extends PartialType(CreatePermodalanKpmrOjkDto) {}
