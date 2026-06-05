// hooks/ringkasan.hook.ts
import { useState, useEffect, useMemo } from 'react';
import { RISK_ORDER } from '../utils/ringkasan.utils';
import { ringkasanAPI } from '../services/ringkasan-api';

// ===================== TYPES =====================
export interface RingkasanItem {
  id: number;
  year: number;
  quarter: string;
  riskType: string;
  sectionNo: string;
  sectionLabel: string;
  bobotSection: number;
  subNo: string;
  indikator: string;
  bobotIndikator: number;
  mode: string;
  isPercent: boolean;
  hasil: number | null;
  hasilText: string | null;
  peringkat: number;
}

export interface RingkasanGroup {
  riskType: string;
  sectionNo: string;
  sectionLabel: string;
  bobotSection: number;
  items: RingkasanItem[];
}

export interface RingkasanResponse {
  investasi: RingkasanGroup[];
  pasar: RingkasanGroup[];
  likuiditas: RingkasanGroup[];
  operasional: RingkasanGroup[];
  hukum: RingkasanGroup[];
  stratejik: RingkasanGroup[];
  kepatuhan: RingkasanGroup[];
  reputasi: RingkasanGroup[];
  riskTypeTotals: Record<string, number>;
}

interface UseRingkasanDataReturn {
  groupedByRiskType: Record<string, RingkasanGroup[]>;
  riskTypeTotals: Record<string, number>;
  riskTypeRowSpans: Record<string, number>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// ===================== HOOK =====================
export const useRingkasanData = (viewYear: number, viewQuarter: string): UseRingkasanDataReturn => {
  const [data, setData] = useState<RingkasanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ringkasanAPI.getRingkasanData(viewYear, viewQuarter);
        setData(response.data);
      } catch (err: unknown) {
        console.error('Error fetching ringkasan data:', err);
        setError(err instanceof Error ? err.message : 'Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewYear, viewQuarter, refreshTrigger]);

  const groupedByRiskType = useMemo(() => {
    if (!data) {
      const empty: Record<string, RingkasanGroup[]> = {};
      RISK_ORDER.forEach((riskType) => {
        empty[riskType] = [];
      });
      return empty;
    }

    const result: Record<string, RingkasanGroup[]> = {};
    RISK_ORDER.forEach((riskType) => {
      result[riskType] = data[riskType as keyof RingkasanResponse] || [];
    });
    return result;
  }, [data]);

  const riskTypeTotals = useMemo(() => {
    return data?.riskTypeTotals || {};
  }, [data]);

  const riskTypeRowSpans = useMemo(() => {
    const spans: Record<string, number> = {};
    RISK_ORDER.forEach((riskType) => {
      spans[riskType] = groupedByRiskType[riskType]?.reduce((total, g) => total + (g.items?.length || 0), 0) || 0;
    });
    return spans;
  }, [groupedByRiskType]);

  return {
    groupedByRiskType,
    riskTypeTotals,
    riskTypeRowSpans,
    loading,
    error,
    refresh,
  };
};
