// rekapData.utils.js
import { calculatePeringkat, calculatePeringkatFromText, isNumericRiskLevels } from './riskcalculator';

// ===================== CONSTANTS =====================
export const RISK_SOURCES = ['INVESTASI', 'PASAR', 'LIKUIDITAS', 'OPERASIONAL', 'HUKUM', 'STRATEJIK', 'KEPATUHAN', 'REPUTASI'];

export const SOURCE_ORDER = RISK_SOURCES;

export const QUARTER_ORDER = ['Q1', 'Q2', 'Q3', 'Q4'];

export const QUARTER_LABEL = {
  Q1: 'MAR',
  Q2: 'JUN',
  Q3: 'SEP',
  Q4: 'DES',
};

export const STORAGE_KEYS = {
  INVESTASI: 'investasiRows',
  PASAR: 'pasarRows',
  LIKUIDITAS: 'likuiditasRows',
  OPERASIONAL: 'operasionalRows',
  HUKUM: 'hukumRows',
  STRATEJIK: 'stratejikRows',
  KEPATUHAN: 'kepatuhanRows',
  REPUTASI: 'reputasiRows',
  REKAP_LIKUIDITAS: 'rekap_likuiditas',
  OPERASIONAL_SECTIONS: 'operasional_sections_v1',
  HUKUM_SECTIONS: 'hukum_sections_v2',
  STRATEJIK_SECTIONS: 'stratejik_sections_v2',
  KEPATUHAN_SECTIONS: 'kepatuhan_sections_v2',
  REPUTASI_SECTIONS: 'reputasi_sections_v2',
};

export const PNM_BRAND = {
  primary: '#0068B3',
  primarySoft: '#E6F1FA',
  gradient: 'bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90',
};

// ===================== FORMATTERS =====================
export const fmtNumber = (v) => {
  if (v === '' || v == null) return '';
  const cleaned = String(v).replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const fmtInputNumber = (v) => {
  if (v === '' || v == null) return '';
  return String(v).trim();
};

export const parseNum = (v) => {
  if (v == null || v === '') return NaN;
  let s = String(v)
    .trim()
    .replace(/\u00A0/g, '')
    .replace(/%/g, '');
  if (!s) return NaN;
  if (!isNaN(s)) return parseFloat(s);

  const hasComma = s.indexOf(',') !== -1;
  const hasDot = s.indexOf('.') !== -1;

  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma && !hasDot) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else {
    s = s.replace(/,/g, '');
  }

  const n = parseFloat(s.replace(/\s+/g, ''));
  return Number.isNaN(n) ? NaN : n;
};

export const parseNumForCalc = (v) => {
  if (v == null || v === '') return 0;
  let s = String(v).trim();
  const isPercent = s.includes('%');
  if (isPercent) s = s.replace(/%/g, '');
  s = s.replace(/\./g, '').replace(/,/g, '.').trim();
  let n = parseFloat(s);
  if (isNaN(n)) return 0;
  return isPercent ? n / 100 : n;
};

export const normalizeHasilDisplay = (hasilRaw, isPercent) => {
  if (hasilRaw === '' || hasilRaw == null) return '';
  const num = Number(hasilRaw);
  if (!Number.isFinite(num) || Number.isNaN(num)) return '';
  if (isPercent) return `${(num * 100).toFixed(2)}%`;
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(num);
};

// ===================== ROW KEY GENERATORS =====================
export const makeRowKey = (r) => `${r.source || 'INVESTASI'}|${r.year}|${r.quarter}|${r.no ?? ''}|${r.subNo ?? ''}|${r.sectionLabel ?? ''}|${r.indikator ?? ''}`;

export const makeStableKey = (source, sectionName, indikatorLabel, no, subNo, rowIndex = '') => {
  const cleanSection = String(sectionName || '')
    .replace(/[|]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 30);
  const cleanIndikator = String(indikatorLabel || '')
    .replace(/[|]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 30);
  const cleanNo = String(no || 'none');
  const cleanSubNo = String(subNo || 'none');
  const suffix = rowIndex !== '' ? `-${rowIndex}` : '';
  return `${source}-${cleanNo}-${cleanSubNo}-${cleanSection}-${cleanIndikator}${suffix}`;
};

// ===================== ROW SPAN CALCULATIONS =====================
export const calculateRowSpan = (mode) => {
  if (mode === 'TEKS') return 1;
  if (mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') return 2;
  return 3;
};

export const calculateTotalRowsForSource = (indicators) => {
  return indicators.reduce((sum, ind) => sum + calculateRowSpan(ind.mainRow?.mode ?? 'RASIO'), 0);
};

export const calculateTotalRowsForSection = (indicators) => {
  return indicators.reduce((sum, ind) => sum + calculateRowSpan(ind.mainRow?.mode ?? 'RASIO'), 0);
};

// ===================== COMPUTE HASIL =====================
export const computeHasilFromValues = (row) => {
  const mode = row.mode || 'RASIO';
  const pembRaw = row.numeratorValue ?? row.pembilangValue ?? row.pembilang ?? row.numerator ?? '';
  const penyRaw = row.denominatorValue ?? row.penyebutValue ?? row.penyebut ?? row.denominator ?? '';

  if ((pembRaw === '' || pembRaw == null) && (penyRaw === '' || penyRaw == null)) return '';

  if (mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') {
    const raw = penyRaw || pembRaw;
    if (raw === '' || raw == null) return '';
    const val = parseNum(raw);
    return Number.isFinite(val) ? Number(val) : '';
  }

  const pemb = parseNumForCalc(pembRaw);
  const peny = parseNumForCalc(penyRaw);
  if (!isFinite(pemb) || !isFinite(peny) || peny === 0) return '';

  if (row.formula && row.formula.trim() !== '') {
    try {
      const expr = row.formula.replace(/\bpemb\b/g, 'pemb').replace(/\bpeny\b/g, 'peny');
      const fn = new Function('pemb', 'peny', `return (${expr});`);
      const res = fn(pemb, peny);
      if (!isFinite(res) || isNaN(res)) return '';
      return Number(res);
    } catch (e) {
      // fallback
    }
  }

  const result = pemb / peny;
  return isFinite(result) && !isNaN(result) ? Number(result) : '';
};

// ===================== LOADERS (LOCALSTORAGE) =====================
export const loadFromLocal = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn(`Gagal baca ${key}`, e);
    return [];
  }
};

export const loadRowsWithPeringkat = (key) => {
  const rows = loadFromLocal(key);
  return rows.map((row) => {
    if (row.mode !== 'TEKS') return row;
    const riskLevels = {
      low: row.low || '',
      lowToModerate: row.lowToModerate || '',
      moderate: row.moderate || '',
      moderateToHigh: row.moderateToHigh || '',
      high: row.high || '',
    };
    const newPeringkat = calculatePeringkatFromText(row.hasilText || '', riskLevels);
    if (row.peringkat !== newPeringkat || !row.peringkat) {
      return { ...row, peringkat: newPeringkat };
    }
    return row;
  });
};

// ===================== NORMALIZE DATA =====================
export const normalizeRow = (r, source, year, quarter) => {
  const getLabel = (label) => {
    if (!label || label === '' || label === '-') return '-';
    return label;
  };

  return {
    source,
    year: r.year ?? year,
    quarter: r.quarter ?? quarter,
    no: r.no ?? '',
    subNo: r.subNo ?? '',
    sectionLabel: r.sectionLabel ?? r.parameter ?? '—',
    indikator: r.indikator ?? '—',
    numeratorLabel: getLabel(r.numeratorLabel ?? r.pembilangLabel ?? ''),
    numeratorValue: r.numeratorValue ?? r.pembilangValue ?? r.pembilang ?? '',
    denominatorLabel: getLabel(r.denominatorLabel ?? r.penyebutLabel ?? ''),
    denominatorValue: r.denominatorValue ?? r.penyebutValue ?? r.penyebut ?? '',
    isPercent: !!r.isPercent,
    mode: r.mode ?? 'RASIO',
    formula: r.formula ?? '',
    hasil: r.hasil ?? r.result ?? '',
    hasilText: r.hasilText ?? '',
    bobotSection: r.bobotSection ?? '',
    bobotIndikator: r.bobotIndikator ?? '',
    sumberRisiko: r.sumberRisiko ?? '',
    dampak: r.dampak ?? '',
    low: r.low ?? '',
    lowToModerate: r.lowToModerate ?? '',
    moderate: r.moderate ?? '',
    moderateToHigh: r.moderateToHigh ?? '',
    high: r.high ?? '',
    keterangan: r.keterangan ?? '',
    peringkat: r.peringkat ?? 0,
    weighted: r.weighted ?? 0,
    raw: r,
  };
};
