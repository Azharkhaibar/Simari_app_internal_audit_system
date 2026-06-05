// src/ojk/reputasi/reputasi-kpmr/reputasi-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekReputasi } from './entities/reputasi-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanReputasi } from './entities/reputasi-kpmr-pertanyaan.entity';
import { KpmrReputasiOjk } from './entities/reputasi-kpmr-ojk.entity';
import { KpmrReputasiController } from './reputasi-kpmr-ojk.controller';
import { KpmrReputasiService } from './reputasi-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrReputasiOjk,
      KpmrAspekReputasi,
      KpmrPertanyaanReputasi,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrReputasiController],
  providers: [KpmrReputasiService],
  exports: [KpmrReputasiService],
})
export class ReputasiKpmrModule {}