import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Header from '../../../../components/ui/header';
import RiskTabs from '../../../../components/ui/risk-tabs';
import KepatuhanInherent from './kepatuhan-inherent';
import KepatuhanKpmrPage from './kepatuhan-kpmr';
import { useHeaderStore } from '../../../../store/header';
import { exportKpmr } from '../../../../utils/export/export-kpmr';
import useKpmrKepatuhan from '../hooks/kpmr/kepatuhan-kpmr.hook';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ========== FORMAT KPMR ROWS ==========
const formatKpmrRowsFromBackend = (aspekList = []) => {
  if (!Array.isArray(aspekList)) return [];

  return aspekList.map((aspek) => ({
    id: aspek.id?.toString() || '',
    nomor: aspek.nomor || '',
    judul: aspek.judul || '',
    bobot: aspek.bobot?.toString().replace('.00', '') || '0',
    deskripsi: aspek.deskripsi || '',
    orderIndex: aspek.orderIndex || 0,
    averageScore: aspek.averageScore,
    rating: aspek.rating,
    updatedBy: aspek.updatedBy,
    notes: aspek.notes,
    pertanyaanList: Array.isArray(aspek.pertanyaanList)
      ? aspek.pertanyaanList.map((q) => ({
          id: q.id?.toString() || '',
          nomor: q.nomor || '',
          pertanyaan: q.pertanyaan || '',
          skor: q.skor || { Q1: undefined, Q2: undefined, Q3: undefined, Q4: undefined },
          indicator: q.indicator || {
            strong: '',
            satisfactory: '',
            fair: '',
            marginal: '',
            unsatisfactory: '',
          },
          evidence: q.evidence || '',
          catatan: q.catatan || '',
          orderIndex: q.orderIndex || 0,
        }))
      : [],
  }));
};

export default function KepatuhanOJK() {
  const { year, activeQuarter, search, exportRequestId, resetExport } = useHeaderStore();

  // ========== STATE MANAGEMENT ==========
  const [activeTab, setActiveTab] = useState('inherent');
  const [kpmrRows, setKpmrRows] = useState([]);
  const [kpmrId, setKpmrId] = useState(null);
  const [isKpmrLoading, setIsKpmrLoading] = useState(false);
  const [kpmrLoadError, setKpmrLoadError] = useState(null);
  const [isCreatingKpmr, setIsCreatingKpmr] = useState(false);

  // ✅ SATU SOURCE OF TRUTH: Data KPMR per TAHUN
  const [kpmrDataLoaded, setKpmrDataLoaded] = useState(false);

  // ✅ Track tahun yang sudah dimuat (bukan quarter)
  const [loadedYear, setLoadedYear] = useState(null);

  // ========== REFS ==========
  const isLoadingKpmrRef = useRef(false);
  const createKpmrAttemptedRef = useRef(false);

  // ========== HOOK KPMR ==========
  const { kpmr, loading: kpmrHookLoading, error: kpmrHookError, loadKpmrByYearQuarter, refreshKpmrData, createKpmr } = useKpmrKepatuhan();

  // ========== SYNC HOOK LOADING STATE ==========
  useEffect(() => {
    setIsKpmrLoading(kpmrHookLoading);
  }, [kpmrHookLoading]);

  // ========== SYNC HOOK ERROR ==========
  useEffect(() => {
    if (kpmrHookError) {
      const is404 = kpmrHookError.includes('tidak ditemukan') || kpmrHookError.includes('404');
      if (!is404) {
        console.error('❌ KPMR Hook Error:', kpmrHookError);
        setKpmrLoadError(kpmrHookError.message || 'Gagal memuat KPMR');
      } else {
        setKpmrLoadError(null);
      }
    } else {
      setKpmrLoadError(null);
    }
  }, [kpmrHookError]);

  // ========== FUNGSI UNTUK MEMBUAT KPMR BARU ==========
  const createNewKpmr = useCallback(async () => {
    if (!year) return null;
    if (isCreatingKpmr) return null;
    if (createKpmrAttemptedRef.current) return null;

    setIsCreatingKpmr(true);
    createKpmrAttemptedRef.current = true;

    try {
      console.log(`🆕 [Kepatuhan] Creating new KPMR for year ${year}`);

      // Gunakan quarter 1 untuk create
      const targetQuarter = 1;
      const data = await createKpmr(year, targetQuarter);

      if (data) {
        console.log(`✅ [Kepatuhan] KPMR created: ID ${data.id}`);
        setKpmrDataLoaded(true);
        setKpmrLoadError(null);
        setLoadedYear(year);
        setKpmrId(data.id);

        // Format rows
        const formattedRows = formatKpmrRowsFromBackend(data.aspekList || []);
        setKpmrRows(formattedRows);

        return data;
      }

      return null;
    } catch (error) {
      console.error('❌ [Kepatuhan] Error creating KPMR:', error);
      return null;
    } finally {
      setIsCreatingKpmr(false);
    }
  }, [year, createKpmr]);

  // ========== LOAD KPMR DATA ==========
  useEffect(() => {
    if (!year) return;

    // ✅ CEK: Jika tahun sama dan sudah dimuat, JANGAN LOAD ULANG
    if (loadedYear === year && kpmrDataLoaded) {
      console.log(`✅ [Kepatuhan] Data untuk tahun ${year} sudah dimuat, skip reload`);
      return;
    }

    // Cegah concurrent loading
    if (isLoadingKpmrRef.current) return;

    const loadKpmrData = async () => {
      isLoadingKpmrRef.current = true;
      setIsKpmrLoading(true);
      setKpmrLoadError(null);

      try {
        const targetQuarter = 1;
        console.log(`📡 [Kepatuhan] Loading KPMR for year ${year} Q${targetQuarter}`);

        const data = await loadKpmrByYearQuarter(year, targetQuarter);

        if (data) {
          console.log(`✅ [Kepatuhan] KPMR loaded: ID ${data.id}`);
          setKpmrDataLoaded(true);
          setKpmrLoadError(null);
          setLoadedYear(year);
          setKpmrId(data.id);

          const formattedRows = formatKpmrRowsFromBackend(data.aspekList || []);
          setKpmrRows(formattedRows);
        } else {
          console.log(`ℹ️ [Kepatuhan] KPMR not found for year ${year}`);
          setKpmrRows([]);
          setKpmrId(null);
          setKpmrDataLoaded(true);
          setLoadedYear(year);
          setKpmrLoadError(null);
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          console.log(`ℹ️ [Kepatuhan] KPMR not found for year ${year} (404)`);
          setKpmrRows([]);
          setKpmrId(null);
          setKpmrDataLoaded(true);
          setLoadedYear(year);
          setKpmrLoadError(null);
        } else {
          console.error('❌ [Kepatuhan] KPMR load error:', error);
          setKpmrLoadError('Gagal memuat data KPMR. Silakan coba lagi.');
          setKpmrRows([]);
          setKpmrId(null);
          setKpmrDataLoaded(true);
        }
      } finally {
        setIsKpmrLoading(false);
        isLoadingKpmrRef.current = false;
      }
    };

    loadKpmrData();

    // ✅ DEPENDENCY: HANYA year yang berubah
  }, [year]);

  // ========== SYNC KPMR DATA DARI HOOK ==========
  useEffect(() => {
    if (!kpmr?.id) return;

    // ✅ CEK: Jika ID sama dan rows sudah sesuai, JANGAN update
    if (kpmrId === kpmr.id) {
      const formattedRows = formatKpmrRowsFromBackend(kpmr.aspekList || []);
      const currentRowsJson = JSON.stringify(kpmrRows);
      const newRowsJson = JSON.stringify(formattedRows);

      if (currentRowsJson === newRowsJson) {
        return; // ✅ Tidak ada perubahan, skip
      }
    }

    // Update ID jika berbeda
    if (kpmrId !== kpmr.id) {
      console.log(`🆔 [Kepatuhan] kpmrId berubah: ${kpmrId} -> ${kpmr.id}`);
      setKpmrId(kpmr.id);
    }

    // Update rows
    const formattedRows = formatKpmrRowsFromBackend(kpmr.aspekList || []);
    setKpmrRows(formattedRows);
  }, [kpmr]);

  // ========== HANDLE REFRESH ==========
  const handleKpmrRefresh = useCallback(async () => {
    if (!kpmrId) {
      console.log('⚠️ [Kepatuhan] Cannot refresh: kpmrId is null');
      return [];
    }

    console.log('🔄 [Kepatuhan] handleKpmrRefresh dipanggil');
    try {
      const refreshedRows = await refreshKpmrData();
      if (refreshedRows && refreshedRows.length > 0) {
        setKpmrRows(formatKpmrRowsFromBackend(refreshedRows));
      }
      return refreshedRows;
    } catch (error) {
      console.error('❌ [Kepatuhan] Error refreshing:', error);
      return [];
    }
  }, [kpmrId, refreshKpmrData]);

  // ========== STABILKAN KPMR PAGE ==========
  const kpmrPage = useMemo(() => {
    console.log(`🏗️ [Kepatuhan] Membangun KPMR Page untuk tahun ${year} dengan ID: ${kpmrId || 'null'}`);

    return <KepatuhanKpmrPage key={`kpmr-page-${year}`} rows={kpmrRows} setRows={setKpmrRows} search={search} kpmrId={kpmrId} onRefreshData={handleKpmrRefresh} onCreateKpmr={createNewKpmr} />;
  }, [kpmrRows, search, kpmrId, year, handleKpmrRefresh, createNewKpmr]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // ========== EXPORT HANDLER FOR KPMR ==========
  useEffect(() => {
    if (!exportRequestId) return;

    if (activeTab === 'kpmr') {
      if (!isKpmrLoading && kpmrRows.length > 0) {
        exportKpmr({
          rows: kpmrRows,
          year,
          quarter: activeQuarter,
          categoryLabel: 'Kepatuhan',
        });
      }
      resetExport();
    }
  }, [exportRequestId, activeTab, kpmrRows, isKpmrLoading, year, activeQuarter, resetExport]);

  if (!year) {
    return (
      <div className="w-full space-y-4">
        <Header title="Risk Profile – Kepatuhan" />
        <RiskTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={[
            { value: 'inherent', label: 'Inherent Risk' },
            { value: 'kpmr', label: 'KPMR' },
          ]}
        />
        <div className="w-full">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-lg font-semibold">⚠️ Tahun Tidak Tersedia</div>
            </div>
            <div className="text-sm">Silakan pilih tahun terlebih dahulu.</div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'kpmr' && isKpmrLoading && loadedYear !== year) {
    return (
      <div className="w-full space-y-4">
        <Header title="Risk Profile – Kepatuhan" />
        <RiskTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={[
            { value: 'inherent', label: 'Inherent Risk' },
            { value: 'kpmr', label: 'KPMR' },
          ]}
        />
        <div className="w-full">
          <div className="bg-blue-700 text-white px-4 py-8 rounded-lg border border-slate-700">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <div className="text-lg font-semibold">Memuat Data KPMR...</div>
              <div className="text-sm text-blue-200">Tahun {year}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'kpmr' && kpmrLoadError) {
    return (
      <div className="w-full space-y-4">
        <Header title="Risk Profile – Kepatuhan" />
        <RiskTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={[
            { value: 'inherent', label: 'Inherent Risk' },
            { value: 'kpmr', label: 'KPMR' },
          ]}
        />
        <div className="w-full">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-lg font-semibold">❌ Gagal Memuat KPMR</div>
            </div>
            <div className="text-sm mb-4">{kpmrLoadError}</div>
            <Button
              onClick={() => {
                setKpmrDataLoaded(false);
                setKpmrLoadError(null);
                setLoadedYear(null);
              }}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Header title="Risk Profile – Kepatuhan" />

      <RiskTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[
          { value: 'inherent', label: 'Inherent Risk' },
          { value: 'kpmr', label: 'KPMR' },
        ]}
      />

      <div className="w-full">
        {activeTab === 'inherent' && <KepatuhanInherent />}

        {activeTab === 'kpmr' && (
          <div className="w-full">
            {/* INFO BANNER */}
            {kpmrId && kpmrRows.length > 0 && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">✅ KPMR Dimuat</div>
                </div>
                <div className="text-sm mt-1">
                  KPMR tahun {year} berhasil dimuat dengan {kpmrRows.length} aspek.
                </div>
              </div>
            )}

            {kpmrId && kpmrRows.length === 0 && !kpmrLoadError && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">ℹ️ Data KPMR Kosong</div>
                </div>
                <div className="text-sm mt-1">KPMR tahun {year} sudah dibuat, tapi belum ada aspek. Silakan tambahkan aspek menggunakan panel di bawah.</div>
              </div>
            )}

            {!kpmrId && !kpmrLoadError && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">🆕 KPMR Belum Dibuat</div>
                </div>
                <div className="text-sm mt-1">KPMR untuk tahun {year} belum dibuat. KPMR akan otomatis dibuat saat Anda menambahkan aspek pertama.</div>
              </div>
            )}

            {/* KPMR PAGE */}
            {kpmrPage}
          </div>
        )}
      </div>
    </div>
  );
}

