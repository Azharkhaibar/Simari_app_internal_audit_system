import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TatakelolaController } from './tatakelola-ojk.controller';
import { Tatakelola } from './entities/tatakelola-ojk.entity';
import { TatakelolaParameter } from './entities/tatakelola-produk-parameter.entity';
import { TatakelolaNilai } from './entities/tatakelola-produk-nilai.entity';
import { TatakelolaReference } from './entities/tatakelola-inherent-references.entity';
import { TatakelolaService } from './tatakelola-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tatakelola,
      TatakelolaParameter,
      TatakelolaNilai,
      TatakelolaReference,
    ]),
  ],
  controllers: [TatakelolaController],
  providers: [TatakelolaService],
  exports: [TatakelolaService],
})
export class TatakelolaOjkModule {}
