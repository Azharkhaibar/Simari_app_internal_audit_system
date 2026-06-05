// src/modules/ringkasan/ringkasan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RingkasanController } from './ringkasan.controller';
import { RingkasanService } from './ringkasan.service';

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
  ],
  controllers: [RingkasanController],
  providers: [RingkasanService],
  exports: [RingkasanService],
})
export class RingkasanModule {}
