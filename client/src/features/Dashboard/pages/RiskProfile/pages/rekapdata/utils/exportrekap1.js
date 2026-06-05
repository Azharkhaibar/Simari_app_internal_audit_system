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
  font: { bold: true, color: { rgb: hexToARGB(fg) }, size: 9 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: borderThin,
});

const bodyStyle = {
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: borderThin,
  font: { size: 9 },
};

const labelColumnStyle = (bg, fg = '#FFFFFF') => ({
  fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(bg) } },
  font: { bold: true, color: { rgb: hexToARGB(fg) }, size: 9 },
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  border: borderThin,
});

const setStyle = (ws, r, c, style) => {
  const addr = XLSX.utils.encode_cell({ r, c });
  if (!ws[addr]) ws[addr] = { t: 's', v: '' };
  ws[addr].s = { ...(ws[addr].s || {}), ...style };
};

const setCellValue = (ws, r, c, value) => {
  const addr = XLSX.utils.encode_cell({ r, c });
  ws[addr] = { t: typeof value === 'number' ? 'n' : 's', v: value };
};

const fillRangeBackground = (ws, startR, startC, endR, endC, bgColor) => {
  const bgStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(bgColor) } },
  };
  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      ws[addr].s = { ...(ws[addr].s || {}), ...bgStyle };
    }
  }
};

const COLORS = {
  headerTop: '#4472C4', // PENGUKURAN
  headerSection: '#1f4e79', // A, B, C headers (dark blue)
  headerRiskName: '#C591FF', // Risk name (purple) - light purple for Investasi, Pasar, etc.
  headerJenisRisiko: '#800080', // JENIS RISIKO header - dark purple
  headerOrange: '#D9A26A', // BVt, BHz, 10% (tan/orange)
  labelRow: '#1f4e79', // Row labels (dark blue)
  headerKomposit: '#70AD47', // Peringkat Komposit (green)
  finalOrange: '#FF6600', // PERINGKAT PROFIL RISIKO
  lightCyan: '#B4E4FF', // Light cyan for BVt/100% cells
  dataBackground: '#D9A26A', // Orange background same as BVt BHz headers
};

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
  if (skor < 2.5) return 'Low to moderate';
  if (skor < 3.5) return 'Moderate';
  if (skor < 4.5) return 'Moderate to High';
  return 'High';
};

const getKualitasLabel = (skor) => {
  if (skor < 1.5) return 'Strong';
  if (skor < 2.5) return 'Satisfactory';
  if (skor < 3.5) return 'Fair';
  if (skor < 4.5) return 'Marginal';
  return 'Unsatisfactory';
};

const getPeringkatLabel = (skor) => {
  if (skor < 1.5) return 'Peringkat 1';
  if (skor < 2.5) return 'Peringkat 2';
  if (skor < 3.5) return 'Peringkat 3';
  if (skor < 4.5) return 'Peringkat 4';
  return 'Peringkat 5';
};

const fmt = (n) => (Number.isFinite(n) ? Number(n).toFixed(2) : '0.00');

/**
 * Export Rekap 1 ke Excel - Format VERTICAL seperti client
 */
export function exportRekap1ToExcel(riskRows, riskRowsKPMR, peringkatKompositA, peringkatKompositB, totalPeringkatTingkatRisiko, viewYear, viewQuarter) {
  const sheetName = `${viewYear}-${viewQuarter}`;
  const filePrefix = 'REKAP-1';

  const ws = {};
  ws['!merges'] = [];

  let currentRow = 0;
  const startCol = 1; // Mulai dari kolom B (index 1)

  // ============================================================
  // ROW 0: PENGUKURAN HEADER (spanning all columns)
  // ============================================================
  const numRisks = riskRows.length;
  const endCol = startCol + numRisks * 3 + 2; // risks + komposit columns

  setCellValue(ws, currentRow, startCol, 'PENGUKURAN');
  ws['!merges'].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: endCol } });
  setStyle(ws, currentRow, startCol, headerStyle(COLORS.headerTop));
  currentRow++;

  // ============================================================
  // SECTION A: RISIKO INHEREN
  // ============================================================

  const riskStartCol = startCol + 1; // Risks start RIGHT AFTER "Peringkat Risiko Inheren"
  const riskEndCol = riskStartCol + numRisks * 3 - 1;
  const kompositCol = riskEndCol + 1;

  // Row 1: "A. Risiko Inheren" only (orange background row)
  setCellValue(ws, currentRow, startCol, 'A. Risiko Inheren');
  setStyle(ws, currentRow, startCol, labelColumnStyle(COLORS.headerOrange, '#000000'));

  // Fill orange background for entire row
  for (let c = riskStartCol; c <= kompositCol + 1; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, headerStyle(COLORS.headerOrange, '#000000'));
  }
  currentRow++;

  // Row 2: "JENIS RISIKO" header spanning risks (dark purple)
  setCellValue(ws, currentRow, riskStartCol, 'JENIS RISIKO');
  ws['!merges'].push({ s: { r: currentRow, c: riskStartCol }, e: { r: currentRow, c: riskEndCol } });
  setStyle(ws, currentRow, riskStartCol, headerStyle(COLORS.headerJenisRisiko));

  // Fill other cells in JENIS RISIKO merge
  for (let c = riskStartCol + 1; c <= riskEndCol; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, headerStyle(COLORS.headerJenisRisiko));
  }

  // Kolom B (startCol) kosong di row 2 - akan di-merge dengan row 3
  setCellValue(ws, currentRow, startCol, '');
  setStyle(ws, currentRow, startCol, headerStyle('#003366', '#FFFFFF'));
  const row2ColB = currentRow; // Simpan row 2 untuk merge nanti

  // Komposit header - akan di-merge dengan row 3
  setCellValue(ws, currentRow, kompositCol, 'Peringkat Komposit');
  const row2Komposit = currentRow; // Simpan row 2 untuk merge nanti
  setStyle(ws, currentRow, kompositCol, headerStyle(COLORS.headerKomposit));
  setStyle(ws, currentRow, kompositCol + 1, headerStyle(COLORS.headerKomposit));
  currentRow++;

  // Row 3: Risk names (Investasi, Pasar, Likuiditas, etc.)
  let col = riskStartCol;
  riskRows.forEach((risk) => {
    setCellValue(ws, currentRow, col, risk.label);
    ws['!merges'].push({ s: { r: currentRow, c: col }, e: { r: currentRow, c: col + 2 } });
    setStyle(ws, currentRow, col, headerStyle(COLORS.headerRiskName));
    setStyle(ws, currentRow, col + 1, headerStyle(COLORS.headerRiskName));
    setStyle(ws, currentRow, col + 2, headerStyle(COLORS.headerRiskName));
    col += 3;
  });

  // Kolom B (startCol) kosong di row 3 - merge dengan row 2
  setCellValue(ws, currentRow, startCol, '');
  setStyle(ws, currentRow, startCol, headerStyle('#003366', '#FFFFFF'));
  ws['!merges'].push({ s: { r: row2ColB, c: startCol }, e: { r: currentRow, c: startCol } });

  // Merge Peringkat Komposit row 2-3 (AA-AB)
  ws['!merges'].push({ s: { r: row2Komposit, c: kompositCol }, e: { r: currentRow, c: kompositCol + 1 } });
  // Style row 3 komposit (sudah termasuk dalam merge)
  setStyle(ws, currentRow, kompositCol, headerStyle(COLORS.headerKomposit));
  setStyle(ws, currentRow, kompositCol + 1, headerStyle(COLORS.headerKomposit));
  currentRow++;

  // Row 4-6: "Peringkat Risiko Inheren" (merge 3 rows) + BVt BHz 10%
  setCellValue(ws, currentRow, startCol, 'Peringkat Risiko Inheren');
  ws['!merges'].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow + 2, c: startCol } });
  setStyle(ws, currentRow, startCol, labelColumnStyle('#2B2B8E', '#FFFFFF'));

  // Simpan row 4 untuk merge kolom komposit nanti
  const row4Start = currentRow;

  // BVt BHz 10% di row 4 (awal merge)
  col = riskStartCol;
  riskRows.forEach(() => {
    setCellValue(ws, currentRow, col, 'BVt');
    setCellValue(ws, currentRow, col + 1, 'BHz');
    setCellValue(ws, currentRow, col + 2, '10%');
    setStyle(ws, currentRow, col, headerStyle(COLORS.headerOrange, '#000000'));
    setStyle(ws, currentRow, col + 1, headerStyle(COLORS.headerOrange, '#000000'));
    setStyle(ws, currentRow, col + 2, headerStyle(COLORS.headerOrange, '#000000'));
    col += 3;
  });
  currentRow++;

  // Row 5: Data row (100%, skor, values) - di tengah merge label
  col = riskStartCol;
  riskRows.forEach((risk) => {
    const colorScheme = getColorBySkor(risk.skor);

    setCellValue(ws, currentRow, col, '100%');
    setCellValue(ws, currentRow, col + 1, 'skor');
    setCellValue(ws, currentRow, col + 2, fmt(risk.skor));

    // "100%" with light cyan background
    setStyle(ws, currentRow, col, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.lightCyan) } },
      font: { bold: false, color: { rgb: 'FF000000' }, size: 9 },
    });
    setStyle(ws, currentRow, col + 1, bodyStyle);
    setStyle(ws, currentRow, col + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(colorScheme.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(colorScheme.text) }, size: 10 },
    });
    col += 3;
  });
  currentRow++;

  // Row 6: "skor" row with numeric scores - di akhir merge label
  col = riskStartCol;
  riskRows.forEach((risk) => {
    const colorScheme = getColorBySkor(risk.skor);

    // Merge first two columns for "skor" label with DARK BLUE background
    setCellValue(ws, currentRow, col, 'skor');
    setCellValue(ws, currentRow, col + 1, '');
    ws['!merges'].push({ s: { r: currentRow, c: col }, e: { r: currentRow, c: col + 1 } });
    setStyle(ws, currentRow, col, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } }, // Dark blue
      font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 }, // White text
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    });
    setStyle(ws, currentRow, col + 1, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } }, // Dark blue
    });

    // Third column shows numeric score with color
    setCellValue(ws, currentRow, col + 2, fmt(risk.skor));
    setStyle(ws, currentRow, col + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(colorScheme.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(colorScheme.text) }, size: 10 },
    });
    col += 3;
  });

  // Komposit A - "skor" di AA merge 4-6, nilai di AB merge 4-6
  const kompositAColor = getColorBySkor(peringkatKompositA);
  const kompositALabel = getKualitasInherenLabel(peringkatKompositA);

  // Tulis "skor" di row 4 dan nilai di row 4, lalu merge 4-6
  setCellValue(ws, row4Start, kompositCol, 'skor');
  setCellValue(ws, row4Start, kompositCol + 1, fmt(peringkatKompositA));

  // Merge kolom AA (skor) dari row 4-6
  ws['!merges'].push({ s: { r: row4Start, c: kompositCol }, e: { r: row4Start + 2, c: kompositCol } });
  setStyle(ws, row4Start, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } }, // Dark blue
    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 }, // White text
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  });

  // Merge kolom AB (nilai) dari row 4-6
  ws['!merges'].push({ s: { r: row4Start, c: kompositCol + 1 }, e: { r: row4Start + 2, c: kompositCol + 1 } });
  setStyle(ws, row4Start, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositAColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(kompositAColor.text) }, size: 10 },
  });

  // Style untuk row 5 dan 6 (sudah termasuk dalam merge)
  setStyle(ws, row4Start + 1, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } },
  });
  setStyle(ws, row4Start + 1, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositAColor.bg) } },
  });
  setStyle(ws, row4Start + 2, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } },
  });
  setStyle(ws, row4Start + 2, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositAColor.bg) } },
  });

  currentRow++;

  // Row baru: Label kualitas komposit A di bawah nilai
  setCellValue(ws, currentRow, kompositCol, '');
  setCellValue(ws, currentRow, kompositCol + 1, kompositALabel);
  setStyle(ws, currentRow, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.dataBackground) } },
    border: borderThin,
  });
  setStyle(ws, currentRow, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositAColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(kompositAColor.text) }, size: 8 },
  });
  currentRow++;

  // ============================================================
  // SECTION B: KPMR
  // ============================================================

  // Row 7: "B. Kualitas Penerapan Manajemen Risiko" merged B-D (3 columns)
  setCellValue(ws, currentRow, startCol, 'B. Kualitas Penerapan Manajemen Risiko');
  ws['!merges'].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: startCol + 2 } });
  setStyle(ws, currentRow, startCol, labelColumnStyle(COLORS.headerOrange, '#000000'));
  setStyle(ws, currentRow, startCol + 1, labelColumnStyle(COLORS.headerOrange, '#000000'));
  setStyle(ws, currentRow, startCol + 2, labelColumnStyle(COLORS.headerOrange, '#000000'));

  // Fill orange background for remaining columns (starting from column E)
  for (let c = startCol + 3; c <= kompositCol + 1; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, headerStyle(COLORS.headerOrange, '#000000'));
  }
  currentRow++;

  // Row 8: "JENIS RISIKO" header reused (same risks) - dark purple
  setCellValue(ws, currentRow, riskStartCol, 'JENIS RISIKO');
  ws['!merges'].push({ s: { r: currentRow, c: riskStartCol }, e: { r: currentRow, c: riskEndCol } });
  setStyle(ws, currentRow, riskStartCol, headerStyle(COLORS.headerJenisRisiko));
  for (let c = riskStartCol + 1; c <= riskEndCol; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, headerStyle(COLORS.headerJenisRisiko));
  }

  // Kolom B (startCol) kosong di row 8 - akan di-merge dengan row 9
  setCellValue(ws, currentRow, startCol, '');
  setStyle(ws, currentRow, startCol, headerStyle('#003366', '#FFFFFF'));
  const row8ColB = currentRow; // Simpan row 8 untuk merge nanti

  // Komposit header - akan di-merge dengan row 9
  setCellValue(ws, currentRow, kompositCol, 'Peringkat Komposit');
  const row8Komposit = currentRow; // Simpan row 8 untuk merge nanti
  setStyle(ws, currentRow, kompositCol, headerStyle(COLORS.headerKomposit));
  setStyle(ws, currentRow, kompositCol + 1, headerStyle(COLORS.headerKomposit));
  currentRow++;

  // Row 9: Risk names (Investasi, Pasar, Likuiditas, etc.)
  col = riskStartCol;
  riskRowsKPMR.forEach((risk) => {
    setCellValue(ws, currentRow, col, risk.label);
    ws['!merges'].push({ s: { r: currentRow, c: col }, e: { r: currentRow, c: col + 2 } });
    setStyle(ws, currentRow, col, headerStyle(COLORS.headerRiskName));
    setStyle(ws, currentRow, col + 1, headerStyle(COLORS.headerRiskName));
    setStyle(ws, currentRow, col + 2, headerStyle(COLORS.headerRiskName));
    col += 3;
  });

  // Kolom B (startCol) kosong di row 9 - merge dengan row 8
  setCellValue(ws, currentRow, startCol, '');
  setStyle(ws, currentRow, startCol, headerStyle('#003366', '#FFFFFF'));
  ws['!merges'].push({ s: { r: row8ColB, c: startCol }, e: { r: currentRow, c: startCol } });

  // Merge Peringkat Komposit row 8-9 (AA-AB)
  ws['!merges'].push({ s: { r: row8Komposit, c: kompositCol }, e: { r: currentRow, c: kompositCol + 1 } });
  // Style row 9 komposit (sudah termasuk dalam merge)
  setStyle(ws, currentRow, kompositCol, headerStyle(COLORS.headerKomposit));
  setStyle(ws, currentRow, kompositCol + 1, headerStyle(COLORS.headerKomposit));
  currentRow++;

  // Simpan row 10 untuk merge kolom komposit nanti
  const row10Start = currentRow;

  // Row 10-12: "Peringkat Kualitas Penerapan Manajemen Risiko" (merge 3 rows) + BHz 10%
  setCellValue(ws, currentRow, startCol, 'Peringkat Kualitas Penerapan Manajemen Risiko');
  ws['!merges'].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow + 2, c: startCol } });
  setStyle(ws, currentRow, startCol, labelColumnStyle(COLORS.labelRow, '#FFFFFF'));

  // BHz 10% di row 10 (awal merge)
  col = riskStartCol;
  riskRowsKPMR.forEach(() => {
    setCellValue(ws, currentRow, col, '');
    setCellValue(ws, currentRow, col + 1, 'BHz');
    setCellValue(ws, currentRow, col + 2, '10%');
    setStyle(ws, currentRow, col, headerStyle(COLORS.headerOrange, '#000000'));
    setStyle(ws, currentRow, col + 1, headerStyle(COLORS.headerOrange, '#000000'));
    setStyle(ws, currentRow, col + 2, headerStyle(COLORS.headerOrange, '#000000'));
    col += 3;
  });
  currentRow++;

  // Row 11: BHz data - di tengah merge label
  col = riskStartCol;
  riskRowsKPMR.forEach((risk) => {
    const colorScheme = getColorBySkor(risk.skor);

    setCellValue(ws, currentRow, col, '');
    setCellValue(ws, currentRow, col + 1, 'skor');
    setCellValue(ws, currentRow, col + 2, fmt(risk.skor));

    setStyle(ws, currentRow, col, bodyStyle);
    setStyle(ws, currentRow, col + 1, bodyStyle);
    setStyle(ws, currentRow, col + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(colorScheme.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(colorScheme.text) }, size: 10 },
    });
    col += 3;
  });
  currentRow++;

  // Row 12: Quality labels (show quality text, not "skor") - di akhir merge label
  col = riskStartCol;
  riskRowsKPMR.forEach((risk) => {
    const colorScheme = getColorBySkor(risk.skor);
    const label = getKualitasLabel(risk.skor);

    // Merge first two columns with DARK BLUE background
    setCellValue(ws, currentRow, col, 'skor');
    setCellValue(ws, currentRow, col + 1, '');
    ws['!merges'].push({ s: { r: currentRow, c: col }, e: { r: currentRow, c: col + 1 } });
    setStyle(ws, currentRow, col, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } }, // Dark blue
      font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 }, // White text
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    });
    setStyle(ws, currentRow, col + 1, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } }, // Dark blue
    });

    // Third column shows quality label
    setCellValue(ws, currentRow, col + 2, label);
    setStyle(ws, currentRow, col + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(colorScheme.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(colorScheme.text) }, size: 8 },
    });
    col += 3;
  });

  // Komposit B - "skor" di AA merge 10-12, nilai di AB merge 10-12
  const kompositBColor = getColorBySkor(peringkatKompositB);
  const kompositBLabel = getKualitasLabel(peringkatKompositB);

  // Tulis "skor" di row 10 dan nilai di row 10, lalu merge 10-12
  setCellValue(ws, row10Start, kompositCol, 'skor');
  setCellValue(ws, row10Start, kompositCol + 1, fmt(peringkatKompositB));

  // Merge kolom AA (skor) dari row 10-12
  ws['!merges'].push({ s: { r: row10Start, c: kompositCol }, e: { r: row10Start + 2, c: kompositCol } });
  setStyle(ws, row10Start, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } }, // Dark blue
    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 }, // White text
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  });

  // Merge kolom AB (nilai) dari row 10-12
  ws['!merges'].push({ s: { r: row10Start, c: kompositCol + 1 }, e: { r: row10Start + 2, c: kompositCol + 1 } });
  setStyle(ws, row10Start, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositBColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(kompositBColor.text) }, size: 10 },
  });

  // Style untuk row 11 dan 12 (sudah termasuk dalam merge)
  setStyle(ws, row10Start + 1, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } },
  });
  setStyle(ws, row10Start + 1, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositBColor.bg) } },
  });
  setStyle(ws, row10Start + 2, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } },
  });
  setStyle(ws, row10Start + 2, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositBColor.bg) } },
  });

  currentRow++;

  // Row baru: Label kualitas komposit B di bawah nilai
  setCellValue(ws, currentRow, kompositCol, '');
  setCellValue(ws, currentRow, kompositCol + 1, kompositBLabel);
  setStyle(ws, currentRow, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.dataBackground) } },
    border: borderThin,
  });
  setStyle(ws, currentRow, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kompositBColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(kompositBColor.text) }, size: 8 },
  });
  currentRow++;

  // Row pemisah kosong antara Section B dan Section C
  currentRow++;

  // ============================================================
  // SECTION C: PERINGKAT TINGKAT RISIKO
  // ============================================================

  // Row 13: Label at startCol (single row, not merged) + sub-headers
  setCellValue(ws, currentRow, startCol, 'Peringkat Tingkat Risiko');
  setStyle(ws, currentRow, startCol, labelColumnStyle(COLORS.labelRow, '#FFFFFF'));

  // Sub-headers
  col = riskStartCol;
  riskRows.forEach(() => {
    setCellValue(ws, currentRow, col, '');
    setCellValue(ws, currentRow, col + 1, 'BHz');
    setCellValue(ws, currentRow, col + 2, '10%');
    setStyle(ws, currentRow, col, headerStyle(COLORS.headerOrange, '#000000'));
    setStyle(ws, currentRow, col + 1, headerStyle(COLORS.headerOrange, '#000000'));
    setStyle(ws, currentRow, col + 2, headerStyle(COLORS.headerOrange, '#000000'));
    col += 3;
  });

  setCellValue(ws, currentRow, kompositCol, '');
  setCellValue(ws, currentRow, kompositCol + 1, '');
  setStyle(ws, currentRow, kompositCol, headerStyle(COLORS.headerKomposit));
  setStyle(ws, currentRow, kompositCol + 1, headerStyle(COLORS.headerKomposit));
  currentRow++;

  // Row 14: BHz + Peringkat values - NO LABEL COLUMN
  col = riskStartCol;
  riskRows.forEach((risk) => {
    const kpmrData = riskRowsKPMR.find((r) => r.label === risk.label);
    const kpmrValue = kpmrData ? kpmrData.skor : 0;
    const peringkatValue = (risk.skor + kpmrValue) / 2;
    const colorScheme = getColorBySkor(peringkatValue);

    setCellValue(ws, currentRow, col, '');
    setCellValue(ws, currentRow, col + 1, 'Peringkat');
    setCellValue(ws, currentRow, col + 2, fmt(peringkatValue));

    setStyle(ws, currentRow, col, bodyStyle);
    setStyle(ws, currentRow, col + 1, bodyStyle);
    setStyle(ws, currentRow, col + 2, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(colorScheme.bg) } },
      font: { bold: true, color: { rgb: hexToARGB(colorScheme.text) }, size: 10 },
    });
    col += 3;
  });

  // Simpan row untuk nilai Peringkat Tingkat Risiko
  const rowPeringkatTingkat = currentRow;

  // Kolom AA-AB: Nilai Peringkat Tingkat Risiko di row ini dan merge dengan row berikutnya
  const peringkatTingkatColor = getColorBySkor(totalPeringkatTingkatRisiko);
  setCellValue(ws, currentRow, kompositCol, fmt(totalPeringkatTingkatRisiko));
  setCellValue(ws, currentRow, kompositCol + 1, '');
  setStyle(ws, currentRow, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(peringkatTingkatColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(peringkatTingkatColor.text) }, size: 16 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  });
  setStyle(ws, currentRow, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(peringkatTingkatColor.bg) } },
  });
  currentRow++;

  // Row kosong di bawah nilai Peringkat Tingkat Risiko untuk merge
  setCellValue(ws, currentRow, kompositCol, '');
  setCellValue(ws, currentRow, kompositCol + 1, '');
  setStyle(ws, currentRow, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(peringkatTingkatColor.bg) } },
  });
  setStyle(ws, currentRow, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(peringkatTingkatColor.bg) } },
  });

  // Merge AA-AB rows 15-16 (2x2 block merge untuk nilai yang lebih besar)
  ws['!merges'].push({ s: { r: rowPeringkatTingkat, c: kompositCol }, e: { r: rowPeringkatTingkat + 1, c: kompositCol + 1 } });

  currentRow++;

  // ============================================================
  // FINAL ROW: PERINGKAT PROFIL RISIKO (1 baris saja)
  // ============================================================
  const finalColor = getColorBySkor(totalPeringkatTingkatRisiko);
  const finalLabel = getPeringkatLabel(totalPeringkatTingkatRisiko);

  // Label kiri (tidak di-merge, hanya 1 baris)
  setCellValue(ws, currentRow, startCol, 'PERINGKAT PROFIL RISIKO');
  setStyle(ws, currentRow, startCol, labelColumnStyle(COLORS.finalOrange));

  // Isi kolom kosong antara label dan nilai dengan background oranye
  for (let c = startCol + 1; c < kompositCol; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, {
      ...bodyStyle,
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.finalOrange) } },
      border: borderThin,
    });
  }

  // Nilai + Label peringkat di kolom AA-AB (merge horizontal)
  setCellValue(ws, currentRow, kompositCol, finalLabel);
  ws['!merges'].push({ s: { r: currentRow, c: kompositCol }, e: { r: currentRow, c: kompositCol + 1 } });
  setStyle(ws, currentRow, kompositCol, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(finalColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(finalColor.text) }, size: 10 },
  });
  setStyle(ws, currentRow, kompositCol + 1, {
    ...bodyStyle,
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(finalColor.bg) } },
  });

  // Merge kolom B untuk label "Peringkat Tingkat Risiko" (row label dan row data)
  const labelRow = rowPeringkatTingkat - 1; // Row label "Peringkat Tingkat Risiko"
  ws['!merges'].push({ s: { r: labelRow, c: startCol }, e: { r: rowPeringkatTingkat, c: startCol } });
  // Pastikan cell ada dengan background
  for (let r = labelRow; r <= rowPeringkatTingkat; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: startCol });
    if (!ws[addr]) {
      ws[addr] = { t: 's', v: '' };
    }
    if (!ws[addr].s || !ws[addr].s.fill) {
      ws[addr].s = {
        ...(ws[addr].s || {}),
        fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.labelRow) } },
        border: borderThin,
      };
    }
  }

  // ============================================================
  // APPLY BACKGROUND TO ALL DATA CELLS
  // ============================================================
  // Fill light cream background to entire data area (row 0 to row 17)
  for (let r = 0; r <= Math.max(currentRow, 17); r++) {
    for (let c = 0; c <= kompositCol + 1; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) {
        ws[addr] = { t: 's', v: '' };
      }
      // Apply light cream background if cell doesn't have specific fill
      if (!ws[addr].s || !ws[addr].s.fill) {
        ws[addr].s = {
          ...(ws[addr].s || {}),
          fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.dataBackground) } },
          border: borderThin,
        };
      }
    }
  }

  // ============================================================
  // COLUMN WIDTHS
  // ============================================================
  ws['!cols'] = [
    { wch: 3 }, // Col 0 (A) - empty column (narrow)
    { wch: 28 }, // Col 1 (B) - labels column (28 chars wide)
  ];

  riskRows.forEach(() => {
    ws['!cols'].push({ wch: 8 }); // Risk col 1
    ws['!cols'].push({ wch: 8 }); // Risk col 2
    ws['!cols'].push({ wch: 12 }); // Risk col 3 (wider for labels)
  });

  ws['!cols'].push({ wch: 8 }); // Komposit col 1
  ws['!cols'].push({ wch: 18 }); // Komposit col 2 (wider for labels)

  const range = { s: { c: 0, r: 0 }, e: { c: kompositCol + 1, r: currentRow } };
  ws['!ref'] = XLSX.utils.encode_range(range);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filePrefix}-${viewYear}-${viewQuarter}.xlsx`);
}
