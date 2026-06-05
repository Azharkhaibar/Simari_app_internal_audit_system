import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermodalanController } from './permodalan-ojk.controller';
import { Permodalan } from './entities/permodalan-ojk.entity';
import { PermodalanParameter } from './entities/permodalan-produk-parameter.entity';
import { PermodalanNilai } from './entities/permodalan-produk-nilai.entity';
import { PermodalanReference } from './entities/permodalan-inherent-references.entity';
import { PermodalanService } from './permodalan-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permodalan,
      PermodalanParameter,
      PermodalanNilai,
      PermodalanReference,
    ]),
  ],
  controllers: [PermodalanController],
  providers: [PermodalanService],
  exports: [PermodalanService],
})
export class PermodalanOjkModule {}
