// src/features/Dashboard/pages/RiskProfile/pages/Repository/risk-profile-repository-ojk.component.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, RefreshCw, XCircle, Eye, FileText, Loader2, Maximize2, Minimize2, ChevronUp, ChevronDown } from 'lucide-react';
import { YearInput, QuarterSelect } from '../components/Inputs';
import useRiskProfileRepositoryOjk from '../hooks/riskprofilerepository-ojk.hook';

// ==================== CONSTANTS ====================
const MODULE_ORDER = ['PASAR', 'LIKUIDITAS', 'OPERASIONAL', 'HUKUM', 'STRATEGIK', 'KEPATUHAN', 'REPUTASI', 'KONSENTRASI', 'KREDIT', 'PERMODALAN', 'RENTABILITAS', 'TATAKELOLA', 'INVESTASI'];
const OJK_MODULES = ['PASAR', 'LIKUIDITAS', 'OPERASIONAL', 'HUKUM', 'STRATEGIK', 'KEPATUHAN', 'REPUTASI', 'KONSENTRASI', 'KREDIT', 'PERMODALAN', 'RENTABILITAS', 'TATAKELOLA', 'INVESTASI'];

const MODULE_COLORS = {
  PASAR: '#795548',
  LIKUIDITAS: '#FF6B6B',
  OPERASIONAL: '#FFA726',
  HUKUM: '#607D8B',
  STRATEGIK: '#9C27B0',
  KEPATUHAN: '#0068B3',
  REPUTASI: '#00A3DA',
  KONSENTRASI: '#E91E63',
  KREDIT: '#3F51B5',
  PERMODALAN: '#FF5722',
  RENTABILITAS: '#CDDC39',
  TATAKELOLA: '#009688',
  INVESTASI: '#33C2B5',
};

const MODULE_NAMES = {
  PASAR: 'Pasar',
  LIKUIDITAS: 'Likuiditas',
  OPERASIONAL: 'Operasional',
  HUKUM: 'Hukum',
  STRATEGIK: 'Strategik',
  KEPATUHAN: 'Kepatuhan',
  REPUTASI: 'Reputasi',
  KONSENTRASI: 'Konsentrasi',
  KREDIT: 'Kredit',
  PERMODALAN: 'Permodalan',
  RENTABILITAS: 'Rentabilitas',
  TATAKELOLA: 'Tatakelola',
  INVESTASI: 'Investasi',
};

// ==================== UTILS ====================
const fmtNumber = (v) => {
  if (v === '' || v == null) return '';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return new Intl.NumberFormat('en-US').format(n);
};

const safeToFixed = (value, decimals = 2) => {
  if (value == null || value === '' || isNaN(Number(value))) return '0.00';
  const num = Number(value);
  if (typeof num !== 'number' || isNaN(num)) return '0.00';
  return num.toFixed(decimals);
};

const formatHasil = (indicator) => {
  if (!indicator) return '';
  if (indicator.mode === 'TEKS') return indicator.hasilText || '';
  if (indicator.hasil !== '' && indicator.hasil != null && !isNaN(Number(indicator.hasil))) {
    const numHasil = Number(indicator.hasil);
    if (indicator.isPercent) return safeToFixed(numHasil * 100, 2) + '%';
    return safeToFixed(numHasil, 4);
  }
  return '';
};

const formatWeighted = (weighted) => {
  if (weighted == null || weighted === '' || isNaN(Number(weighted))) return '';
  return safeToFixed(weighted, 2);
};

// ==================== SUB COMPONENTS ====================

const ModuleBadge = ({ module }) => {
  const color = MODULE_COLORS[module] || '#6B7280';
  const name = MODULE_NAMES[module] || module;
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium text-white inline-flex items-center" style={{ backgroundColor: color }}>
      {name}
    </span>
  );
};

const EmptyState = ({ searchQuery, selectedModules, year, quarter, onResetFilters, onExpandFirst }) => {
  const hasFilters = searchQuery.trim() || selectedModules.length > 0;
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{hasFilters ? 'Data tidak ditemukan' : 'Belum ada data'}</h3>
      <p className="text-gray-600 max-w-sm mx-auto mb-6">
        {hasFilters ? 'Tidak ada data OJK yang sesuai dengan filter atau pencarian Anda.' : `Tidak ada data OJK tersedia untuk periode ${year} ${quarter}.`}
      </p>
      <div className="flex justify-center gap-3">
        {hasFilters && (
          <button onClick={onResetFilters} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Reset Filter</button>
        )}
        {onExpandFirst && (
          <button onClick={onExpandFirst} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2">
            <Maximize2 size={16} />Preview Data Pertama
          </button>
        )}
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Refresh Halaman</button>
      </div>
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, selectedModules, onToggleModule, onSelectAll, onClearAll }) => {
  if (!isOpen) return null;
  const availableModules = OJK_MODULES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Filter Modul OJK</h3>
              <p className="text-sm text-gray-500 mt-1">Pilih modul yang ingin ditampilkan</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={onSelectAll} className="flex-1 px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors flex items-center justify-center gap-2">
                <span>✓</span>Pilih Semua
              </button>
              <button onClick={onClearAll} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <span>✕</span>Hapus Semua
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              {availableModules.map((key) => (
                <button key={key} onClick={() => onToggleModule(key)} className="w-full flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedModules.includes(key) ? 'bg-sky-600 border-sky-600' : 'border-gray-300'}`}>
                      {selectedModules.includes(key) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="font-medium text-gray-900">{MODULE_NAMES[key]}</span>
                  </div>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: MODULE_COLORS[key] }} />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">{selectedModules.length} dari {availableModules.length} modul dipilih</div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button onClick={onClose} className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Terapkan Filter</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleTable = ({ moduleName, moduleData, year, quarter, onViewIndicator, isExpanded = false, onToggleExpand }) => {
  const sections = useMemo(() => {
    const sectionsMap = {};
    moduleData.forEach((item) => {
      const sectionKey = `${item.no}`;
      if (!sectionsMap[sectionKey]) {
        sectionsMap[sectionKey] = {
          id: sectionKey,
          no: item.no,
          bobotSection: item.bobotSection,
          parameter: item.parameter,
          indicators: [],
        };
      }
      sectionsMap[sectionKey].indicators.push(item);
    });
    return Object.values(sectionsMap).sort((a, b) => {
      const parseNo = (no) => {
        if (!no) return 0;
        const parts = no.split('.').map(p => { const n = parseInt(p, 10); return isNaN(n) ? 0 : n; });
        return parts.reduce((acc, p, i) => acc + p / Math.pow(10, i), 0);
      };
      return parseNo(a.no) - parseNo(b.no);
    });
  }, [moduleData]);

  const totalWeighted = useMemo(() => {
    return sections.reduce((total, section) => {
      return total + section.indicators.reduce((sum, ind) => sum + (Number(ind.weighted) || 0), 0);
    }, 0);
  }, [sections]);

  const averageRating = useMemo(() => {
    if (!moduleData.length) return 0;
    return moduleData.reduce((total, item) => total + (Number(item.peringkat) || 0), 0) / moduleData.length;
  }, [moduleData]);

  const totalSections = sections.length;

  return (
    <div className="mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onToggleExpand} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-sky-100 text-sky-600 hover:bg-sky-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: MODULE_COLORS[moduleName] }}>{moduleName.charAt(0)}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{MODULE_NAMES[moduleName]}</h3>
            <p className="text-sm text-gray-600">Periode: {year} {quarter} • {moduleData.length} indikator • {totalSections} section</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Weighted</div>
            <div className="text-xl font-bold" style={{ color: MODULE_COLORS[moduleName] }}>{safeToFixed(totalWeighted, 2)}</div>
          </div>
          <button onClick={onToggleExpand} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isExpanded ? 'bg-sky-100 text-sky-600 hover:bg-sky-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {isExpanded ? <><Minimize2 size={18} /><span className="text-sm font-medium">Collapse</span></> : <><Maximize2 size={18} /><span className="text-sm font-medium">Preview Data</span></>}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="bg-white rounded-2xl shadow overflow-hidden animate-fadeIn">
          <div className="relative h-[350px]">
            <div className="absolute inset-0 overflow-x-auto overflow-y-auto">
              <table className="min-w-[1450px] text-sm border border-gray-300 border-collapse">
                <thead>
                  <tr className="bg-[#0369a1] text-white">
                    <th className="border border-black px-3 py-2 text-left" rowSpan={2} style={{ width: 60 }}>No</th>
                    <th className="border border-black px-3 py-2 text-left" rowSpan={2} style={{ width: 80 }}>Bobot</th>
                    <th className="border border-black px-3 py-2 text-left" colSpan={3}>Parameter atau Indikator</th>
                    <th className="border border-black px-3 py-2 text-center" rowSpan={2} style={{ width: 90 }}>Bobot Indikator</th>
                    <th className="border border-black px-3 py-2 text-left" rowSpan={2} style={{ minWidth: 220 }}>Sumber Risiko</th>
                    <th className="border border-black px-3 py-2 text-left" rowSpan={2} style={{ minWidth: 240 }}>Dampak</th>
                    <th className="border border-black px-3 py-2 bg-[#b7d7a8] text-center text-black" rowSpan={2}>Low</th>
                    <th className="border border-black px-3 py-2 bg-[#c9daf8] text-left text-black" rowSpan={2}>Low to Moderate</th>
                    <th className="border border-black px-3 py-2 bg-[#fff2cc] text-left text-black" rowSpan={2}>Moderate</th>
                    <th className="border border-black px-3 py-2 bg-[#f9cb9c] text-left text-black" rowSpan={2}>Moderate to High</th>
                    <th className="border border-black px-3 py-2 bg-[#e06666] text-center" rowSpan={2}>High</th>
                    <th className="border border-black px-3 py-2 bg-[#0369a1]" rowSpan={2} style={{ width: 100 }}>Hasil</th>
                    <th className="border border-black px-3 py-2 bg-[#0369a1]" rowSpan={2} style={{ width: 70 }}>Peringkat</th>
                    <th className="border border-black px-3 py-2 bg-[#0369a1] text-white" rowSpan={2} style={{ width: 90 }}>Weighted</th>
                    <th className="border border-black px-3 py-2 text-center" rowSpan={2} style={{ width: 80 }}>Aksi</th>
                  </tr>
                  <tr className="bg-[#0369a1] text-white">
                    <th className="border border-black px-3 py-2 text-left" style={{ minWidth: 260 }}>Section</th>
                    <th className="border border-black px-3 py-2 text-left" style={{ width: 70 }}>Sub No</th>
                    <th className="border border-black px-3 py-2 text-left" style={{ minWidth: 360 }}>Indikator</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s) => {
                    const inds = s.indicators || [];
                    if (inds.length === 0) {
                      return (
                        <tr key={s.id} className="bg-[#e9f5e1]">
                          <td className="border px-3 py-3 text-center">{s.no}</td>
                          <td className="border px-3 py-3 text-center">{s.bobotSection}%</td>
                          <td className="border px-3 py-3" colSpan={15}>{s.parameter} – Belum ada indikator</td>
                        </tr>
                      );
                    }

                    const sortedIndicators = [...inds].sort((a, b) => {
                      const parseSubNo = (subNo) => {
                        if (!subNo) return 0;
                        const parts = subNo.split('.').map(p => { const n = parseFloat(p); return isNaN(n) ? 0 : n; });
                        return parts.reduce((acc, p, i) => acc + p / Math.pow(100, i), 0);
                      };
                      return parseSubNo(a.subNo) - parseSubNo(b.subNo);
                    });

                    const sectionRowSpan = sortedIndicators.reduce((sum, it) => {
                      return sum + (it.mode === 'TEKS' ? 1 : it.mode === 'RASIO' ? 3 : 2);
                    }, 0);

                    return (
                      <React.Fragment key={s.id}>
                        {sortedIndicators.map((it, idx) => {
                          const firstOfSection = idx === 0;
                          return (
                            <React.Fragment key={it.id}>
                              <tr>
                                {firstOfSection && (
                                  <>
                                    <td rowSpan={sectionRowSpan} className="border px-3 py-3 align-top bg-[#d9eefb] text-center font-semibold">{s.no}</td>
                                    <td rowSpan={sectionRowSpan} className="border px-3 py-3 align-top bg-[#d9eefb] text-center">{s.bobotSection}%</td>
                                    <td rowSpan={sectionRowSpan} className="border px-3 py-3 align-top bg-[#d9eefb]">{s.parameter}</td>
                                  </>
                                )}
                                <td className="border px-3 py-3 text-center align-top bg-[#d9eefb]">{it.subNo}</td>
                                <td className="border px-3 py-3 align-top bg-[#d9eefb]"><div className="font-medium whitespace-pre-wrap">{it.indikator}</div></td>
                                <td className="border px-3 py-3 text-center align-top bg-[#d9eefb]">{it.bobotIndikator}%</td>
                                <td className="border px-3 py-3 align-top bg-[#d9eefb] whitespace-pre-wrap">{it.sumberRisiko || '-'}</td>
                                <td className="border px-3 py-3 align-top bg-[#d9eefb] whitespace-pre-wrap">{it.dampak || '-'}</td>
                                <td className="border px-3 py-3 text-center bg-green-700/10 whitespace-pre-wrap">{it.low || '-'}</td>
                                <td className="border px-3 py-3 text-center bg-green-700/10 whitespace-pre-wrap">{it.lowToModerate || '-'}</td>
                                <td className="border px-3 py-3 text-center bg-green-700/10 whitespace-pre-wrap">{it.moderate || '-'}</td>
                                <td className="border px-3 py-3 text-center bg-green-700/10 whitespace-pre-wrap">{it.moderateToHigh || '-'}</td>
                                <td className="border px-3 py-3 text-center bg-green-700/10 whitespace-pre-wrap">{it.high || '-'}</td>
                                <td className="border px-3 py-3 text-right bg-gray-400/20 whitespace-pre-wrap">{formatHasil(it)}</td>
                                <td className="border px-3 py-3 text-center"><div className="inline-block rounded bg-yellow-300 px-2">{it.peringkat}</div></td>
                                <td className="border px-3 py-3 text-right bg-gray-400/20">{formatWeighted(it.weighted)}</td>
                                <td className="border px-3 py-3 text-center">
                                  <button onClick={() => onViewIndicator(it)} className="px-2 py-1 rounded border hover:bg-gray-100" title="Lihat Detail"><Eye size={14} /></button>
                                </td>
                              </tr>
                              {it.mode !== 'TEKS' && (
                                <tr className="bg-white">
                                  <td className="border px-3 py-2"></td>
                                  <td className="border px-3 py-2"><div className="text-sm text-gray-700 italic">{it.penyebutLabel || '-'}</div></td>
                                  <td className="border px-3 py-2" colSpan={12}></td>
                                  <td className="border px-3 py-2 bg-[#c6d9a7] text-right">{it.penyebutValue != null ? fmtNumber(it.penyebutValue) : ''}</td>
                                  <td className="border px-3 py-2" colSpan={3}></td>
                                </tr>
                              )}
                              {it.mode === 'RASIO' && (
                                <tr className="bg-white">
                                  <td className="border px-3 py-2"></td>
                                  <td className="border px-3 py-2"><div className="text-sm text-gray-700 italic">{it.pembilangLabel || '-'}</div></td>
                                  <td className="border px-3 py-2" colSpan={12}></td>
                                  <td className="border px-3 py-2 bg-[#c6d9a7] text-right">{it.pembilangValue != null ? fmtNumber(it.pembilangValue) : ''}</td>
                                  <td className="border px-3 py-2" colSpan={3}></td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="border border-gray-400" colSpan={13}></td>
                    <td className="border border-gray-400 text-white font-semibold text-center bg-[#075985]" colSpan={2}>Summary</td>
                    <td className="border border-gray-400 text-white font-semibold text-center bg-[#8fce00]">{safeToFixed(totalWeighted, 2)}</td>
                    <td className="border border-gray-400"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Section</p><p className="text-lg font-bold mt-1">{totalSections}</p></div>
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Indicators</p><p className="text-lg font-bold mt-1">{moduleData.length}</p></div>
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Avg Weighted</p><p className="text-lg font-bold mt-1">{moduleData.length > 0 ? safeToFixed(totalWeighted / moduleData.length, 2) : '0.00'}</p></div>
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Avg Rating</p><p className="text-lg font-bold mt-1">{moduleData.length > 0 ? safeToFixed(averageRating, 1) : '0.0'}</p></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button onClick={onToggleExpand} className="w-full px-4 py-2.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors flex items-center justify-center gap-2">
              <Maximize2 size={16} /><span className="font-medium">Preview Full Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const IndicatorDetailModal = ({ indicator, onClose }) => {
  if (!indicator) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Detail Indikator</h2>
              <div className="flex items-center gap-2 mt-1">
                <ModuleBadge module={indicator.moduleType} />
                <span className="text-sm text-gray-600">{indicator.year} {indicator.quarter} • {indicator.subNo}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-4">
            <div><h3 className="text-sm font-medium text-gray-500 mb-1">Indikator</h3><p className="text-gray-800 font-medium whitespace-pre-wrap">{indicator.indikator}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><h3 className="text-sm font-medium text-gray-500 mb-1">Module</h3><p className="text-gray-800">{MODULE_NAMES[indicator.moduleType]}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500 mb-1">Bobot Indikator</h3><p className="text-gray-800">{indicator.bobotIndikator}%</p></div>
            </div>
            <div><h3 className="text-sm font-medium text-gray-500 mb-1">Sumber Risiko</h3><p className="text-gray-800 whitespace-pre-wrap">{indicator.sumberRisiko || '-'}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500 mb-1">Dampak</h3><p className="text-gray-800 whitespace-pre-wrap">{indicator.dampak || '-'}</p></div>
            <div className="grid grid-cols-3 gap-4">
              <div><h3 className="text-sm font-medium text-gray-500 mb-1">Peringkat</h3><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">{indicator.peringkat}</span></div>
              <div><h3 className="text-sm font-medium text-gray-500 mb-1">Weighted</h3><p className="text-gray-800 font-bold">{formatWeighted(indicator.weighted)}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500 mb-1">Hasil</h3><p className="text-gray-800 font-bold">{formatHasil(indicator)}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export const RiskProfileRepositoryOjk = () => {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewQuarter, setViewQuarter] = useState('Q1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  const { 
    data, loading, error, refresh,
    setYearFilter, setQuarterFilter, setModuleTypesFilter, setSearchFilter, 
    resetFilters, setPageSize 
  } = useRiskProfileRepositoryOjk({
    initialFilters: { year: new Date().getFullYear(), quarter: 'Q1', moduleTypes: OJK_MODULES },
    initialPagination: { page: 1, limit: 100 },
    autoFetch: true,
  });

  const groupedByModule = useMemo(() => {
    const grouped = {};
    const modulesToShow = selectedModules.length > 0 ? selectedModules.filter(m => OJK_MODULES.includes(m)) : [...OJK_MODULES];
    modulesToShow.forEach(m => { grouped[m] = []; });
    let filtered = data || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => (item.indikator && item.indikator.toLowerCase().includes(q)) || (item.subNo && item.subNo.toLowerCase().includes(q)));
    }
    filtered.forEach(item => { if (grouped[item.moduleType]) grouped[item.moduleType].push(item); });
    return grouped;
  }, [data, searchQuery, selectedModules]);

  const totalWeighted = useMemo(() => OJK_MODULES.reduce((t, m) => t + (groupedByModule[m] || []).reduce((s, i) => s + (Number(i.weighted) || 0), 0), 0), [groupedByModule]);
  const modulesWithData = useMemo(() => OJK_MODULES.filter(m => groupedByModule[m] && groupedByModule[m].length > 0), [groupedByModule]);
  const totalIndicators = useMemo(() => OJK_MODULES.reduce((a, m) => a + (groupedByModule[m]?.length || 0), 0), [groupedByModule]);

  const handleYearChange = useCallback((y) => { setViewYear(y); setYearFilter(y); setExpandedModule(null); }, [setYearFilter]);
  const handleQuarterChange = useCallback((q) => { setViewQuarter(q); setQuarterFilter(q); setExpandedModule(null); }, [setQuarterFilter]);
  const handleModuleToggle = useCallback((m) => {
    const next = selectedModules.includes(m) ? selectedModules.filter(x => x !== m) : [...selectedModules, m];
    setSelectedModules(next); setModuleTypesFilter(next.length > 0 ? next : OJK_MODULES); setExpandedModule(null);
  }, [selectedModules, setModuleTypesFilter]);
  const handleSelectAll = useCallback(() => { setSelectedModules([...OJK_MODULES]); setModuleTypesFilter([...OJK_MODULES]); }, [setModuleTypesFilter]);
  const handleClearAll = useCallback(() => { setSelectedModules([]); setModuleTypesFilter(OJK_MODULES); }, [setModuleTypesFilter]);
  const handleSearch = useCallback((q) => { setSearchQuery(q); setSearchFilter(q); setExpandedModule(null); }, [setSearchFilter]);
  const handleToggleExpand = useCallback((m) => { setExpandedModule(p => p === m ? null : m); }, []);
  const handleExpandFirst = useCallback(() => { if (modulesWithData.length > 0) setExpandedModule(modulesWithData[0]); }, [modulesWithData]);
  const handleViewIndicator = useCallback((i) => { setSelectedIndicator(i); }, []);
  const handleRefresh = useCallback(async () => { 
    try { setPageSize(0); await refresh(); } catch (e) { console.error('Refresh failed:', e); } 
  }, [refresh, setPageSize]);

  return (
    <div className="space-y-6">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}.animate-fadeIn{animation:fadeIn .3s ease-out}`}</style>

      {/* HEADER - SKY BLUE */}
      <header className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl"><FileText className="w-6 h-6" /></div>
            <div><h1 className="text-2xl font-bold">OJK Risk Profile Repository</h1><p className="text-sky-100 text-sm">OJK - Data 13 modul risiko (Pasar, Likuiditas, Operasional, Hukum, Strategik, Kepatuhan, Reputasi, Konsentrasi, Kredit, Permodalan, Rentabilitas, Tatakelola, Investasi)</p></div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-sm text-sky-100">Periode Saat Ini</div>
            <div className="text-lg font-bold">{viewYear} {viewQuarter}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1.5 min-w-[120px]"><label className="text-xs font-medium text-white/90">Tahun</label><YearInput value={viewYear} onChange={handleYearChange} disabled={loading} className="bg-white border border-white/30 rounded-lg px-3 py-2 text-gray-900 font-medium text-center w-full" /></div>
            <div className="flex flex-col gap-1.5 min-w-[120px]"><label className="text-xs font-medium text-white/90">Triwulan</label><QuarterSelect value={viewQuarter} onChange={handleQuarterChange} disabled={loading} className="bg-white border border-white/30 rounded-lg px-3 py-2 text-gray-900 font-medium text-center w-full" /></div>
          </div>
          <div className="relative group flex-1 max-w-md">
            <input value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Cari no/sub/indikator/keterangan…" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-white/30 h-[46px]" disabled={loading} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-white/20 border border-white/20 text-white font-semibold hover:bg-white/30 h-[46px] min-w-[120px] justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}<span>Refresh</span>
            </button>
            <button onClick={() => setShowFilterModal(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-sky-500/80 text-white font-semibold hover:bg-sky-600 h-[46px] min-w-[120px] justify-center">
              <Filter className="w-5 h-5" /><span>Filter</span>
            </button>
          </div>
        </div>
      </header>

      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between"><div className="flex items-center gap-2"><XCircle className="w-5 h-5" /><span>{error}</span></div></div>}
      {loading && <div className="p-3 bg-sky-100 border border-sky-400 text-sky-700 rounded flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Memuat data repository...</div>}

      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3"><Filter size={16} className="text-gray-600" /><span className="text-sm font-medium text-gray-700">Filter Modul OJK:</span></div>
          <button onClick={() => setShowFilterModal(true)} className="text-sm text-sky-600 hover:text-sky-800">Buka Filter Modal</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {OJK_MODULES.map(key => (
            <button key={key} onClick={() => handleModuleToggle(key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedModules.includes(key) ? 'text-white ring-2 ring-offset-1' : 'bg-white text-gray-700 border hover:bg-gray-50'}`} style={selectedModules.includes(key) ? { backgroundColor: MODULE_COLORS[key] } : {}} disabled={loading}>
              {MODULE_NAMES[key]}{selectedModules.includes(key) && <span className="ml-1">✓</span>}
            </button>
          ))}
          {selectedModules.length > 0 && <button onClick={handleClearAll} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border text-gray-600 hover:bg-gray-50" disabled={loading}>Clear All</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Modul</p><p className="text-2xl font-bold mt-1">{modulesWithData.length}</p></div><div className="text-sky-600 bg-sky-50 p-2 rounded-lg">📊</div></div></div>
        <div className="bg-white border rounded-xl p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Indikator</p><p className="text-2xl font-bold mt-1">{totalIndicators}</p></div><div className="text-green-600 bg-green-50 p-2 rounded-lg">📈</div></div></div>
        <div className="bg-white border rounded-xl p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Weighted</p><p className="text-2xl font-bold mt-1">{safeToFixed(totalWeighted, 2)}</p></div><div className="text-purple-600 bg-purple-50 p-2 rounded-lg">⚖️</div></div></div>
        <div className="bg-white border rounded-xl p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Periode</p><p className="text-2xl font-bold mt-1">{viewYear} {viewQuarter}</p></div><div className="text-orange-600 bg-orange-50 p-2 rounded-lg">📅</div></div></div>
      </div>

      {expandedModule && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2"><Maximize2 size={16} className="text-sky-600" /><span className="text-sky-800 font-medium">Preview: <span className="font-bold" style={{ color: MODULE_COLORS[expandedModule] }}>{MODULE_NAMES[expandedModule]}</span></span></div>
          <button onClick={() => setExpandedModule(null)} className="text-sky-600 hover:text-sky-800 text-sm font-medium">Close Preview</button>
        </div>
      )}

      <section className="space-y-6">
        {!loading && totalIndicators === 0 ? (
          <EmptyState searchQuery={searchQuery} selectedModules={selectedModules} year={viewYear} quarter={viewQuarter} onResetFilters={resetFilters} onExpandFirst={handleExpandFirst} />
        ) : (
          modulesWithData.map(moduleName => (
            <ModuleTable key={moduleName} moduleName={moduleName} moduleData={groupedByModule[moduleName]} year={viewYear} quarter={viewQuarter} onViewIndicator={handleViewIndicator} isExpanded={expandedModule === moduleName} onToggleExpand={() => handleToggleExpand(moduleName)} />
          ))
        )}
      </section>

      <FilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} selectedModules={selectedModules} onToggleModule={handleModuleToggle} onSelectAll={handleSelectAll} onClearAll={handleClearAll} />
      <IndicatorDetailModal indicator={selectedIndicator} onClose={() => setSelectedIndicator(null)} />
    </div>
  );
};

export default RiskProfileRepositoryOjk;