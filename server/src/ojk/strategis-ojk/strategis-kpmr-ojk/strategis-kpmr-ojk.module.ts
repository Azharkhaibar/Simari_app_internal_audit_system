// src/ojk/strategis/strategis-kpmr/strategis-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekStrategis } from './entities/strategis-kpmr-aspek.entity'; // IMPORT DARI FILE TERPISAH
import { KpmrPertanyaanStrategis } from './entities/strategis-kpmr-pertanyaan.entity';
import { KpmrStrategisOjk } from './entities/strategis-kpmr-ojk.entity';
import { KpmrStrategisController } from './strategis-kpmr-ojk.controller';
import { KpmrStrategisService } from './strategis-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrStrategisOjk,
      KpmrAspekStrategis,
      KpmrPertanyaanStrategis,
      // ✅ HAPUS: PasarProdukKpmrModule - ini menyebabkan circular dependency
    ]),
  ],
  controllers: [KpmrStrategisController],
  providers: [KpmrStrategisService],
  exports: [KpmrStrategisService],
})
export class StrategisKpmrModule {}
