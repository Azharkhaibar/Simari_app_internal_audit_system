// src/features/Dashboard/pages/RiskProfile/pages/Hukum/kpmr-hukum.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KPMRHukumService } from './kpmr-hukum.service';
import { KPMRHukumController } from './kpmr-hukum.controller';
import { KPMRHukumDefinition } from './entities/kpmr-hukum-definisi.entity';
import { KPMRHukumScore } from './entities/kpmr-hukum-skor.entity';
import { KPMRHukumAspect } from './entities/kpmr-hukum-aspek.entity';
import { KPMRHukumQuestion } from './entities/kpmr-hukum-pertanyaan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KPMRHukumDefinition,
      KPMRHukumScore,
      KPMRHukumAspect,
      KPMRHukumQuestion,
    ]),
  ],
  controllers: [KPMRHukumController],
  providers: [KPMRHukumService],
  exports: [KPMRHukumService],
})
export class KpmrHukumModule {}
