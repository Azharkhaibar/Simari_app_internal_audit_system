// src/ojk/rekap/utils/rekap-data1.utils.js
import { INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS, PTK_INDICATORS } from '../contants/rekap-data-1';

/**
 * Mendapatkan angka indikator (0-5) berdasarkan skor
 * @param {number|null|undefined} score - Nilai skor
 * @param {boolean} hasData - Apakah data tersedia
 * @returns {number} Angka indikator (0=abu-abu, 1=hijau, 2=lime, 3=kuning, 4=orange, 5=merah)
 */
export const getIndicatorNumber = (score, hasData = true) => {
  if (!hasData) return 0;
  if (score === undefined || score === null || isNaN(score)) return 5;
  if (score >= 0 && score <= 1.49) return 1;
  if (score >= 1.5 && score <= 2.49) return 2;
  if (score >= 2.5 && score <= 3.49) return 3;
  if (score >= 3.5 && score <= 4.49) return 4;
  return 5;
};

/**
 * Mendapatkan class warna Tailwind berdasarkan angka indikator
 * @param {number} number - Angka indikator (0-5)
 * @returns {string} Class warna Tailwind
 */
export const getIndicatorColor = (number) => {
  const colorMap = {
    0: 'bg-gray-300',
    1: 'bg-green-500',
    2: 'bg-lime-500',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };
  return colorMap[number] || 'bg-gray-500';
};

/**
 * Mendapatkan risk indicator berdasarkan skor dan tipe
 * @param {number|null|undefined} score - Nilai skor
 * @param {'inherent'|'kpmr'} type - Tipe indikator
 * @returns {Object} Risk indicator { label, value, color, min, max, score }
 */
export const getRiskIndicator = (score, type = 'inherent') => {
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

/**
 * Mendapatkan PTK indicator berdasarkan skor
 * @param {number|null|undefined} score - Nilai skor
 * @returns {Object} PTK indicator { label, value, color, min, max, score }
 */
export const getPtkIndicator = (score) => {
  const fallback = PTK_INDICATORS[PTK_INDICATORS.length - 1];

  if (score === undefined || score === null || isNaN(score)) return fallback;

  const boundedScore = Math.min(score, 5);

  for (const indicator of PTK_INDICATORS) {
    if (boundedScore >= indicator.min && boundedScore <= indicator.max) {
      return indicator;
    }
  }
  return fallback;
};

/**
 * Mendapatkan nilai BHz default berdasarkan kategori
 * @param {string} categoryId - ID kategori
 * @returns {number} Nilai BHz default (20 untuk operasional, 10 untuk lainnya)
 */
export const getDefaultBhz = (categoryId) => {
  return categoryId === 'operasional' ? 20 : 10;
};

/**
 * Cek ketersediaan data inherent dan KPMR
 * @param {number} inherentSummary - Nilai inherent summary
 * @param {number} kpmrSummary - Nilai KPMR summary
 * @returns {'no-data'|'partial-data'|'complete-data'} Status ketersediaan data
 */
export const checkDataAvailability = (inherentSummary, kpmrSummary) => {
  const hasInherent = inherentSummary > 0;
  const hasKpmr = kpmrSummary > 0;

  if (!hasInherent && !hasKpmr) return 'no-data';
  if ((hasInherent && !hasKpmr) || (!hasInherent && hasKpmr)) return 'partial-data';
  return 'complete-data';
};
