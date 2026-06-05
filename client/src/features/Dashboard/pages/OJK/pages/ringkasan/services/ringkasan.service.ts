// src/features/Dashboard/pages/Ringkasan/services/ringkasan.service.ts

import { useHeaderStore } from '../../../store/headerStore';

// ============================================================
// TYPES
// ============================================================

export interface NilaiItem {
  id: string;
  nomor?: string;
  bobot: number;
  portofolio: number;
  judul: {
    text: string;
    pembilang: string;
    penyebut: string;
    type: string;
    value?: string | number | null;
    valuePembilang?: string | number | null;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };
  derived?: {
    weighted: number;
    riskLevel: number;
    hasilDisplay: string;
  };
}

export interface SummaryItem {
  id: string;
  nomor?: string;
  judul: string;
  bobot: number;
  kategori: {
    model: string;
    prinsip: string;
    jenis: string;
    underlying: string[];
  };
  nilaiList?: NilaiItem[];
}

export interface PageData {
  no: number;
  categoryId: string;
  categoryLabel: string;
  categoryCode: string;
  rows: SummaryItem[];
  totalWeighted: number;
  hasData: boolean;
  error?: string;
}

export interface KategoriFilter {
  model: string;
  prinsip: string;
  jenis: string;
  underlying: string[];
}

export interface RingkasanQueryParams {
  year: number;
  quarter: number;
  categoryIds: string[];
  model?: string;
  prinsip?: string;
  jenis?: string;
  underlying?: string[];
}

// ============================================================
// API SERVICE CLASS
// ============================================================

class RingkasanService {
  private baseUrl = '/api/v1/ringkasan';

  /**
   * Fetch ringkasan data dari backend
   */
  async fetchRingkasan(params: RingkasanQueryParams): Promise<PageData[]> {
    const url = this.buildUrl(params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PageData[] = await response.json();
    return data;
  }

  /**
   * Fetch ringkasan dengan abort controller untuk cancellation
   */
  async fetchRingkasanWithAbort(params: RingkasanQueryParams, signal?: AbortSignal): Promise<PageData[]> {
    const url = this.buildUrl(params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PageData[] = await response.json();
    return data;
  }

  /**
   * Build URL dengan query parameters
   */
  private buildUrl(params: RingkasanQueryParams): string {
    const searchParams = new URLSearchParams({
      year: String(params.year),
      quarter: String(params.quarter),
      categoryIds: params.categoryIds.join(','),
    });

    if (params.model) {
      searchParams.append('model', params.model);
    }
    if (params.prinsip) {
      searchParams.append('prinsip', params.prinsip);
    }
    if (params.jenis) {
      searchParams.append('jenis', params.jenis);
    }
    if (params.underlying && params.underlying.length > 0) {
      searchParams.append('underlying', params.underlying.join(','));
    }

    return `${this.baseUrl}?${searchParams.toString()}`;
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const ringkasanService = new RingkasanService();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Normalize page data dari backend
 * Menerapkan filter ulang dan menghitung totalWeighted
 */
export const normalizePageData = (data: PageData[], kategoriFilter: KategoriFilter, filterFn: (rows: SummaryItem[], filter: KategoriFilter) => SummaryItem[], calculateFn: (data: SummaryItem[]) => number): PageData[] => {
  return data.map((item) => {
    if (!item.hasData) {
      return {
        no: item.no,
        categoryId: item.categoryId,
        categoryLabel: item.categoryLabel,
        categoryCode: item.categoryCode,
        rows: [],
        totalWeighted: 0,
        hasData: false,
        error: item.error,
      };
    }

    const filteredRows = filterFn(item.rows, kategoriFilter);

    if (filteredRows.length === 0) {
      return {
        no: item.no,
        categoryId: item.categoryId,
        categoryLabel: item.categoryLabel,
        categoryCode: item.categoryCode,
        rows: [],
        totalWeighted: 0,
        hasData: false,
      };
    }

    const totalWeighted = calculateFn(filteredRows);

    return {
      no: item.no,
      categoryId: item.categoryId,
      categoryLabel: item.categoryLabel,
      categoryCode: item.categoryCode,
      rows: filteredRows,
      totalWeighted,
      hasData: true,
    };
  });
};

/**
 * Build query params dari header store dan filter
 */
export const buildQueryParams = (year: number, quarter: number, selectedPages: string[], filter: KategoriFilter): RingkasanQueryParams => {
  const params: RingkasanQueryParams = {
    year,
    quarter,
    categoryIds: selectedPages,
  };

  if (filter.model) params.model = filter.model;
  if (filter.prinsip) params.prinsip = filter.prinsip;
  if (filter.jenis) params.jenis = filter.jenis;
  if (filter.underlying && filter.underlying.length > 0) {
    params.underlying = filter.underlying;
  }

  return params;
};
