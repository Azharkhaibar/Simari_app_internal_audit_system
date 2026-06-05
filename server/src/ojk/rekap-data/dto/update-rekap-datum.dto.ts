import { PartialType } from '@nestjs/swagger';
import { CreateRekapDatumDto } from './create-rekap-datum.dto';

export class UpdateRekapDatumDto extends PartialType(CreateRekapDatumDto) {}
