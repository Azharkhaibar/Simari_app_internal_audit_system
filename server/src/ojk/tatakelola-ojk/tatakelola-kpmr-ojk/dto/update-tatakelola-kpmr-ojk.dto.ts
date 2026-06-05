import { PartialType } from '@nestjs/swagger';
import { CreateTatakelolaKpmrOjkDto } from './create-tatakelola-kpmr-ojk.dto';

export class UpdateTatakelolaKpmrOjkDto extends PartialType(CreateTatakelolaKpmrOjkDto) {}
