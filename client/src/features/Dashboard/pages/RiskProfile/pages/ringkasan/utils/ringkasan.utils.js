// utils/ringkasan.utils.js
import { formatHasil } from '../../rekapdata/utils/riskcalculator';
import * as XLSX from 'xlsx';

// ===================== CONSTANTS =====================
export const RISK_ORDER = ['investasi', 'pasar', 'likuiditas', 'operasional', 'hukum', 'stratejik', 'kepatuhan', 'reputasi'];

export const RISK_CODE = {
  investasi: 'INV',
  pasar: 'PAS',
  likuiditas: 'LIK',
  operasional: 'OPR',
  hukum: 'HKM',
  stratejik: 'STR',
  kepatuhan: 'KPT',
  reputasi: 'REP',
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

export const QUARTER_TO_MONTH = {
  Q1: 'Mar',
  Q2: 'Jun',
  Q3: 'Sep',
  Q4: 'Dec',
};

export const RISK_TYPE_LABELS = {
  investasi: 'Risiko Investasi',
  pasar: 'Risiko Pasar',
  likuiditas: 'Risiko Likuiditas',
  operasional: 'Risiko Operasional',
  hukum: 'Risiko Hukum',
  stratejik: 'Risiko Stratejik',
  kepatuhan: 'Risiko Kepatuhan',
  reputasi: 'Risiko Reputasi',
};

// ❌ HAPUS STORAGE_KEYS - TIDAK DIGUNAKAN LAGI

// ===================== HELPERS =====================
export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export const getRiskStyle = (value) => {
  const riskLevel = Number(value);
  if (isNaN(riskLevel) || riskLevel < 1 || riskLevel > 5) {
    return {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      className: 'bg-gray-100 text-gray-500',
    };
  }

  const colorMap = {
    1: { bg: '#2e7d32', text: 'white', className: 'bg-[#2e7d32] text-white' },
    2: { bg: '#92D050', text: 'white', className: 'bg-[#92D050] text-white' },
    3: { bg: '#FFFF00', text: 'gray-800', className: 'bg-[#ffff00] text-gray-800' },
    4: { bg: '#ffc000', text: 'gray-900', className: 'bg-[#ffc000] text-gray-900' },
    5: { bg: '#ff0000', text: 'white', className: 'bg-[#ff0000] text-white' },
  };

  return {
    backgroundColor: colorMap[riskLevel].bg,
    color: colorMap[riskLevel].text,
    className: colorMap[riskLevel].className,
  };
};

export const buildRiskIndex = ({ riskFormId, sectionNo, indikatorIndex, subNo }) => {
  const code = RISK_CODE[riskFormId] || 'UNK';
  if (riskFormId === 'pasar') {
    return `R.${code}.${sectionNo}.${indikatorIndex}`;
  }
  if (riskFormId === 'hukum' || riskFormId === 'kepatuhan') {
    const index = subNo || indikatorIndex;
    return `R.${code}.${sectionNo}.${index}`;
  }
  return `R.${code}.${sectionNo}.${indikatorIndex}`;
};

export const formatHasilDisplay = (r, riskType) => {
  if (riskType === 'stratejik' && r.mode === 'TEKS') {
    return r.hasilText || '';
  }
  if (riskType === 'hukum') {
    if (r.hasilText) return r.hasilText;
    if (r.hasil !== null && r.hasil !== undefined) {
      return r.isPercent ? `${(Number(r.hasil) * 100).toFixed(2)}%` : formatHasil(r.hasil, false, 4);
    }
    return '';
  }
  if (riskType === 'pasar') {
    if (r.hasil !== null && r.hasil !== undefined) {
      return r.isPercent ? `${(Number(r.hasil) * 100).toFixed(2)}%` : formatHasil(r.hasil, false, 4);
    }
    return '';
  }
  if (riskType === 'kepatuhan') {
    if (r.mode === 'TEKS' && r.hasilText) return r.hasilText;
    if (r.hasil !== null && r.hasil !== undefined && r.hasil !== '') {
      return r.isPercent ? `${(Number(r.hasil) * 100).toFixed(2)}%` : formatHasil(r.hasil, false, 4);
    }
    return '';
  }
  if (r.hasil !== null && r.hasil !== undefined) {
    return r.isPercent ? `${(Number(r.hasil) * 100).toFixed(2)}%` : formatHasil(r.hasil, false, 4);
  }
  return '';
};

export const formatBobotDisplay = (r, riskType) => {
  if ((riskType === 'hukum' || riskType === 'stratejik' || riskType === 'kepatuhan' || riskType === 'reputasi' || riskType === 'pasar') && r.bobotIndikator) {
    return `${r.bobotIndikator}%`;
  }
  if (r.bobotIndikator) {
    return `${r.bobotIndikator}%`;
  }
  return '';
};

// ===================== EXPORT EXCEL =====================
export const exportRingkasanToExcel = (groupedByRiskType, riskTypeRowSpans, year, quarter) => {
  const excelData = [];

  excelData.push(['No', 'Jenis Risiko', 'Bobot Section', 'Group Parameter', 'Indeks', 'Parameter / Risiko Inheren', 'Bobot Indikator', 'Hasil Assessment', 'Risk Level', 'Risk Level Label']);

  RISK_ORDER.forEach((riskType, riskIndex) => {
    const groups = groupedByRiskType[riskType] || [];

    groups.forEach((group) => {
      group.items.forEach((item, itemIndex) => {
        const riskNumber = riskIndex + 1;
        const riskTypeName = RISK_TYPE_LABELS[riskType] || riskType;

        let indikatorIndex = itemIndex + 1;
        if (riskType === 'hukum') {
          indikatorIndex = item.subNo || itemIndex + 1;
        }

        const riskIndexValue = buildRiskIndex({
          riskFormId: riskType,
          sectionNo: group.sectionNo,
          indikatorIndex,
          subNo: indikatorIndex,
        });

        const hasilDisplay = formatHasilDisplay(item, riskType);
        const bobotDisplay = formatBobotDisplay(item, riskType);
        const peringkat = item.peringkat || '';
        const riskLabel = RISK_LABEL[item.peringkat] || '';

        excelData.push([riskNumber, riskTypeName, group.bobotSection ? `${group.bobotSection}%` : '0%', group.sectionLabel || '', riskIndexValue, item.indikator || '', bobotDisplay, hasilDisplay, peringkat, riskLabel]);
      });
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan');

  const fileName = `Ringkasan_Risiko_${year}_${quarter}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
