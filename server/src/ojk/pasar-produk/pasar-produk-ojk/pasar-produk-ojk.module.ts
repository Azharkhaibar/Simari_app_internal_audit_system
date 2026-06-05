// pasar-produk.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasarProduk } from './entities/pasar-produk-ojk.entity';
import { PasarProdukParameter } from './entities/pasar-produk-parameter.entity';
import { PasarProdukNilai } from './entities/pasar-produk-nilai.entity';
import { PasarProdukReference } from './entities/pasar-produk-inherent-references.entity';
import { OjkModule } from 'src/ojk/ojk-category/entities/ojk-category.entity';
import { PasarProdukService } from './pasar-produk-ojk.service';
import { PasarProdukController } from './pasar-produk-ojk.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasarProduk,
      PasarProdukParameter,
      PasarProdukNilai,
      PasarProdukReference,
      OjkModule, // ⬅️ TAMBAHKAN
    ]),
  ],
  controllers: [PasarProdukController],
  providers: [PasarProdukService],
  exports: [PasarProdukService],
})
export class PasarProdukOjkModule {}