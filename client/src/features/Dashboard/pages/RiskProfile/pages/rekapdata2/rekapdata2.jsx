// RekapData2.jsx
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Download, Trash2 } from 'lucide-react';
import { useRekapData2State, useRekapData2Tahunan, useRekapData2Dashboard, useRekapData2Filters, useUpdateRow, useImportExcel, useCleanupDuplicates } from './hooks/rekapdata2.hook';
import {
  RekapData2Header,
  RekapData2FilterPills,
  RekapData2SectionFilter,
  RekapData2QuarterFilter,
  RekapData2TriwulanTable,
  RekapData2TahunanTable,
  RekapData2ExportDialog,
  HeaderWithFilter,
  SummaryCard,
  RiskTable,
  RiskMatrix,
  AlertBox,
} from './components/rekapdata2.component';
import { RISK_SOURCES, PNM_BRAND, QUARTER_LABEL, normalizeRow, makeRowKey, RISK_LABEL, QUARTER_ORDER } from './utils/rekapdata2.utils';

// Helper skor ke level
const skorToLevel = (skor) => {
  if (skor < 1.5) return 1;
  if (skor < 2.5) return 2;
  if (skor < 3.5) return 3;
  if (skor < 4.5) return 4;
  return 5;
};

// Label untuk KPMR
const kpmrLabel = (level) => {
  if (!level || level === 0) return '-';
  if (level === 1) return 'Strong';
  if (level === 2) return 'Satisfactory';
  if (level === 3) return 'Fair';
  if (level === 4) return 'Marginal';
  return 'Unsatisfactory';
};

export default function RekapData2() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState('Q4');
  const [viewMode, setViewMode] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('triwulan');
  const fileInputRef = useRef(null);

  // API Hooks
  const rowsState = useRekapData2State(year, quarter);
  const { tahunanData, loading: tahunanLoading } = useRekapData2Tahunan(year);
  const { dashboardData, loading: dashboardLoading, refresh: refreshDashboard } = useRekapData2Dashboard(year, quarter);
  const filters = useRekapData2Filters();
  const { updateRow } = useUpdateRow();
  const { importExcel, importing } = useImportExcel();
  const { cleanupDuplicates } = useCleanupDuplicates();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormatOptions, setExportFormatOptions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rekapData2ExportFormat');
      return saved ? JSON.parse(saved) : { hasilFormat: 'smart', pemisahFormat: 'indonesia' };
    }
    return { hasilFormat: 'smart', pemisahFormat: 'indonesia' };
  });

  const periodeLabel = `${QUARTER_LABEL[quarter] || ''} ${year}`;

  const { investasiRows, pasarRows, likuiditasRows, operasionalRows, hukumRows, stratejikRows, kepatuhanRows, reputasiRows, loading, error } = rowsState;

  // ===================== AUTO REFRESH DASHBOARD =====================
  useEffect(() => {
    if (year && quarter) {
      refreshDashboard();
    }
  }, [year, quarter, refreshDashboard]);

  // ===================== HANDLE UPDATE VALUE =====================
  const handleChangeValue = useCallback(
    async (rowKey, field, value) => {
      try {
        const parts = rowKey.split('|');
        const source = parts[0];

        console.log('📝 Updating row:', { source, year, quarter, rowKey, field, value });

        await updateRow(source, year, quarter, rowKey, field, value);

        // Refresh data detail
        await rowsState.refresh();
        // Refresh data dashboard
        await refreshDashboard();
      } catch (err) {
        console.error('❌ Failed to update row:', err);
        alert('Gagal menyimpan perubahan: ' + err.message);
      }
    },
    [year, quarter, updateRow, rowsState, refreshDashboard],
  );

  // ===================== HANDLE IMPORT =====================
  const handleImport = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const result = await importExcel(file, year, quarter);
        alert(`Berhasil mengimpor ${result.totalImported} baris data`);
        await rowsState.refresh();
        await refreshDashboard();
      } catch (err) {
        console.error('Import failed:', err);
        alert('Gagal mengimpor file: ' + err.message);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [year, quarter, importExcel, rowsState, refreshDashboard],
  );

  // ===================== HANDLE CLEANUP =====================
  const handleCleanup = useCallback(async () => {
    if (!confirm('Hapus data duplikat untuk periode ini?')) return;

    try {
      const result = await cleanupDuplicates(year, quarter);
      alert(`Berhasil menghapus ${result.removed} data duplikat`);
      await rowsState.refresh();
      await refreshDashboard();
    } catch (err) {
      console.error('Cleanup failed:', err);
      alert('Gagal membersihkan duplikat: ' + err.message);
    }
  }, [year, quarter, cleanupDuplicates, rowsState, refreshDashboard]);

  // ===================== HANDLE EXPORT =====================
  const handleExport = () => setExportDialogOpen(true);

  const handleImportClick = () => fileInputRef.current?.click();

  // ===================== DATA UNTUK DETAIL VIEW =====================
  const combinedGroups = useMemo(() => {
    let list = [
      ...investasiRows.map((r) => normalizeRow(r, 'INVESTASI', year, quarter)),
      ...pasarRows.map((r) => normalizeRow(r, 'PASAR', year, quarter)),
      ...likuiditasRows.map((r) => normalizeRow(r, 'LIKUIDITAS', year, quarter)),
      ...operasionalRows.map((r) => normalizeRow(r, 'OPERASIONAL', year, quarter)),
      ...hukumRows.map((r) => normalizeRow(r, 'HUKUM', year, quarter)),
      ...stratejikRows.map((r) => normalizeRow(r, 'STRATEJIK', year, quarter)),
      ...kepatuhanRows.map((r) => normalizeRow(r, 'KEPATUHAN', year, quarter)),
      ...reputasiRows.map((r) => normalizeRow(r, 'REPUTASI', year, quarter)),
    ];

    list = list.filter((row) => row.year === year && row.quarter === quarter);

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      list = list.filter((r) => (r.sectionLabel || '').toLowerCase().includes(q) || (r.indikator || '').toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (a.source !== b.source) return a.source.localeCompare(b.source);
      const n = String(a.no || '').localeCompare(String(b.no || ''), undefined, { numeric: true });
      if (n !== 0) return n;
      return String(a.subNo || '').localeCompare(String(b.subNo || ''), undefined, { numeric: true });
    });

    return list.map((row) => ({
      id: makeRowKey({ ...row, source: row.source }),
      source: row.source,
      no: row.no,
      sectionName: row.sectionLabel,
      indikatorLabel: row.indikator,
      mainRow: row,
    }));
  }, [investasiRows, pasarRows, likuiditasRows, operasionalRows, hukumRows, stratejikRows, kepatuhanRows, reputasiRows, year, quarter, filters.query]);

  const visibleGroups = useMemo(() => {
    return combinedGroups.filter((g) => filters.selectedSources.includes(g.source)).filter((g) => !filters.selectedSections[g.source]?.length || filters.selectedSections[g.source].includes(g.sectionName));
  }, [combinedGroups, filters.selectedSources, filters.selectedSections]);

  const sectionOptionsBySource = useMemo(() => {
    const map = {};
    combinedGroups.forEach((g) => {
      if (!filters.selectedSources.includes(g.source)) return;
      map[g.source] = map[g.source] || new Set();
      map[g.source].add(g.sectionName);
    });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Array.from(v)]));
  }, [combinedGroups, filters.selectedSources]);

  // ===================== DATA TAHUNAN =====================
  const annualGroups = useMemo(() => {
    if (activeTab !== 'tahunan') return [];

    const allRows = [
      ...tahunanData.investasiRows,
      ...tahunanData.pasarRows,
      ...tahunanData.likuiditasRows,
      ...tahunanData.operasionalRows,
      ...tahunanData.hukumRows,
      ...tahunanData.stratejikRows,
      ...tahunanData.kepatuhanRows,
      ...tahunanData.reputasiRows,
    ];

    const grouped = {};
    allRows.forEach((row) => {
      const key = `${row.source}|${row.sectionLabel}|${row.indikator}|${row.no}|${row.subNo}`;
      if (!grouped[key]) {
        grouped[key] = {
          source: row.source,
          sectionName: row.sectionLabel,
          indikatorLabel: row.indikator,
          no: row.no,
          subNo: row.subNo,
          quarters: {},
        };
      }
      grouped[key].quarters[row.quarter] = row;
    });

    let list = Object.values(grouped);

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      list = list.filter((g) => (g.sectionName || '').toLowerCase().includes(q) || (g.indikatorLabel || '').toLowerCase().includes(q));
    }

    list = list.filter((g) => filters.selectedSources.includes(g.source));
    list = list.filter((g) => !filters.selectedSections[g.source]?.length || filters.selectedSections[g.source].includes(g.sectionName));

    return list;
  }, [tahunanData, activeTab, filters.query, filters.selectedSources, filters.selectedSections]);

  // ===================== LOADING STATE =====================
  const isLoading = loading || dashboardLoading || (activeTab === 'tahunan' && tahunanLoading);

  if (isLoading) {
    return (
      <div className="p-6 bg-[#f3f6f8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // ===================== ERROR STATE =====================
  if (error) {
    return (
      <div className="p-6 bg-[#f3f6f8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={rowsState.refresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ===================== RENDER =====================
  return (
    <div className="p-6 bg-[#f3f6f8] min-h-screen font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📊 Dashboard
          </button>
          <button onClick={() => setViewMode('detail')} className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'detail' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
            📋 Detail Data
          </button>
        </div>
      </div>

      {/* ===================== DASHBOARD VIEW ===================== */}
      {viewMode === 'dashboard' && (
        <>
          <HeaderWithFilter title="Rekap Data 2" subtitle="Profil Risiko Perusahaan" year={year} setYear={setYear} quarter={quarter} setQuarter={setQuarter} />

          <div className="flex justify-end mb-4">
            <button
              onClick={handleExport}
              disabled={dashboardData.isEmpty}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md ${
                dashboardData.isEmpty ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>

          {dashboardData.isEmpty && <AlertBox title="Data Belum Tersedia" message="Data Rekap 1 belum tersedia untuk periode ini. Nilai ditampilkan sebagai default." type="warning" />}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              <div className="min-h-[400px]">
                <RiskTable data={dashboardData.rows} skorProfil={dashboardData.skorProfil} quarter={quarter} year={year} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard
                  title="Inherent Risk"
                  score={dashboardData.skorProfil.inherent}
                  level={dashboardData.skorProfil.inherent}
                  label={RISK_LABEL[dashboardData.skorProfil.inherent] || '-'}
                  icon={<Shield className="h-5 w-5" />}
                />
                <SummaryCard title="KPMR" score={dashboardData.skorProfil.kpmr} level={dashboardData.skorProfil.kpmr} label={kpmrLabel(dashboardData.skorProfil.kpmr)} icon={<ShieldCheck className="h-5 w-5" />} />
                <SummaryCard title="Net Risk" score={dashboardData.skorProfil.net} level={dashboardData.skorProfil.net} label={RISK_LABEL[dashboardData.skorProfil.net] || '-'} icon={<ShieldAlert className="h-5 w-5" />} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              <RiskMatrix inherentLevel={dashboardData.skorProfil.inherent} kpmrLevel={dashboardData.skorProfil.kpmr} showLegend={false} className="h-full" />

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[#1e3a8a] text-white px-5 py-3">
                  <h3 className="text-sm font-bold tracking-tight uppercase">Risk Level Legend</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 bg-[#2e7d32] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-black text-lg">1</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 bg-[#92D050] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-black text-lg">2</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">Low to Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 bg-[#ffff00] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-gray-800 font-black text-lg">3</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 bg-[#ffc000] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-gray-900 font-black text-lg">4</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">Moderate to High</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <div className="w-12 h-8 bg-[#ff0000] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-black text-lg">5</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================== DETAIL VIEW ===================== */}
      {viewMode === 'detail' && (
        <>
          <div className={`relative rounded-2xl overflow-hidden mb-6 shadow-sm ${PNM_BRAND.gradient}`}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
            <div className="relative px-6 py-7">
              <h1 className="text-2xl font-extrabold text-white">Rekap Data 2</h1>
              <p className="mt-1 text-white/90 text-sm">Rekap Data Profil Risiko 2 - Detail View</p>
            </div>
          </div>

          <div className="mb-6">
            <nav className="flex space-x-8">
              <button onClick={() => setActiveTab('triwulan')} className={`py-3 px-1 border-b-2 font-medium ${activeTab === 'triwulan' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}>
                Triwulan
              </button>
              <button onClick={() => setActiveTab('tahunan')} className={`py-3 px-1 border-b-2 font-medium ${activeTab === 'tahunan' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}>
                Tahunan
              </button>
            </nav>
          </div>

          <RekapData2Header
            year={year}
            setYear={setYear}
            quarter={quarter}
            setQuarter={setQuarter}
            query={filters.query}
            setQuery={filters.setQuery}
            onExport={handleExport}
            onImport={handleImportClick}
            importing={importing}
            mode={activeTab}
            onCleanup={activeTab === 'triwulan' ? handleCleanup : undefined}
          />

          <RekapData2FilterPills selectedSources={filters.selectedSources} onToggleSource={filters.toggleSource} periodeLabel={periodeLabel} sources={RISK_SOURCES} />

          {activeTab === 'triwulan' && (
            <RekapData2SectionFilter
              sectionOptionsBySource={sectionOptionsBySource}
              selectedSections={filters.selectedSections}
              onToggleSection={filters.toggleSection}
              sectionFilterOpen={filters.sectionFilterOpen}
              setSectionFilterOpen={filters.setSectionFilterOpen}
              onResetSections={filters.resetSections}
            />
          )}

          {activeTab === 'tahunan' && <RekapData2QuarterFilter selectedQuarters={filters.selectedQuarters} onToggleQuarter={filters.toggleQuarter} />}

          {activeTab === 'triwulan' ? (
            <RekapData2TriwulanTable visibleGroups={visibleGroups} year={year} quarter={quarter} periodeLabel={periodeLabel} handleChangeValue={handleChangeValue} />
          ) : (
            <RekapData2TahunanTable annualGroups={annualGroups} year={year} filters={filters} />
          )}

          {exportDialogOpen && <RekapData2ExportDialog options={exportFormatOptions} setOptions={setExportFormatOptions} onConfirm={() => setExportDialogOpen(false)} onCancel={() => setExportDialogOpen(false)} />}

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
        </>
      )}
    </div>
  );
}
