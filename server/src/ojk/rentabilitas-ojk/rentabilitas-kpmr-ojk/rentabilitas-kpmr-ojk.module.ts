// src/ojk/rentabilitas/rentabilitas-kpmr/rentabilitas-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekRentabilitas } from './entities/rentabilitas-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanRentabilitas } from './entities/rentabilitas-kpmr-pertanyaan.entity';
import { KpmrRentabilitasOjk } from './entities/rentabilitas-kpmr-ojk.entity';
import { KpmrRentabilitasController } from './rentabilitas-kpmr-ojk.controller';
import { KpmrRentabilitasService } from './rentabilitas-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrRentabilitasOjk,
      KpmrAspekRentabilitas,
      KpmrPertanyaanRentabilitas,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrRentabilitasController],
  providers: [KpmrRentabilitasService],
  exports: [KpmrRentabilitasService],
})
export class RentabilitasKpmrModule {}
