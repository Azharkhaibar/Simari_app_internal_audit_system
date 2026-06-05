// ===================== FORMATTERS =====================
export const getCurrentYear = () => new Date().getFullYear();
export const getCurrentQuarter = () => 'Q4';

export const fmt = (n) => (Number.isFinite(n) ? Number(n).toFixed(2) : '0.00');

// ===================== LEVEL HELPERS =====================
export const skorToLevel = (skor) => {
  if (skor < 1.5) return 1;
  if (skor < 2.5) return 2;
  if (skor < 3.5) return 3;
  if (skor < 4.5) return 4;
  return 5;
};

export const getKualitasLabel = (skor) => {
  if (skor < 1.5) return 'Strong';
  if (skor < 2.5) return 'Satisfactory';
  if (skor < 3.5) return 'Fair';
  if (skor < 4.5) return 'Marginal';
  return 'Unsatisfactory';
};

export const getKualitasInherenLabel = (skor) => {
  if (skor < 1.5) return 'Low';
  if (skor < 2.5) return 'Low to Moderate';
  if (skor < 3.5) return 'Moderate';
  if (skor < 4.5) return 'Moderate to High';
  return 'High';
};

export const getPeringkatLabel = (skor) => {
  if (skor < 1.5) return 'Peringkat 1';
  if (skor < 2.5) return 'Peringkat 2';
  if (skor < 3.5) return 'Peringkat 3';
  if (skor < 4.5) return 'Peringkat 4';
  return 'Peringkat 5';
};

import { LEVEL_BG_COLOR, LEVEL_TEXT_COLOR } from '../constants/constants';
export const getColorBySkor = (skor) => {
  const level = skorToLevel(skor);
  return { level, bg: LEVEL_BG_COLOR[level], text: LEVEL_TEXT_COLOR[level] };
};

// ===================== CALCULATIONS =====================
export const hitungSkorKPMR = (rows) => {
  if (!rows || rows.length === 0) return 0;
  const aspekGroups = {};
  rows.forEach((item) => {
    const key = item.aspekNo ?? 'default';
    if (!aspekGroups[key]) aspekGroups[key] = [];
    aspekGroups[key].push(Number(item.sectionSkor ?? 0));
  });
  const aspekAvg = Object.values(aspekGroups).map((arr) => arr.reduce((a, b) => a + b, 0) / arr.length);
  return aspekAvg.length > 0 ? aspekAvg.reduce((a, b) => a + b, 0) / aspekAvg.length : 0;
};

export const hitungSummary = (rows) => {
  return rows.reduce((sum, r) => {
    const w = Number(r.weighted || 0);
    return sum + (Number.isFinite(w) ? w : 0);
  }, 0);
};

export const hitungSkorInheren = (summary, bvt) => summary * (bvt / 100);
export const hitungPeringkatRisiko = (skorInheren, skorKPMR) => (skorInheren + skorKPMR) / 2;

export const hitungKompositA = (riskRows) => {
  return riskRows.reduce((sum, r) => {
    const bobot = Number(r.bobot || 0);
    const skor = Number(r.skor || 0);
    return bobot > 0 && Number.isFinite(skor) ? sum + skor * (bobot / 100) : sum;
  }, 0);
};

export const hitungKompositB = (riskRowsKPMR) => {
  return riskRowsKPMR.reduce((sum, r) => {
    return r.bobot > 0 && Number.isFinite(r.skor) ? sum + r.skor * (r.bobot / 100) : sum;
  }, 0);
};

// ===================== STORAGE HELPERS =====================
import { BHZ_STORAGE_KEY } from '../constants/constants';

export const loadBhzConfig = (year, quarter) => {
  try {
    const raw = localStorage.getItem(BHZ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.[year]?.[quarter] || {};
  } catch {
    return {};
  }
};

export const saveBhzConfig = (year, quarter, data) => {
  try {
    const raw = JSON.parse(localStorage.getItem(BHZ_STORAGE_KEY) || '{}');
    if (!raw[year]) raw[year] = {};
    raw[year][quarter] = { ...(raw[year][quarter] || {}), ...data };
    localStorage.setItem(BHZ_STORAGE_KEY, JSON.stringify(raw));
  } catch {}
};

export const loadRiskSummary = (storageKey, year, quarter) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.filter((r) => r.year === year && r.quarter === quarter);
  } catch {
    return [];
  }
};

export const loadKPMRData = (defKey, scoreKey, year, quarter) => {
  try {
    const definitionsRaw = localStorage.getItem(defKey);
    if (!definitionsRaw) return [];
    const definitions = JSON.parse(definitionsRaw);
    const scoresRaw = localStorage.getItem(scoreKey);
    if (!scoresRaw) return [];
    const scores = JSON.parse(scoresRaw);
    const result = [];
    for (const score of scores) {
      if (score.year !== year || score.quarter !== quarter) continue;
      const definition = definitions.find((d) => d.id === score.definitionId);
      if (!definition) continue;
      result.push({
        aspekNo: definition.aspekNo || '',
        aspekTitle: definition.aspekTitle || '',
        aspekBobot: definition.aspekBobot || 0,
        sectionNo: definition.sectionNo || '',
        sectionTitle: definition.sectionTitle || '',
        sectionSkor: score.sectionSkor || 0,
        year: score.year,
        quarter: score.quarter,
      });
    }
    return result;
  } catch (err) {
    console.error(`Error loading KPMR data:`, err);
    return [];
  }
};
