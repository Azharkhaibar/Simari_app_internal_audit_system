// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/kepatuhan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { KepatuhanController } from './controllers/kepatuhan.controller';
// import { KepatuhanService } from './services/kepatuhan.service';
import { KepatuhanController } from './kepatuhan.controller';
import { KepatuhanService } from './kepatuhan.service';
import { Kepatuhan } from './entities/kepatuhan.entity';
import { KepatuhanSection } from './entities/kepatuhan-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kepatuhan, KepatuhanSection])],
  controllers: [KepatuhanController],
  providers: [KepatuhanService],
  exports: [KepatuhanService],
})
export class KepatuhanModule {}