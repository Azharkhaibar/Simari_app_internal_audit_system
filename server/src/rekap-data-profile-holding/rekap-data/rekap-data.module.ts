// src/modules/rekap-data/rekap-data.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RekapDataController } from './rekap-data.controller';
import { RekapDataService } from './rekap-data.service';

// Import semua entity dari 8 modul
import { Investasi } from 'src/investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from 'src/pasar/pasar/entities/pasar.entity';
import { Likuiditas } from 'src/likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from 'src/operasional/operasional/entities/operasional.entity';
import { OperasionalSection } from 'src/operasional/operasional/entities/operasional-section.entity';
import { Hukum } from 'src/hukum/hukum/entities/hukum.entity';
import { HukumSection } from 'src/hukum/hukum/entities/hukum-section.entity';
import { Stratejik } from 'src/stratejik/stratejik/entities/stratejik.entity';
import { StratejikSection } from 'src/stratejik/stratejik/entities/stratejik-section.entity';
import { Kepatuhan } from 'src/kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { KepatuhanSection } from 'src/kepatuhan/kepatuhan/entities/kepatuhan-section.entity';
import { Reputasi } from 'src/reputasi/reputasi/entities/reputasi.entity';
import { ReputasiSection } from 'src/reputasi/reputasi/entities/reputasi-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Investasi,
      Pasar,
      Likuiditas,
      Operasional,
      OperasionalSection,
      Hukum,
      HukumSection,
      Stratejik,
      StratejikSection,
      Kepatuhan,
      KepatuhanSection,
      Reputasi,
      ReputasiSection,
    ]),
  ],
  controllers: [RekapDataController],
  providers: [RekapDataService],
  exports: [RekapDataService],
})
export class RekapDataModule {}
