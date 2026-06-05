// ringkasan.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RingkasanQueryDto,
  PageDataDto,
  SummaryItemDto,
  NilaiItemDto,
  KategoriDto,
} from './dto/ringkasan.dto';

// operasional-ojk
import { Operasional } from '../operasional-ojk/operasional-ojk/entities/operasional-ojk.entity';
import { OperasionalParameter } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-parameter.entity';
import { OperasionalNilai } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-nilai.entity';

// hukum-ojk
import { HukumOjk } from '../hukum-ojk/hukum-ojk/entities/hukum-ojk.entity';
import { HukumParameter } from '../hukum-ojk/hukum-ojk/entities/hukum-paramater.entity';
import { HukumNilai } from '../hukum-ojk/hukum-ojk/entities/hukum-nilai.entity';

// investasi-ojk
import { Investasi } from '../investasi-ojk/investasi-ojk/entities/investasi-ojk.entity';
import { InvestasiParameter } from '../investasi-ojk/investasi-ojk/entities/investasi-produk-parameter.entity';
import { InvestasiNilai } from '../investasi-ojk/investasi-ojk/entities/investasi-produk-nilai.entity';

// kepatuhan-ojk
import { KepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-ojk.entity';
import { KepatuhanParameter } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-paramater.entity';
import { KepatuhanNilai } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-nilai.entity';

// konsentrasi-produk
import { KonsentrasiProdukOjk } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-ojk.entity';
import { KonsentrasiParameter } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-paramter.entity';
import { KonsentrasiNilai } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-nilai.entity';

// kredit-produk
import { Kredit } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-ojk.entity';
import { KreditParameter } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-parameter.entity';
import { KreditNilai } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-nilai.entity';

// likuiditas-produk
import { Likuiditas } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-ojk.entity';
import { LikuiditasParameter } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-parameter.entity';
import { LikuiditasNilai } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-nilai.entity';

// pasar-produk
import { PasarProduk } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-ojk.entity';
import { PasarProdukParameter } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-parameter.entity';
import { PasarProdukNilai } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-nilai.entity';

// permodalan-ojk
import { Permodalan } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-ojk.entity';
import { PermodalanParameter } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-produk-parameter.entity';
import { PermodalanNilai } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-produk-nilai.entity';

// rentabilitas-ojk
import { Rentabilitas } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-ojk.entity';
import { RentabilitasParameter } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-parameter.entity';
import { RentabilitasNilai } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-nilai.entity';

// reputasi-ojk
import { Reputasi } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-ojk.entity';
import { ReputasiParameter } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-parameter.entity';
import { ReputasiNilai } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-nilai.entity';

// strategis-ojk
import { Strategis } from '../strategis-ojk/strategis-ojk/entities/strategis-ojk.entity';
import { StrategisParameter } from '../strategis-ojk/strategis-ojk/entities/strategis-parameter.entity';
import { StrategisNilai } from '../strategis-ojk/strategis-ojk/entities/strategis-nilai.entity';

// tatakelola-ojk
import { Tatakelola } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-ojk.entity';
import { TatakelolaParameter } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-produk-parameter.entity';
import { TatakelolaNilai } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-produk-nilai.entity';

interface DerivedResult {
  weighted: number;
  riskLevel: number;
  hasilDisplay: string;
  peringkat: number | null;
}

interface ModuleConfig {
  name: string;
  label: string;
  headerRepo: any;
  paramRepo: any;
  nilaiRepo: any;
}

@Injectable()
export class RingkasanService {
  private readonly logger = new Logger(RingkasanService.name);
  private moduleConfigs: Map<string, ModuleConfig>;

  private readonly CATEGORY_MAP: Record<
    string,
    { label: string; code: string }
  > = {
    'pasar-produk': { label: 'Pasar Produk', code: 'PSR' },
    'likuiditas-produk': { label: 'Likuiditas Produk', code: 'LKD' },
    'kredit-produk': { label: 'Kredit Produk', code: 'KRD' },
    'konsentrasi-produk': { label: 'Konsentrasi Produk', code: 'KTS' },
    operasional: { label: 'Operasional', code: 'OPS' },
    'hukum-regulatory': { label: 'Hukum', code: 'HKM' },
    'kepatuhan-regulatory': { label: 'Kepatuhan', code: 'KTH' },
    'reputasi-regulatory': { label: 'Reputasi', code: 'RTS' },
    'strategis-regulatory': { label: 'Strategis', code: 'STG' },
    'investasi-regulatory': { label: 'Investasi', code: 'INV' },
    'rentabilitas-regulatory': { label: 'Rentabilitas', code: 'RNT' },
    'permodalan-regulatory': { label: 'Permodalan', code: 'PMDL' },
    'tatakelola-regulatory': { label: 'Tata Kelola', code: 'TKL' },
  };

  constructor(
    @InjectRepository(Operasional)
    private readonly operasionalRepo: Repository<Operasional>,
    @InjectRepository(OperasionalParameter)
    private readonly operasionalParameterRepo: Repository<OperasionalParameter>,
    @InjectRepository(OperasionalNilai)
    private readonly operasionalNilaiRepo: Repository<OperasionalNilai>,

    @InjectRepository(HukumOjk)
    private readonly hukumRepo: Repository<HukumOjk>,
    @InjectRepository(HukumParameter)
    private readonly hukumParamRepo: Repository<HukumParameter>,
    @InjectRepository(HukumNilai)
    private readonly hukumNilaiRepo: Repository<HukumNilai>,

    @InjectRepository(Investasi)
    private readonly investasiRepo: Repository<Investasi>,
    @InjectRepository(InvestasiParameter)
    private readonly investasiParamRepo: Repository<InvestasiParameter>,
    @InjectRepository(InvestasiNilai)
    private readonly investasiNilaiRepo: Repository<InvestasiNilai>,

    @InjectRepository(KepatuhanOjk)
    private readonly kepatuhanRepo: Repository<KepatuhanOjk>,
    @InjectRepository(KepatuhanParameter)
    private readonly kepatuhanParamRepo: Repository<KepatuhanParameter>,
    @InjectRepository(KepatuhanNilai)
    private readonly kepatuhanNilaiRepo: Repository<KepatuhanNilai>,

    @InjectRepository(KonsentrasiProdukOjk)
    private readonly konsentrasiRepo: Repository<KonsentrasiProdukOjk>,
    @InjectRepository(KonsentrasiParameter)
    private readonly konsentrasiParamRepo: Repository<KonsentrasiParameter>,
    @InjectRepository(KonsentrasiNilai)
    private readonly konsentrasiNilaiRepo: Repository<KonsentrasiNilai>,

    @InjectRepository(Kredit)
    private readonly kreditRepo: Repository<Kredit>,
    @InjectRepository(KreditParameter)
    private readonly kreditParamRepo: Repository<KreditParameter>,
    @InjectRepository(KreditNilai)
    private readonly kreditNilaiRepo: Repository<KreditNilai>,

    @InjectRepository(Likuiditas)
    private readonly likuiditasRepo: Repository<Likuiditas>,
    @InjectRepository(LikuiditasParameter)
    private readonly likuiditasParamRepo: Repository<LikuiditasParameter>,
    @InjectRepository(LikuiditasNilai)
    private readonly likuiditasNilaiRepo: Repository<LikuiditasNilai>,

    @InjectRepository(PasarProduk)
    private readonly pasarRepo: Repository<PasarProduk>,
    @InjectRepository(PasarProdukParameter)
    private readonly pasarParamRepo: Repository<PasarProdukParameter>,
    @InjectRepository(PasarProdukNilai)
    private readonly pasarNilaiRepo: Repository<PasarProdukNilai>,

    @InjectRepository(Permodalan)
    private readonly permodalanRepo: Repository<Permodalan>,
    @InjectRepository(PermodalanParameter)
    private readonly permodalanParamRepo: Repository<PermodalanParameter>,
    @InjectRepository(PermodalanNilai)
    private readonly permodalanNilaiRepo: Repository<PermodalanNilai>,

    @InjectRepository(Rentabilitas)
    private readonly rentabilitasRepo: Repository<Rentabilitas>,
    @InjectRepository(RentabilitasParameter)
    private readonly rentabilitasParamRepo: Repository<RentabilitasParameter>,
    @InjectRepository(RentabilitasNilai)
    private readonly rentabilitasNilaiRepo: Repository<RentabilitasNilai>,

    @InjectRepository(Reputasi)
    private readonly reputasiRepo: Repository<Reputasi>,
    @InjectRepository(ReputasiParameter)
    private readonly reputasiParamRepo: Repository<ReputasiParameter>,
    @InjectRepository(ReputasiNilai)
    private readonly reputasiNilaiRepo: Repository<ReputasiNilai>,

    @InjectRepository(Strategis)
    private readonly strategisRepo: Repository<Strategis>,
    @InjectRepository(StrategisParameter)
    private readonly strategisParamRepo: Repository<StrategisParameter>,
    @InjectRepository(StrategisNilai)
    private readonly strategisNilaiRepo: Repository<StrategisNilai>,

    @InjectRepository(Tatakelola)
    private readonly tatakelolaRepo: Repository<Tatakelola>,
    @InjectRepository(TatakelolaParameter)
    private readonly tatakelolaParamRepo: Repository<TatakelolaParameter>,
    @InjectRepository(TatakelolaNilai)
    private readonly tatakelolaNilaiRepo: Repository<TatakelolaNilai>,
  ) {
    this.moduleConfigs = new Map<string, ModuleConfig>();

    this.moduleConfigs.set('operasional', {
      name: 'operasional',
      label: this.getCategoryLabel('operasional'),
      headerRepo: operasionalRepo,
      paramRepo: operasionalParameterRepo,
      nilaiRepo: operasionalNilaiRepo,
    });
    this.moduleConfigs.set('pasar-produk', {
      name: 'pasar-produk',
      label: this.getCategoryLabel('pasar-produk'),
      headerRepo: pasarRepo,
      paramRepo: pasarParamRepo,
      nilaiRepo: pasarNilaiRepo,
    });
    this.moduleConfigs.set('likuiditas-produk', {
      name: 'likuiditas-produk',
      label: this.getCategoryLabel('likuiditas-produk'),
      headerRepo: likuiditasRepo,
      paramRepo: likuiditasParamRepo,
      nilaiRepo: likuiditasNilaiRepo,
    });
    this.moduleConfigs.set('kredit-produk', {
      name: 'kredit-produk',
      label: this.getCategoryLabel('kredit-produk'),
      headerRepo: kreditRepo,
      paramRepo: kreditParamRepo,
      nilaiRepo: kreditNilaiRepo,
    });
    this.moduleConfigs.set('konsentrasi-produk', {
      name: 'konsentrasi-produk',
      label: this.getCategoryLabel('konsentrasi-produk'),
      headerRepo: konsentrasiRepo,
      paramRepo: konsentrasiParamRepo,
      nilaiRepo: konsentrasiNilaiRepo,
    });
    this.moduleConfigs.set('hukum-regulatory', {
      name: 'hukum-regulatory',
      label: this.getCategoryLabel('hukum-regulatory'),
      headerRepo: hukumRepo,
      paramRepo: hukumParamRepo,
      nilaiRepo: hukumNilaiRepo,
    });
    this.moduleConfigs.set('kepatuhan-regulatory', {
      name: 'kepatuhan-regulatory',
      label: this.getCategoryLabel('kepatuhan-regulatory'),
      headerRepo: kepatuhanRepo,
      paramRepo: kepatuhanParamRepo,
      nilaiRepo: kepatuhanNilaiRepo,
    });
    this.moduleConfigs.set('reputasi-regulatory', {
      name: 'reputasi-regulatory',
      label: this.getCategoryLabel('reputasi-regulatory'),
      headerRepo: reputasiRepo,
      paramRepo: reputasiParamRepo,
      nilaiRepo: reputasiNilaiRepo,
    });
    this.moduleConfigs.set('strategis-regulatory', {
      name: 'strategis-regulatory',
      label: this.getCategoryLabel('strategis-regulatory'),
      headerRepo: strategisRepo,
      paramRepo: strategisParamRepo,
      nilaiRepo: strategisNilaiRepo,
    });
    this.moduleConfigs.set('investasi-regulatory', {
      name: 'investasi-regulatory',
      label: this.getCategoryLabel('investasi-regulatory'),
      headerRepo: investasiRepo,
      paramRepo: investasiParamRepo,
      nilaiRepo: investasiNilaiRepo,
    });
    this.moduleConfigs.set('rentabilitas-regulatory', {
      name: 'rentabilitas-regulatory',
      label: this.getCategoryLabel('rentabilitas-regulatory'),
      headerRepo: rentabilitasRepo,
      paramRepo: rentabilitasParamRepo,
      nilaiRepo: rentabilitasNilaiRepo,
    });
    this.moduleConfigs.set('permodalan-regulatory', {
      name: 'permodalan-regulatory',
      label: this.getCategoryLabel('permodalan-regulatory'),
      headerRepo: permodalanRepo,
      paramRepo: permodalanParamRepo,
      nilaiRepo: permodalanNilaiRepo,
    });
    this.moduleConfigs.set('tatakelola-regulatory', {
      name: 'tatakelola-regulatory',
      label: this.getCategoryLabel('tatakelola-regulatory'),
      headerRepo: tatakelolaRepo,
      paramRepo: tatakelolaParamRepo,
      nilaiRepo: tatakelolaNilaiRepo,
    });
  }

  // ==================== GET RINGKASAN ====================
  async getRingkasan(query: RingkasanQueryDto): Promise<PageDataDto[]> {
    const { year, quarter, categoryIds } = query;
    const results: PageDataDto[] = [];
    let counter = 0;

    for (const categoryId of categoryIds) {
      counter++;
      try {
        const pageData = await this.getDataByCategory(
          categoryId,
          year,
          quarter,
          query,
          counter,
        );
        results.push(pageData);
      } catch (error) {
        this.logger.error(
          `Error fetching data for category ${categoryId}: ${error.message}`,
          error.stack,
        );
        results.push(this.createEmptyPage(categoryId, counter, error.message));
      }
    }

    return results;
  }

  // ==================== GET DATA BY CATEGORY ====================
  private async getDataByCategory(
    categoryId: string,
    year: number,
    quarter: number,
    query: RingkasanQueryDto,
    no: number,
  ): Promise<PageDataDto> {
    const config = this.moduleConfigs.get(categoryId);
    if (!config) {
      this.logger.warn(`Category config not found for categoryId=${categoryId}`);
      return this.createEmptyPage(categoryId, no);
    }

    const header = await config.headerRepo
      .createQueryBuilder('header')
      .leftJoinAndSelect('header.parameters', 'params')
      .leftJoinAndSelect('params.nilaiList', 'nilai')
      .where('header.year = :year', { year })
      .andWhere('header.quarter = :quarter', { quarter })
      .orderBy('params.orderIndex', 'ASC')
      .addOrderBy('nilai.orderIndex', 'ASC')
      .getOne();

    if (!header) {
      this.logger.warn(
        `Header not found for categoryId=${categoryId}, year=${year}, quarter=${quarter}`,
      );
      return this.createEmptyPage(categoryId, no);
    }

    const parameters = header.parameters || [];
    this.logger.log(
      `🔍 Found ${parameters.length} parameters for categoryId=${categoryId}, headerId=${header.id}`,
    );

    return this.buildResponse(categoryId, parameters, query, no);
  }

  // ==================== BUILD RESPONSE ====================
  private buildResponse(
    categoryId: string,
    parameters: any[],
    query: RingkasanQueryDto,
    no: number,
  ): PageDataDto {
    let rows: SummaryItemDto[] = parameters.map((param) =>
      this.transformParameterToSummaryItem(param),
    );

    rows = this.filterRowsByKategori(rows, query);

    const totalWeighted = this.calculateTotalWeighted(rows);

    this.logger.log(`Returning ${rows.length} rows`);

    return {
      no,
      categoryId,
      categoryLabel: this.getCategoryLabel(categoryId),
      categoryCode: this.getCategoryCode(categoryId),
      rows,
      totalWeighted,
      hasData: rows.length > 0,
    };
  }

  // ==================== TRANSFORM PARAMETER ====================
  private transformParameterToSummaryItem(
    param: any,
  ): SummaryItemDto {
    const nilaiList: NilaiItemDto[] = (param.nilaiList ?? []).map((nilai) =>
      this.transformNilaiToNilaiItem(nilai, param),
    );

    const kategori: KategoriDto = this.normalizeKategori(param.kategori);

    return {
      id: String(param.id),
      nomor: param.nomor,
      judul: param.judul,
      bobot: Number(param.bobot) || 0,
      kategori,
      nilaiList,
    };
  }

  // ==================== TRANSFORM NILAI ====================
  private transformNilaiToNilaiItem(
    nilai: any,
    param: any,
  ): NilaiItemDto {
    const bobot = Number(nilai.bobot) || 0;
    const judulData = nilai.judul || {};

    const judul = {
      text: judulData?.text || nilai.keterangan || '',
      pembilang: judulData?.pembilang || '',
      penyebut: judulData?.penyebut || '',
      type: judulData?.type || 'Tanpa Faktor',
      value:
        judulData?.value !== undefined
          ? judulData.value
          : judulData?.valuePembilang,
      valuePembilang:
        judulData?.valuePembilang !== undefined ? judulData.valuePembilang : '',
      valuePenyebut:
        judulData?.valuePenyebut !== undefined ? judulData.valuePenyebut : '',
      formula: judulData?.formula,
      percent: judulData?.percent,
    };

    const derived = this.computeDerived(nilai, param);

    return {
      id: String(nilai.id),
      nomor: nilai.nomor,
      bobot,
      portofolio: 0,
      judul,
      derived,
    };
  }

  // ==================== COMPUTE DERIVED (SAMA DENGAN FRONTEND) ====================
  private computeDerived(
    nilai: any,
    param: any,
  ): DerivedResult {
    try {
      if (!nilai) return this.emptyDerived();

      const judul = (nilai.judul || {}) as any;
      const paramBobotFraction = Number(param?.bobot ?? 0) / 100;
      const nilaiBobotFraction = Number(nilai?.bobot ?? 0) / 100;

      // ==================== HELPERS ====================
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
          const re = new RegExp(`\\b${token}\\b`, 'gi');
          e = e.replace(re, String(value));
        }
        const safeRe = /^[0-9eE\.\+\-\*\/\(\)\s]+$/;
        if (!safeRe.test(e)) return NaN;
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

      // ==================== RAW VALUE ====================
      let rawValue: number = NaN;
      const type = judul.type || 'Tanpa Faktor';

      if (type === 'Tanpa Faktor') {
        const v = judul.value;
        const formula = (judul.formula || '').trim();
        const parsed = parseNumber(v);
        if (!isNaN(parsed)) {
          rawValue = formula
            ? evaluateFormula(formula, { pem: parsed })
            : parsed;
        }
      } else if (type === 'Satu Faktor') {
        const v = judul.valuePembilang;
        const formula = (judul.formula || '').trim();
        const parsed = parseNumber(v);
        if (!isNaN(parsed)) {
          rawValue = formula
            ? evaluateFormula(formula, { pem: parsed })
            : parsed;
        }
      } else if (type === 'Dua Faktor') {
        const vPem = judul.valuePembilang;
        const vPen = judul.valuePenyebut;
        const formula = (judul.formula || '').trim();
        const pem = parseNumber(vPem);
        const pen = parseNumber(vPen);
        if (!isNaN(pem) && !isNaN(pen)) {
          rawValue = formula
            ? evaluateFormula(formula, { pem, pen })
            : pen !== 0
              ? pem / pen
              : NaN;
        }
      }

      // ==================== RANKING DARI RISKINDIKATOR ====================
      let peringkat: number | null = null;
      const ri = (nilai.riskindikator || {}) as any;
      const ranges = [
        { key: 'low', rank: 1 },
        { key: 'lowToModerate', rank: 2 },
        { key: 'moderate', rank: 3 },
        { key: 'moderateToHigh', rank: 4 },
        { key: 'high', rank: 5 },
      ];

      if (!isNaN(rawValue)) {
        const highText = String(ri.high ?? '').trim();
        const isGreaterThanFormat = /^[xX]?\s*>|≥?>\s*\d+/i.test(highText);
        if (isGreaterThanFormat) {
          const match = highText.match(/(\d+(\.\d+)?)/);
          if (match && rawValue >= Number(match[1])) {
            peringkat = 5;
          }
        }

        if (peringkat === null) {
          for (const { key, rank } of ranges) {
            const rawText = String(ri[key] ?? '');
            const nums = rawText.match(/-?\d+(\.\d+)?/g);
            if (!nums || nums.length === 0) continue;

            let min = -Infinity;
            let max = Infinity;

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

      // ==================== RISK LEVEL FALLBACK ====================
      let riskLevel = 0;
      if (peringkat !== null) {
        riskLevel = peringkat;
      } else if (!isNaN(rawValue)) {
        if (rawValue <= 1.5) riskLevel = 1;
        else if (rawValue <= 2.5) riskLevel = 2;
        else if (rawValue <= 3.5) riskLevel = 3;
        else if (rawValue <= 4.5) riskLevel = 4;
        else riskLevel = 5;
      }

      // ==================== WEIGHTED ====================
      let weighted: number;
      if (peringkat !== null) {
        weighted =
          Math.round(
            paramBobotFraction * nilaiBobotFraction * peringkat * 10000,
          ) / 10000;
      } else if (!isNaN(rawValue)) {
        weighted =
          Math.round(
            paramBobotFraction * nilaiBobotFraction * rawValue * 10000,
          ) / 10000;
      } else {
        weighted = 0;
      }

      // ==================== HASIL DISPLAY ====================
      let hasilDisplay = '';
      if (!isNaN(rawValue)) {
        hasilDisplay = rawValue.toFixed(2);
        if (judul.percent) hasilDisplay += '%';
      }

      this.logger.log(
        `computeDerived: id=${nilai.id}, type=${type}, rawValue=${rawValue}, bobotParam=${param?.bobot}, bobotNilai=${nilai?.bobot}, peringkat=${peringkat}, weighted=${weighted}, riskLevel=${riskLevel}`,
      );

      return {
        weighted: isNaN(weighted) ? 0 : weighted,
        riskLevel,
        hasilDisplay,
        peringkat,
      };
    } catch (error) {
      this.logger.error('Error in computeDerived:', error);
      return this.emptyDerived();
    }
  }

  private emptyDerived(): DerivedResult {
    return { weighted: 0, riskLevel: 0, hasilDisplay: '', peringkat: null };
  }

  // ==================== NORMALIZE KATEGORI ====================
  private normalizeKategori(kategori: any): KategoriDto {
    if (!kategori || typeof kategori !== 'object') {
      return { model: '', prinsip: '', jenis: '', underlying: [] };
    }
    return {
      model: kategori.model || '',
      prinsip: kategori.prinsip || '',
      jenis: kategori.jenis || '',
      underlying: Array.isArray(kategori.underlying) ? kategori.underlying : [],
    };
  }

  // ==================== FILTER ====================
  private filterRowsByKategori(
    rows: SummaryItemDto[],
    query: RingkasanQueryDto,
  ): SummaryItemDto[] {
    if (!Array.isArray(rows)) return [];

    if (
      !query.model &&
      !query.prinsip &&
      !query.jenis &&
      (!query.underlying || query.underlying.length === 0)
    ) {
      return rows;
    }

    return rows.filter((param) => {
      const kategori = param.kategori || {
        model: '',
        prinsip: '',
        jenis: '',
        underlying: [],
      };

      if (query.model && kategori.model !== query.model) return false;
      if (
        query.prinsip &&
        kategori.model !== 'tanpa_model' &&
        kategori.prinsip !== query.prinsip
      )
        return false;
      if (
        query.jenis &&
        kategori.model === 'open_end' &&
        kategori.jenis !== query.jenis
      )
        return false;

      if (Array.isArray(query.underlying) && query.underlying.length > 0) {
        if (kategori.model === 'terstruktur') {
          const paramUnderlying = Array.isArray(kategori.underlying)
            ? kategori.underlying
            : [];
          if (!query.underlying.some((v) => paramUnderlying.includes(v)))
            return false;
        } else if (kategori.model !== 'tanpa_model') {
          return false;
        }
      }

      return true;
    });
  }

  // ==================== CALCULATE TOTAL WEIGHTED ====================
  private calculateTotalWeighted(data: SummaryItemDto[]): number {
    if (!Array.isArray(data)) return 0;

    let totalWeighted = 0;
    let count = 0;

    data.forEach((param) => {
      param?.nilaiList?.forEach((item) => {
        if (
          item?.derived?.weighted !== undefined &&
          !isNaN(item.derived.weighted)
        ) {
          totalWeighted += item.derived.weighted;
          count++;
        }
      });
    });

    return count > 0 ? Math.round((totalWeighted / count) * 100) / 100 : 0;
  }

  // ==================== HELPERS ====================
  private getCategoryLabel(categoryId: string): string {
    return this.CATEGORY_MAP[categoryId]?.label || categoryId;
  }

  private getCategoryCode(categoryId: string): string {
    return this.CATEGORY_MAP[categoryId]?.code || categoryId.toUpperCase();
  }

  private createEmptyPage(
    categoryId: string,
    no: number,
    error?: string,
  ): PageDataDto {
    return {
      no,
      categoryId,
      categoryLabel: this.getCategoryLabel(categoryId),
      categoryCode: this.getCategoryCode(categoryId),
      rows: [],
      totalWeighted: 0,
      hasData: false,
      ...(error ? { error } : {}),
    };
  }
}
