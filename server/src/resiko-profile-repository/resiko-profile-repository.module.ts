// src/resiko-profile-repository/resiko-profile-repository.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ResikoProfileRepositoryService } from './resiko-profile-repository.service';

import { ResikoProfileRepositoryController } from './resiko-profile-repository.controller';
import { RiskProfileRepositoryView } from './entities/resiko-profile-repository.entity';

// Import repositories for each module

import { ResikoProfileRepositoryService } from './resiko-profile-repository.service';
import { KepatuhanSection } from 'src/kepatuhan/kepatuhan/entities/kepatuhan-section.entity';
import { Kepatuhan } from 'src/kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { Investasi } from 'src/investasi/new-investasi/entities/new-investasi.entity';
import { InvestasiSection } from 'src/investasi/new-investasi/entities/new-investasi-section.entity';
import { Likuiditas } from 'src/likuiditas/likuiditas/entities/likuiditas.entity';
import { LikuiditasSection } from 'src/likuiditas/likuiditas/entities/likuiditas-section.entity';
import { Operasional } from 'src/operasional/operasional/entities/operasional.entity';
import { OperasionalSection } from 'src/operasional/operasional/entities/operasional-section.entity';
import { Hukum } from 'src/hukum/hukum/entities/hukum.entity';
import { HukumSection } from 'src/hukum/hukum/entities/hukum-section.entity';
// PERBAIKAN: Strategik -> Stratejik
import { Stratejik } from 'src/stratejik/stratejik/entities/stratejik.entity';
import { StratejikSection } from 'src/stratejik/stratejik/entities/stratejik-section.entity';
import { Reputasi } from 'src/reputasi/reputasi/entities/reputasi.entity';
import { ReputasiSection } from 'src/reputasi/reputasi/entities/reputasi-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // View Entity for consolidated data
      RiskProfileRepositoryView,

      // Individual module entities (for fallback queries if view doesn't work)
      KepatuhanSection,
      Kepatuhan,
      Investasi,
      InvestasiSection,
      Likuiditas,
      LikuiditasSection,
      Operasional,
      OperasionalSection,
      Hukum,
      HukumSection,
      // PERBAIKAN: Strategik -> Stratejik
      Stratejik,
      StratejikSection,
      // PERBAIKAN: Hapus duplikasi Kepatuhan & KepatuhanSection
      Reputasi,
      ReputasiSection,
    ]),
  ],
  controllers: [ResikoProfileRepositoryController],
  providers: [ResikoProfileRepositoryService],
  exports: [ResikoProfileRepositoryService],
})
export class ResikoProfileRepositoryModule {}
