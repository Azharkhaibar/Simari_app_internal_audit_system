import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kredit } from './entities/kredit-produk-ojk.entity';
import { KreditParameter } from './entities/kredit-produk-parameter.entity';
import { KreditNilai } from './entities/kredit-produk-nilai.entity';
import { KreditReference } from './entities/kredit-inherent-references.entity';
import { OjkModule } from 'src/ojk/ojk-category/entities/ojk-category.entity';
import { KreditService } from './kredit-produk-ojk.service';
import { KreditController } from './kredit-produk-ojk.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kredit,
      KreditParameter,
      KreditNilai,
      KreditReference,
      OjkModule,
    ]),
  ],
  controllers: [KreditController],
  providers: [KreditService],
  exports: [KreditService],
})
export class KreditProdukOjkModule {}