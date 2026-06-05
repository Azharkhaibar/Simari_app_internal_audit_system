// src/ojk/hukum/hukum-kpmr/hukum-kpmr.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useHeaderStore } from '../../../../store/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Copy, FileWarning, ArrowBigLeft, ArrowBigRight, ChevronDown, ChevronUp, Edit, Save, X } from 'lucide-react';

import { normalizeKpmrRows } from '../utils/normalize/normalize-kpmr-rows';
import { useDropdownPortal } from '../components/usedropdownportal';
import PopUpDelete from '../components/popup-delete';
import { useToast } from '../components/use-toast';
import useKpmrHukum from '../hook/kpmr/hukum-kpmr.hook';
import { useAuditLog } from '../../../../../audit-log/hooks/audit-log.hooks';
import { useAuth } from '@/features/auth/hooks/useAuth.hook';
// ==================== HELPER FUNCTION ====================
const formatQuarter = (quarter) => {
  if (!quarter && quarter !== 0) return 'Q1';
  if (typeof quarter === 'string') {
    const upper = quarter.trim().toUpperCase();
    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(upper)) return upper;
  }
  const num = Number(quarter);
  if (!isNaN(num) && num >= 1 && num <= 4) return `Q${num}`;
  return 'Q1';
};

const IndicatorItem = React.memo(({ label, value, onChange, color, loading = false, editMode = false }) => (
  <div className="rounded-xl px-2 py-2 text-white" style={{ backgroundColor: color }}>
    <div className="text-base font-bold text-center mb-1">{label}</div>
    <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={loading || !editMode} placeholder="Masukan deskripsi level" className="bg-white text-center text-black text-md min-h-[100px]" />
  </div>
));

IndicatorItem.displayName = 'IndicatorItem';

function PertanyaanPanel({ aspekId, pertanyaanList = [], activePertanyaanIndex, setActivePertanyaanIndex, activeQuarter, loading = false, editModePertanyaan, setEditModePertanyaan, onRefreshData, aspekData }) {
  const { toast } = useToast();
  const [openPertanyaanList, setOpenPertanyaanList] = useState(false);
  const [originalPertanyaan, setOriginalPertanyaan] = useState(null);
  const [draftPertanyaan, setDraftPertanyaan] = useState(null);
  const dropdownPertanyaanBtnRef = useRef(null);
  const [dropdownPertanyaanRect, setDropdownPertanyaanRect] = useState(null);
  const dropdownPertanyaanListRef = useRef(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteContext, setDeleteContext] = useState({
    type: '',
    aspekId: null,
    pertanyaanId: null,
  });

  const { addPertanyaan, updatePertanyaan, deletePertanyaan, updateSkor, saving, refreshKpmrData } = useKpmrHukum();

  // ===== AUDIT LOG =====
  const year = useHeaderStore((s) => s.year);
  const { logCreate, logUpdate, logDelete } = useAuditLog();
  const { authUser } = useAuth();
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

  const formattedQuarter = useMemo(() => formatQuarter(activeQuarter), [activeQuarter]);
  const quarterKey = formattedQuarter;

  const safeActivePertanyaanIndex = useMemo(() => {
    return activePertanyaanIndex !== null && activePertanyaanIndex >= 0 && activePertanyaanIndex < pertanyaanList.length ? activePertanyaanIndex : -1;
  }, [activePertanyaanIndex, pertanyaanList]);

  const currentPertanyaan = useMemo(() => {
    if (editModePertanyaan && draftPertanyaan) return draftPertanyaan;
    if (safeActivePertanyaanIndex >= 0 && pertanyaanList[safeActivePertanyaanIndex]) {
      return pertanyaanList[safeActivePertanyaanIndex];
    }
    return draftPertanyaan || createEmptyPertanyaan();
  }, [editModePertanyaan, draftPertanyaan, safeActivePertanyaanIndex, pertanyaanList]);

  const hasPertanyaan = Array.isArray(pertanyaanList) && pertanyaanList.length > 0;
  const [showPertanyaanForm, setShowPertanyaanForm] = useState(true);

  // Setup dropdown positioning
  useEffect(() => {
    if (!openPertanyaanList || !dropdownPertanyaanBtnRef.current) return;

    const updatePosition = () => {
      const rect = dropdownPertanyaanBtnRef.current.getBoundingClientRect();
      setDropdownPertanyaanRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openPertanyaanList]);

  useDropdownPortal({
    open: openPertanyaanList,
    setOpen: setOpenPertanyaanList,
    triggerRef: dropdownPertanyaanBtnRef,
    containerRef: dropdownPertanyaanListRef,
  });

  // Reset edit mode when active question changes
  useEffect(() => {
    if (activePertanyaanIndex >= 0) {
      setEditModePertanyaan(false);
      setOriginalPertanyaan(null);
      setDraftPertanyaan(null);
    }
  }, [activePertanyaanIndex, setEditModePertanyaan]);

  // Initialize draft for new question
  useEffect(() => {
    if (!hasPertanyaan || activePertanyaanIndex === -1) {
      setEditModePertanyaan(true);
      if (!draftPertanyaan) {
        setDraftPertanyaan(createEmptyPertanyaan());
      }
    }
  }, [hasPertanyaan, activePertanyaanIndex]);

  function createEmptyPertanyaan() {
    return {
      id: `temp-${crypto.randomUUID()}`,
      nomor: '',
      pertanyaan: '',
      skor: {},
      indicator: {
        strong: '',
        satisfactory: '',
        fair: '',
        marginal: '',
        unsatisfactory: '',
      },
      evidence: '',
    };
  }

  const updateLocalPertanyaan = useCallback(
    (updatedPertanyaan) => {
      if (aspekData && aspekData.pertanyaanList) {
        const updatedList = aspekData.pertanyaanList.map((p) => (p.id === updatedPertanyaan.id ? updatedPertanyaan : p));

        if (typeof onRefreshData === 'function') {
          onRefreshData({
            ...aspekData,
            pertanyaanList: updatedList,
          });
        }
      }
    },
    [aspekData, onRefreshData],
  );

  const formatPertanyaanLabel = useCallback((pertanyaan, index) => {
    if (!pertanyaan) return 'Buat Pertanyaan Baru';
    const nomor = pertanyaan.nomor || index + 1;
    const pertanyaanText = pertanyaan.pertanyaan || 'Tanpa Pertanyaan';
    return `${nomor} – ${pertanyaanText.substring(0, 50)}${pertanyaanText.length > 50 ? '...' : ''}`;
  }, []);

  const handleChangeDraftPertanyaan = useCallback(
    (path, value) => {
      if (!draftPertanyaan || !editModePertanyaan) return;
      const updatedDraft = { ...draftPertanyaan };
      const keys = path.split('.');
      let current = updatedDraft;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
      setDraftPertanyaan(updatedDraft);
    },
    [draftPertanyaan, editModePertanyaan],
  );

  const handleChangePertanyaanField = useCallback(
    async (path, value) => {
      if (!aspekId || safeActivePertanyaanIndex === -1 || !pertanyaanList[safeActivePertanyaanIndex]) return;
      const pertanyaan = pertanyaanList[safeActivePertanyaanIndex];
      if (pertanyaan.id?.startsWith('temp-')) return;

      const updatedPertanyaan = { ...pertanyaan };
      const keys = path.split('.');
      let current = updatedPertanyaan;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;

      try {
        await updatePertanyaan(pertanyaan.id, updatedPertanyaan);
        const refreshedRows = await refreshKpmrData();
        if (refreshedRows && refreshedRows.length > 0 && typeof onRefreshData === 'function') {
          onRefreshData(refreshedRows);
        }
        toast({ title: 'Berhasil', description: 'Pertanyaan berhasil diperbarui' });
        await logUpdate('HUKUM_OJK', `Update Pertanyaan Aspek ID: ${aspekId} - Nomor: ${updatedPertanyaan.nomor || '-'}`, {
          userId: currentUser.id,
          isSuccess: true,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId: pertanyaan.id }
        });
      } catch (error) {
        toast({ title: 'Error', description: error.message || 'Gagal mengupdate pertanyaan', variant: 'destructive' });
        await logUpdate('HUKUM_OJK', `Gagal Update Pertanyaan Aspek ID: ${aspekId}`, {
          userId: currentUser.id,
          isSuccess: false,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId: pertanyaan.id, error: error.message }
        });
      }
    },
    [aspekId, safeActivePertanyaanIndex, pertanyaanList, updatePertanyaan, refreshKpmrData, onRefreshData, toast, logUpdate, currentUser, year, formattedQuarter],
  );

  const handleSkorChange = useCallback(
    async (value) => {
      if (!aspekId || safeActivePertanyaanIndex === -1 || !pertanyaanList[safeActivePertanyaanIndex]) return;
      const pertanyaan = pertanyaanList[safeActivePertanyaanIndex];
      if (pertanyaan.id?.startsWith('temp-')) return;

      const skorNum = Number(value);
      if (isNaN(skorNum) || skorNum < 1 || skorNum > 5 || !Number.isInteger(skorNum)) {
        toast({
          title: 'Validasi',
          description: `Skor harus antara 1-5 dan berupa bilangan bulat!`,
          variant: 'destructive',
        });
        return;
      }

      try {
        const updatedPertanyaan = await updateSkor(pertanyaan.id, quarterKey, skorNum);

        if (aspekData && aspekData.pertanyaanList) {
          const updatedList = aspekData.pertanyaanList.map((p) => (p.id === updatedPertanyaan.id ? updatedPertanyaan : p));

          if (typeof onRefreshData === 'function') {
            onRefreshData({
              ...aspekData,
              pertanyaanList: updatedList,
            });
          }
        }

        toast({ title: 'Berhasil', description: 'Skor berhasil diperbarui' });
        await logUpdate('HUKUM_OJK', `Update Skor Pertanyaan ID: ${pertanyaan.id} (${quarterKey}) menjadi: ${skorNum}`, {
          userId: currentUser.id,
          isSuccess: true,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId: pertanyaan.id, skor: skorNum }
        });
      } catch (error) {
        toast({ title: 'Error', description: error.message || 'Gagal mengupdate skor', variant: 'destructive' });
        await logUpdate('HUKUM_OJK', `Gagal Update Skor Pertanyaan ID: ${pertanyaan.id} (${quarterKey})`, {
          userId: currentUser.id,
          isSuccess: false,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId: pertanyaan.id, error: error.message }
        });
      }
    },
    [aspekId, safeActivePertanyaanIndex, pertanyaanList, quarterKey, updateSkor, onRefreshData, toast, aspekData, logUpdate, currentUser, year, formattedQuarter],
  );

  const handleDraftSkorChange = useCallback(
    (value) => {
      if (!draftPertanyaan || !editModePertanyaan) return;
      setDraftPertanyaan((prev) => ({
        ...prev,
        skor: {
          ...prev.skor,
          [quarterKey]: value,
        },
      }));
    },
    [draftPertanyaan, editModePertanyaan, quarterKey],
  );

  const handleEditPertanyaan = useCallback(() => {
    if (safeActivePertanyaanIndex === -1) return;
    const pertanyaan = pertanyaanList[safeActivePertanyaanIndex];
    setOriginalPertanyaan(structuredClone(pertanyaan));
    setDraftPertanyaan(structuredClone(pertanyaan));
    setEditModePertanyaan(true);
  }, [safeActivePertanyaanIndex, pertanyaanList, setEditModePertanyaan]);

  const handleAddNewPertanyaan = useCallback(async () => {
    if (!aspekId) {
      toast({ title: 'Error', description: 'Aspek belum dipilih atau disimpan', variant: 'destructive' });
      return;
    }

    const pertanyaanToAdd = draftPertanyaan || createEmptyPertanyaan();

    if (!pertanyaanToAdd.pertanyaan?.trim()) {
      toast({ title: 'Validasi', description: 'Pertanyaan tidak boleh kosong!', variant: 'destructive' });
      return;
    }

    const skorValue = pertanyaanToAdd.skor?.[quarterKey];
    if (skorValue !== undefined && skorValue !== null && skorValue !== '') {
      const skorNum = Number(skorValue);
      if (isNaN(skorNum) || skorNum < 1 || skorNum > 5) {
        toast({ title: 'Validasi', description: 'Skor harus antara 1 dan 5!', variant: 'destructive' });
        return;
      }
    }

    try {
      const newPertanyaan = await addPertanyaan(aspekId, {
        nomor: pertanyaanToAdd.nomor || '',
        pertanyaan: pertanyaanToAdd.pertanyaan,
        skor: pertanyaanToAdd.skor || {},
        indicator: pertanyaanToAdd.indicator || {
          strong: '',
          satisfactory: '',
          fair: '',
          marginal: '',
          unsatisfactory: '',
        },
        evidence: pertanyaanToAdd.evidence || '',
        catatan: '',
        orderIndex: pertanyaanList.length,
      });

      toast({ title: 'Berhasil', description: 'Pertanyaan berhasil ditambahkan' });

      if (aspekData && aspekData.pertanyaanList) {
        const updatedList = [...aspekData.pertanyaanList, newPertanyaan];

        if (typeof onRefreshData === 'function') {
          onRefreshData({
            ...aspekData,
            pertanyaanList: updatedList,
          });
        }
      }

      setActivePertanyaanIndex(pertanyaanList.length);
      setEditModePertanyaan(true);
      setOriginalPertanyaan(null);
      setDraftPertanyaan(createEmptyPertanyaan());
      await logCreate('HUKUM_OJK', `Tambah Pertanyaan Baru pada Aspek ID: ${aspekId} - Nomor: ${pertanyaanToAdd.nomor || '-'}`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId }
      });
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Gagal menambahkan pertanyaan', variant: 'destructive' });
      await logCreate('HUKUM_OJK', `Gagal Tambah Pertanyaan Baru pada Aspek ID: ${aspekId}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, error: error.message }
      });
    }
  }, [aspekId, draftPertanyaan, pertanyaanList, quarterKey, addPertanyaan, onRefreshData, toast, setActivePertanyaanIndex, setEditModePertanyaan, aspekData, logCreate, currentUser, year, formattedQuarter]);

  const handleUpdatePertanyaan = useCallback(async () => {
    if (!aspekId || safeActivePertanyaanIndex === -1 || !draftPertanyaan) return;
    const pertanyaan = pertanyaanList[safeActivePertanyaanIndex];
    if (pertanyaan.id?.startsWith('temp-')) return;

    if (!draftPertanyaan.pertanyaan?.trim()) {
      toast({ title: 'Validasi', description: 'Pertanyaan tidak boleh kosong!', variant: 'destructive' });
      return;
    }

    const skorValue = draftPertanyaan.skor?.[quarterKey];
    if (skorValue !== undefined && skorValue !== null && skorValue !== '') {
      const skorNum = Number(skorValue);
      if (isNaN(skorNum) || skorNum < 1 || skorNum > 5 || !Number.isInteger(skorNum)) {
        toast({
          title: 'Validasi',
          description: `Skor harus antara 1-5 dan berupa bilangan bulat!`,
          variant: 'destructive',
        });
        return;
      }
    }

    const pertanyaanToUpdate = {
      ...draftPertanyaan,
      skor: {
        ...draftPertanyaan.skor,
        [quarterKey]: draftPertanyaan.skor?.[quarterKey] !== '' ? Number(draftPertanyaan.skor?.[quarterKey]) : undefined,
      },
    };

    try {
      const updatedPertanyaan = await updatePertanyaan(pertanyaan.id, pertanyaanToUpdate);

      if (aspekData && aspekData.pertanyaanList) {
        const updatedList = aspekData.pertanyaanList.map((p) => (p.id === updatedPertanyaan.id ? updatedPertanyaan : p));

        if (typeof onRefreshData === 'function') {
          onRefreshData({
            ...aspekData,
            pertanyaanList: updatedList,
          });
        }
      }

      toast({ title: 'Berhasil', description: 'Pertanyaan berhasil diperbarui' });

      setEditModePertanyaan(false);
      setOriginalPertanyaan(null);
      setDraftPertanyaan(null);
      await logUpdate('HUKUM_OJK', `Update Detail Pertanyaan ID: ${pertanyaan.id} - Nomor: ${pertanyaanToUpdate.nomor || '-'}`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId: pertanyaan.id }
      });
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Gagal mengupdate pertanyaan', variant: 'destructive' });
      await logUpdate('HUKUM_OJK', `Gagal Update Detail Pertanyaan ID: ${pertanyaan.id}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId: pertanyaan.id, error: error.message }
      });
    }
  }, [aspekId, safeActivePertanyaanIndex, draftPertanyaan, pertanyaanList, quarterKey, updatePertanyaan, onRefreshData, toast, setEditModePertanyaan, aspekData, logUpdate, currentUser, year, formattedQuarter]);

  const handleCancelEditPertanyaan = useCallback(() => {
    const confirmed = window.confirm('Batalkan perubahan? Semua perubahan yang belum disimpan akan hilang.');
    if (!confirmed) return;
    setEditModePertanyaan(false);
    setOriginalPertanyaan(null);
    setDraftPertanyaan(null);
  }, [setEditModePertanyaan]);

  const handleCopyPertanyaan = useCallback(async () => {
    if (!aspekId || safeActivePertanyaanIndex === -1 || !currentPertanyaan) return;

    const copiedPertanyaan = {
      ...structuredClone(currentPertanyaan),
      pertanyaan: `${currentPertanyaan.pertanyaan || 'Pertanyaan'} (Copy)`,
    };

    try {
      await addPertanyaan(aspekId, {
        nomor: copiedPertanyaan.nomor || '',
        pertanyaan: copiedPertanyaan.pertanyaan,
        skor: copiedPertanyaan.skor || {},
        indicator: copiedPertanyaan.indicator || {
          strong: '',
          satisfactory: '',
          fair: '',
          marginal: '',
          unsatisfactory: '',
        },
        evidence: copiedPertanyaan.evidence || '',
        catatan: '',
        orderIndex: pertanyaanList.length,
      });

      toast({ title: 'Berhasil', description: 'Pertanyaan berhasil disalin' });

      const refreshedRows = await refreshKpmrData();
      if (refreshedRows && refreshedRows.length > 0 && typeof onRefreshData === 'function') {
        onRefreshData(refreshedRows);
      }

      setActivePertanyaanIndex(pertanyaanList.length);
      setEditModePertanyaan(false);
      setOriginalPertanyaan(null);
      setDraftPertanyaan(null);
      await logCreate('HUKUM_OJK', `Salin Pertanyaan ID: ${currentPertanyaan.id} pada Aspek ID: ${aspekId}`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, sourcePertanyaanId: currentPertanyaan.id }
      });
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Gagal menyalin pertanyaan', variant: 'destructive' });
      await logCreate('HUKUM_OJK', `Gagal Salin Pertanyaan ID: ${currentPertanyaan.id} pada Aspek ID: ${aspekId}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, sourcePertanyaanId: currentPertanyaan.id, error: error.message }
      });
    }
  }, [aspekId, safeActivePertanyaanIndex, currentPertanyaan, pertanyaanList, addPertanyaan, refreshKpmrData, onRefreshData, toast, setActivePertanyaanIndex, setEditModePertanyaan, logCreate, currentUser, year, formattedQuarter]);

  const handleOpenPertanyaanDeleteDialog = useCallback(() => {
    if (!aspekId || safeActivePertanyaanIndex === -1 || !currentPertanyaan) return;
    const aspekDataObj = aspekData || {};
    setItemToDelete({
      name: currentPertanyaan.pertanyaan || 'pertanyaan ini',
      nomor: currentPertanyaan.nomor || '-',
      judul: currentPertanyaan.pertanyaan || 'Tidak ada judul',
      aspekNomor: aspekDataObj.nomor || '-',
      aspekJudul: aspekDataObj.judul || '-',
    });
    setDeleteContext({
      type: 'pertanyaan',
      aspekId: aspekId,
      pertanyaanId: currentPertanyaan.id,
    });
    setDeleteDialogOpen(true);
  }, [aspekId, safeActivePertanyaanIndex, currentPertanyaan, aspekData]);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete || !deleteContext.type) return;
    setDeleteDialogOpen(false);

    if (deleteContext.type === 'pertanyaan') {
      const { pertanyaanId } = deleteContext;

      if (!pertanyaanId || pertanyaanId?.startsWith('temp-')) {
        setItemToDelete(null);
        setDeleteContext({ type: '', aspekId: null, pertanyaanId: null });
        return;
      }

      try {
        await deletePertanyaan(pertanyaanId);
        toast({ title: 'Berhasil', description: 'Pertanyaan berhasil dihapus' });

        if (aspekData && aspekData.pertanyaanList) {
          const updatedList = aspekData.pertanyaanList.filter((p) => p.id !== pertanyaanId);

          if (typeof onRefreshData === 'function') {
            onRefreshData({
              ...aspekData,
              pertanyaanList: updatedList,
            });
          }
        }

        const nextIndex = safeActivePertanyaanIndex > 0 ? safeActivePertanyaanIndex - 1 : -1;
        setActivePertanyaanIndex(nextIndex);

        if (nextIndex === -1) {
          setEditModePertanyaan(true);
          setDraftPertanyaan(createEmptyPertanyaan());
        }
        await logDelete('HUKUM_OJK', `Hapus Pertanyaan ID: ${pertanyaanId} pada Aspek ID: ${aspekId}`, {
          userId: currentUser.id,
          isSuccess: true,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId }
        });
      } catch (error) {
        toast({ title: 'Error', description: error.message || 'Gagal menghapus pertanyaan', variant: 'destructive' });
        await logDelete('HUKUM_OJK', `Gagal Hapus Pertanyaan ID: ${pertanyaanId} pada Aspek ID: ${aspekId}`, {
          userId: currentUser.id,
          isSuccess: false,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, pertanyaanId, error: error.message }
        });
      }
    }

    setItemToDelete(null);
    setDeleteContext({ type: '', aspekId: null, pertanyaanId: null });
  }, [itemToDelete, deleteContext, safeActivePertanyaanIndex, deletePertanyaan, onRefreshData, toast, setActivePertanyaanIndex, setEditModePertanyaan, aspekData, logDelete, currentUser, year, formattedQuarter, aspekId]);

  const handleClearPertanyaanSelection = useCallback(() => {
    setActivePertanyaanIndex(-1);
    setEditModePertanyaan(true);
    setOriginalPertanyaan(null);
    setDraftPertanyaan(createEmptyPertanyaan());
    setOpenPertanyaanList(false);
  }, [setActivePertanyaanIndex, setEditModePertanyaan]);

  const handleSelectPertanyaan = useCallback(
    (index) => {
      setActivePertanyaanIndex(index);
      setOpenPertanyaanList(false);
      setEditModePertanyaan(false);
      setOriginalPertanyaan(null);
      setDraftPertanyaan(null);
    },
    [setActivePertanyaanIndex, setEditModePertanyaan],
  );

  const isFieldDisabled = useCallback(() => {
    if (loading || saving) return true;
    if (safeActivePertanyaanIndex === -1) return false;
    if (editModePertanyaan) return false;
    return true;
  }, [loading, saving, safeActivePertanyaanIndex, editModePertanyaan]);

  const isEditModeForComponents = editModePertanyaan || safeActivePertanyaanIndex === -1;

  const getMainButtonConfig = useCallback(() => {
    if (editModePertanyaan && safeActivePertanyaanIndex === -1) {
      return {
        onClick: handleAddNewPertanyaan,
        title: 'Tambah Pertanyaan Baru',
        icon: <Plus className="w-4 h-4" />,
        className: 'bg-emerald-600 hover:bg-emerald-700',
      };
    } else if (editModePertanyaan) {
      return {
        onClick: handleUpdatePertanyaan,
        title: 'Simpan Perubahan',
        icon: <Save className="w-4 h-4" />,
        className: 'bg-green-600 hover:bg-green-700',
      };
    } else {
      return {
        onClick: handleAddNewPertanyaan,
        title: 'Tambah Pertanyaan Baru',
        icon: <Plus className="w-4 h-4" />,
        className: 'bg-emerald-600 hover:bg-emerald-700',
      };
    }
  }, [editModePertanyaan, safeActivePertanyaanIndex, handleAddNewPertanyaan, handleUpdatePertanyaan]);

  const mainButtonConfig = getMainButtonConfig();

  return (
    <div className="w-full relative">
      <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center border-t border-l border-r rounded-t-lg border-slate-700">
        <div className="text-2xl tracking-wider font-bold">Pertanyaan ({formattedQuarter})</div>
        <div className="flex items-center gap-2">
          {(loading || saving) && <div className="text-xs bg-slate-700 text-white px-2 py-1 rounded">Memproses...</div>}

          <Button size="sm" variant="outline" onClick={() => setShowPertanyaanForm(!showPertanyaanForm)} className="bg-slate-900 text-white hover:bg-slate-800 text-md px-3 border border-black" disabled={loading || saving}>
            {showPertanyaanForm ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Sembunyikan
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Tampilkan
              </>
            )}
          </Button>

          {safeActivePertanyaanIndex >= 0 && hasPertanyaan && !editModePertanyaan && (
            <Button size="icon" onClick={handleEditPertanyaan} className="bg-blue-600 hover:bg-blue-700" disabled={loading || saving} title="Edit Pertanyaan">
              <Edit className="w-4 h-4" />
            </Button>
          )}

          {editModePertanyaan && (
            <Button size="icon" onClick={handleCancelEditPertanyaan} className="bg-gray-600 hover:bg-gray-700" disabled={loading || saving} title="Batal Edit">
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="flex items-center gap-1">
            <Button size="icon" className={`h-9 w-9 rounded-full ${mainButtonConfig.className}`} onClick={mainButtonConfig.onClick} title={mainButtonConfig.title} disabled={loading || saving}>
              {mainButtonConfig.icon}
            </Button>

            {!editModePertanyaan && safeActivePertanyaanIndex >= 0 && hasPertanyaan && (
              <Button size="icon" className="h-9 w-9 rounded-full bg-amber-600 hover:bg-amber-700" onClick={handleCopyPertanyaan} disabled={loading || saving} title="Salin Pertanyaan">
                <Copy className="w-4 h-4" />
              </Button>
            )}

            {!editModePertanyaan && safeActivePertanyaanIndex >= 0 && hasPertanyaan && (
              <Button size="icon" className="h-9 w-9 rounded-full bg-rose-600 hover:bg-rose-700" onClick={handleOpenPertanyaanDeleteDialog} disabled={loading || saving} title="Hapus Pertanyaan">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {showPertanyaanForm && (
        <div className="bg-blue-700 text-white px-4 pb-4 border-b border-l border-r border-slate-700 space-y-3 rounded-b-lg">
          <div className="w-full bg-slate-200 rounded-lg p-0.5" />

          <div className="mt-3">
            <label className="font-semibold text-base tracking-wide ml-1 text-white">Pilih Pertanyaan</label>
            <button
              ref={dropdownPertanyaanBtnRef}
              onClick={() => setOpenPertanyaanList((v) => !v)}
              className="w-full mt-1 bg-white text-md text-slate-800 px-3 py-2 rounded-md flex justify-between border border-slate-300 hover:bg-slate-50"
              disabled={loading || saving || !hasPertanyaan}
            >
              <span className="truncate">{safeActivePertanyaanIndex >= 0 && hasPertanyaan ? formatPertanyaanLabel(currentPertanyaan, safeActivePertanyaanIndex) : 'Buat Pertanyaan Baru'}</span>
              <span>▾</span>
            </button>

            {openPertanyaanList &&
              dropdownPertanyaanRect &&
              createPortal(
                <div
                  ref={dropdownPertanyaanListRef}
                  className="fixed bg-white text-slate-800 rounded-md shadow-lg max-h-[220px] overflow-auto z-[9999] border border-slate-200"
                  style={{
                    top: dropdownPertanyaanRect.top,
                    left: dropdownPertanyaanRect.left,
                    width: dropdownPertanyaanRect.width,
                  }}
                >
                  <button
                    onClick={() => {
                      handleClearPertanyaanSelection();
                      setOpenPertanyaanList(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-200 text-slate-600 bg-blue-50"
                  >
                    Buat Pertanyaan Baru
                  </button>

                  {hasPertanyaan &&
                    pertanyaanList.map((pertanyaan, idx) => (
                      <button
                        key={`pertanyaan-${pertanyaan.id || `temp-${idx}`}`}
                        onClick={() => handleSelectPertanyaan(idx)}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${idx === safeActivePertanyaanIndex ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                      >
                        {formatPertanyaanLabel(pertanyaan, idx)}
                      </button>
                    ))}
                </div>,
                document.body,
              )}
          </div>

          {(editModePertanyaan || safeActivePertanyaanIndex >= 0) && (
            <>
              <div className="flex gap-2 text-slate-800 mt-3">
                <div className="w-[5%]">
                  <label className="text-white text-base tracking-wide ml-1 font-semibold">Nomor</label>
                  <Input
                    className="bg-white h-8 border-slate-300"
                    value={currentPertanyaan?.nomor ?? ''}
                    onChange={(e) => (isEditModeForComponents ? handleChangeDraftPertanyaan('nomor', e.target.value) : handleChangePertanyaanField('nomor', e.target.value))}
                    disabled={isFieldDisabled()}
                    placeholder="1 - 5"
                  />
                </div>

                <div className="w-[8%]">
                  <label className="text-white text-base tracking-wide ml-1 font-semibold">Skor untuk {formattedQuarter}</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    className="bg-white h-8 text-slate-800 border-slate-300"
                    value={currentPertanyaan?.skor?.[quarterKey] ?? ''}
                    onChange={(e) => (isEditModeForComponents ? handleDraftSkorChange(e.target.value) : handleSkorChange(e.target.value))}
                    disabled={isFieldDisabled()}
                    placeholder="Masukan skor"
                  />
                </div>

                <div className="w-[87%]">
                  <label className="text-white text-base tracking-wide ml-1 font-semibold">Pertanyaan</label>
                  <Input
                    className="bg-white h-8 border-slate-300"
                    value={currentPertanyaan?.pertanyaan ?? ''}
                    onChange={(e) => (isEditModeForComponents ? handleChangeDraftPertanyaan('pertanyaan', e.target.value) : handleChangePertanyaanField('pertanyaan', e.target.value))}
                    disabled={isFieldDisabled()}
                    placeholder="Masukan pertanyaan"
                  />
                </div>
              </div>

              <div>
                <div className="font-bold text-lg py-2 text-white">Description Level</div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    ['Strong', 'strong', '#162556'],
                    ['Satisfactory', 'satisfactory', '#162556'],
                    ['Fair', 'fair', '#162556'],
                    ['Marginal', 'marginal', '#162556'],
                    ['Unsatisfactory', 'unsatisfactory', '#162556'],
                  ].map(([label, key, color]) => (
                    <IndicatorItem
                      key={key}
                      label={label}
                      color={color}
                      value={currentPertanyaan?.indicator?.[key] ?? ''}
                      onChange={(v) => (isEditModeForComponents ? handleChangeDraftPertanyaan(`indicator.${key}`, v) : handleChangePertanyaanField(`indicator.${key}`, v))}
                      loading={loading || saving}
                      editMode={isEditModeForComponents}
                    />
                  ))}
                </div>
              </div>

              <div className="text-slate-800">
                <label className="text-white text-base tracking-wide ml-1 font-semibold">Evidence</label>
                <Textarea
                  className="bg-white min-h-[60px] border-slate-300"
                  value={currentPertanyaan?.evidence ?? ''}
                  onChange={(e) => (isEditModeForComponents ? handleChangeDraftPertanyaan('evidence', e.target.value) : handleChangePertanyaanField('evidence', e.target.value))}
                  disabled={isFieldDisabled()}
                  placeholder="Masukan penjelasan"
                />
              </div>
            </>
          )}
        </div>
      )}

      {!showPertanyaanForm && <div className="w-full" />}

      <PopUpDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Pertanyaan"
        description="Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan."
        itemName={itemToDelete?.name || ''}
        itemNomor={itemToDelete?.nomor || ''}
        itemJudul={itemToDelete?.judul || ''}
        itemAspekNomor={itemToDelete?.aspekNomor || ''}
        itemAspekJudul={itemToDelete?.aspekJudul || ''}
        itemType="pertanyaan"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          setDeleteContext({ type: '', aspekId: null, pertanyaanId: null });
        }}
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={loading || saving}
      />
    </div>
  );
}

function AspekPanel({ rows = [], setRows, activeQuarter, onRefreshData, kpmrId, onCreateKpmr }) {
  const { toast } = useToast();
  const [activeAspekIndex, setActiveAspekIndex] = useState(-1);
  const [activePertanyaanIndex, setActivePertanyaanIndex] = useState(-1);
  const [editModeAspek, setEditModeAspek] = useState(false);
  const [editModePertanyaan, setEditModePertanyaan] = useState(false);
  const [originalAspek, setOriginalAspek] = useState(null);
  const [draftAspek, setDraftAspek] = useState({ nomor: '', judul: '', bobot: '' });
  const [openAspekList, setOpenAspekList] = useState(false);
  const [showAspekForm, setShowAspekForm] = useState(true);
  const [loading, setLoading] = useState(false);

  const dropdownAspekBtnRef = useRef(null);
  const dropdownAspekListRef = useRef(null);
  const [dropdownAspekRect, setDropdownAspekRect] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteContext, setDeleteContext] = useState({
    type: '',
    aspekId: null,
    pertanyaanId: null,
  });

  const { addAspek, updateAspek, deleteAspek, saving, refreshKpmrData } = useKpmrHukum();

  // ===== AUDIT LOG =====
  const year = useHeaderStore((s) => s.year);
  const { logCreate, logUpdate, logDelete } = useAuditLog();
  const { authUser } = useAuth();
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

  const formattedQuarter = useMemo(() => formatQuarter(activeQuarter), [activeQuarter]);

  const normalizedRows = useMemo(() => normalizeKpmrRows(rows), [rows]);

  const safeActiveAspekIndex = useMemo(() => {
    return activeAspekIndex !== null && activeAspekIndex >= 0 && activeAspekIndex < normalizedRows.length ? activeAspekIndex : -1;
  }, [activeAspekIndex, normalizedRows]);

  const safeActiveAspek = useMemo(() => {
    return safeActiveAspekIndex >= 0 ? normalizedRows[safeActiveAspekIndex] : null;
  }, [safeActiveAspekIndex, normalizedRows]);

  const getAspekData = useCallback(() => {
    if (editModeAspek) return draftAspek;
    if (safeActiveAspek) {
      return {
        nomor: safeActiveAspek.nomor ?? '',
        judul: safeActiveAspek.judul ?? '',
        bobot: safeActiveAspek.bobot ?? '',
      };
    }
    return draftAspek;
  }, [editModeAspek, draftAspek, safeActiveAspek]);

  const aspek = getAspekData();

  // Initialize for new aspect
  useEffect(() => {
    if (rows.length === 0 || activeAspekIndex === -1) {
      setEditModeAspek(true);
    }
  }, [rows.length, activeAspekIndex]);

  // Initialize draft when no aspect selected
  useEffect(() => {
    if (!safeActiveAspek && !editModeAspek) {
      setDraftAspek({ nomor: '', judul: '', bobot: '' });
      setEditModeAspek(false);
      setOriginalAspek(null);
    }
  }, [safeActiveAspek, editModeAspek]);

  // Sync draft with active aspect
  useEffect(() => {
    if (safeActiveAspek && !editModeAspek) {
      setDraftAspek({
        nomor: safeActiveAspek.nomor ?? '',
        judul: safeActiveAspek.judul ?? '',
        bobot: safeActiveAspek.bobot ?? '',
      });
    }
  }, [safeActiveAspek, editModeAspek]);

  useEffect(() => {
    if (!openAspekList || !dropdownAspekBtnRef.current) return;

    const updatePosition = () => {
      const rect = dropdownAspekBtnRef.current.getBoundingClientRect();
      setDropdownAspekRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openAspekList]);

  useDropdownPortal({
    open: openAspekList,
    setOpen: setOpenAspekList,
    triggerRef: dropdownAspekBtnRef,
    containerRef: dropdownAspekListRef,
  });

  useEffect(() => {
    setActivePertanyaanIndex(-1);
    setEditModePertanyaan(false);
  }, [safeActiveAspekIndex]);

  const formatAspekLabel = useCallback((row, index) => {
    if (!row) return 'Buat Aspek Baru';
    return `${row.nomor || ''} – ${row.judul || ''} (Bobot: ${row.bobot || ''}%)`;
  }, []);

  const handleChangeAspek = useCallback((key, value) => {
    setDraftAspek((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isAspekIncomplete = useCallback((aspekData) => {
    return !aspekData?.judul?.trim() || Number(aspekData?.bobot) <= 0;
  }, []);

  // ========== FUNGSI UNTUK MENAMBAH ASPEK DENGAN ID YANG SUDAH ADA ==========
  const addAspekWithId = useCallback(
    async (targetKpmrId) => {
      if (!targetKpmrId) {
        toast({ title: 'Error', description: 'ID KPMR tidak valid', variant: 'destructive' });
        return false;
      }

      if (isAspekIncomplete(draftAspek)) {
        toast({ title: 'Validasi', description: 'Lengkapi data aspek sebelum menambah.', variant: 'destructive' });
        return false;
      }

      const bobotNum = Number(draftAspek.bobot);
      if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
        toast({ title: 'Validasi', description: 'Bobot harus antara 0 dan 100.', variant: 'destructive' });
        return false;
      }

      setLoading(true);

      try {
        const newAspek = await addAspek(targetKpmrId, {
          nomor: draftAspek.nomor || '-',
          judul: draftAspek.judul.trim(),
          bobot: bobotNum,
          deskripsi: '',
          orderIndex: rows.length,
          pertanyaanList: [],
        });

        toast({ title: 'Berhasil', description: 'Aspek berhasil ditambahkan' });

        const updatedRows = [
          ...rows,
          {
            id: newAspek.id,
            nomor: newAspek.nomor,
            judul: newAspek.judul,
            bobot: newAspek.bobot,
            pertanyaanList: [],
          },
        ];
        setRows(updatedRows);

        if (typeof onRefreshData === 'function') {
          onRefreshData(updatedRows);
        }

        setActiveAspekIndex(updatedRows.length - 1);
        setActivePertanyaanIndex(-1);
        setEditModePertanyaan(true);
        setEditModeAspek(false);
        setOriginalAspek(null);
        setDraftAspek({ nomor: '', judul: '', bobot: '' });
        await logCreate('HUKUM_OJK', `Tambah Aspek Baru: "${draftAspek.judul}" (Bobot: ${bobotNum}%) pada KPMR ID: ${targetKpmrId}`, {
          userId: currentUser.id,
          isSuccess: true,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, targetKpmrId }
        });

        return true;
      } catch (error) {
        toast({ title: 'Error', description: error.message || 'Gagal menambah aspek', variant: 'destructive' });
        await logCreate('HUKUM_OJK', `Gagal Tambah Aspek Baru pada KPMR ID: ${targetKpmrId}`, {
          userId: currentUser.id,
          isSuccess: false,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, targetKpmrId, error: error.message }
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [draftAspek, isAspekIncomplete, rows, addAspek, onRefreshData, toast, setRows, setActiveAspekIndex, setActivePertanyaanIndex, setEditModePertanyaan, logCreate, currentUser, year, formattedQuarter],
  );

  // ========== HANDLE ADD NEW ASPEK - DENGAN DUKUNGAN CREATE KPMR ==========
  const handleAddNewAspek = useCallback(async () => {
    // Kasus 1: KPMR ID sudah ada
    if (kpmrId) {
      await addAspekWithId(kpmrId);
      return;
    }

    // Kasus 2: KPMR ID belum ada, perlu dibuat dulu
    if (!onCreateKpmr) {
      toast({ title: 'Error', description: 'Fungsi pembuatan KPMR tidak tersedia', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      toast({ title: 'Informasi', description: 'Membuat KPMR baru...' });

      const newKpmr = await onCreateKpmr();

      if (!newKpmr || !newKpmr.id) {
        throw new Error('Gagal membuat KPMR');
      }

      toast({ title: 'Berhasil', description: 'KPMR berhasil dibuat, menambahkan aspek...' });

      // Tambah aspek dengan ID KPMR yang baru
      const success = await addAspekWithId(newKpmr.id);

      if (success) {
        toast({ title: 'Berhasil', description: 'Aspek pertama berhasil ditambahkan' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Gagal membuat KPMR', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [kpmrId, onCreateKpmr, addAspekWithId, toast]);

  const handleUpdateAspek = useCallback(async () => {
    if (safeActiveAspekIndex === -1 || !safeActiveAspek) return;

    if (isAspekIncomplete(draftAspek)) {
      toast({ title: 'Validasi', description: 'Lengkapi data aspek sebelum mengupdate.', variant: 'destructive' });
      return;
    }

    const bobotNum = Number(draftAspek.bobot);
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      toast({ title: 'Validasi', description: 'Bobot harus antara 0 dan 100.', variant: 'destructive' });
      return;
    }

    if (safeActiveAspek.id?.startsWith('temp-')) {
      toast({ title: 'Error', description: 'Aspek belum tersimpan di database', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updatedAspek = await updateAspek(safeActiveAspek.id, {
        nomor: draftAspek.nomor || '-',
        judul: draftAspek.judul.trim(),
        bobot: bobotNum,
        deskripsi: safeActiveAspek.deskripsi || '',
      });

      toast({ title: 'Berhasil', description: 'Aspek berhasil diperbarui' });

      const updatedRows = rows.map((row, idx) => (idx === safeActiveAspekIndex ? { ...row, nomor: draftAspek.nomor, judul: draftAspek.judul, bobot: bobotNum } : row));
      setRows(updatedRows);

      if (typeof onRefreshData === 'function') {
        onRefreshData(updatedRows);
      }

      setEditModeAspek(false);
      setOriginalAspek(null);
      setDraftAspek({ nomor: '', judul: '', bobot: '' });
      await logUpdate('HUKUM_OJK', `Update Aspek ID: ${safeActiveAspek.id} - "${draftAspek.judul}" (Bobot: ${bobotNum}%)`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId: safeActiveAspek.id }
      });
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Gagal mengupdate aspek', variant: 'destructive' });
      await logUpdate('HUKUM_OJK', `Gagal Update Aspek ID: ${safeActiveAspek.id}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId: safeActiveAspek.id, error: error.message }
      });
    } finally {
      setLoading(false);
    }
  }, [safeActiveAspekIndex, safeActiveAspek, draftAspek, isAspekIncomplete, rows, updateAspek, onRefreshData, toast, setRows, setEditModeAspek, logUpdate, currentUser, year, formattedQuarter]);

  const handleEditAspek = useCallback(() => {
    if (safeActiveAspekIndex === -1) return;
    const aspekData = rows[safeActiveAspekIndex];
    setOriginalAspek(structuredClone(aspekData));
    setDraftAspek({
      nomor: aspekData.nomor ?? '',
      judul: aspekData.judul ?? '',
      bobot: aspekData.bobot ?? '',
    });
    setEditModeAspek(true);
  }, [safeActiveAspekIndex, rows]);

  const handleCancelEditAspek = useCallback(() => {
    const confirmed = window.confirm('Batalkan perubahan? Semua perubahan yang belum disimpan akan hilang.');
    if (!confirmed) return;

    if (originalAspek && safeActiveAspekIndex >= 0) {
      const updatedRows = rows.map((row, idx) => (idx === safeActiveAspekIndex ? originalAspek : row));
      setRows(updatedRows);
      if (typeof onRefreshData === 'function') {
        onRefreshData(updatedRows);
      }
    }

    setEditModeAspek(false);
    setOriginalAspek(null);
    setDraftAspek({ nomor: '', judul: '', bobot: '' });
  }, [originalAspek, safeActiveAspekIndex, rows, onRefreshData, setRows, setEditModeAspek]);

  const handleCopyAspek = useCallback(async () => {
    if (safeActiveAspekIndex === -1 || !safeActiveAspek || !kpmrId) return;

    const source = rows[safeActiveAspekIndex];

    setLoading(true);
    try {
      await addAspek(kpmrId, {
        nomor: source.nomor || '-',
        judul: `${source.judul} (Copy)`,
        bobot: Number(source.bobot),
        deskripsi: source.deskripsi || '',
        orderIndex: rows.length,
        pertanyaanList: (source.pertanyaanList || []).map((p) => ({
          nomor: p.nomor || '',
          pertanyaan: p.pertanyaan,
          skor: p.skor || {},
          indicator: p.indicator || {},
          evidence: p.evidence || '',
          catatan: p.catatan || '',
        })),
      });

      toast({ title: 'Berhasil', description: 'Aspek berhasil disalin' });

      const refreshedRows = await refreshKpmrData();
      if (refreshedRows && refreshedRows.length > 0 && typeof onRefreshData === 'function') {
        onRefreshData(refreshedRows);
      }

      setActiveAspekIndex((refreshedRows || rows).length - 1);
      setActivePertanyaanIndex(-1);
      setEditModeAspek(false);
      setOriginalAspek(null);
      setDraftAspek({ nomor: '', judul: '', bobot: '' });
      await logCreate('HUKUM_OJK', `Salin Aspek ID: ${source.id} ke KPMR ID: ${kpmrId}`, {
        userId: currentUser.id,
        isSuccess: true,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, kpmrId, sourceAspekId: source.id }
      });
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Gagal menyalin aspek', variant: 'destructive' });
      await logCreate('HUKUM_OJK', `Gagal Salin Aspek ID: ${source.id} ke KPMR ID: ${kpmrId}`, {
        userId: currentUser.id,
        isSuccess: false,
        metadata: { type: 'kpmr', year, quarter: formattedQuarter, kpmrId, sourceAspekId: source.id, error: error.message }
      });
    } finally {
      setLoading(false);
    }
  }, [safeActiveAspekIndex, safeActiveAspek, kpmrId, rows, addAspek, refreshKpmrData, onRefreshData, toast, setActiveAspekIndex, setActivePertanyaanIndex, logCreate, currentUser, year, formattedQuarter]);

  const handleOpenAspekDeleteDialog = useCallback(() => {
    if (safeActiveAspekIndex === -1) return;
    const aspek = rows[safeActiveAspekIndex];
    setItemToDelete({
      name: aspek.judul || 'aspek ini',
      nomor: aspek.nomor || '-',
      judul: aspek.judul || 'Tidak ada judul',
      bobot: aspek.bobot || '-',
    });
    setDeleteContext({ type: 'aspek', aspekId: aspek.id, pertanyaanId: null });
    setDeleteDialogOpen(true);
  }, [safeActiveAspekIndex, rows]);

  const handleConfirmDeleteAspek = useCallback(async () => {
    if (!itemToDelete || !deleteContext.type) return;
    setDeleteDialogOpen(false);

    if (deleteContext.type === 'aspek') {
      const { aspekId } = deleteContext;

      if (!aspekId || aspekId?.startsWith('temp-')) {
        const updatedRows = rows.filter((_, idx) => idx !== safeActiveAspekIndex);
        setRows(updatedRows);

        const nextIndex = updatedRows.length > 0 ? 0 : -1;
        setActiveAspekIndex(nextIndex);
        setActivePertanyaanIndex(-1);
        setEditModeAspek(nextIndex === -1);
        setOriginalAspek(null);
        setDraftAspek({ nomor: '', judul: '', bobot: '' });

        if (typeof onRefreshData === 'function') {
          onRefreshData(updatedRows);
        }

        setItemToDelete(null);
        setDeleteContext({ type: '', aspekId: null, pertanyaanId: null });
        return;
      }

      try {
        await deleteAspek(aspekId);
        toast({ title: 'Berhasil', description: 'Aspek berhasil dihapus' });

        const refreshedRows = await refreshKpmrData();
        if (refreshedRows && refreshedRows.length > 0 && typeof onRefreshData === 'function') {
          onRefreshData(refreshedRows);
        }

        const nextIndex = (refreshedRows || []).length > 0 ? 0 : -1;
        setActiveAspekIndex(nextIndex);
        setActivePertanyaanIndex(-1);
        setEditModeAspek(nextIndex === -1);
        setOriginalAspek(null);
        setDraftAspek({ nomor: '', judul: '', bobot: '' });
        await logDelete('HUKUM_OJK', `Hapus Aspek ID: ${aspekId}`, {
          userId: currentUser.id,
          isSuccess: true,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId }
        });
      } catch (error) {
        toast({ title: 'Error', description: error.message || 'Gagal menghapus aspek', variant: 'destructive' });
        await logDelete('HUKUM_OJK', `Gagal Hapus Aspek ID: ${aspekId}`, {
          userId: currentUser.id,
          isSuccess: false,
          metadata: { type: 'kpmr', year, quarter: formattedQuarter, aspekId, error: error.message }
        });
      }
    }

    setItemToDelete(null);
    setDeleteContext({ type: '', aspekId: null, pertanyaanId: null });
  }, [itemToDelete, deleteContext, safeActiveAspekIndex, rows, deleteAspek, refreshKpmrData, onRefreshData, toast, setRows, setActiveAspekIndex, setActivePertanyaanIndex, setEditModeAspek, logDelete, currentUser, year, formattedQuarter]);

  const handleClearAspekSelection = useCallback(() => {
    setActiveAspekIndex(-1);
    setActivePertanyaanIndex(-1);
    setEditModeAspek(true);
    setEditModePertanyaan(true);
    setOriginalAspek(null);
    setDraftAspek({ nomor: '', judul: '', bobot: '' });
    setOpenAspekList(false);
  }, [setActiveAspekIndex, setActivePertanyaanIndex, setEditModeAspek, setEditModePertanyaan]);

  const handleSelectAspek = useCallback(
    (index) => {
      setActiveAspekIndex(index);
      setOpenAspekList(false);
      setEditModeAspek(false);
      setOriginalAspek(null);
      setDraftAspek({ nomor: '', judul: '', bobot: '' });
    },
    [setActiveAspekIndex, setEditModeAspek],
  );

  const isFieldDisabled = useCallback(() => {
    if (loading || saving) return true;
    if (safeActiveAspekIndex === -1) return false;
    if (editModeAspek) return false;
    return true;
  }, [loading, saving, safeActiveAspekIndex, editModeAspek]);

  const getMainButtonConfig = useCallback(() => {
    if (editModeAspek && safeActiveAspekIndex === -1) {
      return {
        onClick: handleAddNewAspek,
        title: 'Tambah Aspek Baru',
        icon: <Plus className="w-4 h-4" />,
        className: 'bg-emerald-600 hover:bg-emerald-700',
      };
    } else if (editModeAspek) {
      return {
        onClick: handleUpdateAspek,
        title: 'Simpan Perubahan',
        icon: <Save className="w-4 h-4" />,
        className: 'bg-green-600 hover:bg-green-700',
      };
    } else {
      return {
        onClick: handleAddNewAspek,
        title: 'Tambah Aspek Baru',
        icon: <Plus className="w-4 h-4" />,
        className: 'bg-emerald-600 hover:bg-emerald-700',
      };
    }
  }, [editModeAspek, safeActiveAspekIndex, handleAddNewAspek, handleUpdateAspek]);

  const mainButtonConfig = getMainButtonConfig();

  return (
    <div className="w-full space-y-3">
      <div className="bg-blue-700 text-white px-4 py-3 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl tracking-wider font-bold">Aspek</h2>
          <div className="flex items-center gap-2">
            {(loading || saving) && <div className="text-xs bg-slate-700 text-white px-2 py-1 rounded">Memproses...</div>}

            <Button size="sm" variant="outline" onClick={() => setShowAspekForm(!showAspekForm)} className="bg-slate-900 text-white hover:bg-slate-800 text-md px-3 border border-black" disabled={loading || saving}>
              {showAspekForm ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Tampilkan
                </>
              )}
            </Button>

            {safeActiveAspekIndex >= 0 && !editModeAspek && (
              <Button size="icon" onClick={handleEditAspek} className="bg-blue-600 hover:bg-blue-700" disabled={loading || saving} title="Edit Aspek">
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {editModeAspek && (
              <Button size="icon" onClick={handleCancelEditAspek} className="bg-gray-600 hover:bg-gray-700" disabled={loading || saving} title="Batal Edit">
                <X className="w-4 h-4" />
              </Button>
            )}

            <Button size="icon" onClick={mainButtonConfig.onClick} className={mainButtonConfig.className} disabled={loading || saving} title={mainButtonConfig.title}>
              {mainButtonConfig.icon}
            </Button>

            {!editModeAspek && safeActiveAspekIndex >= 0 && (
              <Button size="icon" onClick={handleCopyAspek} disabled={loading || saving} className="bg-amber-600 hover:bg-amber-700" title="Salin Aspek">
                <Copy className="w-4 h-4" />
              </Button>
            )}

            {!editModeAspek && safeActiveAspekIndex >= 0 && (
              <Button size="icon" onClick={handleOpenAspekDeleteDialog} disabled={loading || saving} className="bg-rose-600 hover:bg-rose-700" title="Hapus Aspek">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {showAspekForm && (
          <>
            <div className="w-full bg-slate-200 rounded-lg p-0.5 mt-2" />
            <div className="w-full flex gap-2 mt-3">
              <div className="w-[10%]">
                <label className="font-semibold text-md tracking-wide ml-1 text-white">No</label>
                <Input placeholder="No" value={aspek.nomor} onChange={(e) => handleChangeAspek('nomor', e.target.value)} className="bg-white text-slate-950 border-slate-300" disabled={isFieldDisabled()} />
              </div>

              <div className="w-[10%]">
                <label className="font-semibold text-md tracking-wid ml-1 text-white">Bobot</label>
                <Input
                  type="number"
                  placeholder="max 100%"
                  min="0"
                  max="100"
                  step="0.01"
                  value={aspek.bobot}
                  onChange={(e) => handleChangeAspek('bobot', e.target.value)}
                  className="bg-white text-slate-950 border-slate-300"
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="w-[80%]">
                <label className="font-semibold text-md tracking-wid ml-1 text-white">Aspek</label>
                <Input placeholder="masukan aspek" value={aspek.judul} onChange={(e) => handleChangeAspek('judul', e.target.value)} className="bg-white text-slate-950 border-slate-300" disabled={isFieldDisabled()} />
              </div>
            </div>

            <div className="mt-3">
              <label className="font-semibold text-normal tracking-wide ml-1 mb-1 text-white">Pilih Aspek</label>
              <button
                ref={dropdownAspekBtnRef}
                onClick={() => setOpenAspekList((v) => !v)}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-md text-md flex justify-between border border-slate-300 hover:bg-slate-50"
                disabled={loading || saving}
              >
                <span className="truncate text-md">{safeActiveAspekIndex >= 0 && safeActiveAspek ? formatAspekLabel(safeActiveAspek, safeActiveAspekIndex) : 'Buat Aspek Baru'}</span>
                <span>▾</span>
              </button>

              {openAspekList &&
                dropdownAspekRect &&
                createPortal(
                  <div
                    ref={dropdownAspekListRef}
                    className="fixed bg-white rounded-md shadow-lg max-h-[220px] overflow-auto z-[9999] border border-slate-200"
                    style={{
                      top: dropdownAspekRect.top,
                      left: dropdownAspekRect.left,
                      width: dropdownAspekRect.width,
                    }}
                  >
                    <button
                      onClick={() => {
                        handleClearAspekSelection();
                        setOpenAspekList(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-200 text-slate-600 text-md bg-blue-50"
                      disabled={loading || saving}
                    >
                      Buat Aspek Baru
                    </button>

                    {normalizedRows.map((row, idx) => (
                      <button
                        key={`aspek-${row.id || `temp-${idx}`}`}
                        onClick={() => handleSelectAspek(idx)}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${idx === safeActiveAspekIndex ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'} text-md`}
                        disabled={loading || saving}
                      >
                        {formatAspekLabel(row, idx)}
                      </button>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>
          </>
        )}

        {!showAspekForm && <div className="w-full" />}
      </div>

      {safeActiveAspekIndex >= 0 && safeActiveAspek && (
        <PertanyaanPanel
          aspekId={safeActiveAspek.id}
          pertanyaanList={safeActiveAspek.pertanyaanList || []}
          activePertanyaanIndex={activePertanyaanIndex}
          setActivePertanyaanIndex={setActivePertanyaanIndex}
          activeQuarter={formattedQuarter}
          loading={loading}
          editModePertanyaan={editModePertanyaan}
          setEditModePertanyaan={setEditModePertanyaan}
          onRefreshData={onRefreshData}
          aspekData={safeActiveAspek}
        />
      )}

      <PopUpDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Aspek"
        description="Apakah Anda yakin ingin menghapus aspek ini? Tindakan ini tidak dapat dibatalkan."
        itemName={itemToDelete?.name || ''}
        itemNomor={itemToDelete?.nomor || ''}
        itemJudul={itemToDelete?.judul || ''}
        itemBobot={itemToDelete?.bobot || ''}
        itemType="aspek"
        onConfirm={handleConfirmDeleteAspek}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          setDeleteContext({ type: '', aspekId: null, pertanyaanId: null });
        }}
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={loading || saving}
      />
    </div>
  );
}

function TableKpmr({ rows = [], activeQuarter }) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuarters, setSelectedQuarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const paginationRef = useRef(null);

  const minZoom = 100;
  const maxZoom = 125;
  const stepZoom = 5;
  const pageSize = 7;

  const formattedQuarter = useMemo(() => formatQuarter(activeQuarter), [activeQuarter]);

  const normalizedRows = useMemo(() => normalizeKpmrRows(rows), [rows]);

  const toggleQuarter = useCallback((quarter) => {
    setSelectedQuarters((prev) => {
      if (prev.includes(quarter)) {
        return prev.filter((q) => q !== quarter);
      } else {
        return [...prev, quarter];
      }
    });
  }, []);

  const hasSelectedQuarters = selectedQuarters.length > 0;
  const totalPages = Math.max(1, Math.ceil(normalizedRows.length / pageSize));

  const scrollLeft = useCallback(() => {
    paginationRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    paginationRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  }, []);

  const pagedRows = useMemo(() => {
    return normalizedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [normalizedRows, currentPage, pageSize]);

  const skorBg = useCallback((skor) => {
    const num = Number(skor);
    if (num >= 4.5) return 'bg-[#FF0000] text-white';
    if (num >= 3.5) return 'bg-[#FFC000] text-white';
    if (num >= 2.5) return 'bg-[#FFFF00] text-black';
    if (num >= 1.5) return 'bg-[#92D050] text-black';
    if (num > 0) return 'bg-[#4F6228] text-white';
    return 'bg-gray-100 text-gray-500';
  }, []);

  const getQuarterAvg = useCallback((aspek, quarter) => {
    const list = aspek.pertanyaanList || [];
    if (list.length === 0) return '-';

    const skorValues = list
      .map((q) => {
        const skorValue = q.skor?.[quarter];
        if (skorValue !== '' && skorValue !== undefined && skorValue !== null) {
          const num = Number(skorValue);
          if (num >= 1 && num <= 5) return num;
        }
        return null;
      })
      .filter((v) => v !== null);

    if (skorValues.length === 0) return '-';

    const avg = skorValues.reduce((a, b) => a + b, 0) / skorValues.length;
    return avg.toFixed(2);
  }, []);

  const getSelectedQuarterAvgs = useCallback(
    (aspek) => {
      const result = {};
      selectedQuarters.forEach((quarter) => {
        result[quarter] = getQuarterAvg(aspek, quarter);
      });
      return result;
    },
    [selectedQuarters, getQuarterAvg],
  );

  const calculateGlobalSummary = useCallback(() => {
    const summary = { Q1: [], Q2: [], Q3: [], Q4: [] };

    normalizedRows.forEach((aspek) => {
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach((quarter) => {
        const avg = getQuarterAvg(aspek, quarter);
        if (avg !== '-') {
          summary[quarter].push(Number(avg));
        }
      });
    });

    const result = {};
    selectedQuarters.forEach((quarter) => {
      if (summary[quarter].length === 0) {
        result[quarter] = '-';
      } else {
        const total = summary[quarter].reduce((a, b) => a + b, 0);
        result[quarter] = (total / summary[quarter].length).toFixed(2);
      }
    });

    return result;
  }, [normalizedRows, selectedQuarters, getQuarterAvg]);

  const globalSummary = useMemo(() => calculateGlobalSummary(), [calculateGlobalSummary]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(maxZoom, z + stepZoom)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(minZoom, z - stepZoom)), []);
  const handleSliderChange = useCallback((e) => setZoom(Number(e.target.value)), []);
  const handlePageClick = useCallback((page) => setCurrentPage(page), []);

  if (!Array.isArray(normalizedRows) || normalizedRows.length === 0) {
    return (
      <div className="flex items-center border rounded-xl justify-center gap-2 p-6 text-sm text-gray-500">
        <FileWarning />
        <span>Belum ada data untuk ditampilkan</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 pr-2">
        <div>
          <h1 className="text-2xl font-semibold">Data Hukum - Kualitas Penerapan Manajemen Risiko</h1>
          <div className="text-sm text-gray-600">
            Quarter Aktif: <span className="font-bold bg-blue-100 px-2 py-1 rounded">{formattedQuarter}</span>
            <span className="ml-2 text-gray-500">•</span>
            <span className="ml-2">Tampilkan Quarter:</span>
            <span className="ml-2 font-medium">{hasSelectedQuarters ? selectedQuarters.join(', ') : 'Tidak ada yang dipilih'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="flex flex-col">
              <div className="flex gap-1">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                  const isSelected = selectedQuarters.includes(quarter);
                  return (
                    <button
                      key={quarter}
                      type="button"
                      onClick={() => toggleQuarter(quarter)}
                      className={`h-8 w-8 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      title={`Klik untuk ${isSelected ? 'sembunyikan' : 'tampilkan'} ${quarter}`}
                    >
                      {quarter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleZoomOut} className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-white text-xl font-bold shadow hover:bg-blue-800">
              −
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium mb-1">{zoom}%</span>
              <input type="range" min={minZoom} max={maxZoom} step={stepZoom} value={zoom} onChange={handleSliderChange} className="w-40 accent-slate-700" />
            </div>
            <button type="button" onClick={handleZoomIn} className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-white text-xl font-bold shadow hover:bg-blue-800">
              +
            </button>
          </div>
        </div>
      </div>

      {!hasSelectedQuarters && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700">
            <FileWarning className="w-4 h-4" />
            <span className="text-sm font-medium">Tidak ada quarter yang dipilih. Silakan pilih minimal satu quarter untuk ditampilkan.</span>
          </div>
        </div>
      )}

      <div className="w-full overflow-auto border shadow">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', display: 'block', width: '100%' }}>
          <table className="table-fixed text-sm w-full border-collapse">
            <colgroup>
              <col style={{ width: '3%' }} />
              <col style={{ width: '20%' }} />
              {hasSelectedQuarters && selectedQuarters.map((quarter) => <col key={`col-${quarter}`} style={{ width: '4%' }} />)}
              {!hasSelectedQuarters && <col style={{ width: '4%' }} />}
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>

            <thead>
              <tr>
                <th colSpan={2} className="border border-black px-2 py-2 bg-blue-900 text-white text-left">
                  Kualitas Penerapan Manajemen Risiko
                </th>

                {hasSelectedQuarters ? (
                  selectedQuarters.map((quarter) => (
                    <th key={quarter} className="border border-black px-2 py-2 bg-blue-900 text-white text-center">
                      {quarter}
                      <br />
                      Skor
                    </th>
                  ))
                ) : (
                  <th className="border border-black px-2 py-2 bg-blue-900 text-white text-center">Pilih Quarter</th>
                )}

                <th colSpan={5} className="border border-black px-2 py-2 bg-blue-950 text-white text-center">
                  Description Level
                </th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white text-center">Evidence</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((aspek, ai) => {
                const list = aspek.pertanyaanList || [];
                const quarterAvgs = getSelectedQuarterAvgs(aspek);

                return (
                  <React.Fragment key={`aspek-${ai}`}>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={2} className="border border-black px-2 py-2 align-top whitespace-normal break-words">
                        Aspek {aspek.nomor} : {aspek.judul} (Bobot: {aspek.bobot}%)
                      </td>

                      {hasSelectedQuarters ? (
                        selectedQuarters.map((quarter) => (
                          <td key={quarter} className={`border border-black px-2 py-2 text-center font-bold align-middle ${quarterAvgs[quarter] !== '-' ? skorBg(quarterAvgs[quarter]) : ''}`}>
                            {quarterAvgs[quarter]}
                          </td>
                        ))
                      ) : (
                        <td className="border border-black px-2 py-2 text-center align-top">-</td>
                      )}

                      <td className="border border-black px-2 py-2 bg-blue-950 text-white text-center">1 (Strong)</td>
                      <td className="border border-black px-2 py-2 bg-blue-950 text-white text-center">2 (Satisfactory)</td>
                      <td className="border border-black px-2 py-2 bg-blue-950 text-white text-center">3 (Fair)</td>
                      <td className="border border-black px-2 py-2 bg-blue-950 text-white text-center">4 (Marginal)</td>
                      <td className="border border-black px-2 py-2 bg-blue-950 text-white text-center">5 (Unsatisfactory)</td>
                      <td className="border border-black px-2 py-2 bg-blue-900 text-white text-center">Evidence</td>
                    </tr>

                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={hasSelectedQuarters ? selectedQuarters.length + 8 : 9} className="border px-2 py-2 text-center text-gray-400">
                          Belum ada pertanyaan
                        </td>
                      </tr>
                    ) : (
                      list.map((q, qi) => (
                        <tr key={`q-${ai}-${qi}`} className="hover:bg-gray-50">
                          <td className="border border-black px-2 py-2 text-center align-top">{q.nomor || qi + 1}</td>
                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words">{q.pertanyaan || '-'}</td>

                          {hasSelectedQuarters ? (
                            selectedQuarters.map((quarter) => {
                              const skorValue = q.skor?.[quarter];
                              const hasSkor = skorValue !== '' && skorValue !== undefined && skorValue !== null;

                              return (
                                <td key={quarter} className={`border border-black px-2 py-2 text-center font-bold ${hasSkor ? skorBg(skorValue) : ''}`}>
                                  {hasSkor ? skorValue : '-'}
                                </td>
                              );
                            })
                          ) : (
                            <td className="border border-black px-2 py-2 text-center align-top">-</td>
                          )}

                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words text-center">{q.indicator?.strong || '-'}</td>
                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words text-center">{q.indicator?.satisfactory || '-'}</td>
                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words text-center">{q.indicator?.fair || '-'}</td>
                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words text-center">{q.indicator?.marginal || '-'}</td>
                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words text-center">{q.indicator?.unsatisfactory || '-'}</td>
                          <td className="border border-black px-2 py-2 align-top whitespace-normal break-words text-center">{q.evidence || '-'}</td>
                        </tr>
                      ))
                    )}
                  </React.Fragment>
                );
              })}

              {hasSelectedQuarters && (
                <tr className="font-bold">
                  <td colSpan={2}>
                    <div className="border border-black px-2 py-2 text-center font-semibold text-white bg-blue-900">Summary</div>
                  </td>
                  {selectedQuarters.map((quarter) => {
                    const value = globalSummary[quarter];
                    const hasValue = value !== '-';

                    return (
                      <td key={quarter} className={`border border-black px-2 py-2 text-center ${hasValue ? skorBg(value) : ''}`}>
                        {hasValue ? value : '-'}
                      </td>
                    );
                  })}
                  <td colSpan={6} className="border border-white"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-center items-center gap-2">
          {totalPages > 7 && (
            <button type="button" onClick={scrollLeft} className="h-8 w-8 flex items-center justify-center rounded-md border bg-white text-blue-600 font-bold hover:bg-blue-500 hover:text-white">
              <ArrowBigLeft className="w-4 h-4" />
            </button>
          )}

          <div className="max-w-[420px] overflow-x-hidden">
            <div ref={paginationRef} className="flex gap-2 px-2 py-1 overflow-x-auto scroll-smooth">
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageClick(page)}
                    className={
                      'min-w-8 h-8 px-3 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors duration-150 shrink-0 hover:bg-blue-900 hover:text-white ' +
                      (isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-blue-600')
                    }
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          </div>

          {totalPages > 7 && (
            <button type="button" onClick={scrollRight} className="h-8 w-8 flex items-center justify-center rounded-md border bg-white text-blue-600 font-bold hover:bg-blue-500 hover:text-white">
              <ArrowBigRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HukumKpmrPage({ rows, setRows, search, onRefreshData, kpmrId, onCreateKpmr }) {
  const { activeQuarter } = useHeaderStore();
  const { refreshKpmrData } = useKpmrHukum();

  const mountCountRef = useRef(0);
  const initialLoadTriggeredRef = useRef(false);
  const lastKpmrIdRef = useRef(kpmrId);
  const rowsRef = useRef(rows);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((aspek) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return aspek.judul?.toLowerCase().includes(s) || aspek.nomor?.toString().includes(s) || aspek.pertanyaanList?.some((q) => q.pertanyaan?.toLowerCase().includes(s));
    });
  }, [rows, search]);

  const handleRefreshData = useCallback(
    async (updatedData) => {
      if (updatedData) {
        if (Array.isArray(updatedData)) {
          setRows(updatedData);
        } else if (updatedData.pertanyaanList) {
          const updatedRows = rowsRef.current.map((row) => (row.id === updatedData.id ? updatedData : row));
          setRows(updatedRows);
        }

        if (typeof onRefreshData === 'function') {
          onRefreshData(updatedData);
        }
        return;
      }

      if (!kpmrId) return;

      if (isLoadingRef.current) {
        console.log('⏳ [KpmrPage] Refresh already in progress, skipping...');
        return;
      }

      isLoadingRef.current = true;
      console.log(`🔄 [KpmrPage] Refreshing data from backend for kpmrId: ${kpmrId}`);

      try {
        const refreshedRows = await refreshKpmrData();
        if (refreshedRows && refreshedRows.length > 0 && typeof setRows === 'function') {
          setRows(refreshedRows);
        }
        if (typeof onRefreshData === 'function') {
          onRefreshData(refreshedRows || rowsRef.current);
        }
      } catch (error) {
        console.error('❌ [KpmrPage] Error refreshing data:', error);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [kpmrId, refreshKpmrData, setRows, onRefreshData],
  );

  const handleRefreshDataRef = useRef(handleRefreshData);

  useEffect(() => {
    handleRefreshDataRef.current = handleRefreshData;
  }, [handleRefreshData]);

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`🚀 [KpmrPage] MOUNT #${mountCountRef.current} dengan kpmrId: ${kpmrId}, rows: ${rows.length}`);
    return () => {
      console.log(`💀 [KpmrPage] UNMOUNT #${mountCountRef.current}`);
    };
  }, []);

  useEffect(() => {
    if (lastKpmrIdRef.current !== kpmrId) {
      console.log(`🆔 [KpmrPage] kpmrId berubah: ${lastKpmrIdRef.current} -> ${kpmrId}`);
      lastKpmrIdRef.current = kpmrId;
      initialLoadTriggeredRef.current = false;
    }
  }, [kpmrId]);

  useEffect(() => {
    if (kpmrId && rows.length === 0 && !initialLoadTriggeredRef.current && !isLoadingRef.current) {
      console.log(`🚀 [KpmrPage] INITIAL LOAD TRIGGERED untuk kpmrId: ${kpmrId}`);
      initialLoadTriggeredRef.current = true;
      handleRefreshDataRef.current();
    }
  }, [kpmrId, rows.length]);

  return (
    <div className="w-full space-y-6">
      <AspekPanel rows={rows} setRows={setRows} activeQuarter={activeQuarter} onRefreshData={handleRefreshData} kpmrId={kpmrId} onCreateKpmr={onCreateKpmr} />
      <TableKpmr rows={filteredRows} activeQuarter={activeQuarter} />
    </div>
  );
}