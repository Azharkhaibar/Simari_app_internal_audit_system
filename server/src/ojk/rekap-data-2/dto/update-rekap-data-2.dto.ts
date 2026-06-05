import { PartialType } from '@nestjs/swagger';
import { CreateRekapData2Dto } from './create-rekap-data-2.dto';

export class UpdateRekapData2Dto extends PartialType(CreateRekapData2Dto) {}
