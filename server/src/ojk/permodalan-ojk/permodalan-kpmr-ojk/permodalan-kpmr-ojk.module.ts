// src/ojk/permodalan/permodalan-kpmr/permodalan-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekPermodalan } from './entities/permodalan-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanPermodalan } from './entities/permodalan-kpmr-pertanyaan.entity';
import { KpmrPermodalanOjk } from './entities/permodalan-kpmr-ojk.entity';
import { KpmrPermodalanController } from './permodalan-kpmr-ojk.controller';
import { KpmrPermodalanService } from './permodalan-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrPermodalanOjk,
      KpmrAspekPermodalan,
      KpmrPertanyaanPermodalan,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrPermodalanController],
  providers: [KpmrPermodalanService],
  exports: [KpmrPermodalanService],
})
export class PermodalanKpmrModule {}
