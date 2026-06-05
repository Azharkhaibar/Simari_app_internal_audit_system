// client/src/features/Dashboard/pages/RiskProfile/utils/exportRekapData.js
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
  top: { style: 'thin', color: { rgb: 'FFBFBFBF' } },
  bottom: { style: 'thin', color: { rgb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { rgb: 'FFBFBFBF' } },
  right: { style: 'thin', color: { rgb: 'FFBFBFBF' } },
};

const headerStyle = (bg, fg = '#FFFFFF') => ({
  fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(bg) } },
  font: { bold: true, color: { rgb: hexToARGB(fg) } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: borderThin,
});

const bodyStyle = {
  alignment: { vertical: 'center', wrapText: true },
  border: borderThin,
};

const setStyle = (ws, r, c, style) => {
  const addr = XLSX.utils.encode_cell({ r, c });
  if (!ws[addr]) ws[addr] = { t: 's', v: '' };
  ws[addr].s = { ...(ws[addr].s || {}), ...style };
};

const COLORS = {
  headerDarkBlue: '#1f4e79',
  blueFill: '#cfe2f3',
  blueFillLight: '#e6f4ff',
  white: '#ffffff',
};

const QUARTER_LABEL = {
  Q1: 'MAR',
  Q2: 'JUN',
  Q3: 'SEP',
  Q4: 'DES',
};

/**
 * Helper: Parse value to clean Number for Excel
 */
const toNumberValue = (val) => {
  if (val === '' || val == null) return '';
  if (typeof val === 'number') {
    return isNaN(val) ? '' : val;
  }

  let strVal = String(val).trim();
  if (strVal.indexOf(',') !== -1 && strVal.lastIndexOf(',') > strVal.lastIndexOf('.')) {
    strVal = strVal.replace(/\./g, '').replace(',', '.');
  } else {
    strVal = strVal.replace(/,/g, '');
  }

  const num = parseFloat(strVal);
  return isNaN(num) ? '' : num;
};

const normalizeHasilDisplay = (hasilRaw, isPercent) => {
  if (hasilRaw === '' || hasilRaw == null) return '';
  const num = toNumberValue(hasilRaw);
  if (num === '') return '';
  if (isPercent) {
    return num;
  }
  return num;
};

/**
 * Helper untuk extract data dengan aman dari berbagai struktur
 */
const extractValue = (obj, keys) => {
  if (!obj) return '';
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
    const lowerKey = key.toLowerCase();
    const matchKey = Object.keys(obj).find((k) => k.toLowerCase() === lowerKey);
    if (matchKey && obj[matchKey] !== undefined && obj[matchKey] !== null && obj[matchKey] !== '') {
      return obj[matchKey];
    }
  }
  return '';
};

export function exportRekapDataToExcel(visibleGroups, viewYear, viewQuarter, mode = 'triwulan', formatOptions = { hasilFormat: 'smart', pemisahFormat: 'indonesia' }, selectedQuarters = []) {
  console.log('%c=== REKAPDATA EXPORT START ===', 'color: #9333EA; font-weight: bold; font-size: 14px');
  console.log('📅 Parameters:', { viewYear, viewQuarter, mode });

  const SOURCE_ORDER = ['INVESTASI', 'PASAR', 'LIKUIDITAS', 'OPERASIONAL', 'HUKUM', 'STRATEJIK', 'KEPATUHAN', 'REPUTASI'];
  const QUARTER_ORDER = ['Q1', 'Q2', 'Q3', 'Q4'];

  const bySource = {};
  visibleGroups.forEach((g) => {
    if (!bySource[g.source]) bySource[g.source] = [];
    bySource[g.source].push(g);
  });

  const sortedSources = SOURCE_ORDER.filter((s) => bySource[s]);

  let quartersToShow;
  if (mode === 'triwulan') {
    quartersToShow = [viewQuarter];
  } else {
    quartersToShow = selectedQuarters && selectedQuarters.length > 0 ? QUARTER_ORDER.filter((q) => selectedQuarters.includes(q)) : QUARTER_ORDER;
  }

  const dataRows = [];
  const rowTypes = [];
  const merges = [];
  let currentRow = 0;

  sortedSources.forEach((source) => {
    const indicators = bySource[source];
    const sourceStartRow = currentRow;

    const bySection = {};
    indicators.forEach((indicator) => {
      if (!bySection[indicator.sectionName]) bySection[indicator.sectionName] = [];
      bySection[indicator.sectionName].push(indicator);
    });

    let isFirstIndicatorForSource = true;

    Object.entries(bySection).forEach(([sectionName, sectionIndicators]) => {
      const sectionStartRow = currentRow;

      const totalRowsInSection = sectionIndicators.reduce((sum, indicator) => {
        const row = indicator.mainRow || indicator.raw || indicator;
        const m = row.mode || indicator.mode || 'RASIO';
        if (m === 'TEKS' || m === 'KUALITATIF') return sum + 1;
        if (m === 'NILAI_TUNGGAL' || m === 'NILAI_TUNGGAL_PENY') return sum + 2;
        return sum + 3;
      }, 0);

      if (totalRowsInSection > 0) {
        merges.push({ s: { r: sectionStartRow + 1, c: 1 }, e: { r: sectionStartRow + totalRowsInSection - 1 + 1, c: 1 } });
      }

      sectionIndicators.forEach((indicator) => {
        const isFirstForSource = isFirstIndicatorForSource;
        if (isFirstIndicatorForSource) isFirstIndicatorForSource = false;

        const mainData = indicator.mainRow || indicator.raw || indicator;
        const getVal = (keys) => extractValue(mainData, keys);

        const indicatorMode = getVal(['mode']) || indicator.mode || 'RASIO';
        const isPercent = !!getVal(['isPercent']);

        // 🔹 CRITICAL FIX: Extract labels ONCE per indicator (not per quarter)
        const pembilangLabel = getVal(['numeratorLabel', 'pembilangLabel']) || 'Pembilang';
        const penyebutLabel = getVal(['denominatorLabel', 'penyebutLabel']) || 'Penyebut';

        console.log(`[EXPORT LABELS] ${indicator.indikatorLabel}: pembilang="${pembilangLabel}", penyebut="${penyebutLabel}"`);

        // === ROW 1: HASIL ===
        const hasilRow = [isFirstForSource ? source : '', sectionName, indicator.indikatorLabel, indicatorMode];

        quartersToShow.forEach((q) => {
          const qData = mode === 'tahunan' && indicator.quarters ? indicator.quarters[q] || {} : mainData;
          const qGetVal = (keys) => extractValue(qData, keys);

          if (indicatorMode === 'TEKS' || indicatorMode === 'KUALITATIF') {
            hasilRow.push(qGetVal(['hasilText', 'hasil']) || '-');
          } else {
            const rawHasil = qGetVal(['hasil', 'result', 'value']);
            hasilRow.push(normalizeHasilDisplay(rawHasil, isPercent));
          }
        });

        dataRows.push(hasilRow);
        rowTypes.push('hasil');
        currentRow++;

        // === ROW 2: PEMBILANG (RASIO) ===
        if (indicatorMode === 'RASIO') {
          // 🔹 FIX: Use extracted label (not generic "Pembilang")
          const pembRow = ['', '', pembilangLabel, '']; // kolom Mode dikosongkan

          quartersToShow.forEach((q) => {
            const qData = mode === 'tahunan' && indicator.quarters ? indicator.quarters[q] || {} : mainData;
            const qGetVal = (keys) => extractValue(qData, keys);
            const val = qGetVal(['numeratorValue', 'pembilangValue', 'pembilang', 'numerator']);
            pembRow.push(toNumberValue(val));
          });

          dataRows.push(pembRow);
          rowTypes.push('pembilang');
          currentRow++;
        }

        // === ROW 3: PENYEBUT (RASIO & NILAI_TUNGGAL) ===
        if (indicatorMode === 'RASIO' || indicatorMode === 'NILAI_TUNGGAL' || indicatorMode === 'NILAI_TUNGGAL_PENY') {
          // 🔹 FIX: Use extracted label (not generic "Penyebut")
          const penyRow = ['', '', penyebutLabel, '']; // kolom Mode dikosongkan

          quartersToShow.forEach((q) => {
            const qData = mode === 'tahunan' && indicator.quarters ? indicator.quarters[q] || {} : mainData;
            const qGetVal = (keys) => extractValue(qData, keys);
            const val = qGetVal(['denominatorValue', 'penyebutValue', 'penyebut', 'denominator']);
            penyRow.push(toNumberValue(val));
          });

          dataRows.push(penyRow);
          rowTypes.push('penyebut');
          currentRow++;
        }
      });
    });

    const totalRowsForSource = indicators.reduce((sum, indicator) => {
      const row = indicator.mainRow || indicator.raw || indicator;
      const m = row.mode || indicator.mode || 'RASIO';
      if (m === 'TEKS' || m === 'KUALITATIF') return sum + 1;
      if (m === 'NILAI_TUNGGAL' || m === 'NILAI_TUNGGAL_PENY') return sum + 2;
      return sum + 3;
    }, 0);

    if (totalRowsForSource > 0) {
      merges.push({ s: { r: sourceStartRow + 1, c: 0 }, e: { r: sourceStartRow + totalRowsForSource - 1 + 1, c: 0 } });
    }
  });

  // Build headers
  const headerRow1 = ['Source', 'Section', 'Indikator', 'Mode'];
  quartersToShow.forEach((q) => headerRow1.push(`${QUARTER_LABEL[q]} ${viewYear}`));

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headerRow1, ...dataRows]);

  // Column widths
  const numCols = 4 + quartersToShow.length;
  ws['!cols'] = [
    { wch: 12 }, // Source
    { wch: 35 }, // Section
    { wch: 50 }, // Indikator (untuk HASIL) atau Label (untuk Pembilang/Penyebut)
    { wch: 15 }, // Mode
  ];
  for (let i = 4; i < numCols; i++) ws['!cols'][i] = { wch: 18 };

  ws['!merges'] = merges;
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Style header
  for (let c = 0; c < headerRow1.length; c++) setStyle(ws, 0, c, headerStyle(COLORS.headerDarkBlue));

  // Style body
  const headerRowCount = 1;
  const totalRows = dataRows.length;

  for (let r = headerRowCount; r < totalRows + headerRowCount; r++) {
    const rowIndex = r - headerRowCount;
    const rowType = rowTypes[rowIndex];

    for (let c = 0; c < numCols; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;

      cell.s = { ...(cell.s || {}), ...bodyStyle };

      // Style Source
      if (c === 0) {
        if (cell.v) {
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.blueFillLight) } };
          cell.s.font = { bold: true };
          cell.s.alignment = { horizontal: 'center', vertical: 'center', textRotation: 90 };
        } else if (rowType === 'hasil') {
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.blueFill) } };
        }
      }
      // Style Section
      else if (c === 1) {
        if (cell.v) {
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.blueFillLight) } };
          cell.s.font = { bold: true };
          cell.s.alignment = { horizontal: 'left', vertical: 'center' };
        } else if (rowType === 'hasil') {
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.blueFill) } };
        }
      }
      // Style Indikator/Label column
      else if (c === 2) {
        cell.s.alignment = { horizontal: 'left', vertical: 'center' };
        if (rowType === 'hasil') {
          cell.s.font = { bold: true };
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.blueFill) } };
        } else {
          // Pembilang/Penyebut rows - smaller font for labels
          cell.s.font = { size: 10, color: { rgb: 'FF666666' } };
        }
      }
      // Style Mode
      else if (c === 3) {
        cell.s.alignment = { horizontal: 'center', vertical: 'center' };
        if (rowType === 'hasil' && cell.v) {
          cell.s.font = { bold: true };
          const mv = String(cell.v).toUpperCase();
          if (mv === 'RASIO') cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB('#E3F2FD') } };
          else if (mv.includes('NILAI_TUNGGAL')) cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB('#FFF3E0') } };
          else if (mv === 'KUALITATIF' || mv === 'TEKS') cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB('#E8F5E9') } };
        }
      }
      // Style Values (Numbers)
      else {
        cell.s.alignment = { horizontal: 'right', vertical: 'center' };

        if (rowType === 'hasil') {
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.blueFill) } };
        } else {
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: hexToARGB(COLORS.white) } };
        }

        if (typeof cell.v === 'number') {
          cell.t = 'n';
          cell.z = '#,##0.00';
        } else if (cell.v !== '' && cell.v != null) {
          cell.t = 's';
        }
      }
    }
  }

  const periodeLabel = mode === 'triwulan' ? `${QUARTER_LABEL[viewQuarter]}-${viewYear}` : `${viewYear}-Tahunan`;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Data');
  XLSX.writeFile(wb, `REKAPDATA-${periodeLabel}.xlsx`);

  console.log('%c=== EXPORT COMPLETE ===', 'color: #10B981; font-weight: bold');
}
