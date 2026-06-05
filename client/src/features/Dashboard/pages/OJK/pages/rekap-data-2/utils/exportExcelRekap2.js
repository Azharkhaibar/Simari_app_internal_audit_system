import * as XLSX from 'xlsx-js-style';

/**
 * Export Rekap Data 2 OJK to Excel
 * 
 * @param {Object} params
 * @param {Array} params.tableData
 * @param {Object} params.footerDisplay
 * @param {number} params.year
 * @param {number|string} params.quarter
 */
export function exportRekap2ToExcel({ tableData = [], footerDisplay, year, quarter }) {
  const wb = XLSX.utils.book_new();

  // Color Palette
  const COLORS = {
    HEADER_BG: '1F4E79', // Dark Blue
    HEADER_FG: 'FFFFFF', // White
    ROW_ALT_BG: 'F9FAFB', // Very Light Gray for Zebra
    BORDER: 'D1D5DB', // Light Gray Border
    FOOTER_BG: '1E3A8A', // Deep Blue
    FOOTER_FG: 'FFFFFF', // White
    
    // Matrix Rating Colors matching the UI (1 to 5)
    SCORE_1: '2ECC71', // Green (Low / Strong)
    SCORE_2: 'A3E635', // Light Green (Low to Moderate / Satisfactory)
    SCORE_3: 'FACC15', // Yellow (Moderate / Fair)
    SCORE_4: 'F97316', // Orange (Moderate to High / Marginal)
    SCORE_5: 'FF0000', // Red (High / Unsatisfactory)
    NO_DATA: 'E5E7EB'  // Light Gray for empty "-"
  };

  const borderThin = {
    top: { style: 'thin', color: { rgb: COLORS.BORDER } },
    bottom: { style: 'thin', color: { rgb: COLORS.BORDER } },
    left: { style: 'thin', color: { rgb: COLORS.BORDER } },
    right: { style: 'thin', color: { rgb: COLORS.BORDER } }
  };

  const getStyleForScore = (indicator) => {
    if (!indicator) {
      return {
        fill: { patternType: 'solid', fgColor: { rgb: COLORS.NO_DATA } },
        font: { color: { rgb: '9CA3AF' }, bold: true }
      };
    }

    const score = Math.round(indicator.score);
    let color = COLORS.NO_DATA;
    let fgColor = 'FFFFFF';
    
    if (score === 1) { color = COLORS.SCORE_1; fgColor = 'FFFFFF'; }
    else if (score === 2) { color = COLORS.SCORE_2; fgColor = '000000'; }
    else if (score === 3) { color = COLORS.SCORE_3; fgColor = '000000'; }
    else if (score === 4) { color = COLORS.SCORE_4; fgColor = '000000'; }
    else if (score >= 5) { color = COLORS.SCORE_5; fgColor = 'FFFFFF'; }

    return {
      fill: { patternType: 'solid', fgColor: { rgb: color } },
      font: { color: { rgb: fgColor }, bold: true }
    };
  };

  // 1. Prepare AOA Data
  const wsData = [
    // Info Rows
    ['LAPORAN REKAP DATA 2 OJK'],
    [`Periode: Tahun ${year} - Triwulan Q${quarter}`],
    [], // Empty row
    // Headers
    ['Jenis Risiko', 'Inherent Risk', 'KPMR', 'Net Risk']
  ];

  const dataStartRow = wsData.length;

  // Add data rows
  tableData.forEach((item) => {
    wsData.push([
      item.nama,
      item.hasInherent ? item.inherentIndicator?.score : '-',
      item.hasKpmr ? item.kpmrIndicator?.score : '-',
      (item.hasInherent && item.hasKpmr) ? item.matrixIndicator?.score : '-'
    ]);
  });

  // Add footer row
  const footerRowIndex = wsData.length;
  wsData.push([
    'Skor Profil Risiko',
    footerDisplay.hasData && footerDisplay.inherentIndicator ? footerDisplay.inherentIndicator.score : '-',
    footerDisplay.hasData && footerDisplay.kpmrIndicator ? footerDisplay.kpmrIndicator.score : '-',
    footerDisplay.hasData && footerDisplay.matrixIndicator ? footerDisplay.matrixIndicator.score : '-'
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 2. Set Marges
  ws['!merges'] = [
    // Info title merges
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
  ];

  // 3. Set Styles
  const totalRows = wsData.length;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < 4; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      
      // Title styling
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

      // Header styling
      if (r === 3) {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: COLORS.HEADER_BG } },
          font: { color: { rgb: COLORS.HEADER_FG }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
        ws[cellRef] = cell;
        continue;
      }

      // Footer styling
      if (r === footerRowIndex) {
        if (c === 0) {
          cell.s = {
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.FOOTER_BG } },
            font: { color: { rgb: COLORS.FOOTER_FG }, bold: true },
            alignment: { horizontal: 'left', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 1) {
          cell.s = {
            ...getStyleForScore(footerDisplay.hasData ? footerDisplay.inherentIndicator : null),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 2) {
          cell.s = {
            ...getStyleForScore(footerDisplay.hasData ? footerDisplay.kpmrIndicator : null),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 3) {
          cell.s = {
            ...getStyleForScore(footerDisplay.hasData ? footerDisplay.matrixIndicator : null),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        }
        ws[cellRef] = cell;
        continue;
      }

      // Data row styling
      const isAltRow = (r - dataStartRow) % 2 === 1;
      const defaultBg = isAltRow ? COLORS.ROW_ALT_BG : 'FFFFFF';

      cell.s = {
        fill: { patternType: 'solid', fgColor: { rgb: defaultBg } },
        alignment: { vertical: 'center' },
        border: borderThin
      };

      if (c === 0) {
        cell.s.alignment.horizontal = 'left';
      } else {
        cell.s.alignment.horizontal = 'center';
      }

      // Format ratings
      const itemIndex = r - dataStartRow;
      const item = tableData[itemIndex];

      if (c === 1) {
        cell.s = {
          ...getStyleForScore(item.hasInherent ? item.inherentIndicator : null),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      } else if (c === 2) {
        cell.s = {
          ...getStyleForScore(item.hasKpmr ? item.kpmrIndicator : null),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      } else if (c === 3) {
        cell.s = {
          ...getStyleForScore((item.hasInherent && item.hasKpmr) ? item.matrixIndicator : null),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      }

      ws[cellRef] = cell;
    }
  }

  // 4. Set Column Widths
  ws['!cols'] = [
    { wch: 32 }, // Jenis Risiko
    { wch: 18 }, // Inherent
    { wch: 18 }, // KPMR
    { wch: 18 }  // Net Risk
  ];

  // Append sheet and write
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Data 2');
  XLSX.writeFile(wb, `OJK_REKAP_DATA_2_${year}_Q${quarter}.xlsx`);
}
