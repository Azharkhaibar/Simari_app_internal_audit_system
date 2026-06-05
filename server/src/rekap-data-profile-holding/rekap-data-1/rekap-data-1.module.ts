// src/rekap-data-1/rekap-data-1.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RekapData1Controller } from './rekap-data-1.controller';
import { RekapData1Service } from './rekap-data-1.service';

// Entities sendiri
import { BhzConfig } from './entities/bhz-config.entity';
import { BvtConfig } from './entities/bvt-config.entity';
import { RekapResult } from './entities/rekap-result.entity';

// Entities dari 8 modul
import { Investasi } from '../../investasi/new-investasi/entities/new-investasi.entity';
import { KPMRScore as KPMRInvestasiScore } from '../../investasi/kpmr-investasi/entities/kpmr-investasi-skor.entity';
import { KPMRDefinition as KPMRInvestasiDefinition } from '../../investasi/kpmr-investasi/entities/kpmr-investasi-definisi.entity';

import { Pasar } from '../../pasar/pasar/entities/pasar.entity';
import { KPMRPasarScore } from '../../pasar/kpmr-pasar/entities/kpmr-pasar-skor.entity';
import { KPMRPasarDefinition } from '../../pasar/kpmr-pasar/entities/kpmr-pasar-definisi.entity';

import { Likuiditas } from '../../likuiditas/likuiditas/entities/likuiditas.entity';
import { KPMRLikuiditasScore } from '../../likuiditas/kpmr-likuiditas/entities/kpmr-likuiditas-skor.entity';
import { KPMRLikuiditasDefinition } from '../../likuiditas/kpmr-likuiditas/entities/kpmr-likuiditas-definisi.entity';

import { Operasional } from '../../operasional/operasional/entities/operasional.entity';
import { KPMROperasionalScore } from '../../operasional/kpmr-operasional/entities/kpmr-operasional-skor.entity';
import { KPMROperasionalDefinition } from '../../operasional/kpmr-operasional/entities/kpmr-operasional-definisi.entity';

import { Hukum } from '../../hukum/hukum/entities/hukum.entity';
import { KPMRHukumScore } from '../../hukum/kpmr-hukum/entities/kpmr-hukum-skor.entity';
import { KPMRHukumDefinition } from '../../hukum/kpmr-hukum/entities/kpmr-hukum-definisi.entity';

import { Stratejik } from '../../stratejik/stratejik/entities/stratejik.entity';
import { KPMRStratejikScore } from '../../stratejik/kpmr-stratejik/entities/kpmr-stratejik-skor.entity';
import { KPMRStratejikDefinition } from '../../stratejik/kpmr-stratejik/entities/kpmr-stratejik-definisi.entity';

import { Kepatuhan } from '../../kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { KPMRKepatuhanScore } from '../../kepatuhan/kpmr-kepatuhan/entities/kpmr-kepatuhan-skor.entity';
import { KPMRKepatuhanDefinition } from '../../kepatuhan/kpmr-kepatuhan/entities/kpmr-kepatuhan-definisi.entity';

import { Reputasi } from '../../reputasi/reputasi/entities/reputasi.entity';
import { KPMRReputasiScore } from '../../reputasi/kpmr-reputasi/entities/kpmr-reputasi-skor.entity';
import { KPMRReputasiDefinition } from '../../reputasi/kpmr-reputasi/entities/kpmr-reputasi-definisi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entities sendiri
      BhzConfig,
      BvtConfig,
      RekapResult,

      // Entities modul Investasi
      Investasi,
      KPMRInvestasiScore,
      KPMRInvestasiDefinition,

      // Entities modul Pasar
      Pasar,
      KPMRPasarScore,
      KPMRPasarDefinition,

      // Entities modul Likuiditas
      Likuiditas,
      KPMRLikuiditasScore,
      KPMRLikuiditasDefinition,

      // Entities modul Operasional
      Operasional,
      KPMROperasionalScore,
      KPMROperasionalDefinition,

      // Entities modul Hukum
      Hukum,
      KPMRHukumScore,
      KPMRHukumDefinition,

      // Entities modul Stratejik
      Stratejik,
      KPMRStratejikScore,
      KPMRStratejikDefinition,

      // Entities modul Kepatuhan
      Kepatuhan,
      KPMRKepatuhanScore,
      KPMRKepatuhanDefinition,

      // Entities modul Reputasi
      Reputasi,
      KPMRReputasiScore,
      KPMRReputasiDefinition,
    ]),
  ],
  controllers: [RekapData1Controller],
  providers: [RekapData1Service],
  exports: [RekapData1Service],
})
export class RekapData1Module {}
