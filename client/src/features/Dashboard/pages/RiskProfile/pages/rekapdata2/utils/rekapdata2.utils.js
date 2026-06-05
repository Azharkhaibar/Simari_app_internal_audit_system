// utils/rekapdata2.utils.js

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

// ✅ TAMBAHKAN INI
export const QUARTER_TO_MONTH = {
  Q1: 'Mar',
  Q2: 'Jun',
  Q3: 'Sep',
  Q4: 'Dec',
};

export const PNM_BRAND = {
  primary: '#0068B3',
  primarySoft: '#E6F1FA',
  gradient: 'bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90',
};

export const RISK_LABEL = {
  1: 'Low',
  2: 'Low to Moderate',
  3: 'Moderate',
  4: 'Moderate to High',
  5: 'High',
};

export const RISK_COLOR = {
  1: '#2e7d32',
  2: '#92D050',
  3: '#ffff00',
  4: '#ffc000',
  5: '#ff0000',
};

export const getRiskStyle = (value) => {
  const riskLevel = Number(value);
  if (isNaN(riskLevel) || riskLevel < 1 || riskLevel > 5) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
    };
  }

  const colorMap = {
    1: { bg: 'bg-[#2e7d32]', text: 'text-white' },
    2: { bg: 'bg-[#92D050]', text: 'text-white' },
    3: { bg: 'bg-[#ffff00]', text: 'text-gray-800' },
    4: { bg: 'bg-[#ffc000]', text: 'text-gray-900' },
    5: { bg: 'bg-[#ff0000]', text: 'text-white' },
  };

  return colorMap[riskLevel] || { bg: 'bg-gray-100', text: 'text-gray-500' };
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

export const normalizeHasilDisplay = (hasilRaw, isPercent) => {
  if (hasilRaw === '' || hasilRaw == null) return '';
  const num = Number(hasilRaw);
  if (!Number.isFinite(num) || Number.isNaN(num)) return '';
  if (isPercent) return `${(num * 100).toFixed(2)}%`;
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(num);
};

// ===================== ROW KEY GENERATORS =====================
export const makeRowKey = (r) => {
  // Format: source|year|quarter|no|subNo|sectionLabel|indikator
  const source = r.source || '';
  const year = r.year || '';
  const quarter = r.quarter || '';
  const no = r.no ?? '';
  const subNo = r.subNo ?? '';
  const sectionLabel = (r.sectionLabel || '').replace(/\|/g, '-');
  const indikator = (r.indikator || '').replace(/\|/g, '-');

  return `${source}|${year}|${quarter}|${no}|${subNo}|${sectionLabel}|${indikator}`;
};

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
    pembilangLabel: r.pembilangLabel ?? '',
    pembilangValue: r.pembilangValue ?? null,
    denominatorLabel: getLabel(r.denominatorLabel ?? r.penyebutLabel ?? ''),
    denominatorValue: r.denominatorValue ?? r.penyebutValue ?? r.penyebut ?? '',
    penyebutLabel: r.penyebutLabel ?? '',
    penyebutValue: r.penyebutValue ?? null,
    isPercent: !!r.isPercent,
    mode: r.mode ?? 'RASIO',
    formula: r.formula ?? '',
    hasil: r.hasil ?? r.result ?? '',
    hasilText: r.hasilText ?? '',
    low: r.low ?? '',
    lowToModerate: r.lowToModerate ?? '',
    moderate: r.moderate ?? '',
    moderateToHigh: r.moderateToHigh ?? '',
    high: r.high ?? '',
    peringkat: r.peringkat ?? 0,
    weighted: r.weighted ?? 0,
    bobotSection: r.bobotSection ?? '',
    bobotIndikator: r.bobotIndikator ?? '',
    sumberRisiko: r.sumberRisiko ?? '',
    dampak: r.dampak ?? '',
    keterangan: r.keterangan ?? '',
    raw: r,
  };
};
