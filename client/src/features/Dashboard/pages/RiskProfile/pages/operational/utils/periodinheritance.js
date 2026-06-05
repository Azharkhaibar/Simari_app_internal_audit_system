// utils/periodInheritance.js

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

/**
 * Cek apakah period tertentu punya data
 */
export function hasDataInPeriod(year, quarter, rows) {
  return rows.some((r) => Number(r.year) === Number(year) && r.quarter === quarter);
}

/**
 * Cari period sebelumnya yang punya data
 * berjalan mundur per quarter (lintas tahun)
 * PRIORITAS: periode terbaru yang memiliki data (tidak melompat)
 */
export function findPreviousPeriod(year, quarter, rows) {
  let qIndex = QUARTERS.indexOf(quarter);
  let y = Number(year);

  // cek sampai 8 langkah mundur (2 tahun)
  for (let step = 0; step < 8; step++) {
    qIndex -= 1;
    if (qIndex < 0) {
      qIndex = 3;
      y -= 1;
    }
    const q = QUARTERS[qIndex];
    const found = rows.filter((r) => Number(r.year) === y && r.quarter === q);
    if (found.length > 0) {
      // langsung return periode pertama yang ditemukan (periode terbaru)
      return { year: y, quarter: q, rows: found };
    }
  }

  return null;
}

/**
 * Clone data dari period sebelumnya ke period target
 * TIDAK mengubah data lama
 * ✅ PRESERVE ALL METADATA (bobot, sumber risiko, dampak, risk levels, keterangan)
 */
export function cloneFromPreviousPeriod({ rows, targetYear, targetQuarter, sourceLabel = 'AUTO', sections = null }) {
  const alreadyExists = rows.some((r) => Number(r.year) === Number(targetYear) && r.quarter === targetQuarter);
  if (alreadyExists) {
    return { rows, cloned: false };
  }

  const prev = findPreviousPeriod(targetYear, targetQuarter, rows);
  if (!prev) {
    return { rows, cloned: false };
  }

  // ✅ CRITICAL FIX: Clone ALL FIELDS including metadata
  const clonedRows = prev.rows.map((r) => {
    // Start with ALL fields from original row
    const cloned = {
      ...r,

      // Override period
      year: targetYear,
      quarter: targetQuarter,

      // ✅ EXPLICITLY PRESERVE METADATA (to ensure they're not lost)
      // Identifiers
      no: r.no || '',
      subNo: r.subNo || '',
      sectionLabel: r.sectionLabel || '',
      indikator: r.indikator || '',

      // ✅ BOBOT (SANGAT PENTING!)
      bobotSection: r.bobotSection !== undefined && r.bobotSection !== null ? r.bobotSection : '',
      bobotIndikator: r.bobotIndikator !== undefined && r.bobotIndikator !== null ? r.bobotIndikator : '',

      // ✅ SUMBER RISIKO & DAMPAK
      sumberRisiko: r.sumberRisiko || '',
      dampak: r.dampak || '',

      // ✅ RISK LEVELS
      low: r.low || '',
      lowToModerate: r.lowToModerate || '',
      moderate: r.moderate || '',
      moderateToHigh: r.moderateToHigh || '',
      high: r.high || '',

      // ✅ KETERANGAN
      keterangan: r.keterangan || '',

      // ✅ MODE & FORMULA
      mode: r.mode || 'RASIO',
      formula: r.formula || '',
      isPercent: r.isPercent !== undefined ? r.isPercent : false,

      // ✅ LABELS (with alias support)
      numeratorLabel: r.numeratorLabel || r.pembilangLabel || '',
      denominatorLabel: r.denominatorLabel || r.penyebutLabel || '',
      pembilangLabel: r.pembilangLabel || r.numeratorLabel || '',
      penyebutLabel: r.penyebutLabel || r.denominatorLabel || '',

      // ✅ VALUES (user can edit these later)
      numeratorValue: r.numeratorValue !== undefined && r.numeratorValue !== null ? r.numeratorValue : r.pembilangValue || '',
      denominatorValue: r.denominatorValue !== undefined && r.denominatorValue !== null ? r.denominatorValue : r.penyebutValue || '',
      pembilangValue: r.pembilangValue !== undefined && r.pembilangValue !== null ? r.pembilangValue : r.numeratorValue || '',
      penyebutValue: r.penyebutValue !== undefined && r.penyebutValue !== null ? r.penyebutValue : r.denominatorValue || '',

      // ✅ HASIL & PERINGKAT (will be recalculated if user edits values)
      hasil: r.hasil !== undefined && r.hasil !== null ? r.hasil : '',
      hasilText: r.hasilText || '',
      peringkat: r.peringkat !== undefined && r.peringkat !== null ? r.peringkat : 0,
      weighted: r.weighted !== undefined && r.weighted !== null ? r.weighted : 0,

      // Inheritance markers
      inheritedFrom: `${prev.year}-${prev.quarter}`,
      inheritedAt: Date.now(),
      source: sourceLabel !== 'AUTO' ? sourceLabel : r.source || sourceLabel,
      isFinal: false, // User belum edit
    };

    return cloned;
  });

  // ✅ DEBUG LOG
  console.log(`%c[CLONE] Cloned ${clonedRows.length} rows from ${prev.year}-${prev.quarter} to ${targetYear}-${targetQuarter}`, 'color: #10B981; font-weight: bold');

  if (clonedRows.length > 0) {
    const sample = clonedRows[0];
    console.log('[CLONE] Sample cloned row:', {
      indikator: sample.indikator,
      bobotSection: sample.bobotSection !== '' ? sample.bobotSection : '(empty)',
      bobotIndikator: sample.bobotIndikator !== '' ? sample.bobotIndikator : '(empty)',
      sumberRisiko: sample.sumberRisiko ? 'HAS_DATA' : 'EMPTY',
      dampak: sample.dampak ? 'HAS_DATA' : 'EMPTY',
      low: sample.low || '(empty)',
      high: sample.high || '(empty)',
      keterangan: sample.keterangan ? 'HAS_DATA' : 'EMPTY',
      mode: sample.mode || 'RASIO',
      formula: sample.formula || '(none)',
      isPercent: sample.isPercent ? 'YES' : 'NO',
    });
  }

  const result = {
    rows: [...rows, ...clonedRows],
    cloned: true,
    from: `${prev.year}-${prev.quarter}`,
    count: clonedRows.length,
  };

  if (sections) {
    const sectionResult = cloneSectionsFromPreviousPeriod({
      sections,
      targetYear,
      targetQuarter,
    });
    result.sections = sectionResult.sections;
    result.sectionsCloned = sectionResult.cloned;
    result.sectionsCount = sectionResult.count;
  }

  return result;
}

/**
 * Clone sections dari period sebelumnya ke period target
 */
export function cloneSectionsFromPreviousPeriod({ sections, targetYear, targetQuarter }) {
  const prev = findPreviousPeriod(targetYear, targetQuarter, []);
  if (!prev) {
    return { sections, cloned: false };
  }

  const prevSections = sections.filter((s) => Number(s.year) === prev.year && s.quarter === prev.quarter);

  if (prevSections.length === 0) {
    return { sections, cloned: false };
  }

  const clonedSections = prevSections.map((s) => ({
    ...s,
    id: `s-${targetYear}-${targetQuarter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year: targetYear,
    quarter: targetQuarter,
  }));

  return {
    sections: [...sections, ...clonedSections],
    cloned: true,
    count: clonedSections.length,
  };
}

/**
 * Undo clone (hapus hanya data hasil inheritance)
 */
export function undoClone({ rows, year, quarter, inheritedFrom }) {
  const cleaned = rows.filter((r) => !(Number(r.year) === Number(year) && r.quarter === quarter && r.inheritedFrom === inheritedFrom));

  return cleaned;
}

/**
 * Undo clone sections (hapus hanya sections hasil clone)
 */
export function undoCloneSections({ sections, targetYear, targetQuarter }) {
  const cleaned = sections.filter((s) => !(Number(s.year) === Number(targetYear) && s.quarter === targetQuarter && s.id.startsWith(`s-${targetYear}-${targetQuarter}-`)));

  return cleaned;
}
