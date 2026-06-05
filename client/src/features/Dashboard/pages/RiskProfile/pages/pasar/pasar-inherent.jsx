// src/features/Dashboard/pages/RiskProfile/pages/Pasar/components/PasarInherent.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Trash2, Edit3, Search, Plus, ChevronDown } from 'lucide-react';
// import { calculatePeringkat, calculatePeringkatFromText, isNumericRiskLevels } from '../utils/pasar/riskcalculator';
import { calculatePeringkat, calculatePeringkatFromText, isNumericRiskLevels } from './utils/pasar/riskcalculator';
// ==== Komponen & Utils ====
import DataTable from './components/pasar/datatable-pasar';
import { RiskField, YearInput, QuarterSelect } from './components/pasar/input-pasar';
import { getCurrentQuarter, getCurrentYear } from './utils/pasar/time';
import { computeWeighted, makeEmptyRow } from './utils/pasar/calc';
import { exportPasarToExcel } from './utils/pasar/exportExcel';
import ToastNotification from './components/kpmr-pasar/ToastNotification';

// ==== Hooks & Services ====
import { usePasar } from './hooks/pasar/pasar.hook';
import { useAuditLog } from '../../../audit-log/hooks/audit-log.hooks.js';
import { useAuth } from '@/features/auth/hooks/useAuth.hook';

// ==== Section Inheritance Utils ====
import {
  getSectionsForPeriod,
  addSectionToPeriod,
  updateSectionInPeriod,
  deleteSectionFromPeriod,
  autoCloneSectionsIfNeeded,
  hasDirectSectionsInPeriod,
  getImmediatePreviousQuarter,
  isInheritedSection,
} from './utils/pasar/sectioninheritance';

// ===================== Brand =====================
const PNM_BRAND = {
  primary: '#0068B3',
  primarySoft: '#E6F1FA',
  gradient: 'bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90',
};

// ===================== Pasar: fallback empty row =====================
const pasarFallbackEmpty = (year, quarter) => ({
  year,
  quarter,
  no: '',
  subNo: '',
  sectionLabel: '',
  indikator: '',
  bobotSection: 0,
  bobotIndikator: 0,
  sumberRisiko: '',
  dampak: '',
  low: 'x ≤ 1%',
  lowToModerate: '1% < x ≤ 2%',
  moderate: '2% < x ≤ 3%',
  moderateToHigh: '3% < x ≤ 4%',
  high: 'x > 4%',
  numeratorLabel: '',
  numeratorValue: '',
  denominatorLabel: '',
  denominatorValue: '',
  mode: 'RASIO',
  formula: '',
  isPercent: false,
  hasil: '',
  hasilText: '',
  peringkat: 1,
  weighted: '',
  keterangan: '',
});

// ===== Helper Functions =====
const isNegativePattern = (s) => {
  if (!s) return false;
  const trimmed = String(s).trim();
  return trimmed.startsWith('-') || trimmed.endsWith('-');
};

const parseNum = (v) => {
  if (v == null || v === '') return undefined;

  let s = String(v).trim();

  let isNegative = false;
  if (s.startsWith('-')) {
    isNegative = true;
    s = s.substring(1);
  } else if (s.endsWith('-')) {
    isNegative = true;
    s = s.slice(0, -1);
  }

  const isPercent = s.includes('%');
  if (isPercent) {
    s = s.replace(/%/g, '');
  }

  s = s.trim();
  if (s === '') return undefined;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');

  let num;
  if (lastComma > lastDot && lastComma !== -1) {
    const cleaned = s.replace(/\./g, '').replace(',', '.');
    num = parseFloat(cleaned);
  } else if (lastDot > lastComma && lastDot !== -1) {
    const cleaned = s.replace(/,/g, '');
    num = parseFloat(cleaned);
  } else {
    const cleaned = s.replace(/[.,]/g, '');
    num = parseFloat(cleaned);
  }

  if (isNaN(num)) return undefined;

  if (isNegative) num = -Math.abs(num);
  if (isPercent) num = num / 100;

  return num;
};

const fmtNumber = (v) => {
  if (v === '' || v == null) return '';

  const s = String(v).trim();

  if (s.includes('%')) {
    const numPart = s.replace(/%/g, '').trim();
    const num = parseNum(numPart);
    if (isNaN(num)) return s;
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    }).format(num);
    return formatted + '%';
  }

  const num = parseNum(s);
  if (isNaN(num)) return '';

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 10,
  }).format(num);
};

const formatIntWithDots = (intVal) => {
  const isNeg = intVal < 0;
  const s = String(Math.abs(Math.trunc(intVal)));
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) result += '.';
    result += s[i];
  }
  return (isNeg ? '-' : '') + result;
};

const fmtNumberSmart = (rawStr) => {
  if (!rawStr || !rawStr.trim()) return '';

  const s = rawStr.trim();

  if (s === '-' || s === ',' || s === '.') return s;

  if (s.includes('%')) {
    const withoutPct = s.replace('%', '').trim();
    const isNegPct = withoutPct.startsWith('-') || withoutPct.endsWith('-');
    const cleanPct = withoutPct.replace(/-/g, '').trim();

    const lastC = cleanPct.lastIndexOf(',');
    const lastD = cleanPct.lastIndexOf('.');

    let intRaw, decStr;
    if (lastC > lastD && lastC !== -1) {
      intRaw = cleanPct.slice(0, lastC).replace(/[.,]/g, '');
      decStr = cleanPct.slice(lastC + 1);
    } else if (lastD > lastC && lastD !== -1) {
      intRaw = cleanPct.slice(0, lastD).replace(/[.,]/g, '');
      decStr = cleanPct.slice(lastD + 1);
    } else {
      intRaw = cleanPct.replace(/[.,]/g, '');
      decStr = null;
    }

    const intNum = parseInt(intRaw || '0', 10);
    const intFormatted = formatIntWithDots(isNegPct ? -intNum : intNum);
    return decStr !== null ? `${intFormatted},${decStr}%` : `${intFormatted}%`;
  }

  if (s.endsWith(',') || s.endsWith('.')) {
    const numPart = s.slice(0, -1);
    if (!numPart || numPart === '-') return s;
    const num = parseNum(numPart);
    if (!isFinite(num)) return s;
    return formatIntWithDots(Math.trunc(num)) + ',';
  }

  const lastCommaIdx = s.lastIndexOf(',');
  const lastDotIdx = s.lastIndexOf('.');

  let decimalStr = null;
  if (lastCommaIdx > lastDotIdx && lastCommaIdx > 0) {
    decimalStr = s.slice(lastCommaIdx + 1);
  } else if (lastDotIdx > lastCommaIdx && lastDotIdx > 0) {
    decimalStr = s.slice(lastDotIdx + 1);
  }

  const num = parseNum(s);
  if (!isFinite(num)) return s;

  const intPart = Math.trunc(num);
  const intFormatted = formatIntWithDots(intPart);

  return decimalStr !== null ? `${intFormatted},${decimalStr}` : intFormatted;
};

const computePasarHasil = (row) => {
  const mode = row.mode || 'RASIO';

  if (mode === 'TEKS') {
    return '';
  }

  const pemb = parseNum(row.numeratorValue);
  const peny = parseNum(row.denominatorValue);

  if (row.formula && row.formula.trim() !== '') {
    try {
      const expr = row.formula.replace(/\bpemb\b/g, 'pemb').replace(/\bpeny\b/g, 'peny');
      const fn = new Function('pemb', 'peny', `return (${expr});`);
      const res = fn(pemb, peny);
      if (!isFinite(res) || isNaN(res)) return '';
      return Number(res);
    } catch (e) {
      console.warn('Invalid formula:', row.formula, e);
      return '';
    }
  }

  if (mode === 'NILAI_TUNGGAL') {
    const raw = row.denominatorValue;
    if (raw === '' || raw == null) return '';
    const val = parseNum(raw);
    if (!isFinite(val) || isNaN(val)) return '';
    return Number(val);
  }

  if (peny === 0) return '';
  const result = pemb / peny;
  if (!isFinite(result) || isNaN(result)) return '';
  return Number(result);
};

const computeWeightedLocal = (bobotSection, bobotIndikator, peringkat) => {
  const s = Number(bobotSection || 0);
  const b = Number(bobotIndikator || 0);
  const p = Number(peringkat || 0);
  const res = (s * b * p) / 10000;
  if (!isFinite(res) || isNaN(res)) return 0;
  return res;
};

export default function PasarInherent({ viewYear, viewQuarter, onViewYearChange, onViewQuarterChange, query, onQueryChange }) {
  const [showPasarForm, setShowPasarForm] = useState(false);

  // ========== TOAST NOTIFICATION STATE ==========
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const clearToast = () => setToast({ show: false, message: '', type: 'success' });

  // ========== AUDIT LOG ==========
  const { user: authUser } = useAuth();
  const { logCreate, logUpdate, logDelete, logExport } = useAuditLog();

  const getCurrentUser = () => {
    if (authUser && authUser.user_id) {
      return { id: authUser.user_id, name: authUser.userID || authUser.username || 'Unknown', role: authUser.role || 'User' };
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.user_id) {
        return { id: storedUser.user_id, name: storedUser.userID || storedUser.username || 'Unknown', role: storedUser.role || 'User' };
      }
    } catch (e) { console.warn('Cannot parse user from localStorage:', e); }
    return { id: null, name: 'System', role: 'System' };
  };

  const currentUser = getCurrentUser();

  // ====== HOOK PASAR ======
  const {
    sections,
    sectionsWithIndicators,
    loading,
    error,
    setViewYear: setHookYear,
    setViewQuarter: setHookQuarter,
    clearError,
    createSection,
    updateSection,
    deleteSection,
    createIndikator,
    updateIndikator,
    deleteIndikator,
    transformToBackend,
  } = usePasar({
    initialYear: Number(viewYear),
    initialQuarter: viewQuarter,
    autoLoad: true,
  });

  // Sync hook dengan props
  useEffect(() => {
    setHookYear(viewYear);
  }, [viewYear, setHookYear]);

  useEffect(() => {
    setHookQuarter(viewQuarter);
  }, [viewQuarter, setHookQuarter]);

  useEffect(() => {
    const checkAndCloneSections = async () => {
      try {
        const needsClone = !hasDirectSectionsInPeriod(viewYear, viewQuarter, sections || []);

        if (needsClone) {
          const prevPeriod = getImmediatePreviousQuarter(viewYear, viewQuarter);
          const prevHasSections = hasDirectSectionsInPeriod(prevPeriod.year, prevPeriod.quarter, sections || []);

          if (prevHasSections) {
            const prevSections = sections.filter((s) => s.year === prevPeriod.year && s.quarter === prevPeriod.quarter && !s.isVirtual);

            for (const section of prevSections) {
              const sectionData = {
                no: section.no,
                bobotSection: section.bobotSection,
                parameter: section.parameter,
                year: viewYear,
                quarter: viewQuarter,
                isActive: true,
              };

              await createSection(sectionData);
            }

            setInheritInfo({
              from: `${prevPeriod.year}-${prevPeriod.quarter}`,
              count: prevSections.length,
            });
            showToast(`${prevSections.length} section berhasil di-clone dari periode ${prevPeriod.year}-${prevPeriod.quarter}`, 'info');

            // Log auto-clone ke audit log
            await logCreate('PASAR', `Auto-clone ${prevSections.length} section Pasar dari ${prevPeriod.year}-TW${prevPeriod.quarter} ke ${viewYear}-TW${viewQuarter}`, {
              userId: currentUser.id,
              isSuccess: true,
              metadata: {
                year: viewYear,
                quarter: viewQuarter,
                clonedFrom: `${prevPeriod.year}-TW${prevPeriod.quarter}`,
                sectionCount: prevSections.length,
                sections: prevSections.map((s) => ({ no: s.no, parameter: s.parameter })),
              },
            });
          }
        }
      } catch (err) {
        console.error('Error auto-cloning sections:', err);
        showToast('Gagal melakukan auto-clone sections', 'error');
      }
    };

    checkAndCloneSections();
  }, [viewYear, viewQuarter]);

  // ----- SECTION LIST -----
  const [PASAR_sectionForm, setPASAR_sectionForm] = useState({
    id: 0,
    no: '',
    bobotSection: 0,
    sectionLabel: '',
  });

  const [isAddingNewSection, setIsAddingNewSection] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [newlyAddedSections, setNewlyAddedSections] = useState(new Set());
  const [inheritInfo, setInheritInfo] = useState(null);

  const currentPeriodSections = useMemo(() => {
    if (!sections) return [];
    return getSectionsForPeriod(viewYear, viewQuarter, sections);
  }, [sections, viewYear, viewQuarter]);

  function PASAR_selectSection(id) {
    const s = currentPeriodSections.find((x) => x.id === id);
    if (s) {
      setPASAR_sectionForm({
        id: s.id,
        no: s.no,
        bobotSection: s.bobotSection,
        sectionLabel: s.parameter,
      });
      setIsAddingNewSection(false);
      setIsEditingSection(false);
    }
  }

  async function PASAR_addSection() {
    if (!PASAR_sectionForm.no || !PASAR_sectionForm.sectionLabel) {
      showToast('No Section dan Section Label harus diisi!', 'error');
      return;
    }

    const sectionData = {
      no: PASAR_sectionForm.no,
      bobotSection: Number(PASAR_sectionForm.bobotSection || 0),
      parameter: PASAR_sectionForm.sectionLabel,
      year: viewYear,
      quarter: viewQuarter,
      isActive: true,
    };

    try {
      const newSection = await createSection(sectionData);
      setNewlyAddedSections((prev) => new Set([...prev, newSection.id]));

      setPASAR_sectionForm({
        id: newSection.id,
        no: newSection.no,
        bobotSection: newSection.bobotSection,
        sectionLabel: newSection.parameter,
      });

      setIsAddingNewSection(false);
      setIsEditingSection(false);
      showToast(`Section "${newSection.parameter}" berhasil ditambahkan`, 'success');

      // Log CREATE section
      await logCreate('PASAR', `Tambah section baru: ${newSection.parameter} (No: ${newSection.no})`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { sectionId: newSection.id, no: newSection.no, parameter: newSection.parameter, bobotSection: newSection.bobotSection, year: viewYear, quarter: viewQuarter },
      });
    } catch (err) {
      console.error('Failed to add section:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menambahkan section';
      showToast(errorMessage, 'error');
      await logCreate('PASAR', `Gagal tambah section: ${PASAR_sectionForm.sectionLabel}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: errorMessage, year: viewYear, quarter: viewQuarter },
      });
    }
  }

  async function PASAR_saveSection() {
    if (!PASAR_sectionForm.id) return;

    const sectionData = {
      no: PASAR_sectionForm.no,
      bobotSection: Number(PASAR_sectionForm.bobotSection || 0),
      parameter: PASAR_sectionForm.sectionLabel,
    };

    try {
      await updateSection(PASAR_sectionForm.id, sectionData);
      setIsAddingNewSection(false);
      setIsEditingSection(false);
      showToast(`Section "${sectionData.parameter}" berhasil diupdate`, 'success');

      // Log UPDATE section
      await logUpdate('PASAR', `Update section: ${sectionData.parameter} (No: ${sectionData.no})`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { sectionId: PASAR_sectionForm.id, no: sectionData.no, parameter: sectionData.parameter, bobotSection: sectionData.bobotSection, year: viewYear, quarter: viewQuarter },
      });
    } catch (err) {
      console.error('Failed to update section:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal mengupdate section';
      showToast(errorMessage, 'error');
      await logUpdate('PASAR', `Gagal update section: ${sectionData.parameter}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: errorMessage, sectionId: PASAR_sectionForm.id, year: viewYear, quarter: viewQuarter },
      });
    }
  }

  async function PASAR_removeSection(id) {
    const sectionToDelete = currentPeriodSections.find((s) => s.id === id);

    if (!sectionToDelete) {
      console.warn('[PASAR_removeSection] Section not found:', id);
      showToast('Section tidak ditemukan', 'error');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus section "${sectionToDelete.parameter}"? Semua indikator dalam section ini akan ikut terhapus.`)) {
      return;
    }

    try {
      await deleteSection(id);

      setNewlyAddedSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sectionToDelete.id);
        return newSet;
      });

      setPASAR_sectionForm({
        id: 0,
        no: '',
        bobotSection: 0,
        sectionLabel: '',
      });

      setIsAddingNewSection(false);
      setIsEditingSection(false);
      showToast(`Section "${sectionToDelete.parameter}" berhasil dihapus`, 'success');

      // Log DELETE section
      await logDelete('PASAR', `Hapus section: ${sectionToDelete.parameter} (No: ${sectionToDelete.no})`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { sectionId: id, no: sectionToDelete.no, parameter: sectionToDelete.parameter, bobotSection: sectionToDelete.bobotSection, year: viewYear, quarter: viewQuarter },
      });
    } catch (err) {
      console.error('Failed to delete section:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menghapus section';
      showToast(errorMessage, 'error');
      await logDelete('PASAR', `Gagal hapus section: ${sectionToDelete.parameter} (ID: ${id})`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: errorMessage, sectionId: id, year: viewYear, quarter: viewQuarter },
      });
    }
  }

  const handleUndoClone = async () => {
    if (!inheritInfo) return;

    try {
      const clonedSections = sections.filter((s) => s.year === viewYear && s.quarter === viewQuarter && s.inheritedFrom);

      for (const section of clonedSections) {
        await deleteSection(section.id);
      }

      setInheritInfo(null);
      showToast('Clone berhasil dibatalkan', 'success');

      // Log undo clone
      await logDelete('PASAR', `Undo clone section Pasar ${viewYear}-TW${viewQuarter} (${clonedSections.length} section dihapus)`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { year: viewYear, quarter: viewQuarter, clonedFrom: inheritInfo?.from, deletedSectionCount: clonedSections.length, sections: clonedSections.map((s) => ({ id: s.id, parameter: s.parameter })) },
      });
    } catch (err) {
      console.error('Error undoing clone:', err);
      showToast('Gagal membatalkan clone', 'error');
      await logDelete('PASAR', `Gagal undo clone section Pasar ${viewYear}-TW${viewQuarter}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: err.message, year: viewYear, quarter: viewQuarter },
      });
    }
  };

  // ----- ROW & FORM -----
  const pasarMakeRow = () =>
    typeof makeEmptyRow === 'function'
      ? {
          ...makeEmptyRow(),
          year: viewYear,
          quarter: viewQuarter,
          mode: 'RASIO',
          formula: '',
          isPercent: false,
          low: 'x ≤ 1%',
          lowToModerate: '1% < x ≤ 2%',
          moderate: '2% < x ≤ 3%',
          moderateToHigh: '3% < x ≤ 4%',
          high: 'x > 4%',
        }
      : pasarFallbackEmpty(viewYear, viewQuarter);

  const [PASAR_form, setPASAR_form] = useState(pasarMakeRow());
  const [PASAR_editingRow, setPASAR_editingRow] = useState(null);
  const [rawNumeratorInput, setRawNumeratorInput] = useState('');
  const [rawDenominatorInput, setRawDenominatorInput] = useState('');

  // Auto-calculate peringkat
  useEffect(() => {
    if (PASAR_form?.mode === 'TEKS') return;
    if (!PASAR_form || !PASAR_sectionForm) return;

    try {
      const baseRow = {
        ...PASAR_form,
        no: PASAR_sectionForm.no || '',
        sectionLabel: PASAR_sectionForm.sectionLabel || '',
        bobotSection: PASAR_sectionForm.bobotSection || 0,
      };

      const hasilNum = computePasarHasil(baseRow);

      if (hasilNum !== '' && hasilNum != null) {
        const newPeringkat = calculatePeringkat(
          hasilNum,
          {
            low: PASAR_form.low || '',
            lowToModerate: PASAR_form.lowToModerate || '',
            moderate: PASAR_form.moderate || '',
            moderateToHigh: PASAR_form.moderateToHigh || '',
            high: PASAR_form.high || '',
          },
          PASAR_form.isPercent || false,
        );
        if (PASAR_form.peringkat !== newPeringkat) {
          setPASAR_form((prev) => ({ ...prev, peringkat: newPeringkat }));
        }
      }
    } catch (err) {
      console.warn('[PASAR] Peringkat calculation failed:', err);
    }
  }, [
    PASAR_form?.low,
    PASAR_form?.lowToModerate,
    PASAR_form?.moderate,
    PASAR_form?.moderateToHigh,
    PASAR_form?.numeratorValue,
    PASAR_form?.denominatorValue,
    PASAR_form?.formula,
    PASAR_form?.isPercent,
    PASAR_form?.mode,
    PASAR_sectionForm?.bobotSection,
  ]);

  // Auto-calculate untuk TEKS mode
  useEffect(() => {
    if (PASAR_form?.mode !== 'TEKS') return;
    if (!PASAR_form) return;

    try {
      const riskLevels = {
        low: PASAR_form.low || '',
        lowToModerate: PASAR_form.lowToModerate || '',
        moderate: PASAR_form.moderate || '',
        moderateToHigh: PASAR_form.moderateToHigh || '',
        high: PASAR_form.high || '',
      };

      let newPeringkat = 0;

      if (isNumericRiskLevels(riskLevels)) {
        const hasilNum = parseFloat(PASAR_form.hasilText);
        if (!isNaN(hasilNum)) {
          newPeringkat = calculatePeringkat(hasilNum, riskLevels, true);
        }
      } else {
        newPeringkat = calculatePeringkatFromText(PASAR_form.hasilText || '', riskLevels);
      }

      if (PASAR_form.peringkat !== newPeringkat) {
        setPASAR_form((prev) => ({ ...prev, peringkat: newPeringkat }));
      }
    } catch (err) {
      console.warn('[PASAR] TEKS peringkat calculation failed:', err);
    }
  }, [PASAR_form?.mode, PASAR_form?.hasilText, PASAR_form?.low, PASAR_form?.lowToModerate, PASAR_form?.moderate, PASAR_form?.moderateToHigh, PASAR_form?.high]);

  const sectionsInCurrentQuarter = useMemo(() => {
    return currentPeriodSections.map((section) => ({
      no: section.no,
      label: section.parameter,
    }));
  }, [currentPeriodSections]);

  const PASAR_filtered = useMemo(() => {
    if (!sectionsWithIndicators || !sectionsWithIndicators.length) {
      return [];
    }

    const allIndicators = sectionsWithIndicators.flatMap((section) => {
      if (!section.indicators || !section.indicators.length) {
        return [];
      }

      return section.indicators.map((ind) => ({
        id: ind.id,
        subNo: ind.subNo,
        indikator: ind.indikator,
        bobotIndikator: ind.bobotIndikator,
        sumberRisiko: ind.sumberRisiko,
        dampak: ind.dampak,
        pembilangLabel: ind.pembilangLabel,
        pembilangValue: ind.pembilangValue,
        penyebutLabel: ind.penyebutLabel,
        penyebutValue: ind.penyebutValue,
        low: ind.low,
        lowToModerate: ind.lowToModerate,
        moderate: ind.moderate,
        moderateToHigh: ind.moderateToHigh,
        high: ind.high,
        mode: ind.mode,
        formula: ind.formula,
        isPercent: ind.isPercent,
        hasil: ind.hasil,
        hasilText: ind.hasilText,
        peringkat: ind.peringkat,
        weighted: ind.weighted,
        keterangan: ind.keterangan,
        no: section.no,
        sectionLabel: section.parameter,
        bobotSection: section.bobotSection,
        year: section.year || viewYear,
        quarter: section.quarter || viewQuarter,
        sectionId: ind.sectionId || section.id,
        numeratorLabel: ind.pembilangLabel,
        numeratorValue: ind.pembilangValue,
        denominatorLabel: ind.penyebutLabel,
        denominatorValue: ind.penyebutValue,
      }));
    });

    const filtered = allIndicators
      .filter((r) => {
        const matchYear = (r.year || viewYear) === viewYear;
        const matchQuarter = (r.quarter || viewQuarter) === viewQuarter;
        return matchYear && matchQuarter;
      })
      .filter((r) => {
        const searchText = `${r.no} ${r.subNo} ${r.sectionLabel} ${r.indikator} ${r.keterangan || ''} ${r.sumberRisiko || ''} ${r.dampak || ''}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .sort((a, b) => `${a.subNo}`.localeCompare(`${b.subNo}`, undefined, { numeric: true }));

    return filtered;
  }, [sectionsWithIndicators, viewYear, viewQuarter, query]);

  const PASAR_totalWeighted = useMemo(() => PASAR_filtered.reduce((sum, r) => sum + (Number(r.weighted || 0) || 0), 0), [PASAR_filtered]);

  const PASAR_resetForm = () => {
    setPASAR_form(pasarMakeRow());
    setPASAR_editingRow(null);
    setRawNumeratorInput('');
    setRawDenominatorInput('');
  };

  const buildBaseRow = () => {
    const peringkatNum = PASAR_form.peringkat === '' || PASAR_form.peringkat == null ? 0 : Number(PASAR_form.peringkat);

    return {
      ...PASAR_form,
      no: PASAR_sectionForm.no,
      sectionLabel: PASAR_sectionForm.sectionLabel,
      bobotSection: PASAR_sectionForm.bobotSection,
      peringkat: peringkatNum,
      numeratorLabel: PASAR_form.mode === 'NILAI_TUNGGAL' || PASAR_form.mode === 'TEKS' ? '' : PASAR_form.numeratorLabel,
      numeratorValue: PASAR_form.mode === 'NILAI_TUNGGAL' || PASAR_form.mode === 'TEKS' ? '' : PASAR_form.numeratorValue,
    };
  };

  const PASAR_addRow = async () => {
    if (!PASAR_sectionForm.id) {
      showToast('Pilih section terlebih dahulu!', 'error');
      return;
    }

    const baseRow = buildBaseRow();
    const rawHasil = computePasarHasil(baseRow);
    const section = currentPeriodSections.find((s) => s.id === PASAR_sectionForm.id);

    if (!section) return;

    const weightedAuto = computeWeightedLocal(baseRow.bobotSection, baseRow.bobotIndikator, baseRow.peringkat);
    const backendData = transformToBackend(baseRow, viewYear, viewQuarter, PASAR_sectionForm.id, section);

    try {
      await createIndikator(backendData);
      PASAR_resetForm();
      setShowPasarForm(false);
      showToast('Indikator berhasil ditambahkan!', 'success');

      // Log CREATE indikator
      await logCreate('PASAR', `Tambah indikator: ${backendData.indikator} (Section: ${section.parameter})`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { sectionId: PASAR_sectionForm.id, sectionNo: PASAR_sectionForm.no, sectionLabel: PASAR_sectionForm.sectionLabel, subNo: backendData.subNo, indikator: backendData.indikator, bobotIndikator: backendData.bobotIndikator, mode: backendData.mode, year: viewYear, quarter: viewQuarter },
      });
    } catch (err) {
      console.error('Failed to add indicator:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menambahkan indikator';
      showToast(errorMessage, 'error');
      await logCreate('PASAR', `Gagal tambah indikator: ${PASAR_form.indikator}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: errorMessage, year: viewYear, quarter: viewQuarter },
      });
    }
  };

  const PASAR_startEdit = (row) => {
    if (!row) return;
    setShowPasarForm(true);

    setPASAR_editingRow(row);

    setPASAR_form({
      ...row,
      mode: row.mode || 'RASIO',
      formula: row.formula || '',
      isPercent: !!row.isPercent,
      numeratorLabel: row.pembilangLabel || row.numeratorLabel || '',
      numeratorValue: row.pembilangValue || row.numeratorValue || '',
      denominatorLabel: row.penyebutLabel || row.denominatorLabel || '',
      denominatorValue: row.penyebutValue || row.denominatorValue || '',
    });

    setRawNumeratorInput(row.pembilangValue || row.numeratorValue || '');
    setRawDenominatorInput(row.penyebutValue || row.denominatorValue || '');

    setPASAR_sectionForm({
      id: row.sectionId,
      no: row.no || '',
      bobotSection: row.bobotSection ?? 0,
      sectionLabel: row.sectionLabel || '',
    });
  };

  const PASAR_saveEdit = async () => {
    if (!PASAR_editingRow) return;

    const baseRow = buildBaseRow();
    const pembilangValue = baseRow.mode === 'RASIO' ? parseNum(baseRow.numeratorValue) : undefined;
    const penyebutValue = baseRow.mode !== 'TEKS' ? parseNum(baseRow.denominatorValue) : undefined;

    if (baseRow.mode === 'RASIO') {
      if (penyebutValue === 0) {
        showToast('Untuk mode RASIO, nilai penyebut harus lebih besar dari 0', 'error');
        return;
      }
      if (penyebutValue < 0) {
        showToast('Untuk mode RASIO, nilai penyebut tidak boleh negatif', 'error');
        return;
      }
    }

    if (baseRow.mode === 'NILAI_TUNGGAL' && penyebutValue < 0) {
      showToast('Untuk mode NILAI_TUNGGAL, nilai penyebut tidak boleh negatif', 'error');
      return;
    }

    const rawHasil = computePasarHasil(baseRow);
    const newPeringkat = calculatePeringkat(
      rawHasil,
      {
        low: baseRow.low || '',
        lowToModerate: baseRow.lowToModerate || '',
        moderate: baseRow.moderate || '',
        moderateToHigh: baseRow.moderateToHigh || '',
        high: baseRow.high || '',
      },
      baseRow.isPercent || false,
    );

    const weightedAuto = computeWeightedLocal(baseRow.bobotSection, baseRow.bobotIndikator, newPeringkat);
    const hasilValue = baseRow.mode === 'TEKS' ? undefined : rawHasil === '' || rawHasil == null ? 0 : rawHasil;

    const updateData = {
      year: viewYear,
      quarter: viewQuarter,
      sectionId: PASAR_sectionForm.id,
      subNo: baseRow.subNo,
      indikator: baseRow.indikator,
      bobotIndikator: Number(baseRow.bobotIndikator) || 0,
      sumberRisiko: baseRow.sumberRisiko || undefined,
      dampak: baseRow.dampak || undefined,
      low: baseRow.low || undefined,
      lowToModerate: baseRow.lowToModerate || undefined,
      moderate: baseRow.moderate || undefined,
      moderateToHigh: baseRow.moderateToHigh || undefined,
      high: baseRow.high || undefined,
      mode: baseRow.mode,
      formula: baseRow.formula || undefined,
      isPercent: baseRow.isPercent || false,
      pembilangLabel: baseRow.mode === 'RASIO' ? baseRow.numeratorLabel : undefined,
      penyebutLabel: baseRow.mode !== 'TEKS' ? baseRow.denominatorLabel : undefined,
      pembilangValue: pembilangValue,
      penyebutValue: penyebutValue,
      hasil: hasilValue,
      hasilText: baseRow.mode === 'TEKS' ? baseRow.hasilText || '' : undefined,
      peringkat: newPeringkat,
      weighted: weightedAuto,
      keterangan: baseRow.keterangan || undefined,
    };

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    try {
      await updateIndikator(PASAR_editingRow.id, updateData);
      PASAR_resetForm();
      setShowPasarForm(false);
      showToast('Indikator berhasil diupdate!', 'success');

      // Log UPDATE indikator
      await logUpdate('PASAR', `Update indikator: ${updateData.indikator} (ID: ${PASAR_editingRow.id})`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { indicatorId: PASAR_editingRow.id, sectionId: PASAR_sectionForm.id, subNo: updateData.subNo, indikator: updateData.indikator, bobotIndikator: updateData.bobotIndikator, peringkat: updateData.peringkat, weighted: updateData.weighted, mode: updateData.mode, year: viewYear, quarter: viewQuarter },
      });
    } catch (err) {
      console.error('Failed to update indicator:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal mengupdate indikator';
      showToast(errorMessage, 'error');
      await logUpdate('PASAR', `Gagal update indikator: ${PASAR_editingRow?.indikator} (ID: ${PASAR_editingRow?.id})`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: errorMessage, indicatorId: PASAR_editingRow?.id, year: viewYear, quarter: viewQuarter },
      });
    }
  };

  const PASAR_removeRow = async (row) => {
    if (!row) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus indikator "${row.indikator}"?`)) {
      return;
    }

    try {
      await deleteIndikator(row.id);
      if (PASAR_editingRow?.id === row.id) PASAR_resetForm();
      showToast(`Indikator "${row.indikator}" berhasil dihapus`, 'success');

      // Log DELETE indikator
      await logDelete('PASAR', `Hapus indikator: ${row.indikator} (Sub No: ${row.subNo})`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { indicatorId: row.id, subNo: row.subNo, indikator: row.indikator, sectionLabel: row.sectionLabel, sectionNo: row.no, bobotIndikator: row.bobotIndikator, peringkat: row.peringkat, year: viewYear, quarter: viewQuarter },
      });
    } catch (err) {
      console.error('Failed to delete indicator:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menghapus indikator';
      showToast(errorMessage, 'error');
      await logDelete('PASAR', `Gagal hapus indikator: ${row.indikator} (ID: ${row.id})`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: errorMessage, indicatorId: row.id, year: viewYear, quarter: viewQuarter },
      });
    }
  };

  const PASAR_exportExcel = async () => {
    try {
      exportPasarToExcel(PASAR_filtered, viewYear, viewQuarter);
      showToast(`Data Pasar tahun ${viewYear} triwulan ${viewQuarter} berhasil diexport`, 'success');

      // Log EXPORT
      await logExport('PASAR', `Export data Pasar tahun ${viewYear} TW${viewQuarter}`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { year: viewYear, quarter: viewQuarter, dataCount: PASAR_filtered.length, filename: `Pasar_${viewYear}_TW${viewQuarter}.xlsx` },
      });
    } catch (err) {
      showToast('Gagal mengexport data', 'error');
      await logExport('PASAR', `Gagal export data Pasar tahun ${viewYear} TW${viewQuarter}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { error: err.message, year: viewYear, quarter: viewQuarter },
      });
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && <ToastNotification message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Loading & Error States */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Memuat data...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      <header className="px-4 py-4 flex items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Form – Pasar</h2>
        <div className="flex items-end gap-4">
          <div className="hidden md:flex items-end gap-4">
            <div className="flex flex-col gap-1">
              <YearInput
                value={viewYear}
                onChange={(v) => {
                  onViewYearChange(v);
                  setPASAR_form((f) => ({ ...f, year: v }));
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <QuarterSelect
                value={viewQuarter}
                onChange={(v) => {
                  onViewQuarterChange(v);
                  setPASAR_form((f) => ({ ...f, quarter: v }));
                }}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button onClick={() => setShowPasarForm(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold">
              + Tambah Data
            </button>

            <button onClick={PASAR_exportExcel} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border bg-gray-900 text-white hover:bg-black">
              <Download size={18} /> Export {viewYear}-{viewQuarter}
            </button>
          </div>
        </div>
      </header>

      {inheritInfo && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
              <strong>Auto-Clone Berhasil!</strong>
            </div>
            <p className="text-gray-700">
              Section untuk{' '}
              <strong>
                {viewYear}-{viewQuarter}
              </strong>{' '}
              telah di-clone otomatis dari <strong>{inheritInfo.from}</strong> ({inheritInfo.count} section).
            </p>
            <p className="text-xs text-gray-500 mt-1">💡 Anda dapat mengedit atau menghapus section sesuai kebutuhan.</p>
          </div>
          <button onClick={handleUndoClone} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm font-medium whitespace-nowrap">
            Undo Clone
          </button>
        </div>
      )}

      {/* FORM SECTION + INDIKATOR */}
      {showPasarForm && (
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-sm bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90">
          {/* SECTION HEADER */}
          <div className="rounded-2xl border-2 border-gray-300 p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg sm:text-xl">Form Section – Pasar</h2>
              <button onClick={() => setShowPasarForm(false)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold" title="Tutup Form">
                ✕
              </button>
            </div>

            <div className="flex items-end gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-xs text-white font-medium mb-1">No Sec</label>
                <input
                  className={`w-20 h-10 px-3 rounded-lg border-2 border-gray-300 text-center font-medium ${isAddingNewSection || isEditingSection ? 'bg-white' : 'bg-gray-100'}`}
                  style={!isAddingNewSection && !isEditingSection ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                  disabled={!isAddingNewSection && !isEditingSection}
                  value={PASAR_sectionForm.no}
                  onChange={(e) => setPASAR_sectionForm((f) => ({ ...f, no: e.target.value }))}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-white font-medium mb-1">Bobot Sec</label>
                <input
                  type="number"
                  className={`w-28 h-10 px-3 rounded-lg border-2 border-gray-300 text-center font-medium ${isAddingNewSection || isEditingSection ? 'bg-white' : 'bg-gray-100'}`}
                  style={!isAddingNewSection && !isEditingSection ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                  disabled={!isAddingNewSection && !isEditingSection}
                  value={PASAR_sectionForm.bobotSection ?? ''}
                  onChange={(e) => setPASAR_sectionForm((f) => ({ ...f, bobotSection: e.target.value }))}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-xs text-white font-medium mb-1">Section</label>
                <input
                  className={`w-full h-10 px-4 rounded-lg border-2 border-gray-300 font-medium ${isAddingNewSection || isEditingSection ? 'bg-white' : 'bg-gray-100'}`}
                  style={!isAddingNewSection && !isEditingSection ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                  disabled={!isAddingNewSection && !isEditingSection}
                  value={PASAR_sectionForm.sectionLabel}
                  onChange={(e) => setPASAR_sectionForm((f) => ({ ...f, sectionLabel: e.target.value }))}
                  placeholder="Uraian section risiko pasar"
                />
              </div>

              <div className="flex gap-2 self-end">
                {!isAddingNewSection && !isEditingSection && (
                  <>
                    <button className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center" onClick={() => setIsEditingSection(true)} title="Edit Section">
                      <Edit3 size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center" onClick={() => PASAR_removeSection(PASAR_sectionForm.id)} title="Hapus Section">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}

                {(isAddingNewSection || isEditingSection) && (
                  <>
                    <button
                      className="px-4 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1"
                      onClick={isAddingNewSection ? PASAR_addSection : PASAR_saveSection}
                      title="Simpan Section"
                    >
                      <span>{isAddingNewSection ? '+' : '✓'}</span>
                      <span>{isAddingNewSection ? 'Tambah' : 'Simpan'}</span>
                    </button>
                    <button
                      className="px-4 h-10 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-semibold flex items-center justify-center"
                      onClick={() => {
                        setIsAddingNewSection(false);
                        setIsEditingSection(false);
                        if (PASAR_sectionForm.id) {
                          PASAR_selectSection(PASAR_sectionForm.id);
                        }
                      }}
                      title="Batal"
                    >
                      ✗ Batal
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="text-xs text-white font-medium mb-1 block">Section</label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 font-medium appearance-none bg-white cursor-pointer pr-10"
                value={isAddingNewSection ? 'ADD_NEW_SECTION' : PASAR_sectionForm.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'ADD_NEW_SECTION') {
                    setIsAddingNewSection(true);
                    setIsEditingSection(true);
                    setPASAR_sectionForm({ id: 0, no: '', bobotSection: 0, sectionLabel: '' });
                    return;
                  }
                  if (val) {
                    setIsAddingNewSection(false);
                    setIsEditingSection(false);
                    PASAR_selectSection(Number(val));
                  }
                }}
              >
                <option value="">-- Pilih Section --</option>
                {sectionsInCurrentQuarter.map((s, idx) => (
                  <option key={`section-${idx}`} value={currentPeriodSections[idx]?.id}>
                    {s.no} - {s.label}
                  </option>
                ))}
                <option value="ADD_NEW_SECTION" style={{ fontWeight: '600', color: '#0068B3' }}>
                  + Tambah Section Baru
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-9 pointer-events-none text-gray-400" size={20} />
            </div>
          </div>

          {/* FORM INDIKATOR */}
          <div className="rounded-xl border-2 border-gray-300 shadow-sm p-6 mb-6">
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block text-white">Sub No</label>
                <input className="w-full rounded-lg border-2 border-gray-300 px-3 py-3 text-sm bg-white" value={PASAR_form.subNo} onChange={(e) => setPASAR_form((f) => ({ ...f, subNo: e.target.value }))} placeholder="1.1" />
              </div>
              <div className="col-span-7">
                <label className="text-sm font-medium mb-2 block text-white">Indikator</label>
                <input
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                  value={PASAR_form.indikator}
                  onChange={(e) => setPASAR_form((f) => ({ ...f, indikator: e.target.value }))}
                  placeholder="Nama indikator pasar…"
                />
              </div>
              <div className="col-span-3">
                <label className="text-sm font-medium mb-2 block text-white">Bobot Indikator (%)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm text-right bg-white"
                  value={PASAR_form.bobotIndikator ?? ''}
                  onChange={(e) => setPASAR_form((f) => ({ ...f, bobotIndikator: e.target.value }))}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-4">
                <label className="text-sm font-medium mb-2 block text-white">Metode Perhitungan</label>
                <select
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-3 text-sm bg-white"
                  value={PASAR_form.mode || 'RASIO'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPASAR_form((f) => ({
                      ...f,
                      mode: v,
                      ...(v === 'NILAI_TUNGGAL' || v === 'TEKS' ? { numeratorLabel: '', numeratorValue: '' } : {}),
                      ...(v === 'TEKS' ? { denominatorLabel: '', denominatorValue: '', formula: '', isPercent: false, hasil: '' } : {}),
                    }));
                  }}
                >
                  <option value="RASIO">Rasio (Pembilang / Penyebut)</option>
                  <option value="NILAI_TUNGGAL">Nilai tunggal (hanya penyebut)</option>
                  <option value="TEKS">Kualitatif (hasil berupa teks)</option>
                </select>
              </div>

              <div className="col-span-8">
                {PASAR_form.mode === 'TEKS' ? (
                  <>
                    <label className="text-sm font-medium mb-2 block text-white">Hasil (Teks) – akan muncul di kolom "Hasil"</label>
                    <input
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                      value={PASAR_form.hasilText || ''}
                      onChange={(e) => setPASAR_form((f) => ({ ...f, hasilText: e.target.value }))}
                      placeholder="Contoh: sedang, 100, baik, 50, dll (bisa teks atau angka)"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-sm font-medium mb-2 block text-white">Rumus perhitungan (opsional — kosong = pakai default)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                        placeholder={PASAR_form.mode === 'RASIO' ? 'Contoh default: pemb / peny — atau rumus custom (pemb, peny)' : 'Contoh default: peny — atau rumus custom (peny / 1000)'}
                        value={PASAR_form.formula || ''}
                        onChange={(e) => setPASAR_form((f) => ({ ...f, formula: e.target.value }))}
                      />
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={PASAR_form.isPercent || false}
                          onChange={(e) => setPASAR_form((f) => ({ ...f, isPercent: e.target.checked }))}
                          className="w-6 h-6 rounded-full border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 text-lg font-bold">%</div>
                      </label>
                    </div>
                    <div className="text-xs text-white/80 mt-2">Aktifkan checkbox untuk mengubah hasil menjadi persentase (hasil × 100). Weighted tetap angka (bukan persen).</div>
                  </>
                )}
              </div>
            </div>

            {PASAR_form.mode === 'RASIO' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Faktor Pembilang</label>
                  <input
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                    value={PASAR_form.numeratorLabel}
                    onChange={(e) => setPASAR_form((f) => ({ ...f, numeratorLabel: e.target.value }))}
                    placeholder="Misal: Total Outstanding (OS) Non-Investment Grade"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Nilai Pembilang</label>
                  <input
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                    value={rawNumeratorInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRawNumeratorInput(val);
                      setPASAR_form((f) => ({ ...f, numeratorValue: val }));
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (!val || val.endsWith(',') || val.endsWith('.') || val === '-') return;
                      const formatted = fmtNumberSmart(val);
                      if (formatted && formatted !== val) {
                        setRawNumeratorInput(formatted);
                        setPASAR_form((f) => ({ ...f, numeratorValue: formatted }));
                      }
                    }}
                    placeholder="Contoh: -1000, 1.000, 1.000,50, 10%"
                  />
                </div>
              </div>
            )}

            {PASAR_form.mode !== 'TEKS' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Faktor Penyebut</label>
                  <input
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                    value={PASAR_form.denominatorLabel}
                    onChange={(e) => setPASAR_form((f) => ({ ...f, denominatorLabel: e.target.value }))}
                    placeholder={PASAR_form.mode === 'RASIO' ? 'Total Asset (Jutaan)' : 'Jumlah kejadian, jumlah kasus, dll.'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Nilai Penyebut</label>
                  <input
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white"
                    value={rawDenominatorInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRawDenominatorInput(val);
                      setPASAR_form((f) => ({ ...f, denominatorValue: val }));
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (!val || val.endsWith(',') || val.endsWith('.') || val === '-') return;
                      const formatted = fmtNumberSmart(val);
                      if (formatted && formatted !== val) {
                        setRawDenominatorInput(formatted);
                        setPASAR_form((f) => ({ ...f, denominatorValue: formatted }));
                      }
                    }}
                    placeholder="Contoh: -1000, 1.000, 1.000,50, 10%"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border-2 border-white/70 bg-white/5 p-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-white">Sumber Risiko</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm resize-none bg-white"
                      value={PASAR_form.sumberRisiko}
                      onChange={(e) => setPASAR_form((f) => ({ ...f, sumberRisiko: e.target.value }))}
                      placeholder="Contoh: kelemahan proses, human error, kegagalan sistem, dsb."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-white">Dampak</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm resize-none bg-white"
                      value={PASAR_form.dampak}
                      onChange={(e) => setPASAR_form((f) => ({ ...f, dampak: e.target.value }))}
                      placeholder="Contoh: kerugian finansial, penurunan layanan, risiko hukum, dsb."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-white">Peringkat (Auto)</label>
                      <input type="number" className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-gray-100 font-bold text-center" value={PASAR_form.peringkat ?? ''} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-white">Weighted (auto)</label>
                      <input
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-gray-50"
                        value={(() => {
                          const peringkatNum = PASAR_form.peringkat === '' || PASAR_form.peringkat == null ? 0 : Number(PASAR_form.peringkat);
                          const bobotSecNum = Number(PASAR_sectionForm.bobotSection || 0);
                          const bobotIndNum = Number(PASAR_form.bobotIndikator || 0);
                          const res = computeWeightedLocal(bobotSecNum, bobotIndNum, peringkatNum);
                          const num = Number(res);
                          if (!isFinite(num) || isNaN(num)) return '';
                          return num.toFixed(2);
                        })()}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-white">Hasil Preview (Rasio)</label>
                      <input
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-gray-50"
                        value={(() => {
                          if (PASAR_form.mode === 'TEKS') return PASAR_form.hasilText || '';
                          const raw = computePasarHasil(buildBaseRow());
                          if (raw === '' || raw == null) return '';
                          if (PASAR_form.isPercent) {
                            const pct = Number(raw) * 100;
                            if (!isFinite(pct) || isNaN(pct)) return '';
                            return `${pct.toFixed(2)}%`;
                          }
                          if (PASAR_form.mode === 'NILAI_TUNGGAL') return fmtNumber(raw);
                          return Number(raw).toFixed(4);
                        })()}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-white">Keterangan</label>
                    <textarea rows={3} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm bg-white" value={PASAR_form.keterangan} onChange={(e) => setPASAR_form((f) => ({ ...f, keterangan: e.target.value }))} />
                  </div>
                </div>

                <div className="col-span-6 grid grid-cols-1 gap-3 items-stretch">
                  <RiskField
                    className="w-full"
                    label="Low"
                    value={PASAR_form.low}
                    onChange={(v) => setPASAR_form((f) => ({ ...f, low: v }))}
                    color="#4A5A2C"
                    textColor="#ffffff"
                    placeholder={PASAR_form.mode === 'TEKS' ? 'Contoh: Baik, Aman, Tes' : 'x ≤ 1%'}
                  />
                  <RiskField
                    className="w-full"
                    label="Low to Moderate"
                    value={PASAR_form.lowToModerate}
                    onChange={(v) => setPASAR_form((f) => ({ ...f, lowToModerate: v }))}
                    color="#A6D86C"
                    textColor="#0B2545"
                    placeholder={PASAR_form.mode === 'TEKS' ? 'Contoh: Cukup Baik' : '1% < x ≤ 2%'}
                  />
                  <RiskField
                    className="w-full"
                    label="Moderate"
                    value={PASAR_form.moderate}
                    onChange={(v) => setPASAR_form((f) => ({ ...f, moderate: v }))}
                    color="#FFFF00"
                    textColor="#4B3A00"
                    placeholder={PASAR_form.mode === 'TEKS' ? 'Contoh: Sedang, Normal' : '2% < x ≤ 3%'}
                  />
                  <RiskField
                    className="w-full"
                    label="Moderate to High"
                    value={PASAR_form.moderateToHigh}
                    onChange={(v) => setPASAR_form((f) => ({ ...f, moderateToHigh: v }))}
                    color="#FAD2A7"
                    textColor="#5A2E00"
                    placeholder={PASAR_form.mode === 'TEKS' ? 'Contoh: Cukup Tinggi' : '3% < x ≤ 4%'}
                  />
                  <RiskField
                    className="w-full"
                    label="High"
                    value={PASAR_form.high}
                    onChange={(v) => setPASAR_form((f) => ({ ...f, high: v }))}
                    color="#E57373"
                    textColor="#FFFFFF"
                    placeholder={PASAR_form.mode === 'TEKS' ? 'Contoh: Buruk, Berbahaya, Tinggi' : 'x > 4%'}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {!PASAR_editingRow ? (
                <button onClick={PASAR_addRow} className="px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold">
                  + Tambah
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={PASAR_saveEdit} className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Simpan
                  </button>
                  <button onClick={PASAR_resetForm} className="px-8 py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-semibold">
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <section className="mt-4">
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
          <div className="relative h-[350px]">
            <div className="absolute inset-0 overflow-x-auto overflow-y-auto">
              <DataTable rows={PASAR_filtered} totalWeighted={PASAR_totalWeighted} viewYear={viewYear} viewQuarter={viewQuarter} startEdit={PASAR_startEdit} removeRow={PASAR_removeRow} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}