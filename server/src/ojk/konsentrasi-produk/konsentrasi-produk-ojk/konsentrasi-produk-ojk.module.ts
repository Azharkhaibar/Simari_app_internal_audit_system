// konsentrasi.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KonsentrasiProdukOjk as Konsentrasi } from './entities/konsentrasi-produk-ojk.entity';
import { KonsentrasiParameter } from './entities/konsentrasi-produk-paramter.entity';
import { KonsentrasiNilai } from './entities/konsentrasi-produk-nilai.entity';
import { KonsentrasiReference } from './entities/konsentrasi-inherent-references.entity';
import { OjkModule } from 'src/ojk/ojk-category/entities/ojk-category.entity';
import { KonsentrasiService } from './konsentrasi-produk-ojk.service';
import { KonsentrasiController } from './konsentrasi-produk-ojk.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Konsentrasi,
      KonsentrasiParameter,
      KonsentrasiNilai,
      KonsentrasiReference,
      OjkModule, // ⬅️ TAMBAHKAN
    ]),
  ],
  controllers: [KonsentrasiController],
  providers: [KonsentrasiService],
  exports: [KonsentrasiService],
})
export class KonsentrasiProdukOjkModule {}