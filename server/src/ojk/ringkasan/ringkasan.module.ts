// ringkasan/ringkasan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RingkasanController } from './ringkasan.controller';
import { RingkasanService } from './ringkasan.service';

// operasional-ojk
import { Operasional } from '../operasional-ojk/operasional-ojk/entities/operasional-ojk.entity';
import { OperasionalParameter } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-parameter.entity';
import { OperasionalNilai } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-nilai.entity';

// hukum-ojk
import { HukumOjk } from '../hukum-ojk/hukum-ojk/entities/hukum-ojk.entity';
import { HukumParameter } from '../hukum-ojk/hukum-ojk/entities/hukum-paramater.entity';
import { HukumNilai } from '../hukum-ojk/hukum-ojk/entities/hukum-nilai.entity';

// investasi-ojk
import { Investasi } from '../investasi-ojk/investasi-ojk/entities/investasi-ojk.entity';
import { InvestasiParameter } from '../investasi-ojk/investasi-ojk/entities/investasi-produk-parameter.entity';
import { InvestasiNilai } from '../investasi-ojk/investasi-ojk/entities/investasi-produk-nilai.entity';

// kepatuhan-ojk
import { KepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-ojk.entity';
import { KepatuhanParameter } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-paramater.entity';
import { KepatuhanNilai } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-nilai.entity';

// konsentrasi-produk
import { KonsentrasiProdukOjk } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-ojk.entity';
import { KonsentrasiParameter } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-paramter.entity';
import { KonsentrasiNilai } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-nilai.entity';

// kredit-produk
import { Kredit } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-ojk.entity';
import { KreditParameter } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-parameter.entity';
import { KreditNilai } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-nilai.entity';

// likuiditas-produk
import { Likuiditas } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-ojk.entity';
import { LikuiditasParameter } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-parameter.entity';
import { LikuiditasNilai } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-nilai.entity';

// pasar-produk
import { PasarProduk } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-ojk.entity';
import { PasarProdukParameter } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-parameter.entity';
import { PasarProdukNilai } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-nilai.entity';

// permodalan-ojk
import { Permodalan } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-ojk.entity';
import { PermodalanParameter } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-produk-parameter.entity';
import { PermodalanNilai } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-produk-nilai.entity';

// rentabilitas-ojk
import { Rentabilitas } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-ojk.entity';
import { RentabilitasParameter } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-parameter.entity';
import { RentabilitasNilai } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-nilai.entity';

// reputasi-ojk
import { Reputasi } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-ojk.entity';
import { ReputasiParameter } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-parameter.entity';
import { ReputasiNilai } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-nilai.entity';

// strategis-ojk
import { Strategis } from '../strategis-ojk/strategis-ojk/entities/strategis-ojk.entity';
import { StrategisParameter } from '../strategis-ojk/strategis-ojk/entities/strategis-parameter.entity';
import { StrategisNilai } from '../strategis-ojk/strategis-ojk/entities/strategis-nilai.entity';

// tatakelola-ojk
import { Tatakelola } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-ojk.entity';
import { TatakelolaParameter } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-produk-parameter.entity';
import { TatakelolaNilai } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-produk-nilai.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Operasional,
      OperasionalParameter,
      OperasionalNilai,

      HukumOjk,
      HukumParameter,
      HukumNilai,

      Investasi,
      InvestasiParameter,
      InvestasiNilai,

      KepatuhanOjk,
      KepatuhanParameter,
      KepatuhanNilai,

      KonsentrasiProdukOjk,
      KonsentrasiParameter,
      KonsentrasiNilai,

      Kredit,
      KreditParameter,
      KreditNilai,

      Likuiditas,
      LikuiditasParameter,
      LikuiditasNilai,

      PasarProduk,
      PasarProdukParameter,
      PasarProdukNilai,

      Permodalan,
      PermodalanParameter,
      PermodalanNilai,

      Rentabilitas,
      RentabilitasParameter,
      RentabilitasNilai,

      Reputasi,
      ReputasiParameter,
      ReputasiNilai,

      Strategis,
      StrategisParameter,
      StrategisNilai,

      Tatakelola,
      TatakelolaParameter,
      TatakelolaNilai,
    ]),
  ],
  controllers: [RingkasanController],
  providers: [RingkasanService],
  exports: [RingkasanService],
})
export class RingkasanOjkModule {}
