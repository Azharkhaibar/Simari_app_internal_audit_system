import { PartialType } from '@nestjs/swagger';
import { CreatePeringkatKompositDto } from './create-peringkat-komposit.dto';

export class UpdatePeringkatKompositDto extends PartialType(CreatePeringkatKompositDto) {}
