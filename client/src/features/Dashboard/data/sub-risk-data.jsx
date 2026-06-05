import { useMemo } from 'react';

// List of risk types and their localStorage keys
const RISK_DATA_KEYS = {
  investasi: 'rekap_investasi',
  pasar: 'rekap_pasar',
  likuiditas: 'rekap_likuiditas',
  operasional: 'rekap_operasional',
  hukum: 'rekap_hukum',
  stratejik: 'rekap_stratejik',
  kepatuhan: 'rekap_kepatuhan',
  reputasi: 'rekap_reputasi',
};

// Risk type labels
const RISK_LABELS = {
  investasi: 'Investasi',
  pasar: 'Pasar',
  likuiditas: 'Likuiditas',
  operasional: 'Operasional',
  hukum: 'Hukum',
  stratejik: 'Stratejik',
  kepatuhan: 'Kepatuhan',
  reputasi: 'Reputasi',
};

// Default BVT values (can be overridden by user input in Rekap1)
const DEFAULT_BVT = {
  investasi: 100,
  pasar: 100,
  likuiditas: 100,
  operasional: 100,
  hukum: 100,
  stratejik: 100,
  kepatuhan: 100,
  reputasi: 100,
};

/**
 * Load BVT config from localStorage
 * Format: { investasi: 95, pasar: 100, ... }
 */
const loadBvtConfig = (year, quarter) => {
  try {
    const raw = localStorage.getItem('rekap1_bhz_config_v1');
    if (!raw) return DEFAULT_BVT;

    const parsed = JSON.parse(raw);
    const periodConfig = parsed?.[year]?.[quarter];

    if (!periodConfig) return DEFAULT_BVT;

    // Map config keys to risk types
    return {
      investasi: periodConfig.investasi || DEFAULT_BVT.investasi,
      pasar: periodConfig.pasar || DEFAULT_BVT.pasar,
      likuiditas: periodConfig.likuiditas || DEFAULT_BVT.likuiditas,
      operasional: periodConfig.operasional || DEFAULT_BVT.operasional,
      hukum: periodConfig.hukum || DEFAULT_BVT.hukum,
      stratejik: periodConfig.stratejik || DEFAULT_BVT.stratejik,
      kepatuhan: periodConfig.kepatuhan || DEFAULT_BVT.kepatuhan,
      reputasi: periodConfig.reputasi || DEFAULT_BVT.reputasi,
    };
  } catch {
    return DEFAULT_BVT;
  }
};

/**
 * Custom hook untuk load data sub-risiko dari semua jenis risiko
 * Menghitung summary dan skor risiko seperti di Rekap1.jsx
 *
 * Formula:
 * - weighted = (bobotSection × bobotIndikator × peringkat) / 10000
 * - summary = sum(weighted) untuk semua sub-risiko
 * - skorRisiko = summary × (BVT / 100)
 *
 * @param {number} year - Tahun data yang ingin diambil
 * @param {string} quarter - Quarter data yang ingin diambil
 * @returns {object} Data sub-risiko untuk dashboard
 */
export const useRiskSubRiskData = (year, quarter) => {
  return useMemo(() => {
    if (!year || !quarter) {
      return { riskData: [], loading: false, error: null };
    }

    try {
      // Load BVT config
      const bvtConfig = loadBvtConfig(year, quarter);

      const riskData = [];

      // Load data dari setiap jenis risiko
      for (const [riskType, storageKey] of Object.entries(RISK_DATA_KEYS)) {
        try {
          const raw = localStorage.getItem(storageKey);
          if (!raw) continue;

          const allData = JSON.parse(raw);

          // Filter data berdasarkan year dan quarter
          // Handle string vs number comparison
          const periodData = allData.filter((item) => {
            const itemYear = String(item.year);
            const filterYear = String(year);
            return itemYear === filterYear && item.quarter === quarter;
          });

          console.log(`[useRiskSubRiskData] ${riskType}: ${periodData.length} sub-risiko untuk ${year} ${quarter}`);

          if (periodData.length === 0) {
            console.log(`[useRiskSubRiskData] ${riskType}: No data found. Available years:`, [...new Set(allData.map((d) => d.year))]);
            continue;
          }

          // Hitung summary = total weighted dari semua sub-risiko
          // weighted = (bobotSection × bobotIndikator × peringkat) / 10000
          let totalWeighted = 0;

          // Hitung jumlah sub-risiko per kategori berdasarkan field 'peringkat'
          const categories = {
            high: 0, // Peringkat 5
            moderateHigh: 0, // Peringkat 4
            moderate: 0, // Peringkat 3
            lowModerate: 0, // Peringkat 2
            low: 0, // Peringkat 1
          };

          periodData.forEach((item) => {
            // Add weighted to summary
            const weighted = Number(item.weighted) || 0;
            totalWeighted += weighted;

            // Kategorikan berdasarkan skor peringkat
            const peringkat = Number(item.peringkat) || 0;
            if (peringkat > 0) {
              if (peringkat === 5) {
                categories.high++;
              } else if (peringkat === 4) {
                categories.moderateHigh++;
              } else if (peringkat === 3) {
                categories.moderate++;
              } else if (peringkat === 2) {
                categories.lowModerate++;
              } else if (peringkat === 1) {
                categories.low++;
              }
            }
          });

          // SKOR RISIKO = SUMMARY (total weighted)
          // Ini adalah skor per jenis risiko yang ditampilkan di Rekap1
          // TIDAK dikali BVT% karena BVT hanya untuk perhitungan komposit
          const skorRisiko = totalWeighted;

          riskData.push({
            type: riskType,
            label: RISK_LABELS[riskType],
            categories,
            summary: totalWeighted,
            skorRisiko: totalWeighted, // Sama dengan summary
            subRiskCount: periodData.length,
          });
        } catch (err) {
          console.error(`[useRiskSubRiskData] Error loading ${storageKey}:`, err);
        }
      }

      // Urutkan berdasarkan skor risiko tertinggi (untuk "Risiko Tertinggi")
      riskData.sort((a, b) => b.skorRisiko - a.skorRisiko);

      // Debug: Log semua skor risiko untuk dibandingkan dengan Rekap1
      console.log('[useRiskSubRiskData] === RISK SCORES FOR', year, quarter, '===');
      console.log(
        '[useRiskSubRiskData] All risk scores (sorted by score):',
        riskData.map((r) => ({
          label: r.label,
          skorRisiko: Number(r.skorRisiko.toFixed(2)),
          summary: Number(r.summary.toFixed(2)),
          high: r.categories.high,
          moderateHigh: r.categories.moderateHigh,
          moderate: r.categories.moderate,
        })),
      );
      console.log(
        '[useRiskSubRiskData] Top 3 by score:',
        riskData.slice(0, 3).map((r) => `${r.label}: ${r.skorRisiko.toFixed(2)} (summary=${r.summary.toFixed(2)})`),
      );

      return { riskData, loading: false, error: null };
    } catch (err) {
      console.error('[useRiskSubRiskData] Error:', err);
      return { riskData: [], loading: false, error: err.message };
    }
  }, [year, quarter]);
};

/**
 * Helper function untuk format tampilan kotak warna
 * Format: "2🔴 3🟠 1🟡" (2 High, 3 Moderate to High, 1 Moderate)
 *
 * @param {object} categories - Object categories { high, moderateHigh, moderate, lowModerate, low }
 * @returns {string} Format compact dengan emoji
 */
export const formatRiskCategories = (categories) => {
  if (!categories) return '-';

  const parts = [];
  if (categories.high > 0) parts.push(`${categories.high}🔴`);
  if (categories.moderateHigh > 0) parts.push(`${categories.moderateHigh}🟠`);
  if (categories.moderate > 0) parts.push(`${categories.moderate}🟡`);

  return parts.join(' ') || '-';
};
