// src/features/Dashboard/pages/RiskProfile/pages/Hukum/hukum.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { HukumController } from './controllers/hukum.controller';
// import { HukumService } from './services/new-hukum.service';

import { HukumController } from './hukum.controller';
import { HukumService } from './hukum.service';
import { Hukum } from './entities/hukum.entity';
import { HukumSection } from './entities/hukum-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hukum, HukumSection])],
  controllers: [HukumController],
  providers: [HukumService],
  exports: [HukumService],
})
export class HukumModule {}
