// src/features/Dashboard/pages/RiskProfile/pages/Pasar/kpmr-pasar-page.jsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Download, Trash2, Edit3, Search, X } from 'lucide-react';
// import { getCurrentYear } from './utils/pasar/time';
// import { exportKPMRPasarToExcel } from './utils/pasar/exportexcelkpmrpasar';
// import { useKpmrPasar } from './hooks/KPMR/kpmr-pasar.hook';
// import ToastNotification from './components/kpmr-pasar/ToastNotification';
import { getCurrentYear } from './utils/pasar/time';
import { exportKPMRPasarToExcel } from './utils/pasar/exportexcelkpmr_pasar';

import { useKpmrPasar } from './hooks/kpmr-pasar/kpmr-pasar.hook';
import ToastNotification from './components/kpmr-pasar/ToastNotification';

import { useAuditLog } from '../../../audit-log/hooks/audit-log.hooks';
import { useAuth } from '@/features/auth/hooks/useAuth.hook';
// ===================== Brand =====================
const PNM_BRAND = {
  primary: '#0068B3',
  primarySoft: '#E6F1FA',
  gradient: 'bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90',
};

const KPMR_EMPTY_FORM = {
  year: getCurrentYear(),
  quarter: 'Q1',
  aspekNo: '',
  aspekTitle: '',
  aspekBobot: 30,
  sectionNo: '',
  sectionTitle: '',
  sectionSkor: '',
  level1: '',
  level2: '',
  level3: '',
  level4: '',
  level5: '',
  evidence: '',
  definitionId: null,
  questionId: null,
};

const QUARTER_ORDER = ['Q1', 'Q2', 'Q3', 'Q4'];
const QUARTER_LABEL = {
  Q1: 'MAR',
  Q2: 'JUN',
  Q3: 'SEP',
  Q4: 'DES',
};

export default function PasarKPMR({ viewYear: propViewYear, viewQuarter: propViewQuarter, onViewYearChange, query: propQuery, onQueryChange }) {
  // ===== AUDIT LOG =====
  const { logCreate, logUpdate, logDelete, logExport } = useAuditLog();
  const { authUser } = useAuth();
  const getCurrentUser = () => ({
    userId: authUser?.id || localStorage.getItem('userId') || null,
  });
  // ===== STATE DENGAN FALLBACK =====
  const [localViewYear, setLocalViewYear] = useState(() => {
    if (propViewYear && typeof propViewYear === 'number' && !isNaN(propViewYear)) {
      return propViewYear;
    }
    const saved = localStorage.getItem('kpmr_viewYear');
    return saved ? Number(saved) : getCurrentYear();
  });

  const [localQuery, setLocalQuery] = useState(propQuery || '');

  const viewYear = propViewYear !== undefined && typeof propViewYear === 'number' && !isNaN(propViewYear) ? propViewYear : localViewYear;
  const query = propQuery !== undefined ? propQuery : localQuery;

  const isLoadingRef = useRef(false);
  const isDataLoadedRef = useRef(false);

  // ========== TOAST NOTIFICATION STATE ==========
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const setViewYear = useCallback(
    (year) => {
      setLocalViewYear(year);
      localStorage.setItem('kpmr_viewYear', year);
      if (typeof onViewYearChange === 'function') {
        onViewYearChange(year);
      }
      setKPMR_form((prev) => ({ ...prev, year: year }));
      isDataLoadedRef.current = false;
    },
    [onViewYearChange],
  );

  const setQuery = useCallback(
    (q) => {
      setLocalQuery(q);
      if (typeof onQueryChange === 'function') {
        onQueryChange(q);
      }
    },
    [onQueryChange],
  );

  // ====== GUNAKAN HOOK ======
  const {
    aspects,
    questions,
    definitions,
    scores,
    groups,
    loading,
    error,
    clearError,
    createAspect,
    updateAspect,
    createQuestion,
    createOrUpdateDefinition,
    updateDefinition,
    createOrUpdateScore,
    deleteDefinition,
    deleteAspect,
    deleteQuestion,
    fetchFullData,
    fetchAspects,
    fetchDefinitions,
    fetchScores,
    fetchQuestions,
  } = useKpmrPasar({
    initialYear: Number(viewYear),
    initialQuarter: propViewQuarter || 'Q1',
    autoLoad: false,
  });

  // State lokal untuk form
  const [showKPMRForm, setShowKPMRForm] = useState(false);
  const [KPMR_form, setKPMR_form] = useState({
    ...KPMR_EMPTY_FORM,
    year: viewYear,
    quarter: propViewQuarter || 'Q1',
  });
  const [KPMR_editingTarget, setKPMR_editingTarget] = useState(null);
  const [KPMR_isAddingNewAspect, setKPMR_isAddingNewAspect] = useState(false);
  const [KPMR_isAddingNewQuestion, setKPMR_isAddingNewQuestion] = useState(false);
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========== STATE UNTUK EDIT ASPEK ==========
  const [showEditAspectModal, setShowEditAspectModal] = useState(false);
  const [editingAspectData, setEditingAspectData] = useState({
    id: null,
    aspekNo: '',
    aspekTitle: '',
    aspekBobot: 0,
    year: null,
  });

  // ========== FUNGSI EDIT ASPEK ==========
  const handleOpenEditAspect = (aspect) => {
    setEditingAspectData({
      id: aspect.id,
      aspekNo: aspect.aspekNo,
      aspekTitle: aspect.aspekTitle,
      aspekBobot: aspect.aspekBobot,
      year: aspect.year,
    });
    setShowEditAspectModal(true);
  };

  const handleSaveEditAspect = async () => {
    if (!editingAspectData.id) {
      showToast('ID Aspek tidak ditemukan', 'error');
      return;
    }

    if (!editingAspectData.aspekNo || !editingAspectData.aspekTitle) {
      showToast('Nomor Aspek dan Judul Aspek harus diisi', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await updateAspect(editingAspectData.id, {
        aspekNo: editingAspectData.aspekNo,
        aspekTitle: editingAspectData.aspekTitle,
        aspekBobot: editingAspectData.aspekBobot,
      });

      if (result) {
        const definitionsToUpdate = definitions.filter((def) => def.aspekNo === editingAspectData.aspekNo && def.year === viewYear);

        for (const def of definitionsToUpdate) {
          await updateDefinition(def.id, {
            aspekTitle: editingAspectData.aspekTitle,
            aspekBobot: editingAspectData.aspekBobot,
          });
        }

        showToast(`Aspek "${editingAspectData.aspekTitle}" berhasil diupdate`, 'success');
        try {
          const user = getCurrentUser();
          await logUpdate(
            'PASAR',
            `Mengupdate Aspek KPMR Pasar: No. ${editingAspectData.aspekNo} - "${editingAspectData.aspekTitle}", Tahun: ${viewYear}`,
            {
              userId: user.userId,
              isSuccess: true,
              metadata: { type: 'kpmr', aspekId: editingAspectData.id, aspekNo: editingAspectData.aspekNo, aspekTitle: editingAspectData.aspekTitle, year: viewYear }
            }
          );
        } catch (logErr) { console.warn('Audit log gagal (update aspek):', logErr); }
        setShowEditAspectModal(false);

        await Promise.all([fetchAspects(viewYear), fetchFullData(viewYear), fetchDefinitions(viewYear)]);
      }
    } catch (err) {
      console.error('Update aspek error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal update aspek';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== FUNGSI HAPUS PERTANYAAN DARI BARIS ==========
  const handleDeleteQuestionFromRow = async (questionId, aspekNo, aspekTitle, sectionNo, sectionTitle) => {
    if (!questionId) {
      showToast('ID Pertanyaan tidak ditemukan', 'error');
      return;
    }

    if (
      !confirm(
        `⚠️ PERINGATAN!\n\nAnda akan menghapus PERTANYAAN:\n"${sectionTitle}" (No ${sectionNo})\ndari ASPEK: ${aspekNo} - ${aspekTitle}\n\nYang akan terhapus:\n✓ Semua data definisi (level 1-5, evidence)\n✓ Semua skor untuk semua triwulan\n\nAspek TIDAK akan terhapus.\n\nYakin ingin menghapus?`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteQuestion(questionId);

      if (result && result.success) {
        showToast(result.message || 'Pertanyaan berhasil dihapus', 'success');
        try {
          const user = getCurrentUser();
          await logDelete(
            'PASAR',
            `Menghapus Pertanyaan KPMR Pasar: "${sectionTitle}" (No: ${sectionNo}) dari Aspek: ${aspekNo} - ${aspekTitle}`,
            {
              userId: user.userId,
              isSuccess: true,
              metadata: { type: 'kpmr', questionId, aspekNo, sectionNo, year: viewYear }
            }
          );
        } catch (logErr) { console.warn('Audit log gagal (delete question):', logErr); }

        await Promise.all([fetchQuestions(viewYear), fetchFullData(viewYear), fetchAspects(viewYear)]);
      } else {
        showToast(result?.message || 'Gagal menghapus pertanyaan', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menghapus pertanyaan';
      showToast(errorMessage, 'error');
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const yearToLoad = Number(viewYear);
      if (isNaN(yearToLoad)) return;

      await Promise.all([fetchFullData(yearToLoad), fetchAspects(yearToLoad), fetchQuestions(yearToLoad)]);
    };
    loadData();
  }, [viewYear, fetchFullData, fetchAspects, fetchQuestions]);

  // Sync form year dengan viewYear
  useEffect(() => {
    if (viewYear && typeof viewYear === 'number' && !isNaN(viewYear)) {
      setKPMR_form((f) => {
        if (f.year === viewYear) return f;
        return { ...f, year: viewYear };
      });
    }
  }, [viewYear]);

  // Helper functions
  const toggleQuarter = (q) => {
    setSelectedQuarters((prev) => (prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]));
  };

  const shouldShowQuarter = (quarter) => {
    return selectedQuarters.length === 0 || selectedQuarters.includes(quarter);
  };

  const KPMR_handleChange = (k, v) => setKPMR_form((f) => ({ ...f, [k]: v }));

  const KPMR_resetForm = () => {
    setKPMR_form({
      ...KPMR_EMPTY_FORM,
      year: viewYear,
      quarter: propViewQuarter || 'Q1',
    });
    setKPMR_editingTarget(null);
    setKPMR_isAddingNewAspect(false);
    setKPMR_isAddingNewQuestion(false);
  };

  const handleAspectChange = (value) => {
    if (value === 'new') {
      setKPMR_isAddingNewAspect(true);
      setKPMR_form((prev) => ({
        ...prev,
        aspekNo: '',
        aspekTitle: '',
        aspekBobot: 30,
        sectionNo: '',
        sectionTitle: '',
        questionId: null,
      }));
      return;
    }

    setKPMR_isAddingNewAspect(false);
    const aspect = aspects.find((a) => a.id === Number(value));
    if (aspect) {
      setKPMR_form((prev) => ({
        ...prev,
        aspekNo: aspect.aspekNo,
        aspekTitle: aspect.aspekTitle,
        aspekBobot: aspect.aspekBobot,
        sectionNo: '',
        sectionTitle: '',
        level1: '',
        level2: '',
        level3: '',
        level4: '',
        level5: '',
        evidence: '',
        definitionId: null,
        questionId: null,
      }));
      setKPMR_isAddingNewQuestion(false);
    }
  };

  const handleQuestionChange = (value) => {
    if (value === 'new') {
      setKPMR_isAddingNewQuestion(true);
      setKPMR_form((prev) => ({
        ...prev,
        sectionNo: '',
        sectionTitle: '',
        level1: '',
        level2: '',
        level3: '',
        level4: '',
        level5: '',
        evidence: '',
        sectionSkor: '',
        questionId: null,
      }));
      return;
    }

    setKPMR_isAddingNewQuestion(false);
    const questionId = Number(value);
    const question = questions.find((q) => q.id === questionId);

    if (question) {
      const existingDef = definitions.find((d) => d.year === KPMR_form.year && d.aspekNo === KPMR_form.aspekNo && d.sectionNo === question.sectionNo);

      setKPMR_form((prev) => ({
        ...prev,
        questionId: questionId,
        sectionNo: question.sectionNo,
        sectionTitle: question.sectionTitle,
        level1: existingDef?.level1 || '',
        level2: existingDef?.level2 || '',
        level3: existingDef?.level3 || '',
        level4: existingDef?.level4 || '',
        level5: existingDef?.level5 || '',
        evidence: existingDef?.evidence || '',
        sectionSkor: '',
        definitionId: existingDef?.id || null,
      }));
    }
  };

  const handleQuarterChange = (quarter) => {
    const existingScore = scores.find((s) => s.definitionId === KPMR_form.definitionId && s.year === KPMR_form.year && s.quarter === quarter);
    setKPMR_form((prev) => ({
      ...prev,
      quarter,
      sectionSkor: existingScore?.sectionSkor?.toString() || '',
    }));
  };

  const KPMR_addRow = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!KPMR_form.aspekNo) {
        showToast('Pilih Aspek terlebih dahulu!', 'error');
        return;
      }
      if (!KPMR_form.aspekTitle) {
        showToast('Judul Aspek harus diisi!', 'error');
        return;
      }
      if (!KPMR_form.sectionNo) {
        showToast('Pilih Pertanyaan terlebih dahulu!', 'error');
        return;
      }
      if (!KPMR_form.sectionTitle) {
        showToast('Judul Pertanyaan harus diisi!', 'error');
        return;
      }
      if (!KPMR_form.year || isNaN(KPMR_form.year)) {
        showToast('Tahun tidak valid!', 'error');
        return;
      }

      // ========== HANDLE ASPEK ==========
      let targetAspect = null;

      if (KPMR_isAddingNewAspect) {
        const existingAspect = aspects.find((a) => a.aspekNo === KPMR_form.aspekNo && a.year === KPMR_form.year);

        if (existingAspect) {
          targetAspect = existingAspect;
          showToast(`Aspek ${KPMR_form.aspekNo} sudah ada. Pertanyaan akan ditambahkan ke aspek tersebut.`, 'info');
        } else {
          targetAspect = await createAspect({
            year: KPMR_form.year,
            aspekNo: KPMR_form.aspekNo,
            aspekTitle: KPMR_form.aspekTitle,
            aspekBobot: Number(KPMR_form.aspekBobot) || 30,
          });
          await fetchAspects(KPMR_form.year);
          showToast(`Aspek baru "${KPMR_form.aspekTitle}" berhasil dibuat`, 'success');
        }
      } else {
        targetAspect = aspects.find((a) => a.aspekNo === KPMR_form.aspekNo && a.year === KPMR_form.year);
        if (!targetAspect) {
          showToast('Aspek tidak ditemukan', 'error');
          return;
        }
      }

      KPMR_form.aspekNo = targetAspect.aspekNo;
      KPMR_form.aspekTitle = targetAspect.aspekTitle;
      KPMR_form.aspekBobot = targetAspect.aspekBobot;

      // ========== HANDLE PERTANYAAN ==========
      let targetQuestion = null;

      if (KPMR_isAddingNewQuestion) {
        const existingQuestion = questions.find((q) => q.aspekNo === KPMR_form.aspekNo && q.sectionNo === KPMR_form.sectionNo && q.year === KPMR_form.year);

        if (existingQuestion) {
          targetQuestion = existingQuestion;
        } else {
          targetQuestion = await createQuestion({
            year: KPMR_form.year,
            aspekNo: KPMR_form.aspekNo,
            sectionNo: KPMR_form.sectionNo,
            sectionTitle: KPMR_form.sectionTitle,
          });
          await fetchQuestions(KPMR_form.year);
        }
      } else {
        targetQuestion = questions.find((q) => q.id === KPMR_form.questionId);
        if (!targetQuestion) {
          showToast('Pertanyaan tidak ditemukan', 'error');
          return;
        }
      }

      // ========== BUAT DEFINITION ==========
      const definition = await createOrUpdateDefinition({
        year: Number(KPMR_form.year),
        aspekNo: targetAspect.aspekNo,
        aspekTitle: targetAspect.aspekTitle,
        aspekBobot: Number(targetAspect.aspekBobot) || 30,
        sectionNo: targetQuestion.sectionNo,
        sectionTitle: targetQuestion.sectionTitle,
        level1: KPMR_form.level1 || undefined,
        level2: KPMR_form.level2 || undefined,
        level3: KPMR_form.level3 || undefined,
        level4: KPMR_form.level4 || undefined,
        level5: KPMR_form.level5 || undefined,
        evidence: KPMR_form.evidence || undefined,
      });

      // ========== BUAT SCORE JIKA ADA ==========
      if (KPMR_form.sectionSkor && KPMR_form.sectionSkor !== '') {
        await createOrUpdateScore({
          definitionId: definition.id,
          year: Number(KPMR_form.year),
          quarter: KPMR_form.quarter,
          sectionSkor: Number(KPMR_form.sectionSkor),
        });
      }

      isDataLoadedRef.current = false;
      await fetchFullData(Number(KPMR_form.year));

      KPMR_resetForm();
      setShowKPMRForm(false);
      setKPMR_isAddingNewAspect(false);
      setKPMR_isAddingNewQuestion(false);

      showToast('Data berhasil disimpan!', 'success');
      try {
        const user = getCurrentUser();
        await logCreate(
          'PASAR',
          `Menambah data KPMR Pasar - Aspek: ${KPMR_form.aspekNo} ${KPMR_form.aspekTitle}, Pertanyaan: ${KPMR_form.sectionNo}, Tahun: ${KPMR_form.year}, Triwulan: ${KPMR_form.quarter}`,
          {
            userId: user.userId,
            isSuccess: true,
            metadata: { type: 'kpmr', aspekNo: KPMR_form.aspekNo, sectionNo: KPMR_form.sectionNo, year: KPMR_form.year, quarter: KPMR_form.quarter }
          }
        );
      } catch (logErr) { console.warn('Audit log gagal (create):', logErr); }
    } catch (err) {
      console.error('Gagal menyimpan data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const KPMR_startEdit = (target) => {
    console.log('KPMR_startEdit target:', target);
    const { definitionId, year, quarter, aspekNo, sectionNo } = target;

    let definition = null;
    let scoreData = null;

    if (definitionId && !isNaN(Number(definitionId))) {
      definition = definitions.find((d) => Number(d.id) === Number(definitionId));
    }

    if (!definition && aspekNo && sectionNo) {
      definition = definitions.find((d) => d.aspekNo === aspekNo && d.sectionNo === sectionNo && Number(d.year) === Number(year));
    }

    if (!definition) {
      for (const group of groups) {
        if (group.aspekNo === aspekNo) {
          for (const section of group.sections) {
            if (section.sectionNo === sectionNo) {
              const validDefinitionId = section.definitionId;

              if (validDefinitionId) {
                const existingDef = definitions.find((d) => Number(d.id) === Number(validDefinitionId));
                if (existingDef) {
                  definition = existingDef;
                } else {
                  definition = {
                    id: validDefinitionId,
                    year: year,
                    aspekNo: group.aspekNo,
                    aspekTitle: group.aspekTitle,
                    aspekBobot: group.aspekBobot,
                    sectionNo: section.sectionNo,
                    sectionTitle: section.sectionTitle,
                    level1: section.level1,
                    level2: section.level2,
                    level3: section.level3,
                    level4: section.level4,
                    level5: section.level5,
                    evidence: section.evidence,
                  };
                }
              }

              if (section.quarters && section.quarters[quarter]) {
                scoreData = {
                  sectionSkor: section.quarters[quarter].sectionSkor,
                };
              }
              break;
            }
          }
        }
        if (definition) break;
      }
    }

    if (!definition) {
      console.error('Definition not found for target:', target);
      if (window.confirm('Data tidak ditemukan. Apakah Anda ingin memuat ulang data?')) {
        fetchFullData(Number(year)).then(() => {
          setTimeout(() => {
            KPMR_startEdit(target);
          }, 500);
        });
      }
      return;
    }

    if (!scoreData) {
      const score = scores.find((s) => Number(s.definitionId) === Number(definition.id) && Number(s.year) === Number(year) && s.quarter === quarter);
      if (score) {
        scoreData = { sectionSkor: score.sectionSkor };
      }
    }

    let question = null;
    if (definition.sectionTitle) {
      question = questions.find((q) => q.aspekNo === definition.aspekNo && q.sectionNo === definition.sectionNo && q.sectionTitle === definition.sectionTitle);
    }

    if (!question) {
      const possibleQuestions = questions.filter((q) => q.aspekNo === definition.aspekNo && q.sectionNo === definition.sectionNo);
      if (possibleQuestions.length === 1) {
        question = possibleQuestions[0];
      } else if (possibleQuestions.length > 1 && definition.sectionTitle) {
        question = possibleQuestions.find((q) => q.sectionTitle === definition.sectionTitle);
        if (!question && possibleQuestions.length > 0) {
          question = possibleQuestions[0];
        }
      }
    }

    setKPMR_form({
      year: definition.year,
      quarter: quarter || 'Q1',
      aspekNo: definition.aspekNo,
      aspekTitle: definition.aspekTitle,
      aspekBobot: definition.aspekBobot,
      sectionNo: definition.sectionNo,
      sectionTitle: definition.sectionTitle,
      level1: definition.level1 || '',
      level2: definition.level2 || '',
      level3: definition.level3 || '',
      level4: definition.level4 || '',
      level5: definition.level5 || '',
      evidence: definition.evidence || '',
      sectionSkor: scoreData?.sectionSkor?.toString() || '',
      definitionId: definition.id,
      questionId: question?.id || null,
    });

    setKPMR_editingTarget({
      ...target,
      questionId: question?.id || null,
      originalDefinitionId: definition.id,
      originalAspekNo: definition.aspekNo,
      originalSectionNo: definition.sectionNo,
    });

    setShowKPMRForm(true);
    setKPMR_isAddingNewAspect(false);
    setKPMR_isAddingNewQuestion(false);
  };

  const KPMR_saveEdit = async () => {
    if (!KPMR_editingTarget || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { definitionId, year, questionId: originalQuestionId } = KPMR_editingTarget;
      const targetYear = year || KPMR_form.year;

      if (!targetYear || isNaN(targetYear)) {
        showToast('Tahun tidak valid', 'error');
        return;
      }

      let targetDefinition = null;
      let isNewQuestion = false;

      if (KPMR_form.questionId && KPMR_form.questionId !== originalQuestionId) {
        isNewQuestion = true;

        const selectedQuestion = questions.find((q) => q.id === KPMR_form.questionId);
        if (!selectedQuestion) {
          throw new Error('Pertanyaan yang dipilih tidak ditemukan');
        }

        targetDefinition = definitions.find((d) => d.year === targetYear && d.aspekNo === KPMR_form.aspekNo && d.sectionNo === selectedQuestion.sectionNo);

        if (targetDefinition) {
          const updateData = {};
          if (KPMR_form.aspekTitle !== undefined && KPMR_form.aspekTitle !== '') updateData.aspekTitle = KPMR_form.aspekTitle;
          if (KPMR_form.aspekBobot !== undefined) updateData.aspekBobot = Number(KPMR_form.aspekBobot);
          if (KPMR_form.sectionTitle !== undefined && KPMR_form.sectionTitle !== '') updateData.sectionTitle = KPMR_form.sectionTitle;
          if (KPMR_form.level1 !== undefined) updateData.level1 = KPMR_form.level1;
          if (KPMR_form.level2 !== undefined) updateData.level2 = KPMR_form.level2;
          if (KPMR_form.level3 !== undefined) updateData.level3 = KPMR_form.level3;
          if (KPMR_form.level4 !== undefined) updateData.level4 = KPMR_form.level4;
          if (KPMR_form.level5 !== undefined) updateData.level5 = KPMR_form.level5;
          if (KPMR_form.evidence !== undefined) updateData.evidence = KPMR_form.evidence;

          if (Object.keys(updateData).length > 0) {
            await updateDefinition(targetDefinition.id, updateData);
          }
        } else {
          targetDefinition = await createOrUpdateDefinition({
            year: Number(targetYear),
            aspekNo: KPMR_form.aspekNo,
            aspekTitle: KPMR_form.aspekTitle,
            aspekBobot: Number(KPMR_form.aspekBobot) || 30,
            sectionNo: selectedQuestion.sectionNo,
            sectionTitle: selectedQuestion.sectionTitle,
            level1: KPMR_form.level1 || undefined,
            level2: KPMR_form.level2 || undefined,
            level3: KPMR_form.level3 || undefined,
            level4: KPMR_form.level4 || undefined,
            level5: KPMR_form.level5 || undefined,
            evidence: KPMR_form.evidence || undefined,
          });
        }
      } else {
        let existingDefinition = definitions.find((d) => d.id === Number(definitionId));

        if (!existingDefinition) {
          existingDefinition = definitions.find((d) => d.aspekNo === KPMR_form.aspekNo && d.sectionNo === KPMR_form.sectionNo && Number(d.year) === Number(targetYear));
        }

        if (existingDefinition) {
          targetDefinition = existingDefinition;

          const updateData = {};
          if (KPMR_form.aspekTitle !== undefined && KPMR_form.aspekTitle !== '') updateData.aspekTitle = KPMR_form.aspekTitle;
          if (KPMR_form.aspekBobot !== undefined) updateData.aspekBobot = Number(KPMR_form.aspekBobot);
          if (KPMR_form.sectionTitle !== undefined && KPMR_form.sectionTitle !== '') updateData.sectionTitle = KPMR_form.sectionTitle;
          if (KPMR_form.level1 !== undefined) updateData.level1 = KPMR_form.level1;
          if (KPMR_form.level2 !== undefined) updateData.level2 = KPMR_form.level2;
          if (KPMR_form.level3 !== undefined) updateData.level3 = KPMR_form.level3;
          if (KPMR_form.level4 !== undefined) updateData.level4 = KPMR_form.level4;
          if (KPMR_form.level5 !== undefined) updateData.level5 = KPMR_form.level5;
          if (KPMR_form.evidence !== undefined) updateData.evidence = KPMR_form.evidence;

          if (Object.keys(updateData).length > 0) {
            await updateDefinition(existingDefinition.id, updateData);
          }
        } else {
          targetDefinition = await createOrUpdateDefinition({
            year: Number(targetYear),
            aspekNo: KPMR_form.aspekNo,
            aspekTitle: KPMR_form.aspekTitle,
            aspekBobot: Number(KPMR_form.aspekBobot) || 30,
            sectionNo: KPMR_form.sectionNo,
            sectionTitle: KPMR_form.sectionTitle,
            level1: KPMR_form.level1 || undefined,
            level2: KPMR_form.level2 || undefined,
            level3: KPMR_form.level3 || undefined,
            level4: KPMR_form.level4 || undefined,
            level5: KPMR_form.level5 || undefined,
            evidence: KPMR_form.evidence || undefined,
          });
        }
      }

      if (KPMR_form.sectionSkor && KPMR_form.sectionSkor !== '') {
        await createOrUpdateScore({
          definitionId: targetDefinition.id,
          year: Number(targetYear),
          quarter: KPMR_form.quarter,
          sectionSkor: Number(KPMR_form.sectionSkor),
        });
      }

      if (isNewQuestion && definitionId && !isNaN(Number(definitionId))) {
        const oldScores = scores.filter((s) => s.definitionId === Number(definitionId));
        if (oldScores.length === 0) {
          await deleteDefinition(Number(definitionId), targetYear);
        }
      }

      isDataLoadedRef.current = false;
      await fetchFullData(Number(targetYear));

      KPMR_resetForm();
      setShowKPMRForm(false);

      showToast('Data berhasil diupdate!', 'success');
      try {
        const user = getCurrentUser();
        await logUpdate(
          'PASAR',
          `Mengupdate data KPMR Pasar - Aspek: ${KPMR_form.aspekNo}, Pertanyaan: ${KPMR_form.sectionNo}, Tahun: ${KPMR_form.year}, Triwulan: ${KPMR_form.quarter}`,
          {
            userId: user.userId,
            isSuccess: true,
            metadata: { type: 'kpmr', aspekNo: KPMR_form.aspekNo, sectionNo: KPMR_form.sectionNo, year: KPMR_form.year, quarter: KPMR_form.quarter }
          }
        );
      } catch (logErr) { console.warn('Audit log gagal (update):', logErr); }
    } catch (err) {
      console.error('❌ Gagal mengupdate data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Aspek - HARD DELETE
  const handleDeleteAspect = async (aspectId, aspectName) => {
    if (!aspectId) {
      showToast('ID Aspek tidak ditemukan', 'error');
      return;
    }
    if (!confirm(`⚠️ PERINGATAN!\n\nHapus aspek "${aspectName}" akan menghapus:\n✓ SEMUA pertanyaan dalam aspek ini\n✓ SEMUA data definisi\n✓ SEMUA skor\n\nYakin ingin menghapus?`)) return;

    try {
      const result = await deleteAspect(aspectId);
      if (result && result.success) {
        showToast(result.message || `Aspek "${aspectName}" berhasil dihapus`, 'success');
        try {
          const user = getCurrentUser();
          await logDelete(
            'PASAR',
            `Menghapus Aspek KPMR Pasar: "${aspectName}" (ID: ${aspectId}), Tahun: ${viewYear}`,
            {
              userId: user.userId,
              isSuccess: true,
              metadata: { type: 'kpmr', aspectId, aspectName, year: viewYear }
            }
          );
        } catch (logErr) { console.warn('Audit log gagal (delete aspek):', logErr); }
        await Promise.all([fetchAspects(viewYear), fetchQuestions(viewYear), fetchFullData(viewYear)]);
      } else {
        showToast(result?.message || 'Gagal menghapus aspek', 'error');
      }
    } catch (err) {
      console.error('DELETE ASPECT ERROR:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menghapus aspek';
      showToast(errorMessage, 'error');
    }
  };

  const KPMR_exportExcel = async () => {
    try {
      const allRows = groups.flatMap((g) =>
        g.sections.flatMap((s) =>
          Object.keys(s.quarters).map((q) => ({
            aspekNo: g.aspekNo,
            aspekTitle: g.aspekTitle,
            aspekBobot: g.aspekBobot,
            sectionNo: s.sectionNo,
            sectionTitle: s.sectionTitle,
            quarter: q,
            sectionSkor: s.quarters[q]?.sectionSkor,
            level1: s.level1,
            level2: s.level2,
            level3: s.level3,
            level4: s.level4,
            level5: s.level5,
            evidence: s.evidence,
          })),
        ),
      );

      exportKPMRPasarToExcel({
        year: viewYear,
        rows: allRows,
      });

      showToast(`Data KPMR tahun ${viewYear} berhasil diexport`, 'success');
      try {
        const user = getCurrentUser();
        await logExport(
          'PASAR',
          `Export Excel KPMR Pasar tahun ${viewYear}`,
          {
            userId: user.userId,
            isSuccess: true,
            metadata: { type: 'kpmr', year: viewYear, totalRows: allRows.length, format: 'Excel' }
          }
        );
      } catch (logErr) { console.warn('Audit log gagal (export):', logErr); }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Gagal mengexport data', 'error');
    }
  };

  const filteredGroups = useMemo(() => {
    if (!query?.trim()) return groups;

    const lowerQuery = query.toLowerCase();
    return groups.map((group) => ({
      ...group,
      sections: group.sections.filter(
        (section) =>
          section.sectionNo?.toLowerCase().includes(lowerQuery) ||
          section.sectionTitle?.toLowerCase().includes(lowerQuery) ||
          section.evidence?.toLowerCase().includes(lowerQuery) ||
          group.aspekNo?.toLowerCase().includes(lowerQuery) ||
          group.aspekTitle?.toLowerCase().includes(lowerQuery),
      ),
    }));
  }, [groups, query]);

  const getQuarterAverage = useCallback(
    (quarter) => {
      const quarterScores = scores.filter((s) => s.year === viewYear && s.quarter === quarter && s.sectionSkor != null);
      if (!quarterScores.length) return '-';
      const nums = quarterScores.map((s) => Number(s.sectionSkor)).filter((n) => !isNaN(n));
      if (nums.length === 0) return '-';
      const average = nums.reduce((a, b) => a + b, 0) / nums.length;
      return isNaN(average) ? '-' : average.toFixed(2);
    },
    [scores, viewYear],
  );

  const calculateOverallAverage = useCallback(
    (quarter) => {
      if (!filteredGroups.length) return '-';

      const aspectAverages = filteredGroups
        .map((group) => {
          const allSectionScores = group.sections
            .map((section) => section.quarters[quarter])
            .filter((data) => data && data.sectionSkor != null && data.sectionSkor !== '')
            .map((data) => Number(data.sectionSkor));

          return allSectionScores.length ? allSectionScores.reduce((a, b) => a + b, 0) / allSectionScores.length : null;
        })
        .filter((val) => val != null);

      if (aspectAverages.length === 0) return '-';
      const overall = aspectAverages.reduce((a, b) => a + b, 0) / aspectAverages.length;
      return isNaN(overall) ? '-' : overall.toFixed(2);
    },
    [filteredGroups],
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && <ToastNotification message={toast.message} type={toast.type} onClose={clearToast} />}

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

      <header className="rounded-xl shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">KPMR – Pasar</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" value={viewYear} onChange={(e) => setViewYear(Number(e.target.value) || getCurrentYear())} className="w-20 rounded-xl px-3 py-2 border" />
            <div className="relative">
              <input value={query || ''} onChange={(e) => setQuery(e.target.value)} placeholder="Cari aspek/section/evidence…" className="pl-9 pr-3 py-2 rounded-xl border w-64" />
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={() => setShowKPMRForm(true)} disabled={loading || isSubmitting} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50">
              + Tambah Data
            </button>
            <button onClick={KPMR_exportExcel} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border bg-gray-900 text-white hover:bg-black">
              <Download size={18} /> Export {viewYear}
            </button>
          </div>
        </div>
      </header>

      {/* FORM KPMR */}
      {showKPMRForm && (
        <section className={`rounded-2xl border shadow p-4 ${PNM_BRAND.gradient} text-white`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold drop-shadow">{KPMR_editingTarget ? 'Edit Data KPMR' : 'Tambah Data KPMR'}</h2>
            <button
              onClick={() => {
                setShowKPMRForm(false);
                KPMR_resetForm();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Kolom Kiri */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="mb-1 text-[13px] text-white/90 font-medium">Aspek (No)</div>
                  <select
                    className="w-full rounded-xl px-3 py-2 bg-white text-gray-900"
                    value={KPMR_isAddingNewAspect ? 'new' : aspects.find((a) => a.aspekNo === KPMR_form.aspekNo)?.id || ''}
                    onChange={(e) => handleAspectChange(e.target.value)}
                  >
                    <option value="">-- Pilih Aspek --</option>
                    {aspects.map((aspect) => (
                      <option key={aspect.id} value={aspect.id}>
                        {aspect.aspekNo} - {aspect.aspekTitle}
                      </option>
                    ))}
                    <option value="new">+ Tambah Aspek Baru</option>
                  </select>
                </label>
                {KPMR_isAddingNewAspect ? (
                  <>
                    <label className="block">
                      <div className="mb-1 text-[13px] text-white/90 font-medium">Aspek No</div>
                      <input className="w-full rounded-xl px-3 py-2 bg-white text-gray-900" value={KPMR_form.aspekNo} onChange={(e) => KPMR_handleChange('aspekNo', e.target.value)} placeholder="Contoh: 1, 2, 3..." />
                    </label>
                    <label className="block col-span-2">
                      <div className="mb-1 text-[13px] text-white/90 font-medium">Judul Aspek</div>
                      <input
                        className="w-full rounded-xl px-3 py-2 bg-white text-gray-900"
                        value={KPMR_form.aspekTitle}
                        onChange={(e) => KPMR_handleChange('aspekTitle', e.target.value)}
                        placeholder="Contoh: Aspek Manajemen Risiko Pasar"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-1 text-[13px] text-white/90 font-medium">Bobot Aspek</div>
                      <div className="relative">
                        <input type="number" className="w-full rounded-xl pl-3 pr-10 py-2 bg-white text-gray-900" value={KPMR_form.aspekBobot} onChange={(e) => KPMR_handleChange('aspekBobot', Number(e.target.value))} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                      </div>
                    </label>
                  </>
                ) : (
                  <label className="block">
                    <div className="mb-1 text-[13px] text-white/90 font-medium">Bobot Aspek</div>
                    <div className="relative">
                      <input type="number" className="w-full rounded-xl pl-3 pr-10 py-2 bg-white text-gray-900" value={KPMR_form.aspekBobot} onChange={(e) => KPMR_handleChange('aspekBobot', Number(e.target.value))} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                    </div>
                  </label>
                )}
              </div>

              <label className="block">
                <div className="mb-1 text-[13px] text-white/90 font-medium">Pertanyaan Section</div>
                <select
                  className="w-full rounded-xl px-3 py-2 bg-white text-gray-900"
                  value={KPMR_isAddingNewQuestion ? 'new' : KPMR_form.questionId || ''}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  disabled={!KPMR_form.aspekNo}
                >
                  <option value="">-- Pilih Pertanyaan --</option>
                  {questions
                    .filter((q) => q.aspekNo === KPMR_form.aspekNo)
                    .map((question) => (
                      <option key={question.id} value={question.id}>
                        {question.sectionNo} - {question.sectionTitle}
                      </option>
                    ))}
                  <option value="new">+ Tambah Pertanyaan Baru</option>
                </select>
              </label>

              {KPMR_isAddingNewQuestion && (
                <>
                  <label className="block">
                    <div className="mb-1 text-[13px] text-white/90 font-medium">No Section</div>
                    <input className="w-full rounded-xl px-3 py-2 bg-white text-gray-900" value={KPMR_form.sectionNo} onChange={(e) => KPMR_handleChange('sectionNo', e.target.value)} placeholder="Contoh: 1, 1.1, 2, 2.1, dll" />
                  </label>
                  <label className="block">
                    <div className="mb-1 text-[13px] text-white/90 font-medium">Judul Pertanyaan</div>
                    <textarea
                      className="w-full rounded-xl px-3 py-2 bg-white text-gray-900 min-h-[64px]"
                      value={KPMR_form.sectionTitle}
                      onChange={(e) => KPMR_handleChange('sectionTitle', e.target.value)}
                      placeholder="Masukkan judul pertanyaan..."
                    />
                  </label>
                </>
              )}

              {!KPMR_isAddingNewQuestion && KPMR_form.aspekNo && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <div className="mb-1 text-[13px] text-white/90 font-medium">Pilih Triwulan</div>
                      <select className="w-full rounded-xl px-3 py-2 bg-white text-gray-900" value={KPMR_form.quarter} onChange={(e) => handleQuarterChange(e.target.value)}>
                        <option value="Q1">Q1 (MAR)</option>
                        <option value="Q2">Q2 (JUN)</option>
                        <option value="Q3">Q3 (SEP)</option>
                        <option value="Q4">Q4 (DES)</option>
                      </select>
                    </label>
                    <label className="block">
                      <div className="mb-1 text-[13px] text-white/90 font-medium">Skor {KPMR_form.quarter}</div>
                      <input
                        type="number"
                        className="w-full rounded-xl px-3 py-2 bg-white text-gray-900"
                        value={KPMR_form.sectionSkor}
                        onChange={(e) => KPMR_handleChange('sectionSkor', e.target.value)}
                        placeholder="Masukkan skor (0-100)"
                        min="0"
                        max="100"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <div className="mb-1 text-[13px] text-white/90 font-medium">Rata-rata {KPMR_form.quarter}</div>
                      <input className="w-full rounded-xl px-3 py-2 bg-white/70 text-gray-900" value={getQuarterAverage(KPMR_form.quarter)} readOnly />
                    </label>
                  </div>
                </>
              )}

              <label className="block">
                <div className="mb-1 text-[13px] text-white/90 font-medium">Evidence (Year-Level: berlaku untuk semua triwulan di tahun {KPMR_form.year})</div>
                <textarea
                  className="w-full rounded-xl px-3 py-2 bg-white text-gray-900 min-h-[56px]"
                  value={KPMR_form.evidence}
                  onChange={(e) => KPMR_handleChange('evidence', e.target.value)}
                  placeholder="Masukkan bukti/dokumen pendukung..."
                />
              </label>
            </div>

            {/* Kolom Kanan - 5 Level */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((v) => (
                <div key={v} className="rounded-xl shadow-sm bg-white/95 backdrop-blur">
                  <div className="px-3 pt-3 text-[13px] font-semibold text-gray-800">
                    {v}. {['Strong', 'Satisfactory', 'Fair', 'Marginal', 'Unsatisfactory'][v - 1]}
                  </div>
                  <div className="p-3">
                    <textarea
                      className="w-full rounded-lg px-3 py-2 bg-white min-h-[56px] text-gray-900"
                      value={KPMR_form[`level${v}`]}
                      onChange={(e) => KPMR_handleChange(`level${v}`, e.target.value)}
                      placeholder={`Deskripsi level ${v}...`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {!KPMR_editingTarget ? (
              <button onClick={KPMR_addRow} disabled={isSubmitting} className="bg-white/90 text-gray-900 font-semibold px-5 py-2 rounded-lg shadow disabled:opacity-50">
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={KPMR_saveEdit} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  onClick={() => {
                    KPMR_resetForm();
                    setShowKPMRForm(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border bg-transparent hover:bg-white/10"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MODAL EDIT ASPEK */}
      {showEditAspectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Aspek</h2>
              <button onClick={() => setShowEditAspectModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Aspek</label>
                <input
                  type="text"
                  className="w-full rounded-xl px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editingAspectData.aspekNo}
                  onChange={(e) => setEditingAspectData({ ...editingAspectData, aspekNo: e.target.value })}
                  placeholder="Contoh: 1, 2, 3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Aspek</label>
                <input
                  type="text"
                  className="w-full rounded-xl px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editingAspectData.aspekTitle}
                  onChange={(e) => setEditingAspectData({ ...editingAspectData, aspekTitle: e.target.value })}
                  placeholder="Contoh: Aspek Manajemen Risiko Pasar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bobot Aspek (%)</label>
                <input
                  type="number"
                  className="w-full rounded-xl px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editingAspectData.aspekBobot}
                  onChange={(e) => setEditingAspectData({ ...editingAspectData, aspekBobot: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>

              <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">Tahun: {editingAspectData.year}</div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditAspectModal(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSaveEditAspect} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Triwulan */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm font-medium text-gray-700">Filter Triwulan:</span>
        {QUARTER_ORDER.map((q) => (
          <button
            key={q}
            onClick={() => toggleQuarter(q)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedQuarters.includes(q) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {q} ({QUARTER_LABEL[q]})
          </button>
        ))}
        {selectedQuarters.length > 0 && (
          <button onClick={() => setSelectedQuarters([])} className="text-xs text-gray-500 hover:text-gray-700 underline ml-2">
            Reset
          </button>
        )}
      </div>

      {/* Tabel */}
      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-100 border-b">
          <div className="font-semibold">
            Data KPMR – Pasar ({viewYear} {selectedQuarters.length > 0 ? `- Triwulan: ${selectedQuarters.join(', ')}` : '- Semua Triwulan'})
          </div>
        </div>
        <div className="relative h-[420px] overflow-auto">
          <table className="w-full text-sm border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="border px-3 py-2 text-left w-16">No</th>
                <th className="border px-3 py-2 text-left w-96">Pertanyaan</th>
                {QUARTER_ORDER.filter(shouldShowQuarter).map((q) => (
                  <th key={q} className="border px-3 py-2 text-center w-24">
                    {q} ({QUARTER_LABEL[q]})
                  </th>
                ))}
                <th className="border px-3 py-2 text-left w-48">Level 1</th>
                <th className="border px-3 py-2 text-left w-48">Level 2</th>
                <th className="border px-3 py-2 text-left w-48">Level 3</th>
                <th className="border px-3 py-2 text-left w-48">Level 4</th>
                <th className="border px-3 py-2 text-left w-48">Level 5</th>
                <th className="border px-3 py-2 text-left w-72">Evidence & Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-6">
                    Belum ada data untuk tahun {viewYear}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, groupIndex) => {
                  let aspectData = aspects.find((a) => a.aspekNo === group.aspekNo && a.year === viewYear);

                  if (!aspectData) {
                    aspectData = aspects.find((a) => a.aspekNo === group.aspekNo);
                  }

                  if (!aspectData) {
                    aspectData = {
                      id: null,
                      aspekNo: group.aspekNo,
                      aspekTitle: group.aspekTitle,
                      aspekBobot: group.aspekBobot,
                      year: viewYear,
                    };
                  }

                  const aspekId = aspectData?.id;
                  const fullAspectData = aspectData;

                  const calculateAspectAvg = (quarter) => {
                    const scores = group.sections.map((s) => s.quarters[quarter]?.sectionSkor).filter((v) => v != null);
                    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '-';
                  };

                  return (
                    <React.Fragment key={groupIndex}>
                      <tr className="bg-[#e9f5e1]">
                        <td colSpan={2} className="border px-3 py-2 font-semibold">
                          {group.aspekNo} : {group.aspekTitle} <span className="text-gray-600">(Bobot: {group.aspekBobot}%)</span>
                          <button onClick={() => handleOpenEditAspect(fullAspectData)} className="ml-2 text-blue-600 hover:text-blue-800 text-xs" title="Edit Aspek">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => handleDeleteAspect(aspekId, group.aspekTitle)} className="ml-1 text-red-600 hover:text-red-800 text-xs" title="Hapus Aspek">
                            <Trash2 size={12} />
                          </button>
                        </td>
                        {QUARTER_ORDER.filter(shouldShowQuarter).map((q) => (
                          <td key={q} className="border px-3 py-2 text-center font-bold bg-[#93d150]">
                            {calculateAspectAvg(q)}
                          </td>
                        ))}
                        <td colSpan={6} className="border px-3 py-2"> </td>
                      </tr>
                      {group.sections.map((section, sectionIdx) => {
                        const questionData = questions.find((q) => q.sectionNo === section.sectionNo && q.aspekNo === group.aspekNo && q.year === viewYear);
                        const questionId = questionData?.id;
                        const defaultQuarter = Object.keys(section.quarters).length > 0 ? Object.keys(section.quarters)[0] : 'Q1';

                        return (
                          <tr key={`${groupIndex}-${sectionIdx}`} className="align-top hover:bg-gray-50">
                            <td className="border px-2 py-2 text-center w-16">{section.sectionNo}</td>
                            <td className="border px-2 py-2 whitespace-pre-wrap w-96">{section.sectionTitle}</td>
                            {QUARTER_ORDER.filter(shouldShowQuarter).map((q) => (
                              <td key={q} className="border px-2 py-2 text-center w-24">
                                {section.quarters[q]?.sectionSkor || '-'}
                              </td>
                            ))}
                            <td className="border px-2 py-2 whitespace-pre-wrap w-48">{section.level1 || ''}</td>
                            <td className="border px-2 py-2 whitespace-pre-wrap w-48">{section.level2 || ''}</td>
                            <td className="border px-2 py-2 whitespace-pre-wrap w-48">{section.level3 || ''}</td>
                            <td className="border px-2 py-2 whitespace-pre-wrap w-48">{section.level4 || ''}</td>
                            <td className="border px-2 py-2 whitespace-pre-wrap w-48">{section.level5 || ''}</td>
                            <td className="border px-2 py-2 whitespace-pre-wrap w-72">
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex-1 break-words">{section.evidence || '-'}</span>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={() => KPMR_startEdit({ definitionId: section.definitionId, year: viewYear, quarter: defaultQuarter, aspekNo: group.aspekNo, sectionNo: section.sectionNo })}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50 text-xs"
                                    title="Edit"
                                  >
                                    <Edit3 size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestionFromRow(questionId, group.aspekNo, group.aspekTitle, section.sectionNo, section.sectionTitle)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-red-50 text-red-600 text-xs"
                                    title="Hapus Pertanyaan"
                                  >
                                    <Trash2 size={14} /> Hapus
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
              <tr className="bg-[#c9daf8] font-semibold">
                <td colSpan={2} className="border px-3 py-2 text-center font-bold">
                  RATA-RATA KESELURUHAN
                </td>
                {QUARTER_ORDER.filter(shouldShowQuarter).map((q) => (
                  <td key={q} className="border px-3 py-2 text-center font-bold bg-[#93d150]">
                    {calculateOverallAverage(q)}
                  </td>
                ))}
                <td colSpan={6} className="border px-3 py-2"> </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}