import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HukumService } from './hukum-ojk.service';
import { HukumController } from './hukum-ojk.controller';
import { HukumOjk } from './entities/hukum-ojk.entity';
import { HukumParameter } from './entities/hukum-paramater.entity';
import { HukumNilai } from './entities/hukum-nilai.entity';
import { InherentReferenceHukum } from './entities/hukum-inherent-references.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HukumOjk,
      HukumParameter,
      HukumNilai,
      InherentReferenceHukum,
    ]),
  ],
  controllers: [HukumController],
  providers: [HukumService],
  exports: [HukumService],
})
export class HukumOjkModule {}
