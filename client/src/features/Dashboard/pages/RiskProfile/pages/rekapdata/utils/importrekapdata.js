// client/src/features/Dashboard/pages/RiskProfile/utils/importRekapData.js
import * as XLSX from 'xlsx';

const parseNum = (v) => {
  if (v == null || v === '') return NaN;

  if (typeof v === 'number') {
    return isNaN(v) || !isFinite(v) ? NaN : v;
  }

  let s = String(v)
    .trim()
    .replace(/\u00A0/g, '');
  const hasPercent = s.includes('%');
  s = s.replace(/%/g, '');

  if (s.includes('.') && s.includes(',')) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');

    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',') && !s.includes('.')) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      s = s.replace(',', '.');
    } else if (parts.length === 2 && parts[1].length === 3) {
      s = s.replace(',', '');
    } else if (parts.length > 2) {
      s = s.replace(/,/g, '');
    } else {
      s = s.replace(',', '.');
    }
  } else if (s.includes('.') && !s.includes(',')) {
    const parts = s.split('.');
    if (parts.length > 2) {
      s = s.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length === 3) {
      s = s.replace('.', '');
    }
  }

  s = s.replace(/\s+/g, '');
  if (!s) return NaN;

  const n = parseFloat(s);
  return Number.isNaN(n) ? NaN : n;
};

const parseStringPreserveFormat = (v) => {
  if (v == null || v === '') return '';
  let strVal = String(v).trim();
  if (strVal.startsWith("'")) {
    strVal = strVal.substring(1);
  }
  return strVal;
};

const computeHasilFromValues = (row) => {
  const mode = row.mode || 'RASIO';
  const pembRaw = row.numeratorValue ?? row.pembilangValue ?? '';
  const penyRaw = row.denominatorValue ?? row.penyebutValue ?? '';
  const hasilValue = row.hasilValue;
  const isPercent = row.isPercent || false;
  const formula = row.formula || '';

  const hasPembilang = pembRaw !== '' && pembRaw != null;
  const hasPenyebut = penyRaw !== '' && penyRaw != null;
  const hasHasilValue = hasilValue !== '' && hasilValue != null && hasilValue !== undefined;

  if (mode === 'TEKS' || mode === 'KUALITATIF') {
    return '';
  }

  if (hasPembilang || hasPenyebut) {
    // recalculate from pembilang/penyebut
  } else if (hasHasilValue) {
    let parsedHasil;

    if (typeof hasilValue === 'number') {
      parsedHasil = !isNaN(hasilValue) && isFinite(hasilValue) ? hasilValue : NaN;
    } else {
      parsedHasil = parseNum(hasilValue);
    }

    if (!isNaN(parsedHasil) && isFinite(parsedHasil)) {
      const finalResult = isPercent ? parsedHasil / 100 : parsedHasil;
      return finalResult;
    }
  }

  if (!hasPembilang && !hasPenyebut) {
    return '';
  }

  if (mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') {
    const raw = penyRaw || pembRaw;
    if (raw === '' || raw == null) {
      return '';
    }
    const val = parseNum(raw);
    return Number.isFinite(val) ? Number(val) : '';
  }

  const pemb = parseNum(pembRaw);
  const peny = parseNum(penyRaw);

  if (!isFinite(pemb) || !isFinite(peny)) {
    return '';
  }

  if (peny === 0) {
    return '';
  }

  if (formula && formula.trim() !== '') {
    try {
      const expr = formula.replace(/\bpemb\b/g, 'pemb').replace(/\bpeny\b/g, 'peny');
      const fn = new Function('pemb', 'peny', `return (${expr});`);
      const res = fn(pemb, peny);
      if (isFinite(res) && !isNaN(res)) {
        return Number(res);
      }
    } catch (e) {
      console.warn('[COMPUTE] Invalid formula, falling back to default:', formula, e);
    }
  }

  const result = pemb / peny;

  if (!isFinite(result) || Number.isNaN(result)) {
    return '';
  }

  return Number(result);
};

// =====================================================================
// BUG FIX #1: isDetailRow - detect pembilang/penyebut rows lebih akurat
// Masalah asal: hanya cek lowercase string dari col2, tapi label asli
// bisa berupa apapun (mis: "Total Aset", "Jumlah Karyawan", dll)
// Fix: Cek bahwa col0 DAN col1 kosong, dan col2 tidak kosong (struktur row detail)
// =====================================================================
const isDetailRow = (row, nextIsNewIndicator) => {
  if (!row) return false;
  const col0 = row[0];
  const col1 = row[1];
  const col2 = row[2];

  const isCol0Empty = col0 === undefined || col0 === null || String(col0).trim() === '';
  const isCol1Empty = col1 === undefined || col1 === null || String(col1).trim() === '';
  const isCol2NotEmpty = col2 !== undefined && col2 !== null && String(col2).trim() !== '';

  // Row detail = col0 & col1 kosong, col2 ada isi (label pembilang/penyebut)
  return isCol0Empty && isCol1Empty && isCol2NotEmpty;
};

// =====================================================================
// BUG FIX #2: detectMode - deteksi mode lebih robust
// Masalah asal: mode detection bergantung pada cek "includes pembilang/penyebut"
// yang tidak cocok untuk label custom.
// Fix: Gunakan Mode column (col index 3) jika ada,
// lalu fallback ke row-structure detection
// =====================================================================
const detectModeFromStructure = (jsonData, currentRowIdx, modeColumnIndex, detailColumnIndex) => {
  const nextRow = jsonData[currentRowIdx + 1];
  const thirdRow = jsonData[currentRowIdx + 2];

  // Cek apakah next row adalah detail row (col0 & col1 kosong, col2 ada)
  const nextIsDetail = isDetailRow(nextRow);
  const thirdIsDetail = isDetailRow(thirdRow);

  // Cek apakah next row adalah indicator baru (col0 atau col1 tidak kosong)
  const nextIsNewIndicator = nextRow && ((nextRow[0] !== undefined && nextRow[0] !== null && String(nextRow[0]).trim() !== '') || (nextRow[1] !== undefined && nextRow[1] !== null && String(nextRow[1]).trim() !== ''));

  if (nextIsDetail && thirdIsDetail) {
    // Ada 2 baris detail: pembilang + penyebut → RASIO
    return 'RASIO';
  } else if (nextIsDetail && !thirdIsDetail) {
    // Ada 1 baris detail: hanya penyebut → NILAI_TUNGGAL
    return 'NILAI_TUNGGAL';
  } else if (nextIsNewIndicator || !nextRow) {
    // Tidak ada detail row → TEKS atau indicator tanpa nilai
    return 'MAYBE_TEKS';
  } else {
    return 'NILAI_TUNGGAL';
  }
};

export async function importRekapDataFromExcel(file, currentData, targetYear, targetQuarter) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          reject(new Error('File Excel tidak valid: tidak ada data'));
          return;
        }

        const headers = jsonData[0];

        // =====================================================================
        // BUG FIX #3: Format detection lebih akurat
        // Masalah asal: cek hanya berdasarkan header.length yang bisa salah
        // jika ada kolom kosong di akhir.
        // Fix: Cek isi header untuk menentukan format.
        // =====================================================================
        const headerStr = headers.map((h) => String(h || '').toLowerCase()).join('|');

        // Deteksi format berdasarkan konten header
        const hasMode = headerStr.includes('mode');
        const colCount = headers.filter((h) => h !== undefined && h !== null && String(h).trim() !== '').length;

        // Hitung kolom quarter (kolom setelah Source, Section, Indikator, [Mode])
        const baseColCount = hasMode ? 4 : 3;
        const quarterColCount = colCount - baseColCount;

        const isTahunan = quarterColCount > 1; // lebih dari 1 quarter column = tahunan
        const isTriwulan = quarterColCount === 1;

        // Indeks kolom
        const modeColumnIndex = hasMode ? 3 : null;
        const firstDataColIndex = hasMode ? 4 : 3;

        console.log('%c=== REKAPDATA IMPORT START ===', 'color: #9333EA; font-weight: bold; font-size: 14px');
        console.log('📁 File:', file.name);
        console.log('📅 Target:', { year: targetYear, quarter: targetQuarter });
        console.log(`📊 Format: ${isTahunan ? 'TAHUNAN' : 'TRIWULAN'}, hasMode: ${hasMode}, quarterCols: ${quarterColCount}`);
        console.log('📊 Headers:', headers);

        if (!isTahunan && !isTriwulan) {
          // Toleransi: jika tidak bisa detect, anggap triwulan
          console.warn('[IMPORT] Cannot detect format, assuming TRIWULAN');
        }

        const updates = {
          investasiRows: [],
          pasarRows: [],
          likuiditasRows: [],
          operasionalRows: [],
          stratejikRows: [],
          kepatuhanRows: [],
          reputasiRows: [],
          hukumRows: [],
          hukumSections: [],
          operasionalSections: [],
          stratejikSections: [],
          kepatuhanSections: [],
          reputasiSections: [],
        };

        // Build currentBySource lookup dari currentData (visibleGroups)
        const currentBySource = {};
        currentData.forEach((row) => {
          const mainRow = row.mainRow || row;
          const source = (mainRow.source || row.source || '').toUpperCase().trim();
          const section = (row.sectionName || mainRow.sectionLabel || '').trim();
          const indikator = (row.indikatorLabel || mainRow.indikator || '').trim();

          if (!source || !section || !indikator) return;

          const key = `${source}|${section}|${indikator}`;
          if (!currentBySource[key]) currentBySource[key] = [];
          currentBySource[key].push(mainRow);
        });

        // Enhance dengan localStorage data
        try {
          const sources = [
            { key: 'reputasiRows', source: 'REPUTASI' },
            { key: 'investasiRows', source: 'INVESTASI' },
            { key: 'pasarRows', source: 'PASAR' },
            { key: 'likuiditasRows', source: 'LIKUIDITAS' },
            { key: 'operasionalRows', source: 'OPERASIONAL' },
            { key: 'hukumRows', source: 'HUKUM' },
            { key: 'stratejikRows', source: 'STRATEJIK' },
            { key: 'kepatuhanRows', source: 'KEPATUHAN' },
          ];

          sources.forEach(({ key, source }) => {
            try {
              const rawData = localStorage.getItem(key);
              if (!rawData) return;

              const rows = JSON.parse(rawData);
              if (!Array.isArray(rows)) return;

              rows.forEach((row) => {
                const rowSource = (row.source || source || '').toUpperCase().trim();
                const section = (row.sectionLabel || '').trim();
                const indikator = (row.indikator || '').trim();

                if (!rowSource || !section || !indikator) return;

                const matchKey = `${rowSource}|${section}|${indikator}`;
                if (!currentBySource[matchKey]) currentBySource[matchKey] = [];

                const exists = currentBySource[matchKey].some((existing) => existing.no === row.no && existing.subNo === row.subNo && existing.year === row.year && existing.quarter === row.quarter);

                if (!exists) {
                  currentBySource[matchKey].push(row);
                }
              });
            } catch (e) {
              console.warn(`[IMPORT] Failed to load ${key}:`, e);
            }
          });
        } catch (e) {
          console.error('[IMPORT] Failed to enhance currentBySource:', e);
        }

        const QUARTER_ORDER = ['Q1', 'Q2', 'Q3', 'Q4'];

        // Parse quarter columns dari header
        const quarterColumns = []; // [{quarter: "Q1", colIndex: 4}, ...]
        for (let ci = firstDataColIndex; ci < headers.length; ci++) {
          const h = String(headers[ci] || '').trim();
          if (!h) continue;
          // Match format: "MAR 2025", "JUN 2025", dll
          const qMatch = QUARTER_ORDER.find((q) => {
            const qLabel = { Q1: 'MAR', Q2: 'JUN', Q3: 'SEP', Q4: 'DES' }[q];
            return h.toUpperCase().startsWith(qLabel);
          });
          if (qMatch) {
            quarterColumns.push({ quarter: qMatch, colIndex: ci });
          }
        }

        console.log('[IMPORT] Quarter columns detected:', quarterColumns);

        let i = 1; // skip header row
        let parsedCount = 0;
        let lastSource = '';
        let lastSection = '';

        while (i < jsonData.length) {
          const mainRow = jsonData[i];

          if (!mainRow || mainRow.length === 0) {
            i++;
            continue;
          }

          const col0 = mainRow[0];
          const col1 = mainRow[1];
          const col2 = mainRow[2];

          const isCol0Empty = col0 === undefined || col0 === null || String(col0).trim() === '';
          const isCol1Empty = col1 === undefined || col1 === null || String(col1).trim() === '';
          const isCol2Empty = col2 === undefined || col2 === null || String(col2).trim() === '';

          // Skip completely empty rows
          if (isCol0Empty && isCol1Empty && isCol2Empty) {
            i++;
            continue;
          }

          // =====================================================================
          // BUG FIX #4: Skip detail rows di level top
          // Masalah asal: parser bisa salah mengidentifikasi baris pembilang/penyebut
          // sebagai indicator baru ketika semua source di-import sekaligus,
          // karena pengecekan "isCol0Empty && isCol1Empty" tidak cukup.
          // Fix: Gunakan isDetailRow() yang lebih robust, dan skip baris detail
          // yang seharusnya sudah di-consume oleh indicator sebelumnya.
          // =====================================================================
          if (isDetailRow(mainRow)) {
            // Baris ini adalah detail row (pembilang/penyebut)
            // Seharusnya sudah di-handle oleh loop indicator di atas
            // Jika sampai di sini, berarti ada yang skip - skip saja
            console.warn(`[IMPORT] Unexpected detail row at index ${i}:`, mainRow);
            i++;
            continue;
          }

          // Resolve source
          let source = col0;
          if (isCol0Empty && !isCol1Empty) {
            // Section baru tapi source sama dengan sebelumnya
            if (lastSource) {
              source = lastSource;
            } else {
              i++;
              continue;
            }
          } else if (!isCol0Empty) {
            lastSource = col0;
            source = col0;
          }

          const sectionName = col1;
          const indikatorLabel = col2;

          // Normalize untuk matching
          const sourceNorm = String(source || '')
            .toUpperCase()
            .trim();
          const sectionNorm = String(sectionName || '').trim();
          const indikatorNorm = String(indikatorLabel || '').trim();

          if (!sourceNorm || !sectionNorm || !indikatorNorm) {
            i++;
            continue;
          }

          const matchKey = `${sourceNorm}|${sectionNorm}|${indikatorNorm}`;
          const currentIndicators = currentBySource[matchKey] || [];
          const currentIndicator = currentIndicators[0] || {};

          const riskLevels = {
            low: currentIndicator.low || '',
            lowToModerate: currentIndicator.lowToModerate || '',
            moderate: currentIndicator.moderate || '',
            moderateToHigh: currentIndicator.moderateToHigh || '',
            high: currentIndicator.high || '',
          };

          const inferredIsPercent = Object.values(riskLevels).some((v) => String(v || '').includes('%'));
          const isPercent = inferredIsPercent;

          // Ambil mode dari kolom Mode jika ada
          let modeFromCol = null;
          if (modeColumnIndex !== null) {
            const modeValue = mainRow[modeColumnIndex];
            if (modeValue && String(modeValue).trim() !== '') {
              modeFromCol = String(modeValue).toUpperCase().trim();
            }
          }

          if (sectionName !== lastSection) {
            lastSection = sectionName;
          }

          // =====================================================================
          // PROSES TRIWULAN: 1 kolom data (simple case)
          // =====================================================================
          if (!isTahunan || quarterColumns.length <= 1) {
            // Mode TRIWULAN
            const hasilColIndex = firstDataColIndex;
            const rawHasilValue = mainRow[hasilColIndex];
            const hasilValue = rawHasilValue;

            let numeratorValue = '';
            let denominatorValue = '';
            let numeratorLabel = currentIndicator.numeratorLabel || currentIndicator.pembilangLabel || 'Pembilang';
            let denominatorLabel = currentIndicator.denominatorLabel || currentIndicator.penyebutLabel || 'Penyebut';
            let mode = modeFromCol;
            let hasilText = '';
            let rowsToSkip = 1; // Minimal skip 1 (baris indicator sendiri)

            // Lihat baris-baris berikutnya untuk detect detail rows
            // =====================================================================
            // IMPROVED: Scan semua baris berikutnya yang merupakan detail rows
            // =====================================================================
            const detailRows = [];
            let scanIdx = i + 1;
            while (scanIdx < jsonData.length && isDetailRow(jsonData[scanIdx])) {
              detailRows.push({ row: jsonData[scanIdx], originalIdx: scanIdx });
              scanIdx++;
            }

            console.log(`[IMPORT] Indicator "${indikatorNorm}" has ${detailRows.length} detail rows`);

            // Tentukan mode dari jumlah detail rows jika tidak ada dari kolom
            if (!mode) {
              if (detailRows.length >= 2) {
                mode = 'RASIO';
              } else if (detailRows.length === 1) {
                mode = 'NILAI_TUNGGAL';
              } else {
                // Cek apakah hasilValue adalah teks
                if (typeof hasilValue === 'string' && hasilValue !== '' && isNaN(parseNum(hasilValue))) {
                  mode = 'TEKS';
                } else {
                  mode = 'NILAI_TUNGGAL';
                }
              }
            }

            // Ambil nilai dari detail rows berdasarkan mode
            if (mode === 'RASIO' && detailRows.length >= 2) {
              // Row 1 = pembilang, Row 2 = penyebut
              const pembRow = detailRows[0].row;
              const penyRow = detailRows[1].row;

              numeratorLabel = String(pembRow[2] || 'Pembilang');
              numeratorValue = parseStringPreserveFormat(pembRow[hasilColIndex]);
              denominatorLabel = String(penyRow[2] || 'Penyebut');
              denominatorValue = parseStringPreserveFormat(penyRow[hasilColIndex]);
              rowsToSkip = 3; // main + 2 detail
            } else if (mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') {
              if (detailRows.length >= 1) {
                const penyRow = detailRows[0].row;
                denominatorLabel = String(penyRow[2] || 'Penyebut');
                denominatorValue = parseStringPreserveFormat(penyRow[hasilColIndex]);
                rowsToSkip = 2; // main + 1 detail
              }
            } else if (mode === 'TEKS' || mode === 'KUALITATIF') {
              if (typeof hasilValue === 'string' && hasilValue !== '') {
                hasilText = hasilValue;
              }
              rowsToSkip = 1; // hanya main row
            } else {
              // RASIO dari mode column tapi tidak ada detail rows
              if (detailRows.length >= 1) {
                // Ada detail rows yang tidak terdeteksi sebelumnya
                if (detailRows.length >= 2) {
                  const pembRow = detailRows[0].row;
                  const penyRow = detailRows[1].row;
                  numeratorLabel = String(pembRow[2] || 'Pembilang');
                  numeratorValue = parseStringPreserveFormat(pembRow[hasilColIndex]);
                  denominatorLabel = String(penyRow[2] || 'Penyebut');
                  denominatorValue = parseStringPreserveFormat(penyRow[hasilColIndex]);
                  rowsToSkip = 3;
                } else {
                  const penyRow = detailRows[0].row;
                  denominatorLabel = String(penyRow[2] || 'Penyebut');
                  denominatorValue = parseStringPreserveFormat(penyRow[hasilColIndex]);
                  rowsToSkip = 2;
                }
              } else {
                rowsToSkip = 1;
              }
            }

            const computedHasilValue = hasilText
              ? ''
              : computeHasilFromValues({
                  numeratorValue,
                  denominatorValue,
                  mode,
                  hasilValue,
                  isPercent,
                  formula: currentIndicator.formula || '',
                });

            const updatedRow = {
              source: sourceNorm,
              sectionLabel: sectionNorm,
              indikator: indikatorNorm,
              year: targetYear,
              quarter: targetQuarter,
              numeratorLabel,
              numeratorValue,
              denominatorLabel,
              denominatorValue,
              pembilangLabel: numeratorLabel,
              pembilangValue: numeratorValue,
              penyebutLabel: denominatorLabel,
              penyebutValue: denominatorValue,
              hasil: computedHasilValue,
              hasilText,
              no: currentIndicator.no || '',
              subNo: currentIndicator.subNo || '',
              bobotSection: currentIndicator.bobotSection || '',
              bobotIndikator: currentIndicator.bobotIndikator || '',
              sumberRisiko: currentIndicator.sumberRisiko || '',
              dampak: currentIndicator.dampak || '',
              low: currentIndicator.low || riskLevels.low || '',
              lowToModerate: currentIndicator.lowToModerate || riskLevels.lowToModerate || '',
              moderate: currentIndicator.moderate || riskLevels.moderate || '',
              moderateToHigh: currentIndicator.moderateToHigh || riskLevels.moderateToHigh || '',
              high: currentIndicator.high || riskLevels.high || '',
              keterangan: currentIndicator.keterangan || '',
              mode: mode || currentIndicator.mode || 'RASIO',
              formula: currentIndicator.formula || '',
              isPercent: inferredIsPercent,
              peringkat: 0,
              weighted: 0,
              isFinal: true,
            };

            console.log(`[IMPORT ROW] ${sourceNorm} | "${indikatorNorm}" | Mode: ${mode} | Skip: ${rowsToSkip} | Pembilang: "${numeratorLabel}"="${numeratorValue}" | Penyebut: "${denominatorLabel}"="${denominatorValue}"`);

            // Tambahkan ke array yang sesuai
            const year = targetYear;
            const quarter = targetQuarter;
            switch (sourceNorm) {
              case 'INVESTASI':
                updates.investasiRows.push({ ...updatedRow, year, quarter });
                break;
              case 'PASAR':
                updates.pasarRows.push({ ...updatedRow, year, quarter });
                break;
              case 'LIKUIDITAS':
                updates.likuiditasRows.push({ ...updatedRow, year, quarter });
                break;
              case 'OPERASIONAL':
                updates.operasionalRows.push({ ...updatedRow, year, quarter });
                break;
              case 'HUKUM':
                updates.hukumRows.push({ ...updatedRow, year, quarter });
                break;
              case 'STRATEJIK':
                updates.stratejikRows.push({ ...updatedRow, year, quarter });
                break;
              case 'KEPATUHAN':
                updates.kepatuhanRows.push({ ...updatedRow, year, quarter, isPercent: true });
                break;
              case 'REPUTASI':
                updates.reputasiRows.push({ ...updatedRow, year, quarter });
                break;
            }

            i += rowsToSkip;
            parsedCount++;
          } else {
            // =====================================================================
            // PROSES TAHUNAN: multiple kolom quarter
            // =====================================================================
            // Scan detail rows
            const detailRows = [];
            let scanIdx = i + 1;
            while (scanIdx < jsonData.length && isDetailRow(jsonData[scanIdx])) {
              detailRows.push({ row: jsonData[scanIdx], originalIdx: scanIdx });
              scanIdx++;
            }

            let mode = modeFromCol;
            let rowsToSkip = 1;

            if (!mode) {
              if (detailRows.length >= 2) {
                mode = 'RASIO';
              } else if (detailRows.length === 1) {
                mode = 'NILAI_TUNGGAL';
              } else {
                mode = 'NILAI_TUNGGAL';
              }
            }

            if (mode === 'RASIO' && detailRows.length >= 2) {
              rowsToSkip = 3;
            } else if ((mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') && detailRows.length >= 1) {
              rowsToSkip = 2;
            } else if (mode === 'TEKS' || mode === 'KUALITATIF') {
              rowsToSkip = 1;
            } else {
              rowsToSkip = Math.max(1, detailRows.length + 1);
            }

            // Process per quarter
            quarterColumns.forEach(({ quarter, colIndex }) => {
              const rawHasilValue = mainRow[colIndex];

              let numeratorValue = '';
              let denominatorValue = '';
              let numeratorLabel = currentIndicator.numeratorLabel || currentIndicator.pembilangLabel || 'Pembilang';
              let denominatorLabel = currentIndicator.denominatorLabel || currentIndicator.penyebutLabel || 'Penyebut';
              let hasilText = '';

              if (mode === 'RASIO' && detailRows.length >= 2) {
                const pembRow = detailRows[0].row;
                const penyRow = detailRows[1].row;
                numeratorLabel = String(pembRow[2] || 'Pembilang');
                numeratorValue = parseStringPreserveFormat(pembRow[colIndex]);
                denominatorLabel = String(penyRow[2] || 'Penyebut');
                denominatorValue = parseStringPreserveFormat(penyRow[colIndex]);
              } else if ((mode === 'NILAI_TUNGGAL' || mode === 'NILAI_TUNGGAL_PENY') && detailRows.length >= 1) {
                const penyRow = detailRows[0].row;
                denominatorLabel = String(penyRow[2] || 'Penyebut');
                denominatorValue = parseStringPreserveFormat(penyRow[colIndex]);
              } else if (mode === 'TEKS' || mode === 'KUALITATIF') {
                if (typeof rawHasilValue === 'string' && rawHasilValue !== '') {
                  hasilText = rawHasilValue;
                }
              }

              // Skip jika tidak ada data untuk quarter ini
              const hasData = numeratorValue !== '' || denominatorValue !== '' || rawHasilValue !== '' || hasilText !== '';
              if (!hasData) return;

              const computedHasilValue = hasilText
                ? ''
                : computeHasilFromValues({
                    numeratorValue,
                    denominatorValue,
                    mode,
                    hasilValue: rawHasilValue,
                    isPercent,
                    formula: currentIndicator.formula || '',
                  });

              const updatedRow = {
                source: sourceNorm,
                sectionLabel: sectionNorm,
                indikator: indikatorNorm,
                year: targetYear,
                quarter,
                numeratorLabel,
                numeratorValue,
                denominatorLabel,
                denominatorValue,
                pembilangLabel: numeratorLabel,
                pembilangValue: numeratorValue,
                penyebutLabel: denominatorLabel,
                penyebutValue: denominatorValue,
                hasil: computedHasilValue,
                hasilText,
                no: currentIndicator.no || '',
                subNo: currentIndicator.subNo || '',
                bobotSection: currentIndicator.bobotSection || '',
                bobotIndikator: currentIndicator.bobotIndikator || '',
                sumberRisiko: currentIndicator.sumberRisiko || '',
                dampak: currentIndicator.dampak || '',
                low: currentIndicator.low || riskLevels.low || '',
                lowToModerate: currentIndicator.lowToModerate || riskLevels.lowToModerate || '',
                moderate: currentIndicator.moderate || riskLevels.moderate || '',
                moderateToHigh: currentIndicator.moderateToHigh || riskLevels.moderateToHigh || '',
                high: currentIndicator.high || riskLevels.high || '',
                keterangan: currentIndicator.keterangan || '',
                mode: mode || currentIndicator.mode || 'RASIO',
                formula: currentIndicator.formula || '',
                isPercent: inferredIsPercent,
                peringkat: 0,
                weighted: 0,
                isFinal: true,
              };

              switch (sourceNorm) {
                case 'INVESTASI':
                  updates.investasiRows.push(updatedRow);
                  break;
                case 'PASAR':
                  updates.pasarRows.push(updatedRow);
                  break;
                case 'LIKUIDITAS':
                  updates.likuiditasRows.push(updatedRow);
                  break;
                case 'OPERASIONAL':
                  updates.operasionalRows.push(updatedRow);
                  break;
                case 'HUKUM':
                  updates.hukumRows.push(updatedRow);
                  break;
                case 'STRATEJIK':
                  updates.stratejikRows.push(updatedRow);
                  break;
                case 'KEPATUHAN':
                  updates.kepatuhanRows.push({ ...updatedRow, isPercent: true });
                  break;
                case 'REPUTASI':
                  updates.reputasiRows.push(updatedRow);
                  break;
              }
            });

            i += rowsToSkip;
            parsedCount++;
          }
        }

        console.log('%c=== IMPORT SUMMARY ===', 'color: #9333EA; font-weight: bold');
        console.log(`📊 Total indicators parsed: ${parsedCount}`);
        console.log('📊 By source:', {
          INVESTASI: updates.investasiRows.length,
          PASAR: updates.pasarRows.length,
          LIKUIDITAS: updates.likuiditasRows.length,
          OPERASIONAL: updates.operasionalRows.length,
          STRATEJIK: updates.stratejikRows.length,
          KEPATUHAN: updates.kepatuhanRows.length,
          REPUTASI: updates.reputasiRows.length,
          HUKUM: updates.hukumRows.length,
        });
        console.log('%c=== IMPORT COMPLETE ===', 'color: #10B981; font-weight: bold');

        resolve(updates);
      } catch (error) {
        console.error('[IMPORT] Fatal error:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}
