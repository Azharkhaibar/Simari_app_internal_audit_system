import { PartialType } from '@nestjs/swagger';
import { CreateRingkasanDto } from './create-ringkasan.dto';

export class UpdateRingkasanDto extends PartialType(CreateRingkasanDto) {}
