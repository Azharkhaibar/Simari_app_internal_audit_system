import { PartialType } from '@nestjs/swagger';
import { CreateRekapData1Dto } from './create-rekap-data-1.dto';

export class UpdateRekapData1Dto extends PartialType(CreateRekapData1Dto) {}
