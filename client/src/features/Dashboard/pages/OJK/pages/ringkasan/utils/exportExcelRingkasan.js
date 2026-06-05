import * as XLSX from 'xlsx-js-style';

/**
 * Risk indicator label berdasarkan peringkat integer 1-5
 * Konsisten dengan getRiskIndicator di ringkasan.utils.js
 */
const getRiskIndicatorByPeringkat = (peringkat) => {
  if (peringkat === 1) return 'Low';
  if (peringkat === 2) return 'Low To Moderate';
  if (peringkat === 3) return 'Moderate';
  if (peringkat === 4) return 'Moderate To High';
  if (peringkat === 5) return 'High';
  return '-';
};

/**
 * Warna fill Excel berdasarkan peringkat integer 1-5
 * Konsisten dengan getRiskColor di ringkasan.utils.js
 */
const getRiskStyleByPeringkat = (peringkat) => {
  if (peringkat === 1) return { bg: '2ECC71', fg: 'FFFFFF' }; // Low        – Hijau
  if (peringkat === 2) return { bg: 'A3E635', fg: '000000' }; // Low-Mod    – Hijau muda
  if (peringkat === 3) return { bg: 'FACC15', fg: '000000' }; // Moderate   – Kuning
  if (peringkat === 4) return { bg: 'F97316', fg: '000000' }; // Mod-High   – Orange
  if (peringkat === 5) return { bg: 'FF0000', fg: 'FFFFFF' }; // High       – Merah
  return null;
};

/** Format percent: 25 → "25%" */
const fmtPercent = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  return `${num}%`;
};

/** Format angka: desimal 2 digit atau integer */
const fmtNumber = (val) => {
  if (val === null || val === undefined) return '-';
  const num = Number(val);
  if (isNaN(num) || num === 0) return '-';
  return num % 1 !== 0 ? Number(num.toFixed(2)) : num;
};

/**
 * Export Ringkasan Risk Assessment to Excel
 *
 * @param {Object} params
 * @param {Array}  params.summaryData
 * @param {number} params.year
 * @param {number|string} params.quarter
 * @param {string} params.search
 */
export function exportRingkasanToExcel({ summaryData = [], year, quarter, search = '' }) {
  const wb = XLSX.utils.book_new();

  // ── Warna ─────────────────────────────────────────────────────────
  const COLORS = {
    HEADER1_BG: '1F4E79',  // Biru tua
    HEADER2_BG: '334155',  // Slate
    HEADER_FG:  'FFFFFF',
    BORDER:     'D1D5DB',
    CATEGORY_BG:'E8F5FA',  // Biru muda (kolom kategori)
    ALT_BG:     'F9FAFB',  // Abu zebra
  };

  const borderThin = {
    top:    { style: 'thin', color: { rgb: COLORS.BORDER } },
    bottom: { style: 'thin', color: { rgb: COLORS.BORDER } },
    left:   { style: 'thin', color: { rgb: COLORS.BORDER } },
    right:  { style: 'thin', color: { rgb: COLORS.BORDER } },
  };

  // ── AOA data ──────────────────────────────────────────────────────
  const wsData = [
    ['RINGKASAN RISK ASSESSMENT OJK'],                                              // row 0
    [`Periode: Tahun ${year} - Triwulan Q${quarter}`],                             // row 1
    [],                                                                             // row 2
    ['No', 'Jenis Risiko', 'Bobot', 'Parameter', 'Indeks', 'Indikator/Risiko Inheren', 'Hasil Risk Assessment', '', '', ''], // row 3
    ['', '', '', '', '', '', 'Active Quarter', '', '', ''],                         // row 4
    ['', '', '', '', '', '', 'Bobot', 'Hasil Assessment', 'Risk Level', 'Risk Indicator'], // row 5
  ];

  const merges = [
    { s: { r: 3, c: 0 }, e: { r: 5, c: 0 } },
    { s: { r: 3, c: 1 }, e: { r: 5, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 5, c: 2 } },
    { s: { r: 3, c: 3 }, e: { r: 5, c: 3 } },
    { s: { r: 3, c: 4 }, e: { r: 5, c: 4 } },
    { s: { r: 3, c: 5 }, e: { r: 5, c: 5 } },
    { s: { r: 3, c: 6 }, e: { r: 3, c: 9 } },
    { s: { r: 4, c: 6 }, e: { r: 4, c: 9 } },
  ];

  const searchLower   = (search || '').toLowerCase().trim();
  const DATA_START_ROW = wsData.length; // = 6
  let currentRowIndex  = DATA_START_ROW;

  /**
   * Map: rowIndex (Excel) → peringkat (1–5 | null)
   * Digunakan saat styling agar warna berdasarkan peringkat, bukan nilai weighted.
   */
  const peringkatMap = {};

  // ── Build baris data ──────────────────────────────────────────────
  summaryData.forEach((pageData) => {
    const { no, categoryLabel, categoryCode, rows: pageRows } = pageData;

    if (!Array.isArray(pageRows) || pageRows.length === 0) {
      wsData.push([no, `Risiko ${categoryLabel}`, '-', 'Data tidak ditemukan', '-', '-', '-', '-', '-', '-']);
      peringkatMap[currentRowIndex] = null;
      currentRowIndex++;
      return;
    }

    // ── Filter search ─────────────────────────────────────────────
    const matchedRows = [];
    pageRows.forEach((param, paramIndex) => {
      const paramName   = param.judul  || 'Parameter';
      const paramNumber = param.nomor  || String(paramIndex + 1);

      if (!param.nilaiList || param.nilaiList.length === 0) {
        const indeks = `R.${categoryCode}.${paramNumber}`;
        const ok =
          !searchLower ||
          categoryLabel.toLowerCase().includes(searchLower) ||
          paramName.toLowerCase().includes(searchLower) ||
          indeks.toLowerCase().includes(searchLower);
        if (ok) matchedRows.push({ type: 'empty-param', param, paramName, indeks });
        return;
      }

      param.nilaiList.forEach((item) => {
        const titleText = item?.judul?.text || '';
        const indeks    = `R.${categoryCode}.${item?.nomor || paramNumber}`;
        const ok =
          !searchLower ||
          titleText.toLowerCase().includes(searchLower) ||
          paramName.toLowerCase().includes(searchLower) ||
          categoryLabel.toLowerCase().includes(searchLower) ||
          indeks.toLowerCase().includes(searchLower);
        if (ok) matchedRows.push({ type: 'data', param, paramName, item, indeks });
      });
    });

    if (matchedRows.length === 0) return;

    // ── Merge No & Jenis Risiko ───────────────────────────────────
    merges.push(
      { s: { r: currentRowIndex, c: 0 }, e: { r: currentRowIndex + matchedRows.length - 1, c: 0 } },
      { s: { r: currentRowIndex, c: 1 }, e: { r: currentRowIndex + matchedRows.length - 1, c: 1 } },
    );

    // ── Merge Bobot & Parameter per kelompok param ────────────────
    let paramStartRow  = currentRowIndex;
    let currentParamId = null;
    let paramCount     = 0;

    const flushParamMerge = () => {
      if (paramCount > 1) {
        merges.push(
          { s: { r: paramStartRow, c: 2 }, e: { r: paramStartRow + paramCount - 1, c: 2 } },
          { s: { r: paramStartRow, c: 3 }, e: { r: paramStartRow + paramCount - 1, c: 3 } },
        );
      }
    };

    matchedRows.forEach((row, rowIdx) => {
      const paramId = row.param.id ?? row.param.judul;

      if (currentParamId === null) {
        currentParamId = paramId;
        paramCount     = 1;
      } else if (currentParamId === paramId) {
        paramCount++;
      } else {
        flushParamMerge();
        paramStartRow  = currentRowIndex + rowIdx;
        currentParamId = paramId;
        paramCount     = 1;
      }

      // ── Isi baris ───────────────────────────────────────────────
      const excelRow = currentRowIndex + rowIdx;

      if (row.type === 'empty-param') {
        wsData.push([no, `Risiko ${categoryLabel}`, fmtPercent(row.param.bobot), row.paramName, row.indeks, '-', '-', '-', '-', '-']);
        peringkatMap[excelRow] = null;
        return;
      }

      const { item, indeks } = row;
      const derived = item?.derived || {};

      // peringkat: integer 1-5 dari computeDerived
      const peringkat = derived.peringkat ?? null;

      // hasilAssessment: sama persis dengan UI (hasilDisplay adalah string seperti "2.50%")
      const hasilRaw  = derived.hasilDisplay ?? derived.weighted ?? 0;
      const hasilCell = (() => {
        if (hasilRaw === null || hasilRaw === undefined || hasilRaw === 0 || hasilRaw === '') return '-';
        if (typeof hasilRaw === 'string' && hasilRaw.trim() !== '') return hasilRaw;
        const num = Number(hasilRaw);
        if (isNaN(num) || num === 0) return '-';
        return num % 1 !== 0 ? Number(num.toFixed(2)) : num;
      })();

      // riskLevel display: nilai weighted (kontribusi bobot) sebagai angka
      const weighted         = derived.weighted ?? null;
      const riskLevelDisplay = weighted !== null && weighted !== 0 ? Number(weighted.toFixed(2)) : '-';

      // riskIndicator label: berdasarkan peringkat integer
      const riskIndicator    = peringkat !== null ? getRiskIndicatorByPeringkat(peringkat) : '-';

      // Simpan peringkat untuk styling nanti
      peringkatMap[excelRow] = peringkat;

      wsData.push([
        no,
        `Risiko ${categoryLabel}`,
        fmtPercent(row.param.bobot),
        row.paramName,
        indeks,
        item?.judul?.text || '-',
        fmtPercent(item?.bobot),
        hasilCell,
        riskLevelDisplay,
        riskIndicator,
      ]);
    });

    flushParamMerge();
    currentRowIndex += matchedRows.length;
  });

  // ── Buat worksheet ────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!merges'] = merges;

  // ── Styling ───────────────────────────────────────────────────────
  const totalRows = wsData.length;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < 10; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });

      if (r === 0) {
        if (ws[cellRef]) ws[cellRef].s = { font: { bold: true, size: 16, color: { rgb: COLORS.HEADER1_BG } }, alignment: { horizontal: 'left' } };
        continue;
      }
      if (r === 1) {
        if (ws[cellRef]) ws[cellRef].s = { font: { italic: true, size: 11, color: { rgb: '4B5563' } }, alignment: { horizontal: 'left' } };
        continue;
      }
      if (r === 2) continue;

      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      const cell = ws[cellRef];

      if (r === 3) {
        cell.s = { fill: { patternType: 'solid', fgColor: { rgb: COLORS.HEADER1_BG } }, font: { color: { rgb: COLORS.HEADER_FG }, bold: true }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: borderThin };
        ws[cellRef] = cell;
        continue;
      }
      if (r === 4 || r === 5) {
        const bg = c >= 6 ? COLORS.HEADER2_BG : COLORS.HEADER1_BG;
        cell.s = { fill: { patternType: 'solid', fgColor: { rgb: bg } }, font: { color: { rgb: COLORS.HEADER_FG }, bold: true }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: borderThin };
        ws[cellRef] = cell;
        continue;
      }

      // ── Baris data ──────────────────────────────────────────────
      const isAltRow  = (r - DATA_START_ROW) % 2 === 1;
      const defaultBg = isAltRow ? COLORS.ALT_BG : 'FFFFFF';

      cell.s = {
        fill:      { patternType: 'solid', fgColor: { rgb: defaultBg } },
        alignment: { vertical: 'center', wrapText: true },
        border:    borderThin,
      };

      // Center: No(0), Bobot param(2), Indeks(4), Bobot indikator(6), Hasil Assessment(7)
      if ([0, 2, 4, 6, 7].includes(c)) {
        cell.s.alignment.horizontal = 'center';
      }

      // Background biru muda untuk kolom kategori (0–4)
      if (c <= 4) {
        cell.s.fill = { patternType: 'solid', fgColor: { rgb: COLORS.CATEGORY_BG } };
      }

      // ── Kolom Risk Level (8) & Risk Indicator (9) ──────────────
      // Warna berdasarkan peringkat integer 1-5, BUKAN nilai weighted
      if (c === 8 || c === 9) {
        const peringkat   = peringkatMap[r] ?? null;
        const riskStyle   = peringkat !== null ? getRiskStyleByPeringkat(peringkat) : null;

        if (riskStyle) {
          cell.s = {
            fill:      { patternType: 'solid', fgColor: { rgb: riskStyle.bg } },
            font:      { color: { rgb: riskStyle.fg }, bold: true },
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
    { wch: 10 }, // Bobot param
    { wch: 30 }, // Parameter
    { wch: 16 }, // Indeks
    { wch: 40 }, // Indikator/Risiko Inheren
    { wch: 10 }, // Bobot indikator
    { wch: 20 }, // Hasil Assessment
    { wch: 15 }, // Risk Level
    { wch: 22 }, // Risk Indicator
  ];

  // ── Tinggi header ─────────────────────────────────────────────────
  ws['!rows'] = [];
  ws['!rows'][3] = { hpx: 30 };
  ws['!rows'][4] = { hpx: 25 };
  ws['!rows'][5] = { hpx: 25 };

  XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan');
  XLSX.writeFile(wb, `OJK_RINGKASAN_${year}_Q${quarter}.xlsx`);
}
