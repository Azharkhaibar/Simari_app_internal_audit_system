import axios, { AxiosResponse } from 'axios';
import { SectionsWithIndicatorsResponse } from '../../pasar/service/pasar/pasar.service';

// ENUMS
export enum CalculationMode {
  RASIO = 'RASIO',
  NILAI_TUNGGAL = 'NILAI_TUNGGAL',
  TEKS = 'TEKS',
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

// INTERFACES
export interface LikuiditasSection {
  id: number;
  no: string;
  bobotSection: number;
  parameter: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface LikuiditasIndikator {
  id: number;
  year: number;
  quarter: Quarter;
  sectionId: number;
  no: string;
  sectionLabel: string;
  bobotSection: number;
  subNo: string;
  indikator: string;
  bobotIndikator: number;
  sumberRisiko: string | null;
  dampak: string | null;
  low: string | null;
  lowToModerate: string | null;
  moderate: string | null;
  moderateToHigh: string | null;
  high: string | null;
  mode: CalculationMode;
  formula: string | null;
  isPercent: boolean;
  pembilangLabel: string | null;
  pembilangValue: number | null;
  penyebutLabel: string | null;
  penyebutValue: number | null;
  hasil: number | null;
  hasilText: string | null;
  peringkat: number;
  weighted: number;
  keterangan: string | null;
  isValidated: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
  section?: LikuiditasSection;
}

export interface CreateLikuiditasSectionData {
  no: string;
  parameter: string;
  bobotSection?: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateLikuiditasSectionData {
  no?: string;
  parameter?: string;
  bobotSection?: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateLikuiditasData {
  year: number;
  quarter: Quarter;
  sectionId: number;
  no: string;
  sectionLabel: string;
  bobotSection: number;
  subNo: string;
  indikator: string;
  bobotIndikator: number;
  sumberRisiko?: string;
  dampak?: string;
  low?: string;
  lowToModerate?: string;
  moderate?: string;
  moderateToHigh?: string;
  high?: string;
  mode: CalculationMode;
  formula?: string;
  isPercent?: boolean;
  pembilangLabel?: string;
  pembilangValue?: number;
  penyebutLabel?: string;
  penyebutValue?: number;
  hasil?: number;
  hasilText?: string;
  peringkat: number;
  weighted: number;
  keterangan?: string;
  createdBy?: string;
}

export interface UpdateLikuiditasData {
  year?: number;
  quarter?: Quarter;
  sectionId?: number;
  no?: string;
  sectionLabel?: string;
  bobotSection?: number;
  subNo?: string;
  indikator?: string;
  bobotIndikator?: number;
  sumberRisiko?: string;
  dampak?: string;
  low?: string;
  lowToModerate?: string;
  moderate?: string;
  moderateToHigh?: string;
  high?: string;
  mode?: CalculationMode;
  formula?: string;
  isPercent?: boolean;
  pembilangLabel?: string;
  pembilangValue?: number;
  penyebutLabel?: string;
  penyebutValue?: number;
  hasil?: number;
  hasilText?: string;
  peringkat?: number;
  weighted?: number;
  keterangan?: string;
}

export interface TotalWeightedResponse {
  total: number;
}

export interface Period {
  year: number;
  quarter: Quarter;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// UTILITY FUNCTIONS
export const fmtNumber = (v: any): string => {
  if (v === '' || v == null) return '';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return new Intl.NumberFormat('en-US').format(n);
};

export const formatHasilNumber = (value: any, maxDecimals = 4): string => {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (!isFinite(n) || isNaN(n)) return '';

  const fixed = n.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, '');
};

export const parseNum = (v: any): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;

  const cleaned = String(v).replace(/,/g, '').replace(/\s/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
};

export const computeHasil = (ind: any): number | null => {
  const mode = ind?.mode || 'RASIO';
  if (mode === 'TEKS') return null;

  const pemb = parseNum(ind.pembilangValue);
  const peny = parseNum(ind.penyebutValue);

  if (mode === 'RASIO' && peny === 0) {
    console.warn('Penyebut value adalah 0 untuk mode RASIO');
    return null;
  }

  if (ind.formula && ind.formula.trim() !== '') {
    try {
      const expr = ind.formula
        .replace(/\bpembilang\b/gi, pemb.toString())
        .replace(/\bpenyebut\b/gi, peny.toString())
        .replace(/\bpemb\b/g, pemb.toString())
        .replace(/\bpeny\b/g, peny.toString());

      const fn = new Function('pemb', 'peny', `return (${expr});`);
      const res = fn(pemb, peny);
      if (!isFinite(res) || isNaN(res)) return null;
      return Number(res);
    } catch (e) {
      console.warn('Invalid formula:', ind.formula, e);
      return null;
    }
  }

  if (mode === 'NILAI_TUNGGAL') {
    if (ind.penyebutValue === '' || ind.penyebutValue == null) return null;
    return peny;
  }

  if (peny === 0) return null;
  const result = pemb / peny;
  if (!isFinite(result) || isNaN(result)) return null;
  return Number(result);
};

export const computeWeightedAuto = (ind: any, sectionBobot: number): number => {
  const sectionB = Number(sectionBobot || 0);
  const bobotInd = Number(ind.bobotIndikator || 0);
  const peringkat = Number(ind.peringkat || 0);
  const res = (sectionB * bobotInd * peringkat) / 10000;
  if (!isFinite(res) || isNaN(res)) return 0;
  return res;
};

export const transformIndicatorToBackend = (indicatorData: any, year: number, quarter: Quarter, sectionId: number, sectionData: any): CreateLikuiditasData => {
  const hasilNum = computeHasil(indicatorData);

  let penyebutValue = indicatorData.penyebutValue !== undefined && indicatorData.penyebutValue !== '' ? Number(indicatorData.penyebutValue) : undefined;

  if (indicatorData.mode === CalculationMode.RASIO) {
    if (penyebutValue === 0 || penyebutValue === undefined || isNaN(penyebutValue)) {
      console.warn('Penyebut value untuk mode RASIO tidak valid:', penyebutValue);
    }
  }

  return {
    year,
    quarter,
    sectionId,
    no: sectionData?.no || '',
    sectionLabel: sectionData?.parameter || '',
    bobotSection: Number(sectionData?.bobotSection) || 0,
    subNo: indicatorData.subNo?.toString().trim() || '',
    indikator: indicatorData.indikator?.toString().trim() || '',
    bobotIndikator: Number(indicatorData.bobotIndikator) || 0,
    sumberRisiko: indicatorData.sumberRisiko?.trim() || undefined,
    dampak: indicatorData.dampak?.trim() || undefined,
    low: indicatorData.low?.trim() || undefined,
    lowToModerate: indicatorData.lowToModerate?.trim() || undefined,
    moderate: indicatorData.moderate?.trim() || undefined,
    moderateToHigh: indicatorData.moderateToHigh?.trim() || undefined,
    high: indicatorData.high?.trim() || undefined,
    mode: indicatorData.mode || CalculationMode.RASIO,
    formula: indicatorData.formula?.trim() || undefined,
    isPercent: Boolean(indicatorData.isPercent || false),
    pembilangLabel: indicatorData.pembilangLabel?.trim() || undefined,
    pembilangValue: indicatorData.pembilangValue !== undefined && indicatorData.pembilangValue !== '' ? Number(indicatorData.pembilangValue) : undefined,
    penyebutLabel: indicatorData.penyebutLabel?.trim() || undefined,
    penyebutValue: penyebutValue,
    hasil: hasilNum !== null ? hasilNum : undefined,
    hasilText: indicatorData.mode === CalculationMode.TEKS ? indicatorData.hasilText || indicatorData.keterangan || '' : undefined,
    peringkat: Number(indicatorData.peringkat) || 1,
    weighted: computeWeightedAuto(indicatorData, Number(sectionData?.bobotSection) || 0),
    keterangan: indicatorData.keterangan?.trim() || undefined,
  };
};

export const transformIndicatorToFrontend = (indikator: LikuiditasIndikator): any => {
  return {
    id: indikator.id,
    subNo: indikator.subNo || '',
    indikator: indikator.indikator || '',
    bobotIndikator: indikator.bobotIndikator || 0,
    sumberRisiko: indikator.sumberRisiko || '',
    dampak: indikator.dampak || '',
    pembilangLabel: indikator.pembilangLabel || '',
    pembilangValue: indikator.pembilangValue !== null ? indikator.pembilangValue.toString() : '',
    penyebutLabel: indikator.penyebutLabel || '',
    penyebutValue: indikator.penyebutValue !== null ? indikator.penyebutValue.toString() : '',
    peringkat: indikator.peringkat || 1,
    weighted: indikator.weighted || '',
    hasil: indikator.hasil !== null ? indikator.hasil.toString() : '',
    hasilText: indikator.hasilText || '',
    keterangan: indikator.keterangan || '',
    isPercent: Boolean(indikator.isPercent),
    mode: indikator.mode || CalculationMode.RASIO,
    formula: indikator.formula || '',
    low: indikator.low || '',
    lowToModerate: indikator.lowToModerate || '',
    moderate: indikator.moderate || '',
    moderateToHigh: indikator.moderateToHigh || '',
    high: indikator.high || '',
    sectionId: indikator.sectionId,
    no: indikator.no,
    sectionLabel: indikator.sectionLabel,
    bobotSection: indikator.bobotSection,
    year: indikator.year,
    quarter: indikator.quarter,
    section: indikator.section,
  };
};

export const transformSectionToBackend = (sectionData: any, year: number, quarter: Quarter): CreateLikuiditasSectionData => {
  return {
    no: String(sectionData.no),
    bobotSection: Number(sectionData.bobotSection || 0),
    parameter: sectionData.parameter,
    description: sectionData.description || undefined,
    sortOrder: sectionData.sortOrder || 0,
    isActive: sectionData.isActive ?? true,
  };
};

export const rowsPerIndicator = (ind: any): number => {
  return 1 + (ind.mode === 'RASIO' ? 2 : 1);
};

// API SERVICE
class LikuiditasApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:5530/api/v1';
  }

  async createSection(data: CreateLikuiditasSectionData): Promise<LikuiditasSection> {
    return this.request<LikuiditasSection>('post', '/likuiditas/sections', data);
  }

  async getAllSections(isActive?: boolean): Promise<LikuiditasSection[]> {
    const params = isActive !== undefined ? { isActive } : {};
    return this.request<LikuiditasSection[]>('get', '/likuiditas/sections', null, params);
  }

  async getSectionById(id: number): Promise<LikuiditasSection> {
    return this.request<LikuiditasSection>('get', `/likuiditas/sections/${id}`);
  }

  async updateSection(id: number, data: UpdateLikuiditasSectionData): Promise<LikuiditasSection> {
    return this.request<LikuiditasSection>('put', `/likuiditas/sections/${id}`, data);
  }

  async deleteSection(id: number): Promise<DeleteResponse> {
    return this.request<DeleteResponse>('delete', `/likuiditas/sections/${id}`);
  }

  // ========== INDIKATOR API ==========
  async createIndikator(data: CreateLikuiditasData): Promise<LikuiditasIndikator> {
    return this.request<LikuiditasIndikator>('post', '/likuiditas/indikators', data);
  }

  async getAllIndikators(): Promise<LikuiditasIndikator[]> {
    return this.request<LikuiditasIndikator[]>('get', '/likuiditas/indikators');
  }

  async getIndikatorsByPeriod(year: number, quarter: Quarter): Promise<LikuiditasIndikator[]> {
    return this.request<LikuiditasIndikator[]>('get', '/likuiditas/indikators/period', null, { year, quarter });
  }

  async getSectionsWithIndicatorsByPeriod(year: number, quarter: Quarter): Promise<any> {
    try {
      console.log(`📡 Calling API: getSectionsWithIndicatorsByPeriod for ${year}-${quarter}`);

      const params = new URLSearchParams();
      params.append('year', String(year));
      params.append('quarter', String(quarter));

      const url = `${this.baseUrl}/likuiditas/data/with-indicators?${params.toString()}`;
      console.log('🔍 Full URL:', url);

      const response = await axios.get(url);

      console.log('✅ Response from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in getSectionsWithIndicatorsByPeriod:', error);
      this.handleError(error);
      throw error;
    }
  }

  async searchIndikators(query?: string, year?: number, quarter?: Quarter): Promise<LikuiditasIndikator[]> {
    const params: any = {};
    if (query) params.query = query;
    if (year) params.year = year;
    if (quarter) params.quarter = quarter;

    return this.request<LikuiditasIndikator[]>('get', '/likuiditas/indikators/search', null, params);
  }

  async getIndikatorById(id: number): Promise<LikuiditasIndikator> {
    return this.request<LikuiditasIndikator>('get', `/likuiditas/indikators/${id}`);
  }

  async updateIndikator(id: number, data: UpdateLikuiditasData): Promise<LikuiditasIndikator> {
    return this.request<LikuiditasIndikator>('put', `/likuiditas/indikators/${id}`, data);
  }

  async deleteIndikator(id: number): Promise<DeleteResponse> {
    return this.request<DeleteResponse>('delete', `/likuiditas/indikators/${id}`);
  }

  async getTotalWeightedByPeriod(year: number, quarter: Quarter): Promise<number> {
    const response = await this.request<TotalWeightedResponse>('get', '/likuiditas/total-weighted', null, { year, quarter });
    return response.total;
  }

  async getAvailablePeriods(): Promise<Period[]> {
    return this.request<Period[]>('get', '/likuiditas/periods');
  }

  async duplicateIndikator(sourceId: number, targetYear: number, targetQuarter: Quarter): Promise<LikuiditasIndikator> {
    return this.request<LikuiditasIndikator>('post', `/likuiditas/indikators/${sourceId}/duplicate`, null, {
      year: targetYear,
      quarter: targetQuarter,
    });
  }

  // ========== HELPER METHODS ==========
  private async request<T>(method: 'get' | 'post' | 'put' | 'delete', endpoint: string, data?: any, params?: any): Promise<T> {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const message = error.response.data?.message || 'Terjadi kesalahan pada server';
        const status = error.response.status;

        console.error(`API Error [${status}]:`, message);

        switch (status) {
          case 400:
            throw new Error(`Bad Request: ${message}`);
          case 401:
            throw new Error('Unauthorized: Silakan login kembali');
          case 403:
            throw new Error('Forbidden: Anda tidak memiliki akses');
          case 404:
            throw new Error(`Not Found: ${message}`);
          case 409:
            throw new Error(`Conflict: ${message}`);
          case 500:
            throw new Error('Server Error: Silakan coba lagi nanti');
          default:
            throw new Error(`Server Error: ${message}`);
        }
      } else if (error.request) {
        console.error('Network Error:', error.message);
        throw new Error('Koneksi jaringan bermasalah. Periksa koneksi internet Anda.');
      } else {
        console.error('Request Error:', error.message);
        throw new Error(`Gagal membuat permintaan: ${error.message}`);
      }
    } else {
      console.error('Unexpected Error:', error);
      throw new Error('Terjadi kesalahan yang tidak diketahui');
    }
  }
}

// Export singleton instance
export const likuiditasApiService = new LikuiditasApiService();
