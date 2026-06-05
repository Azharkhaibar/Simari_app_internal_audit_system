// kredit-produk-kpmr-ojk.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekKredit } from './entities/kredit-kpmr-aspek.entity';
import { KpmrPertanyaanKredit } from './entities/kredit-kpmr-pertanyaan.entity';
import { KpmrKreditOjk } from './entities/kredit-produk-kpmr-ojk.entity';
import { KpmrKreditProdukController } from './kredit-produk-kpmr.controller';
import { KpmrKreditProdukService } from './kredit-produk-kpmr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrKreditOjk,
      KpmrAspekKredit,
      KpmrPertanyaanKredit,
    ]),
  ],
  controllers: [KpmrKreditProdukController],
  providers: [KpmrKreditProdukService],
  exports: [KpmrKreditProdukService],
})
export class KreditProdukKpmrModule {}