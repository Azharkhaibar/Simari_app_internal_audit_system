// investasi.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investasi } from './entities/investasi-ojk.entity';
import { InvestasiParameter } from './entities/investasi-produk-parameter.entity';
import { InvestasiNilai } from './entities/investasi-produk-nilai.entity';
import { InvestasiReference } from './entities/investasi-inherent-references.entity';
import { OjkModule } from 'src/ojk/ojk-category/entities/ojk-category.entity';
import { InvestasiService } from './investasi-ojk.service';
import { InvestasiController } from './investasi-ojk.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Investasi,
      InvestasiParameter,
      InvestasiNilai,
      InvestasiReference,
      OjkModule, // â¬…ï¸ TAMBAHKAN
    ]),
  ],
  controllers: [InvestasiController],
  providers: [InvestasiService],
  exports: [InvestasiService],
})
export class InvestasiOjkModule {}

