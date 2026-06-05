import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ✅ Import entity dari folder entities
import { RiskProfileRepositoryOjkView, ModuleTypeOjk, Quarter } from './entities/resiko-profile-repository-ojk.entity';

// ✅ Import DTO dari folder dto
import { RiskProfileRepositoryOjkDto } from './dto/risk-profile-repository-ojk.dto';

export interface RepositoryFilters {
  year?: number;
  quarter?: Quarter;
  moduleTypes?: ModuleTypeOjk[];
  searchQuery?: string;
  isValidated?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RepositoryResponse {
  data: RiskProfileRepositoryOjkDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statistics: {
    totalModules: number;
    totalIndicators: number;
    totalWeighted: number;
    moduleBreakdown: {
      module: string;
      count: number;
      totalWeighted: number;
    }[];
  };
}

export interface RepositoryStatistics {
  totalModules: number;
  totalIndicators: number;
  totalWeighted: number;
  byModule: {
    module: string;
    count: number;
    totalWeighted: number;
    averageWeighted: number;
  }[];
  byQuarter: {
    quarter: Quarter;
    count: number;
    totalWeighted: number;
  }[];
  validationStatus: {
    validated: number;
    notValidated: number;
  };
}

@Injectable()
export class ResikoProfileRepositoryOjkService {
  constructor(
    @InjectRepository(RiskProfileRepositoryOjkView)
    private readonly repositoryView: Repository<RiskProfileRepositoryOjkView>,
  ) {}

  // =========================================================================
  // RATING COMPUTATION (mirrors logic in inherent OJK services)
  // =========================================================================

  private parseNumber(v: any): number {
    if (v == null || v === '' || v === undefined) return NaN;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      let cleaned = v.trim().replace(/\s/g, '');
      const isPercent = cleaned.includes('%');
      cleaned = cleaned.replace('%', '').replace(/\./g, '').replace(/,/g, '.');
      const num = Number(cleaned);
      if (!isNaN(num) && isPercent) return num / 100;
      return num;
    }
    return Number(v);
  }

  private evaluateFormula(expr: string, subs: Record<string, number>): number {
    if (!expr || typeof expr !== 'string' || expr.trim() === '') return NaN;
    let e = expr.trim();
    for (const [token, value] of Object.entries(subs)) {
      const re = new RegExp(`\\b${token}\\b`, 'gi');
      e = e.replace(re, String(value));
    }
    const safeRe = /^[0-9eE\.\+\-\*\/\(\)\s]+$/;
    if (!safeRe.test(e)) return NaN;
    try {
      const fn = new Function(`"use strict"; return (${e});`);
      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) return val;
      return NaN;
    } catch {
      return NaN;
    }
  }

  private computeRating(entity: RiskProfileRepositoryOjkView): {
    hasil: number | null;
    hasilText: string | null;
    peringkat: number;
    weighted: number;
  } {
    // 1. Compute rawValue from mode / formula / values
    const mode = entity.mode;
    let rawValue = NaN;
    let rawString: string | null = null;
    const formula = (entity.formula || '').trim();

    if (mode === 'Tanpa Faktor') {
      const pem = this.parseNumber(entity.pembilangValue);
      if (!isNaN(pem)) {
        rawValue = formula ? this.evaluateFormula(formula, { pem }) : pem;
      } else if (entity.pembilangLabel && entity.pembilangLabel.trim() !== '') {
        rawString = entity.pembilangLabel.trim().toLowerCase();
      }
    } else if (mode === 'Satu Faktor') {
      const pem = this.parseNumber(entity.pembilangValue);
      if (!isNaN(pem)) {
        rawValue = formula ? this.evaluateFormula(formula, { pem }) : pem;
      } else if (entity.pembilangLabel && entity.pembilangLabel.trim() !== '') {
        rawString = entity.pembilangLabel.trim().toLowerCase();
      }
    } else if (mode === 'Dua Faktor') {
      const pem = this.parseNumber(entity.pembilangValue);
      const pen = this.parseNumber(entity.penyebutValue);
      if (!isNaN(pem) && !isNaN(pen)) {
        rawValue = formula
          ? this.evaluateFormula(formula, { pem, pen })
          : pen !== 0
            ? pem / pen
            : NaN;
      } else if (entity.pembilangLabel && entity.pembilangLabel.trim() !== '') {
        rawString = entity.pembilangLabel.trim().toLowerCase();
      }
    }

    // 2. Compute hasil display value
    let hasil: number | null = null;
    let hasilText: string | null = null;
    if (!isNaN(rawValue)) {
      hasil = rawValue;
    } else if (rawString) {
      hasilText = rawString;
    }

    // 3. Match peringkat from risk indicator ranges
    const ranges = [
      { key: 'low', rank: 1 },
      { key: 'lowToModerate', rank: 2 },
      { key: 'moderate', rank: 3 },
      { key: 'moderateToHigh', rank: 4 },
      { key: 'high', rank: 5 },
    ];

    const ri: Record<string, string | null> = {
      low: entity.low,
      lowToModerate: entity.lowToModerate,
      moderate: entity.moderate,
      moderateToHigh: entity.moderateToHigh,
      high: entity.high,
    };

    let peringkat: number = 0;

    if (!isNaN(rawValue)) {
      for (const { key, rank } of ranges) {
        const rawText = String(ri[key] ?? '');
        const nums = rawText.match(/-?\d+(\.\d+)?/g);
        if (!nums || nums.length === 0) continue;

        const hasPercent = rawText.includes('%');
        let min = -Infinity;
        let max = Infinity;

        if (nums.length === 1) {
          let n = Number(nums[0]);
          if (hasPercent) n = n / 100;
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
          let n1 = Number(nums[0]);
          let n2 = Number(nums[1]);
          if (hasPercent) {
            n1 = n1 / 100;
            n2 = n2 / 100;
          }
          min = Math.min(n1, n2);
          max = Math.max(n1, n2);
        }

        if (rawValue >= min && rawValue <= max) {
          peringkat = rank;
          break;
        }
      }
    } else if (rawString) {
      for (const { key, rank } of ranges) {
        const riValue = String(ri[key] ?? '').trim().toLowerCase();
        if (riValue && riValue === rawString) {
          peringkat = rank;
          break;
        }
      }
    }

    // 4. Compute weighted = paramBobot * indikatorBobot * peringkat
    const paramBobotFraction = (Number(entity.bobotSection) || 0) / 100;
    const nilaiBobotFraction = (Number(entity.bobotIndikator) || 0) / 100;
    const weighted = peringkat > 0 ? paramBobotFraction * nilaiBobotFraction * peringkat : 0;

    return { hasil, hasilText, peringkat, weighted };
  }

  async getRepositoryData(
    filters: RepositoryFilters,
    pagination: PaginationOptions,
  ): Promise<RepositoryResponse> {
    try {
      const { page, limit, sortBy, sortOrder } = pagination;

      const queryBuilder = this.repositoryView.createQueryBuilder('view');

      // Apply filters
      if (filters.year) {
        queryBuilder.andWhere('view.year = :year', { year: filters.year });
      }
      if (filters.quarter) {
        const quarterInt = parseInt(String(filters.quarter).replace('Q', ''), 10);
        queryBuilder.andWhere('view.quarter = :quarter', { quarter: quarterInt });
      }
      if (filters.moduleTypes && filters.moduleTypes.length > 0) {
        queryBuilder.andWhere('view.moduleType IN (:...moduleTypes)', {
          moduleTypes: filters.moduleTypes,
        });
      }
      if (filters.searchQuery) {
        const searchPattern = `%${filters.searchQuery}%`;
        queryBuilder.andWhere(
          '(view.indikator LIKE :search OR view.subNo LIKE :search OR view.sumberRisiko LIKE :search OR view.dampak LIKE :search OR view.parameter LIKE :search OR view.sectionLabel LIKE :search)',
          { search: searchPattern },
        );
      }
      if (filters.isValidated !== undefined) {
        queryBuilder.andWhere('view.isValidated = :isValidated', {
          isValidated: filters.isValidated,
        });
      }

      // Sorting
      if (sortBy) {
        const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`view.${sortBy}`, order);
      } else {
        queryBuilder
          .orderBy('view.moduleType', 'ASC')
          .addOrderBy('view.no', 'ASC')
          .addOrderBy('view.subNo', 'ASC');
      }

      // ✅ Handle limit=0 (fetch all data)
      if (limit === 0) {
        const data = await queryBuilder.getMany();
        const transformedData = data.map((item) => this.transformToDto(item));
        const statistics = this.calculateStatistics(data);
        return {
          data: transformedData,
          total: data.length,
          page: 1,
          limit: 0,
          totalPages: 1,
          statistics,
        };
      }

      // Normal pagination
      const total = await queryBuilder.getCount();
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      const data = await queryBuilder.getMany();

      const transformedData = data.map((item) => this.transformToDto(item));
      const statistics = this.calculateStatistics(data);

      return {
        data: transformedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        statistics,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch OJK repository data: ${error.message}`,
      );
    }
  }

  async getRepositoryDataByModule(
    module: ModuleTypeOjk,
    filters: RepositoryFilters,
    pagination: PaginationOptions,
  ): Promise<RepositoryResponse> {
    const moduleFilters: RepositoryFilters = {
      ...filters,
      moduleTypes: [module],
    };
    return this.getRepositoryData(moduleFilters, pagination);
  }

  async searchRepositoryData(
    query: string,
    filters: RepositoryFilters,
    pagination: PaginationOptions,
  ): Promise<RepositoryResponse> {
    const searchFilters: RepositoryFilters = {
      ...filters,
      searchQuery: query,
    };
    return this.getRepositoryData(searchFilters, pagination);
  }

  async getRepositoryStatistics(
    year: number,
    quarter: Quarter,
  ): Promise<RepositoryStatistics> {
    try {
      const quarterInt = parseInt(String(quarter).replace('Q', ''), 10);
      const data = await this.repositoryView.find({
        where: { year, quarter: quarterInt as any },
      });

      if (data.length === 0) {
        return this.getEmptyStatistics();
      }

      const byModule: Record<string, RiskProfileRepositoryOjkView[]> = {};
      const byQuarter: Record<string, RiskProfileRepositoryOjkView[]> = {};

      data.forEach((item) => {
        if (!byModule[item.moduleType]) byModule[item.moduleType] = [];
        byModule[item.moduleType].push(item);

        const quarterStr = typeof item.quarter === 'number' ? `Q${item.quarter}` : item.quarter;
        if (!byQuarter[quarterStr]) byQuarter[quarterStr] = [];
        byQuarter[quarterStr].push(item);
      });

      const byModuleArray = Object.entries(byModule).map(([module, items]) => {
        const totalWeighted = items.reduce((sum, item) => sum + (item.weighted || 0), 0);
        return {
          module: this.getModuleName(module as ModuleTypeOjk),
          count: items.length,
          totalWeighted,
          averageWeighted: items.length > 0 ? totalWeighted / items.length : 0,
        };
      });

      const byQuarterArray = Object.entries(byQuarter).map(([q, items]) => ({
        quarter: q as Quarter,
        count: items.length,
        totalWeighted: items.reduce((sum, item) => sum + (item.weighted || 0), 0),
      }));

      const validated = data.filter((item) => item.isValidated).length;

      return {
        totalModules: Object.keys(byModule).length,
        totalIndicators: data.length,
        totalWeighted: data.reduce((sum, item) => sum + (item.weighted || 0), 0),
        byModule: byModuleArray,
        byQuarter: byQuarterArray,
        validationStatus: {
          validated,
          notValidated: data.length - validated,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch OJK repository statistics');
    }
  }

  async getAvailablePeriods(): Promise<{ year: number; quarters: Quarter[] }[]> {
    try {
      const result = await this.repositoryView
        .createQueryBuilder('view')
        .select('view.year, view.quarter')
        .groupBy('view.year, view.quarter')
        .orderBy('view.year', 'DESC')
        .addOrderBy('view.quarter', 'DESC')
        .getRawMany();

      const groupedByYear: Record<number, Quarter[]> = {};
      result.forEach((row: any) => {
        const year = row.view_year;
        // Konversi dari DB int 1, 2, 3, 4 ke string 'Q1', 'Q2', dll
        const quarter = typeof row.view_quarter === 'number' ? `Q${row.view_quarter}` as Quarter : row.view_quarter as Quarter;
        if (!groupedByYear[year]) groupedByYear[year] = [];
        if (!groupedByYear[year].includes(quarter)) groupedByYear[year].push(quarter);
      });

      return Object.entries(groupedByYear).map(([year, quarters]) => ({
        year: parseInt(year),
        quarters: quarters as Quarter[],
      }));
    } catch (error) {
      return [];
    }
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  private transformToDto(entity: RiskProfileRepositoryOjkView): RiskProfileRepositoryOjkDto {
    // Compute rating dynamically since the view hardcodes 0 for peringkat/weighted
    const { hasil, hasilText, peringkat, weighted } = this.computeRating(entity);

    return {
      id: entity.id,
      moduleType: entity.moduleType,
      moduleName: this.getModuleName(entity.moduleType),
      year: entity.year,
      // Konversi integer dari view database menjadi enum string (e.g. 1 -> 'Q1')
      quarter: typeof entity.quarter === 'number' ? `Q${entity.quarter}` as Quarter : entity.quarter,
      sectionId: entity.sectionId,
      no: entity.no,
      sectionLabel: entity.sectionLabel,
      bobotSection: entity.bobotSection,
      parameter: entity.parameter,
      sectionDescription: entity.sectionDescription,
      subNo: entity.subNo,
      indikator: entity.indikator,
      bobotIndikator: entity.bobotIndikator,
      sumberRisiko: entity.sumberRisiko,
      dampak: entity.dampak,
      low: entity.low,
      lowToModerate: entity.lowToModerate,
      moderate: entity.moderate,
      moderateToHigh: entity.moderateToHigh,
      high: entity.high,
      mode: entity.mode as any,
      formula: entity.formula,
      isPercent: entity.isPercent,
      pembilangLabel: entity.pembilangLabel,
      pembilangValue: entity.pembilangValue,
      penyebutLabel: entity.penyebutLabel,
      penyebutValue: entity.penyebutValue,
      hasil,
      hasilText,
      peringkat,
      weighted,
      keterangan: entity.keterangan,
      isValidated: entity.isValidated,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }


  private calculateStatistics(data: RiskProfileRepositoryOjkView[]) {
    if (data.length === 0) {
      return {
        totalModules: 0,
        totalIndicators: 0,
        totalWeighted: 0,
        moduleBreakdown: [],
      };
    }

    const moduleBreakdown: Record<string, { count: number; totalWeighted: number }> = {};
    data.forEach((item) => {
      const module = item.moduleType;
      if (!moduleBreakdown[module]) {
        moduleBreakdown[module] = { count: 0, totalWeighted: 0 };
      }
      moduleBreakdown[module].count++;
      moduleBreakdown[module].totalWeighted += item.weighted || 0;
    });

    return {
      totalModules: Object.keys(moduleBreakdown).length,
      totalIndicators: data.length,
      totalWeighted: data.reduce((sum, item) => sum + (item.weighted || 0), 0),
      moduleBreakdown: Object.entries(moduleBreakdown).map(([module, stats]) => ({
        module: this.getModuleName(module as ModuleTypeOjk),
        count: stats.count,
        totalWeighted: stats.totalWeighted,
      })),
    };
  }

  private getEmptyStatistics(): RepositoryStatistics {
    return {
      totalModules: 0,
      totalIndicators: 0,
      totalWeighted: 0,
      byModule: [],
      byQuarter: [],
      validationStatus: { validated: 0, notValidated: 0 },
    };
  }

  private getModuleName(module: ModuleTypeOjk): string {
    const moduleNames: Record<ModuleTypeOjk, string> = {
      [ModuleTypeOjk.PASAR]: 'Pasar',
      [ModuleTypeOjk.LIKUIDITAS]: 'Likuiditas',
      [ModuleTypeOjk.OPERASIONAL]: 'Operasional',
      [ModuleTypeOjk.HUKUM]: 'Hukum',
      [ModuleTypeOjk.STRATEGIK]: 'Strategik',
      [ModuleTypeOjk.KEPATUHAN]: 'Kepatuhan',
      [ModuleTypeOjk.REPUTASI]: 'Reputasi',
      [ModuleTypeOjk.KONSENTRASI]: 'Konsentrasi',
      [ModuleTypeOjk.KREDIT]: 'Kredit',
      [ModuleTypeOjk.PERMODALAN]: 'Permodalan',
      [ModuleTypeOjk.RENTABILITAS]: 'Rentabilitas',
      [ModuleTypeOjk.TATAKELOLA]: 'Tatakelola',
      [ModuleTypeOjk.INVESTASI]: 'Investasi',
    };
    return moduleNames[module] || module;
  }
}