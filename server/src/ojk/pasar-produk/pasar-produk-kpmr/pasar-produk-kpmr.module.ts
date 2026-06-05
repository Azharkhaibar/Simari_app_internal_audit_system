// src/ojk/pasar-produk/pasar-produk-kpmr/pasar-produk-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekPasarProduk } from './entities/pasar-produk-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanPasarProduk } from './entities/pasar-produk-kpmr-pertanyaan.entity';
import { KpmrPasarProdukOjk } from './entities/pasar-produk-ojk.entity';
import { KpmrPasarProdukController } from './pasar-produk-kpmr.controller';
import { KpmrPasarProdukService } from './pasar-produk-kpmr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrPasarProdukOjk,
      KpmrAspekPasarProduk,
      KpmrPertanyaanPasarProduk,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrPasarProdukController],
  providers: [KpmrPasarProdukService],
  exports: [KpmrPasarProdukService],
})
export class PasarProdukKpmrModule {}