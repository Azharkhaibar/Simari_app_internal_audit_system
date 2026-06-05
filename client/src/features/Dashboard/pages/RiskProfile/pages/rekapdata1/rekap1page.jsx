// rekap1page.jsx (BUKAN .tsx)
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Download, Calendar } from 'lucide-react';
import { exportRekap1ToExcel } from '../hukum/utils/exportrekap1';
import { useBhzConfig, useBvtConfig, useRiskData, useCalculations, useEventListeners, useSaveRekapResult } from './hooks/rekapdata1.hook';
import { getCurrentQuarter, getCurrentYear, fmt, getColorBySkor, getKualitasLabel, getKualitasInherenLabel, getPeringkatLabel } from './utils/utils';
import { BADGE_BASE_CLASS, BADGE_DOT_CLASS } from './constants/constants';

export default function Rekap1Page() {
  const [year, setYear] = useState(getCurrentYear());
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [openA, setOpenA] = useState(true);
  const [openB, setOpenB] = useState(true);
  const [openC, setOpenC] = useState(true);

  // Hooks
  const { bobot, bobotErrors, handleBobotChange, loading: bhzLoading } = useBhzConfig(year, quarter);
  const { bvt, setBvtField, loading: bvtLoading } = useBvtConfig(year, quarter);
  const riskData = useRiskData(year, quarter, refreshCounter);
  const { saveResult } = useSaveRekapResult();

  // Pisahkan summaries dan kpmrData - TANPA TYPE ANNOTATION
  const summaries = {};
  const kpmrData = {};
  Object.keys(riskData).forEach((key) => {
    if (key.endsWith('Summary')) {
      summaries[key] = riskData[key];
    } else if (key.startsWith('loadKPMR')) {
      kpmrData[key] = riskData[key];
    }
  });

  const calculations = useCalculations(summaries, kpmrData, bvt, bobot);

  useEventListeners(setRefreshCounter);

  const hasInitialized = useRef(false);

  // Auto-load latest period dari data yang ada hanya saat inisialisasi pertama kali
  useEffect(() => {
    if (hasInitialized.current) return;
    const summaryData = riskData['investasiSummary'];
    if (summaryData && summaryData.length > 0) {
      const last = summaryData[summaryData.length - 1];
      if (last.year && last.quarter) {
        setYear(last.year);
        setQuarter(last.quarter);
        hasInitialized.current = true;
      }
    }
  }, [riskData]);

  // Save result to API
  useEffect(() => {
    if (!bhzLoading && !bvtLoading && calculations.riskRows.length > 0) {
      saveResult(year, quarter, calculations.peringkatKompositA, calculations.peringkatKompositB, calculations.totalPeringkat, calculations.riskRows, calculations.riskRowsKPMR, calculations.skorInheren, calculations.skorKPMR);
    }
  }, [year, quarter, calculations, saveResult, bhzLoading, bvtLoading]);

  const handleExportExcel = () => {
    exportRekap1ToExcel(calculations.riskRows, calculations.riskRowsKPMR, calculations.peringkatKompositA, calculations.peringkatKompositB, calculations.totalPeringkat, year, quarter);
  };

  const kompositAColor = getColorBySkor(calculations.peringkatKompositA);
  const kompositBColor = getColorBySkor(calculations.peringkatKompositB);
  const kompositTotalColor = getColorBySkor(calculations.totalPeringkat);

  const isLoading = bhzLoading || bvtLoading || riskData.loading;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="relative rounded-xl overflow-hidden mb-4 shadow-sm bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
        <div className="relative px-4 py-5 sm:px-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">Rekap 1</h1>
            <p className="mt-1 text-white/90 text-xs">Risiko Inheren, KPMR & Peringkat Risiko</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 transition-all duration-200 group">
              <Download className="w-4 h-4 text-white opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-semibold">Export</span>
            </button>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <Calendar className="w-4 h-4 text-white opacity-90" />
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-20 bg-transparent text-white placeholder-white/60 text-sm font-semibold focus:outline-none" />
              <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer">
                <option className="text-slate-900" value="Q1">
                  Q1
                </option>
                <option className="text-slate-900" value="Q2">
                  Q2
                </option>
                <option className="text-slate-900" value="Q3">
                  Q3
                </option>
                <option className="text-slate-900" value="Q4">
                  Q4
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error / Loading State */}
      {riskData.error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{riskData.error}</div>}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <span className="ml-3 text-slate-600">Memuat data...</span>
        </div>
      )}

      {/* TABLE - hanya tampil jika tidak loading */}
      {!isLoading && !riskData.error && (
        <div className="rounded-xl bg-white shadow-lg overflow-hidden backdrop-blur-sm">
          <div
            className="px-6 py-4 font-semibold text-white flex justify-between items-center cursor-pointer bg-gradient-to-r from-sky-700 via-sky-800 to-sky-900 hover:from-sky-600 hover:to-sky-800 transition-all duration-300 shadow-md"
            onClick={() => {
              setOpenA(!openA);
              setOpenB(!openB);
              setOpenC(!openC);
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg tracking-wide">Tabel Risiko</span>
              <span className="text-sm opacity-90 font-medium">Risiko Inheren • KPMR • Peringkat</span>
            </div>
            {openA ? <ChevronDown size={20} className="transition-transform" /> : <ChevronRight size={20} className="transition-transform" />}
          </div>

          {(openA || openB || openC) && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                    <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-left font-bold text-sm uppercase tracking-wider">Jenis Risiko</th>
                    <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">BVT</th>
                    <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">BHz</th>
                    <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">Risiko Inheren</th>
                    <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">KPMR</th>
                    <th className="text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">Peringkat Risiko</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.riskRows.map((row, idx) => {
                    const label = row.label.toLowerCase();
                    const kpmrValue = calculations.riskRowsKPMR.find((r) => r.label === row.label)?.skor || 0;
                    const peringkatValue = (row.skor + kpmrValue) / 2;
                    const colorInheren = getColorBySkor(row.skor);
                    const colorKPMR = getColorBySkor(kpmrValue);
                    const colorPeringkat = getColorBySkor(peringkatValue);
                    const isLastRow = idx === calculations.riskRows.length - 1;

                    return (
                      <tr key={idx} className={`${row.summary > 0 ? 'hover:bg-slate-100/70 transition-all duration-200' : 'opacity-40'} ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} ${!isLastRow ? 'border-b border-slate-200' : ''}`}>
                        <td className="border-r border-slate-200 px-6 py-5">
                          <div className="text-slate-900 font-bold text-lg leading-snug min-h-[3rem] flex items-center">{row.label}</div>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4 text-center">
                          <div className="relative">
                            <input
                              type="number"
                              value={row.bvt}
                              onChange={(e) => setBvtField(label, Number(e.target.value || 0))}
                              className="w-20 border-0 border-b-2 border-slate-200 bg-transparent px-2 py-1 text-center font-medium text-slate-700 focus:outline-none focus:border-sky-500 focus:bg-sky-50/50 transition-all duration-200"
                              disabled={row.summary === 0}
                            />
                            <span className="absolute right-2 top-1.5 text-slate-400 text-xs font-medium">%</span>
                          </div>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4 text-center">
                          <div className="relative">
                            <input
                              type="number"
                              value={row.bobot}
                              onChange={(e) => handleBobotChange(label, e.target.value)}
                              className={`w-20 border-0 border-b-2 px-2 py-1 text-center font-medium bg-transparent focus:outline-none transition-all duration-200 ${bobotErrors[label] ? 'border-b-red-500 focus:border-red-600 focus:bg-red-50/50' : 'border-b-slate-200 focus:border-sky-500 focus:bg-sky-50/50'}`}
                            />
                            <span className="absolute right-2 top-1.5 text-slate-400 text-xs font-medium">%</span>
                            {bobotErrors[label] && <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-600 text-center whitespace-nowrap">{bobotErrors[label]}</div>}
                          </div>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-lg font-semibold text-slate-800">{fmt(row.skor)}</span>
                            <span className={`${BADGE_BASE_CLASS} ${colorInheren.bg} ${colorInheren.text}`}>
                              <span className={`${BADGE_DOT_CLASS} ${colorInheren.bg}`} />
                              <span className="leading-none text-center">{getKualitasInherenLabel(row.skor)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-lg font-semibold text-slate-800">{fmt(kpmrValue)}</span>
                            <span className={`${BADGE_BASE_CLASS} ${colorKPMR.bg} ${colorKPMR.text}`}>
                              <span className={`${BADGE_DOT_CLASS} ${colorKPMR.bg}`} />
                              <span className="leading-none text-center">{getKualitasLabel(kpmrValue)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-lg font-semibold text-slate-800">{fmt(peringkatValue)}</span>
                            <span className={`${BADGE_BASE_CLASS} ${colorPeringkat.bg} ${colorPeringkat.text}`}>
                              <span className={`${BADGE_DOT_CLASS} ${colorPeringkat.bg}`} />
                              <span className="leading-none text-center">{getPeringkatLabel(peringkatValue)}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* COMPOSITE ROW */}
                  <tr className="relative backdrop-blur-[16px] backdrop-saturate-180 bg-[rgba(190,190,190,0.75)] rounded-[12px] border border-[rgba(209,213,219,0.3)] shadow-lg border-t-2 border-slate-300 my-4">
                    <td className="border-r border-slate-200/60 px-5 py-4 font-bold text-slate-900 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold">Komposit</span>
                      </div>
                    </td>
                    <td className="border-r border-slate-200/60 px-5 py-4 text-center">
                      <span className="text-slate-600/80 font-medium text-lg">—</span>
                    </td>
                    <td className="border-r border-slate-200/60 px-5 py-4 text-center">
                      <span className="text-slate-600/80 font-medium text-lg">—</span>
                    </td>
                    <td className="border-r border-slate-200/60 px-5 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 backdrop-blur-[4px] bg-white/30 px-4 py-1 rounded-lg border border-white/40">{fmt(calculations.peringkatKompositA)}</span>
                        <span className={`${BADGE_BASE_CLASS} ${kompositAColor.bg} ${kompositAColor.text} backdrop-blur-[8px] backdrop-saturate-150 border border-white/40 bg-gradient-to-b from-white/20 to-transparent shadow-lg`}>
                          <span className={`${BADGE_DOT_CLASS} ${kompositAColor.bg} backdrop-blur-[4px]`} />
                          <span className="leading-none text-center font-semibold">{getKualitasInherenLabel(calculations.peringkatKompositA)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="border-r border-slate-200/60 px-5 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 backdrop-blur-[4px] bg-white/30 px-4 py-1 rounded-lg border border-white/40">{fmt(calculations.peringkatKompositB)}</span>
                        <span className={`${BADGE_BASE_CLASS} ${kompositBColor.bg} ${kompositBColor.text}`}>
                          <span className={`${BADGE_DOT_CLASS} ${kompositBColor.bg} backdrop-blur-[4px]`} />
                          <span className="leading-none text-center font-semibold">{getKualitasLabel(calculations.peringkatKompositB)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="border-r border-slate-200/60 px-5 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 backdrop-blur-[4px] bg-white/30 px-4 py-1 rounded-lg border border-white/40">{fmt(calculations.totalPeringkat)}</span>
                        <span className={`${BADGE_BASE_CLASS} ${kompositTotalColor.bg} ${kompositTotalColor.text}`}>
                          <span className={`${BADGE_DOT_CLASS} ${kompositTotalColor.bg} backdrop-blur-[4px]`} />
                          <span className="leading-none text-center font-semibold">Peringkat {kompositTotalColor.level}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
