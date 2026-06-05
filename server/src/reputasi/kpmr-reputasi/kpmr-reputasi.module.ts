// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/kpmr-reputasi.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KPMRReputasiController } from './kpmr-reputasi.controller';
import { KPMRReputasiService } from './kpmr-reputasi.service';
import { KPMRReputasiDefinition } from './entities/kpmr-reputasi-definisi.entity';
import { KPMRReputasiScore } from './entities/kpmr-reputasi-skor.entity';
import { KPMRReputasiAspect } from './entities/kpmr-reputasi-aspek.entity';
import { KPMRReputasiQuestion } from './entities/kpmr-reputasi-pertanyaan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KPMRReputasiDefinition,
      KPMRReputasiScore,
      KPMRReputasiAspect,
      KPMRReputasiQuestion,
    ]),
  ],
  controllers: [KPMRReputasiController],
  providers: [KPMRReputasiService],
  exports: [KPMRReputasiService],
})
export class KpmrReputasiModule {}
