import { useMemo } from 'react';

const REKAP1_FINAL_KEY = 'rekap1_final_summary_v1';

/**
 * Helper untuk mendapatkan tahun dan quarter terakhir yang ada datanya
 */
export const getLastAvailablePeriod = () => {
  try {
    const raw = localStorage.getItem(REKAP1_FINAL_KEY) || '{}';
    const parsed = JSON.parse(raw);
    const years = Object.keys(parsed)
      .map(Number)
      .sort((a, b) => b - a);

    if (years.length === 0) {
      return { year: 2025, quarter: 'Q2' };
    }

    const latestYear = years[0];
    const quarters = Object.keys(parsed[latestYear] || {});

    // Sort quarters: Q4 > Q3 > Q2 > Q1
    const quarterOrder = { Q4: 4, Q3: 3, Q2: 2, Q1: 1 };
    const latestQuarter = quarters.sort((a, b) => quarterOrder[b] - quarterOrder[a])[0];

    return {
      year: latestYear,
      quarter: latestQuarter || 'Q4',
    };
  } catch {
    return { year: 2025, quarter: 'Q2' };
  }
};

/**
 * Custom hook untuk mengambil data dashboard dari localStorage
 */
export const useDashboardData = (year, quarter) => {
  return useMemo(() => {
    if (!year || !quarter) {
      return null;
    }

    try {
      const raw = localStorage.getItem(REKAP1_FINAL_KEY) || '{}';
      const parsed = JSON.parse(raw);
      const periodData = parsed?.[year]?.[quarter];

      if (!periodData) {
        return null;
      }

      const { kompositA, kompositB, risks } = periodData;

      // Hitung total dari kompositA dan kompositB
      const total = (kompositA + kompositB) / 2;

      // Hitung risiko perlu perhatian
      const attentionRisks =
        risks && risks.length > 0
          ? risks
              .map((r) => ({
                label: r.label,
                composite: (r.inherent + r.kpmr) / 2,
                inherent: r.inherent,
                kpmr: r.kpmr,
              }))
              .sort((a, b) => b.composite - a.composite)
              .slice(0, 3)
          : [];

      return {
        kompositA: kompositA || 0,
        kompositB: kompositB || 0,
        total: total,
        risks: risks || [],
        attentionRisks,
      };
    } catch (err) {
      console.error('[useDashboardData] Error loading data:', err);
      return null;
    }
  }, [year, quarter]);
};

/**
 * Helper function untuk mendapatkan level risiko dari skor
 */
export const getRiskLevel = (skor) => {
  if (skor < 1.5) return 1;
  if (skor < 2.5) return 2;
  if (skor < 3.5) return 3;
  if (skor < 4.5) return 4;
  return 5;
};

/**
 * Helper function untuk mendapatkan label risiko dari skor
 */
export const getRiskLabel = (skor) => {
  if (skor < 1.5) return 'Low';
  if (skor < 2.5) return 'Low to Moderate';
  if (skor < 3.5) return 'Moderate';
  if (skor < 4.5) return 'Moderate to High';
  return 'High';
};

/**
 * Helper function untuk mendapatkan warna berdasarkan level
 */
export const getRiskColor = (level) => {
  const colors = {
    1: { bg: '#2e7d32', text: 'white' },
    2: { bg: '#92D050', text: '#1f2937' },
    3: { bg: '#ffff00', text: '#1f2937' },
    4: { bg: '#ffc000', text: '#1f2937' },
    5: { bg: '#ff0000', text: 'white' },
  };
  return colors[level] || colors[1];
};

/**
 * Helper function untuk format angka
 */
export const formatNumber = (n, decimals = 2) => {
  if (!Number.isFinite(n)) return '0.00';
  return Number(n).toFixed(decimals);
};
