import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export function exportKpmr({ rows = [], year, quarter, categoryLabel = 'OJK' }) {
  const wb = XLSX.utils.book_new();
  const ws = {};

  const START_COL = 2; // Column C (0-based: 2)
  const START_ROW = 11; // Row 12 (0-based: 11)

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
  writeCell(3, 2, 'LAPORAN PENERAPAN MANAJEMEN RISIKO (KPMR) - OJK', {
    font: { name: 'Calibri', size: 12, bold: true, color: { rgb: 'FF0F172A' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  });
  writeCell(5, 2, `Kategori Risiko : ${categoryLabel}`, {
    font: { name: 'Calibri', size: 11, bold: true }
  });
  writeCell(6, 2, `Tahun : ${year}`, {
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

  const center = { alignment: { horizontal: 'center', vertical: 'center' } };
  const left = { alignment: { horizontal: 'left', vertical: 'top', wrapText: true } };

  const cellStyle = {
    border: thinBorder,
    font: { name: 'Calibri', size: 11 },
    alignment: { vertical: 'center', wrapText: true },
  };

  /* ======================
     HEADER ROW 1 (GROUP)
     ====================== */
  const groupHeaders = [
    { label: 'Aspek / Pertanyaan', span: 2 },
    { label: 'Hasil', span: 4 },
    { label: 'Description Level', span: 5 },
    { label: 'Keterangan', span: 2 },
  ];

  ws['!merges'] = [];

  let col = START_COL;
  groupHeaders.forEach((g) => {
    writeCell(START_ROW, col, g.label, { ...headerBlue, border: thinBorder });
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
  const subHeaders = [
    'No',
    'Pertanyaan / Indikator',
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    '1 (Strong)',
    '2 (Satisfactory)',
    '3 (Fair)',
    '4 (Marginal)',
    '5 (Unsatisfactory)',
    'Evidence',
    'Catatan'
  ];

  subHeaders.forEach((label, i) => {
    const isDark = ['Q1', 'Q2', 'Q3', 'Q4', 'Evidence', 'Catatan'].includes(label);
    const style = isDark ? headerBlueDark : headerBlue;
    writeCell(START_ROW + 1, START_COL + i, label, { ...style, ...center, border: thinBorder });
  });

  /* ======================
     HELPER KPMR CALCULATIONS
     ====================== */
  const getQScore = (skor, q) => {
    if (!skor) return '';
    const key = `Q${q}`;
    const val = skor[key] ?? skor[key.toLowerCase()] ?? skor[key.toUpperCase()] ?? '';
    return val !== '' && val !== null && val !== undefined ? Number(val) : '';
  };

  const getAvgForQuarter = (qList, qNum) => {
    const scores = qList
      .map((q) => getQScore(q.skor, qNum))
      .filter((v) => typeof v === 'number' && !isNaN(v));
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : null;
  };

  /* ======================
     DATA ROWS
     ====================== */
  const sortedAspekList = [...rows].sort((a, b) => {
    const aNum = parseFloat(a.nomor) || 0;
    const bNum = parseFloat(b.nomor) || 0;
    return aNum - bNum;
  });

  let currentRow = START_ROW + 2;
  const q1Averages = [];
  const q2Averages = [];
  const q3Averages = [];
  const q4Averages = [];

  sortedAspekList.forEach((aspek) => {
    const pertanyaanList = Array.isArray(aspek.pertanyaanList) ? aspek.pertanyaanList : [];

    // Calculate Aspect Average Score for each quarter
    const avgQ1 = getAvgForQuarter(pertanyaanList, 1);
    const avgQ2 = getAvgForQuarter(pertanyaanList, 2);
    const avgQ3 = getAvgForQuarter(pertanyaanList, 3);
    const avgQ4 = getAvgForQuarter(pertanyaanList, 4);

    if (avgQ1 !== null) q1Averages.push(avgQ1);
    if (avgQ2 !== null) q2Averages.push(avgQ2);
    if (avgQ3 !== null) q3Averages.push(avgQ3);
    if (avgQ4 !== null) q4Averages.push(avgQ4);

    // Aspect Row Style
    const aspekStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: 'FFE9F5E1' } }, // light green
      font: { name: 'Calibri', size: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };

    // 1. Write Aspect Row (Merge No and Title columns)
    writeCell(currentRow, START_COL, `${aspek.nomor || ''} : ${aspek.judul || ''} (Bobot: ${aspek.bobot || 0}%)`, aspekStyle);
    writeCell(currentRow, START_COL + 1, '', aspekStyle);
    ws['!merges'].push({
      s: { r: currentRow, c: START_COL },
      e: { r: currentRow, c: START_COL + 1 }
    });

    // Write Aspect Average Scores in the Skor columns
    const avgStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: 'FF93D150' } }, // solid green
      font: { name: 'Calibri', size: 11, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    writeCell(currentRow, START_COL + 2, avgQ1 !== null ? Number(avgQ1.toFixed(2)) : '', avgStyle);
    writeCell(currentRow, START_COL + 3, avgQ2 !== null ? Number(avgQ2.toFixed(2)) : '', avgStyle);
    writeCell(currentRow, START_COL + 4, avgQ3 !== null ? Number(avgQ3.toFixed(2)) : '', avgStyle);
    writeCell(currentRow, START_COL + 5, avgQ4 !== null ? Number(avgQ4.toFixed(2)) : '', avgStyle);

    // Empty cells for the rest of Aspect Row
    for (let c = START_COL + 6; c < START_COL + subHeaders.length; c++) {
      writeCell(currentRow, c, '', { ...cellStyle, fill: { fgColor: { rgb: 'FFE9F5E1' } } });
    }

    currentRow++;

    // 2. Write Questions under Aspect
    const sortedPertanyaan = [...pertanyaanList].sort((a, b) => {
      const aNum = parseFloat(a.nomor) || 0;
      const bNum = parseFloat(b.nomor) || 0;
      return aNum - bNum;
    });

    sortedPertanyaan.forEach((q) => {
      const scoreQ1 = getQScore(q.skor, 1);
      const scoreQ2 = getQScore(q.skor, 2);
      const scoreQ3 = getQScore(q.skor, 3);
      const scoreQ4 = getQScore(q.skor, 4);
      const indicator = q.indicator || {};

      writeCell(currentRow, START_COL, q.nomor || '', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'top' } });
      writeCell(currentRow, START_COL + 1, q.pertanyaan || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 2, scoreQ1 !== '' ? scoreQ1 : '', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'top' } });
      writeCell(currentRow, START_COL + 3, scoreQ2 !== '' ? scoreQ2 : '', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'top' } });
      writeCell(currentRow, START_COL + 4, scoreQ3 !== '' ? scoreQ3 : '', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'top' } });
      writeCell(currentRow, START_COL + 5, scoreQ4 !== '' ? scoreQ4 : '', { ...cellStyle, alignment: { horizontal: 'center', vertical: 'top' } });
      writeCell(currentRow, START_COL + 6, indicator.strong || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 7, indicator.satisfactory || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 8, indicator.fair || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 9, indicator.marginal || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 10, indicator.unsatisfactory || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 11, q.evidence || '', { ...cellStyle, ...left });
      writeCell(currentRow, START_COL + 12, q.catatan || '', { ...cellStyle, ...left });

      currentRow++;
    });
  });

  /* ======================
     SUMMARY FOOTER
     ====================== */
  const totalAvgQ1 = q1Averages.length > 0 ? q1Averages.reduce((sum, s) => sum + s, 0) / q1Averages.length : null;
  const totalAvgQ2 = q2Averages.length > 0 ? q2Averages.reduce((sum, s) => sum + s, 0) / q2Averages.length : null;
  const totalAvgQ3 = q3Averages.length > 0 ? q3Averages.reduce((sum, s) => sum + s, 0) / q3Averages.length : null;
  const totalAvgQ4 = q4Averages.length > 0 ? q4Averages.reduce((sum, s) => sum + s, 0) / q4Averages.length : null;

  if (rows.length > 0) {
    const footerStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: 'FFC9DAF8' } }, // light blue
      font: { name: 'Calibri', size: 11, bold: true },
      alignment: { horizontal: 'right', vertical: 'center' }
    };

    writeCell(currentRow, START_COL, 'Total Average Semua Aspek', footerStyle);
    writeCell(currentRow, START_COL + 1, '', footerStyle);
    ws['!merges'].push({
      s: { r: currentRow, c: START_COL },
      e: { r: currentRow, c: START_COL + 1 }
    });

    const totalAvgStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: 'FF93D150' } }, // solid green
      font: { name: 'Calibri', size: 11, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    writeCell(currentRow, START_COL + 2, totalAvgQ1 !== null ? Number(totalAvgQ1.toFixed(2)) : '', totalAvgStyle);
    writeCell(currentRow, START_COL + 3, totalAvgQ2 !== null ? Number(totalAvgQ2.toFixed(2)) : '', totalAvgStyle);
    writeCell(currentRow, START_COL + 4, totalAvgQ3 !== null ? Number(totalAvgQ3.toFixed(2)) : '', totalAvgStyle);
    writeCell(currentRow, START_COL + 5, totalAvgQ4 !== null ? Number(totalAvgQ4.toFixed(2)) : '', totalAvgStyle);

    for (let c = START_COL + 6; c < START_COL + subHeaders.length; c++) {
      writeCell(currentRow, c, '', { ...cellStyle, fill: { fgColor: { rgb: 'FFC9DAF8' } } });
    }

    currentRow++;
  }

  /* ======================
     COLUMN WIDTHS & CONFIG
     ====================== */
  ws['!cols'] = [
    { wch: 4 }, // A
    { wch: 4 }, // B
    { wch: 8 }, // C (No)
    { wch: 50 }, // D (Pertanyaan)
    { wch: 10 }, // E (Q1)
    { wch: 10 }, // F (Q2)
    { wch: 10 }, // G (Q3)
    { wch: 10 }, // H (Q4)
    { wch: 25 }, // I (Strong)
    { wch: 25 }, // J (Satisfactory)
    { wch: 25 }, // K (Fair)
    { wch: 25 }, // L (Marginal)
    { wch: 25 }, // M (Unsatisfactory)
    { wch: 30 }, // N (Evidence)
    { wch: 30 }, // O (Catatan)
  ];

  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: currentRow - 1, c: START_COL + subHeaders.length - 1 },
  });

  ws['!freeze'] = { xSplit: 0, ySplit: START_ROW + 2 };

  XLSX.utils.book_append_sheet(wb, ws, 'KPMR');

  const buffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true,
  });

  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `KPMR_${categoryLabel}_${year}.xlsx`);
}
