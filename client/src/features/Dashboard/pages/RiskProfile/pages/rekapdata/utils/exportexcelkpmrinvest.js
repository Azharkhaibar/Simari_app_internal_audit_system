// client/src/features/Dashboard/pages/RiskProfile/utils/exportExcelKPMR.js
import * as XLSX from 'xlsx-js-style';

/**
 * Export KPMR Investasi ke Excel dengan layout yang sama seperti tabel web,
 * termasuk baris footer "Total Average Semua Aspek" di paling bawah.
 *
 * @param {{year:number, quarter:string, rows:Array}} params
 */
export function exportKPMROperasionalToExcel({ year, quarter, rows }) {
  // ===== 1) Susun data: header 2 baris, lalu group per-aspek, lalu section, lalu footer total =====
  const aoa = [];

  // Header baris-1 (A:B digabung; C..I header vertikal rowSpan=2)
  aoa.push([
    'KUALITAS PENERAPAN MANAJEMEN RISIKO',
    '', // A,B
    'Skor', // C
    '1 (Strong)',
    '2 (Satisfactory)',
    '3 (Fair)',
    '4 (Marginal)',
    '5 (Unsatisfactory)', // D..H
    'Evidence', // I
  ]);

  // Header baris-2 (label untuk kolom A,B; C..I dibiarkan kosong karena rowSpan dari baris-1)
  aoa.push([
    'No',
    'Pertanyaan / Indikator',
    '',
    '',
    '',
    '',
    '',
    '',
    '', // C..I
  ]);

  // Group by aspek
  const key = (r) => `${r.aspekNo}|${r.aspekTitle}|${r.aspekBobot}`;
  const groups = new Map();
  for (const r of rows || []) {
    const k = key(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  // simpan rata-rata per aspek untuk dipakai footer
  const aspekAverages = [];

  for (const [k, items] of groups.entries()) {
    const [aspekNo, aspekTitle, bobotStr] = k.split('|');

    // hitung rata-rata skor per aspek
    const nums = items.map((it) => (it.sectionSkor === '' ? null : Number(it.sectionSkor))).filter((v) => v != null && !Number.isNaN(v));
    const avgAspek = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    if (avgAspek != null) aspekAverages.push(avgAspek);

    // Baris ASPEK (judul di A..B; skor di C; kolom D..I kosong)
    aoa.push([
      `${aspekNo} : ${aspekTitle} (Bobot: ${bobotStr}%)`,
      '', // A,B (akan di-merge)
      avgAspek == null ? '' : Number(avgAspek.toFixed(2)), // C (Skor aspek)
      '',
      '',
      '',
      '',
      '', // D..H
      '', // I
    ]);

    // Baris SECTION (data detail)
    for (const it of items) {
      aoa.push([
        it.sectionNo ?? '',
        it.sectionTitle ?? '',
        it.sectionSkor === '' || it.sectionSkor == null ? '' : Number(it.sectionSkor),
        it.level1 ?? '',
        it.level2 ?? '',
        it.level3 ?? '',
        it.level4 ?? '',
        it.level5 ?? '',
        it.evidence ?? '',
      ]);
    }
  }

  // Footer: Total Average Semua Aspek (hanya isi kolom C; lainnya kosong)
  const totalAvg = aspekAverages.length ? Number((aspekAverages.reduce((a, b) => a + b, 0) / aspekAverages.length).toFixed(2)) : '';

  if ((rows?.length ?? 0) > 0) {
    aoa.push([
      '',
      '', // A,B kosong (biar mirip web)
      totalAvg, // C = total average semua aspek
      '',
      '',
      '',
      '',
      '',
      '', // D..I kosong
    ]);
  }

  // ===== 2) Buat sheet dari AOA =====
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Lebar kolom (mirip web)
  ws['!cols'] = [
    { wch: 8 }, // A No
    { wch: 60 }, // B Pertanyaan / Indikator
    { wch: 10 }, // C Skor
    { wch: 28 }, // D
    { wch: 28 }, // E
    { wch: 28 }, // F
    { wch: 28 }, // G
    { wch: 32 }, // H
    { wch: 40 }, // I Evidence
  ];

  // ===== 3) Merges header + merge baris-baris aspek A..B =====
  ws['!merges'] = [
    // Header A1:B1 merge
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    // Header rowSpan untuk C..I (r:0..1)
    ...Array.from({ length: 7 + 1 }, (_, i) => ({ s: { r: 0, c: 2 + i }, e: { r: 1, c: 2 + i } })),
  ];

  // ===== 4) Styling (warna/align/border) =====
  const border = {
    top: { style: 'thin' },
    right: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
  };
  const center = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
  const leftTop = { alignment: { horizontal: 'left', vertical: 'top', wrapText: true } };

  // Header fill (biru tua, teks putih, bold)
  const headFill = {
    fill: { patternType: 'solid', fgColor: { rgb: 'FF1F4E79' } }, // #1f4e79
    font: { color: { rgb: 'FFFFFFFF' }, bold: true },
    ...center,
    border,
  };

  // Terapkan style header baris 1 & 2 untuk kolom A..I
  for (let r = 0; r <= 1; r++) {
    for (let c = 0; c <= 8; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr]) ws[addr].s = headFill;
    }
  }

  // Range aktif
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Warna-warna yang dipakai (sama seperti web)
  const ASPEK_ROW_FILL = 'FFE9F5E1'; // #e9f5e1 (hijau muda)
  const SKOR_CELL_FILL = 'FF93D150'; // #93d150 (hijau terang)
  const FOOTER_ROW_FILL = 'FFC9DAF8'; // #c9daf8 (biru muda)

  for (let R = 2; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = { ...(ws[addr].s || {}), border, ...(C === 1 ? leftTop : center) };
    }

    const aAddr = XLSX.utils.encode_cell({ r: R, c: 0 });
    const bAddr = XLSX.utils.encode_cell({ r: R, c: 1 });
    const cAddr = XLSX.utils.encode_cell({ r: R, c: 2 });
    const aVal = ws[aAddr]?.v;
    const isAspekRow = typeof aVal === 'string' && aVal.toLowerCase().includes('aspek');
    const isFooterRow = (ws[aAddr]?.v === '' || ws[aAddr] == null) && (ws[bAddr]?.v === '' || ws[bAddr] == null) && ws[cAddr] && ws[cAddr].v !== '' && R === range.e.r;

    if (isAspekRow) {
      ws['!merges'].push({ s: { r: R, c: 0 }, e: { r: R, c: 1 } });
      const aspekStyle = {
        fill: { patternType: 'solid', fgColor: { rgb: ASPEK_ROW_FILL } },
        font: { bold: true },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border,
      };
      if (ws[aAddr]) ws[aAddr].s = { ...(ws[aAddr].s || {}), ...aspekStyle };
      if (ws[bAddr]) ws[bAddr].s = { ...(ws[bAddr].s || {}), ...aspekStyle };
      if (ws[cAddr]) {
        ws[cAddr].s = {
          ...(ws[cAddr].s || {}),
          fill: { patternType: 'solid', fgColor: { rgb: SKOR_CELL_FILL } },
          font: { bold: true },
          ...center,
          border,
        };
      }
    }

    if (isFooterRow) {
      for (let C = 0; C <= 8; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        ws[addr].s = {
          ...(ws[addr].s || {}),
          fill: { patternType: 'solid', fgColor: { rgb: FOOTER_ROW_FILL } },
          border,
          ...(C === 1 ? leftTop : center),
        };
      }
      if (ws[cAddr]) {
        ws[cAddr].s = {
          ...(ws[cAddr].s || {}),
          fill: { patternType: 'solid', fgColor: { rgb: SKOR_CELL_FILL } },
          font: { bold: true },
          ...center,
          border,
        };
      }
    }
  }

  // (Opsional) Freeze header
  ws['!freeze'] = { xSplit: 0, ySplit: 2 };

  // ===== 5) Tulis workbook =====
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `KPMR ${year}-${quarter}`);
  XLSX.writeFile(wb, `KPMR-Investasi-${year}-${quarter}.xlsx`);
}
