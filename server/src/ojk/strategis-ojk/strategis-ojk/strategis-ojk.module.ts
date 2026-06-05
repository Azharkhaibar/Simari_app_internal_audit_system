import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StrategisController } from './strategis-ojk.controller';
import { Strategis } from './entities/strategis-ojk.entity';
import { StrategisParameter } from './entities/strategis-parameter.entity';
import { StrategisNilai } from './entities/strategis-nilai.entity';
import { StrategisReference } from './entities/strategis-inherent-references.entity';
import { StrategisService } from './strategis-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Strategis,
      StrategisParameter,
      StrategisNilai,
      StrategisReference,
    ]),
  ],
  controllers: [StrategisController],
  providers: [StrategisService],
  exports: [StrategisService],
})
export class StrategisOjkModule {}
