// src/modules/rekap-data/rekap-data.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

// Import entities dari 8 modul
import { Investasi } from 'src/investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from 'src/pasar/pasar/entities/pasar.entity';
import { Likuiditas } from 'src/likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from 'src/operasional/operasional/entities/operasional.entity';
import { OperasionalSection } from 'src/operasional/operasional/entities/operasional-section.entity';
import { Hukum } from 'src/hukum/hukum/entities/hukum.entity';
import { HukumSection } from 'src/hukum/hukum/entities/hukum-section.entity';
import { Stratejik } from 'src/stratejik/stratejik/entities/stratejik.entity';
import { StratejikSection } from 'src/stratejik/stratejik/entities/stratejik-section.entity';
import { Kepatuhan } from 'src/kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { KepatuhanSection } from 'src/kepatuhan/kepatuhan/entities/kepatuhan-section.entity';
import { Reputasi } from 'src/reputasi/reputasi/entities/reputasi.entity';
import { ReputasiSection } from 'src/reputasi/reputasi/entities/reputasi-section.entity';

import {
  GetRekapDataDto,
  UpdateRekapRowDto,
  RiskSource,
  Quarter,
  RekapDataResponseDto,
} from './dto/rekap-data.dto';

// Interface untuk row Excel
interface ExcelRow {
  source?: string;
  Source?: string;
  no?: string;
  No?: string;
  subNo?: string;
  'Sub No'?: string;
  sectionLabel?: string;
  Section?: string;
  indikator?: string;
  Indikator?: string;
  numeratorLabel?: string;
  'Pembilang Label'?: string;
  numeratorValue?: string | number;
  Pembilang?: string | number;
  pembilangLabel?: string;
  pembilangValue?: string | number;
  denominatorLabel?: string;
  'Penyebut Label'?: string;
  denominatorValue?: string | number;
  Penyebut?: string | number;
  penyebutLabel?: string;
  penyebutValue?: string | number;
  isPercent?: string | boolean;
  '%'?: string;
  mode?: string;
  formula?: string;
  hasilText?: string;
  'Hasil Text'?: string;
  low?: string;
  lowToModerate?: string;
  moderate?: string;
  moderateToHigh?: string;
  high?: string;
  bobotSection?: string | number;
  bobotIndikator?: string | number;
  sumberRisiko?: string;
  dampak?: string;
  keterangan?: string;
  [key: string]: any;
}

@Injectable()
export class RekapDataService {
  constructor(
    // Investasi
    @InjectRepository(Investasi)
    private readonly investasiRepo: Repository<Investasi>,

    // Pasar
    @InjectRepository(Pasar)
    private readonly pasarRepo: Repository<Pasar>,

    // Likuiditas
    @InjectRepository(Likuiditas)
    private readonly likuiditasRepo: Repository<Likuiditas>,

    // Operasional
    @InjectRepository(Operasional)
    private readonly operasionalRepo: Repository<Operasional>,
    @InjectRepository(OperasionalSection)
    private readonly operasionalSectionRepo: Repository<OperasionalSection>,

    // Hukum
    @InjectRepository(Hukum)
    private readonly hukumRepo: Repository<Hukum>,
    @InjectRepository(HukumSection)
    private readonly hukumSectionRepo: Repository<HukumSection>,

    // Stratejik
    @InjectRepository(Stratejik)
    private readonly stratejikRepo: Repository<Stratejik>,
    @InjectRepository(StratejikSection)
    private readonly stratejikSectionRepo: Repository<StratejikSection>,

    // Kepatuhan
    @InjectRepository(Kepatuhan)
    private readonly kepatuhanRepo: Repository<Kepatuhan>,
    @InjectRepository(KepatuhanSection)
    private readonly kepatuhanSectionRepo: Repository<KepatuhanSection>,

    // Reputasi
    @InjectRepository(Reputasi)
    private readonly reputasiRepo: Repository<Reputasi>,
    @InjectRepository(ReputasiSection)
    private readonly reputasiSectionRepo: Repository<ReputasiSection>,
  ) {}

  // ===================== MAPPING RELATION NAME =====================
  private getRelationName(source: RiskSource): string {
    const relationMap: Record<RiskSource, string> = {
      [RiskSource.INVESTASI]: 'investasiIndicators',
      [RiskSource.PASAR]: 'pasarIndicators',
      [RiskSource.LIKUIDITAS]: 'likuiditasIndicators',
      [RiskSource.OPERASIONAL]: 'operasionalIndicators',
      [RiskSource.HUKUM]: 'hukumIndicators',
      [RiskSource.STRATEJIK]: 'stratejikIndicators',
      [RiskSource.KEPATUHAN]: 'kepatuhanIndicators',
      [RiskSource.REPUTASI]: 'reputasiIndicators',
    };
    return relationMap[source];
  }

  // ===================== GET SECTION REPOSITORY =====================
  private getSectionRepository(source: RiskSource): Repository<any> | null {
    const repoMap: Partial<Record<RiskSource, Repository<any>>> = {
      [RiskSource.OPERASIONAL]: this.operasionalSectionRepo,
      [RiskSource.HUKUM]: this.hukumSectionRepo,
      [RiskSource.STRATEJIK]: this.stratejikSectionRepo,
      [RiskSource.KEPATUHAN]: this.kepatuhanSectionRepo,
      [RiskSource.REPUTASI]: this.reputasiSectionRepo,
    };
    return repoMap[source] || null;
  }

  // ===================== GET ALL TRIWULAN DATA =====================
  async getAllTriwulanData(
    dto: GetRekapDataDto,
  ): Promise<RekapDataResponseDto> {
    const { year, quarter } = dto;

    const [
      investasiRows,
      pasarRows,
      likuiditasRows,
      operasionalRows,
      hukumRows,
      stratejikRows,
      kepatuhanRows,
      reputasiRows,
      operasionalSections,
      hukumSections,
      stratejikSections,
      kepatuhanSections,
      reputasiSections,
    ] = await Promise.all([
      this.getFlatRows(this.investasiRepo, year, quarter),
      this.getFlatRows(this.pasarRepo, year, quarter),
      this.getFlatRows(this.likuiditasRepo, year, quarter),
      this.getFlatRows(this.operasionalRepo, year, quarter),
      this.getFlatRows(this.hukumRepo, year, quarter),
      this.getFlatRows(this.stratejikRepo, year, quarter),
      this.getFlatRows(this.kepatuhanRepo, year, quarter),
      this.getFlatRows(this.reputasiRepo, year, quarter),
      this.getSectionsData(RiskSource.OPERASIONAL, year, quarter),
      this.getSectionsData(RiskSource.HUKUM, year, quarter),
      this.getSectionsData(RiskSource.STRATEJIK, year, quarter),
      this.getSectionsData(RiskSource.KEPATUHAN, year, quarter),
      this.getSectionsData(RiskSource.REPUTASI, year, quarter),
    ]);

    return {
      investasiRows,
      pasarRows,
      likuiditasRows,
      operasionalRows,
      hukumRows,
      stratejikRows,
      kepatuhanRows,
      reputasiRows,
      operasionalSections,
      hukumSections,
      stratejikSections,
      kepatuhanSections,
      reputasiSections,
    };
  }

  // ===================== GET ALL TAHUNAN DATA =====================
  async getAllTahunanData(year: number): Promise<any> {
    const quarters = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];

    const results = await Promise.all(
      quarters.map(async (quarter) => {
        const data = await this.getAllTriwulanData({ year, quarter });
        return { quarter, data };
      }),
    );

    const merged: any = {
      investasiRows: [],
      pasarRows: [],
      likuiditasRows: [],
      operasionalRows: [],
      hukumRows: [],
      stratejikRows: [],
      kepatuhanRows: [],
      reputasiRows: [],
    };

    results.forEach(({ quarter, data }) => {
      Object.keys(merged).forEach((key) => {
        if (data[key]) {
          const rowsWithQuarter = data[key].map((row: any) => ({
            ...row,
            quarter,
          }));
          merged[key] = [...merged[key], ...rowsWithQuarter];
        }
      });
    });

    return merged;
  }

  // ===================== GET FLAT ROWS =====================
  private async getFlatRows(
    repo: Repository<any>,
    year: number,
    quarter: string,
  ): Promise<any[]> {
    const rows = await repo.find({
      where: {
        year,
        quarter,
        isDeleted: false, // ✅ FILTER SOFT DELETE
      },
      order: { no: 'ASC', subNo: 'ASC' },
    });

    return rows.map((row) => this.normalizeFlatRow(row));
  }

  // ===================== GET SECTIONS DATA =====================
  private async getSectionsData(
    source: RiskSource,
    year: number,
    quarter: string,
  ): Promise<any[]> {
    let sectionRepo: Repository<any> | null = null;

    switch (source) {
      case RiskSource.OPERASIONAL:
        sectionRepo = this.operasionalSectionRepo;
        break;
      case RiskSource.HUKUM:
        sectionRepo = this.hukumSectionRepo;
        break;
      case RiskSource.STRATEJIK:
        sectionRepo = this.stratejikSectionRepo;
        break;
      case RiskSource.KEPATUHAN:
        sectionRepo = this.kepatuhanSectionRepo;
        break;
      case RiskSource.REPUTASI:
        sectionRepo = this.reputasiSectionRepo;
        break;
      default:
        return []; // Investasi, Pasar, Likuiditas tidak punya section
    }

    const relationName = this.getRelationName(source);

    const sections = await sectionRepo.find({
      where: {
        year,
        quarter,
        isDeleted: false, // ✅ FILTER SECTION YANG DI-SOFT-DELETE
      },
      relations: [relationName],
      order: { sortOrder: 'ASC' },
    });

    return sections.map((section) => ({
      ...section,
      indicators: (section[relationName] || [])
        .filter((ind: any) => !ind.isDeleted) // ✅ FILTER INDICATORS YANG DI-SOFT-DELETE
        .map((ind: any) => this.normalizeFlatRow(ind)),
    }));
  }

  // ===================== NORMALIZE FLAT ROW =====================
  private normalizeFlatRow(row: any): any {
    return {
      id: row.id,
      year: row.year,
      quarter: row.quarter,
      no: row.no,
      subNo: row.subNo,
      sectionLabel: row.sectionLabel || row.parameter,
      indikator: row.indikator,
      numeratorLabel: row.pembilangLabel || row.numeratorLabel,
      numeratorValue: row.pembilangValue ?? row.numeratorValue ?? null,
      pembilangLabel: row.pembilangLabel || '',
      pembilangValue: row.pembilangValue ?? null,
      denominatorLabel: row.penyebutLabel || row.denominatorLabel,
      denominatorValue: row.penyebutValue ?? row.denominatorValue ?? null,
      penyebutLabel: row.penyebutLabel || '',
      penyebutValue: row.penyebutValue ?? null,
      isPercent: row.isPercent ?? false,
      mode: row.mode ?? 'RASIO',
      formula: row.formula || '',
      hasil: row.hasil ?? null,
      hasilText: row.hasilText || '',
      low: row.low || '',
      lowToModerate: row.lowToModerate || '',
      moderate: row.moderate || '',
      moderateToHigh: row.moderateToHigh || '',
      high: row.high || '',
      peringkat: row.peringkat ?? 0,
      weighted: row.weighted ?? 0,
      bobotSection: row.bobotSection ?? 0,
      bobotIndikator: row.bobotIndikator ?? 0,
      sumberRisiko: row.sumberRisiko || '',
      dampak: row.dampak || '',
      keterangan: row.keterangan || '',
    };
  }

  // ===================== UPDATE ROW =====================
  async updateRow(dto: UpdateRekapRowDto): Promise<any> {
    const { source, year, quarter, rowKey, field, value } = dto;

    const parts = rowKey.split('|');
    const no = parts[3] || '';
    const subNo = parts[4] || '';
    const sectionLabel = parts[5] || '';
    const indikator = parts[6] || '';

    const repo = this.getRepository(source);

    const row = await repo.findOne({
      where: {
        year,
        quarter,
        no,
        subNo,
        sectionLabel,
        indikator,
        isDeleted: false, // ✅ HANYA UPDATE DATA YANG TIDAK DI-SOFT-DELETE
      },
    });

    if (!row) {
      throw new Error('Row not found');
    }

    row[field] = value;

    if (field === 'numeratorValue') {
      row.pembilangValue = value;
    }
    if (field === 'denominatorValue') {
      row.penyebutValue = value;
    }

    if (
      ['numeratorValue', 'denominatorValue', 'formula', 'hasilText'].includes(
        field,
      )
    ) {
      row.hasil = this.computeHasil(row);
      row.peringkat = this.computePeringkat(row);
      if (row.bobotIndikator) {
        row.weighted = (row.peringkat * row.bobotIndikator) / 100;
      }
    }

    await repo.save(row);

    return this.normalizeFlatRow(row);
  }

  // ===================== GET REPOSITORY BY SOURCE =====================
  private getRepository(source: RiskSource): Repository<any> {
    const repoMap: Record<RiskSource, Repository<any>> = {
      [RiskSource.INVESTASI]: this.investasiRepo,
      [RiskSource.PASAR]: this.pasarRepo,
      [RiskSource.LIKUIDITAS]: this.likuiditasRepo,
      [RiskSource.OPERASIONAL]: this.operasionalRepo,
      [RiskSource.HUKUM]: this.hukumRepo,
      [RiskSource.STRATEJIK]: this.stratejikRepo,
      [RiskSource.KEPATUHAN]: this.kepatuhanRepo,
      [RiskSource.REPUTASI]: this.reputasiRepo,
    };
    return repoMap[source];
  }

  // ===================== COMPUTE HASIL =====================
  private computeHasil(row: any): number | null {
    const mode = row.mode || 'RASIO';

    if (mode === 'TEKS') {
      return null;
    }

    const pemb = parseFloat(row.pembilangValue || row.numeratorValue || '0');
    const peny = parseFloat(row.penyebutValue || row.denominatorValue || '0');

    if (mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') {
      return pemb || peny || null;
    }

    if (!pemb || !peny || peny === 0) {
      return null;
    }

    if (row.formula) {
      try {
        const formula = row.formula
          .replace(/pemb/g, String(pemb))
          .replace(/peny/g, String(peny));
        const result = eval(formula);
        return Number(result);
      } catch {
        // Fallback
      }
    }

    return pemb / peny;
  }

  // ===================== COMPUTE PERINGKAT =====================
  private computePeringkat(row: any): number {
    const hasil = row.hasil;
    if (hasil === null || hasil === undefined) return 0;

    const { low, lowToModerate, moderate, moderateToHigh, high } = row;

    const thresholds = {
      low: parseFloat(low || '0'),
      lowToModerate: parseFloat(lowToModerate || '0'),
      moderate: parseFloat(moderate || '0'),
      moderateToHigh: parseFloat(moderateToHigh || '0'),
      high: parseFloat(high || '0'),
    };

    const defaultThresholds = {
      low: 1,
      lowToModerate: 2,
      moderate: 3,
      moderateToHigh: 4,
      high: 5,
    };

    const t = {
      low: isNaN(thresholds.low) ? defaultThresholds.low : thresholds.low,
      lowToModerate: isNaN(thresholds.lowToModerate)
        ? defaultThresholds.lowToModerate
        : thresholds.lowToModerate,
      moderate: isNaN(thresholds.moderate)
        ? defaultThresholds.moderate
        : thresholds.moderate,
      moderateToHigh: isNaN(thresholds.moderateToHigh)
        ? defaultThresholds.moderateToHigh
        : thresholds.moderateToHigh,
      high: isNaN(thresholds.high) ? defaultThresholds.high : thresholds.high,
    };

    const nilai = Number(hasil);

    if (nilai <= t.low) return 1;
    if (nilai <= t.lowToModerate) return 2;
    if (nilai <= t.moderate) return 3;
    if (nilai <= t.moderateToHigh) return 4;
    return 5;
  }

  // ===================== IMPORT EXCEL =====================
  async importExcel(
    file: { buffer: Buffer },
    year: number,
    quarter: string,
  ): Promise<any> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

    const results: any = {
      investasiRows: [],
      pasarRows: [],
      likuiditasRows: [],
      operasionalRows: [],
      hukumRows: [],
      stratejikRows: [],
      kepatuhanRows: [],
      reputasiRows: [],
    };

    for (const row of data) {
      const source = row['source'] || row['Source'] || '';
      const sourceLower = source.toLowerCase();
      if (!source || !results[`${sourceLower}Rows`]) continue;

      const newRow = this.parseExcelRow(row, source, year, quarter);
      results[`${sourceLower}Rows`].push(newRow);
    }

    let totalImported = 0;

    for (const [source, rows] of Object.entries(results)) {
      const rowArray = rows as any[];
      if (rowArray.length === 0) continue;

      const repo = this.getRepository(source as RiskSource);

      // Hanya hapus data yang tidak di-soft-delete? Atau hapus semua?
      // Tergantung kebutuhan, di sini kita hapus data existing untuk periode ini
      await repo.delete({ year, quarter });

      await repo.save(rowArray);
      totalImported += rowArray.length;
    }

    return {
      totalImported,
      ...results,
    };
  }

  // ===================== PARSE EXCEL ROW =====================
  private parseExcelRow(
    row: ExcelRow,
    source: string,
    year: number,
    quarter: string,
  ): any {
    const newRow: any = {
      year,
      quarter,
      source,
      no: row['no'] || row['No'] || '',
      subNo: row['subNo'] || row['Sub No'] || '',
      sectionLabel: row['sectionLabel'] || row['Section'] || '',
      indikator: row['indikator'] || row['Indikator'] || '',
      numeratorLabel: row['numeratorLabel'] || row['Pembilang Label'] || '',
      numeratorValue: parseFloat(
        String(row['numeratorValue'] || row['Pembilang'] || '0'),
      ),
      pembilangLabel: row['pembilangLabel'] || row['Pembilang Label'] || '',
      pembilangValue: parseFloat(
        String(row['pembilangValue'] || row['Pembilang'] || '0'),
      ),
      denominatorLabel: row['denominatorLabel'] || row['Penyebut Label'] || '',
      denominatorValue: parseFloat(
        String(row['denominatorValue'] || row['Penyebut'] || '0'),
      ),
      penyebutLabel: row['penyebutLabel'] || row['Penyebut Label'] || '',
      penyebutValue: parseFloat(
        String(row['penyebutValue'] || row['Penyebut'] || '0'),
      ),
      isPercent:
        row['isPercent'] === 'true' ||
        row['isPercent'] === true ||
        row['%'] === 'Ya',
      mode: row['mode'] || 'RASIO',
      formula: row['formula'] || '',
      hasilText: row['hasilText'] || row['Hasil Text'] || '',
      low: row['low'] || '',
      lowToModerate: row['lowToModerate'] || '',
      moderate: row['moderate'] || '',
      moderateToHigh: row['moderateToHigh'] || '',
      high: row['high'] || '',
      bobotSection: parseFloat(String(row['bobotSection'] || '0')),
      bobotIndikator: parseFloat(String(row['bobotIndikator'] || '0')),
      sumberRisiko: row['sumberRisiko'] || '',
      dampak: row['dampak'] || '',
      keterangan: row['keterangan'] || '',
      isDeleted: false, // ✅ DEFAULT TIDAK DI-SOFT-DELETE
    };

    newRow.hasil = this.computeHasil(newRow);
    newRow.peringkat = this.computePeringkat(newRow);
    newRow.weighted = (newRow.peringkat * newRow.bobotIndikator) / 100;

    return newRow;
  }

  // ===================== CLEANUP DUPLICATES =====================
  async cleanupDuplicates(
    year: number,
    quarter: string,
  ): Promise<{ removed: number }> {
    let totalRemoved = 0;
    const sources = Object.values(RiskSource);

    for (const source of sources) {
      const repo = this.getRepository(source);

      const rows = await repo.find({
        where: {
          year,
          quarter,
          isDeleted: false, // ✅ HANYA PROSES DATA YANG TIDAK DI-SOFT-DELETE
        },
        order: { no: 'ASC', subNo: 'ASC' },
      });

      const seen = new Map<string, any>();
      const duplicates: number[] = [];

      rows.forEach((row: any) => {
        const key = `${row.no}-${row.subNo}-${row.sectionLabel}-${row.indikator}`;

        if (seen.has(key)) {
          const existing = seen.get(key);
          const existingScore =
            (existing.pembilangValue ? 2 : 0) +
            (existing.penyebutValue ? 1 : 0);
          const currentScore =
            (row.pembilangValue ? 2 : 0) + (row.penyebutValue ? 1 : 0);

          if (currentScore > existingScore) {
            duplicates.push(existing.id);
            seen.set(key, row);
          } else {
            duplicates.push(row.id);
          }
        } else {
          seen.set(key, row);
        }
      });

      if (duplicates.length > 0) {
        // Soft delete duplicates (set isDeleted = true)
        await repo.update(duplicates, { isDeleted: true });
        totalRemoved += duplicates.length;
      }
    }

    return { removed: totalRemoved };
  }

  // ===================== GET SECTIONS FOR FILTER =====================
  async getSections(
    source: RiskSource,
    year: number,
    quarter: string,
  ): Promise<string[]> {
    const repo = this.getRepository(source);

    const rows = await repo
      .createQueryBuilder('row')
      .select('DISTINCT row.sectionLabel', 'sectionLabel')
      .where('row.year = :year', { year })
      .andWhere('row.quarter = :quarter', { quarter })
      .andWhere('row.isDeleted = :isDeleted', { isDeleted: false }) // ✅ FILTER SOFT DELETE
      .getRawMany<{ sectionLabel: string }>();

    return rows.map((r) => r.sectionLabel).filter(Boolean);
  }
}
