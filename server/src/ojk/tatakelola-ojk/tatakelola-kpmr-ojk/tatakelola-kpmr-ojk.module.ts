// src/ojk/tatakelola/tatakelola-kpmr/tatakelola-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekTatakelola } from './entities/tatakelola-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanTatakelola } from './entities/tatakelola-kpmr-pertanyaan.entity';
import { KpmrTatakelolaOjk } from './entities/tatakelola-kpmr-ojk.entity';
import { KpmrTatakelolaController } from './tatakelola-kpmr-ojk.controller';
import { TatakelolaKpmrService } from './tatakelola-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrTatakelolaOjk,
      KpmrAspekTatakelola,
      KpmrPertanyaanTatakelola,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrTatakelolaController],
  providers: [TatakelolaKpmrService],
  exports: [TatakelolaKpmrService],
})
export class TatakelolaKpmrModule {}
