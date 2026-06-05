// src/rekap-data-1/rekap-data-1.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities sendiri
import { BhzConfig } from './entities/bhz-config.entity';
import { BvtConfig } from './entities/bvt-config.entity';
import { RekapResult } from './entities/rekap-result.entity';

// Entities dari 8 modul
import { Investasi } from '../../investasi/new-investasi/entities/new-investasi.entity';
import { KPMRScore as KPMRInvestasiScore } from '../../investasi/kpmr-investasi/entities/kpmr-investasi-skor.entity';
import { KPMRDefinition as KPMRInvestasiDefinition } from '../../investasi/kpmr-investasi/entities/kpmr-investasi-definisi.entity';

import { Pasar } from '../../pasar/pasar/entities/pasar.entity';
import { KPMRPasarScore } from '../../pasar/kpmr-pasar/entities/kpmr-pasar-skor.entity';
import { KPMRPasarDefinition } from '../../pasar/kpmr-pasar/entities/kpmr-pasar-definisi.entity';

import { Likuiditas } from '../../likuiditas/likuiditas/entities/likuiditas.entity';
import { KPMRLikuiditasScore } from '../../likuiditas/kpmr-likuiditas/entities/kpmr-likuiditas-skor.entity';
import { KPMRLikuiditasDefinition } from '../../likuiditas/kpmr-likuiditas/entities/kpmr-likuiditas-definisi.entity';

import { Operasional } from '../../operasional/operasional/entities/operasional.entity';
import { KPMROperasionalScore } from '../../operasional/kpmr-operasional/entities/kpmr-operasional-skor.entity';
import { KPMROperasionalDefinition } from '../../operasional/kpmr-operasional/entities/kpmr-operasional-definisi.entity';

import { Hukum } from '../../hukum/hukum/entities/hukum.entity';
import { KPMRHukumScore } from '../../hukum/kpmr-hukum/entities/kpmr-hukum-skor.entity';
import { KPMRHukumDefinition } from '../../hukum/kpmr-hukum/entities/kpmr-hukum-definisi.entity';

import { Stratejik } from '../../stratejik/stratejik/entities/stratejik.entity';
import { KPMRStratejikScore } from '../../stratejik/kpmr-stratejik/entities/kpmr-stratejik-skor.entity';
import { KPMRStratejikDefinition } from '../../stratejik/kpmr-stratejik/entities/kpmr-stratejik-definisi.entity';

import { Kepatuhan } from '../../kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { KPMRKepatuhanScore } from '../../kepatuhan/kpmr-kepatuhan/entities/kpmr-kepatuhan-skor.entity';
import { KPMRKepatuhanDefinition } from '../../kepatuhan/kpmr-kepatuhan/entities/kpmr-kepatuhan-definisi.entity';

import { Reputasi } from '../../reputasi/reputasi/entities/reputasi.entity';
import { KPMRReputasiScore } from '../../reputasi/kpmr-reputasi/entities/kpmr-reputasi-skor.entity';
import { KPMRReputasiDefinition } from '../../reputasi/kpmr-reputasi/entities/kpmr-reputasi-definisi.entity';

// DTOs
import {
  SaveBhzDto,
  SaveBvtDto,
  SaveRekapResultDto,
} from './dto/rekapdata1.dto';

// ===================== INTERFACE =====================
export interface RekapDataResponse {
  bhzConfig: BhzConfig | null;
  bvtConfig: BvtConfig | null;
  investasiSummary: any[];
  pasarSummary: any[];
  likuiditasSummary: any[];
  operasionalSummary: any[];
  hukumSummary: any[];
  strategisSummary: any[];
  kepatuhanSummary: any[];
  reputasiSummary: any[];
  loadKPMRInvestasi: any[];
  loadKPMRPasar: any[];
  loadKPMRLikuiditas: any[];
  loadKPMROperasional: any[];
  loadKPMRHukum: any[];
  loadKPMRStrategis: any[];
  loadKPMRKepatuhan: any[];
  loadKPMRReputasi: any[];
  savedResult: RekapResult | null;
}

interface ModuleConfig {
  name: string;
  repo: Repository<any>;
  scoreRepo: Repository<any>;
  defRepo: Repository<any>;
}

@Injectable()
export class RekapData1Service {
  private modules: ModuleConfig[];

  constructor(
    // Repositories sendiri
    @InjectRepository(BhzConfig)
    private bhzRepo: Repository<BhzConfig>,
    @InjectRepository(BvtConfig)
    private bvtRepo: Repository<BvtConfig>,
    @InjectRepository(RekapResult)
    private rekapResultRepo: Repository<RekapResult>,

    // Investasi
    @InjectRepository(Investasi)
    private investasiRepo: Repository<Investasi>,
    @InjectRepository(KPMRInvestasiScore)
    private kpmrInvestasiScoreRepo: Repository<KPMRInvestasiScore>,
    @InjectRepository(KPMRInvestasiDefinition)
    private kpmrInvestasiDefRepo: Repository<KPMRInvestasiDefinition>,

    // Pasar
    @InjectRepository(Pasar)
    private pasarRepo: Repository<Pasar>,
    @InjectRepository(KPMRPasarScore)
    private kpmrPasarScoreRepo: Repository<KPMRPasarScore>,
    @InjectRepository(KPMRPasarDefinition)
    private kpmrPasarDefRepo: Repository<KPMRPasarDefinition>,

    // Likuiditas
    @InjectRepository(Likuiditas)
    private likuiditasRepo: Repository<Likuiditas>,
    @InjectRepository(KPMRLikuiditasScore)
    private kpmrLikuiditasScoreRepo: Repository<KPMRLikuiditasScore>,
    @InjectRepository(KPMRLikuiditasDefinition)
    private kpmrLikuiditasDefRepo: Repository<KPMRLikuiditasDefinition>,

    // Operasional
    @InjectRepository(Operasional)
    private operasionalRepo: Repository<Operasional>,
    @InjectRepository(KPMROperasionalScore)
    private kpmrOperasionalScoreRepo: Repository<KPMROperasionalScore>,
    @InjectRepository(KPMROperasionalDefinition)
    private kpmrOperasionalDefRepo: Repository<KPMROperasionalDefinition>,

    // Hukum
    @InjectRepository(Hukum)
    private hukumRepo: Repository<Hukum>,
    @InjectRepository(KPMRHukumScore)
    private kpmrHukumScoreRepo: Repository<KPMRHukumScore>,
    @InjectRepository(KPMRHukumDefinition)
    private kpmrHukumDefRepo: Repository<KPMRHukumDefinition>,

    // Stratejik
    @InjectRepository(Stratejik)
    private stratejikRepo: Repository<Stratejik>,
    @InjectRepository(KPMRStratejikScore)
    private kpmrStratejikScoreRepo: Repository<KPMRStratejikScore>,
    @InjectRepository(KPMRStratejikDefinition)
    private kpmrStratejikDefRepo: Repository<KPMRStratejikDefinition>,

    // Kepatuhan
    @InjectRepository(Kepatuhan)
    private kepatuhanRepo: Repository<Kepatuhan>,
    @InjectRepository(KPMRKepatuhanScore)
    private kpmrKepatuhanScoreRepo: Repository<KPMRKepatuhanScore>,
    @InjectRepository(KPMRKepatuhanDefinition)
    private kpmrKepatuhanDefRepo: Repository<KPMRKepatuhanDefinition>,

    // Reputasi
    @InjectRepository(Reputasi)
    private reputasiRepo: Repository<Reputasi>,
    @InjectRepository(KPMRReputasiScore)
    private kpmrReputasiScoreRepo: Repository<KPMRReputasiScore>,
    @InjectRepository(KPMRReputasiDefinition)
    private kpmrReputasiDefRepo: Repository<KPMRReputasiDefinition>,
  ) {
    this.modules = [
      { name: 'investasi', repo: this.investasiRepo, scoreRepo: this.kpmrInvestasiScoreRepo, defRepo: this.kpmrInvestasiDefRepo },
      { name: 'pasar', repo: this.pasarRepo, scoreRepo: this.kpmrPasarScoreRepo, defRepo: this.kpmrPasarDefRepo },
      { name: 'likuiditas', repo: this.likuiditasRepo, scoreRepo: this.kpmrLikuiditasScoreRepo, defRepo: this.kpmrLikuiditasDefRepo },
      { name: 'operasional', repo: this.operasionalRepo, scoreRepo: this.kpmrOperasionalScoreRepo, defRepo: this.kpmrOperasionalDefRepo },
      { name: 'hukum', repo: this.hukumRepo, scoreRepo: this.kpmrHukumScoreRepo, defRepo: this.kpmrHukumDefRepo },
      { name: 'strategis', repo: this.stratejikRepo, scoreRepo: this.kpmrStratejikScoreRepo, defRepo: this.kpmrStratejikDefRepo },
      { name: 'kepatuhan', repo: this.kepatuhanRepo, scoreRepo: this.kpmrKepatuhanScoreRepo, defRepo: this.kpmrKepatuhanDefRepo },
      { name: 'reputasi', repo: this.reputasiRepo, scoreRepo: this.kpmrReputasiScoreRepo, defRepo: this.kpmrReputasiDefRepo },
    ];
  }

  // ===================== BHz CONFIG =====================
  async getBhz(year: number, quarter: string): Promise<BhzConfig | null> {
    return this.bhzRepo.findOne({ where: { year, quarter } });
  }

  async saveBhz(dto: SaveBhzDto): Promise<BhzConfig> {
    const existing = await this.bhzRepo.findOne({
      where: { year: dto.year, quarter: dto.quarter },
    });

    if (existing) {
      Object.assign(existing, dto);
      existing.updatedBy = dto.createdBy || 'system';
      return this.bhzRepo.save(existing);
    }

    const newConfig = this.bhzRepo.create({
      ...dto,
      createdBy: dto.createdBy || 'system',
    });
    return this.bhzRepo.save(newConfig);
  }

  // ===================== BVT CONFIG =====================
  async getBvt(year: number, quarter: string): Promise<BvtConfig | null> {
    return this.bvtRepo.findOne({ where: { year, quarter } });
  }

  async saveBvt(dto: SaveBvtDto): Promise<BvtConfig> {
    const existing = await this.bvtRepo.findOne({
      where: { year: dto.year, quarter: dto.quarter },
    });

    if (existing) {
      Object.assign(existing, dto);
      existing.updatedBy = dto.createdBy || 'system';
      return this.bvtRepo.save(existing);
    }

    const newConfig = this.bvtRepo.create({
      ...dto,
      createdBy: dto.createdBy || 'system',
    });
    return this.bvtRepo.save(newConfig);
  }

  // ===================== REKAP RESULT =====================
  async saveResult(dto: SaveRekapResultDto): Promise<RekapResult> {
    const existing = await this.rekapResultRepo.findOne({
      where: { year: dto.year, quarter: dto.quarter },
    });

    if (existing) {
      existing.kompositA = dto.kompositA;
      existing.kompositB = dto.kompositB;
      existing.totalPeringkat = dto.totalPeringkat;
      existing.riskDetails = dto.riskDetails;
      return this.rekapResultRepo.save(existing);
    }

    const newResult = this.rekapResultRepo.create({
      year: dto.year,
      quarter: dto.quarter,
      kompositA: dto.kompositA,
      kompositB: dto.kompositB,
      totalPeringkat: dto.totalPeringkat,
      riskDetails: dto.riskDetails,
      createdBy: dto.createdBy || 'system',
    });
    return this.rekapResultRepo.save(newResult);
  }

  async getResult(year: number, quarter: string): Promise<RekapResult | null> {
    return this.rekapResultRepo.findOne({ where: { year, quarter } });
  }

  // ===================== GET SUMMARY MODUL =====================
  private async getModuleSummary(
    repo: Repository<any>,
    year: number,
    quarter: string,
  ): Promise<any[]> {
    const data = await repo.find({
      where: { year, quarter, isDeleted: false },
      order: { no: 'ASC', subNo: 'ASC' },
    });
    return data;
  }

  // ===================== GET KPMR DATA MODUL =====================
  private async getModuleKPMR(
    scoreRepo: Repository<any>,
    defRepo: Repository<any>,
    year: number,
    quarter: string,
  ): Promise<any[]> {
    const scores = await scoreRepo.find({
      where: { year, quarter },
      relations: ['definition'],
    });

    return scores.map((score) => ({
      aspekNo: score.definition?.aspekNo || '',
      aspekTitle: score.definition?.aspekTitle || '',
      aspekBobot: Number(score.definition?.aspekBobot || 0),
      sectionNo: score.definition?.sectionNo || '',
      sectionTitle: score.definition?.sectionTitle || '',
      sectionSkor: Number(score.sectionSkor || 0),
      year: score.year,
      quarter: score.quarter,
    }));
  }

  // ===================== GET ALL DATA (MAIN METHOD) =====================
  async getAllRekapData(year: number, quarter: string): Promise<RekapDataResponse> {
    // Ambil BHz dan BVT config
    const bhzConfig = await this.getBhz(year, quarter);
    const bvtConfig = await this.getBvt(year, quarter);

    // Inisialisasi result dengan cara yang benar
    const result = {
      bhzConfig,
      bvtConfig,
      investasiSummary: [] as any[],
      pasarSummary: [] as any[],
      likuiditasSummary: [] as any[],
      operasionalSummary: [] as any[],
      hukumSummary: [] as any[],
      strategisSummary: [] as any[],
      kepatuhanSummary: [] as any[],
      reputasiSummary: [] as any[],
      loadKPMRInvestasi: [] as any[],
      loadKPMRPasar: [] as any[],
      loadKPMRLikuiditas: [] as any[],
      loadKPMROperasional: [] as any[],
      loadKPMRHukum: [] as any[],
      loadKPMRStrategis: [] as any[],
      loadKPMRKepatuhan: [] as any[],
      loadKPMRReputasi: [] as any[],
      savedResult: null as RekapResult | null,
    } satisfies RekapDataResponse;

    // Ambil data dari 8 modul secara manual (hindari dynamic key assignment)
    const modulesData = await Promise.all(
      this.modules.map(async (mod) => ({
        name: mod.name,
        summary: await this.getModuleSummary(mod.repo, year, quarter),
        kpmr: await this.getModuleKPMR(mod.scoreRepo, mod.defRepo, year, quarter),
      })),
    );

    // Assign data ke result
    for (const data of modulesData) {
      const { name, summary, kpmr } = data;
      
      // Summary
      if (name === 'investasi') result.investasiSummary = summary;
      else if (name === 'pasar') result.pasarSummary = summary;
      else if (name === 'likuiditas') result.likuiditasSummary = summary;
      else if (name === 'operasional') result.operasionalSummary = summary;
      else if (name === 'hukum') result.hukumSummary = summary;
      else if (name === 'strategis') result.strategisSummary = summary;
      else if (name === 'kepatuhan') result.kepatuhanSummary = summary;
      else if (name === 'reputasi') result.reputasiSummary = summary;

      // KPMR
      if (name === 'investasi') result.loadKPMRInvestasi = kpmr;
      else if (name === 'pasar') result.loadKPMRPasar = kpmr;
      else if (name === 'likuiditas') result.loadKPMRLikuiditas = kpmr;
      else if (name === 'operasional') result.loadKPMROperasional = kpmr;
      else if (name === 'hukum') result.loadKPMRHukum = kpmr;
      else if (name === 'strategis') result.loadKPMRStrategis = kpmr;
      else if (name === 'kepatuhan') result.loadKPMRKepatuhan = kpmr;
      else if (name === 'reputasi') result.loadKPMRReputasi = kpmr;
    }

    // Ambil hasil rekap yang tersimpan
    result.savedResult = await this.getResult(year, quarter);

    return result;
  }

  // ===================== HITUNG SUMMARY (Utility) =====================
  calculateSummary(rows: any[]): number {
    return rows.reduce((sum, r) => {
      const w = Number(r.weighted || 0);
      return sum + (Number.isFinite(w) ? w : 0);
    }, 0);
  }

  // ===================== HITUNG SKOR KPMR (Utility) =====================
  calculateSkorKPMR(rows: any[]): number {
    if (!rows || rows.length === 0) return 0;

    const aspekGroups: Record<string, number[]> = {};
    rows.forEach((item) => {
      const key = item.aspekNo || 'default';
      if (!aspekGroups[key]) aspekGroups[key] = [];
      aspekGroups[key].push(Number(item.sectionSkor || 0));
    });

    const aspekAvg = Object.values(aspekGroups).map(
      (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
    );

    return aspekAvg.length > 0
      ? aspekAvg.reduce((a, b) => a + b, 0) / aspekAvg.length
      : 0;
  }
}