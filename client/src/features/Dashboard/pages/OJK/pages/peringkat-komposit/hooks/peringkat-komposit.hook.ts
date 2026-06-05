// hooks/peringkat-komposit.hook.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHeaderStore } from '../../../store/header';
import { CATEGORIES, DEFAULT_BHZ } from '../contants/peringkat-komposit.contants';
import { getRiskIndicator } from '../utils/peringkat-komposit.utils';
import peringkatKompositApiService from '../services/peringkat-komposit.service';

// ==================== TYPES ====================
export interface SummaryItem {
  id: string;
  nama: string;
  Icon: React.ComponentType<{ className?: string; size?: number; color?: string }>;
  inherentSummary: number;
  kpmrSummary: number;
}

export interface TableRowItem extends SummaryItem {
  bhz: number;
  inherentIndicator: { label: string; value: string; color: string; min: number; max: number; score: number };
  kpmrIndicator: { label: string; value: string; color: string; min: number; max: number; score: number };
  inherentSkor: number;
  kpmrSkor: number;
  inherentNilai: number;
  kpmrNilai: number;
  hasInherent: boolean; // ⬅️ NEW
  hasKpmr: boolean; // ⬅️ NEW
}

export interface FooterData {
  totalBhz: number;
  avgInherentNilai: number;
  avgKpmrNilai: number;
  IndicatoravgInherentNilai: { label: string; value: string; color: string; min: number; max: number; score: number };
  IndicatoravgkpmrNilai: { label: string; value: string; color: string; min: number; max: number; score: number };
  activeCount: number; // ⬅️ NEW: jumlah module yg punya data
  totalCount: number; // ⬅️ NEW: total module
}

// ==================== HOOK 1: Fetch Data ====================
export const useGlobalSummaryAdapter = (): SummaryItem[] => {
  const { year, activeQuarter } = useHeaderStore();
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await peringkatKompositApiService.getPeringkatKomposit({ year, quarter: activeQuarter });

      const mapped = data.map((item: any) => {
        const category = CATEGORIES.find((c: any) => c.id === item.id);
        return {
          id: item.id,
          nama: item.nama,
          Icon: category?.Icon,
          inherentSummary: item.inherentSummary ?? 0,
          kpmrSummary: item.kpmrSummary ?? 0,
        };
      });

      setSummaryData(mapped);
    } catch (error) {
      console.error('Error fetching peringkat komposit:', error);
      setSummaryData([]);
    }
  }, [year, activeQuarter]);

  useEffect(() => {
    fetchData();
    window.addEventListener('risk-data-updated', fetchData);
    return () => window.removeEventListener('risk-data-updated', fetchData);
  }, [fetchData]);

  return summaryData;
};

// ==================== HOOK 2: BHz Values ====================
export const useBhzValues = () => {
  const [bhzValues, setBhzValues] = useState<Record<string, number>>({});

  const handleBhzChange = useCallback((categoryId: string, value: string) => {
    const numValue = Math.min(100, Math.max(0, Number(value) || 0));
    setBhzValues((prev) => ({ ...prev, [categoryId]: numValue }));
  }, []);

  return { bhzValues, handleBhzChange };
};

// ==================== HOOK 3: Table Data ====================
export const useTableData = (summaryData: SummaryItem[], bhzValues: Record<string, number>, search: string): TableRowItem[] => {
  return useMemo(() => {
    return summaryData
      .filter((item) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return item.nama.toLowerCase().includes(s);
      })
      .map((item) => {
        const bhz = bhzValues[item.id] ?? (DEFAULT_BHZ as any)[item.id] ?? DEFAULT_BHZ.default ?? 10;

        // Cek apakah data tersedia (summary > 0)
        const hasInherent = item.inherentSummary > 0;
        const hasKpmr = item.kpmrSummary > 0;

        const inherentIndicator = getRiskIndicator(item.inherentSummary, 'inherent');
        const kpmrIndicator = getRiskIndicator(item.kpmrSummary, 'kpmr');

        const inherentSkor = hasInherent ? inherentIndicator.score : 0;
        const kpmrSkor = hasKpmr ? kpmrIndicator.score : 0;

        const inherentNilai = hasInherent ? (inherentSkor / 5) * 100 * (bhz / 100) : 0;
        const kpmrNilai = hasKpmr ? (kpmrSkor / 5) * 100 * (bhz / 100) : 0;

        return {
          ...item,
          bhz,
          inherentIndicator,
          kpmrIndicator,
          inherentSkor,
          kpmrSkor,
          inherentNilai,
          kpmrNilai,
          hasInherent,
          hasKpmr,
        };
      });
  }, [summaryData, bhzValues, search]);
};

// ==================== HOOK 4: Footer Data ====================
export const useFooterData = (tableData: TableRowItem[]): FooterData => {
  return useMemo(() => {
    const activeData = tableData.filter((item) => item.hasInherent || item.hasKpmr);

    if (activeData.length === 0) {
      return {
        totalBhz: 0,
        avgInherentNilai: 0,
        avgKpmrNilai: 0,
        IndicatoravgInherentNilai: getRiskIndicator(0, 'inherent'),
        IndicatoravgkpmrNilai: getRiskIndicator(0, 'kpmr'),
        activeCount: 0,
        totalCount: tableData.length,
      };
    }

    const totalBhz = activeData.reduce((sum, item) => sum + (item.bhz || 0), 0);
    const sumInherentNilai = activeData.reduce((sum, item) => sum + (item.inherentNilai || 0), 0);
    const sumKpmrNilai = activeData.reduce((sum, item) => sum + (item.kpmrNilai || 0), 0);

    const avgInherentNilai = totalBhz > 0 ? (sumInherentNilai / totalBhz) * 100 : 0;
    const avgKpmrNilai = totalBhz > 0 ? (sumKpmrNilai / totalBhz) * 100 : 0;

    const inherentScore = (avgInherentNilai / 100) * 5;
    const kpmrScore = (avgKpmrNilai / 100) * 5;

    return {
      totalBhz,
      avgInherentNilai,
      avgKpmrNilai,
      IndicatoravgInherentNilai: getRiskIndicator(inherentScore, 'inherent'),
      IndicatoravgkpmrNilai: getRiskIndicator(kpmrScore, 'kpmr'),
      activeCount: activeData.length,
      totalCount: tableData.length,
    };
  }, [tableData]);
};
