// src/ojk/investasi/investasi-kpmr/investasi-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekInvestasi } from './entities/investasi-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanInvestasi } from './entities/investasi-kpmr-pertanyaan.entity';
import { KpmrInvestasiOjk } from './entities/investasi-kpmr-ojk.entity';
import { KpmrInvestasiController } from './investasi-kpmr-ojk.controller';
import { KpmrInvestasiService } from './investasi-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrInvestasiOjk,
      KpmrAspekInvestasi,
      KpmrPertanyaanInvestasi,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrInvestasiController],
  providers: [KpmrInvestasiService],
  exports: [KpmrInvestasiService],
})
export class InvestasiKpmrModule {}
