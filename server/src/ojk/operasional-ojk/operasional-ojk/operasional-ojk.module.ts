// operasional.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operasional } from './entities/operasional-ojk.entity';
import { OperasionalParameter } from './entities/operasional-produk-parameter.entity';
import { OperasionalNilai } from './entities/operasional-produk-nilai.entity';
import { OperasionalReference } from './entities/operasional-inherent-references.entity';
import { OjkModule } from 'src/ojk/ojk-category/entities/ojk-category.entity';
import { OperasionalService } from './operasional-ojk.service';
import { OperasionalController } from './operasional-ojk.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Operasional,
      OperasionalParameter,
      OperasionalNilai,
      OperasionalReference,
      OjkModule, // ⬅️ TAMBAHKAN
    ]),
  ],
  controllers: [OperasionalController],
  providers: [OperasionalService],
  exports: [OperasionalService],
})
export class OperasionalOjkModule {}
