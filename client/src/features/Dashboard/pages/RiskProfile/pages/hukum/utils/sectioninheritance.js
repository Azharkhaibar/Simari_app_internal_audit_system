const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

/**
 * Dapatkan triwulan sebelumnya secara langsung
 * Q1 → Q4 tahun sebelumnya, Q2 → Q1, Q3 → Q2, Q4 → Q3
 */
export function getImmediatePreviousQuarter(year, quarter) {
  const qIndex = QUARTERS.indexOf(quarter);

  if (qIndex === 0) {
    // Q1 → Q4 tahun sebelumnya
    return { year: Number(year) - 1, quarter: 'Q4' };
  } else {
    // Q2 → Q1, Q3 → Q2, Q4 → Q3
    return { year: Number(year), quarter: QUARTERS[qIndex - 1] };
  }
}

/**
 * Cari periode sebelumnya yang punya section data
 * berjalan mundur per quarter (lintas tahun)
 */
export function findPreviousPeriodWithSections(year, quarter, allSections) {
  let qIndex = QUARTERS.indexOf(quarter);
  let y = Number(year);

  // Cek sampai 8 langkah mundur (2 tahun)
  for (let step = 0; step < 8; step++) {
    qIndex -= 1;
    if (qIndex < 0) {
      qIndex = 3;
      y -= 1;
    }
    const q = QUARTERS[qIndex];
    const hasData = allSections.some((s) => s.year === y && s.quarter === q && !s.isVirtual);

    if (hasData) {
      return { year: y, quarter: q };
    }
  }

  return null;
}

/**
 * Get sections untuk periode tertentu
 * Hanya return direct sections - TIDAK ADA virtual inheritance
 * Quarter menjadi independent setelah memiliki sections
 */
export function getSectionsForPeriod(year, quarter, allSections) {
  // Return ONLY direct sections for this period
  const directSections = allSections.filter((s) => s.year === year && s.quarter === quarter && !s.isVirtual);

  return directSections;
}

/**
 * Tambah section baru ke periode tertentu
 */
export function addSectionToPeriod(year, quarter, sectionData, allSections) {
  const newSection = {
    id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year,
    quarter,
    no: sectionData.no || '',
    bobotSection: Number(sectionData.bobotSection || 0),
    parameter: sectionData.parameter || '',
    indicators: sectionData.indicators || [],
    inheritedFrom: null,
    isVirtual: false,
  };

  return [...allSections, newSection];
}

/**
 * Update section di periode tertentu
 */
export function updateSectionInPeriod(sectionId, year, quarter, updates, allSections) {
  return allSections.map((s) =>
    s.id === sectionId && s.year === year && s.quarter === quarter
      ? {
          ...s,
          ...updates,
          inheritedFrom: null, // Remove inherited flag when modified
          isVirtual: false,
        }
      : s,
  );
}

/**
 * Hapus section dari periode tertentu
 */
export function deleteSectionFromPeriod(sectionId, year, quarter, allSections) {
  return allSections.filter((s) => !(s.id === sectionId && s.year === year && s.quarter === quarter));
}

/**
 * Clone sections dari periode sumber ke periode target
 */
export function cloneSectionsFromPeriod(fromYear, fromQuarter, toYear, toQuarter, allSections, deletedSections = new Map()) {
  const sourceSections = allSections.filter((s) => s.year === fromYear && s.quarter === fromQuarter);

  if (sourceSections.length === 0) {
    return allSections;
  }

  // Get sections deleted in the TARGET period
  const targetPeriodKey = `${toYear}|${toQuarter}`;
  const targetDeletedSet = deletedSections.get(targetPeriodKey) || new Set();

  // Get existing sections in target period (for deduplication)
  const existingTargetSections = allSections.filter((s) => s.year === toYear && s.quarter === toQuarter);
  const existingNoParamSet = new Set(existingTargetSections.map((s) => `${s.no}|${s.parameter}`));

  // Filter out sections that are deleted in the target period OR already exist
  const filteredSections = sourceSections.filter((s) => {
    const key = `${s.no}|${s.parameter}`;
    return !targetDeletedSet.has(key) && !existingNoParamSet.has(key);
  });

  if (filteredSections.length === 0) {
    return allSections;
  }

  const clonedSections = filteredSections.map((s) => ({
    ...s,
    id: `s-${toYear}-${toQuarter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year: toYear,
    quarter: toQuarter,
    inheritedFrom: `${fromYear}-${fromQuarter}`,
    isVirtual: true,
  }));

  return [...allSections, ...clonedSections];
}

/**
 * Cek apakah periode tertentu punya section langsung (bukan virtual)
 */
export function hasDirectSectionsInPeriod(year, quarter, allSections) {
  return allSections.some((s) => s.year === year && s.quarter === quarter && !s.isVirtual);
}

/**
 * Cek apakah periode tertentu punya section (baik direct maupun virtual)
 */
export function hasAnySectionsInPeriod(year, quarter, allSections) {
  return allSections.some((s) => s.year === year && s.quarter === quarter);
}

/**
 * Auto-clone sections ke periode baru HANYA jika quarter KOSONG (belum ada direct sections)
 * Setelah clone, quarter menjadi INDEPENDENT dan tidak menerima update dari quarter sebelumnya
 */
export function autoCloneSectionsIfNeeded(viewYear, viewQuarter, allSections) {
  // Hanya clone jika BELUM ADA direct sections sama sekali
  if (hasDirectSectionsInPeriod(viewYear, viewQuarter, allSections)) {
    return allSections;
  }

  // Dapatkan triwulan sebelumnya
  const prevPeriod = getImmediatePreviousQuarter(viewYear, viewQuarter);

  // Cek apakah triwulan sebelumnya punya direct sections
  if (!hasDirectSectionsInPeriod(prevPeriod.year, prevPeriod.quarter, allSections)) {
    return allSections;
  }

  // Clone sebagai DIRECT sections (bukan virtual!)
  const sourceSections = allSections.filter((s) => s.year === prevPeriod.year && s.quarter === prevPeriod.quarter && !s.isVirtual);

  if (sourceSections.length === 0) {
    return allSections;
  }

  const clonedSections = sourceSections.map((s) => ({
    ...s,
    id: `s-${viewYear}-${viewQuarter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year: viewYear,
    quarter: viewQuarter,
    inheritedFrom: null, // No longer tracking inheritance
    isVirtual: false, // Create as DIRECT sections
  }));

  return [...allSections, ...clonedSections];
}

/**
 * Migrasi section dari format v1 ke v2
 * v1: { id, no, bobotSection, parameter }
 * v2: { id, year, quarter, no, bobotSection, parameter, inheritedFrom, indicators }
 */
export function migrateSectionsV1ToV2(v1Sections, currentYear, currentQuarter) {
  if (!v1Sections || v1Sections.length === 0) {
    return [];
  }

  return v1Sections.map((s) => ({
    ...s,
    year: currentYear,
    quarter: currentQuarter,
    inheritedFrom: null,
    isVirtual: false,
    indicators: s.indicators || [],
  }));
}

/**
 * Cek apakah section tertentu di-inherit
 */
export function isInheritedSection(section) {
  return section.inheritedFrom != null;
}

/**
 * Dapatkan semua periode yang punya section data
 */
export function getAllPeriodsWithSections(allSections) {
  const periods = new Set();
  allSections.forEach((s) => {
    if (!s.isVirtual) {
      periods.add(`${s.year}-${s.quarter}`);
    }
  });
  return Array.from(periods).sort().reverse();
}

/**
 * Dapatkan daftar periode tersedia untuk dropdown
 */
export function getAvailablePeriodsList(allSections) {
  const periods = getAllPeriodsWithSections(allSections);
  return periods.map((p) => {
    const [year, quarter] = p.split('-');
    return {
      label: `Q${quarter.replace('Q', '')} ${year}`,
      value: { year: Number(year), quarter },
    };
  });
}
