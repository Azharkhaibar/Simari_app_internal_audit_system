// rekap-data-1.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GetRekapData1Dto,
  KategoriSummaryDto,
  RekapData1ResponseDto,
} from './dto/rekap-data-1.dto';

// operasional-ojk
import { Operasional } from '../operasional-ojk/operasional-ojk/entities/operasional-ojk.entity';
import { KpmrOperasionalOjk } from '../operasional-ojk/operasional-kpmr-ojk/entities/operasional-kpmr-ojk.entity';

// hukum-ojk
import { HukumOjk } from '../hukum-ojk/hukum-ojk/entities/hukum-ojk.entity';
import { KpmrHukumOjk } from '../hukum-ojk/hukum-kpmr-ojk/entities/hukum-kpmr-ojk.entity';

// investasi-ojk
import { Investasi } from '../investasi-ojk/investasi-ojk/entities/investasi-ojk.entity';
import { KpmrInvestasiOjk } from '../investasi-ojk/investasi-kpmr-ojk/entities/investasi-kpmr-ojk.entity';

// kepatuhan-ojk
import { KepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-ojk.entity';
import { KpmrKepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-kpmr-ojk/entities/kepatuhan-kpmr-ojk.entity';

// konsentrasi-produk
import { KonsentrasiProdukOjk } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-ojk.entity';
import { KpmrKonsentrasiOjk } from '../konsentrasi-produk/konsentrasi-produk-kpmr/entities/konsentrasi-produk-kpmr-ojk.entity';

// kredit-produk
import { Kredit } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-ojk.entity';
import { KpmrKreditOjk } from '../kredit-produk/kredit-produk-kpmr/entities/kredit-produk-kpmr-ojk.entity';

// likuiditas-produk
import { Likuiditas } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-ojk.entity';
import { KpmrLikuiditasProdukOjk } from '../likuiditas-produk/likuiditas-produk-kpmr/entities/likuiditas-produk-kpmr-ojk.entity';

// pasar-produk
import { PasarProduk } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-ojk.entity';
import { KpmrPasarProdukOjk } from '../pasar-produk/pasar-produk-kpmr/entities/pasar-produk-ojk.entity';

// permodalan-ojk
import { Permodalan } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-ojk.entity';
import { KpmrPermodalanOjk } from '../permodalan-ojk/permodalan-kpmr-ojk/entities/permodalan-kpmr-ojk.entity';

// rentabilitas-ojk
import { Rentabilitas } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-ojk.entity';
import { KpmrRentabilitasOjk } from '../rentabilitas-ojk/rentabilitas-kpmr-ojk/entities/rentabilitas-kpmr-ojk.entity';

// reputasi-ojk
import { Reputasi } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-ojk.entity';
import { KpmrReputasiOjk } from '../reputasi-ojk/reputasi-kpmr-ojk/entities/reputasi-kpmr-ojk.entity';

// strategis-ojk
import { Strategis } from '../strategis-ojk/strategis-ojk/entities/strategis-ojk.entity';
import { KpmrStrategisOjk } from '../strategis-ojk/strategis-kpmr-ojk/entities/strategis-kpmr-ojk.entity';

// tatakelola-ojk
import { Tatakelola } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-ojk.entity';
import { KpmrTatakelolaOjk } from '../tatakelola-ojk/tatakelola-kpmr-ojk/entities/tatakelola-kpmr-ojk.entity';

const CATEGORY_LABEL_MAP: Record<string, string> = {
  'operasional': 'Operasional',
  'pasar-produk': 'Pasar Produk',
  'likuiditas-produk': 'Likuiditas Produk',
  'kredit-produk': 'Kredit Produk',
  'konsentrasi-produk': 'Konsentrasi Produk',
  'hukum-regulatory': 'Hukum',
  'kepatuhan-regulatory': 'Kepatuhan',
  'reputasi-regulatory': 'Reputasi',
  'strategis-regulatory': 'Strategis',
  'investasi-regulatory': 'Investasi',
  'rentabilitas-regulatory': 'Rentabilitas',
  'permodalan-regulatory': 'Permodalan',
  'tatakelola-regulatory': 'Tata Kelola',
};

interface ModuleConfig {
  name: string;
  label: string;
  inherentRepo: Repository<any>;
  kpmrRepo: Repository<any>;
}

@Injectable()
export class RekapData1Service {
  private readonly logger = new Logger(RekapData1Service.name);
  private moduleConfigs: Map<string, ModuleConfig>;

  constructor(
    @InjectRepository(Operasional)
    private readonly operasionalRepo: Repository<Operasional>,
    @InjectRepository(KpmrOperasionalOjk)
    private readonly kpmrOperasionalRepo: Repository<KpmrOperasionalOjk>,

    @InjectRepository(HukumOjk)
    private readonly hukumRepo: Repository<HukumOjk>,
    @InjectRepository(KpmrHukumOjk)
    private readonly kpmrHukumRepo: Repository<KpmrHukumOjk>,

    @InjectRepository(Investasi)
    private readonly investasiRepo: Repository<Investasi>,
    @InjectRepository(KpmrInvestasiOjk)
    private readonly kpmrInvestasiRepo: Repository<KpmrInvestasiOjk>,

    @InjectRepository(KepatuhanOjk)
    private readonly kepatuhanRepo: Repository<KepatuhanOjk>,
    @InjectRepository(KpmrKepatuhanOjk)
    private readonly kpmrKepatuhanRepo: Repository<KpmrKepatuhanOjk>,

    @InjectRepository(KonsentrasiProdukOjk)
    private readonly konsentrasiRepo: Repository<KonsentrasiProdukOjk>,
    @InjectRepository(KpmrKonsentrasiOjk)
    private readonly kpmrKonsentrasiRepo: Repository<KpmrKonsentrasiOjk>,

    @InjectRepository(Kredit)
    private readonly kreditRepo: Repository<Kredit>,
    @InjectRepository(KpmrKreditOjk)
    private readonly kpmrKreditRepo: Repository<KpmrKreditOjk>,

    @InjectRepository(Likuiditas)
    private readonly likuiditasRepo: Repository<Likuiditas>,
    @InjectRepository(KpmrLikuiditasProdukOjk)
    private readonly kpmrLikuiditasRepo: Repository<KpmrLikuiditasProdukOjk>,

    @InjectRepository(PasarProduk)
    private readonly pasarRepo: Repository<PasarProduk>,
    @InjectRepository(KpmrPasarProdukOjk)
    private readonly kpmrPasarRepo: Repository<KpmrPasarProdukOjk>,

    @InjectRepository(Permodalan)
    private readonly permodalanRepo: Repository<Permodalan>,
    @InjectRepository(KpmrPermodalanOjk)
    private readonly kpmrPermodalanRepo: Repository<KpmrPermodalanOjk>,

    @InjectRepository(Rentabilitas)
    private readonly rentabilitasRepo: Repository<Rentabilitas>,
    @InjectRepository(KpmrRentabilitasOjk)
    private readonly kpmrRentabilitasRepo: Repository<KpmrRentabilitasOjk>,

    @InjectRepository(Reputasi)
    private readonly reputasiRepo: Repository<Reputasi>,
    @InjectRepository(KpmrReputasiOjk)
    private readonly kpmrReputasiRepo: Repository<KpmrReputasiOjk>,

    @InjectRepository(Strategis)
    private readonly strategisRepo: Repository<Strategis>,
    @InjectRepository(KpmrStrategisOjk)
    private readonly kpmrStrategisRepo: Repository<KpmrStrategisOjk>,

    @InjectRepository(Tatakelola)
    private readonly tatakelolaRepo: Repository<Tatakelola>,
    @InjectRepository(KpmrTatakelolaOjk)
    private readonly kpmrTatakelolaRepo: Repository<KpmrTatakelolaOjk>,
  ) {
    this.moduleConfigs = new Map<string, ModuleConfig>();
    this.registerModule('operasional', operasionalRepo, kpmrOperasionalRepo);
    this.registerModule('pasar-produk', pasarRepo, kpmrPasarRepo);
    this.registerModule('likuiditas-produk', likuiditasRepo, kpmrLikuiditasRepo);
    this.registerModule('kredit-produk', kreditRepo, kpmrKreditRepo);
    this.registerModule('konsentrasi-produk', konsentrasiRepo, kpmrKonsentrasiRepo);
    this.registerModule('hukum-regulatory', hukumRepo, kpmrHukumRepo);
    this.registerModule('kepatuhan-regulatory', kepatuhanRepo, kpmrKepatuhanRepo);
    this.registerModule('reputasi-regulatory', reputasiRepo, kpmrReputasiRepo);
    this.registerModule('strategis-regulatory', strategisRepo, kpmrStrategisRepo);
    this.registerModule('investasi-regulatory', investasiRepo, kpmrInvestasiRepo);
    this.registerModule('rentabilitas-regulatory', rentabilitasRepo, kpmrRentabilitasRepo);
    this.registerModule('permodalan-regulatory', permodalanRepo, kpmrPermodalanRepo);
    this.registerModule('tatakelola-regulatory', tatakelolaRepo, kpmrTatakelolaRepo);
  }

  private registerModule(
    name: string,
    inherentRepo: Repository<any>,
    kpmrRepo: Repository<any>,
  ) {
    this.moduleConfigs.set(name, {
      name,
      label: CATEGORY_LABEL_MAP[name] || name,
      inherentRepo,
      kpmrRepo,
    });
  }

  // ==================== GET ALL SUMMARY ====================
  async getSummaryData(
    query: GetRekapData1Dto,
  ): Promise<RekapData1ResponseDto> {
    let year = query.year;
    let quarter = query.quarter;

    if (!year || !quarter) {
      const latestData = await this.operasionalRepo
        .createQueryBuilder('o')
        .where('o.isActive = :isActive', { isActive: true })
        .orderBy('o.year', 'DESC')
        .addOrderBy('o.quarter', 'DESC')
        .limit(1)
        .getOne();

      if (latestData) {
        year = latestData.year;
        quarter = Number(latestData.quarter);
      } else {
        return {
          success: false,
          data: [],
          totalCategories: 0,
          message: 'Tidak ada data operasional tersedia',
        };
      }
    }

    const targetCategories = Array.from(this.moduleConfigs.keys());
    const result: KategoriSummaryDto[] = [];

    for (const catId of targetCategories) {
      const config = this.moduleConfigs.get(catId);
      if (!config) continue;

      try {
        const inherentSummary = await this.getInherentSummary(config, year, quarter);
        const kpmrSummary = await this.getKpmrSummary(config, year);
        result.push({
          id: catId,
          nama: config.label,
          inherentSummary,
          kpmrSummary,
        });
      } catch (error) {
        this.logger.error(
          `Error fetching summary for ${catId}: ${error.message}`,
        );
        result.push({
          id: catId,
          nama: config.label,
          inherentSummary: 0,
          kpmrSummary: 0,
        });
      }
    }

    return {
      success: true,
      data: result,
      totalCategories: result.length,
      message: `Data berhasil dimuat (Year: ${year}, Quarter: ${quarter})`,
    };
  }

  // ==================== GET INHERENT SUMMARY ====================
  async getInherentSummary(config: ModuleConfig, year: number, quarter: number): Promise<number> {
    try {
      const inherentData = await config.inherentRepo
        .createQueryBuilder('o')
        .leftJoinAndSelect('o.parameters', 'params')
        .leftJoinAndSelect('params.nilaiList', 'nilai')
        .where('o.year = :year', { year })
        .andWhere('o.quarter = :quarter', { quarter })
        .andWhere('o.isActive = :isActive', { isActive: true })
        .orderBy('params.orderIndex', 'ASC')
        .addOrderBy('nilai.orderIndex', 'ASC')
        .getOne();

      if (!inherentData) return 0;

      if (inherentData.summary?.totalWeighted != null && inherentData.summary.totalWeighted <= 5) {
        return inherentData.summary.totalWeighted;
      }

      const parameters = inherentData.parameters || [];
      if (parameters.length === 0) return 0;

      let totalWeighted = 0;
      let totalParameterBobot = 0;

      for (const param of parameters) {
        const paramBobot = (Number(param.bobot) || 0) / 100;
        totalParameterBobot += paramBobot;

        for (const nilai of param.nilaiList || []) {
          const derived = this.computeDerived(nilai, param);
          totalWeighted += derived.weighted;
        }
      }

      let finalWeighted =
        totalParameterBobot > 0
          ? totalWeighted / totalParameterBobot
          : totalWeighted;
      finalWeighted = Math.min(5, Math.max(0, finalWeighted));
      const roundedTotal = Number(finalWeighted.toFixed(2));

      await config.inherentRepo.update(inherentData.id, {
        summary: {
          totalWeighted: roundedTotal,
          summaryBg: this.getSummaryBg(roundedTotal),
          computedAt: new Date(),
        },
      } as any);

      return roundedTotal;
    } catch (error) {
      this.logger.error(`Error getting inherent summary for ${config.name}: ${error.message}`);
      return 0;
    }
  }

  // ==================== COMPUTE DERIVED ====================
  private computeDerived(nilai: any, param: any): { weighted: number } {
    try {
      if (!nilai) return { weighted: 0 };

      const judul = nilai.judul || {};
      const paramBobotFraction = Number(param?.bobot ?? 0) / 100;
      const nilaiBobotFraction = Number(nilai?.bobot ?? 0) / 100;

      const parseNumber = (v: any): number => {
        if (v == null || v === '' || v === undefined) return NaN;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          let cleaned = v.trim().replace(/\s/g, '');
          const isPercent = cleaned.includes('%');
          cleaned = cleaned
            .replace('%', '')
            .replace(/\./g, '')
            .replace(/,/g, '.');
          const num = Number(cleaned);
          if (!isNaN(num) && isPercent) return num / 100;
          return num;
        }
        return Number(v);
      };

      const evaluateFormula = (
        expr: string,
        subs: Record<string, number> = {},
      ): number => {
        if (!expr || typeof expr !== 'string' || expr.trim() === '') return NaN;
        let e = expr.trim();
        for (const [token, value] of Object.entries(subs)) {
          e = e.replace(new RegExp(`\\b${token}\\b`, 'gi'), String(value));
        }
        if (!/^[0-9eE\.\+\-\*\/\(\)\s]+$/.test(e)) return NaN;
        try {
          const fn = new Function(
            `"use strict"; try { return (${e}); } catch(err) { return NaN; }`,
          );
          const val = fn();
          return typeof val === 'number' && !isNaN(val) && isFinite(val)
            ? val
            : NaN;
        } catch {
          return NaN;
        }
      };

      let rawValue: number = NaN;
      const type = judul.type || 'Tanpa Faktor';

      if (type === 'Tanpa Faktor') {
        const parsed = parseNumber(judul.value);
        if (!isNaN(parsed))
          rawValue = judul.formula
            ? evaluateFormula(judul.formula, { pem: parsed })
            : parsed;
      } else if (type === 'Satu Faktor') {
        const parsed = parseNumber(judul.valuePembilang);
        if (!isNaN(parsed))
          rawValue = judul.formula
            ? evaluateFormula(judul.formula, { pem: parsed })
            : parsed;
      } else if (type === 'Dua Faktor') {
        const pem = parseNumber(judul.valuePembilang);
        const pen = parseNumber(judul.valuePenyebut);
        if (!isNaN(pem) && !isNaN(pen)) {
          rawValue = judul.formula
            ? evaluateFormula(judul.formula, { pem, pen })
            : pen !== 0
              ? pem / pen
              : NaN;
        }
      }

      let peringkat: number | null = null;
      const ri = nilai.riskindikator || {};
      const ranges = [
        { key: 'low', rank: 1 },
        { key: 'lowToModerate', rank: 2 },
        { key: 'moderate', rank: 3 },
        { key: 'moderateToHigh', rank: 4 },
        { key: 'high', rank: 5 },
      ];

      if (!isNaN(rawValue)) {
        const highText = String(ri.high ?? '').trim();
        if (/^[xX]?\s*>|≥?>\s*\d+/i.test(highText)) {
          const match = highText.match(/(\d+(\.\d+)?)/);
          if (match && rawValue >= Number(match[1])) peringkat = 5;
        }

        if (peringkat === null) {
          for (const { key, rank } of ranges) {
            const rawText = String(ri[key] ?? '');
            const nums = rawText.match(/-?\d+(\.\d+)?/g);
            if (!nums || nums.length === 0) continue;

            let min = -Infinity,
              max = Infinity;
            if (nums.length === 1) {
              const n = Number(nums[0]);
              if (/≤|<=/.test(rawText)) max = n;
              else if (/≥|>=/.test(rawText)) min = n;
              else if (/^[xX]?\s*>|>\s*\d+/i.test(rawText)) {
                min = n;
                max = Infinity;
              } else if (/^[xX]?\s*<|<\s*\d+/i.test(rawText)) {
                min = -Infinity;
                max = n;
              } else {
                min = n;
                max = n;
              }
            } else {
              min = Number(nums[0]);
              max = Number(nums[1]);
            }

            if (rawValue >= min && rawValue <= max) {
              peringkat = rank;
              break;
            }
          }
        }
      }

      if (peringkat === null && !isNaN(rawValue)) {
        if (rawValue <= 1.5) peringkat = 1;
        else if (rawValue <= 2.5) peringkat = 2;
        else if (rawValue <= 3.5) peringkat = 3;
        else if (rawValue <= 4.5) peringkat = 4;
        else peringkat = 5;
      }

      const weighted =
        peringkat !== null
          ? Math.round(
              paramBobotFraction * nilaiBobotFraction * peringkat * 10000,
            ) / 10000
          : 0;

      return { weighted };
    } catch (error) {
      return { weighted: 0 };
    }
  }

  // ==================== GET KPMR SUMMARY ====================
  async getKpmrSummary(config: ModuleConfig, year?: number): Promise<number> {
    try {
      const qb = config.kpmrRepo
        .createQueryBuilder('k')
        .leftJoinAndSelect('k.aspekList', 'aspek')
        .leftJoinAndSelect('aspek.pertanyaanList', 'pertanyaan')
        .where('k.isActive = :isActive', { isActive: true })
        .orderBy('k.year', 'DESC')
        .limit(1);

      if (year) {
        qb.andWhere('k.year = :year', { year });
      }

      const kpmr = await qb.getOne();

      if (!kpmr) return 0;

      if (kpmr.summary?.averageScore != null) return kpmr.summary.averageScore;

      let totalScore = 0;
      let totalQuestions = 0;

      for (const aspek of kpmr.aspekList || []) {
        for (const pertanyaan of aspek.pertanyaanList || []) {
          const scores: number[] = [];
          if (
            pertanyaan.skor?.Q1 &&
            pertanyaan.skor.Q1 >= 1 &&
            pertanyaan.skor.Q1 <= 5
          )
            scores.push(pertanyaan.skor.Q1);
          if (
            pertanyaan.skor?.Q2 &&
            pertanyaan.skor.Q2 >= 1 &&
            pertanyaan.skor.Q2 <= 5
          )
            scores.push(pertanyaan.skor.Q2);
          if (
            pertanyaan.skor?.Q3 &&
            pertanyaan.skor.Q3 >= 1 &&
            pertanyaan.skor.Q3 <= 5
          )
            scores.push(pertanyaan.skor.Q3);
          if (
            pertanyaan.skor?.Q4 &&
            pertanyaan.skor.Q4 >= 1 &&
            pertanyaan.skor.Q4 <= 5
          )
            scores.push(pertanyaan.skor.Q4);

          if (scores.length > 0) {
            totalScore += scores.reduce((a, b) => a + b, 0) / scores.length;
            totalQuestions++;
          }
        }
      }

      const averageScore =
        totalQuestions > 0
          ? Number((totalScore / totalQuestions).toFixed(2))
          : 0;

      if (averageScore > 0 && kpmr.id) {
        await config.kpmrRepo.update(kpmr.id, {
          summary: { totalScore, averageScore, computedAt: new Date() },
        } as any);
      }

      return averageScore;
    } catch (error) {
      this.logger.error(`Error getting KPMR summary for ${config.name}: ${error.message}`);
      return 0;
    }
  }

  // ==================== HELPERS ====================
  private getSummaryBg(totalWeighted: number): string {
    if (totalWeighted <= 1) return 'bg-green-400 text-black';
    if (totalWeighted <= 2) return 'bg-lime-300 text-black';
    if (totalWeighted <= 3) return 'bg-yellow-400 text-black';
    if (totalWeighted <= 4) return 'bg-orange-400 text-black';
    return 'bg-red-500 text-white';
  }

  async getCategorySummary(
    categoryId: string,
    year?: number,
    quarter?: number,
  ): Promise<KategoriSummaryDto | null> {
    const config = this.moduleConfigs.get(categoryId);
    if (!config) return null;
    const inherentSummary =
      year && quarter ? await this.getInherentSummary(config, year, quarter) : 0;
    const kpmrSummary = year ? await this.getKpmrSummary(config, year) : 0;
    return { id: categoryId, nama: config.label, inherentSummary, kpmrSummary };
  }

  async recalculateSummary(year: number, quarter: number): Promise<any> {
    const results: Array<{ id: string; name: string; totalWeighted: number }> = [];
    for (const [catId, config] of this.moduleConfigs) {
      const summary = await this.getInherentSummary(config, year, quarter);
      results.push({
        id: catId,
        name: config.label,
        totalWeighted: summary,
      });
    }
    return {
      success: true,
      year,
      quarter,
      data: results,
      message: `Summary berhasil dihitung ulang untuk semua module`,
    };
  }

  async recalculateAllSummaries(): Promise<any> {
    let totalProcessed = 0;
    const results: Record<string, any[]> = {};

    for (const [catId, config] of this.moduleConfigs) {
      const allData = await config.inherentRepo
        .createQueryBuilder('o')
        .where('o.isActive = :isActive', { isActive: true })
        .getMany();

      const moduleResults: any[] = [];
      for (const data of allData) {
        const summary = await this.getInherentSummary(
          config,
          data.year,
          Number(data.quarter),
        );
        moduleResults.push({
          id: data.id,
          year: data.year,
          quarter: Number(data.quarter),
          totalWeighted: summary,
        });
        totalProcessed++;
      }
      results[catId] = moduleResults;
    }

    return {
      success: true,
      totalProcessed,
      data: results,
      message: `Berhasil menghitung ulang ${totalProcessed} data dari semua kategori`,
    };
  }
}
