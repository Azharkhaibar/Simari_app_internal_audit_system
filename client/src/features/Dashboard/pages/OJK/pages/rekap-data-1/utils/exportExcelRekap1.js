import * as XLSX from 'xlsx-js-style';

/**
 * Export Rekap Data 1 OJK to Excel
 * 
 * @param {Object} params
 * @param {Array} params.tableData
 * @param {Object} params.footerDisplay
 * @param {number} params.year
 * @param {number|string} params.quarter
 */
export function exportRekap1ToExcel({ tableData = [], footerDisplay, year, quarter }) {
  const wb = XLSX.utils.book_new();

  // Color Palette
  const COLORS = {
    HEADER_BG: '1F4E79', // Dark Blue
    HEADER_FG: 'FFFFFF', // White
    ROW_ALT_BG: 'F9FAFB', // Very Light Gray for Zebra
    BORDER: 'D1D5DB', // Light Gray Border
    FOOTER_BG: '1E3A8A', // Deep Blue
    FOOTER_FG: 'FFFFFF', // White
    
    // Rating Colors matching the UI
    RATING_1: '2E7D32', // Green
    RATING_2: '92D050', // Light Green
    RATING_3: 'FFFF00', // Yellow
    RATING_4: 'FFC000', // Orange
    RATING_5: 'FF0000', // Red
    NO_DATA: '9CA3AF',   // Gray
    PARTIAL_DATA: 'E5E7EB' // Light Gray
  };

  const borderThin = {
    top: { style: 'thin', color: { rgb: COLORS.BORDER } },
    bottom: { style: 'thin', color: { rgb: COLORS.BORDER } },
    left: { style: 'thin', color: { rgb: COLORS.BORDER } },
    right: { style: 'thin', color: { rgb: COLORS.BORDER } }
  };

  const getStyleForRating = (score, dataStatus, type = 'inherent') => {
    if (dataStatus === 'no-data' || score === 0) {
      return {
        fill: { patternType: 'solid', fgColor: { rgb: COLORS.NO_DATA } },
        font: { color: { rgb: 'FFFFFF' }, bold: true }
      };
    }
    if (dataStatus === 'partial-data') {
      return {
        fill: { patternType: 'solid', fgColor: { rgb: COLORS.PARTIAL_DATA } },
        font: { color: { rgb: '4B5563' }, bold: true } // gray text
      };
    }

    const roundedScore = Math.round(score);
    let color = COLORS.NO_DATA;
    let fgColor = 'FFFFFF';
    
    if (roundedScore === 1) { color = COLORS.RATING_1; fgColor = 'FFFFFF'; }
    else if (roundedScore === 2) { color = COLORS.RATING_2; fgColor = '000000'; }
    else if (roundedScore === 3) { color = COLORS.RATING_3; fgColor = '000000'; }
    else if (roundedScore === 4) { color = COLORS.RATING_4; fgColor = '000000'; }
    else if (roundedScore >= 5) { color = COLORS.RATING_5; fgColor = 'FFFFFF'; }

    return {
      fill: { patternType: 'solid', fgColor: { rgb: color } },
      font: { color: { rgb: fgColor }, bold: true }
    };
  };

  // 1. Prepare AOA Data
  const wsData = [
    // Info Rows
    ['LAPORAN REKAP DATA 1 OJK'],
    [`Periode: Tahun ${year} - Triwulan Q${quarter}`],
    [], // Empty row
    // Headers
    ['No', 'Jenis Risiko', 'BVt', 'BHz', 'Inherent Risk', '', 'KPMR', '', 'Peringkat Tingkat Komposit', ''],
    ['', '', '', '', 'Skor', 'Peringkat', 'Skor', 'Peringkat', 'Skor', 'Peringkat']
  ];

  const dataStartRow = wsData.length; // Row index where actual data begins (0-based)

  // Add data rows
  tableData.forEach((item, index) => {
    const inherentLabel = item.hasInherentData ? item.inherentIndicator?.label : 'Data Tidak Ditemukan';
    const kpmrLabel = item.hasKpmrData ? item.kpmrIndicator?.label : 'Data Tidak Ditemukan';
    
    let kompositSkor = (item.inherentSkor + item.kpmrSkor) / 2;
    let kompositLabel = '';
    if (item.dataStatus === 'no-data') {
      kompositLabel = 'Data Tidak Ditemukan';
      kompositSkor = 0;
    } else if (item.dataStatus === 'partial-data') {
      kompositLabel = 'Data Belum Lengkap';
      kompositSkor = item.inherentSkor > 0 ? item.inherentSkor : item.kpmrSkor;
    } else {
      kompositLabel = item.kompositIndicator?.label || '';
    }

    wsData.push([
      index + 1,
      item.nama,
      `${item.bvt}%`,
      `${item.bhz}%`,
      Number(item.inherentSkor.toFixed(2)),
      inherentLabel,
      Number(item.kpmrSkor.toFixed(2)),
      kpmrLabel,
      Number(kompositSkor.toFixed(2)),
      kompositLabel
    ]);
  });

  // Add footer row
  const footerRowIndex = wsData.length;
  const ptkLabel = footerDisplay.hasNoData
    ? 'Data Tidak Ditemukan'
    : footerDisplay.hasPartialData
      ? 'Data Belum Lengkap'
      : footerDisplay.ptkIndicator?.label || '';

  wsData.push([
    'Peringkat Komposit', '', '', '',
    Number(footerDisplay.inherentDisplay.toFixed(2)),
    footerDisplay.hasInherentData ? footerDisplay.inherentIndicator?.label : 'Data Tidak Ditemukan',
    Number(footerDisplay.kpmrDisplay.toFixed(2)),
    footerDisplay.hasKpmrData ? footerDisplay.kpmrIndicator?.label : 'Data Tidak Ditemukan',
    Number(footerDisplay.ptkDisplay.toFixed(2)),
    ptkLabel
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 2. Set Marges
  ws['!merges'] = [
    // Info title merges
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    // Header merges
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // No
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // Jenis Risiko
    { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // BVt
    { s: { r: 3, c: 3 }, e: { r: 4, c: 3 } }, // BHz
    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } }, // Inherent Risk
    { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } }, // KPMR
    { s: { r: 3, c: 8 }, e: { r: 3, c: 9 } }, // Komposit
    // Footer merges
    { s: { r: footerRowIndex, c: 0 }, e: { r: footerRowIndex, c: 3 } } // Peringkat Komposit label
  ];

  // 3. Set Styles
  const totalRows = wsData.length;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < 10; c++) {
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

      // Header styling (Rows 3 and 4)
      if (r === 3 || r === 4) {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: COLORS.HEADER_BG } },
          font: { color: { rgb: COLORS.HEADER_FG }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: borderThin
        };
        ws[cellRef] = cell;
        continue;
      }

      // Footer styling
      if (r === footerRowIndex) {
        if (c <= 3) {
          cell.s = {
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.FOOTER_BG } },
            font: { color: { rgb: COLORS.FOOTER_FG }, bold: true },
            alignment: { horizontal: 'left', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 4 || c === 6 || c === 8) {
          // Footer Scores
          cell.s = {
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.FOOTER_BG } },
            font: { color: { rgb: COLORS.FOOTER_FG }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 5) {
          // Footer Inherent Rating Label
          cell.s = {
            ...getStyleForRating(footerDisplay.inherentDisplay, footerDisplay.hasInherentData ? 'complete-data' : 'no-data'),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 7) {
          // Footer KPMR Rating Label
          cell.s = {
            ...getStyleForRating(footerDisplay.kpmrDisplay, footerDisplay.hasKpmrData ? 'complete-data' : 'no-data', 'kpmr'),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 9) {
          // Footer Komposit Rating Label
          const compStatus = footerDisplay.hasNoData ? 'no-data' : footerDisplay.hasPartialData ? 'partial-data' : 'complete-data';
          cell.s = {
            ...getStyleForRating(footerDisplay.ptkDisplay, compStatus),
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

      // Alignment overrides
      if (c === 0 || c === 2 || c === 3) {
        cell.s.alignment.horizontal = 'center';
      } else if (c === 4 || c === 6 || c === 8) {
        cell.s.alignment.horizontal = 'center';
      }

      // Format ratings with matching color code badges
      const itemIndex = r - dataStartRow;
      const item = tableData[itemIndex];

      if (c === 5) {
        // Inherent Rating Label cell
        cell.s = {
          ...getStyleForRating(item.inherentSkor, item.hasInherentData ? 'complete-data' : 'no-data'),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      } else if (c === 7) {
        // KPMR Rating Label cell
        cell.s = {
          ...getStyleForRating(item.kpmrSkor, item.hasKpmrData ? 'complete-data' : 'no-data', 'kpmr'),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      } else if (c === 9) {
        // Komposit Rating Label cell
        cell.s = {
          ...getStyleForRating(item.kompositSkor, item.dataStatus),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      }

      ws[cellRef] = cell;
    }
  }

  // 4. Set Column Widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 28 }, // Jenis Risiko
    { wch: 10 }, // BVt
    { wch: 10 }, // BHz
    { wch: 10 }, // Inherent Skor
    { wch: 25 }, // Inherent Rating
    { wch: 10 }, // KPMR Skor
    { wch: 25 }, // KPMR Rating
    { wch: 10 }, // Komposit Skor
    { wch: 25 }  // Komposit Rating
  ];

  // Append sheet and write
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Data 1');
  XLSX.writeFile(wb, `OJK_REKAP_DATA_1_${year}_Q${quarter}.xlsx`);
}
