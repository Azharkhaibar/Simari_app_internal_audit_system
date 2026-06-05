// src/ojk/rentabilitas-produk/rentabilitas-produk-ojk/rentabilitas-produk-inherent.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useHeaderStore } from '../../../../store/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, TriangleAlert, X, FileWarning, ArrowBigLeftDash, ArrowBigRightDash, ChevronDown, ChevronUp, Edit, Save, Loader2, Search } from 'lucide-react';

import computeDerived from '../../../../utils/compute/compute-derived';
import { useDropdownPortal } from '../components/usedropdownportal';
import PopUpDelete from '../../../../components/popup-delete';
import useRentabilitasProdukIntegration from '../hook/inherent/rentabilitas.hook';
import { useAuditLog } from '../../../../../audit-log/hooks/audit-log.hooks';
import { useAuth } from '@/features/auth/hooks/useAuth.hook';

const log = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, data || '');
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, data || '');
  },
  debug: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] DEBUG: ${message}`, data || '');
  },
  loading: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ⏳ LOADING: ${message}`);
  },
  success: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`);
  },
};

// Komponen utama wrapper dengan integrasi backend
export default function RentabilitasProdukInherentWrapper() {
  const [search, setSearch] = useState('');
  const year = useHeaderStore((s) => s.year);
  const quarter = useHeaderStore((s) => s.activeQuarter);
  const [active, setActive] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { logCreate, logUpdate, logDelete, logExport } = useAuditLog();

  // Gunakan hook integration yang sudah diperbaiki
  const {
    rows,
    isLoading,
    error,
    loadData,
    changeYearQuarter,
    reloadData,
    setRows,
    handleAddParameter,
    handleUpdateParameter,
    handleCopyParameter,
    handleDeleteParameter,
    handleAddNilai,
    handleUpdateNilai,
    handleCopyNilai,
    handleDeleteNilai,
    getParameterById,
    currentInherentId,
    currentInherentData,
    formatParameterJudul,
    formatNilaiJudul,
    formatBobot,
    formatKategori,
  } = useRentabilitasProdukIntegration(year, quarter);

  useEffect(() => {
    log.debug('State changed', {
      year,
      quarter,
      isInitialLoading,
      rowsCount: rows.length,
      isLoading,
      currentInherentId,
      currentInherentData: currentInherentData ? `ID: ${currentInherentData.id}` : 'null',
      error,
    });
  }, [year, quarter, isInitialLoading, rows, isLoading, currentInherentId, currentInherentData, error]);

  // PERBAIKAN: Load data saat mount atau year/quarter berubah dengan changeYearQuarter
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!year || !quarter || quarter < 1 || quarter > 4) {
        log.warn('Invalid year or quarter:', { year, quarter });
        if (mounted) {
          setIsInitialLoading(false);
        }
        return;
      }

      setIsInitialLoading(true);
      try {
        log.info(`Loading data for ${year}-Q${quarter}`);
        await changeYearQuarter(year, quarter);
        log.success(`Data loaded successfully for ${year}-Q${quarter}`);
      } catch (err) {
        log.error('Error loading data:', err);
        if (!mounted) return;
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [year, quarter, changeYearQuarter]);

  const backendHandlers = useMemo(
    () => ({
      addParameter: async (createParamDto) => {
        try {
          log.info('Adding parameter:', createParamDto);
          await handleAddParameter(createParamDto);
          
          // AUDIT LOG: CREATE PARAMETER
          await logCreate('RENTABILITAS_OJK', `Menambah parameter rentabilitas produk - ${createParamDto.judul || 'parameter baru'}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'CREATE_PARAMETER',
              parameterData: {
                nomor: createParamDto.nomor,
                judul: createParamDto.judul,
                bobot: createParamDto.bobot,
              },
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Parameter added successfully');
          return { success: true };
        } catch (err) {
          log.error('Error adding parameter:', err);
          
          // AUDIT LOG: CREATE PARAMETER FAILED
          await logCreate('RENTABILITAS_OJK', `Gagal menambah parameter - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'CREATE_PARAMETER',
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal menambahkan parameter: ' + (err.message || 'Coba lagi nanti'),
          };
        }
      },

      updateParameter: async (parameterId, updateParamDto) => {
        try {
          log.info('Updating parameter:', { parameterId, updateParamDto });
          await handleUpdateParameter(parameterId, updateParamDto);
          
          // AUDIT LOG: UPDATE PARAMETER
          await logUpdate('RENTABILITAS_OJK', `Mengupdate parameter rentabilitas produk ID: ${parameterId} - ${updateParamDto.judul || 'parameter'}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'UPDATE_PARAMETER',
              parameterId: parameterId,
              changes: {
                nomor: updateParamDto.nomor,
                judul: updateParamDto.judul,
                bobot: updateParamDto.bobot,
              },
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Parameter updated successfully');
          return { success: true };
        } catch (err) {
          log.error('Error updating parameter:', err);
          
          // AUDIT LOG: UPDATE PARAMETER FAILED
          await logUpdate('RENTABILITAS_OJK', `Gagal mengupdate parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'UPDATE_PARAMETER',
              parameterId: parameterId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal mengupdate parameter: ' + err.message,
          };
        }
      },

      deleteParameter: async (parameterId) => {
        try {
          log.info('Deleting parameter:', parameterId);
          const paramToDelete = rows.find(p => p.id === parameterId);
          
          await handleDeleteParameter(parameterId);
          
          // AUDIT LOG: DELETE PARAMETER
          await logDelete('RENTABILITAS_OJK', `Menghapus parameter rentabilitas produk ID: ${parameterId} - ${paramToDelete?.judul || 'parameter'}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'DELETE_PARAMETER',
              parameterId: parameterId,
              parameterName: paramToDelete?.judul,
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Parameter deleted successfully');
          return { success: true };
        } catch (err) {
          log.error('Error deleting parameter:', err);
          
          // AUDIT LOG: DELETE PARAMETER FAILED
          await logDelete('RENTABILITAS_OJK', `Gagal menghapus parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'DELETE_PARAMETER',
              parameterId: parameterId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal menghapus parameter: ' + err.message,
          };
        }
      },

      addNilai: async (parameterId, createNilaiDto) => {
        try {
          log.info('Adding nilai:', { parameterId, createNilaiDto });
          await handleAddNilai(parameterId, createNilaiDto);
          
          // AUDIT LOG: CREATE NILAI
          await logCreate('RENTABILITAS_OJK', `Menambah nilai pada parameter ID: ${parameterId} - ${createNilaiDto.judul?.text || 'nilai baru'}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'CREATE_NILAI',
              parameterId: parameterId,
              nilaiData: {
                nomor: createNilaiDto.nomor,
                judul: createNilaiDto.judul?.text,
                bobot: createNilaiDto.bobot
              },
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Nilai added successfully');
          return { success: true };
        } catch (err) {
          log.error('Error adding nilai:', err);
          
          // AUDIT LOG: CREATE NILAI FAILED
          await logCreate('RENTABILITAS_OJK', `Gagal menambah nilai pada parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'CREATE_NILAI',
              parameterId: parameterId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal menambahkan nilai: ' + err.message,
          };
        }
      },

      updateNilai: async (parameterId, nilaiId, updateNilaiDto) => {
        try {
          log.info('Updating nilai:', { parameterId, nilaiId, updateNilaiDto });
          await handleUpdateNilai(parameterId, nilaiId, updateNilaiDto);
          
          // AUDIT LOG: UPDATE NILAI
          await logUpdate('RENTABILITAS_OJK', `Mengupdate nilai ID: ${nilaiId} pada parameter ID: ${parameterId}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'UPDATE_NILAI',
              parameterId: parameterId,
              nilaiId: nilaiId,
              changes: {
                nomor: updateNilaiDto.nomor,
                judul: updateNilaiDto.judul?.text,
                bobot: updateNilaiDto.bobot
              },
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Nilai updated successfully');
          return { success: true };
        } catch (err) {
          log.error('Error updating nilai:', err);
          
          // AUDIT LOG: UPDATE NILAI FAILED
          await logUpdate('RENTABILITAS_OJK', `Gagal mengupdate nilai ID: ${nilaiId} pada parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'UPDATE_NILAI',
              parameterId: parameterId,
              nilaiId: nilaiId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal mengupdate nilai: ' + err.message,
          };
        }
      },

      deleteNilai: async (parameterId, nilaiId) => {
        try {
          log.info('Deleting nilai:', { parameterId, nilaiId });
          await handleDeleteNilai(parameterId, nilaiId);
          
          // AUDIT LOG: DELETE NILAI
          await logDelete('RENTABILITAS_OJK', `Menghapus nilai ID: ${nilaiId} dari parameter ID: ${parameterId}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'DELETE_NILAI',
              parameterId: parameterId,
              nilaiId: nilaiId,
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Nilai deleted successfully');
          return { success: true };
        } catch (err) {
          log.error('Error deleting nilai:', err);
          
          // AUDIT LOG: DELETE NILAI FAILED
          await logDelete('RENTABILITAS_OJK', `Gagal menghapus nilai ID: ${nilaiId} dari parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'DELETE_NILAI',
              parameterId: parameterId,
              nilaiId: nilaiId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal menghapus nilai: ' + err.message,
          };
        }
      },

      copyParameter: async (parameterId) => {
        try {
          log.info('Copying parameter:', parameterId);
          const sourceParameter = rows.find(p => p.id === parameterId);
          
          await handleCopyParameter(parameterId);
          
          // AUDIT LOG: COPY PARAMETER
          await logCreate('RENTABILITAS_OJK', `Menyalin parameter ID: ${parameterId} - ${sourceParameter?.judul || 'parameter'}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'COPY_PARAMETER',
              sourceParameterId: parameterId,
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Parameter copied successfully');
          return { success: true };
        } catch (err) {
          log.error('Error copying parameter:', err);
          
          // AUDIT LOG: COPY PARAMETER FAILED
          await logCreate('RENTABILITAS_OJK', `Gagal menyalin parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'COPY_PARAMETER',
              sourceParameterId: parameterId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal menyalin parameter: ' + err.message,
          };
        }
      },

      copyNilai: async (parameterId, nilaiId) => {
        try {
          log.info('Copying nilai:', { parameterId, nilaiId });
          await handleCopyNilai(parameterId, nilaiId);
          
          // AUDIT LOG: COPY NILAI
          await logCreate('RENTABILITAS_OJK', `Menyalin nilai ID: ${nilaiId} dari parameter ID: ${parameterId}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'COPY_NILAI',
              parameterId: parameterId,
              sourceNilaiId: nilaiId,
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Nilai copied successfully');
          return { success: true };
        } catch (err) {
          log.error('Error copying nilai:', err);
          
          // AUDIT LOG: COPY NILAI FAILED
          await logCreate('RENTABILITAS_OJK', `Gagal menyalin nilai ID: ${nilaiId} dari parameter ID: ${parameterId} - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'COPY_NILAI',
              parameterId: parameterId,
              sourceNilaiId: nilaiId,
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal menyalin nilai: ' + err.message,
          };
        }
      },

      getParameterById,

      refreshData: async () => {
        try {
          log.info('Refreshing data...');
          await reloadData();
          
          // AUDIT LOG: REFRESH/EXPORT DATA
          await logExport('RENTABILITAS_OJK', `Refresh data rentabilitas produk untuk ${year}-Q${quarter}`, {
            userId: currentUser?.id || null,
            isSuccess: true,
            metadata: {
              type: 'inherent',
              action: 'REFRESH_DATA',
              year: year,
              quarter: quarter
            }
          });
          
          log.success('Data refreshed successfully');
          return { success: true };
        } catch (err) {
          log.error('Error refreshing data:', err);
          
          // AUDIT LOG: REFRESH DATA FAILED
          await logExport('RENTABILITAS_OJK', `Gagal refresh data - ${err.message}`, {
            userId: currentUser?.id || null,
            isSuccess: false,
            metadata: {
              type: 'inherent',
              action: 'REFRESH_DATA',
              error: err.message,
              year: year,
              quarter: quarter
            }
          });
          
          return {
            success: false,
            error: '❌ Gagal refresh data: ' + err.message,
          };
        }
      },

      changeQuarter: async (newYear, newQuarter) => {
        try {
          log.info(`Changing quarter to ${newYear}-Q${newQuarter}`);
          await changeYearQuarter(newYear, newQuarter);
          log.success('Quarter changed successfully');
          return { success: true };
        } catch (err) {
          log.error('Error changing quarter:', err);
          return {
            success: false,
            error: '❌ Gagal berpindah quarter: ' + err.message,
          };
        }
      },

      formatParameterJudul,
      formatNilaiJudul,
      formatBobot,
      formatKategori,
    }),
    [
      handleAddParameter,
      handleUpdateParameter,
      handleDeleteParameter,
      handleAddNilai,
      handleUpdateNilai,
      handleDeleteNilai,
      handleCopyParameter,
      handleCopyNilai,
      getParameterById,
      reloadData,
      changeYearQuarter,
      formatParameterJudul,
      formatNilaiJudul,
      formatBobot,
      formatKategori,
      currentUser,
      year,
      quarter,
      rows,
    ],
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return row.judul?.toLowerCase().includes(s) || row.nomor?.toString().includes(s);
    });
  }, [rows, search]);

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data dari database...</p>
          <p className="text-sm text-gray-500 mt-2">
            Tahun: {year} | Quarter: {quarter}
          </p>
          {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
        </div>
      </div>
    );
  }

  // Error state
  if (error && rows.length === 0) {
    log.error('Rendering error state', { error });
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-3">
            <TriangleAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Memuat Data</h3>
            <p className="text-red-700">{error}</p>
            <div className="mt-2 space-y-2">
              <button
                onClick={() => {
                  log.info('Retry loading data');
                  setIsInitialLoading(true);
                  backendHandlers.changeQuarter(year, quarter).finally(() => setIsInitialLoading(false));
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => {
                  log.info('Reset loading state');
                  setIsInitialLoading(false);
                }}
                className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header dengan kontrol */}
      <div className="bg-white rounded-lg border shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rentabilitas Produk - Inherent Risk</h1>
            <p className="text-gray-600">
              Tahun: <span className="font-semibold">{year}</span> | Quarter: <span className="font-semibold">Q{quarter}</span>
              {currentInherentId && <span className="ml-4 text-xs bg-gray-100 px-2 py-1 rounded">ID: {String(currentInherentId).substring(0, 8)}...</span>}
            </p>
            {currentInherentData?.isLocked && (
              <p className="text-sm text-amber-600 mt-1">
                <TriangleAlert className="w-4 h-4 inline mr-1" />
                Data terkunci pada {new Date(currentInherentData.lockedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative">
              <Input type="text" placeholder="Cari parameter..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64" />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* Status Toggle */}
            <Button onClick={() => setActive(!active)} variant={active ? 'default' : 'outline'} className={active ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              {active ? 'Aktif' : 'Nonaktif'}
            </Button>

            {/* Refresh Button */}
            <Button onClick={() => backendHandlers.refreshData()} variant="outline" className="flex items-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Refresh
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <TriangleAlert className="w-5 h-5" />
            </div>

            <div className="text-sm text-blue-800">
              <span className="font-semibold">Autosave aktif.</span> Semua perubahan langsung tersimpan ke database.
              <span className="font-semibold ml-2">Total {rows.length} parameter</span>
              {currentInherentData?.summary?.totalWeighted && (
                <span className="ml-2">
                  | Total Weighted: <span className="font-bold">{currentInherentData.summary.totalWeighted.toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Komponen utama */}
      <RentabilitasProdukInherent rows={rows} setRows={setRows} search={search} active={active} backendHandlers={backendHandlers} isLoading={isLoading} isLocked={currentInherentData?.isLocked} />
    </div>
  );
}

// Komponen utama
function RentabilitasProdukInherent({ rows, setRows, search, active, backendHandlers, isLoading, isLocked = false }) {
  const { activeQuarter } = useHeaderStore();

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return row.judul?.toLowerCase().includes(s) || row.nomor?.toString().includes(s);
    });
  }, [rows, search]);

  return (
    <div className="w-full space-y-6">
      <ParameterPanel rows={rows} setRows={setRows} active={active} backendHandlers={backendHandlers} isLoading={isLoading || isLocked} isLocked={isLocked} />
      <TableInherent rows={filteredRows} activeQuarter={activeQuarter} />
    </div>
  );
}

// ParameterPanel dengan integrasi backend
function ParameterPanel({ rows, setRows, active, backendHandlers, isLoading: globalLoading, isLocked = false }) {
  const [activeParamIndex, setActiveParamIndex] = useState(null);
  const [activeNilaiIndex, setActiveNilaiIndex] = useState(0);
  const [showParameterForm, setShowParameterForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalParameter, setOriginalParameter] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteContext, setDeleteContext] = useState({
    type: '',
    paramIndex: null,
    nilaiIndex: null,
  });
  const { user: currentUser } = useAuth();
  const year = useHeaderStore((s) => s.year);
  const quarter = useHeaderStore((s) => s.activeQuarter);

  const [draftParameter, setDraftParameter] = useState(() => ({
    nomor: '',
    judul: '',
    bobot: 0,
    kategori: {
      model: '',
      prinsip: '',
      jenis: '',
      underlying: [],
    },
  }));

  const [openUnderlying, setOpenUnderlying] = useState(false);
  const [openParamList, setOpenParamList] = useState(false);
  const dropdownBtnRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);
  const dropdownListRef = useRef(null);

  useEffect(() => {
    if (rows.length === 0) {
      setActiveParamIndex(null);
      setActiveNilaiIndex(0);
      setEditMode(false);
      setOriginalParameter(null);
      setDraftParameter({
        nomor: '',
        judul: '',
        bobot: '',
        kategori: {
          model: '',
          prinsip: '',
          jenis: '',
          underlying: [],
        },
      });
    }
  }, [rows]);

  useEffect(() => {
    if (!openParamList || !dropdownBtnRef.current) return;

    const updatePosition = () => {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [openParamList]);

  useDropdownPortal({
    open: openParamList,
    setOpen: setOpenParamList,
    triggerRef: dropdownBtnRef,
    containerRef: dropdownListRef,
  });

  useEffect(() => {
    if (!active) setOpenParamList(false);
  }, [active]);

  const safeActiveParamIndex = activeParamIndex !== null && activeParamIndex >= 0 && activeParamIndex < rows.length ? activeParamIndex : null;
  const safeActiveParam = safeActiveParamIndex !== null ? rows[safeActiveParamIndex] : null;

  useEffect(() => {
    if (safeActiveParamIndex !== null) {
      setEditMode(false);
      setOriginalParameter(null);
    }
  }, [safeActiveParamIndex]);

  const parameter = editMode ? draftParameter : (safeActiveParam ?? draftParameter);

  useEffect(() => {
    setActiveNilaiIndex(0);
  }, [safeActiveParamIndex]);

  useEffect(() => {
    if (safeActiveParam && !editMode) {
      const newDraft = {
        nomor: safeActiveParam.nomor ?? '',
        judul: safeActiveParam.judul ?? '',
        bobot: safeActiveParam.bobot ?? '',
        kategori: {
          model: safeActiveParam.kategori?.model ?? '',
          prinsip: safeActiveParam.kategori?.prinsip ?? '',
          jenis: safeActiveParam.kategori?.jenis ?? '',
          underlying: Array.isArray(safeActiveParam.kategori?.underlying) ? safeActiveParam.kategori.underlying : [],
        },
      };

      setDraftParameter((prev) => (JSON.stringify(prev) === JSON.stringify(newDraft) ? prev : newDraft));
    } else if (!safeActiveParam && !editMode) {
      setDraftParameter({
        nomor: '',
        judul: '',
        bobot: '',
        kategori: {
          model: '',
          prinsip: '',
          jenis: '',
          underlying: [],
        },
      });
      setEditMode(false);
      setOriginalParameter(null);
    }
  }, [safeActiveParam, editMode]);

  const handleChangeKategori = useCallback((key, value) => {
    setDraftParameter((prev) => {
      const next = {
        ...prev,
        kategori: {
          ...prev.kategori,
          [key]: value,
        },
      };

      if (key === 'model') {
        const newModel = value;

        if (newModel === 'tanpa_model') {
          next.kategori = {
            model: 'tanpa_model',
            prinsip: '',
            jenis: '',
            underlying: [],
          };
        } else if (newModel === 'open_end') {
          next.kategori = {
            model: 'open_end',
            prinsip: '',
            jenis: '',
            underlying: [],
          };
        } else if (newModel === 'terstruktur') {
          next.kategori = {
            model: 'terstruktur',
            prinsip: '',
            jenis: '',
            underlying: [],
          };
        }
      }

      if (prev.kategori.model !== 'terstruktur' && key === 'underlying') {
        next.kategori.underlying = [];
      }

      return next;
    });
  }, []);

  const handleChangeParameter = useCallback((key, value) => {
    setDraftParameter((p) => ({ ...p, [key]: value }));
  }, []);

  const isKategoriIncomplete = useCallback((param) => {
    const k = param?.kategori || {};

    if (!k.model) {
      return true;
    }

    if (k.model === 'open_end' || k.model === 'terstruktur') {
      if (!k.prinsip) {
        return true;
      }

      if (!['syariah', 'konvensional'].includes(k.prinsip)) {
        return true;
      }
    }

    if (k.model === 'open_end') {
      if (!k.jenis) {
        return true;
      }

      const validJenis = ['pasar_uang', 'pendapatan_tetap', 'campuran', 'saham', 'indeks', 'terproteksi'];
      if (!validJenis.includes(k.jenis)) {
        return true;
      }

      if (k.underlying && k.underlying.length > 0) {
        return true;
      }
    }

    if (k.model === 'terstruktur') {
      if (k.jenis) {
        return true;
      }

      if (!Array.isArray(k.underlying)) {
        return true;
      }

      if (k.underlying.length > 0) {
        const validUnderlying = ['indeks', 'eba', 'dinfra', 'obligasi'];
        const invalidValues = k.underlying.filter((value) => !validUnderlying.includes(value));
        if (invalidValues.length > 0) {
          return true;
        }
      }
    }

    if (k.model === 'tanpa_model') {
      if (k.prinsip || k.jenis || (Array.isArray(k.underlying) && k.underlying.length > 0)) {
        return true;
      }
    }

    return false;
  }, []);

  const handleEditParam = useCallback(() => {
    if (safeActiveParamIndex === null) return;

    const param = rows[safeActiveParamIndex];

    const paramCopy = {
      ...param,
      kategori: param.kategori
        ? {
            ...param.kategori,
            underlying: [...(param.kategori.underlying || [])],
          }
        : {
            model: '',
            prinsip: '',
            jenis: '',
            underlying: [],
          },
      nilaiList: param.nilaiList
        ? param.nilaiList.map((nilai) => ({
            ...nilai,
            judul: nilai.judul ? { ...nilai.judul } : {},
            riskindikator: nilai.riskindikator ? { ...nilai.riskindikator } : {},
          }))
        : [],
    };

    setOriginalParameter(paramCopy);

    setDraftParameter({
      nomor: param.nomor ?? '',
      judul: param.judul ?? '',
      bobot: param.bobot ?? '',
      kategori: {
        model: param.kategori?.model ?? '',
        prinsip: param.kategori?.prinsip ?? '',
        jenis: param.kategori?.jenis ?? '',
        underlying: Array.isArray(param.kategori?.underlying) ? [...param.kategori.underlying] : [],
      },
    });

    setEditMode(true);
  }, [safeActiveParamIndex, rows]);

  const handleUpdateParam = useCallback(async () => {
    if (safeActiveParamIndex === null) return;

    if (isKategoriIncomplete(draftParameter)) {
      alert('Lengkapi kategori sebelum mengupdate parameter.');
      return;
    }

    const bobotNum = Number(draftParameter.bobot);
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      alert('Bobot harus antara 0 dan 100.');
      return;
    }

    const judul = draftParameter.judul?.trim();
    if (!judul) {
      alert('Judul parameter tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      const kategori = {
        model: draftParameter.kategori.model || '',
        prinsip: draftParameter.kategori.prinsip || '',
        jenis: draftParameter.kategori.jenis || '',
        underlying: Array.isArray(draftParameter.kategori.underlying) ? draftParameter.kategori.underlying : [],
      };

      const cleanKategori = { ...kategori };

      if (cleanKategori.model === 'tanpa_model') {
        cleanKategori.prinsip = '';
        cleanKategori.jenis = '';
        cleanKategori.underlying = [];
      } else if (cleanKategori.model === 'open_end') {
        cleanKategori.underlying = [];
      } else if (cleanKategori.model === 'terstruktur') {
        cleanKategori.jenis = '';
        if (!Array.isArray(cleanKategori.underlying)) {
          cleanKategori.underlying = [];
        }
      }

      const updateParamDto = {
        nomor: draftParameter.nomor || '',
        judul: judul,
        bobot: bobotNum,
        kategori: cleanKategori,
      };

      if (backendHandlers?.updateParameter && rows[safeActiveParamIndex].id) {
        const result = await backendHandlers.updateParameter(rows[safeActiveParamIndex].id, updateParamDto);

        if (!result.success) {
          throw new Error(result.error || 'Gagal update ke backend');
        }
      }

      const updatedRows = rows.map((row, idx) =>
        idx === safeActiveParamIndex
          ? {
              ...row,
              nomor: draftParameter.nomor || '',
              judul: judul,
              bobot: bobotNum,
              kategori: cleanKategori,
            }
          : row,
      );

      setRows(updatedRows);
      setEditMode(false);
      setOriginalParameter(null);
      setLoading(false);
    } catch (error) {
      console.error('Error updating:', error);
      let errorMessage = error.message || 'Gagal mengupdate parameter';

      if (error.response || error.result?.response) {
        const response = error.response || error.result.response;
        if (response.data?.errors) {
          const errorDetails = response.data.errors.map((err) => `${err.field || 'unknown'}: ${err.message}`).join('\n');
          errorMessage = `Validasi gagal:\n${errorDetails}`;
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
      }

      alert(`Error: ${errorMessage}`);
      setLoading(false);
    }
  }, [draftParameter, safeActiveParamIndex, rows, setRows, isKategoriIncomplete, backendHandlers]);

  const handleAddNewParameter = useCallback(async () => {
    const bobotNum = Number(draftParameter.bobot);

    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      alert('Bobot harus antara 0 dan 100.');
      return;
    }

    if (isKategoriIncomplete(draftParameter)) {
      alert('Lengkapi kategori sebelum menambah parameter.');
      return;
    }

    const judul = draftParameter.judul?.trim();
    if (!judul) {
      alert('Judul parameter tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      const kategori = {
        model: draftParameter.kategori.model || null,
        prinsip: draftParameter.kategori.prinsip || null,
        jenis: draftParameter.kategori.jenis || null,
        underlying: Array.isArray(draftParameter.kategori.underlying) ? draftParameter.kategori.underlying : [],
      };

      const createParamDto = {
        nomor: draftParameter.nomor || '',
        judul: judul,
        bobot: bobotNum,
        kategori: {
          model: kategori.model,
          prinsip: kategori.prinsip || undefined,
          jenis: kategori.jenis || undefined,
          underlying: kategori.underlying || [],
        },
      };

      const cleanPayload = JSON.parse(JSON.stringify(createParamDto));

      const result = await backendHandlers.addParameter(cleanPayload);

      if (!result.success) {
        let errorMessage = 'Validasi gagal';

        if (result.error) {
          errorMessage = result.error.replace('Gagal menambahkan parameter: ', '');
        } else if (result.response) {
          const backendResponse = result.response;

          if (backendResponse.errors) {
            const errorDetails = backendResponse.errors.map((err, idx) => `${idx + 1}. ${err.field || 'unknown'}: ${err.message || 'validation error'}`).join('\n');
            errorMessage = `Validasi gagal:\n${errorDetails}`;
          } else if (backendResponse.message) {
            errorMessage = backendResponse.message;
          } else if (backendResponse.details) {
            errorMessage = backendResponse.details;
          } else if (typeof backendResponse === 'string') {
            errorMessage = backendResponse;
          }
        }

        throw new Error(errorMessage);
      }

      setDraftParameter({
        nomor: '',
        judul: '',
        bobot: '',
        kategori: {
          model: '',
          prinsip: '',
          jenis: '',
          underlying: [],
        },
      });

      setLoading(false);
    } catch (error) {
      console.error('Error in handleAddNewParameter:', error);
      let errorMessage = error.message || 'Gagal menambahkan parameter';

      if (errorMessage.includes('Validation failed') || errorMessage.includes('Bad Request')) {
        errorMessage =
          'Validasi gagal. Periksa data yang Anda masukkan:\n' +
          '1. Pastikan model produk dipilih\n' +
          '2. Untuk open_end: pilih jenis dan prinsip\n' +
          '3. Untuk terstruktur: pilih prinsip (aset dasar boleh kosong)\n' +
          '4. Untuk tanpa_model: jangan pilih prinsip/jenis/aset dasar\n' +
          '5. Bobot harus antara 0-100\n' +
          '6. Judul tidak boleh kosong';
      }

      alert(`Error: ${errorMessage}`);
      setLoading(false);
    }
  }, [draftParameter, isKategoriIncomplete, backendHandlers]);

  const handleCancelEdit = useCallback(() => {
    if (originalParameter && safeActiveParamIndex !== null) {
      setRows((prev) => prev.map((row, idx) => (idx === safeActiveParamIndex ? originalParameter : row)));
    }

    setEditMode(false);
    setOriginalParameter(null);
    setDraftParameter({
      nomor: '',
      judul: '',
      bobot: '',
      kategori: {
        model: '',
        prinsip: '',
        jenis: '',
        underlying: [],
      },
    });
  }, [originalParameter, safeActiveParamIndex, setRows]);

  const handleCopyParam = useCallback(async () => {
    if (safeActiveParamIndex === null) return;

    const source = rows[safeActiveParamIndex];

    setLoading(true);
    try {
      if (backendHandlers?.copyParameter && source.id) {
        const result = await backendHandlers.copyParameter(source.id);
        if (!result.success) {
          throw new Error(result.error || 'Gagal copy ke backend');
        }

        setLoading(false);
        return;
      }

      const copiedParam = {
        ...source,
        id: `copy-${Date.now()}`,
        nomor: `${source.nomor}`,
        judul: `${source.judul} (Copy)`,
        bobot: source.bobot,
        kategori: structuredClone(source.kategori || {}),
        nilaiList: (source.nilaiList || []).map((n) => ({
          ...structuredClone(n),
          id: `copy-nilai-${Date.now()}-${Math.random()}`,
        })),
      };

      setRows((prev) => {
        const next = [...prev, copiedParam];
        setActiveParamIndex(next.length - 1);
        setActiveNilaiIndex(0);
        setEditMode(false);
        setOriginalParameter(null);
        return next;
      });

      setLoading(false);
    } catch (error) {
      alert(error.message || 'Gagal menyalin parameter');
      setLoading(false);
    }
  }, [safeActiveParamIndex, rows, setRows, backendHandlers]);

  const handleDeleteParam = useCallback(() => {
    if (safeActiveParamIndex === null) return;

    const param = rows[safeActiveParamIndex];

    setItemToDelete({
      name: param.judul || 'parameter ini',
      nomor: param.nomor || '-',
      judul: param.judul || 'Tidak ada judul',
    });
    setDeleteContext({
      type: 'parameter',
      paramIndex: safeActiveParamIndex,
      nilaiIndex: null,
    });
    setDeleteDialogOpen(true);
  }, [safeActiveParamIndex, rows]);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete || !deleteContext.type) return;

    setLoading(true);

    if (deleteContext.type === 'parameter') {
      const { paramIndex } = deleteContext;

      if (paramIndex === null) {
        setLoading(false);
        setDeleteDialogOpen(false);
        return;
      }

      const paramToDelete = rows[paramIndex];

      if (backendHandlers?.deleteParameter && paramToDelete.id) {
        try {
          const result = await backendHandlers.deleteParameter(paramToDelete.id);
          if (!result.success) {
            throw new Error(result.error || 'Gagal delete dari backend');
          }
        } catch (error) {
          alert(error.message || 'Gagal menghapus dari database');
          setLoading(false);
          setDeleteDialogOpen(false);
          return;
        }
      }

      const updatedRows = rows.filter((_, idx) => idx !== paramIndex);
      setRows(updatedRows);

      const nextIndex = updatedRows.length > 0 ? 0 : null;
      setActiveParamIndex(nextIndex);
      setActiveNilaiIndex(0);
      setEditMode(false);
      setOriginalParameter(null);

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteContext({ type: '', paramIndex: null, nilaiIndex: null });

      setLoading(false);
    } else if (deleteContext.type === 'nilai') {
      const { paramIndex, nilaiIndex } = deleteContext;

      if (paramIndex === null || nilaiIndex === null) {
        setLoading(false);
        setDeleteDialogOpen(false);
        return;
      }

      const param = rows[paramIndex];
      const nilaiToDelete = param.nilaiList?.[nilaiIndex];

      if (backendHandlers?.deleteNilai && param.id && nilaiToDelete?.id) {
        try {
          const result = await backendHandlers.deleteNilai(param.id, nilaiToDelete.id);
          if (!result.success) {
            throw new Error(result.error || 'Gagal delete nilai dari backend');
          }
        } catch (error) {
          alert(error.message || 'Gagal menghapus nilai dari database');
          setLoading(false);
          setDeleteDialogOpen(false);
          return;
        }
      }

      const updatedRows = rows.map((row, ri) => {
        if (ri !== paramIndex) return row;

        const updatedNilaiList = (row.nilaiList || []).filter((_, ni) => ni !== nilaiIndex);

        return {
          ...row,
          nilaiList: updatedNilaiList,
        };
      });

      setRows(updatedRows);

      const nextIndex = Math.max(0, nilaiIndex - 1);
      setActiveNilaiIndex(nextIndex);

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteContext({ type: '', paramIndex: null, nilaiIndex: null });

      setLoading(false);
    }
  }, [itemToDelete, deleteContext, rows, setRows, backendHandlers]);

  const formatLabel = useCallback((row) => {
    const k = row.kategori || {};

    const kategoriText = [k.model, k.prinsip, k.jenis, ...(k.underlying || [])].filter(Boolean).join(' / ');

    return `${row.nomor} – ${row.judul} (Bobot: ${row.bobot}%)${kategoriText ? ' | ' + kategoriText : ''}`;
  }, []);

  const handleClearSelection = useCallback(() => {
    setActiveParamIndex(null);
    setActiveNilaiIndex(0);
    setEditMode(false);
    setOriginalParameter(null);
    setDraftParameter({
      nomor: '',
      judul: '',
      bobot: '',
      kategori: {
        model: '',
        prinsip: '',
        jenis: '',
        underlying: [],
      },
    });
    setOpenParamList(false);
  }, []);

  const handleOpenNilaiDeleteDialog = useCallback(
    (nilai, nilaiIndex) => {
      setItemToDelete({
        name: nilai.judul?.text || 'indikator ini',
        nomor: nilai.nomor || '-',
        judul: nilai.judul?.text || 'Tidak ada judul',
      });
      setDeleteContext({
        type: 'nilai',
        paramIndex: safeActiveParamIndex,
        nilaiIndex: nilaiIndex,
      });
      setDeleteDialogOpen(true);
    },
    [safeActiveParamIndex],
  );

  const isDisabled = loading || globalLoading || isLocked;

  return (
    <div className="w-full space-y-3">
      <div className="bg-gradient-to-r from-blue-700 to-sky-600 text-white px-4 py-3 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            <h2 className="">Parameter (Tersinkron dengan Database)</h2>
            {isLocked && (
              <div className="text-xs bg-amber-600 text-white px-2 py-1 rounded mt-1 inline-flex items-center">
                <TriangleAlert className="w-3 h-3 mr-1" />
                Data terkunci - hanya bisa melihat
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDisabled && (
              <div className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded flex items-center">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Memproses...
              </div>
            )}

            <Button size="sm" variant="outline" onClick={() => setShowParameterForm(!showParameterForm)} className="bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm px-3 border-slate-600" disabled={isDisabled}>
              {showParameterForm ? (
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

            {safeActiveParamIndex !== null && !editMode && !isLocked && (
              <Button size="icon" onClick={handleEditParam} className="bg-blue-600 hover:bg-blue-700" disabled={isDisabled} title="Edit Parameter">
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {editMode && !isLocked && (
              <Button size="icon" onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-700" disabled={isDisabled} title="Batal Edit">
                <X className="w-4 h-4" />
              </Button>
            )}

            {!isLocked && (
              <>
                <Button
                  size="icon"
                  onClick={editMode ? handleUpdateParam : handleAddNewParameter}
                  className={editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                  disabled={isDisabled}
                  title={editMode ? 'Update Parameter' : 'Tambah Parameter'}
                >
                  {editMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>

                <Button size="icon" onClick={handleCopyParam} disabled={safeActiveParamIndex === null || isDisabled} className="bg-amber-600 hover:bg-amber-700" title="Salin Parameter">
                  <Copy className="w-4 h-4" />
                </Button>

                <Button size="icon" onClick={handleDeleteParam} disabled={safeActiveParamIndex === null || isDisabled} className="bg-rose-600 hover:bg-rose-700" title="Hapus Parameter">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {showParameterForm && (
          <>
            {isKategoriIncomplete(parameter) && parameter.kategori.model !== 'tanpa_model' ? (
              <div className="w-full mt-2 p-1 flex items-center gap-2 justify-center bg-amber-50 text-amber-700 rounded border border-amber-200">
                <TriangleAlert className="w-4 h-4" />
                <span className="text-xs">Kategori belum diselesaikan</span>
              </div>
            ) : (
              <div className="w-full bg-slate-200 rounded p-0.5 mt-2" />
            )}

            <div className="w-full flex gap-4 my-3 items-start">
              <div className="w-[40%] flex flex-col">
                <label className="font-semibold text-sm ml-1 mb-1 text-slate-200">Model Produk</label>
                <select
                  className="bg-white text-slate-800 text-sm rounded px-2 py-1 border border-slate-300"
                  value={parameter.kategori.model}
                  onChange={(e) => handleChangeKategori('model', e.target.value)}
                  disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                >
                  <option value="">Pilih Model</option>
                  <option value="tanpa_model">Tanpa Model</option>
                  <option value="open_end">Open-End</option>
                  <option value="terstruktur">Terstruktur</option>
                </select>
              </div>

              {parameter.kategori.model === 'open_end' && (
                <div className="w-[50%] flex flex-col">
                  <label className="font-semibold text-sm ml-1 mb-1 text-slate-200">Jenis Reksa Dana</label>
                  <select
                    className="bg-white text-slate-800 text-sm rounded px-2 py-1 border border-slate-300"
                    value={parameter.kategori.jenis}
                    onChange={(e) => handleChangeKategori('jenis', e.target.value)}
                    disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                    required={parameter.kategori.model === 'open_end'}
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="pasar_uang">Pasar Uang</option>
                    <option value="pendapatan_tetap">Pendapatan Tetap</option>
                    <option value="campuran">Campuran</option>
                    <option value="saham">Saham</option>
                    <option value="indeks">Indeks</option>
                    <option value="terproteksi">Terproteksi</option>
                  </select>
                </div>
              )}

              {parameter.kategori.model === 'terstruktur' && (
                <div className="w-[50%] flex flex-col">
                  <label className="font-semibold text-sm ml-1 mb-1 text-slate-200">Aset Dasar</label>

                  <div className="relative">
                    <button
                      type="button"
                      className="w-full bg-white text-slate-800 text-sm rounded px-2 py-1 flex justify-between items-center border border-slate-300"
                      onClick={() => setOpenUnderlying((v) => !v)}
                      disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                    >
                      <span className="truncate">
                        {parameter.kategori.underlying && parameter.kategori.underlying.length > 0
                          ? parameter.kategori.underlying
                              .map((key) => {
                                const map = {
                                  indeks: 'Indeks',
                                  eba: 'Efek Beragun Aset (EBA)',
                                  dinfra: 'DinFra',
                                  obligasi: 'Obligasi',
                                };
                                return map[key] || key;
                              })
                              .join(', ')
                          : 'Pilih Aset Dasar (Opsional)'}
                      </span>
                      <span>▾</span>
                    </button>

                    {openUnderlying && (
                      <div className="absolute z-50 mt-1 w-full bg-white rounded shadow-lg text-sm text-slate-800 border border-slate-200">
                        <div className="px-3 py-2 text-xs text-gray-500 border-b">Pilih aset dasar (boleh kosong untuk model terstruktur)</div>
                        {[
                          { key: 'indeks', label: 'Indeks' },
                          { key: 'eba', label: 'Efek Beragun Aset (EBA)' },
                          { key: 'dinfra', label: 'DinFra' },
                          { key: 'obligasi', label: 'Obligasi' },
                        ].map((u) => {
                          const underlyingArray = Array.isArray(parameter.kategori.underlying) ? parameter.kategori.underlying : [];

                          const checked = underlyingArray.includes(u.key);

                          return (
                            <label key={u.key} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                              <input
                                type="checkbox"
                                className="accent-slate-700"
                                checked={checked}
                                onChange={(e) => {
                                  const currentUnderlying = Array.isArray(parameter.kategori.underlying) ? [...parameter.kategori.underlying] : [];

                                  const next = e.target.checked ? [...currentUnderlying, u.key] : currentUnderlying.filter((x) => x !== u.key);

                                  handleChangeKategori('underlying', next);
                                }}
                                disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                              />
                              <span>{u.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {parameter.kategori.model !== 'tanpa_model' && (
                <div className="flex gap-4 mt-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-slate-200">
                    <input
                      type="radio"
                      name="prinsip"
                      checked={parameter.kategori.prinsip === 'syariah'}
                      onChange={() => handleChangeKategori('prinsip', 'syariah')}
                      disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                      className="accent-emerald-500"
                      required={parameter.kategori.model !== 'tanpa_model'}
                    />
                    <span>Syariah</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-slate-200">
                    <input
                      type="radio"
                      name="prinsip"
                      checked={parameter.kategori.prinsip === 'konvensional'}
                      onChange={() => handleChangeKategori('prinsip', 'konvensional')}
                      disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                      className="accent-slate-500"
                      required={parameter.kategori.model !== 'tanpa_model'}
                    />
                    <span>Konvensional</span>
                  </label>
                </div>
              )}
            </div>

            <div className="w-full flex gap-2">
              <div className="w-[10%]">
                <label className="font-semibold text-sm ml-2 text-slate-200">No</label>
                <Input
                  placeholder="1."
                  value={parameter.nomor}
                  onChange={(e) => handleChangeParameter('nomor', e.target.value)}
                  className="bg-white text-slate-950 border-slate-300"
                  disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                />
              </div>

              <div className="w-[10%]">
                <label className="font-semibold text-sm ml-2 text-slate-200">Bobot</label>
                <Input
                  placeholder="max 100%"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={parameter.bobot}
                  onChange={(e) => handleChangeParameter('bobot', e.target.value)}
                  className="bg-white text-slate-950 border-slate-300"
                  disabled={isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                />
              </div>

              <div className="w-[80%]">
                <label className="font-semibold text-sm ml-2 text-slate-200">Parameter</label>
                <Input
                  placeholder="Reksa Dana"
                  value={parameter.judul}
                  disabled={(parameter.kategori.model !== 'tanpa_model' && isKategoriIncomplete(parameter)) || isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked}
                  onChange={(e) => handleChangeParameter('judul', e.target.value)}
                  className={`bg-white text-slate-950 border-slate-300 ${
                    (parameter.kategori.model !== 'tanpa_model' && isKategoriIncomplete(parameter)) || isDisabled || (safeActiveParamIndex !== null && !editMode) || isLocked ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
            </div>

            <button
              ref={dropdownBtnRef}
              onClick={() => setOpenParamList((v) => !v)}
              className="w-full mt-3 bg-white text-sm text-slate-800 px-3 py-2 rounded-md flex justify-between border border-slate-300 hover:bg-slate-50"
              disabled={isDisabled}
            >
              <span className="truncate">{safeActiveParam ? formatLabel(safeActiveParam) : 'Pilih atau Tambah Parameter Baru'}</span>
              <span>▾</span>
            </button>

            {openParamList &&
              dropdownRect &&
              createPortal(
                <div
                  ref={dropdownListRef}
                  className="fixed bg-white text-slate-800 rounded-md shadow-lg max-h-[220px] overflow-auto z-[9999] border border-slate-200"
                  style={{
                    top: dropdownRect.top,
                    left: dropdownRect.left,
                    width: dropdownRect.width,
                  }}
                >
                  <button
                    onClick={() => {
                      handleClearSelection();
                      setOpenParamList(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 border-b border-slate-200"
                  >
                    ← Kosongkan Pilihan
                  </button>

                  {rows.map((row, idx) => (
                    <button
                      key={row.id ?? idx}
                      onClick={() => {
                        setActiveParamIndex(idx);
                        setOpenParamList(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${idx === safeActiveParamIndex ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                    >
                      {formatLabel(row)}
                    </button>
                  ))}
                </div>,
                document.body,
              )}
          </>
        )}
      </div>

      {!showParameterForm && <div className="w-full" />}

      {safeActiveParam && (
        <NilaiPanel
          param={safeActiveParam}
          nilaiList={safeActiveParam.nilaiList}
          activeNilaiIndex={activeNilaiIndex}
          setActiveNilaiIndex={setActiveNilaiIndex}
          loading={isDisabled}
          paramIndex={safeActiveParamIndex}
          setRows={setRows}
          rows={rows}
          onOpenDeleteDialog={handleOpenNilaiDeleteDialog}
          backendHandlers={backendHandlers}
          isLocked={isLocked}
        />
      )}

      <PopUpDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Hapus ${deleteContext.type === 'parameter' ? 'Parameter' : 'Indikator'}`}
        description={`Apakah Anda yakin ingin menghapus ${deleteContext.type === 'parameter' ? 'parameter' : 'indikator'} ini? Tindakan ini tidak dapat dibatalkan.`}
        itemName={itemToDelete?.name || ''}
        itemNomor={itemToDelete?.nomor || ''}
        itemJudul={itemToDelete?.judul || ''}
        itemType={deleteContext.type === 'parameter' ? 'parameter' : 'indikator'}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          setDeleteContext({ type: '', paramIndex: null, nilaiIndex: null });
        }}
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={loading}
      />
    </div>
  );
}

// NilaiPanel
function NilaiPanel({ param, nilaiList = [], activeNilaiIndex, setActiveNilaiIndex, loading = false, paramIndex, setRows, rows, onOpenDeleteDialog, backendHandlers, isLocked = false }) {
  const hasNilai = Array.isArray(nilaiList) && nilaiList.length > 0;
  const [showForm, setShowForm] = useState(true);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [tempFormula, setTempFormula] = useState('');
  const [tempPercent, setTempPercent] = useState(false);

  const [editModeNilai, setEditModeNilai] = useState(false);
  const [originalNilai, setOriginalNilai] = useState(null);
  const [draftNilai, setDraftNilai] = useState(() => createEmptyDraftNilai());

  const [isSaving, setIsSaving] = useState(false);

  const [openNilaiList, setOpenNilaiList] = useState(false);
  const dropdownNilaiBtnRef = useRef(null);
  const [dropdownNilaiRect, setDropdownNilaiRect] = useState(null);
  const dropdownNilaiListRef = useRef(null);
  const { user: currentUser } = useAuth();
  const year = useHeaderStore((s) => s.year);
  const quarter = useHeaderStore((s) => s.activeQuarter);

  useEffect(() => {
    setEditModeNilai(false);
    setOriginalNilai(null);
    setActiveNilaiIndex(0);
    setDraftNilai(createEmptyDraftNilai());
  }, [param, setActiveNilaiIndex]);

  useEffect(() => {
    if (!openNilaiList || !dropdownNilaiBtnRef.current) return;

    const updatePosition = () => {
      const rect = dropdownNilaiBtnRef.current.getBoundingClientRect();
      setDropdownNilaiRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [openNilaiList]);

  useDropdownPortal({
    open: openNilaiList,
    setOpen: setOpenNilaiList,
    triggerRef: dropdownNilaiBtnRef,
    containerRef: dropdownNilaiListRef,
  });

  useEffect(() => {
    if (!editModeNilai) {
      if (hasNilai && activeNilaiIndex >= 0 && activeNilaiIndex < nilaiList.length) {
        const currentNilai = nilaiList[activeNilaiIndex];
        setDraftNilai(currentNilai || createEmptyDraftNilai());
      } else {
        setDraftNilai(createEmptyDraftNilai());
      }
    }
  }, [activeNilaiIndex, nilaiList, hasNilai, editModeNilai]);

  const safeActiveIndex = hasNilai && activeNilaiIndex >= 0 && activeNilaiIndex < nilaiList.length ? activeNilaiIndex : -1;

  function createEmptyDraftNilai() {
    return {
      nomor: '',
      bobot: 0,
      portofolio: '',
      keterangan: '',
      judul: {
        type: 'Tanpa Faktor',
        text: '',
        value: null,
        pembilang: '',
        valuePembilang: null,
        penyebut: '',
        valuePenyebut: null,
        formula: '',
        percent: false,
      },
      riskindikator: {
        low: '',
        lowToModerate: '',
        moderate: '',
        moderateToHigh: '',
        high: '',
      },
    };
  }

  const getCurrentNilai = () => {
    if (editModeNilai) {
      return draftNilai;
    }

    if (safeActiveIndex >= 0 && hasNilai) {
      return nilaiList[safeActiveIndex];
    }

    return draftNilai;
  };

  const currentNilai = getCurrentNilai();

  useEffect(() => {
    if (!hasNilai && activeNilaiIndex !== -1) {
      setActiveNilaiIndex(-1);
    }
  }, [hasNilai, activeNilaiIndex, setActiveNilaiIndex]);

  const formatNilaiLabel = useCallback((nilai, index) => {
    if (!nilai) return 'Pilih atau Tambah Indikator Baru';

    const nomor = nilai.nomor || index + 1;
    const judul = nilai.judul?.text || 'Tanpa Judul';
    const bobot = nilai.bobot ? ` (Bobot: ${nilai.bobot}%)` : '';
    const copyText = nilai.judul?.text?.includes('(Copy)') ? ' (Copy)' : '';

    return `${nomor} – ${judul}${copyText}${bobot}`;
  }, []);

  const openFormula = () => {
    if (currentNilai?.judul) {
      setTempFormula(currentNilai.judul.formula || '');
      setTempPercent(currentNilai.judul.percent || false);
    }
    setFormulaOpen(true);
  };

  const saveFormula = () => {
    if (!currentNilai) return;

    const updatedNilai = {
      ...currentNilai,
      judul: {
        ...currentNilai.judul,
        formula: tempFormula,
        percent: tempPercent,
      },
    };

    setDraftNilai(updatedNilai);
    setFormulaOpen(false);
  };

  const handleChangeNilaiField = useCallback(
    (path, value) => {
      const keys = path.split('.');
      const updatedDraft = { ...draftNilai };

      let current = updatedDraft;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;

      setDraftNilai(updatedDraft);

      if (editModeNilai) {
        setDraftNilai(updatedDraft);
      }
    },
    [draftNilai, editModeNilai],
  );

  const handleChangeJudul = useCallback(
    (judulPatch) => {
      const updatedDraft = {
        ...draftNilai,
        judul: {
          ...draftNilai.judul,
          ...judulPatch,
        },
      };

      setDraftNilai(updatedDraft);
    },
    [draftNilai],
  );

  const handleAddNilai = useCallback(async () => {
    if (paramIndex === null) return;

    if (!draftNilai.judul?.text?.trim()) {
      alert('Judul indikator tidak boleh kosong!');
      return;
    }

    const bobotNum = Number(draftNilai.bobot);
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      alert('Bobot indikator harus antara 0 dan 100!');
      return;
    }

    setIsSaving(true);

    try {
      const createNilaiDto = {
        nomor: draftNilai.nomor || '',
        judul: draftNilai.judul,
        bobot: bobotNum,
        portofolio: draftNilai.portofolio || '',
        keterangan: draftNilai.keterangan || '',
        riskindikator: draftNilai.riskindikator || {
          low: '',
          lowToModerate: '',
          moderate: '',
          moderateToHigh: '',
          high: '',
        },
      };

      if (backendHandlers?.addNilai && param.id && !isLocked) {
        const result = await backendHandlers.addNilai(param.id, createNilaiDto);
        if (!result.success) {
          throw new Error(result.error || 'Gagal menambahkan nilai ke database');
        }
      } else {
        setRows((prev) =>
          prev.map((row, ri) =>
            ri === paramIndex
              ? {
                  ...row,
                  nilaiList: [...(row.nilaiList || []), draftNilai],
                }
              : row,
          ),
        );
      }

      setDraftNilai(createEmptyDraftNilai());

      const newIndex = (nilaiList || []).length;
      setActiveNilaiIndex(newIndex);

      setEditModeNilai(false);
      setOriginalNilai(null);
    } catch (error) {
      console.error('Error adding nilai:', error);
      alert(error.message || 'Gagal menambahkan nilai');
    } finally {
      setIsSaving(false);
    }
  }, [paramIndex, draftNilai, backendHandlers, param.id, isLocked, setRows, nilaiList]);

  const handleEditNilai = useCallback(() => {
    if (safeActiveIndex >= 0 && currentNilai) {
      const original = nilaiList[safeActiveIndex];
      setOriginalNilai(structuredClone(original));

      setDraftNilai(structuredClone(original));

      setEditModeNilai(true);
    }
  }, [safeActiveIndex, currentNilai, nilaiList]);

  const handleUpdateNilai = useCallback(async () => {
    if (safeActiveIndex === -1) {
      await handleAddNilai();
      return;
    }

    if (!draftNilai || paramIndex === null) {
      return;
    }

    if (!draftNilai.judul?.text?.trim()) {
      alert('Judul indikator tidak boleh kosong!');
      return;
    }

    const bobotNum = Number(draftNilai.bobot);
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      alert('Bobot indikator harus antara 0 dan 100!');
      return;
    }

    setIsSaving(true);

    try {
      if (backendHandlers?.updateNilai && param.id && currentNilai.id && !isLocked) {
        const updateNilaiDto = { ...draftNilai };
        delete updateNilaiDto.id;

        const result = await backendHandlers.updateNilai(param.id, currentNilai.id, updateNilaiDto);

        if (!result.success) {
          throw new Error(result.error || 'Gagal mengupdate nilai ke database');
        }
      } else {
        setRows((prev) =>
          prev.map((row, ri) => {
            if (ri !== paramIndex) return row;

            return {
              ...row,
              nilaiList: (row.nilaiList || []).map((n, ni) => (ni === safeActiveIndex ? draftNilai : n)),
            };
          }),
        );
      }

      setEditModeNilai(false);
      setOriginalNilai(null);
    } catch (error) {
      console.error('Error updating nilai:', error);
      alert(error.message || 'Gagal mengupdate nilai');
    } finally {
      setIsSaving(false);
    }
  }, [safeActiveIndex, draftNilai, paramIndex, handleAddNilai, backendHandlers, isLocked, param.id, currentNilai, setRows]);

  const handleCancelEditNilai = useCallback(() => {
    if (originalNilai) {
      setDraftNilai(originalNilai);

      if (paramIndex !== null && safeActiveIndex >= 0) {
        setRows((prev) =>
          prev.map((row, ri) => {
            if (ri !== paramIndex) return row;

            return {
              ...row,
              nilaiList: (row.nilaiList || []).map((n, ni) => (ni === safeActiveIndex ? originalNilai : n)),
            };
          }),
        );
      }
    } else {
      if (safeActiveIndex >= 0 && hasNilai) {
        setDraftNilai(nilaiList[safeActiveIndex]);
      } else {
        setDraftNilai(createEmptyDraftNilai());
      }
    }

    setEditModeNilai(false);
    setOriginalNilai(null);
  }, [originalNilai, paramIndex, safeActiveIndex, hasNilai, nilaiList, setRows]);

  const handleCopyNilai = useCallback(async () => {
    if (paramIndex === null || !currentNilai || safeActiveIndex === -1) return;

    const copiedNilai = {
      ...structuredClone(currentNilai),
      id: `copy-nilai-${Date.now()}`,
      judul: {
        ...currentNilai.judul,
        text: `${currentNilai.judul?.text || 'Indikator'} (Copy)`,
      },
    };

    setRows((prev) =>
      prev.map((row, ri) =>
        ri === paramIndex
          ? {
              ...row,
              nilaiList: [...(row.nilaiList || []), copiedNilai],
            }
          : row,
      ),
    );

    const newIndex = (nilaiList || []).length;
    setActiveNilaiIndex(newIndex);

    setEditModeNilai(false);
    setOriginalNilai(null);
  }, [paramIndex, currentNilai, safeActiveIndex, setRows, nilaiList]);

  const handleDeleteNilai = useCallback(() => {
    if (paramIndex === null || !currentNilai || safeActiveIndex === -1) return;

    if (onOpenDeleteDialog) {
      onOpenDeleteDialog(currentNilai, safeActiveIndex);
    }
  }, [paramIndex, currentNilai, safeActiveIndex, onOpenDeleteDialog]);

  const handleSelectNilai = (index) => {
    if (!editModeNilai) {
      setActiveNilaiIndex(index);
      setOpenNilaiList(false);
    } else {
      const confirmed = window.confirm('Anda sedang dalam mode edit. Pilih indikator lain akan membatalkan perubahan. Lanjutkan?');

      if (confirmed) {
        setEditModeNilai(false);
        setOriginalNilai(null);
        setActiveNilaiIndex(index);
        setOpenNilaiList(false);
      }
    }
  };

  const handleClearNilaiSelection = useCallback(() => {
    if (editModeNilai) {
      const confirmed = window.confirm('Anda sedang dalam mode edit. Kosongkan pilihan akan membatalkan perubahan. Lanjutkan?');

      if (!confirmed) return;
    }

    setActiveNilaiIndex(-1);
    setEditModeNilai(false);
    setOriginalNilai(null);
    setDraftNilai(createEmptyDraftNilai());
    setOpenNilaiList(false);
  }, [editModeNilai]);

  const isEditDisabled = loading || isLocked || isSaving;
  const isInputDisabled = isEditDisabled || (safeActiveIndex >= 0 && !editModeNilai);

  return (
    <div className="w-full relative">
      {formulaOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-4 space-y-3 text-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg">Atur Rumus</div>
              <Button onClick={() => setFormulaOpen(false)} disabled={loading || isLocked} variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-semibold mb-1">Formula</label>
                <Input value={tempFormula} onChange={(e) => setTempFormula(e.target.value)} placeholder="contoh: pem / pen" className="bg-slate-50 hover:bg-slate-100 text-slate-950 border-slate-300" disabled={loading || isLocked} />
              </div>

              <button
                type="button"
                onClick={() => setTempPercent(!tempPercent)}
                disabled={loading || isLocked}
                className={'flex h-9 w-9 items-center justify-center rounded-md border text-lg font-semibold transition-colors duration-150 border-slate-300 ' + (tempPercent ? 'bg-blue-900 text-white' : 'bg-white text-slate-800')}
              >
                %
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="bg-white text-slate-800 border-slate-300 hover:bg-slate-50" onClick={() => setFormulaOpen(false)} disabled={loading || isLocked}>
                Batal
              </Button>
              <Button className="bg-blue-900 text-white hover:bg-blue-900" onClick={saveFormula} disabled={loading || isLocked}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-gradient-to-r from-blue-700 to-sky-600 text-white px-4 pt-4 pb-3 border-t border-slate-700 flex items-center justify-between gap-4 rounded-t-lg">
        <div className="text-lg font-bold">Indikator Form (Tersinkron dengan Database)</div>

        {isLocked && (
          <div className="text-xs bg-amber-600 text-white px-2 py-1 rounded inline-flex items-center">
            <TriangleAlert className="w-3 h-3 mr-1" />
            Data terkunci - hanya bisa melihat
          </div>
        )}

        {editModeNilai && !isLocked && (
          <div className="text-xs bg-yellow-600 text-white px-2 py-1 rounded inline-flex items-center">
            <TriangleAlert className="w-3 h-3 mr-1" />
            Mode Edit Aktif
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm px-3 border-slate-600" disabled={loading}>
            {showForm ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Sembunyikan
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 " />
                Tampilkan
              </>
            )}
          </Button>

          {safeActiveIndex >= 0 && hasNilai && !editModeNilai && !isLocked && (
            <Button size="icon" onClick={handleEditNilai} className="bg-blue-600 hover:bg-blue-700" disabled={loading || isSaving} title="Edit Indikator">
              <Edit className="w-4 h-4" />
            </Button>
          )}

          {editModeNilai && !isLocked && (
            <Button size="icon" onClick={handleCancelEditNilai} className="bg-gray-600 hover:bg-gray-700" disabled={loading || isSaving} title="Batal Edit">
              <X className="w-4 h-4" />
            </Button>
          )}

          {!isLocked && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700"
                onClick={editModeNilai ? handleUpdateNilai : handleAddNilai}
                title={editModeNilai ? 'Update Indikator' : safeActiveIndex === -1 ? 'Tambah Indikator' : 'Tambah Indikator Baru'}
                disabled={loading || isSaving}
              >
                {editModeNilai ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>

              <Button size="icon" className="h-8 w-8 rounded-full bg-amber-600 hover:bg-amber-700" onClick={handleCopyNilai} disabled={safeActiveIndex === -1 || loading || isSaving} title="Salin Indikator">
                <Copy className="w-4 h-4" />
              </Button>

              <Button size="icon" className="h-8 w-8 rounded-full bg-rose-600 hover:bg-rose-700" onClick={handleDeleteNilai} disabled={safeActiveIndex === -1 || loading || isSaving} title="Hapus Indikator">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="w-full bg-gradient-to-r from-blue-700 to-sky-600 text-white px-4 pb-4 border border-slate-700 space-y-4 rounded-b-lg">
          <div className="w-full bg-slate-200 rounded-lg p-0.5 mt-2" />

          <div className="space-y-2">
            <div className="flex flex-col">
              <label className="font-semibold text-sm ml-1 mb-1 text-slate-200">Pilih Indikator</label>
              <button
                ref={dropdownNilaiBtnRef}
                onClick={() => setOpenNilaiList((v) => !v)}
                className="w-full bg-white text-slate-800 text-sm rounded px-3 py-2 flex justify-between items-center border border-slate-300 hover:bg-slate-50"
                disabled={loading || isSaving}
              >
                <span className="truncate">{safeActiveIndex >= 0 && hasNilai ? formatNilaiLabel(currentNilai, safeActiveIndex) : 'Pilih atau Tambah Indikator Baru'}</span>
                <span>▾</span>
              </button>
            </div>

            {openNilaiList &&
              dropdownNilaiRect &&
              createPortal(
                <div
                  ref={dropdownNilaiListRef}
                  className="fixed bg-white text-slate-800 rounded-md shadow-lg max-h-[220px] overflow-auto z-[9999] border border-slate-200"
                  style={{
                    top: dropdownNilaiRect.top,
                    left: dropdownNilaiRect.left,
                    width: dropdownNilaiRect.width,
                  }}
                >
                  <button
                    onClick={() => {
                      handleClearNilaiSelection();
                      setOpenNilaiList(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 border-b border-slate-200"
                  >
                    ← Kosongkan Pilihan (Buat Baru)
                  </button>

                  {hasNilai &&
                    nilaiList.map((nilai, idx) => (
                      <button key={nilai.id ?? idx} onClick={() => handleSelectNilai(idx)} className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${idx === safeActiveIndex ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}>
                        {formatNilaiLabel(nilai, idx)}
                      </button>
                    ))}
                </div>,
                document.body,
              )}
          </div>

          {(safeActiveIndex >= 0 || safeActiveIndex === -1) && (
            <>
              {!isLocked && (
                <div className="flex justify-end">
                  <Button size="sm" className="bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 border border-slate-300" onClick={openFormula} disabled={loading || isSaving}>
                    Atur Rumus
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-12 gap-4 text-slate-800">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="font-semibold text-sm text-slate-200 ml-1">Nomor</label>
                  <Input
                    className="bg-white text-slate-800 border-slate-300 text-sm"
                    value={draftNilai.nomor ?? ''}
                    onChange={(e) => handleChangeNilaiField('nomor', e.target.value)}
                    disabled={isInputDisabled}
                    placeholder="1.1."
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label className="font-semibold text-sm text-slate-200 ml-1">Bobot</label>
                  <Input
                    className="bg-white text-slate-800 border-slate-300 text-sm"
                    value={draftNilai.bobot ?? ''}
                    onChange={(e) => handleChangeNilaiField('bobot', e.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isInputDisabled}
                    placeholder="max 100%"
                  />
                </div>

                <div className="col-span-8 flex flex-col gap-1">
                  <label className="font-semibold text-sm text-slate-200 ml-1">% dalam Portofolio</label>
                  <Input
                    className="bg-white text-slate-800 border-slate-300 text-sm"
                    value={draftNilai.portofolio ?? ''}
                    onChange={(e) => handleChangeNilaiField('portofolio', e.target.value)}
                    disabled={isInputDisabled}
                    placeholder="masukan % dalam portofolio"
                  />
                </div>
              </div>

              <NilaiJudulInput
                judul={draftNilai.judul}
                onChange={handleChangeJudul}
                onTypeChange={(type) => {
                  const updatedJudul = { ...draftNilai.judul, type };
                  handleChangeJudul(updatedJudul);
                }}
                loading={loading || isSaving}
                editMode={editModeNilai || safeActiveIndex === -1}
                isLocked={isLocked}
              />

              <div className="mt-3">
                <div className="text-sm font-semibold py-2 text-slate-200">Risk Indicator</div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    ['Low', 'low', '#2ECC71'],
                    ['Low To Moderate', 'lowToModerate', '#A3E635'],
                    ['Moderate', 'moderate', '#FACC15'],
                    ['Moderate To High', 'moderateToHigh', '#F97316'],
                    ['High', 'high', '#EF4444'],
                  ].map(([label, key, color]) => (
                    <RiskItem
                      key={key}
                      label={label}
                      color={color}
                      value={draftNilai.riskindikator?.[key] ?? ''}
                      onChange={(v) => handleChangeNilaiField(`riskindikator.${key}`, v)}
                      loading={loading || isSaving}
                      editMode={editModeNilai || safeActiveIndex === -1}
                      isLocked={isLocked}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 text-slate-800">
                <label className="text-slate-200 font-semibold text-sm">Keterangan</label>
                <Textarea
                  className="min-h-[40px] text-sm bg-white border-slate-300"
                  value={draftNilai.keterangan ?? ''}
                  onChange={(e) => handleChangeNilaiField('keterangan', e.target.value)}
                  disabled={isInputDisabled}
                  placeholder="masukan keterangan"
                />
              </div>
            </>
          )}
        </div>
      )}

      {!showForm && hasNilai && <div className="w-full" />}
    </div>
  );
}

function RiskItem({ label, value, onChange, color, loading = false, editMode = false, isLocked = false }) {
  return (
    <div className="rounded-lg px-3 py-3 flex flex-col gap-2 border border-slate-300 shadow-sm" style={{ backgroundColor: color }}>
      <div className="text-sm font-bold uppercase text-black text-center">{label}</div>
      <div className="bg-white/90 rounded border border-slate-300">
        <Textarea
          className="min-h-[60px] text-xs bg-transparent text-slate-800 resize-none text-center p-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || !editMode || isLocked}
          placeholder="masukan angka atau huruf"
        />
      </div>
    </div>
  );
}

function NilaiJudulInput({ judul, onChange, onTypeChange, loading = false, editMode = false, isLocked = false }) {
  const [localJudul, setLocalJudul] = useState(judul);

  useEffect(() => {
    setLocalJudul(judul);
  }, [judul]);

  const updateType = (newType) => {
    if (loading || !editMode || isLocked) return;

    let updated = {
      ...localJudul,
      type: newType,
    };

    if (newType === 'Tanpa Faktor') {
      updated = {
        ...updated,
        value: updated.value ?? null,
        pembilang: '',
        valuePembilang: null,
        penyebut: '',
        valuePenyebut: null,
      };
    }

    if (newType === 'Satu Faktor') {
      updated = {
        ...updated,
        pembilang: updated.pembilang ?? '',
        valuePembilang: updated.valuePembilang ?? null,
        penyebut: '',
        valuePenyebut: null,
      };
    }

    if (newType === 'Dua Faktor') {
      updated = {
        ...updated,
        pembilang: updated.pembilang ?? '',
        valuePembilang: updated.valuePembilang ?? null,
        penyebut: updated.penyebut ?? '',
        valuePenyebut: updated.valuePenyebut ?? null,
      };
    }

    setLocalJudul(updated);
    onChange(updated);

    if (onTypeChange) {
      onTypeChange(newType);
    }
  };

  const updateField = (key, value) => {
    if (loading || !editMode || isLocked) return;

    const updated = {
      ...localJudul,
      [key]: value,
    };

    setLocalJudul(updated);
    onChange(updated);
  };

  if (!localJudul) return null;

  return (
    <div className="space-y-4">
      <div className="flex">
        {['Tanpa Faktor', 'Satu Faktor', 'Dua Faktor'].map((m) => (
          <button
            key={m}
            onClick={() => updateType(m)}
            disabled={loading || !editMode || isLocked}
            className={`
              px-3 py-1 border text-xs transition border-slate-300
              ${localJudul.type === m ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-800'}
              hover:bg-slate-700 hover:text-white
              first:rounded-l last:rounded-r
              ${loading || !editMode || isLocked ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {m === 'Tanpa Faktor' && 'Tanpa Faktor'}
            {m === 'Satu Faktor' && 'Satu Faktor'}
            {m === 'Dua Faktor' && 'Dua Faktor'}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-sm text-slate-200">Judul Indikator</label>
        <Input className="text-slate-800 border-slate-300 bg-white" value={localJudul.text || ''} onChange={(e) => updateField('text', e.target.value)} disabled={loading || !editMode || isLocked} placeholder="masukan judul" />
      </div>

      {localJudul.type === 'Tanpa Faktor' && (
        <div className="space-y-1">
          <label className="font-semibold text-sm text-slate-200">Value</label>
          <Input
            className="text-slate-800 border-slate-300 bg-white"
            value={localJudul.value ?? ''}
            onChange={(e) => updateField('value', e.target.value === '' ? null : e.target.value)}
            disabled={loading || !editMode || isLocked}
            placeholder="masukan value"
          />
        </div>
      )}

      {localJudul.type === 'Satu Faktor' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="font-semibold text-sm text-slate-200">Pembilang</label>
              <Input
                className="text-slate-800 border-slate-300 bg-white"
                value={localJudul.pembilang || ''}
                onChange={(e) => updateField('pembilang', e.target.value)}
                disabled={loading || !editMode || isLocked}
                placeholder="masukan pembilang"
              />
            </div>

            <div className="flex-1 space-y-1">
              <label className="font-semibold text-sm text-slate-200">Value Pembilang</label>
              <Input
                className="text-slate-800 border-slate-300 bg-white"
                value={localJudul.valuePembilang ?? ''}
                onChange={(e) => updateField('valuePembilang', e.target.value === '' ? null : e.target.value)}
                disabled={loading || !editMode || isLocked}
                placeholder="masukan value pembilang"
              />
            </div>
          </div>
        </div>
      )}

      {localJudul.type === 'Dua Faktor' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="font-semibold text-sm text-slate-200">Pembilang</label>
              <Input
                className="text-slate-800 border-slate-300 bg-white"
                value={localJudul.pembilang || ''}
                onChange={(e) => updateField('pembilang', e.target.value)}
                disabled={loading || !editMode || isLocked}
                placeholder="masukan pembilang"
              />
            </div>

            <div className="flex-1 space-y-1">
              <label className="font-semibold text-sm text-slate-200">Value Pembilang</label>
              <Input
                className="text-slate-800 border-slate-300 bg-white"
                value={localJudul.valuePembilang ?? ''}
                onChange={(e) => updateField('valuePembilang', e.target.value === '' ? null : e.target.value)}
                disabled={loading || !editMode || isLocked}
                placeholder="masukan value pembilang"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="font-semibold text-sm text-slate-200">Penyebut</label>
              <Input
                className="text-slate-800 border-slate-300 bg-white"
                value={localJudul.penyebut || ''}
                onChange={(e) => updateField('penyebut', e.target.value)}
                disabled={loading || !editMode || isLocked}
                placeholder="masukan penyebut"
              />
            </div>

            <div className="flex-1 space-y-1">
              <label className="font-semibold text-sm text-slate-200">Value Penyebut</label>
              <Input
                className="text-slate-800 border-slate-300 bg-white"
                value={localJudul.valuePenyebut ?? ''}
                onChange={(e) => updateField('valuePenyebut', e.target.value === '' ? null : e.target.value)}
                disabled={loading || !editMode || isLocked}
                placeholder="masukan value penyebut"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// TableInherent
function TableInherent({ rows = [], activeQuarter }) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const paginationRef = useRef(null);

  const minZoom = 75;
  const maxZoom = 120;
  const stepZoom = 5;
  const pageSize = 7;

  const compareParameterNumbers = (a, b) => {
    const parseNumber = (str) => {
      if (!str) return [0, 0];
      const cleanStr = str.replace(/\.$/, '');
      const parts = cleanStr.split('.').map(Number);
      return [parts[0] || 0, parts[1] || 0];
    };

    const [aMain, aSub] = parseNumber(a.nomor);
    const [bMain, bSub] = parseNumber(b.nomor);

    if (aMain !== bMain) {
      return aMain - bMain;
    }
    return aSub - bSub;
  };

  const sortedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];

    const rowsCopy = [...rows];
    return rowsCopy.sort((a, b) => {
      if (!a.nomor && !b.nomor) return 0;
      if (!a.nomor) return 1;
      if (!b.nomor) return -1;

      return compareParameterNumbers(a, b);
    });
  }, [rows]);

  const getSummaryBgByValue = (total) => {
    if (!Number.isFinite(total)) return '';

    if (total <= 1) return 'bg-green-400 text-black';
    if (total <= 2) return 'bg-lime-300 text-black';
    if (total <= 3) return 'bg-yellow-400 text-black';
    if (total <= 4) return 'bg-orange-400 text-black';
    return 'bg-red-500 text-white';
  };

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  const scrollLeft = () => {
    paginationRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    paginationRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedRows.slice(start, end);
  }, [sortedRows, currentPage]);

  const globalSummary = useMemo(() => {
    const totalWeighted = sortedRows.reduce((sumParam, param) => {
      const nilaiList = Array.isArray(param.nilaiList) ? param.nilaiList : [];
      const derived = nilaiList.map((nv) => computeDerived(nv, param));
      return sumParam + derived.reduce((s, d) => (Number.isFinite(d?.weighted) ? s + d.weighted : s), 0);
    }, 0);

    return {
      totalWeighted,
      summaryBg: getSummaryBgByValue(totalWeighted),
    };
  }, [sortedRows]);

  const handleZoomIn = () => setZoom((z) => Math.min(maxZoom, z + stepZoom));
  const handleZoomOut = () => setZoom((z) => Math.max(minZoom, z - stepZoom));
  const handleSliderChange = (e) => setZoom(Number(e.target.value));
  const handlePageClick = (page) => setCurrentPage(page);

  const rankBgMap = {
    1: 'bg-green-400 text-black',
    2: 'bg-lime-300 text-black',
    3: 'bg-yellow-400 text-black',
    4: 'bg-orange-400 text-black',
    5: 'bg-red-500 text-white',
  };

  const formatPercent = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const n = Number(val);
    if (Number.isNaN(n)) return String(val);

    const percent = Math.abs(n) <= 1 ? n * 100 : n;

    const rounded = Math.abs(percent - Math.round(percent)) < 1e-9 ? Math.round(percent) : percent.toFixed(2);

    return `${rounded}%`;
  };

  if (!Array.isArray(sortedRows) || sortedRows.length === 0) {
    return (
      <div className="flex items-center justify-center border rounded-xl p-8 text-gray-500 bg-gray-50">
        <div className="text-center">
          <FileWarning className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Tidak Ada Data</h3>
          <p className="text-sm">Silakan tambah parameter untuk Quarter {activeQuarter}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 pr-2">
        <div>
          <h1 className="text-2xl font-semibold">Data Rentabilitas Produk - Inherent</h1>
          <div className="text-sm text-gray-600">
            Quarter Aktif: <span className="font-bold bg-blue-100 px-2 py-1 rounded"> Q{String(activeQuarter)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleZoomOut} className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-white text-xl font-bold shadow">
            −
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium mb-1">{zoom}%</span>
            <input type="range" min={minZoom} max={maxZoom} step={stepZoom} value={zoom} onChange={handleSliderChange} className="w-40 accent-slate-700" />
          </div>
          <button type="button" onClick={handleZoomIn} className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-white text-xl font-bold shadow">
            +
          </button>
        </div>
      </div>

      <div className="w-full overflow-auto border shadow">
        <div style={{ zoom: `${zoom}%` }}>
          <table className="min-w-max text-sm table-fixed">
            <thead>
              <tr>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-10">No</th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-16">Bobot</th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-42">Parameter</th>

                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-10">No</th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-64">Nilai</th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-16">Bobot</th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-64">% dalam Portofolio</th>

                <th className="border border-black py-2 bg-[#2ECC71] text-white w-32">Low</th>
                <th className="border border-black py-2 bg-[#A3E635] text-black w-32">Low To Moderate</th>
                <th className="border border-black py-2 bg-[#FACC15] text-black w-32">Moderate</th>
                <th className="border border-black px-2 py-2 bg-[#F97316] text-black w-32">Moderate To High</th>
                <th className="border border-black px-2 py-2 bg-[#FF0000] text-white w-32">High</th>

                <th className="border border-black px-2 py-2 bg-blue-950 text-white w-32">Hasil</th>
                <th className="border border-black px-2 py-2 bg-blue-950 text-white w-32">Peringkat</th>
                <th className="border border-black px-2 py-2 bg-blue-950 text-white w-32">Weighted</th>
                <th className="border border-black px-2 py-2 bg-blue-900 text-white w-64">Keterangan</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((param, pi) => {
                const nilaiList = Array.isArray(param.nilaiList) ? param.nilaiList : [];

                if (nilaiList.length === 0) {
                  return (
                    <tr key={`empty-${pi}`}>
                      <td className="border px-2 py-2 align-top bg-[#E8F5FA]">{param.nomor || '-'}</td>
                      <td className="border px-2 py-2 align-top bg-[#E8F5FA]">{formatPercent(param.bobot)}</td>
                      <td className="border px-2 py-2 align-top bg-[#E8F5FA] break-words max-w-[200px]">{param.judul || '-'}</td>
                      <td colSpan={13} className="border px-2 py-2 text-center text-gray-400 bg-white">
                        Belum ada nilai
                      </td>
                    </tr>
                  );
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

                const derivedByIndex = sortedNilaiList.map((nv) => computeDerived(nv, param));

                const totalRowsForParam = sortedNilaiList.reduce((total, nilai) => {
                  const j = nilai.judul || { type: 'Tanpa Faktor' };
                  if (j.type === 'Satu Faktor') return total + 2;
                  if (j.type === 'Dua Faktor') return total + 3;
                  return total + 1;
                }, 0);

                return sortedNilaiList
                  .map((nilai, ni) => {
                    const derived = derivedByIndex[ni] || {};
                    const { hasilDisplay, hasilRows, peringkat, weightedDisplay } = derived;
                    const j = nilai.judul || { type: 'Tanpa Faktor' };

                    let rowsForThisNilai = 1;
                    if (j.type === 'Satu Faktor') rowsForThisNilai = 2;
                    if (j.type === 'Dua Faktor') rowsForThisNilai = 3;

                    const rows = [];

                    for (let subIndex = 0; subIndex < rowsForThisNilai; subIndex++) {
                      const isFirstRowOfParam = ni === 0 && subIndex === 0;
                      const isMainRow = subIndex === 0;

                      let nilaiText = '-';
                      let hasilText = '-';

                      if (j.type === 'Tanpa Faktor' || subIndex === 0) {
                        nilaiText = j.text ?? '-';
                        hasilText = hasilDisplay || '-';
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

                      rows.push(
                        <tr key={`${param.id}-${nilai.id}-${subIndex}`}>
                          {isFirstRowOfParam && (
                            <>
                              <td rowSpan={totalRowsForParam} className="border px-2 py-2 align-middle bg-[#E8F5FA] text-center">
                                {param.nomor || '-'}
                              </td>
                              <td rowSpan={totalRowsForParam} className="border px-2 py-2 align-middle bg-[#E8F5FA] text-center">
                                {formatPercent(param.bobot)}
                              </td>
                              <td rowSpan={totalRowsForParam} className="border px-2 py-2 align-middle bg-[#E8F5FA] break-words max-w-[200px]">
                                {param.judul || '-'}
                              </td>
                            </>
                          )}

                          <td className={`border px-2 py-2 text-center ${isMainRow ? 'bg-[#E8F5FA]' : 'bg-white'}`}>{isMainRow ? (nilai.nomor ?? '-') : ''}</td>

                          <td className={`border px-2 py-2 ${isMainRow ? 'bg-[#E8F5FA]' : 'bg-white'} break-words max-w-[180px]`}>
                            <div className={isMainRow ? 'text-sm font-semibold' : 'text-xs'}>{nilaiText}</div>
                          </td>

                          <td className={`border px-2 py-2 text-center ${isMainRow ? 'bg-[#E8F5FA]' : 'bg-white'}`}>{isMainRow ? formatPercent(nilai.bobot) : ''}</td>

                          <td className={`border px-2 py-2 text-center ${isMainRow ? 'bg-[#E8F5FA]' : 'bg-white'} break-words max-w-[180px]`}>{isMainRow ? (nilai.portofolio ?? '-') : ''}</td>

                          {['low', 'lowToModerate', 'moderate', 'moderateToHigh', 'high'].map((rk) => (
                            <td key={rk} className={`border px-2 py-2 text-center ${isMainRow ? 'bg-[#D9EAD3]' : 'bg-white'} break-words max-w-[130px]`}>
                              {isMainRow ? (nilai.riskindikator?.[rk] ?? '-') : ''}
                            </td>
                          ))}

                          <td className={`border px-2 py-2 text-center ${isMainRow ? 'bg-white' : 'bg-[#D9EAD3]'} break-words max-w-[130px]`}>
                            <div className={isMainRow ? 'text-sm font-semibold' : 'text-xs'}>{hasilText}</div>
                          </td>

                          {subIndex === 0 ? (
                            <>
                              <td rowSpan={rowsForThisNilai} className={`border px-2 py-2 align-middle text-center font-semibold ${peringkat ? rankBgMap[peringkat] : ''}`}>
                                {Number.isFinite(peringkat) ? peringkat : '-'}
                              </td>
                              <td rowSpan={rowsForThisNilai} className="border px-2 py-2 align-middle text-center bg-white">
                                {weightedDisplay || ''}
                              </td>
                              <td rowSpan={rowsForThisNilai} className="border px-2 py-2 text-center align-middle bg-white break-words max-w-[200px]">
                                {nilai.keterangan ?? ''}
                              </td>
                            </>
                          ) : null}
                        </tr>,
                      );
                    }

                    return rows;
                  })
                  .flat();
              })}

              <tr>
                <td colSpan={12} className="border-0 bg-white"></td>
                <td colSpan={2} className="border border-black px-2 py-2 text-center font-semibold text-white bg-blue-900">
                  Summary
                </td>
                <td className={`border px-2 py-2 text-center font-semibold ${globalSummary.summaryBg}`}>{Number.isFinite(globalSummary.totalWeighted) ? globalSummary.totalWeighted.toFixed(2) : '-'}</td>
                <td className="border-0 bg-white"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex justify-center items-center gap-2">
        {totalPages > 7 && (
          <button type="button" onClick={scrollLeft} className="h-8 w-8 flex items-center justify-center rounded-md border bg-white text-blue-600 font-bold hover:bg-blue-500 hover:text-white">
            <ArrowBigLeftDash />
          </button>
        )}

        <div
          className="max-w-[420px] overflow-x-hidden"
          onWheel={(e) => {
            e.preventDefault();

            const container = paginationRef.current;
            if (container) {
              container.scrollLeft += e.deltaY * 2;
            }
          }}
          style={{ cursor: 'grab' }}
          onMouseEnter={() => {
            document.body.style.overflowY = 'hidden';
          }}
          onMouseLeave={() => {
            document.body.style.overflowY = 'auto';
          }}
        >
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
                    'min-w-8 h-8 px-3 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors duration-150 shrink-0 hover:bg-blue-600 hover:text-white ' +
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
            <ArrowBigRightDash />
          </button>
        )}
      </div>
    </div>
  );
}