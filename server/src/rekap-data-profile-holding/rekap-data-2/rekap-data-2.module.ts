// src/modules/rekap-data2/rekap-data2.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RekapData2Controller } from './rekap-data-2.controller';
import { RekapData2Service } from './rekap-data-2.service';
import { RekapData1Module } from 'src/rekap-data-profile-holding/rekap-data-1/rekap-data-1.module';

// Import entities dari 8 modul
import { Investasi } from 'src/investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from 'src/pasar/pasar/entities/pasar.entity';
import { Likuiditas } from 'src/likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from 'src/operasional/operasional/entities/operasional.entity';
import { Hukum } from 'src/hukum/hukum/entities/hukum.entity';
import { Stratejik } from 'src/stratejik/stratejik/entities/stratejik.entity';
import { Kepatuhan } from 'src/kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { Reputasi } from 'src/reputasi/reputasi/entities/reputasi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Investasi,
      Pasar,
      Likuiditas,
      Operasional,
      Hukum,
      Stratejik,
      Kepatuhan,
      Reputasi,
    ]),
    RekapData1Module,
  ],
  controllers: [RekapData2Controller],
  providers: [RekapData2Service],
  exports: [RekapData2Service],
})
export class RekapData2Module {}
