// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/reputasi.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputasiController } from './reputasi.controller';
import { ReputasiService } from './reputasi.service';
import { Reputasi } from './entities/reputasi.entity';
import { ReputasiSection } from './entities/reputasi-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reputasi, ReputasiSection])],
  controllers: [ReputasiController],
  providers: [ReputasiService],
  exports: [ReputasiService],
})
export class ReputasiModule {}
