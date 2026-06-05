import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KepatuhanService } from './kepatuhan-ojk.service';
import { KepatuhanController } from './kepatuhan-ojk.controller';
import { KepatuhanOjk } from './entities/kepatuhan-ojk.entity';
import { KepatuhanParameter } from './entities/kepatuhan-paramater.entity';
import { KepatuhanNilai } from './entities/kepatuhan-nilai.entity';
import { KepatuhanReference } from './entities/kepatuhan-inherent-references.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      KepatuhanOjk,
      KepatuhanParameter,
      KepatuhanNilai,
      KepatuhanReference,
    ]),
  ],
  controllers: [KepatuhanController],
  providers: [KepatuhanService],
  exports: [KepatuhanService],
})
export class KepatuhanOjkModule {}
