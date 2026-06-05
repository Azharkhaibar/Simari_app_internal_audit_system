import { PartialType } from '@nestjs/swagger';
import { CreateInvestasiOjkDto } from './create-investasi-ojk.dto';

export class UpdateInvestasiOjkDto extends PartialType(
  CreateInvestasiOjkDto,
) {}

