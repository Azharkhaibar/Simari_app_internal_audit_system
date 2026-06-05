// client/src/features/Dashboard/pages/RiskProfile/utils/exportExcel.js
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

const withFill = (s, hex) => ({
  ...(s || {}),
  fill: { patternType: 'solid', fgColor: { rgb: hexToARGB(hex) } },
});

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
  headerWeighted: '#d9d9d9',
  headerLow: '#b7d7a8',
  headerLTM: '#c9daf8',
  headerMod: '#fff2cc',
  headerMTH: '#f9cb9c',
  headerHigh: '#e06666',
  blueFill: '#cfe2f3',
  lightGreen: '#d9ead3',
  darkGreen: '#38761d',
  oliveAccent40: '#c4d79b',
  yellow: '#fff2cc',
  orange: '#f9cb9c',
  red: '#e06666',
  grey: '#d9d9d9',
  subBg: '#d9eefb',
  summaryBlue: '#0b3861',
  summaryGreen: '#8fce00',
};

/**
 * Export tabel Hukum ke Excel.
 *
 * @param {Array} filteredRows
 * @param {number|string} viewYear
 * @param {string} viewQuarter
 * @param {{
 *   sheetName?: string,
 *   filePrefix?: string,
 *   summaryLabel?: string,
 *   groupBySection?: boolean,
 * }} options
 */
export function exportHukumToExcel(filteredRows, viewYear, viewQuarter, options = {}) {
  const { sheetName = `${viewYear}-${viewQuarter}`, filePrefix = 'FORM-HUKUM', summaryLabel = 'Summary', groupBySection = false } = options;

  const headers1 = ['No', 'Bobot', 'Parameter atau Indikator', '', '', 'Bobot', 'Sumber Risiko', 'Dampak', 'Low', '', 'Moderate', 'Moderate to High', 'High', 'Hasil', 'Peringkat', 'Weighted', 'Keterangan'];
  const headers2 = ['', '', 'Section', '', 'Indikator', '', '', '', '', '', '', '', '', '', '', '', ''];

  const dataRows = [];
  const mainRowIndexes = [];
  const mainRowMeta = [];
  let totalWeightedExport = 0;

  const sorted = (filteredRows || []).slice().sort((a, b) => {
    const noCmp = String(a.no || '').localeCompare(String(b.no || ''), undefined, {
      numeric: true,
    });
    if (noCmp !== 0) return noCmp;
    return String(a.subNo || '').localeCompare(String(b.subNo || ''), undefined, { numeric: true });
  });

  sorted.forEach((r) => {
    const weightedVal = r.weighted === '' || r.weighted == null ? '' : Number(r.weighted);
    if (weightedVal !== '') totalWeightedExport += Number(weightedVal);

    const mainRowIndex = dataRows.length;
    mainRowIndexes.push(mainRowIndex);
    mainRowMeta.push({
      rowIndex: mainRowIndex,
      key: `${r.no}|||${r.sectionLabel}`,
    });

    dataRows.push([
      r.no,
      r.bobotSection,
      r.sectionLabel,
      r.subNo || '',
      r.indikator,
      r.bobotIndikator,
      r.sumberRisiko,
      r.dampak,
      r.low,
      r.lowToModerate,
      r.moderate,
      r.moderateToHigh,
      r.high,
      typeof r.hasil === 'number' ? r.hasil : r.hasil === '' ? '' : Number(r.hasil),
      r.peringkat ?? '',
      weightedVal,
      r.keterangan,
    ]);

    dataRows.push(['', '', '', '', String(r.numeratorLabel || 'Pembilang'), '', '', '', '', '', '', '', '', r.numeratorValue === '' || r.numeratorValue == null ? '' : Number(r.numeratorValue || 0), '', '', '', '']);

    dataRows.push(['', '', '', '', String(r.denominatorLabel || 'Penyebut'), '', '', '', '', '', '', '', '', r.denominatorValue === '' || r.denominatorValue == null ? '' : Number(r.denominatorValue || 0), '', '', '', '']);
  });

  if (dataRows.length > 0) dataRows.push(new Array(17).fill(''));

  const summaryRowIndexRel = dataRows.length;
  const summaryRow = new Array(17).fill('');
  summaryRow[13] = summaryLabel;
  summaryRow[15] = Number(totalWeightedExport.toFixed(2));
  dataRows.push(summaryRow);

  const ws = XLSX.utils.aoa_to_sheet([headers1, headers2, ...dataRows]);

  ws['!cols'] = [6, 10, 24, 10, 40, 10, 30, 28, 14, 18, 14, 18, 14, 12, 12, 12, 24].map((wch) => ({ wch }));

  ws['!merges'] = [
    { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } },
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
    { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
    { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },
    { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
    { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
    { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } },
    { s: { r: 0, c: 13 }, e: { r: 1, c: 13 } },
    { s: { r: 0, c: 14 }, e: { r: 1, c: 14 } },
    { s: { r: 0, c: 15 }, e: { r: 1, c: 15 } },
    { s: { r: 0, c: 16 }, e: { r: 1, c: 16 } },
  ];
  ws['!freeze'] = { xSplit: 0, ySplit: 2 };

  const firstDataRow = 2;
  const merges = ws['!merges'] || [];

  if (groupBySection) {
    if (mainRowMeta.length > 0) {
      let groupStart = 0;
      let currentKey = mainRowMeta[0].key;

      for (let i = 1; i <= mainRowMeta.length; i++) {
        const meta = mainRowMeta[i];
        const key = meta ? meta.key : null;

        if (key !== currentKey) {
          const startRowIndex = mainRowMeta[groupStart].rowIndex;
          const endRowIndex = mainRowMeta[i - 1].rowIndex;

          const rStart = firstDataRow + startRowIndex;
          const rEnd = firstDataRow + endRowIndex + 2;

          merges.push({ s: { r: rStart, c: 0 }, e: { r: rEnd, c: 0 } });
          merges.push({ s: { r: rStart, c: 1 }, e: { r: rEnd, c: 1 } });
          merges.push({ s: { r: rStart, c: 2 }, e: { r: rEnd, c: 2 } });

          groupStart = i;
          currentKey = key;
        }
      }
    }
  } else {
    mainRowIndexes.forEach((idx) => {
      const rMain = firstDataRow + idx;
      merges.push({ s: { r: rMain, c: 0 }, e: { r: rMain + 2, c: 0 } });
      merges.push({ s: { r: rMain, c: 1 }, e: { r: rMain + 2, c: 1 } });
      merges.push({ s: { r: rMain, c: 2 }, e: { r: rMain + 2, c: 2 } });
      merges.push({ s: { r: rMain, c: 16 }, e: { r: rMain + 2, c: 16 } });
    });
  }

  const summaryRowAbs = firstDataRow + summaryRowIndexRel;
  merges.push({
    s: { r: summaryRowAbs, c: 13 },
    e: { r: summaryRowAbs, c: 14 },
  });

  ws['!merges'] = merges;

  const H = COLORS.headerDarkBlue;
  [0, 1, 5, 6, 7, 13, 14, 16].forEach((c) => setStyle(ws, 0, c, headerStyle(H)));
  [2, 3, 4].forEach((c) => setStyle(ws, 0, c, headerStyle(H)));
  setStyle(ws, 0, 8, headerStyle(COLORS.headerLow, '#000'));
  setStyle(ws, 0, 9, headerStyle(COLORS.headerLTM, '#000'));
  setStyle(ws, 0, 10, headerStyle(COLORS.headerMod, '#000'));
  setStyle(ws, 0, 11, headerStyle(COLORS.headerMTH, '#000'));
  setStyle(ws, 0, 12, headerStyle(COLORS.headerHigh, '#fff'));
  setStyle(ws, 0, 15, headerStyle(COLORS.headerWeighted, '#000'));
  [2, 3, 4].forEach((c) => setStyle(ws, 1, c, headerStyle(H)));

  const lastDataRow = firstDataRow + dataRows.length - 1;
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    const isPembilang = (r - firstDataRow) % 3 === 1;
    const isPenyebut = (r - firstDataRow) % 3 === 2;

    for (let c = 0; c <= 16; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;

      cell.s = { ...(cell.s || {}), ...bodyStyle };
      const hasValue = !(cell.v === '' || cell.v == null);

      if ([0, 1, 5, 6, 7].includes(c) && hasValue) {
        cell.s = withFill(cell.s, COLORS.blueFill);
      }

      if (c >= 8 && c <= 12) {
        if (hasValue) cell.s = withFill(cell.s, COLORS.lightGreen);
        cell.s.alignment = {
          ...(cell.s.alignment || {}),
          horizontal: 'center',
        };
      }

      if (c === 13) {
        cell.s.alignment = {
          ...(cell.s.alignment || {}),
          horizontal: 'center',
        };
        if (isPembilang || isPenyebut) {
          if (hasValue) {
            cell.t = 'n';
            cell.z = '0.00';
            cell.s = withFill(cell.s, COLORS.oliveAccent40);
            cell.s.font = {
              ...(cell.s.font || {}),
              color: { rgb: hexToARGB('#000000') },
            };
          }
        } else if (hasValue) {
          cell.t = 'n';
          cell.z = '0.00%';
          cell.s = withFill(cell.s, COLORS.grey);
        }
      }

      if (c === 14) {
        cell.s.alignment = {
          ...(cell.s.alignment || {}),
          horizontal: 'center',
        };
        if (hasValue) {
          const v = Number(cell.v);
          let bg = null;
          let fg = '#000';
          if (v === 1) {
            bg = COLORS.darkGreen;
            fg = '#fff';
          } else if (v === 2) {
            bg = COLORS.lightGreen;
          } else if (v === 3) {
            bg = COLORS.yellow;
          } else if (v === 4) {
            bg = COLORS.orange;
          } else if (v === 5) {
            bg = COLORS.red;
            fg = '#fff';
          }
          if (bg) {
            cell.s = withFill(cell.s, bg);
            cell.s.font = {
              ...(cell.s.font || {}),
              bold: true,
              color: { rgb: hexToARGB(fg) },
            };
          }
        }
      }

      if (c === 15) {
        cell.s.alignment = {
          ...(cell.s.alignment || {}),
          horizontal: 'center',
        };
        if (hasValue) {
          cell.t = 'n';
          cell.z = '0.00';
          cell.s = withFill(cell.s, COLORS.grey);
        }
      }

      if (c === 16) {
        cell.s.alignment = {
          ...(cell.s.alignment || {}),
          horizontal: 'center',
        };
      }
    }

    const offset = (r - firstDataRow) % 3;
    if (offset === 0) {
      [2, 3, 4].forEach((c) => {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (cell && cell.v !== '' && cell.v != null) {
          cell.s = withFill(cell.s, COLORS.subBg);
        }
      });
    }
  }

  for (let c = 13; c <= 14; c++) {
    setStyle(ws, summaryRowAbs, c, {
      ...bodyStyle,
      ...headerStyle(COLORS.summaryBlue, '#FFFFFF'),
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
    });
  }
  setStyle(ws, summaryRowAbs, 15, {
    ...bodyStyle,
    fill: {
      patternType: 'solid',
      fgColor: { rgb: hexToARGB(COLORS.summaryGreen) },
    },
    font: { bold: true, color: { rgb: hexToARGB('#FFFFFF') } },
    alignment: {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true,
    },
    border: borderThin,
    numFmt: '0.00',
  });
  const valAddr = XLSX.utils.encode_cell({ r: summaryRowAbs, c: 15 });
  if (ws[valAddr]) {
    ws[valAddr].t = 'n';
    ws[valAddr].z = '0.00';
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filePrefix}-${viewYear}-${viewQuarter}.xlsx`);
}
