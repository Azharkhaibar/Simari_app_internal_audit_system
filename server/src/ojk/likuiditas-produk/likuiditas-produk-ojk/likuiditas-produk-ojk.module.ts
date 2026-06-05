// likuiditas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Likuiditas } from './entities/likuiditas-ojk.entity';
import { LikuiditasParameter } from './entities/likuiditas-parameter.entity';
import { LikuiditasNilai } from './entities/likuiditas-nilai.entity';
import { LikuiditasReference } from './entities/likuiditas-inherent-references.entity';
import { OjkModule } from 'src/ojk/ojk-category/entities/ojk-category.entity';
import { LikuiditasService } from './likuiditas-produk-ojk.service';
import { LikuiditasController } from './likuiditas-produk-ojk.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Likuiditas,
      LikuiditasParameter,
      LikuiditasNilai,
      LikuiditasReference,
      OjkModule,
    ]),
  ],
  controllers: [LikuiditasController],
  providers: [LikuiditasService],
  exports: [LikuiditasService],
})
export class LikuiditasProdukOjkModule {}