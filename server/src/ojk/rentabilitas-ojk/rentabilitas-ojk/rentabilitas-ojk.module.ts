import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RentabilitasController } from './rentabilitas-ojk.controller';
import { Rentabilitas } from './entities/rentabilitas-ojk.entity';
import { RentabilitasParameter } from './entities/rentabilitas-parameter.entity';
import { RentabilitasNilai } from './entities/rentabilitas-nilai.entity';
import { RentabilitasReference } from './entities/rentabilitas-inherent-references.entity';
import { RentabilitasService } from './rentabilitas-ojk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rentabilitas,
      RentabilitasParameter,
      RentabilitasNilai,
      RentabilitasReference,
    ]),
  ],
  controllers: [RentabilitasController],
  providers: [RentabilitasService],
  exports: [RentabilitasService],
})
export class RentabilitasOjkModule {}
