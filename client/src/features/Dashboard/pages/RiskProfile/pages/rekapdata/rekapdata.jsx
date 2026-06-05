// rekapdata.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';

// Hooks
import { useRekapDataState, useRekapDataFilters, useRekapDataPersist } from './hooks/rekap-data.hook';

// Components
import { RekapDataHeader, RekapDataFilterPills, RekapDataSectionFilter, RekapDataQuarterFilter, RekapDataTriwulanTable, RekapDataTahunanTable, RekapDataExportDialog } from './components/rekap-data.components';

// Utils
import { RISK_SOURCES, PNM_BRAND, QUARTER_LABEL, makeRowKey, computeHasilFromValues, normalizeRow } from './utils/rekap-data.utils';

// External utils
import { calculatePeringkat, calculatePeringkatFromText, isNumericRiskLevels } from './utils/riskcalculator';

import { exportRekapDataToExcel } from './utils/exportrekapdata';

export default function RekapData() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState('Q4');
  const [activeTab, setActiveTab] = useState('triwulan');
  const fileInputRef = useRef(null);

  // State from API
  const rowsState = useRekapDataState(year, quarter, activeTab);
  const filters = useRekapDataFilters();
  const { reloadSections, updateRowAPI, importExcelAPI, cleanupDuplicatesAPI, saving } = useRekapDataPersist(rowsState.setters, rowsState.refresh);

  // Export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormatOptions, setExportFormatOptions] = useState(() => {
    // Export format tetap pakai localStorage karena hanya UI preference
    const saved = localStorage.getItem('rekapDataExportFormat');
    return saved ? JSON.parse(saved) : { hasilFormat: 'smart', pemisahFormat: 'indonesia' };
  });

  // Import state
  const [importing, setImporting] = useState(false);

  const periodeLabel = `${QUARTER_LABEL[quarter] || ''} ${year}`;

  // Destructure rows
  const { investasiRows, pasarRows, likuiditasRows, operasionalRows, hukumRows, stratejikRows, kepatuhanRows, reputasiRows, operasionalSections, hukumSections, stratejikSections, kepatuhanSections, reputasiSections, loading, error } =
    rowsState;

  // Combined Groups
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

    const seen = new Map();
    list = list.filter((row) => {
      const key = `${row.source}-${row.sectionLabel}-${row.indikator}`;
      if (seen.has(key)) {
        const existing = seen.get(key);
        const existingScore = (existing.numeratorValue ? 2 : 0) + (existing.denominatorValue ? 1 : 0);
        const currentScore = (row.numeratorValue ? 2 : 0) + (row.denominatorValue ? 1 : 0);
        if (currentScore > existingScore) {
          seen.set(key, row);
          return true;
        }
        return false;
      }
      seen.set(key, row);
      return true;
    });

    list = Array.from(seen.values());

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

  // Annual Groups
  const annualGroups = useMemo(() => {
    const normalizeAll = (r, source) => normalizeRow(r, source, year, quarter);

    let allData = [
      ...investasiRows.map((r) => normalizeAll(r, 'INVESTASI')),
      ...pasarRows.map((r) => normalizeAll(r, 'PASAR')),
      ...likuiditasRows.map((r) => normalizeAll(r, 'LIKUIDITAS')),
      ...operasionalRows.map((r) => normalizeAll(r, 'OPERASIONAL')),
      ...hukumRows.map((r) => normalizeAll(r, 'HUKUM')),
      ...stratejikRows.map((r) => normalizeAll(r, 'STRATEJIK')),
      ...kepatuhanRows.map((r) => normalizeAll(r, 'KEPATUHAN')),
      ...reputasiRows.map((r) => normalizeAll(r, 'REPUTASI')),
    ];

    allData = allData.filter((row) => row.year === year);

    const indicatorMap = {};
    allData.forEach((row) => {
      const key = `${row.source}|${row.sectionLabel}|${row.indikator}|${row.no}|${row.subNo}`;
      if (!indicatorMap[key]) {
        indicatorMap[key] = {
          source: row.source,
          sectionName: row.sectionLabel,
          indikatorLabel: row.indikator,
          no: row.no,
          subNo: row.subNo,
          quarters: {},
        };
      }
      indicatorMap[key].quarters[row.quarter] = row;
    });

    let result = Object.values(indicatorMap);
    result = result.filter((item) => filters.selectedSources.includes(item.source));
    result = result.filter((item) => !filters.selectedSections[item.source]?.length || filters.selectedSections[item.source].includes(item.sectionName));

    result.sort((a, b) => {
      if (a.source !== b.source) return RISK_SOURCES.indexOf(a.source) - RISK_SOURCES.indexOf(b.source);
      const noCompare = String(a.no || '').localeCompare(String(b.no || ''), undefined, { numeric: true });
      if (noCompare !== 0) return noCompare;
      return String(a.subNo || '').localeCompare(String(b.subNo || ''), undefined, { numeric: true });
    });

    return result;
  }, [investasiRows, pasarRows, likuiditasRows, operasionalRows, hukumRows, stratejikRows, kepatuhanRows, reputasiRows, year, filters.selectedSources, filters.selectedSections]);

  // Visible Groups
  const visibleGroups = useMemo(() => {
    return combinedGroups.filter((g) => filters.selectedSources.includes(g.source)).filter((g) => !filters.selectedSections[g.source]?.length || filters.selectedSections[g.source].includes(g.sectionName));
  }, [combinedGroups, filters.selectedSources, filters.selectedSections]);

  // Section Options
  const sectionOptionsBySource = useMemo(() => {
    const map = {};
    combinedGroups.forEach((g) => {
      if (!filters.selectedSources.includes(g.source)) return;
      map[g.source] = map[g.source] || new Set();
      map[g.source].add(g.sectionName);
    });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Array.from(v)]));
  }, [combinedGroups, filters.selectedSources]);

  // Handle Change Value (VIA API)
  const handleChangeValue = async (rowKey, field, raw) => {
    const parts = rowKey.split('|');
    const [src] = parts;

    const isPasar = src === 'PASAR';
    const isLikuiditas = src === 'LIKUIDITAS';
    const isOperasional = src === 'OPERASIONAL';
    const isHukum = src === 'HUKUM';
    const isStratejik = src === 'STRATEJIK';
    const isKepatuhan = src === 'KEPATUHAN';
    const isReputasi = src === 'REPUTASI';

    const sourceKey = isPasar ? 'PASAR' : isLikuiditas ? 'LIKUIDITAS' : isOperasional ? 'OPERASIONAL' : isHukum ? 'HUKUM' : isStratejik ? 'STRATEJIK' : isKepatuhan ? 'KEPATUHAN' : isReputasi ? 'REPUTASI' : 'INVESTASI';

    try {
      // Optimistic update
      const setter = rowsState.setters[sourceKey];
      if (setter) {
        setter((prev) => {
          return prev.map((r) => {
            const candidateKey = makeRowKey({ ...r, source: sourceKey });
            if (candidateKey !== rowKey) return r;

            const updatedRow = { ...r, [field]: raw };
            if (field === 'numeratorValue') updatedRow.pembilangValue = raw;
            if (field === 'denominatorValue') updatedRow.penyebutValue = raw;

            if (field === 'hasilText' && updatedRow.mode === 'TEKS') {
              const riskLevels = {
                low: updatedRow.low || '',
                lowToModerate: updatedRow.lowToModerate || '',
                moderate: updatedRow.moderate || '',
                moderateToHigh: updatedRow.moderateToHigh || '',
                high: updatedRow.high || '',
              };
              updatedRow.peringkat = isNumericRiskLevels(riskLevels) ? calculatePeringkat(parseFloat(raw) / 100, riskLevels, true) : calculatePeringkatFromText(raw, riskLevels);
            }

            const hasilBaru = computeHasilFromValues({
              ...updatedRow,
              numeratorValue: updatedRow.numeratorValue ?? updatedRow.pembilangValue,
              denominatorValue: updatedRow.denominatorValue ?? updatedRow.penyebutValue,
            });

            const newPeringkat =
              updatedRow.mode === 'TEKS'
                ? updatedRow.peringkat
                : calculatePeringkat(
                    hasilBaru,
                    {
                      low: updatedRow.low || '',
                      lowToModerate: updatedRow.lowToModerate || '',
                      moderate: updatedRow.moderate || '',
                      moderateToHigh: updatedRow.moderateToHigh || '',
                      high: updatedRow.high || '',
                    },
                    updatedRow.isPercent || false,
                  );

            return { ...updatedRow, hasil: hasilBaru === '' ? '' : hasilBaru, peringkat: newPeringkat };
          });
        });
      }

      // Send to API
      await updateRowAPI(sourceKey, rowKey, field, raw, year, quarter);
    } catch (err) {
      console.error('Error updating row:', err);
      alert('Gagal menyimpan perubahan, me-refresh data...');
      rowsState.refresh();
    }
  };

  // Reload on year/quarter change
  useEffect(() => {
    reloadSections();
  }, [year, quarter, reloadSections]);

  // Export handlers
  const handleExport = () => setExportDialogOpen(true);
  const handleExportConfirm = () => {
    const dataToExport =
      activeTab === 'tahunan'
        ? annualGroups
        : visibleGroups.map((g) => ({
            ...g,
            quarters: { [g.mainRow?.quarter]: g.mainRow },
            mainRow: g.mainRow || {},
            mode: g.mainRow?.mode || 'RASIO',
          }));
    exportRekapDataToExcel(dataToExport, year, quarter, activeTab, exportFormatOptions, filters.selectedQuarters);
    setExportDialogOpen(false);
  };

  // Import handlers (VIA API)
  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importExcelAPI(file, year, quarter);
      alert(`✅ Berhasil mengimpor ${result.totalImported} data!`);
    } catch (err) {
      console.error('Import error:', err);
      alert(`❌ Error: ${err.message || 'Gagal mengimpor file Excel.'}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Cleanup duplicates (VIA API)
  const handleCleanup = async () => {
    if (!confirm('Hapus semua data duplikat dari database?')) return;

    try {
      const result = await cleanupDuplicatesAPI(year, quarter);
      alert(`✅ Cleanup selesai! ${result.removed} duplikat dihapus.`);
    } catch (err) {
      console.error('Cleanup error:', err);
      alert(`❌ Error: ${err.message || 'Gagal membersihkan duplikat.'}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-[#f3f6f8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  return (
    <div className="p-6 bg-[#f3f6f8] min-h-screen font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      <div className={`relative rounded-2xl overflow-hidden mb-6 shadow-sm ${PNM_BRAND.gradient}`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
        <div className="relative px-6 py-7">
          <h1 className="text-2xl font-extrabold text-white">Rekap Data</h1>
          <p className="mt-1 text-white/90 text-sm">Rekap Data Profil Risiko</p>
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

      <RekapDataHeader
        year={year}
        setYear={setYear}
        quarter={quarter}
        setQuarter={setQuarter}
        query={filters.query}
        setQuery={filters.setQuery}
        onExport={handleExport}
        onImport={handleImportClick}
        importing={importing || saving}
        mode={activeTab}
        onCleanup={handleCleanup}
      />

      <RekapDataFilterPills selectedSources={filters.selectedSources} onToggleSource={filters.toggleSource} periodeLabel={periodeLabel} sources={RISK_SOURCES} />

      {activeTab === 'triwulan' && (
        <RekapDataSectionFilter
          sectionOptionsBySource={sectionOptionsBySource}
          selectedSections={filters.selectedSections}
          onToggleSection={filters.toggleSection}
          sectionFilterOpen={filters.sectionFilterOpen}
          setSectionFilterOpen={filters.setSectionFilterOpen}
          onResetSections={filters.resetSections}
        />
      )}

      {activeTab === 'tahunan' && <RekapDataQuarterFilter selectedQuarters={filters.selectedQuarters} onToggleQuarter={filters.toggleQuarter} />}

      {activeTab === 'triwulan' ? (
        <RekapDataTriwulanTable visibleGroups={visibleGroups} year={year} quarter={quarter} periodeLabel={periodeLabel} handleChangeValue={handleChangeValue} />
      ) : (
        <RekapDataTahunanTable annualGroups={annualGroups} year={year} filters={filters} handleChangeValue={handleChangeValue} />
      )}

      {exportDialogOpen && <RekapDataExportDialog options={exportFormatOptions} setOptions={setExportFormatOptions} onConfirm={handleExportConfirm} onCancel={() => setExportDialogOpen(false)} />}

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportFile} style={{ display: 'none' }} />
    </div>
  );
}
