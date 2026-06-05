import { PartialType } from '@nestjs/swagger';
import { CreatePasarProdukOjkDto } from './create-pasar-produk-ojk.dto';

export class UpdatePasarProdukOjkDto extends PartialType(
  CreatePasarProdukOjkDto,
) {}
