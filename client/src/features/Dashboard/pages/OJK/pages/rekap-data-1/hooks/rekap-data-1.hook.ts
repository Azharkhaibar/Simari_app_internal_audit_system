// src/ojk/rekap/hooks/rekap-data1.hook.ts
import { useState, useEffect, useMemo } from 'react';
import { useHeaderStore } from '../../../store/header';
import rekapData1ApiService from '../service/rekap-data-1.service';
import { CATEGORIES, INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS, DEFAULT_BHZ_OPERATIONAL, DEFAULT_BHZ_NORMAL, DEFAULT_BVT } from '../contants/rekap-data-1';

// ==================== TYPES ====================
export interface SummaryItem {
  id: string;
  nama: string;
  inherentSummary: number;
  kpmrSummary: number;
}

export interface TableRow extends SummaryItem {
  bvt: number;
  bhz: number;
  inherentSkor: number;
  kpmrSkor: number;
  kompositSkor: number;
  inherentValueForFooter: number;
  kpmrValueForFooter: number;
  inherentIndicator: (typeof INHERENT_RISK_INDICATORS)[0];
  kpmrIndicator: (typeof KPMR_RISK_INDICATORS)[0];
  kompositIndicator: (typeof INHERENT_RISK_INDICATORS)[0];
  hasInherentData: boolean;
  hasKpmrData: boolean;
  dataStatus: 'no-data' | 'partial-data' | 'complete-data';
}

export interface FooterDisplay {
  inherentDisplay: number;
  kpmrDisplay: number;
  ptkDisplay: number;
  inherentIndicator: (typeof INHERENT_RISK_INDICATORS)[0];
  kpmrIndicator: (typeof KPMR_RISK_INDICATORS)[0];
  ptkIndicator: (typeof INHERENT_RISK_INDICATORS)[0];
  hasInherentData: boolean;
  hasKpmrData: boolean;
  hasCompleteData: boolean;
  hasPartialData: boolean;
  hasNoData: boolean;
  categoriesWithInherentData: number;
  categoriesWithKpmrData: number;
}

// ==================== HELPER FUNCTIONS ====================
const getRiskIndicator = (score: number, type: 'inherent' | 'kpmr' = 'inherent') => {
  const indicators = type === 'kpmr' ? KPMR_RISK_INDICATORS : INHERENT_RISK_INDICATORS;
  const fallback = indicators[indicators.length - 1];

  if (score === undefined || score === null || isNaN(score)) return fallback;

  for (const indicator of indicators) {
    if (score >= indicator.min && score <= indicator.max) {
      return indicator;
    }
  }
  return fallback;
};

const getDefaultBhz = (categoryId: string): number => {
  return categoryId === 'operasional' ? DEFAULT_BHZ_OPERATIONAL : DEFAULT_BHZ_NORMAL;
};

const checkDataAvailability = (inherentSummary: number, kpmrSummary: number) => {
  const hasInherent = inherentSummary > 0;
  const hasKpmr = kpmrSummary > 0;

  if (!hasInherent && !hasKpmr) return 'no-data';
  if ((hasInherent && !hasKpmr) || (!hasInherent && hasKpmr)) return 'partial-data';
  return 'complete-data';
};

// ==================== MAIN HOOK ====================
export function useRekapData1() {
  const { year, activeQuarter, search } = useHeaderStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);
  const [bhzValues, setBhzValues] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      defaults[cat.id] = getDefaultBhz(cat.id);
    });
    return defaults;
  });

  // ==================== LOAD DATA FROM BACKEND ====================
  useEffect(() => {
    if (!year || !activeQuarter) return;

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`📡 [useRekapData1] Fetching data for year ${year}, quarter ${activeQuarter}`);

        const response = await rekapData1ApiService.getSummaryData({
          year,
          quarter: activeQuarter,
        });

        if (cancelled) return;

        if (response.success && response.data) {
          // Map response data to SummaryItem format
          const mappedData: SummaryItem[] = response.data.map((item) => ({
            id: item.id,
            nama: item.nama,
            inherentSummary: item.inherentSummary,
            kpmrSummary: item.kpmrSummary,
          }));

          setSummaryData(mappedData);
          console.log(`✅ [useRekapData1] Data loaded: ${mappedData.length} categories`);
        } else {
          throw new Error(response.message || 'Gagal memuat data');
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ [useRekapData1] Error:', err);
          setError(err.message || 'Gagal memuat data');
          setSummaryData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [year, activeQuarter]);

  // ==================== REFRESH DATA ====================
  const refreshData = () => {
    if (year && activeQuarter) {
      // Trigger re-fetch by forcing re-run of useEffect
      setIsLoading(true);
      // The useEffect will run again when year/activeQuarter changes
      // So we just need to trigger a re-fetch
      window.dispatchEvent(new CustomEvent('risk-data-updated'));
    }
  };

  // Listen for global data updates
  useEffect(() => {
    const handleUpdate = () => {
      if (year && activeQuarter) {
        // Re-fetch data
        const refetch = async () => {
          try {
            const response = await rekapData1ApiService.getSummaryData({
              year,
              quarter: activeQuarter,
            });
            if (response.success && response.data) {
              const mappedData: SummaryItem[] = response.data.map((item) => ({
                id: item.id,
                nama: item.nama,
                inherentSummary: item.inherentSummary,
                kpmrSummary: item.kpmrSummary,
              }));
              setSummaryData(mappedData);
            }
          } catch (err) {
            console.error('Error refreshing data:', err);
          }
        };
        refetch();
      }
    };

    window.addEventListener('risk-data-updated', handleUpdate);
    return () => window.removeEventListener('risk-data-updated', handleUpdate);
  }, [year, activeQuarter]);

  // ==================== FILTER BY SEARCH ====================
  const filteredData = useMemo(() => {
    if (!search) return summaryData;
    const s = search.toLowerCase();
    return summaryData.filter((item) => item.nama.toLowerCase().includes(s));
  }, [search, summaryData]);

  // ==================== CALCULATE TABLE DATA ====================
  const tableData: TableRow[] = useMemo(() => {
    return filteredData.map((item) => {
      const bvt = DEFAULT_BVT;
      const bhz = bhzValues[item.id] ?? getDefaultBhz(item.id);
      const inherentSummary = item.inherentSummary || 0;
      const kpmrSummary = item.kpmrSummary || 0;

      const inherentSkor = inherentSummary;
      const kpmrSkor = kpmrSummary;
      const kompositSkor = (inherentSkor + kpmrSkor) / 2;

      const inherentValueForFooter = inherentSkor * (bhz / 100);
      const kpmrValueForFooter = kpmrSkor * (bhz / 100);
      const dataStatus = checkDataAvailability(inherentSummary, kpmrSummary);

      return {
        ...item,
        bvt,
        bhz,
        inherentSummary,
        kpmrSummary,
        inherentSkor,
        kpmrSkor,
        kompositSkor,
        inherentValueForFooter,
        kpmrValueForFooter,
        dataStatus,
        inherentIndicator: getRiskIndicator(inherentSkor, 'inherent'),
        kpmrIndicator: getRiskIndicator(kpmrSkor, 'kpmr'),
        kompositIndicator: getRiskIndicator(kompositSkor, 'inherent'),
        hasInherentData: inherentSummary > 0,
        hasKpmrData: kpmrSummary > 0,
      };
    });
  }, [filteredData, bhzValues]);

  // ==================== CALCULATE FOOTER DISPLAY ====================
  const footerDisplay: FooterDisplay = useMemo(() => {
    let totalInherentValue = 0;
    let totalKpmrValue = 0;
    let categoriesWithInherentData = 0;
    let categoriesWithKpmrData = 0;
    let categoriesWithAnyData = 0;

    summaryData.forEach((item) => {
      const bhz = bhzValues[item.id] ?? getDefaultBhz(item.id);
      const inherentSkor = item.inherentSummary || 0;
      const kpmrSkor = item.kpmrSummary || 0;

      if (item.inherentSummary > 0) {
        totalInherentValue += inherentSkor * (bhz / 100);
        categoriesWithInherentData++;
        categoriesWithAnyData++;
      }
      if (item.kpmrSummary > 0) {
        totalKpmrValue += kpmrSkor * (bhz / 100);
        categoriesWithKpmrData++;
        categoriesWithAnyData++;
      }
    });

    const inherentDisplay = totalInherentValue;
    const kpmrDisplay = totalKpmrValue;
    let ptkDisplay = 0;
    const hasCompleteData = categoriesWithInherentData > 0 && categoriesWithKpmrData > 0;
    const hasPartialData = (categoriesWithInherentData > 0 && categoriesWithKpmrData === 0) || (categoriesWithInherentData === 0 && categoriesWithKpmrData > 0);
    const hasNoData = categoriesWithAnyData === 0;

    if (hasCompleteData) {
      ptkDisplay = (inherentDisplay + kpmrDisplay) / 2;
    }

    return {
      inherentDisplay,
      kpmrDisplay,
      ptkDisplay,
      inherentIndicator: getRiskIndicator(inherentDisplay, 'inherent'),
      kpmrIndicator: getRiskIndicator(kpmrDisplay, 'kpmr'),
      ptkIndicator: getRiskIndicator(ptkDisplay, 'inherent'),
      hasInherentData: categoriesWithInherentData > 0,
      hasKpmrData: categoriesWithKpmrData > 0,
      hasCompleteData,
      hasPartialData,
      hasNoData,
      categoriesWithInherentData,
      categoriesWithKpmrData,
    };
  }, [summaryData, bhzValues]);

  // ==================== HANDLE BHZ CHANGE ====================
  const handleBhzChange = (id: string, value: string) => {
    const numValue = Math.min(100, Math.max(0, Number(value) || 0));
    setBhzValues((prev) => ({ ...prev, [id]: numValue }));
  };

  // ==================== RESET BHZ TO DEFAULT ====================
  const resetBhzToDefault = () => {
    const defaults: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      defaults[cat.id] = getDefaultBhz(cat.id);
    });
    setBhzValues(defaults);
  };

  return {
    // State
    summaryData,
    tableData,
    footerDisplay,
    bhzValues,
    isLoading,
    error,
    // Actions
    handleBhzChange,
    resetBhzToDefault,
    refreshData,
  };
}

export default useRekapData1;
