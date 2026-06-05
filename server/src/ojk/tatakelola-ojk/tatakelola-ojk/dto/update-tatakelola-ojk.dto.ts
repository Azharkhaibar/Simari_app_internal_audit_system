import { PartialType } from '@nestjs/swagger';
import { CreateTatakelolaOjkDto } from './create-tatakelola-ojk.dto';

export class UpdateTatakelolaOjkDto extends PartialType(CreateTatakelolaOjkDto) {}
