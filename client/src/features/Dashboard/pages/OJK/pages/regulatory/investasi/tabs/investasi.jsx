// src/ojk/investasi-produk/investasi-produk-ojk/investasi.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Header from '../../../../components/ui/header';
import RiskTabs from '../../../../components/ui/risk-tabs';
import InvestasiProdukInherentWrapper from './investasi-inherent';
import InvestasiProdukKpmrPage from './investasi-kpmr';
import { useHeaderStore } from '../../../../store/header';
import { exportInherent } from '../../../../utils/export/export-inherent';
import { exportKpmr } from '../../../../utils/export/export-kpmr';
import useInvestasiProdukIntegration from '../hooks/inherent/investasi.hook';
import useKpmrInvestasi from '../hooks/kpmr/investasi-kpmr.hook';
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

export default function InvestasiOJK() {
  const { year, activeQuarter, search, exportRequestId, resetExport } = useHeaderStore();

  // ========== STATE ==========
  const [activeTab, setActiveTab] = useState('inherent');
  const [kpmrRows, setKpmrRows] = useState([]);
  const [kpmrId, setKpmrId] = useState(null);
  const [isKpmrLoading, setIsKpmrLoading] = useState(false);
  const [kpmrLoadError, setKpmrLoadError] = useState(null);
  const [isCreatingKpmr, setIsCreatingKpmr] = useState(false);
  const [kpmrDataLoaded, setKpmrDataLoaded] = useState(false);
  const [loadedYear, setLoadedYear] = useState(null);

  // ========== REFS ==========
  const isLoadingKpmrRef = useRef(false);

  // ========== HOOK INHERENT ==========
  const {
    rows: inherentRows,
    setRows: setInherentRows,
    isLoading: inherentLoading,
    currentInherentId,
    currentInherentData,
    loadData,
    reloadData,
    handleAddParameter,
    handleUpdateParameter,
    handleCopyParameter,
    handleDeleteParameter,
    handleAddNilai,
    handleUpdateNilai,
    handleCopyNilai,
    handleDeleteNilai,
    formatParameterJudul,
    formatNilaiJudul,
    formatBobot,
    formatKategori,
  } = useInvestasiProdukIntegration(year, activeQuarter);

  // ========== HOOK KPMR ==========
  const { kpmr, loading: kpmrHookLoading, error: kpmrHookError, loadKpmrByYearQuarter, refreshKpmrData, createKpmr } = useKpmrInvestasi();

  // ========== LOAD INHERENT DATA ==========
  useEffect(() => {
    if (!year || !activeQuarter) return;

    let cancelled = false;

    const fetchInherent = async () => {
      console.log(`📡 [InvestasiOJK] Loading inherent for ${year}-Q${activeQuarter}`);

      try {
        await loadData(year, activeQuarter, false);

        if (!cancelled) {
          console.log(`✅ [InvestasiOJK] Inherent loaded for ${year}-Q${activeQuarter}`);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('❌ [InvestasiOJK] Error loading inherent:', err);
        }
      }
    };

    fetchInherent();

    return () => {
      cancelled = true;
    };
  }, [year, activeQuarter]);

  // ========== SYNC KPMR LOADING ==========
  useEffect(() => {
    setIsKpmrLoading(kpmrHookLoading);
  }, [kpmrHookLoading]);

  // ========== SYNC KPMR ERROR ==========
  useEffect(() => {
    if (kpmrHookError) {
      const is404 = kpmrHookError.includes('tidak ditemukan') || kpmrHookError.includes('404');
      if (!is404) {
        setKpmrLoadError(kpmrHookError.message || 'Gagal memuat KPMR');
      } else {
        setKpmrLoadError(null);
      }
    } else {
      setKpmrLoadError(null);
    }
  }, [kpmrHookError]);

  // ========== LOAD KPMR DATA ==========
  useEffect(() => {
    if (!year) return;

    if (loadedYear === year && kpmrDataLoaded) return;

    if (isLoadingKpmrRef.current) return;

    let cancelled = false;

    const loadKpmrData = async () => {
      isLoadingKpmrRef.current = true;
      setIsKpmrLoading(true);
      setKpmrLoadError(null);

      try {
        const targetQuarter = 1;
        console.log(`📡 [InvestasiOJK] Loading KPMR for ${year}-Q${targetQuarter}`);

        const data = await loadKpmrByYearQuarter(year, targetQuarter);

        if (cancelled) return;

        if (data) {
          console.log(`✅ [InvestasiOJK] KPMR loaded: ID ${data.id}`);
          setKpmrId(data.id);
          setKpmrRows(formatKpmrRowsFromBackend(data.aspekList || []));
        } else {
          console.log(`ℹ️ [InvestasiOJK] KPMR not found`);
          setKpmrId(null);
          setKpmrRows([]);
        }

        setKpmrDataLoaded(true);
        setLoadedYear(year);
        setKpmrLoadError(null);
      } catch (error) {
        if (cancelled) return;

        if (error?.response?.status === 404) {
          setKpmrId(null);
          setKpmrRows([]);
          setKpmrDataLoaded(true);
          setLoadedYear(year);
        } else {
          setKpmrLoadError('Gagal memuat data KPMR');
        }
      } finally {
        if (!cancelled) setIsKpmrLoading(false);
        isLoadingKpmrRef.current = false;
      }
    };

    loadKpmrData();

    return () => {
      cancelled = true;
    };
  }, [year]);

  // ========== CREATE NEW KPMR ✅ DITAMBAHKAN KEMBALI ==========
  const createNewKpmr = useCallback(async () => {
    if (!year) return null;
    if (isCreatingKpmr) return null;

    setIsCreatingKpmr(true);

    try {
      console.log(`🆕 [InvestasiOJK] Creating new KPMR for year ${year}`);
      const targetQuarter = 1;
      const data = await createKpmr(year, targetQuarter);

      if (data) {
        console.log(`✅ [InvestasiOJK] KPMR created: ID ${data.id}`);
        setKpmrDataLoaded(true);
        setKpmrLoadError(null);
        setLoadedYear(year);
        setKpmrId(data.id);

        const formattedRows = formatKpmrRowsFromBackend(data.aspekList || []);
        setKpmrRows(formattedRows);

        return data;
      }

      return null;
    } catch (error) {
      console.error('❌ [InvestasiOJK] Error creating KPMR:', error);
      return null;
    } finally {
      setIsCreatingKpmr(false);
    }
  }, [year, createKpmr, isCreatingKpmr]);

  // ========== SYNC KPMR DATA ==========
  useEffect(() => {
    if (!kpmr?.id) return;

    if (kpmrId !== kpmr.id) setKpmrId(kpmr.id);

    const formattedRows = formatKpmrRowsFromBackend(kpmr.aspekList || []);
    if (JSON.stringify(kpmrRows) !== JSON.stringify(formattedRows)) {
      setKpmrRows(formattedRows);
    }
  }, [kpmr]); // eslint-disable-line

  // ========== HANDLERS ==========
  const handleKpmrRefresh = useCallback(async () => {
    if (!kpmrId) return [];
    try {
      const refreshedRows = await refreshKpmrData();
      if (refreshedRows?.length > 0) {
        setKpmrRows(formatKpmrRowsFromBackend(refreshedRows));
      }
      return refreshedRows;
    } catch (error) {
      console.error('❌ [InvestasiOJK] Error refreshing KPMR:', error);
      return [];
    }
  }, [kpmrId, refreshKpmrData]);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  // ========== KPMR PAGE - STABIL ✅ DITAMBAHKAN onCreateKpmr ==========
  const kpmrPage = useMemo(() => {
    return <InvestasiProdukKpmrPage key={`kpmr-${year}`} rows={kpmrRows} setRows={setKpmrRows} search={search} kpmrId={kpmrId} onRefreshData={handleKpmrRefresh} onCreateKpmr={createNewKpmr} />;
  }, [kpmrRows, search, kpmrId, year, handleKpmrRefresh, createNewKpmr]);

  // ========== EXPORT HANDLER ==========
  useEffect(() => {
    if (!exportRequestId) return;

    if (activeTab === 'inherent' && !inherentLoading && inherentRows.length > 0) {
      exportInherent({
        rows: inherentRows,
        year,
        quarter: activeQuarter,
        categoryLabel: 'Investasi',
      });
      resetExport();
    } else if (activeTab === 'kpmr' && !isKpmrLoading && kpmrRows.length > 0) {
      exportKpmr({
        rows: kpmrRows,
        year,
        quarter: activeQuarter,
        categoryLabel: 'Investasi',
      });
      resetExport();
    } else if (!inherentLoading && !isKpmrLoading) {
      resetExport();
    }
  }, [exportRequestId, inherentLoading, isKpmrLoading, activeTab, inherentRows, kpmrRows, year, activeQuarter, resetExport]);

  // ========== RENDER ==========
  if (!year) {
    return (
      <div className="w-full space-y-4">
        <Header title="Risk Profile – Investasi Produk" />
        <RiskTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={[
            { value: 'inherent', label: 'Inherent Risk' },
            { value: 'kpmr', label: 'KPMR' },
          ]}
        />
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-6 rounded-lg">
          <div className="text-lg font-semibold">⚠️ Tahun Tidak Tersedia</div>
          <div className="text-sm">Silakan pilih tahun terlebih dahulu.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Header title="Risk Profile – Investasi Produk" />
      <RiskTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[
          { value: 'inherent', label: 'Inherent Risk' },
          { value: 'kpmr', label: 'KPMR' },
        ]}
      />

      <div className="w-full">
        {activeTab === 'inherent' && (
          <InvestasiProdukInherentWrapper
            rows={inherentRows}
            setRows={setInherentRows}
            search={search}
            active
            backendHandlers={{
              addParameter: handleAddParameter,
              updateParameter: handleUpdateParameter,
              copyParameter: handleCopyParameter,
              deleteParameter: handleDeleteParameter,
              addNilai: handleAddNilai,
              updateNilai: handleUpdateNilai,
              copyNilai: handleCopyNilai,
              deleteNilai: handleDeleteNilai,
              formatParameterJudul,
              formatNilaiJudul,
              formatBobot,
              formatKategori,
              refreshData: reloadData,
            }}
            isLoading={inherentLoading}
            isLocked={currentInherentData?.isLocked}
            currentInherentId={currentInherentId}
            currentInherentData={currentInherentData}
          />
        )}

        {activeTab === 'kpmr' && (
          <div className="w-full">
            {isKpmrLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3">Memuat KPMR...</span>
              </div>
            )}
            {!isKpmrLoading && kpmrPage}
          </div>
        )}
      </div>
    </div>
  );
}
