// src/ojk/likuiditas/likuiditas-kpmr/likuiditas-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekLikuiditasProduk } from './entities/likuiditas-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanLikuiditasProduk } from './entities/likuiditas-kpmr-pertanyaan.entity';
import { KpmrLikuiditasProdukOjk } from './entities/likuiditas-produk-kpmr-ojk.entity';
import { KpmrLikuiditasController } from './likuiditas-produk-kpmr.controller';
import { KpmrLikuiditasProdukService } from './likuiditas-produk-kpmr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrLikuiditasProdukOjk,
      KpmrAspekLikuiditasProduk,
      KpmrPertanyaanLikuiditasProduk,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrLikuiditasController],
  providers: [KpmrLikuiditasProdukService],
  exports: [KpmrLikuiditasProdukService],
})
export class LikuiditasKpmrModule {}