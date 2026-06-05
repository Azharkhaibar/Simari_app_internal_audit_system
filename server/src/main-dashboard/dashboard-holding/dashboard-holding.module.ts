import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardHoldingService } from './dashboard-holding.service';
import { DashboardHoldingController } from './dashboard-holding.controller';

// Entities
import { RekapResult } from '../../rekap-data-profile-holding/rekap-data-1/entities/rekap-result.entity';
import { Investasi } from '../../investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from '../../pasar/pasar/entities/pasar.entity';
import { Likuiditas } from '../../likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from '../../operasional/operasional/entities/operasional.entity';
import { Hukum } from '../../hukum/hukum/entities/hukum.entity';
import { Stratejik } from '../../stratejik/stratejik/entities/stratejik.entity';
import { Kepatuhan } from '../../kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { Reputasi } from '../../reputasi/reputasi/entities/reputasi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RekapResult,
      Investasi,
      Pasar,
      Likuiditas,
      Operasional,
      Hukum,
      Stratejik,
      Kepatuhan,
      Reputasi,
    ]),
  ],
  controllers: [DashboardHoldingController],
  providers: [DashboardHoldingService],
})
export class DashboardHoldingModule {}
