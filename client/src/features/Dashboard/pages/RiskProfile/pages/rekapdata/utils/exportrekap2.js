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

const labelColumnStyle = (bg, fg = '#FFFFFF') => ({
  fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(bg) } },
  font: { bold: true, color: { rgb: hexToARGB(fg) }, size: 11 },
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

// Risk level colors
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

const getRiskColors = (level) => {
  return {
    bg: LEVEL_BG_COLOR[level] || '#cccccc',
    text: LEVEL_TEXT_COLOR[level] || '#000000',
  };
};

const riskLabel = (level) => {
  if (level === 1) return 'Low';
  if (level === 2) return 'Low to Moderate';
  if (level === 3) return 'Moderate';
  if (level === 4) return 'Moderate to High';
  return 'High';
};

const kpmrLabel = (level) => {
  if (level === 1) return 'Strong';
  if (level === 2) return 'Satisfactory';
  if (level === 3) return 'Fair';
  if (level === 4) return 'Marginal';
  return 'Unsatisfactory';
};

// KPMR Matrix [Inherent][KPMR] => Net Risk
const KPMR_MATRIX = [
  // KPMR:        1  2  3  4  5
  /* Low (1) */ [1, 1, 2, 3, 3],
  /* Low–Moderate (2) */ [1, 2, 2, 3, 4],
  /* Moderate (3) */ [2, 2, 3, 4, 4],
  /* Moderate–High (4) */ [2, 3, 4, 4, 5],
  /* High (5) */ [3, 3, 4, 5, 5],
];

const kpmrLabels = {
  1: 'Strong',
  2: 'Satisfactory',
  3: 'Fair',
  4: 'Marginal',
  5: 'Unsatisfactory',
};

const riskLabels = {
  1: 'Low',
  2: 'Low to Moderate',
  3: 'Moderate',
  4: 'Moderate to High',
  5: 'High',
};

// Penanda posisi aktif pada matrix di Excel.
// Catatan: styling cell Excel tidak mendukung "ring" (rounded border) seperti UI.
// Pendekatan ringan: ganti angka di cell aktif menjadi "angka di dalam lingkaran" (①..⑤)
// lalu besarkan font + tinggi baris agar terlihat jelas.
const circledDigit = (n) => {
  // Unicode Enclosed Alphanumerics: ① (U+2460) .. ⑤ (U+2464)
  // Pakai escape agar file tetap ASCII.
  const map = {
    1: '\u2460',
    2: '\u2461',
    3: '\u2462',
    4: '\u2463',
    5: '\u2464',
  };
  return map[n] || String(n);
};

/**
 * Create Sheet 1: Tabel Skor Profil Risiko
 */
function createScoreTableSheet(data, quarter, year) {
  const ws = {};
  ws['!merges'] = [];
  let currentRow = 0;

  // Helper to convert quarter to month abbreviation
  const quarterToMonth = (q) => {
    const monthMap = { Q1: 'MAR', Q2: 'JUN', Q3: 'SEP', Q4: 'DES' };
    return monthMap[q] || q;
  };

  // Header Row
  setCellValue(ws, currentRow, 1, `${quarterToMonth(quarter)} ${year}`);
  ws['!merges'].push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 } });
  // Set merged cells with borders - white background, left aligned
  for (let c = 1; c <= 4; c++) {
    setStyle(ws, currentRow, c, {
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFFFF' } },
      font: { bold: true, color: { rgb: 'FF000000' }, size: 12 },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: borderThin,
    });
  }
  currentRow++;

  // Column Headers
  setCellValue(ws, currentRow, 1, 'Risiko');
  setCellValue(ws, currentRow, 2, 'Inheren');
  setCellValue(ws, currentRow, 3, 'KPMR');
  setCellValue(ws, currentRow, 4, 'Net');
  [1, 2, 3, 4].forEach((c) => {
    setStyle(ws, currentRow, c, headerStyle('#D9D9D9', '#000000'));
  });
  currentRow++;

  // Data Rows
  data.rows.forEach((row) => {
    setCellValue(ws, currentRow, 1, row.label);
    setStyle(ws, currentRow, 1, {
      ...bodyStyle,
      alignment: { horizontal: 'right', vertical: 'center' },
      font: { bold: true, size: 12 },
    });

    // Inheren
    setCellValue(ws, currentRow, 2, row.inherent);
    setStyle(ws, currentRow, 2, {
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(getRiskColors(row.inherent).bg) } },
      font: { bold: true, color: { rgb: hexToARGB(getRiskColors(row.inherent).text) }, size: 14 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin,
    });

    // KPMR
    setCellValue(ws, currentRow, 3, row.kpmr);
    setStyle(ws, currentRow, 3, {
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(getRiskColors(row.kpmr).bg) } },
      font: { bold: true, color: { rgb: hexToARGB(getRiskColors(row.kpmr).text) }, size: 14 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin,
    });

    // Net
    setCellValue(ws, currentRow, 4, row.net);
    setStyle(ws, currentRow, 4, {
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(getRiskColors(row.net).bg) } },
      font: { bold: true, color: { rgb: hexToARGB(getRiskColors(row.net).text) }, size: 14 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin,
    });
    currentRow++;
  });

  // Add empty row as separator between data and summary with bordered cells
  for (let c = 1; c <= 4; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, {
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin,
    });
  }
  currentRow++;

  // Summary Row - Skor Profil Risiko (single row like data rows)
  setCellValue(ws, currentRow, 1, 'SKOR PROFIL RISIKO');
  setStyle(ws, currentRow, 1, {
    fill: { patternType: 'solid', fgColor: { rgb: 'FFE26B0A' } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 11 },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin,
  });

  // Inheren Summary
  const inherentColor = getRiskColors(data.skorProfil.inherent);
  setCellValue(ws, currentRow, 2, data.skorProfil.inherent);
  setStyle(ws, currentRow, 2, {
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(inherentColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(inherentColor.text) }, size: 16 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin,
  });

  // KPMR Summary
  const kpmrColor = getRiskColors(data.skorProfil.kpmr);
  setCellValue(ws, currentRow, 3, data.skorProfil.kpmr);
  setStyle(ws, currentRow, 3, {
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(kpmrColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(kpmrColor.text) }, size: 16 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin,
  });

  // Net Summary
  const netColor = getRiskColors(data.skorProfil.net);
  setCellValue(ws, currentRow, 4, data.skorProfil.net);
  setStyle(ws, currentRow, 4, {
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(netColor.bg) } },
    font: { bold: true, color: { rgb: hexToARGB(netColor.text) }, size: 16 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin,
  });

  currentRow += 1;

  // Apply outer border (thick) to main table (headers + rows + summary)
  const tableStartRow = 1; // Row 2 (0-based)
  const tableEndRow = currentRow - 1; // Last row of main table (0-based)
  const tableStartCol = 1; // Column B
  const tableEndCol = 4; // Column E

  for (let r = tableStartRow; r <= tableEndRow; r++) {
    for (let c = tableStartCol; c <= tableEndCol; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) continue;

      const currentStyle = ws[addr].s || {};
      const currentBorder = currentStyle.border || borderThin;

      // Build outer border
      const newBorder = { ...currentBorder };

      // Top edge
      if (r === tableStartRow) {
        newBorder.top = { style: 'medium', color: { rgb: 'FF000000' } };
      }
      // Bottom edge
      if (r === tableEndRow) {
        newBorder.bottom = { style: 'medium', color: { rgb: 'FF000000' } };
      }
      // Left edge
      if (c === tableStartCol) {
        newBorder.left = { style: 'medium', color: { rgb: 'FF000000' } };
      }
      // Right edge
      if (c === tableEndCol) {
        newBorder.right = { style: 'medium', color: { rgb: 'FF000000' } };
      }

      setStyle(ws, r, c, {
        ...currentStyle,
        border: newBorder,
      });
    }
  }

  // ===== Second table (as in rekap2.png): Penilaian / Peringkat Komposit / Deskripsi =====
  const smallHeaderStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: hexToARGB('#002060') } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 11 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: borderThin,
  };

  const smallLabelStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFFFF' } },
    font: { bold: true, color: { rgb: 'FF000000' }, size: 11 },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: borderThin,
  };

  const smallValueStyle = (level, opts = {}) => {
    const colors = getRiskColors(level);
    return {
      fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(colors.bg) } },
      font: {
        bold: true,
        italic: Boolean(opts.italic),
        color: { rgb: hexToARGB(colors.text) },
        size: opts.size || 11,
      },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin,
    };
  };

  // Spacing rows (no borders) to mimic the layout in the reference image
  for (let i = 0; i < 2; i++) {
    for (let c = 1; c <= 4; c++) {
      setCellValue(ws, currentRow, c, '');
      setStyle(ws, currentRow, c, { alignment: { horizontal: 'center', vertical: 'center' } });
    }
    currentRow++;
  }

  // Header row (B-D)
  setCellValue(ws, currentRow, 1, 'Penilaian');
  setCellValue(ws, currentRow, 2, 'Peringkat Komposit');
  setCellValue(ws, currentRow, 3, 'Deskripsi');
  [1, 2, 3].forEach((c) => setStyle(ws, currentRow, c, smallHeaderStyle));
  // Keep column E empty (spacer) without borders
  setCellValue(ws, currentRow, 4, '');
  setStyle(ws, currentRow, 4, { alignment: { horizontal: 'center', vertical: 'center' } });
  currentRow++;

  const smallRows = [
    {
      label: 'Risiko Inheren',
      level: data.skorProfil.inherent,
      desc: riskLabel(data.skorProfil.inherent),
    },
    {
      label: 'KPMR',
      level: data.skorProfil.kpmr,
      desc: kpmrLabel(data.skorProfil.kpmr),
    },
    {
      label: 'Risiko Korporasi',
      level: data.skorProfil.net,
      desc: riskLabel(data.skorProfil.net),
    },
  ];

  smallRows.forEach((r) => {
    setCellValue(ws, currentRow, 1, r.label);
    setStyle(ws, currentRow, 1, smallLabelStyle);

    setCellValue(ws, currentRow, 2, r.level);
    setStyle(ws, currentRow, 2, smallValueStyle(r.level, { size: 12 }));

    // Merge description cell D-E (body rows only)
    ws['!merges'].push({ s: { r: currentRow, c: 3 }, e: { r: currentRow, c: 4 } });

    setCellValue(ws, currentRow, 3, r.desc);
    setCellValue(ws, currentRow, 4, '');

    const descStyle = smallValueStyle(r.level, { italic: true });
    setStyle(ws, currentRow, 3, descStyle);
    setStyle(ws, currentRow, 4, descStyle);

    currentRow++;
  });

  // Column widths - column A is narrow spacer
  ws['!cols'] = [
    { wch: 3 }, // Column A (spacer)
    { wch: 25 }, // Column B - Risiko
    { wch: 15 }, // Column C - Inheren
    { wch: 15 }, // Column D - KPMR
    { wch: 15 }, // Column E - Net
  ];

  // Row heights - all rows have the same height
  ws['!rows'] = [];
  for (let i = 0; i < currentRow; i++) {
    ws['!rows'].push({ hpx: 20 });
  }

  const range = { s: { c: 1, r: 0 }, e: { c: 4, r: currentRow - 1 } };
  ws['!ref'] = XLSX.utils.encode_range(range);

  return ws;
}

/**
 * Create Sheet 2: Risk Matrix
 */
function createRiskMatrixSheet(skorProfil, quarter, year) {
  const ws = {};
  ws['!merges'] = [];
  let currentRow = 0;

  // Helper to convert quarter to month abbreviation
  const quarterToMonth = (q) => {
    const monthMap = { Q1: 'MAR', Q2: 'JUN', Q3: 'SEP', Q4: 'DES' };
    return monthMap[q] || q;
  };

  // Header
  setCellValue(ws, currentRow, 0, `${quarterToMonth(quarter)} ${year}`);
  ws['!merges'].push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 5 } });
  for (let c = 0; c <= 5; c++) {
    setStyle(ws, currentRow, c, {
      fill: { patternType: 'solid', fgColor: { rgb: 'FF0070C0' } },
      font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 14 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin,
    });
  }
  currentRow++;

  // Empty spacing row (no borders)
  for (let c = 0; c <= 5; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, {
      alignment: { horizontal: 'center', vertical: 'center' },
    });
  }
  currentRow++;

  // Matrix Header Row
  // INHERENT RISK label - merge A3:A4 (2 rows)
  setCellValue(ws, currentRow, 0, 'INHERENT RISK');
  ws['!merges'].push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + 1, c: 0 } });
  setStyle(ws, currentRow, 0, {
    fill: { patternType: 'solid', fgColor: { rgb: 'FF0070C0' } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: borderThin,
  });
  // Also set style for the merged cell in next row
  setStyle(ws, currentRow + 1, 0, {
    fill: { patternType: 'solid', fgColor: { rgb: 'FF0070C0' } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: borderThin,
  });

  setCellValue(ws, currentRow, 1, 'KPMR LEVEL');
  ws['!merges'].push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 5 } });
  for (let c = 1; c <= 5; c++) {
    setStyle(ws, currentRow, c, {
      fill: { patternType: 'solid', fgColor: { rgb: 'FF0068B3' } },
      font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 10 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin,
    });
  }
  currentRow++;

  // KPMR Column Headers
  // INHERENT RISK is already merged from previous row, skip column A

  [1, 2, 3, 4, 5].forEach((num) => {
    const col = num;
    setCellValue(ws, currentRow, col, `${kpmrLabels[num]}\n(${num})`);
    setStyle(ws, currentRow, col, {
      fill: { patternType: 'solid', fgColor: { rgb: 'FF0070C0' } },
      font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin,
    });
  });
  currentRow++;

  // Matrix Data Rows
  [1, 2, 3, 4, 5].forEach((row) => {
    // Row Header
    setCellValue(ws, currentRow, 0, `${riskLabels[row]}\n(${row})`);
    setStyle(ws, currentRow, 0, {
      fill: { patternType: 'solid', fgColor: { rgb: 'FF0070C0' } },
      font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 9 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin,
    });

    // Matrix Cells
    [1, 2, 3, 4, 5].forEach((col) => {
      const netValue = KPMR_MATRIX[row - 1][col - 1];
      const isActive = skorProfil.inherent === row && skorProfil.kpmr === col;

      // Jika posisi aktif, tampilkan angka di dalam lingkaran (①..⑤) agar terlihat "membulat".
      setCellValue(ws, currentRow, col, isActive ? circledDigit(netValue) : netValue);
      const cellStyle = {
        fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(getRiskColors(netValue).bg) } },
        font: {
          bold: true,
          color: { rgb: hexToARGB(getRiskColors(netValue).text) },
          // Perbesar khusus cell aktif agar lingkaran terlihat jelas di Excel.
          size: isActive ? 30 : 16,
        },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderThin,
      };

      setStyle(ws, currentRow, col, cellStyle);
    });
    currentRow++;
  });

  // Current Position Indicator - empty row without borders
  for (let c = 0; c <= 5; c++) {
    setCellValue(ws, currentRow, c, '');
    setStyle(ws, currentRow, c, {
      alignment: { horizontal: 'center', vertical: 'center' },
    });
  }
  currentRow++;

  // Column widths
  ws['!cols'] = [
    { wch: 20 }, // Inherent Risk label
    { wch: 15 }, // KPMR columns
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  // Row heights - set individual row heights
  ws['!rows'] = [];
  for (let i = 0; i < currentRow; i++) {
    // Row 4 (index 3) - KPMR Column Headers needs more height for 2-line text
    if (i === 3) {
      ws['!rows'].push({ hpx: 36 });
      continue;
    }
    // Rows 5-9 (indices 4-8) - Matrix Data Rows: dibuat lebih tinggi agar angka-lingkaran besar tidak kepotong
    if (i >= 4 && i <= 8) {
      ws['!rows'].push({ hpx: 54 });
      continue;
    }
    ws['!rows'].push({ hpx: 20 });
  }

  const range = { s: { c: 0, r: 0 }, e: { c: 5, r: currentRow - 1 } };
  ws['!ref'] = XLSX.utils.encode_range(range);

  return ws;
}

/**
 * Export Rekap 2 ke Excel dengan 2 sheet:
 * Sheet 1: Tabel Skor Profil Risiko
 * Sheet 2: Risk Matrix
 */
export function exportRekap2ToExcel(data, quarter, year) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Tabel Skor Profil Risiko
  const sheet1 = createScoreTableSheet(data, quarter, year);
  XLSX.utils.book_append_sheet(wb, sheet1, 'Skor Profil Risiko');

  // Sheet 2: Risk Matrix
  const sheet2 = createRiskMatrixSheet(data.skorProfil, quarter, year);
  XLSX.utils.book_append_sheet(wb, sheet2, 'Risk Matrix');

  // Generate filename
  const fileName = `REKAP-2-${year}-${quarter}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
