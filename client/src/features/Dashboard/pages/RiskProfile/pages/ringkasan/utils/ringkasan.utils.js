// utils/ringkasan.utils.js
import { formatHasil } from '../../rekapdata/utils/riskcalculator';
import * as XLSX from 'xlsx-js-style';

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

// ===================== EXCEL STYLE HELPERS =====================

/**
 * Warna fill Excel berdasarkan peringkat integer 1–5
 * Konsisten dengan getRiskStyle (colorMap di atas)
 */
const getRiskExcelStyle = (peringkat) => {
  const p = Number(peringkat);
  if (p === 1) return { bg: '2E7D32', fg: 'FFFFFF' }; // Low         – Hijau tua
  if (p === 2) return { bg: '92D050', fg: '000000' }; // Low-Mod     – Hijau muda
  if (p === 3) return { bg: 'FFFF00', fg: '000000' }; // Moderate    – Kuning
  if (p === 4) return { bg: 'FFC000', fg: '000000' }; // Mod-High    – Orange
  if (p === 5) return { bg: 'FF0000', fg: 'FFFFFF' }; // High        – Merah
  return null;
};

const COLORS = {
  HEADER_DARK:  '1E3A8A', // Biru tua (sama persis dengan UI bg-[#1e3a8a])
  HEADER_FG:    'FFFFFF',
  HEADER_ALT:   '1E40AF', // Sedikit lebih terang untuk sub-header
  CATEGORY_BG:  'EFF6FF', // Biru sangat muda untuk kolom kategori
  BORDER:       'D1D5DB',
  ALT_BG:       'F9FAFB',
};

const borderThin = {
  top:    { style: 'thin', color: { rgb: COLORS.BORDER } },
  bottom: { style: 'thin', color: { rgb: COLORS.BORDER } },
  left:   { style: 'thin', color: { rgb: COLORS.BORDER } },
  right:  { style: 'thin', color: { rgb: COLORS.BORDER } },
};

// ===================== EXPORT EXCEL =====================
export const exportRingkasanToExcel = (groupedByRiskType, riskTypeRowSpans, year, quarter) => {
  const wb = XLSX.utils.book_new();

  const periodLabel = `${QUARTER_TO_MONTH[quarter] || quarter}-${String(year).slice(2)}`;

  // ── AOA rows ─────────────────────────────────────────────────────
  const wsData = [
    // row 0 – judul
    ['RINGKASAN RISK ASSESSMENT – HOLDING'],
    // row 1 – periode
    [`Periode: Tahun ${year} - Triwulan ${quarter}`],
    // row 2 – kosong
    [],
    // row 3 – Header baris-1
    ['No', 'Jenis Risiko', 'Bobot', 'Group Parameter', 'Indeks', 'Parameter / Risiko Inheren', 'Hasil Risk Assessment', '', '', ''],
    // row 4 – Header baris-2
    ['', '', '', '', '', '', periodLabel, '', '', ''],
    // row 5 – Header baris-3
    ['', '', '', '', '', '', 'Bobot', 'Hasil Assessment', 'Risk Level', 'Risk Level Label'],
  ];

  const merges = [
    // judul & info
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    // header merges (row 3–5)
    { s: { r: 3, c: 0 }, e: { r: 5, c: 0 } }, // No
    { s: { r: 3, c: 1 }, e: { r: 5, c: 1 } }, // Jenis Risiko
    { s: { r: 3, c: 2 }, e: { r: 5, c: 2 } }, // Bobot
    { s: { r: 3, c: 3 }, e: { r: 5, c: 3 } }, // Group Parameter
    { s: { r: 3, c: 4 }, e: { r: 5, c: 4 } }, // Indeks
    { s: { r: 3, c: 5 }, e: { r: 5, c: 5 } }, // Parameter/Risiko Inheren
    { s: { r: 3, c: 6 }, e: { r: 3, c: 9 } }, // "Hasil Risk Assessment" colspan-4
    { s: { r: 4, c: 6 }, e: { r: 4, c: 9 } }, // periodLabel colspan-4
  ];

  const DATA_START_ROW = wsData.length; // = 6
  let currentRowIndex  = DATA_START_ROW;

  /**
   * Map: rowIndex (Excel) → peringkat (1–5 | null)
   * Digunakan saat styling agar warna tepat berdasarkan integer peringkat
   */
  const peringkatMap = {};

  // ── Build baris data ──────────────────────────────────────────────
  RISK_ORDER.forEach((riskType, riskIndex) => {
    const groups = groupedByRiskType[riskType] || [];

    // Konsisten dengan UI: skip pasar jika tidak ada data
    if (riskType === 'pasar' && groups.length === 0) return;

    // Hitung total baris untuk seluruh riskType ini → merge No & Jenis Risiko
    const totalItemsForRiskType = groups.reduce((sum, g) => sum + (g.items?.length || 0), 0);
    if (totalItemsForRiskType === 0) return;

    const riskNumber   = riskIndex + 1;
    const riskTypeName = RISK_TYPE_LABELS[riskType] || `Risiko ${capitalize(riskType)}`;
    const riskStartRow = currentRowIndex;

    // Merge No (col 0) & Jenis Risiko (col 1) untuk seluruh baris risk type ini
    merges.push(
      { s: { r: riskStartRow, c: 0 }, e: { r: riskStartRow + totalItemsForRiskType - 1, c: 0 } },
      { s: { r: riskStartRow, c: 1 }, e: { r: riskStartRow + totalItemsForRiskType - 1, c: 1 } },
    );

    groups.forEach((group) => {
      const groupItemCount = group.items?.length || 0;
      if (groupItemCount === 0) return;

      const groupStartRow = currentRowIndex;

      // Merge Bobot (col 2) & Group Parameter (col 3) untuk seluruh item dalam group
      if (groupItemCount > 1) {
        merges.push(
          { s: { r: groupStartRow, c: 2 }, e: { r: groupStartRow + groupItemCount - 1, c: 2 } },
          { s: { r: groupStartRow, c: 3 }, e: { r: groupStartRow + groupItemCount - 1, c: 3 } },
        );
      }

      group.items.forEach((item, itemIndex) => {
        let indikatorIndex = itemIndex + 1;
        if (riskType === 'hukum') {
          indikatorIndex = item.subNo || itemIndex + 1;
        }

        const riskIndexValue = buildRiskIndex({
          riskFormId:    riskType,
          sectionNo:     group.sectionNo,
          indikatorIndex,
          subNo:         indikatorIndex,
        });

        const hasilDisplay = formatHasilDisplay(item, riskType);
        const bobotDisplay = formatBobotDisplay(item, riskType);
        const peringkat    = item.peringkat;
        const riskLabel    = RISK_LABEL[peringkat] || '';

        // Simpan peringkat untuk styling
        peringkatMap[currentRowIndex] = (peringkat >= 1 && peringkat <= 5) ? peringkat : null;

        wsData.push([
          riskNumber,
          riskTypeName,
          group.bobotSection ? `${group.bobotSection}%` : '0%',
          group.sectionLabel || '',
          riskIndexValue,
          item.indikator || '',
          bobotDisplay,
          hasilDisplay,
          peringkat >= 1 && peringkat <= 5 ? peringkat : '',
          riskLabel,
        ]);

        currentRowIndex++;
      });
    });
  });

  // ── Buat worksheet ────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!merges'] = merges;

  // ── Styling ───────────────────────────────────────────────────────
  const totalRows = wsData.length;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < 10; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });

      // ── Baris Judul (row 0) ────────────────────────────────────
      if (r === 0) {
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font:      { bold: true, size: 16, color: { rgb: COLORS.HEADER_DARK } },
            alignment: { horizontal: 'left', vertical: 'center' },
          };
        }
        continue;
      }

      // ── Baris Periode (row 1) ──────────────────────────────────
      if (r === 1) {
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font:      { italic: true, size: 11, color: { rgb: '4B5563' } },
            alignment: { horizontal: 'left', vertical: 'center' },
          };
        }
        continue;
      }

      // ── Baris Kosong (row 2) ───────────────────────────────────
      if (r === 2) continue;

      // Pastikan cell ada
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      const cell = ws[cellRef];

      // ── Header baris-1 (row 3) ─────────────────────────────────
      if (r === 3) {
        cell.s = {
          fill:      { patternType: 'solid', fgColor: { rgb: COLORS.HEADER_DARK } },
          font:      { color: { rgb: COLORS.HEADER_FG }, bold: true, size: 10 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border:    borderThin,
        };
        ws[cellRef] = cell;
        continue;
      }

      // ── Header baris-2 & 3 (row 4–5) ──────────────────────────
      if (r === 4 || r === 5) {
        const bg = c >= 6 ? COLORS.HEADER_ALT : COLORS.HEADER_DARK;
        cell.s = {
          fill:      { patternType: 'solid', fgColor: { rgb: bg } },
          font:      { color: { rgb: COLORS.HEADER_FG }, bold: true, size: 10 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border:    borderThin,
        };
        ws[cellRef] = cell;
        continue;
      }

      // ── Baris Data ─────────────────────────────────────────────
      const isAltRow  = (r - DATA_START_ROW) % 2 === 1;
      const defaultBg = isAltRow ? COLORS.ALT_BG : 'FFFFFF';

      cell.s = {
        fill:      { patternType: 'solid', fgColor: { rgb: defaultBg } },
        alignment: { vertical: 'center', wrapText: true },
        border:    borderThin,
        font:      { size: 10 },
      };

      // Center alignment untuk kolom: No(0), Bobot(2), Indeks(4), Bobot Indikator(6), Hasil Assessment(7)
      if ([0, 2, 4, 6, 7].includes(c)) {
        cell.s.alignment.horizontal = 'center';
      }

      // Background biru muda untuk kolom kategori (No, Jenis Risiko, Bobot, Group Parameter, Indeks)
      if (c <= 4) {
        cell.s.fill = { patternType: 'solid', fgColor: { rgb: COLORS.CATEGORY_BG } };
      }

      // ── Risk Level (col 8) & Risk Label (col 9): warna berdasarkan peringkat ──
      if (c === 8 || c === 9) {
        const peringkat  = peringkatMap[r] ?? null;
        const riskStyle  = peringkat !== null ? getRiskExcelStyle(peringkat) : null;

        if (riskStyle) {
          cell.s = {
            fill:      { patternType: 'solid', fgColor: { rgb: riskStyle.bg } },
            font:      { color: { rgb: riskStyle.fg }, bold: true, size: 10 },
            alignment: { horizontal: 'center', vertical: 'center' },
            border:    borderThin,
          };
        } else {
          cell.s.alignment.horizontal = 'center';
        }
      }

      ws[cellRef] = cell;
    }
  }

  // ── Lebar kolom ───────────────────────────────────────────────────
  ws['!cols'] = [
    { wch: 6  }, // No
    { wch: 22 }, // Jenis Risiko
    { wch: 10 }, // Bobot Section
    { wch: 32 }, // Group Parameter
    { wch: 16 }, // Indeks
    { wch: 42 }, // Parameter / Risiko Inheren
    { wch: 10 }, // Bobot Indikator
    { wch: 20 }, // Hasil Assessment
    { wch: 13 }, // Risk Level (angka)
    { wch: 20 }, // Risk Level Label
  ];

  // ── Tinggi baris header ───────────────────────────────────────────
  ws['!rows'] = [];
  ws['!rows'][0] = { hpx: 28 };
  ws['!rows'][3] = { hpx: 30 };
  ws['!rows'][4] = { hpx: 22 };
  ws['!rows'][5] = { hpx: 22 };

  XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan');
  XLSX.writeFile(wb, `Ringkasan_Risiko_${year}_${quarter}.xlsx`);
};
