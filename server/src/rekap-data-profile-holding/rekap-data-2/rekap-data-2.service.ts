// src/modules/rekap-data2/rekap-data2.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { RekapData1Service } from 'src/rekap-data-profile-holding/rekap-data-1/rekap-data-1.service';

// Import entities dari 8 modul
import { Investasi } from 'src/investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from 'src/pasar/pasar/entities/pasar.entity';
import { Likuiditas } from 'src/likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from 'src/operasional/operasional/entities/operasional.entity';
import { Hukum } from 'src/hukum/hukum/entities/hukum.entity';
import { Stratejik } from 'src/stratejik/stratejik/entities/stratejik.entity';
import { Kepatuhan } from 'src/kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { Reputasi } from 'src/reputasi/reputasi/entities/reputasi.entity';

import {
  GetRekapData2Dto,
  UpdateRekapData2RowDto,
  RiskSource,
  Quarter,
  RekapData2ResponseDto,
  NormalizedRow,
  DashboardDataResponseDto,
  DashboardRiskRow,
  DashboardSkorProfil,
} from './dto/rekap-data-2.dto';

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
export class RekapData2Service {
  constructor(
    @InjectRepository(Investasi)
    private readonly investasiRepo: Repository<Investasi>,

    @InjectRepository(Pasar)
    private readonly pasarRepo: Repository<Pasar>,

    @InjectRepository(Likuiditas)
    private readonly likuiditasRepo: Repository<Likuiditas>,

    @InjectRepository(Operasional)
    private readonly operasionalRepo: Repository<Operasional>,

    @InjectRepository(Hukum)
    private readonly hukumRepo: Repository<Hukum>,

    @InjectRepository(Stratejik)
    private readonly stratejikRepo: Repository<Stratejik>,

    @InjectRepository(Kepatuhan)
    private readonly kepatuhanRepo: Repository<Kepatuhan>,

    @InjectRepository(Reputasi)
    private readonly reputasiRepo: Repository<Reputasi>,

    private readonly rekapData1Service: RekapData1Service,
  ) {}

  // ===================== HELPER: Skor ke Level =====================
  private skorToLevel(skor: number): number {
    if (skor < 1.5) return 1;
    if (skor < 2.5) return 2;
    if (skor < 3.5) return 3;
    if (skor < 4.5) return 4;
    return 5;
  }

  // ===================== GET ALL TRIWULAN DATA (DETAIL VIEW) =====================
  async getAllTriwulanData(
    dto: GetRekapData2Dto,
  ): Promise<RekapData2ResponseDto> {
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
    ] = await Promise.all([
      this.getFlatRows(this.investasiRepo, year, quarter, 'INVESTASI'),
      this.getFlatRows(this.pasarRepo, year, quarter, 'PASAR'),
      this.getFlatRows(this.likuiditasRepo, year, quarter, 'LIKUIDITAS'),
      this.getFlatRows(this.operasionalRepo, year, quarter, 'OPERASIONAL'),
      this.getFlatRows(this.hukumRepo, year, quarter, 'HUKUM'),
      this.getFlatRows(this.stratejikRepo, year, quarter, 'STRATEJIK'),
      this.getFlatRows(this.kepatuhanRepo, year, quarter, 'KEPATUHAN'),
      this.getFlatRows(this.reputasiRepo, year, quarter, 'REPUTASI'),
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

  // ===================== MATRIX VALUE LOOKUP =====================
  private getMatrixValue(inherentLevel: number, kpmrLevel: number): number {
    const matrix = [
      [1, 1, 2, 3, 3], // Inherent 1 (Row 0)
      [1, 2, 2, 3, 4], // Inherent 2 (Row 1)
      [2, 2, 3, 4, 4], // Inherent 3 (Row 2)
      [2, 3, 4, 4, 5], // Inherent 4 (Row 3)
      [3, 3, 4, 5, 5], // Inherent 5 (Row 4)
    ];

    const iIdx = Math.min(Math.max(inherentLevel, 1), 5) - 1;
    const kIdx = Math.min(Math.max(kpmrLevel, 1), 5) - 1;

    return matrix[iIdx][kIdx];
  }

  // ===================== GET DASHBOARD DATA =====================
  async getDashboardData(
    dto: GetRekapData2Dto,
  ): Promise<DashboardDataResponseDto> {
    const { year, quarter } = dto;

    // Ambil semua data Inherent untuk periode ini
    const allData = await this.getAllTriwulanData(dto);

    // Ambil semua data KPMR dari RekapData1Service
    const rekap1Data = await this.rekapData1Service.getAllRekapData(year, quarter);

    // Hitung skor per sumber risiko
    const riskScores: Record<string, { totalSkor: number; count: number }> = {};

    const processRows = (rows: NormalizedRow[], source: string) => {
      if (!riskScores[source]) {
        riskScores[source] = { totalSkor: 0, count: 0 };
      }

      rows.forEach((row) => {
        if (row.peringkat && row.peringkat > 0) {
          riskScores[source].totalSkor += row.peringkat;
          riskScores[source].count++;
        }
      });
    };

    processRows(allData.investasiRows, 'INVESTASI');
    processRows(allData.pasarRows, 'PASAR');
    processRows(allData.likuiditasRows, 'LIKUIDITAS');
    processRows(allData.operasionalRows, 'OPERASIONAL');
    processRows(allData.hukumRows, 'HUKUM');
    processRows(allData.stratejikRows, 'STRATEJIK');
    processRows(allData.kepatuhanRows, 'KEPATUHAN');
    processRows(allData.reputasiRows, 'REPUTASI');

    // Map KPMR rows dari RekapData1Response
    const kpmrRowsMap: Record<string, any[]> = {
      'INVESTASI': rekap1Data.loadKPMRInvestasi || [],
      'PASAR': rekap1Data.loadKPMRPasar || [],
      'LIKUIDITAS': rekap1Data.loadKPMRLikuiditas || [],
      'OPERASIONAL': rekap1Data.loadKPMROperasional || [],
      'HUKUM': rekap1Data.loadKPMRHukum || [],
      'STRATEJIK': rekap1Data.loadKPMRStrategis || [],
      'KEPATUHAN': rekap1Data.loadKPMRKepatuhan || [],
      'REPUTASI': rekap1Data.loadKPMRReputasi || [],
    };

    const kpmrScoresList: number[] = [];

    const rows: DashboardRiskRow[] = Object.entries(riskScores).map(
      ([source, data]) => {
        // Calculate Inherent Level
        const avgSkor = data.count > 0 ? data.totalSkor / data.count : 0;
        const inherentLevel = data.count > 0 ? this.skorToLevel(avgSkor) : 0;

        // Calculate KPMR Level
        const kpmrRows = kpmrRowsMap[source] || [];
        const kpmrScore = this.rekapData1Service.calculateSkorKPMR(kpmrRows);
        
        // If kpmrScore > 0, store it for overall average
        if (kpmrScore > 0) {
          kpmrScoresList.push(kpmrScore);
        }

        const kpmrLevel = kpmrScore > 0 ? this.skorToLevel(kpmrScore) : 0;

        // Calculate Net Risk Level
        const netLevel = (inherentLevel > 0 && kpmrLevel > 0)
          ? this.getMatrixValue(inherentLevel, kpmrLevel)
          : 0;

        return {
          label: source.charAt(0).toUpperCase() + source.slice(1).toLowerCase(),
          inherent: inherentLevel,
          kpmr: kpmrLevel,
          net: netLevel,
        };
      },
    );

    // Hitung skor profil keseluruhan
    const allSkor = Object.values(riskScores).flatMap((d) =>
      Array(d.count).fill(d.totalSkor / d.count),
    );

    const avgSkor =
      allSkor.length > 0
        ? allSkor.reduce((a, b) => a + b, 0) / allSkor.length
        : 0;

    const overallLevel = avgSkor > 0 ? this.skorToLevel(avgSkor) : 0;

    // Overall KPMR Level
    const avgKpmr =
      kpmrScoresList.length > 0
        ? kpmrScoresList.reduce((a, b) => a + b, 0) / kpmrScoresList.length
        : 0;
    const overallKpmrLevel = avgKpmr > 0 ? this.skorToLevel(avgKpmr) : 0;

    // Overall Net Risk Level
    const overallNetLevel = (overallLevel > 0 && overallKpmrLevel > 0)
      ? this.getMatrixValue(overallLevel, overallKpmrLevel)
      : 0;

    const skorProfil: DashboardSkorProfil = {
      inherent: overallLevel,
      kpmr: overallKpmrLevel,
      net: overallNetLevel,
    };

    const isEmpty = rows.length === 0 || rows.every((r) => r.inherent === 0);

    return {
      rows,
      skorProfil,
      isEmpty,
    };
  }

  // ===================== GET FLAT ROWS =====================
  private async getFlatRows(
    repo: Repository<any>,
    year: number,
    quarter: string,
    sourceName: string,
  ): Promise<NormalizedRow[]> {
    const rows = await repo.find({
      where: {
        year,
        quarter,
        isDeleted: false, // ✅ FILTER SOFT DELETE
      },
      order: { no: 'ASC', subNo: 'ASC' },
    });

    return rows.map((row) => ({
      ...this.normalizeFlatRow(row),
      source: sourceName,
    }));
  }

  // ===================== NORMALIZE FLAT ROW =====================
  private normalizeFlatRow(row: any): NormalizedRow {
    return {
      id: row.id,
      year: row.year,
      quarter: row.quarter,
      source: '',
      no: row.no || '',
      subNo: row.subNo || '',
      sectionLabel: row.sectionLabel || '',
      indikator: row.indikator || '',
      numeratorLabel: row.pembilangLabel || '',
      numeratorValue: row.pembilangValue ?? null,
      pembilangLabel: row.pembilangLabel || '',
      pembilangValue: row.pembilangValue ?? null,
      denominatorLabel: row.penyebutLabel || '',
      denominatorValue: row.penyebutValue ?? null,
      penyebutLabel: row.penyebutLabel || '',
      penyebutValue: row.penyebutValue ?? null,
      isPercent: row.isPercent ?? false,
      mode: row.mode ?? 'RASIO',
      formula: row.formula || '',
      hasil: row.hasil ?? null,
      hasilText: row.hasilText || null,
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
  async updateRow(dto: UpdateRekapData2RowDto): Promise<NormalizedRow> {
    const { source, year, quarter, rowKey, field, value } = dto;

    const parts = rowKey.split('|');
    const no = parts[3] || '';
    const subNo = parts[4] || '';
    const sectionLabel = parts[5] || '';
    const indikator = parts[6] || '';

    console.log('📝 Update row request:', {
      source,
      year,
      quarter,
      no,
      subNo,
      sectionLabel,
      indikator,
      field,
      value,
    });

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
      console.error('❌ Row not found:', {
        year,
        quarter,
        no,
        subNo,
        sectionLabel,
        indikator,
      });
      throw new Error(`Row not found`);
    }

    // Mapping field dari frontend ke entity
    const fieldMapping: Record<string, string> = {
      numeratorValue: 'pembilangValue',
      numeratorLabel: 'pembilangLabel',
      denominatorValue: 'penyebutValue',
      denominatorLabel: 'penyebutLabel',
    };

    const entityField = fieldMapping[field] || field;

    // Parse numeric values
    if (entityField.includes('Value') && value !== '') {
      row[entityField] = parseFloat(value);
    } else {
      row[entityField] = value;
    }

    // Recalculate hasil dan peringkat
    if (
      ['pembilangValue', 'penyebutValue', 'formula', 'hasilText'].includes(
        entityField,
      )
    ) {
      row.hasil = this.computeHasil(row);
      row.peringkat = this.computePeringkat(row);
      if (row.bobotIndikator) {
        row.weighted = (row.peringkat * row.bobotIndikator) / 100;
      }
    }

    await repo.save(row);

    return {
      ...this.normalizeFlatRow(row),
      source: source,
    };
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
    if (mode === 'TEKS') return null;

    const pemb = parseFloat(row.pembilangValue || row.numeratorValue || '0');
    const peny = parseFloat(row.penyebutValue || row.denominatorValue || '0');

    if (mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') {
      return pemb || peny || null;
    }

    if (!pemb || !peny || peny === 0) return null;

    if (row.formula) {
      try {
        const formula = row.formula
          .replace(/pemb/g, String(pemb))
          .replace(/peny/g, String(peny));
        const result = this.evaluateFormula(formula);
        return isNaN(result) ? null : result;
      } catch {
        // fallback
      }
    }

    return pemb / peny;
  }

  private evaluateFormula(expr: string): number {
    if (!expr || typeof expr !== 'string' || expr.trim() === '') return NaN;
    const e = expr.trim();
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
  }

  // ===================== COMPUTE PERINGKAT =====================
  private computePeringkat(row: any): number {
    const hasil = row.hasil;
    if (hasil === null || hasil === undefined) return 0;

    const thresholds = {
      low: parseFloat(row.low || '0'),
      lowToModerate: parseFloat(row.lowToModerate || '0'),
      moderate: parseFloat(row.moderate || '0'),
      moderateToHigh: parseFloat(row.moderateToHigh || '0'),
      high: parseFloat(row.high || '0'),
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

      // Hanya hapus data yang TIDAK di-soft-delete (atau hapus semua dan set isDeleted = false)
      // Untuk import, lebih baik hapus semua data existing untuk periode ini
      await repo.delete({ year, quarter });
      await repo.save(rowArray);
      totalImported += rowArray.length;
    }

    return { totalImported, ...results };
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
        // ✅ Soft delete duplicates (set isDeleted = true)
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
