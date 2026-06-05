import * as XLSX from 'xlsx-js-style';

// === Warna & style helper ===
const hexToARGB = (hex) => {
  const h = hex.replace('#', '').toUpperCase();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((x) => x + x)
          .join('')
      : h;
  return 'FF' + full;
};

const borderThin = {
  top: { style: 'thin', color: { rgb: 'FF000000' } },
  bottom: { style: 'thin', color: { rgb: 'FF000000' } },
  left: { style: 'thin', color: { rgb: 'FF000000' } },
  right: { style: 'thin', color: { rgb: 'FF000000' } },
};

const headerStyle = (bg, fg = '#FFFFFF') => ({
  fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(bg) } },
  font: { bold: true, color: { rgb: hexToARGB(fg) }, size: 11 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: borderThin,
});

const bodyStyle = {
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: borderThin,
  font: { size: 11 },
};

const labelStyle = {
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  border: borderThin,
  font: { bold: true, size: 11 },
};

const setStyle = (ws, r, c, style) => {
  const addr = XLSX.utils.encode_cell({ r, c });
  if (!ws[addr]) ws[addr] = { t: 's', v: '' };
  ws[addr].s = { ...(ws[addr].s || {}), ...style };
};

const setCellValue = (ws, r, c, value) => {
  const addr = XLSX.utils.encode_cell({ r, c });
  ws[addr] = { t: typeof value === 'number' ? 'n' : 's', v: value };
};

// Level dan warna
const skorToLevel = (skor) => {
  if (skor < 1.5) return 1;
  if (skor < 2.5) return 2;
  if (skor < 3.5) return 3;
  if (skor < 4.5) return 4;
  return 5;
};

const LEVEL_BG_COLOR = {
  1: '#2e7d32',
  2: '#92d050',
  3: '#ffff00',
  4: '#ffc000',
  5: '#ff0000',
};

const LEVEL_TEXT_COLOR = {
  1: '#ffffff',
  2: '#000000',
  3: '#000000',
  4: '#000000',
  5: '#ffffff',
};

const getColorBySkor = (skor) => {
  const level = skorToLevel(skor);
  return {
    level,
    bg: LEVEL_BG_COLOR[level],
    text: LEVEL_TEXT_COLOR[level],
  };
};

const getKualitasInherenLabel = (skor) => {
  if (skor < 1.5) return 'Low';
  if (skor < 2.5) return 'Low to Moderate';
  if (skor < 3.5) return 'Moderate';
  if (skor < 4.5) return 'Moderate to High';
  return 'High';
};

const getKualitasKPMRLabel = (skor) => {
  if (skor < 1.5) return 'Strong';
  if (skor < 2.5) return 'Satisfactory';
  if (skor < 3.5) return 'Fair';
  if (skor < 4.5) return 'Marginal';
  return 'Unsatisfactory';
};

const fmt = (n, decimals = 2) => {
  if (!Number.isFinite(n)) return '0.00';
  return Number(n).toFixed(decimals);
};

/**
 * Export Komposit ke Excel dengan 2 tabel terpisah
 * @param {Array} combinedTable - Data tabel komposit
 * @param {Object} totals - Data total
 * @param {number} year - Tahun
 * @param {string} quarter - Quarter (Q1-Q4)
 */
export function exportKompositToExcel(combinedTable, totals, year, quarter) {
  const sheetName = `${year}-${quarter}`;
  const filePrefix = 'KOMPOSIT';

  const ws = {};
  ws['!merges'] = [];

  let currentRow = 0;
  const startCol = 0;

  // COLORS
  const COLORS = {
    headerDate: '#7E2A2A', // Dark red untuk header tanggal
    totalRow: '#002060', // Dark blue untuk Peringkat Komposit
  };

  // Calculate rounded values for display
  const inherenLevel = skorToLevel(totals.nilaiInheren);
  const kpmrLevel = skorToLevel(totals.nilaiKpmr);

  // ============================================================
  // TABEL 1: INHEREN
  // ============================================================

  // Header tanggal (Dec-25 atau sesuai periode)
  const months = { Q1: 'Mar', Q2: 'Jun', Q3: 'Sep', Q4: 'Dec' };
  const monthName = months[quarter] || 'Dec';
  const yearShort = String(year).slice(-2);

  setCellValue(ws, currentRow, startCol, `${monthName}-${yearShort}`);
  ws['!merges'].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: startCol + 4 } });
  setStyle(ws, currentRow, startCol, headerStyle(COLORS.headerDate));
  currentRow++;

  // Data rows untuk INHEREN
  combinedTable.forEach((row) => {
    const inherenColor = getColorBySkor(row.inheren.skor);

    // Risiko label
    setCellValue(ws, currentRow, startCol, row.label);
    setStyle(ws, currentRow, startCol, labelStyle);

    // BHZ
    setCellValue(ws, currentRow, startCol + 1, row.bhz);
    setStyle(ws, currentRow, startCol + 1, bodyStyle);

    // STATUS
    setCellValue(ws, currentRow, startCol + 2, row.inheren.kualitas);
    setStyle(ws, currentRow, startCol + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(inherenColor.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(inherenColor.text) }, size: 10, italic: true },
    });

    // SCORE
    setCellValue(ws, currentRow, startCol + 3, fmt(row.inheren.skor, 1));
    setStyle(ws, currentRow, startCol + 3, bodyStyle);

    // NILAI
    setCellValue(ws, currentRow, startCol + 4, fmt(row.inheren.nilai, 2));
    setStyle(ws, currentRow, startCol + 4, bodyStyle);

    currentRow++;
  });

  // Total row INHEREN
  const inherenColor = getColorBySkor(totals.nilaiInheren);

  setCellValue(ws, currentRow, startCol, 'Peringkat Komposit');
  setStyle(ws, currentRow, startCol, {
    ...labelStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
    font: { bold: true, size: 11, color: { rgb: 'FFFFFFFF' } },
  });

  setCellValue(ws, currentRow, startCol + 1, totals.bhz);
  setStyle(ws, currentRow, startCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
  });

  setCellValue(ws, currentRow, startCol + 2, getKualitasInherenLabel(totals.nilaiInheren));
  setStyle(ws, currentRow, startCol + 2, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(inherenColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(inherenColor.text) }, size: 10, italic: true },
  });

  setCellValue(ws, currentRow, startCol + 3, `${fmt(totals.nilaiInheren, 2)} (${inherenLevel})`);
  setStyle(ws, currentRow, startCol + 3, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
  });

  // Nilai column kosong untuk total
  setCellValue(ws, currentRow, startCol + 4, '');
  setStyle(ws, currentRow, startCol + 4, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
  });

  // Merge kolom D dan E untuk total INHEREN
  ws['!merges'].push({ s: { r: currentRow, c: startCol + 3 }, e: { r: currentRow, c: startCol + 4 } });

  currentRow++;

  // ============================================================
  // SPACING antara tabel
  // ============================================================
  currentRow++; // Empty row

  // ============================================================
  // TABEL 2: KPMR
  // ============================================================

  // Data rows untuk KPMR
  combinedTable.forEach((row) => {
    const kpmrColor = getColorBySkor(row.kpmr.skor);

    // Risiko label
    setCellValue(ws, currentRow, startCol, row.label);
    setStyle(ws, currentRow, startCol, labelStyle);

    // BHZ
    setCellValue(ws, currentRow, startCol + 1, row.bhz);
    setStyle(ws, currentRow, startCol + 1, bodyStyle);

    // STATUS
    setCellValue(ws, currentRow, startCol + 2, row.kpmr.kualitas);
    setStyle(ws, currentRow, startCol + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kpmrColor.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(kpmrColor.text) }, size: 10, italic: true },
    });

    // SCORE
    setCellValue(ws, currentRow, startCol + 3, fmt(row.kpmr.skor, 1));
    setStyle(ws, currentRow, startCol + 3, bodyStyle);

    // NILAI
    setCellValue(ws, currentRow, startCol + 4, fmt(row.kpmr.nilai, 2));
    setStyle(ws, currentRow, startCol + 4, bodyStyle);

    currentRow++;
  });

  // Total row KPMR
  const kpmrColor = getColorBySkor(totals.nilaiKpmr);

  setCellValue(ws, currentRow, startCol, 'Peringkat Komposit');
  setStyle(ws, currentRow, startCol, {
    ...labelStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
    font: { bold: true, size: 11, color: { rgb: 'FFFFFFFF' } },
  });

  setCellValue(ws, currentRow, startCol + 1, totals.bhz);
  setStyle(ws, currentRow, startCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
  });

  setCellValue(ws, currentRow, startCol + 2, getKualitasKPMRLabel(totals.nilaiKpmr));
  setStyle(ws, currentRow, startCol + 2, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kpmrColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(kpmrColor.text) }, size: 10, italic: true },
  });

  setCellValue(ws, currentRow, startCol + 3, `${fmt(totals.nilaiKpmr, 2)} (${kpmrLevel})`);
  setStyle(ws, currentRow, startCol + 3, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
  });

  // Nilai column kosong untuk total
  setCellValue(ws, currentRow, startCol + 4, '');
  setStyle(ws, currentRow, startCol + 4, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.totalRow) } },
  });

  // Merge kolom D dan E untuk total KPMR
  ws['!merges'].push({ s: { r: currentRow, c: startCol + 3 }, e: { r: currentRow, c: startCol + 4 } });

  currentRow++;

  // ============================================================
  // COLUMN WIDTHS
  // ============================================================
  ws['!cols'] = [
    { wch: 18 }, // Col A - Risiko label
    { wch: 10 }, // Col B - BHZ
    { wch: 18 }, // Col C - STATUS
    { wch: 10 }, // Col D - SCORE
    { wch: 12 }, // Col E - NILAI
  ];

  const range = { s: { c: 0, r: 0 }, e: { c: 4, r: currentRow - 1 } };
  ws['!ref'] = XLSX.utils.encode_range(range);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filePrefix}-${year}-${quarter}.xlsx`);
}
