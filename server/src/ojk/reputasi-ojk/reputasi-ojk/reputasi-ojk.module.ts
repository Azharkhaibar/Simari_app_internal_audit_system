import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReputasiController } from './reputasi-ojk.controller';
import { Reputasi } from './entities/reputasi-ojk.entity';
import { ReputasiParameter } from './entities/reputasi-parameter.entity';
import { ReputasiNilai } from './entities/reputasi-nilai.entity';
import { ReputasiReference } from './entities/reputasi-inherent-references.entity';
import { ReputasiService } from './reputasi-ojk.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reputasi,
      ReputasiParameter,
      ReputasiNilai,
      ReputasiReference,
    ]),
  ],
  controllers: [ReputasiController],
  providers: [ReputasiService],
  exports: [ReputasiService],
})
export class ReputasiOjkModule {}