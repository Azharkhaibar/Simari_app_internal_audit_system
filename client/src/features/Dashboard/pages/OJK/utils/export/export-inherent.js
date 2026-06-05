import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { computeDerived } from '../compute/compute-derived';

export function exportInherent({ rows = [], year, quarter, categoryLabel = 'PasarProduk' }) {
  const wb = XLSX.utils.book_new();
  const ws = {};

  const START_COL = 2; // C
  const START_ROW = 12; // row 13 (0-based)

  const writeCell = (r, c, val, style = {}) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cellVal = val === null || val === undefined ? '' : val;
    const cell = { v: cellVal, s: style };
    if (typeof cellVal === 'number') {
      cell.t = 'n';
    } else {
      cell.t = 's';
    }
    ws[addr] = cell;
  };

  /* ======================
     TITLE BLOCK
     ====================== */
  writeCell(2, 2, 'PT PEMODALAN NASIONAL MADANI', {
    font: { name: 'Calibri', size: 16, bold: true, color: { rgb: 'FF1E3A8A' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  });
  writeCell(3, 2, 'LAPORAN PROFIL RISIKO INHEREN - OJK', {
    font: { name: 'Calibri', size: 12, bold: true, color: { rgb: 'FF0F172A' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  });
  writeCell(5, 2, `Kategori Risiko : ${categoryLabel}`, {
    font: { name: 'Calibri', size: 11, bold: true }
  });
  const qStr = quarter ? String(quarter).toUpperCase() : '';
  writeCell(6, 2, `Tahun / Quarter : ${year} / Q${qStr}`, {
    font: { name: 'Calibri', size: 11, bold: true }
  });

  /* ======================
     STYLE HELPERS
     ====================== */
  const thinBorder = {
    top: { style: 'thin', color: { rgb: 'FF000000' } },
    bottom: { style: 'thin', color: { rgb: 'FF000000' } },
    left: { style: 'thin', color: { rgb: 'FF000000' } },
    right: { style: 'thin', color: { rgb: 'FF000000' } },
  };

  const headerBlue = {
    fill: { fgColor: { rgb: 'FF1E3A8A' } },
    font: { color: { rgb: 'FFFFFFFF' }, bold: true, name: 'Calibri', size: 11 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  };

  const headerBlueDark = {
    fill: { fgColor: { rgb: 'FF0F172A' } },
    font: { color: { rgb: 'FFFFFFFF' }, bold: true, name: 'Calibri', size: 11 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  };

  const riskStyles = {
    Low: {
      fill: { fgColor: { rgb: 'FF2ECC71' } },
      font: { color: { rgb: 'FFFFFFFF' }, bold: true },
    },
    'Low To Moderate': {
      fill: { fgColor: { rgb: 'FFA3E635' } },
      font: { color: { rgb: 'FF000000' }, bold: true },
    },
    Moderate: {
      fill: { fgColor: { rgb: 'FFFACC15' } },
      font: { color: { rgb: 'FF000000' }, bold: true },
    },
    'Moderate To High': {
      fill: { fgColor: { rgb: 'FFF97316' } },
      font: { color: { rgb: 'FF000000' }, bold: true },
    },
    High: {
      fill: { fgColor: { rgb: 'FFFF0000' } },
      font: { color: { rgb: 'FFFFFFFF' }, bold: true },
    },
  };

  const rankColors = {
    1: { fill: { fgColor: { rgb: 'FF2ECC71' } }, font: { color: { rgb: 'FF000000' }, bold: true } },
    2: { fill: { fgColor: { rgb: 'FFA3E635' } }, font: { color: { rgb: 'FF000000' }, bold: true } },
    3: { fill: { fgColor: { rgb: 'FFFACC15' } }, font: { color: { rgb: 'FF000000' }, bold: true } },
    4: { fill: { fgColor: { rgb: 'FFF97316' } }, font: { color: { rgb: 'FF000000' }, bold: true } },
    5: { fill: { fgColor: { rgb: 'FFFF0000' } }, font: { color: { rgb: 'FFFFFFFF' }, bold: true } },
  };

  const center = { alignment: { horizontal: 'center', vertical: 'center' } };

  const cellStyle = {
    border: thinBorder,
    font: { name: 'Calibri', size: 11 },
    alignment: { vertical: 'center', wrapText: true },
  };

  /* ======================
     HEADER ROW 1 (GROUP)
     ====================== */
  const groupHeaders = [
    { label: 'Parameter', span: 3 },
    { label: 'Nilai', span: 4 },
    { label: 'Risk Level', span: 5 },
    { label: 'Hasil', span: 4 },
  ];

  ws['!merges'] = [];

  let col = START_COL;
  groupHeaders.forEach((g) => {
    writeCell(START_ROW, col, g.label, { ...headerBlue, border: thinBorder });
    
    // Fill the spanned cells with the same style so borders display correctly
    for (let c = col + 1; c < col + g.span; c++) {
      writeCell(START_ROW, c, '', { ...headerBlue, border: thinBorder });
    }
    
    ws['!merges'].push({
      s: { r: START_ROW, c: col },
      e: { r: START_ROW, c: col + g.span - 1 },
    });
    col += g.span;
  });

  /* ======================
     HEADER ROW 2 (SUB)
     ====================== */
  const subHeaders = ['No', 'Bobot', 'Parameter', 'No', 'Nilai', 'Bobot', '% Portofolio', 'Low', 'Low To Moderate', 'Moderate', 'Moderate To High', 'High', 'Hasil', 'Peringkat', 'Weighted', 'Keterangan'];

  subHeaders.forEach((label, i) => {
    const style = riskStyles[label] ?? (['Hasil', 'Peringkat', 'Weighted', 'Keterangan'].includes(label) ? headerBlueDark : headerBlue);
    writeCell(START_ROW + 1, START_COL + i, label, { ...style, ...center, border: thinBorder });
  });

  /* ======================
     FORMATTING HELPERS
     ====================== */
  const formatPercent = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const n = Number(val);
    if (Number.isNaN(n)) return String(val);
    const percent = Math.abs(n) <= 1 ? n * 100 : n;
    const rounded = Math.abs(percent - Math.round(percent)) < 1e-9 ? Math.round(percent) : percent.toFixed(2);
    return `${rounded}%`;
  };

  /* ======================
     DATA ROWS
     ====================== */
  const compareParameterNumbers = (a, b) => {
    const parseNumber = (str) => {
      if (!str) return [0, 0];
      const cleanStr = str.replace(/\.$/, '');
      const parts = cleanStr.split('.').map(Number);
      return [parts[0] || 0, parts[1] || 0];
    };
    const [aMain, aSub] = parseNumber(a.nomor);
    const [bMain, bSub] = parseNumber(b.nomor);
    if (aMain !== bMain) return aMain - bMain;
    return aSub - bSub;
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!a.nomor && !b.nomor) return 0;
    if (!a.nomor) return 1;
    if (!b.nomor) return -1;
    return compareParameterNumbers(a, b);
  });

  let currentRow = START_ROW + 2;

  sortedRows.forEach((param) => {
    const nilaiList = Array.isArray(param.nilaiList) ? param.nilaiList : [];

    if (nilaiList.length === 0) {
      writeCell(currentRow, 2, param.nomor || '-', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } }, alignment: { horizontal: 'center', vertical: 'center' } });
      writeCell(currentRow, 3, formatPercent(param.bobot), { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } }, alignment: { horizontal: 'center', vertical: 'center' } });
      writeCell(currentRow, 4, param.judul || '-', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } } });

      writeCell(currentRow, 5, 'Belum ada nilai', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'center' } });
      for (let c = 6; c <= 17; c++) {
        writeCell(currentRow, c, '', { ...cellStyle });
      }
      ws['!merges'].push({
        s: { r: currentRow, c: 5 },
        e: { r: currentRow, c: 17 }
      });

      currentRow++;
      return;
    }

    const sortedNilaiList = [...nilaiList].sort((a, b) => {
      if (!a.nomor && !b.nomor) return 0;
      if (!a.nomor) return 1;
      if (!b.nomor) return -1;
      const parseNilaiNumber = (str) => {
        const cleanStr = str.replace(/\.$/, '');
        const parts = cleanStr.split('.').map(Number);
        return [parts[0] || 0, parts[1] || 0];
      };
      const [aMain, aSub] = parseNilaiNumber(a.nomor);
      const [bMain, bSub] = parseNilaiNumber(b.nomor);
      if (aMain !== bMain) return aMain - bMain;
      return aSub - bSub;
    });

    const totalRowsForParam = sortedNilaiList.reduce((total, nilai) => {
      const j = nilai.judul || { type: 'Tanpa Faktor' };
      if (j.type === 'Satu Faktor') return total + 2;
      if (j.type === 'Dua Faktor') return total + 3;
      return total + 1;
    }, 0);

    const paramStartRow = currentRow;

    sortedNilaiList.forEach((nilai, ni) => {
      const derived = computeDerived(nilai, param) || {};
      const { hasilDisplay, hasilRows, peringkat, weightedDisplay } = derived;
      const j = nilai.judul || { type: 'Tanpa Faktor' };

      let rowsForThisNilai = 1;
      if (j.type === 'Satu Faktor') rowsForThisNilai = 2;
      if (j.type === 'Dua Faktor') rowsForThisNilai = 3;

      const nilaiStartRow = currentRow;

      for (let subIndex = 0; subIndex < rowsForThisNilai; subIndex++) {
        const isMainRow = (subIndex === 0);

        let nilaiText = '-';
        let hasilText = '-';

        if (j.type === 'Tanpa Faktor' || subIndex === 0) {
          nilaiText = j.text ?? '-';
          hasilText = hasilDisplay ?? '-';
        } else if (j.type === 'Satu Faktor' && subIndex === 1) {
          nilaiText = j.pembilang ?? '-';
          hasilText = hasilRows?.[1] ?? '-';
        } else if (j.type === 'Dua Faktor') {
          if (subIndex === 1) {
            nilaiText = j.pembilang ?? '-';
            hasilText = hasilRows?.[1] ?? '-';
          } else if (subIndex === 2) {
            nilaiText = j.penyebut ?? '-';
            hasilText = hasilRows?.[2] ?? '-';
          }
        }

        const bg = isMainRow ? 'FFE8F5FA' : 'FFFFFFFF';
        const fill = { fgColor: { rgb: bg } };

        // 1. Parameter columns
        if (ni === 0 && subIndex === 0) {
          writeCell(currentRow, 2, param.nomor ?? '-', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } }, alignment: { horizontal: 'center', vertical: 'center' } });
          writeCell(currentRow, 3, formatPercent(param.bobot), { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } }, alignment: { horizontal: 'center', vertical: 'center' } });
          writeCell(currentRow, 4, param.judul ?? '-', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } } });
        } else {
          writeCell(currentRow, 2, '', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } } });
          writeCell(currentRow, 3, '', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } } });
          writeCell(currentRow, 4, '', { ...cellStyle, fill: { fgColor: { rgb: 'FFE8F5FA' } } });
        }

        // 2. Nilai columns
        writeCell(currentRow, 5, isMainRow ? (nilai.nomor ?? '-') : '', { ...cellStyle, fill, alignment: { horizontal: 'center', vertical: 'center' } });
        writeCell(currentRow, 6, nilaiText, { ...cellStyle, fill, font: { name: 'Calibri', size: 11, bold: isMainRow } });
        writeCell(currentRow, 7, isMainRow ? formatPercent(nilai.bobot) : '', { ...cellStyle, fill, alignment: { horizontal: 'center', vertical: 'center' } });
        writeCell(currentRow, 8, isMainRow ? (nilai.portofolio ?? '-') : '', { ...cellStyle, fill, alignment: { horizontal: 'center', vertical: 'center' } });

        // 3. Risk Level columns (9 to 13)
        const rkBg = isMainRow ? 'FFD9EAD3' : 'FFFFFFFF';
        const rkFill = { fgColor: { rgb: rkBg } };
        ['low', 'lowToModerate', 'moderate', 'moderateToHigh', 'high'].forEach((rk, rkIdx) => {
          const val = isMainRow ? (nilai.riskindikator?.[rk] ?? '-') : '';
          writeCell(currentRow, 9 + rkIdx, val, { ...cellStyle, fill: rkFill, alignment: { horizontal: 'center', vertical: 'center' } });
        });

        // 4. Hasil column
        let formattedHasil = hasilText;
        if (isMainRow && formattedHasil !== '-' && formattedHasil !== '') {
          const cleanVal = String(formattedHasil).replace(/,/g, '.').trim();
          const num = Number(cleanVal);
          if (!isNaN(num) && !String(formattedHasil).includes('%')) {
            formattedHasil = `${num.toFixed(2)}%`;
          }
        }
        const hasilBg = isMainRow ? 'FFFFFFFF' : 'FFD9EAD3';
        writeCell(currentRow, 14, formattedHasil, { ...cellStyle, fill: { fgColor: { rgb: hasilBg } }, alignment: { horizontal: 'center', vertical: 'center' }, font: { name: 'Calibri', size: 11, bold: isMainRow } });

        // 5. Peringkat, Weighted, Keterangan columns
        if (subIndex === 0) {
          const pRank = Number(peringkat);
          const rStyle = rankColors[pRank] || {};
          const pBg = rStyle.fill?.fgColor?.rgb || 'FFFFFFFF';
          const pFontColor = rStyle.font?.color?.rgb || 'FF000000';
          const pFontBold = rStyle.font?.bold || false;

          writeCell(currentRow, 15, Number.isFinite(peringkat) ? peringkat : '-', {
            ...cellStyle,
            fill: { fgColor: { rgb: pBg } },
            font: { name: 'Calibri', size: 11, bold: pFontBold, color: { rgb: pFontColor } },
            alignment: { horizontal: 'center', vertical: 'center' },
          });

          writeCell(currentRow, 16, weightedDisplay || '', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'center' } });
          writeCell(currentRow, 17, nilai.keterangan || '', { ...cellStyle });
        } else {
          writeCell(currentRow, 15, '', { ...cellStyle });
          writeCell(currentRow, 16, '', { ...cellStyle });
          writeCell(currentRow, 17, '', { ...cellStyle });
        }

        currentRow++;
      }

      if (rowsForThisNilai > 1) {
        ws['!merges'].push({
          s: { r: nilaiStartRow, c: 15 },
          e: { r: currentRow - 1, c: 15 }
        });
        ws['!merges'].push({
          s: { r: nilaiStartRow, c: 16 },
          e: { r: currentRow - 1, c: 16 }
        });
        ws['!merges'].push({
          s: { r: nilaiStartRow, c: 17 },
          e: { r: currentRow - 1, c: 17 }
        });
      }
    });

    if (totalRowsForParam > 1) {
      ws['!merges'].push({
        s: { r: paramStartRow, c: 2 },
        e: { r: currentRow - 1, c: 2 }
      });
      ws['!merges'].push({
        s: { r: paramStartRow, c: 3 },
        e: { r: currentRow - 1, c: 3 }
      });
      ws['!merges'].push({
        s: { r: paramStartRow, c: 4 },
        e: { r: currentRow - 1, c: 4 }
      });
    }
  });

  /* ======================
     SUMMARY ROW
     ====================== */
  const totalWeighted = sortedRows.reduce((sumParam, param) => {
    const nilaiList = Array.isArray(param.nilaiList) ? param.nilaiList : [];
    const derived = nilaiList.map((nv) => computeDerived(nv, param));
    return sumParam + derived.reduce((s, d) => (Number.isFinite(d?.weighted) ? s + d.weighted : s), 0);
  }, 0);

  const getSummaryBgColor = (total) => {
    if (!Number.isFinite(total)) return 'FFFFFFFF';
    if (total <= 1) return 'FF2ECC71';
    if (total <= 2) return 'FFA3E635';
    if (total <= 3) return 'FFFACC15';
    if (total <= 4) return 'FFF97316';
    return 'FFFF0000';
  };

  const totalWeightedBg = getSummaryBgColor(totalWeighted);
  const totalWeightedFontColor = totalWeightedBg === 'FFFF0000' ? 'FFFFFFFF' : 'FF000000';

  for (let c = 2; c <= 13; c++) {
    writeCell(currentRow, c, '', { font: { name: 'Calibri', size: 11 } });
  }

  writeCell(currentRow, 14, 'Summary', {
    fill: { fgColor: { rgb: 'FF0F172A' } },
    font: { name: 'Calibri', size: 11, bold: true, color: { rgb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  });
  writeCell(currentRow, 15, '', {
    fill: { fgColor: { rgb: 'FF0F172A' } },
    border: thinBorder,
  });
  ws['!merges'].push({
    s: { r: currentRow, c: 14 },
    e: { r: currentRow, c: 15 }
  });

  writeCell(currentRow, 16, Number.isFinite(totalWeighted) ? totalWeighted.toFixed(2) : '-', {
    fill: { fgColor: { rgb: totalWeightedBg } },
    font: { name: 'Calibri', size: 11, bold: true, color: { rgb: totalWeightedFontColor } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  });

  writeCell(currentRow, 17, '', { border: thinBorder });
  currentRow++;

  /* ======================
     COLUMN WIDTH
     ====================== */
  ws['!cols'] = [
    { wch: 4 }, // A
    { wch: 4 }, // B
    { wch: 6 }, // C
    { wch: 8 }, // D
    { wch: 32 }, // E
    { wch: 6 }, // F
    { wch: 32 }, // G
    { wch: 8 }, // H
    { wch: 18 }, // I
    { wch: 16 }, // J
    { wch: 18 }, // K
    { wch: 16 }, // L
    { wch: 20 }, // M
    { wch: 16 }, // N
    { wch: 16 }, // O
    { wch: 12 }, // P
    { wch: 12 }, // Q
    { wch: 24 }, // R
  ];

  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: currentRow - 1, c: 17 },
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Inherent Risk');

  const buffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true,
  });

  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Inherent_${categoryLabel}_${year}_${qStr}.xlsx`);
}
