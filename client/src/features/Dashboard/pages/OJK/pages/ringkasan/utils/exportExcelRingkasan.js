import * as XLSX from 'xlsx-js-style';

/**
 * Export Ringkasan Risk Assessment to Excel
 * 
 * @param {Object} params
 * @param {Array} params.summaryData
 * @param {number} params.year
 * @param {number|string} params.quarter
 * @param {string} params.search
 */
export function exportRingkasanToExcel({ summaryData = [], year, quarter, search = '' }) {
  const wb = XLSX.utils.book_new();

  // Color Palette
  const COLORS = {
    HEADER1_BG: '1F4E79', // Dark Blue
    HEADER2_BG: '334155', // Slate Gray
    HEADER_FG: 'FFFFFF',  // White
    ROW_ALT_BG: 'F9FAFB', // Zebra Stripe Light Gray
    BORDER: 'D1D5DB',     // Light Gray Border
    CATEGORY_BG: 'E8F5FA', // Light Blue for Category Columns
    
    // Risk Level Colors
    RISK_1: '2E7D32', // Green
    RISK_2: '92D050', // Light Green
    RISK_3: 'FFFF00', // Yellow
    RISK_4: 'FFC000', // Orange
    RISK_5: 'FF0000', // Red
    NO_DATA: '9CA3AF'  // Gray
  };

  const borderThin = {
    top: { style: 'thin', color: { rgb: COLORS.BORDER } },
    bottom: { style: 'thin', color: { rgb: COLORS.BORDER } },
    left: { style: 'thin', color: { rgb: COLORS.BORDER } },
    right: { style: 'thin', color: { rgb: COLORS.BORDER } }
  };

  const getStyleForRisk = (riskLevel) => {
    if (riskLevel === 0 || isNaN(riskLevel)) {
      return {
        fill: { patternType: 'solid', fgColor: { rgb: COLORS.NO_DATA } },
        font: { color: { rgb: 'FFFFFF' }, bold: true }
      };
    }
    
    const score = Math.round(riskLevel);
    let color = COLORS.NO_DATA;
    let fgColor = 'FFFFFF';
    
    if (score === 1) { color = COLORS.RISK_1; fgColor = 'FFFFFF'; }
    else if (score === 2) { color = COLORS.RISK_2; fgColor = '000000'; }
    else if (score === 3) { color = COLORS.RISK_3; fgColor = '000000'; }
    else if (score === 4) { color = COLORS.RISK_4; fgColor = '000000'; }
    else if (score >= 5) { color = COLORS.RISK_5; fgColor = 'FFFFFF'; }

    return {
      fill: { patternType: 'solid', fgColor: { rgb: color } },
      font: { color: { rgb: fgColor }, bold: true }
    };
  };

  const getRiskLabel = (score) => {
    const rounded = Math.round(score);
    if (rounded === 1) return 'Low';
    if (rounded === 2) return 'Low to Moderate';
    if (rounded === 3) return 'Moderate';
    if (rounded === 4) return 'Moderate to High';
    if (rounded === 5) return 'High';
    return '-';
  };

  // 1. Prepare AOA Data
  const wsData = [
    // Info Rows
    ['RINGKASAN RISK ASSESSMENT OJK'],
    [`Periode: Tahun ${year} - Triwulan Q${quarter}`],
    [], // Empty row
    // Headers Row 1 (row index 3)
    ['No', 'Jenis Risiko', 'Bobot', 'Parameter', 'Indeks', 'Indikator/Risiko Inheren', 'Hasil Risk Assessment', '', '', ''],
    // Headers Row 2 (row index 4)
    ['', '', '', '', '', '', 'Active Quarter', '', '', ''],
    // Headers Row 3 (row index 5)
    ['', '', '', '', '', '', 'Bobot', 'Hasil Assessment', 'Risk Level', 'Risk Indicator']
  ];

  const headerMergeRanges = [
    // RowSpan Merges (0-based rows 3 to 5)
    { s: { r: 3, c: 0 }, e: { r: 5, c: 0 } }, // No
    { s: { r: 3, c: 1 }, e: { r: 5, c: 1 } }, // Jenis Risiko
    { s: { r: 3, c: 2 }, e: { r: 5, c: 2 } }, // Bobot (Param)
    { s: { r: 3, c: 3 }, e: { r: 5, c: 3 } }, // Parameter
    { s: { r: 3, c: 4 }, e: { r: 5, c: 4 } }, // Indeks
    { s: { r: 3, c: 5 }, e: { r: 5, c: 5 } }, // Indikator
    // ColSpan Merges
    { s: { r: 3, c: 6 }, e: { r: 3, c: 9 } }, // Hasil Risk Assessment (Row 3)
    { s: { r: 4, c: 6 }, e: { r: 4, c: 9 } }  // Active Quarter (Row 4)
  ];

  const merges = [...headerMergeRanges];
  const searchLower = search.toLowerCase().trim();

  // Helper to format values
  const fmtPercent = (val) => (val != null ? `${Number(val)}%` : '');

  // Build rows and keep track of cell merges
  const dataStartRow = wsData.length;
  let currentRowIndex = dataStartRow;

  summaryData.forEach((pageData) => {
    const { no, categoryLabel, categoryCode, rows: pageRows } = pageData;

    if (!Array.isArray(pageRows) || pageRows.length === 0) {
      wsData.push([
        no,
        `Risiko ${categoryLabel}`,
        '-',
        'Data tidak ditemukan',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-'
      ]);
      currentRowIndex++;
      return;
    }

    // Filter rows based on search
    const matchedRows = [];
    pageRows.forEach((param, paramIndex) => {
      const paramName = param.judul || 'Parameter';
      const paramNumber = param.nomor || (paramIndex + 1).toString();

      if (!param.nilaiList || param.nilaiList.length === 0) {
        // Empty parameter
        const indeks = `R.${categoryCode}.${paramNumber}`;
        const matchesSearch = !searchLower || 
          categoryLabel.toLowerCase().includes(searchLower) || 
          paramName.toLowerCase().includes(searchLower) || 
          indeks.toLowerCase().includes(searchLower);

        if (matchesSearch) {
          matchedRows.push({
            type: 'empty-param',
            param,
            paramName,
            indeks
          });
        }
        return;
      }

      param.nilaiList.forEach((item, itemIndex) => {
        const titleText = item?.judul?.text || '';
        const indeks = `R.${categoryCode}.${item?.nomor || paramNumber}`;
        
        const matchesSearch = !searchLower ||
          titleText.toLowerCase().includes(searchLower) ||
          paramName.toLowerCase().includes(searchLower) ||
          categoryLabel.toLowerCase().includes(searchLower) ||
          indeks.toLowerCase().includes(searchLower);

        if (matchesSearch) {
          matchedRows.push({
            type: 'data',
            param,
            paramName,
            item,
            indeks
          });
        }
      });
    });

    if (matchedRows.length === 0) {
      return;
    }

    // Merging category metadata columns
    merges.push({
      s: { r: currentRowIndex, c: 0 },
      e: { r: currentRowIndex + matchedRows.length - 1, c: 0 }
    });
    merges.push({
      s: { r: currentRowIndex, c: 1 },
      e: { r: currentRowIndex + matchedRows.length - 1, c: 1 }
    });

    // Group items by parameter to merge parameter columns
    let paramStartRow = currentRowIndex;
    let currentParamId = null;
    let paramCount = 0;

    matchedRows.forEach((row, rowIdx) => {
      const isLast = rowIdx === matchedRows.length - 1;
      const paramId = row.param.id;

      if (currentParamId === null) {
        currentParamId = paramId;
        paramCount = 1;
      } else if (currentParamId === paramId) {
        paramCount++;
      } else {
        // Parameter changed, merge previous parameter
        merges.push({
          s: { r: paramStartRow, c: 2 },
          e: { r: paramStartRow + paramCount - 1, c: 2 }
        });
        merges.push({
          s: { r: paramStartRow, c: 3 },
          e: { r: paramStartRow + paramCount - 1, c: 3 }
        });
        paramStartRow = currentRowIndex + rowIdx;
        currentParamId = paramId;
        paramCount = 1;
      }

      if (isLast) {
        // Merge last parameter group
        merges.push({
          s: { r: paramStartRow, c: 2 },
          e: { r: paramStartRow + paramCount - 1, c: 2 }
        });
        merges.push({
          s: { r: paramStartRow, c: 3 },
          e: { r: paramStartRow + paramCount - 1, c: 3 }
        });
      }

      // Add Excel row
      if (row.type === 'empty-param') {
        wsData.push([
          no,
          `Risiko ${categoryLabel}`,
          fmtPercent(row.param.bobot),
          row.paramName,
          row.indeks,
          '-',
          '-',
          '-',
          '-',
          '-'
        ]);
      } else {
        const { item, indeks } = row;
        const derived = item?.derived || {};
        const hasilAssessment = derived.hasilDisplay ?? derived.weighted ?? 0;
        const riskLevel = derived.riskLevel ?? derived.weighted ?? 0;

        wsData.push([
          no,
          `Risiko ${categoryLabel}`,
          fmtPercent(row.param.bobot),
          row.paramName,
          indeks,
          item?.judul?.text || '-',
          fmtPercent(item.bobot),
          hasilAssessment !== 0 ? Number(hasilAssessment.toFixed(2)) : '-',
          riskLevel !== 0 ? Number(riskLevel.toFixed(2)) : '-',
          riskLevel !== 0 ? getRiskLabel(riskLevel) : '-'
        ]);
      }
    });

    currentRowIndex += matchedRows.length;
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!merges'] = merges;

  // 2. Formatting cells
  const totalRows = wsData.length;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < 10; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });

      // Title rows
      if (r === 0) {
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { bold: true, size: 16, color: { rgb: '1F4E79' } },
            alignment: { horizontal: 'left' }
          };
        }
        continue;
      }
      if (r === 1) {
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { italic: true, size: 11, color: { rgb: '4B5563' } },
            alignment: { horizontal: 'left' }
          };
        }
        continue;
      }
      if (r === 2) continue; // Skip empty row

      const cell = ws[cellRef] || { t: 's', v: '' };

      // Header row 1
      if (r === 3) {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: COLORS.HEADER1_BG } },
          font: { color: { rgb: COLORS.HEADER_FG }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: borderThin
        };
        ws[cellRef] = cell;
        continue;
      }

      // Header row 2 and 3
      if (r === 4 || r === 5) {
        const bg = c >= 6 ? COLORS.HEADER2_BG : COLORS.HEADER1_BG;
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: bg } },
          font: { color: { rgb: COLORS.HEADER_FG }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: borderThin
        };
        ws[cellRef] = cell;
        continue;
      }

      // Data Rows
      const isAltRow = (r - dataStartRow) % 2 === 1;
      const defaultBg = isAltRow ? COLORS.ROW_ALT_BG : 'FFFFFF';

      cell.s = {
        fill: { patternType: 'solid', fgColor: { rgb: defaultBg } },
        alignment: { vertical: 'center', wrapText: true },
        border: borderThin
      };

      // Alignment override
      if (c === 0 || c === 2 || c === 4 || c === 6 || c === 7) {
        cell.s.alignment.horizontal = 'center';
      }

      // Format category metadata cells (No, Jenis Risiko, Bobot, Parameter) with a soft blue background
      if (c <= 4) {
        cell.s.fill = { patternType: 'solid', fgColor: { rgb: COLORS.CATEGORY_BG } };
      }

      // Risk score & indicator color coding
      if (c === 8 || c === 9) {
        const scoreVal = wsData[r][8];
        const numericScore = typeof scoreVal === 'number' ? scoreVal : 0;
        
        if (numericScore > 0) {
          cell.s = {
            ...getStyleForRisk(numericScore),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else {
          cell.s.alignment.horizontal = 'center';
        }
      }

      ws[cellRef] = cell;
    }
  }

  // Set widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // Jenis Risiko
    { wch: 10 }, // Bobot
    { wch: 28 }, // Parameter
    { wch: 16 }, // Indeks
    { wch: 38 }, // Indikator
    { wch: 10 }, // Bobot (Indikator)
    { wch: 18 }, // Hasil Assessment
    { wch: 15 }, // Risk Level
    { wch: 22 }  // Risk Indicator
  ];

  // Append sheet and write
  XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan');
  XLSX.writeFile(wb, `OJK_RINGKASAN_${year}_Q${quarter}.xlsx`);
}
