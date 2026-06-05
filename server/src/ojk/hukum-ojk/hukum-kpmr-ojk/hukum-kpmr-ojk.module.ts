// src/ojk/hukum/hukum-kpmr/hukum-kpmr.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpmrAspekHukum } from './entities/hukum-kpmr-aspek.entity';
import { KpmrPertanyaanHukum } from './entities/hukum-kpmr-pertanyaan.entity';
// import { KpmrHukum } from './entities/hukum-produk.entity';
// import { KpmrHukumController } from './hukum-kpmr.controller';
import { KpmrHukumOjk } from './entities/hukum-kpmr-ojk.entity';
import { KpmrHukumController } from './hukum-kpmr-ojk.controller';
import { KpmrHukumService } from './hukum-kpmr-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([KpmrHukumOjk, KpmrAspekHukum, KpmrPertanyaanHukum]),
  ],
  controllers: [KpmrHukumController],
  providers: [KpmrHukumService],
  exports: [KpmrHukumService],
})
export class HukumKpmrModule {}
