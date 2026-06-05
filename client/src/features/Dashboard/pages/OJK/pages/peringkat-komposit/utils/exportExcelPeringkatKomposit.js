import * as XLSX from 'xlsx-js-style';

/**
 * Export Peringkat Komposit OJK to Excel
 * 
 * @param {Object} params
 * @param {Array} params.tableData
 * @param {Object} params.footerData
 * @param {number} params.year
 * @param {number|string} params.quarter
 */
export function exportPeringkatKompositToExcel({ tableData = [], footerData, year, quarter }) {
  const wb = XLSX.utils.book_new();

  // Color Palette
  const COLORS = {
    HEADER_BG: '1F4E79', // Dark Blue
    HEADER2_BG: '1D4ED8', // Medium Blue for lower header
    ROW_ALT_BG: 'F9FAFB', // Zebra stripe Light Gray
    BORDER: 'D1D5DB',     // Light Gray Border
    FOOTER_BG: '1E3A8A',  // Deep Blue
    FOOTER_FG: 'FFFFFF',  // White
    
    // Rating colors
    RATING_1: '2E7D32', // Green
    RATING_2: '92D050', // Light Green
    RATING_3: 'FFFF00', // Yellow
    RATING_4: 'FFC000', // Orange
    RATING_5: 'FF0000', // Red
    NO_DATA: 'E5E7EB'  // Light Gray
  };

  const borderThin = {
    top: { style: 'thin', color: { rgb: COLORS.BORDER } },
    bottom: { style: 'thin', color: { rgb: COLORS.BORDER } },
    left: { style: 'thin', color: { rgb: COLORS.BORDER } },
    right: { style: 'thin', color: { rgb: COLORS.BORDER } }
  };

  const getStyleForRating = (indicator, hasData) => {
    if (!hasData || !indicator) {
      return {
        fill: { patternType: 'solid', fgColor: { rgb: COLORS.NO_DATA } },
        font: { color: { rgb: '9CA3AF' }, bold: true }
      };
    }

    const score = Math.round(indicator.score);
    let color = COLORS.NO_DATA;
    let fgColor = 'FFFFFF';
    
    if (score === 1) { color = COLORS.RATING_1; fgColor = 'FFFFFF'; }
    else if (score === 2) { color = COLORS.RATING_2; fgColor = '000000'; }
    else if (score === 3) { color = COLORS.RATING_3; fgColor = '000000'; }
    else if (score === 4) { color = COLORS.RATING_4; fgColor = '000000'; }
    else if (score >= 5) { color = COLORS.RATING_5; fgColor = 'FFFFFF'; }

    return {
      fill: { patternType: 'solid', fgColor: { rgb: color } },
      font: { color: { rgb: fgColor }, bold: true }
    };
  };

  // 1. Prepare AOA Data
  const wsData = [
    // Info Rows
    ['LAPORAN PERINGKAT KOMPOSIT OJK'],
    [`Periode: Tahun ${year} - Triwulan Q${quarter}`],
    [], // Empty row
    // Headers Row 1
    ['Jenis Risiko', 'BHz', 'INHERENT', '', '', 'KUALITAS PENERAPAN MANAJEMEN RISIKO', '', ''],
    // Headers Row 2
    ['', '', 'Indicator', 'Skor', 'Nilai', 'Indicator', 'Skor', 'Nilai']
  ];

  const dataStartRow = wsData.length;

  // Add data rows
  tableData.forEach((item) => {
    wsData.push([
      item.nama,
      item.hasInherent || item.hasKpmr ? `${item.bhz}%` : '-',
      item.hasInherent ? item.inherentIndicator.score : 'Data tidak tersedia',
      item.hasInherent ? Number(item.inherentSkor.toFixed(2)) : '-',
      item.hasInherent ? Number(item.inherentNilai.toFixed(2)) : '-',
      item.hasKpmr ? item.kpmrIndicator.score : 'Data tidak tersedia',
      item.hasKpmr ? Number(item.kpmrSkor.toFixed(2)) : '-',
      item.hasKpmr ? Number(item.kpmrNilai.toFixed(2)) : '-'
    ]);
  });

  // Add footer row
  const footerRowIndex = wsData.length;
  wsData.push([
    `Peringkat Komposit (${footerData.activeCount}/${footerData.totalCount} modul aktif)`,
    `${footerData.totalBhz}%`,
    footerData.activeCount > 0 ? footerData.IndicatoravgInherentNilai.score : 'Tidak ada data',
    'Avg Nilai :',
    footerData.activeCount > 0 ? Number(footerData.avgInherentNilai.toFixed(2)) : '-',
    footerData.activeCount > 0 ? footerData.IndicatoravgkpmrNilai.score : 'Tidak ada data',
    'Avg Nilai :',
    footerData.activeCount > 0 ? Number(footerData.avgKpmrNilai.toFixed(2)) : '-'
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 2. Set Merges
  ws['!merges'] = [
    // Info title merges
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    // Header row span merges
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // Jenis Risiko
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // BHz
    // Header col span merges
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } }, // INHERENT
    { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } }  // KPMR
  ];

  // 3. Set Styles
  const totalRows = wsData.length;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < 8; c++) {
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
          fill: { patternType: 'solid', fgColor: { rgb: COLORS.HEADER_BG } },
          font: { color: { rgb: COLORS.HEADER_FG }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: borderThin
        };
        ws[cellRef] = cell;
        continue;
      }

      // Header row 2
      if (r === 4) {
        const bg = c >= 2 ? COLORS.HEADER2_BG : COLORS.HEADER_BG;
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: bg } },
          font: { color: { rgb: COLORS.HEADER_FG }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: borderThin
        };
        ws[cellRef] = cell;
        continue;
      }

      // Footer styling
      if (r === footerRowIndex) {
        if (c === 0 || c === 3 || c === 6) {
          cell.s = {
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.FOOTER_BG } },
            font: { color: { rgb: COLORS.FOOTER_FG }, bold: true },
            alignment: { horizontal: c === 0 ? 'left' : 'right', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 1 || c === 4 || c === 7) {
          cell.s = {
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.FOOTER_BG } },
            font: { color: { rgb: COLORS.FOOTER_FG }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 2) {
          // Inherent avg indicator cell
          cell.s = {
            ...getStyleForRating(footerData.IndicatoravgInherentNilai, footerData.activeCount > 0),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        } else if (c === 5) {
          // KPMR avg indicator cell
          cell.s = {
            ...getStyleForRating(footerData.IndicatoravgkpmrNilai, footerData.activeCount > 0),
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderThin
          };
        }
        ws[cellRef] = cell;
        continue;
      }

      // Data Rows
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

      // Format rating indicator cells
      const itemIndex = r - dataStartRow;
      const item = tableData[itemIndex];

      if (c === 2) {
        cell.s = {
          ...getStyleForRating(item.inherentIndicator, item.hasInherent),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      } else if (c === 5) {
        cell.s = {
          ...getStyleForRating(item.kpmrIndicator, item.hasKpmr),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin
        };
      }

      ws[cellRef] = cell;
    }
  }

  // Set widths
  ws['!cols'] = [
    { wch: 32 }, // Jenis Risiko
    { wch: 10 }, // BHz
    { wch: 18 }, // Inherent Indicator
    { wch: 10 }, // Inherent Skor
    { wch: 10 }, // Inherent Nilai
    { wch: 18 }, // KPMR Indicator
    { wch: 10 }, // KPMR Skor
    { wch: 10 }  // KPMR Nilai
  ];

  // Append sheet and write
  XLSX.utils.book_append_sheet(wb, ws, 'Peringkat Komposit');
  XLSX.writeFile(wb, `OJK_PERINGKAT_KOMPOSIT_${year}_Q${quarter}.xlsx`);
}
