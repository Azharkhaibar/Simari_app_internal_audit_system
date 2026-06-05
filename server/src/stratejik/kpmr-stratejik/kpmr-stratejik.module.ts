import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KPMRStratejikController } from './kpmr-stratejik.controller';
import { KPMRStratejikService } from './kpmr-stratejik.service';
import { KPMRStratejikDefinition } from './entities/kpmr-stratejik-definisi.entity';
import { KPMRStratejikScore } from './entities/kpmr-stratejik-skor.entity';
import { KPMRStratejikAspect } from './entities/kpmr-stratejik-aspek.entity';
import { KPMRStratejikQuestion } from './entities/kpmr-stratejik-pertanyaan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KPMRStratejikDefinition,
      KPMRStratejikScore,
      KPMRStratejikAspect,
      KPMRStratejikQuestion,
    ]),
  ],
  controllers: [KPMRStratejikController],
  providers: [KPMRStratejikService],
  exports: [KPMRStratejikService],
})
export class KpmrStratejikModule {}
