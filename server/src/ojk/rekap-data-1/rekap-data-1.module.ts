// src/rekap/rekap-data1.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// operasional-ojk
import { Operasional } from '../operasional-ojk/operasional-ojk/entities/operasional-ojk.entity';
import { OperasionalParameter } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-parameter.entity';
import { OperasionalNilai } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-nilai.entity';
import { KpmrOperasionalOjk } from '../operasional-ojk/operasional-kpmr-ojk/entities/operasional-kpmr-ojk.entity';
import { KpmrAspekOperasional } from '../operasional-ojk/operasional-kpmr-ojk/entities/operasional-kpmr-aspek.entity';
import { KpmrPertanyaanOperasional } from '../operasional-ojk/operasional-kpmr-ojk/entities/operasional-kpmr-pertanyaan.entity';

// hukum-ojk
import { HukumOjk } from '../hukum-ojk/hukum-ojk/entities/hukum-ojk.entity';
import { KpmrHukumOjk } from '../hukum-ojk/hukum-kpmr-ojk/entities/hukum-kpmr-ojk.entity';

// investasi-ojk
import { Investasi } from '../investasi-ojk/investasi-ojk/entities/investasi-ojk.entity';
import { KpmrInvestasiOjk } from '../investasi-ojk/investasi-kpmr-ojk/entities/investasi-kpmr-ojk.entity';

// kepatuhan-ojk
import { KepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-ojk.entity';
import { KpmrKepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-kpmr-ojk/entities/kepatuhan-kpmr-ojk.entity';

// konsentrasi-produk
import { KonsentrasiProdukOjk } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-ojk.entity';
import { KpmrKonsentrasiOjk } from '../konsentrasi-produk/konsentrasi-produk-kpmr/entities/konsentrasi-produk-kpmr-ojk.entity';

// kredit-produk
import { Kredit } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-ojk.entity';
import { KpmrKreditOjk } from '../kredit-produk/kredit-produk-kpmr/entities/kredit-produk-kpmr-ojk.entity';

// likuiditas-produk
import { Likuiditas } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-ojk.entity';
import { KpmrLikuiditasProdukOjk } from '../likuiditas-produk/likuiditas-produk-kpmr/entities/likuiditas-produk-kpmr-ojk.entity';

// pasar-produk
import { PasarProduk } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-ojk.entity';
import { KpmrPasarProdukOjk } from '../pasar-produk/pasar-produk-kpmr/entities/pasar-produk-ojk.entity';

// permodalan-ojk
import { Permodalan } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-ojk.entity';
import { KpmrPermodalanOjk } from '../permodalan-ojk/permodalan-kpmr-ojk/entities/permodalan-kpmr-ojk.entity';

// rentabilitas-ojk
import { Rentabilitas } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-ojk.entity';
import { KpmrRentabilitasOjk } from '../rentabilitas-ojk/rentabilitas-kpmr-ojk/entities/rentabilitas-kpmr-ojk.entity';

// reputasi-ojk
import { Reputasi } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-ojk.entity';
import { KpmrReputasiOjk } from '../reputasi-ojk/reputasi-kpmr-ojk/entities/reputasi-kpmr-ojk.entity';

// strategis-ojk
import { Strategis } from '../strategis-ojk/strategis-ojk/entities/strategis-ojk.entity';
import { KpmrStrategisOjk } from '../strategis-ojk/strategis-kpmr-ojk/entities/strategis-kpmr-ojk.entity';

// tatakelola-ojk
import { Tatakelola } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-ojk.entity';
import { KpmrTatakelolaOjk } from '../tatakelola-ojk/tatakelola-kpmr-ojk/entities/tatakelola-kpmr-ojk.entity';

import { RekapData1Controller } from './rekap-data-1.controller';
import { RekapData1Service } from './rekap-data-1.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Operasional,
      OperasionalParameter,
      OperasionalNilai,
      KpmrOperasionalOjk,
      KpmrAspekOperasional,
      KpmrPertanyaanOperasional,

      HukumOjk,
      KpmrHukumOjk,

      Investasi,
      KpmrInvestasiOjk,

      KepatuhanOjk,
      KpmrKepatuhanOjk,

      KonsentrasiProdukOjk,
      KpmrKonsentrasiOjk,

      Kredit,
      KpmrKreditOjk,

      Likuiditas,
      KpmrLikuiditasProdukOjk,

      PasarProduk,
      KpmrPasarProdukOjk,

      Permodalan,
      KpmrPermodalanOjk,

      Rentabilitas,
      KpmrRentabilitasOjk,

      Reputasi,
      KpmrReputasiOjk,

      Strategis,
      KpmrStrategisOjk,

      Tatakelola,
      KpmrTatakelolaOjk,
    ]),
  ],
  controllers: [RekapData1Controller],
  providers: [RekapData1Service],
  exports: [RekapData1Service],
})
export class RekapData1OjkModule {}
