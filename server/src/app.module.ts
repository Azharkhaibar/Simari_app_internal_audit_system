import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { typeOrmConfig } from './config/db.config';
import { PasarModule } from './pasar/pasar/pasar.module';
import { LikuiditasModule } from './likuiditas/likuiditas/likuiditas.module';
import { OperasionalModule } from './operasional/operasional/operasional.module';
import { DivisiModule } from './divisi/divisi.module';
import { NotificationModule } from './notification/notification.module';
import { KpmrLikuiditasModule } from './likuiditas/kpmr-likuiditas/kpmr-likuiditas.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { LikuiditasKpmrModule } from './ojk/likuiditas-produk/likuiditas-produk-kpmr/likuiditas-produk-kpmr.module';
import { KpmrInvestasiModule } from './investasi/kpmr-investasi/kpmr-investasi.module';
import { InvestasiModule } from './investasi/new-investasi/new-investasi.module';
import { HukumModule } from './hukum/hukum/hukum.module';
import { KpmrHukumModule } from './hukum/kpmr-hukum/kpmr-hukum.module';
import { StratejikModule } from './stratejik/stratejik/stratejik.module';
import { KpmrStratejikModule } from './stratejik/kpmr-stratejik/kpmr-stratejik.module';
import { KpmrOperasionalModule } from './operasional/kpmr-operasional/kpmr-operasional.module';
import { KepatuhanModule } from './kepatuhan/kepatuhan/kepatuhan.module';
import { KpmrKepatuhanModule } from './kepatuhan/kpmr-kepatuhan/kpmr-kepatuhan.module';
import { ReputasiModule } from './reputasi/reputasi/reputasi.module';
import { KpmrReputasiModule } from './reputasi/kpmr-reputasi/kpmr-reputasi.module';
import { ResikoProfileRepositoryModule } from './resiko-profile-repository/resiko-profile-repository.module';
import { GeminiClassifierModule } from './gemini_classifier/gemini_classifier.module';
import { RasModule } from './ras/ras.module';

// import { PasarProdukKpmrModule } from './ojk/pasar-produk/pasar-produk-kpmr/pasar-produk-kpmr.module';
import { KpmrPasarModule } from './pasar/kpmr-pasar/kpmr-pasar.module';
import { LikuiditasProdukOjkModule } from './ojk/likuiditas-produk/likuiditas-produk-ojk/likuiditas-produk-ojk.module';

import { KreditProdukOjkModule } from './ojk/kredit-produk/kredit-produk-ojk/kredit-produk-ojk.module';
import { KreditProdukKpmrModule } from './ojk/kredit-produk/kredit-produk-kpmr/kredit-produk-kpmr.module';
import { KonsentrasiProdukOjkModule } from './ojk/konsentrasi-produk/konsentrasi-produk-ojk/konsentrasi-produk-ojk.module';
import { KonsentrasiKpmrModule } from './ojk/konsentrasi-produk/konsentrasi-produk-kpmr/konsentrasi-produk-kpmr.module';
import { HukumOjkModule } from './ojk/hukum-ojk/hukum-ojk/hukum-ojk.module';
import { HukumKpmrModule } from './ojk/hukum-ojk/hukum-kpmr-ojk/hukum-kpmr-ojk.module';
import { KepatuhanOjkModule } from './ojk/kepatuhan-ojk/kepatuhan-ojk/kepatuhan-ojk.module';
import { KepatuhanProdukKpmrModule } from './ojk/kepatuhan-ojk/kepatuhan-kpmr-ojk/kepatuhan-kpmr-ojk.module';
import { ReputasiOjkModule } from './ojk/reputasi-ojk/reputasi-ojk/reputasi-ojk.module';
import { ReputasiKpmrModule } from './ojk/reputasi-ojk/reputasi-kpmr-ojk/reputasi-kpmr-ojk.module';
// import { ReputasiProdukKpmrModule } from './ojk/reputasi-ojk/reputasi-kpmr-ojk/reputasi-kpmr-ojk.module';
import { InvestasiOjkModule } from './ojk/investasi-ojk/investasi-ojk/investasi-ojk.module';
import { InvestasiKpmrModule } from './ojk/investasi-ojk/investasi-kpmr-ojk/investasi-kpmr-ojk.module';
import { StrategisOjkModule } from './ojk/strategis-ojk/strategis-ojk/strategis-ojk.module';
// import { StrategisProdukKpmrModule } from './ojk/strategis-ojk/strategis-kpmr-ojk/strategis-kpmr-ojk.module';
import { StrategisKpmrModule } from './ojk/strategis-ojk/strategis-kpmr-ojk/strategis-kpmr-ojk.module';
import { RentabilitasOjkModule } from './ojk/rentabilitas-ojk/rentabilitas-ojk/rentabilitas-ojk.module';
import { RentabilitasKpmrModule } from './ojk/rentabilitas-ojk/rentabilitas-kpmr-ojk/rentabilitas-kpmr-ojk.module';
import { PasarProdukOjkModule } from './ojk/pasar-produk/pasar-produk-ojk/pasar-produk-ojk.module';

import { PasarProdukKpmrModule } from './ojk/pasar-produk/pasar-produk-kpmr/pasar-produk-kpmr.module';
import { Likuiditas } from './likuiditas/likuiditas/entities/likuiditas.entity';
import { OperasionalOjkModule } from './ojk/operasional-ojk/operasional-ojk/operasional-ojk.module';
import { OperasionalKpmrModule } from './ojk/operasional-ojk/operasional-kpmr-ojk/operasional-kpmr-ojk.module';
import { RekapDataModule } from './rekap-data-profile-holding/rekap-data/rekap-data.module';
import { RingkasanModule } from './rekap-data-profile-holding/ringkasan/ringkasan.module';
import { RekapData1Module } from './rekap-data-profile-holding/rekap-data-1/rekap-data-1.module';
import { RekapData2Module } from './rekap-data-profile-holding/rekap-data-2/rekap-data-2.module';
import { PermodalanOjkModule } from './ojk/permodalan-ojk/permodalan-ojk/permodalan-ojk.module';
import { TatakelolaOjkModule } from './ojk/tatakelola-ojk/tatakelola-ojk/tatakelola-ojk.module';
// import { TatakelolaKpmrOjkModule } from './ojk/tatakelola-ojk/tatakelola-kpmr-ojk/tatakelola-kpmr-ojk.module';
import { TatakelolaKpmrModule } from './ojk/tatakelola-ojk/tatakelola-kpmr-ojk/tatakelola-kpmr-ojk.module';
import { PermodalanKpmrModule } from './ojk/permodalan-ojk/permodalan-kpmr-ojk/permodalan-kpmr-ojk.module';
import { RekapDataOjkModule } from './ojk/rekap-data/rekap-data.module';
import { RekapData1OjkModule } from './ojk/rekap-data-1/rekap-data-1.module';
import { RekapData2OjkModule } from './ojk/rekap-data-2/rekap-data-2.module';
import { RingkasanOjkModule } from './ojk/ringkasan/ringkasan.module';
import { PeringkatKompositOjkModule } from './ojk/peringkat-komposit/peringkat-komposit.module';
import { DashboardHoldingModule } from './main-dashboard/dashboard-holding/dashboard-holding.module';
import { DashboardOjkModule } from './main-dashboard/dashboard-ojk/dashboard-ojk.module';
import { ResikoProfileRepositoryOjkModule } from './resiko-profile-repository-ojk/resiko-profile-repository-ojk.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeOrmConfig(config),
    }),

    AuthModule,
    UsersModule,
    PasarModule,
    LikuiditasModule,
    OperasionalModule,
    DivisiModule,
    NotificationModule,
    KpmrInvestasiModule,
    AuditLogModule,
    LikuiditasKpmrModule,
    InvestasiModule,
    HukumModule,
    KonsentrasiProdukOjkModule,
    KonsentrasiKpmrModule,
    PasarProdukKpmrModule,
    KpmrHukumModule,
    StratejikModule,
    KpmrStratejikModule,
    KpmrOperasionalModule,
    KepatuhanModule,
    KpmrKepatuhanModule,
    ReputasiModule,
    KpmrPasarModule,
    KpmrReputasiModule,
    ResikoProfileRepositoryModule,
    GeminiClassifierModule,
    RasModule,
    PasarProdukOjkModule,
    LikuiditasProdukOjkModule,
    KreditProdukOjkModule,
    KreditProdukKpmrModule,
    KonsentrasiProdukOjkModule,
    OperasionalOjkModule,
    OperasionalKpmrModule,
    HukumOjkModule,
    HukumKpmrModule,
    KepatuhanOjkModule,
    KepatuhanProdukKpmrModule,
    ReputasiOjkModule,
    // ReputasiProdukKpmrModule,
    ReputasiKpmrModule,
    InvestasiOjkModule,
    InvestasiKpmrModule,
    KpmrLikuiditasModule,
    StrategisOjkModule,
    // StrategisProdukKpmrModule,
    StrategisKpmrModule,
    RentabilitasOjkModule,
    RentabilitasKpmrModule,
    // RekapData1OjkModule,
    // RekapData2OjkModule,
    // RekapDataOjkModule,
    RingkasanOjkModule,
    PermodalanOjkModule,
    TatakelolaOjkModule,
    TatakelolaKpmrModule,
    PermodalanKpmrModule,
    RekapDataModule,
    RingkasanModule,
    RekapData2Module,
    RekapData1Module,
    PeringkatKompositOjkModule,
    RekapDataOjkModule,
    RekapData1OjkModule,
    RekapData2OjkModule,
    DashboardHoldingModule,
    DashboardOjkModule,
    ResikoProfileRepositoryOjkModule,

    
   
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
