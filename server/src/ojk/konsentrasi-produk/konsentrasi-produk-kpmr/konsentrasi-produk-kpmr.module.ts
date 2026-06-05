import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekKonsentrasi } from './entities/konsentrasi-kpmr-aspek.entity';
import { KpmrPertanyaanKonsentrasi } from './entities/konsentrasi-kpmr-pertanyaan.entity';
import { KpmrKonsentrasiOjk } from './entities/konsentrasi-produk-kpmr-ojk.entity';
import { KonsentrasiKpmrController } from './konsentrasi-produk-kpmr.controller';
import { KonsentrasiKpmrService } from './konsentrasi-produk-kpmr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpmrKonsentrasiOjk,
      KpmrAspekKonsentrasi,
      KpmrPertanyaanKonsentrasi,
    ]),
  ],
  controllers: [KonsentrasiKpmrController],
  providers: [KonsentrasiKpmrService],
  exports: [KonsentrasiKpmrService],
})
export class KonsentrasiKpmrModule {}