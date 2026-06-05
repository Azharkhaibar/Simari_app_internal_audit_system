// src/ojk/pasar-produk/pasar-produk-ojk/pasar-produk.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Header from '../../../../components/ui/header';
import RiskTabs from '../../../../components/ui/risk-tabs';
import PasarProdukInherentWrapper from './pasar-produk-inherent';
import PasarProdukKpmrPage from './pasar-produk-kpmr';
import { useHeaderStore } from '../../../../store/header';
import { exportKpmr } from '../../../../utils/export/export-kpmr';
import useKpmrPasarProduk from '../hook/kpmr/pasar-produk-kpmr.hook';
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

export default function PasarProdukOJK() {
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

  // ========== HOOK KPMR ==========
  const { kpmr, loading: kpmrHookLoading, error: kpmrHookError, loadKpmrByYearQuarter, refreshKpmrData, createKpmr } = useKpmrPasarProduk();

  // ========== EXPORT HANDLER FOR KPMR ==========
  useEffect(() => {
    if (!exportRequestId) return;

    if (activeTab === 'kpmr' && !isKpmrLoading && kpmrRows.length > 0) {
      exportKpmr({
        rows: kpmrRows,
        year,
        quarter: activeQuarter,
        categoryLabel: 'Pasar Produk',
      });
      resetExport();
    } else if (activeTab !== 'inherent') {
      resetExport();
    }
  }, [exportRequestId, activeTab, kpmrRows, isKpmrLoading, year, activeQuarter, resetExport]);

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
        console.log(`📡 [PasarProdukOJK] Loading KPMR for ${year}-Q${targetQuarter}`);

        const data = await loadKpmrByYearQuarter(year, targetQuarter);

        if (cancelled) return;

        if (data) {
          console.log(`✅ [PasarProdukOJK] KPMR loaded: ID ${data.id}`);
          setKpmrId(data.id);
          setKpmrRows(formatKpmrRowsFromBackend(data.aspekList || []));
        } else {
          console.log(`ℹ️ [PasarProdukOJK] KPMR not found`);
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
      console.log(`🆕 [PasarProdukOJK] Creating new KPMR for year ${year}`);
      const targetQuarter = 1;
      const data = await createKpmr(year, targetQuarter);

      if (data) {
        console.log(`✅ [PasarProdukOJK] KPMR created: ID ${data.id}`);
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
      console.error('❌ [PasarProdukOJK] Error creating KPMR:', error);
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
      console.error('❌ [PasarProdukOJK] Error refreshing KPMR:', error);
      return [];
    }
  }, [kpmrId, refreshKpmrData]);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  // ========== KPMR PAGE - STABIL ✅ DITAMBAHKAN onCreateKpmr ==========
  const kpmrPage = useMemo(() => {
    return <PasarProdukKpmrPage key={`kpmr-${year}`} rows={kpmrRows} setRows={setKpmrRows} search={search} kpmrId={kpmrId} onRefreshData={handleKpmrRefresh} onCreateKpmr={createNewKpmr} />;
  }, [kpmrRows, search, kpmrId, year, handleKpmrRefresh, createNewKpmr]);

  // ========== RENDER ==========
  if (!year) {
    return (
      <div className="w-full space-y-4">
        <Header title="Risk Profile – Pasar Produk" />
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
      <Header title="Risk Profile – Pasar Produk" />
      <RiskTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[
          { value: 'inherent', label: 'Inherent Risk' },
          { value: 'kpmr', label: 'KPMR' },
        ]}
      />

      <div className="w-full">
        {activeTab === 'inherent' && <PasarProdukInherentWrapper />}

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