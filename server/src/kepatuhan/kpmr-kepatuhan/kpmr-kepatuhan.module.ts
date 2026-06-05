// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/kpmr-kepatuhan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KPMRKepatuhanController } from './kpmr-kepatuhan.controller';
import { KPMRKepatuhanService } from './kpmr-kepatuhan.service';
import { KPMRKepatuhanDefinition } from './entities/kpmr-kepatuhan-definisi.entity';
import { KPMRKepatuhanScore } from './entities/kpmr-kepatuhan-skor.entity';
import { KPMRKepatuhanAspect } from './entities/kpmr-kepatuhan-aspek.entity';
import { KPMRKepatuhanQuestion } from './entities/kpmr-kepatuhan-pertanyaan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KPMRKepatuhanDefinition,
      KPMRKepatuhanScore,
      KPMRKepatuhanAspect,
      KPMRKepatuhanQuestion,
    ]),
  ],
  controllers: [KPMRKepatuhanController],
  providers: [KPMRKepatuhanService],
  exports: [KPMRKepatuhanService],
})
export class KpmrKepatuhanModule {}
