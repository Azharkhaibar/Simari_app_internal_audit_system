// components/rekap-data2.components.jsx
import React, { useEffect } from 'react';
import { Search, ChevronDown, Download, Upload, Shield, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import {
  SOURCE_ORDER,
  QUARTER_ORDER,
  QUARTER_LABEL,
  fmtNumber,
  fmtInputNumber,
  normalizeHasilDisplay,
  makeRowKey,
  makeStableKey,
  calculateTotalRowsForSource,
  calculateTotalRowsForSection,
  RISK_LABEL,
  getRiskStyle,
} from '../utils/rekapdata2.utils';

// ===================== YearSelect =====================
export const YearSelect = ({ value, onChange }) => <input type="number" className="w-24 rounded-xl px-3 py-2 border text-sm" value={value} onChange={(e) => onChange(Number(e.target.value || new Date().getFullYear()))} />;

// ===================== QuarterSelect =====================
export const QuarterSelect = ({ value, onChange }) => (
  <select className="rounded-xl px-3 py-2 border text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="Q1">Q1 (Jan–Mar)</option>
    <option value="Q2">Q2 (Apr–Jun)</option>
    <option value="Q3">Q3 (Jul–Sep)</option>
    <option value="Q4">Q4 (Okt–Des)</option>
  </select>
);

// ===================== HeaderWithFilter =====================
export const HeaderWithFilter = ({ title, subtitle, year, setYear, quarter, setQuarter }) => {
  const periodLabel = `${QUARTER_LABEL[quarter]}-${String(year).slice(2)}`;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6 shadow-sm bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
      <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">{title}</h1>
          <p className="mt-1 text-white/90 text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <YearSelect value={year} onChange={setYear} />
            <QuarterSelect value={quarter} onChange={setQuarter} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== SummaryCard =====================
export const SummaryCard = ({ title, score, level, label, icon }) => {
  const riskStyle = getRiskStyle(level);
  const displayScore = score && score !== 0 ? fmtNumber(score) : '-';
  const displayLevel = level && level !== 0 ? `Level ${level}` : 'Level -';

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${riskStyle.bg} bg-opacity-20`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{displayScore}</p>
          <p className="text-sm text-gray-500 mt-1">{displayLevel}</p>
        </div>
        <div className={`px-3 py-1 rounded-full ${riskStyle.bg} ${riskStyle.text} text-xs font-semibold`}>{label || '-'}</div>
      </div>
    </div>
  );
};

// ===================== RiskTable =====================
export const RiskTable = ({ data, skorProfil, quarter, year }) => {
  const periodLabel = `${QUARTER_LABEL[quarter]}-${String(year).slice(2)}`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-[#1e3a8a] text-white px-5 py-4">
        <h3 className="text-lg font-bold">Risk Profile Summary</h3>
        <p className="text-sm opacity-80">{periodLabel}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis Risiko</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Inherent Risk</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">KPMR</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Net Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => {
              const inherentStyle = getRiskStyle(row.inherent);
              const kpmrStyle = getRiskStyle(row.kpmr);
              const netStyle = getRiskStyle(row.net);

              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${inherentStyle.bg} ${inherentStyle.text} text-sm font-bold`}>{row.inherent || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${kpmrStyle.bg} ${kpmrStyle.text} text-sm font-bold`}>{row.kpmr || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${netStyle.bg} ${netStyle.text} text-sm font-bold`}>{row.net || '-'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== RiskMatrix =====================
export const RiskMatrix = ({ inherentLevel, kpmrLevel, showLegend = true, className = '' }) => {
  // Validasi level
  const validInherent = inherentLevel > 0 && inherentLevel <= 5 ? inherentLevel : null;
  const validKpmr = kpmrLevel > 0 && kpmrLevel <= 5 ? kpmrLevel : null;
  const hasData = validInherent !== null && validKpmr !== null;

  // Warna matrix (heatmap) - sesuai original
  const getCellColor = (inherent, kpmr) => {
    // Kombinasi warna berdasarkan posisi
    const key = `${inherent},${kpmr}`;
    const colorMap = {
      // Level 1 (Low) - Hijau
      '1,1': '#2e7d32',
      '1,2': '#2e7d32',
      // Level 1-2 - Hijau ke Hijau Muda
      '1,3': '#92D050',
      '1,4': '#92D050',
      // Level 1-3 - Kuning
      '1,5': '#ffff00',

      // Level 2
      '2,1': '#2e7d32',
      '2,2': '#92D050',
      '2,3': '#92D050',
      '2,4': '#ffff00',
      '2,5': '#ffff00',

      // Level 3
      '3,1': '#92D050',
      '3,2': '#92D050',
      '3,3': '#ffff00',
      '3,4': '#ffc000',
      '3,5': '#ffc000',

      // Level 4
      '4,1': '#ffff00',
      '4,2': '#ffff00',
      '4,3': '#ffc000',
      '4,4': '#ffc000',
      '4,5': '#ff0000',

      // Level 5
      '5,1': '#ffff00',
      '5,2': '#ffc000',
      '5,3': '#ffc000',
      '5,4': '#ff0000',
      '5,5': '#ff0000',
    };
    return colorMap[key] || '#e5e7eb';
  };

  const getTextColor = (bgColor) => {
    // Warna gelap pakai text putih, warna terang pakai text gelap
    const darkColors = ['#2e7d32', '#92D050', '#ff0000'];
    return darkColors.includes(bgColor) ? '#ffffff' : '#1f2937';
  };

  if (!hasData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="bg-[#1e3a8a] text-white px-5 py-4">
          <h3 className="text-lg font-bold">Risk Matrix</h3>
          <p className="text-sm opacity-80">Inherent Risk vs KPMR</p>
        </div>
        <div className="p-5 flex items-center justify-center min-h-[300px]">
          <p className="text-gray-500 text-center">
            Data belum tersedia untuk periode ini.
            <br />
            <span className="text-sm">Silakan isi data di Rekap 1 terlebih dahulu.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="bg-[#1e3a8a] text-white px-5 py-4">
        <h3 className="text-lg font-bold">Risk Matrix</h3>
        <p className="text-sm opacity-80">Inherent Risk vs KPMR</p>
      </div>
      <div className="p-5">
        {/* Matrix Grid */}
        <div className="grid grid-cols-6 gap-1.5">
          {/* Header - KPMR */}
          <div className="col-span-1"></div>
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className="text-center text-xs font-semibold text-gray-600 py-2">
              KPMR {k}
            </div>
          ))}

          {/* Matrix Rows - Inherent 5 sampai 1 (dari atas ke bawah) */}
          {[5, 4, 3, 2, 1].map((i) => (
            <React.Fragment key={i}>
              <div className="flex items-center justify-end pr-3 text-xs font-semibold text-gray-600">Inherent {i}</div>
              {[1, 2, 3, 4, 5].map((k) => {
                const bgColor = getCellColor(i, k);
                const textColor = getTextColor(bgColor);
                const isActive = validInherent === i && validKpmr === k;

                return (
                  <div
                    key={k}
                    className={`
                      aspect-square flex items-center justify-center rounded-md
                      ${isActive ? 'ring-4 ring-blue-400 ring-offset-1' : ''}
                      text-lg font-black shadow-sm transition-all duration-200
                    `}
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                    }}
                  >
                    {isActive && '●'}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend - hanya jika showLegend true */}
        {showLegend && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#2e7d32' }}></span>
                <span className="font-medium">Low</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#92D050' }}></span>
                <span className="font-medium">Low-Mod</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#ffff00' }}></span>
                <span className="font-medium">Moderate</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#ffc000' }}></span>
                <span className="font-medium">Mod-High</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#ff0000' }}></span>
                <span className="font-medium">High</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================== AlertBox =====================
export const AlertBox = ({ title, message, type = 'warning' }) => {
  const styles = {
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: '⚠️' },
    info: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: 'ℹ️' },
    error: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: '❌' },
    success: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', icon: '✅' },
  };

  const style = styles[type] || styles.warning;

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{style.icon}</span>
        <div>
          <h4 className={`font-semibold ${style.text}`}>{title}</h4>
          <p className={`text-sm ${style.text} opacity-80 mt-1`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

// ===================== RekapData2Header (Original Style) =====================
export const RekapData2Header = ({ year, setYear, quarter, setQuarter, query, setQuery, onExport, onImport, importing, mode, onCleanup }) => (
  <header className="px-4 py-4 flex items-center justify-between gap-3">
    <h2 className="text-xl sm:text-2xl font-semibold">{mode === 'triwulan' ? 'Rekap Data 2' : 'Rekap Data 2 Tahunan'}</h2>
    <div className="flex items-end gap-4">
      <div className="hidden md:flex items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 font-medium">Tahun</label>
          <YearSelect value={year} onChange={setYear} />
        </div>
        {mode === 'triwulan' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600 font-medium">Triwulan</label>
            <QuarterSelect value={quarter} onChange={setQuarter} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <div className="relative">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari section / indikator…" className="pl-9 pr-3 py-2 rounded-xl border w-64" />
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button onClick={onExport} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border bg-gray-900 text-white hover:bg-black" disabled={importing}>
          <Download size={18} /> Export {year}
          {mode === 'triwulan' ? `-${quarter}` : ''}
        </button>
        <button onClick={onImport} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50" disabled={importing}>
          <Upload size={18} /> {importing ? 'Mengimpor...' : 'Import Excel'}
        </button>
        {onCleanup && (
          <button onClick={onCleanup} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-orange-600 text-orange-600 hover:bg-orange-50" title="Hapus data duplikat" disabled={importing}>
            <Trash2 size={18} />
            Clean Duplicates
          </button>
        )}
      </div>
    </div>
  </header>
);

// ===================== RekapData2FilterPills =====================
export const RekapData2FilterPills = ({ selectedSources, onToggleSource, periodeLabel, sources }) => (
  <div className="px-4 py-4">
    <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.08)] relative">
      <div className="absolute inset-x-0 top-0 h-px bg-white/70 rounded-t-2xl" />
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="font-semibold text-sm text-gray-800">REKAP DATA 2 PROFIL RISIKO ({periodeLabel})</div>
        <div className="flex flex-wrap gap-3">
          {sources.map((src) => {
            const isActive = selectedSources.includes(src);
            return (
              <button
                key={src}
                onClick={() => onToggleSource(src)}
                className={`px-6 h-11 rounded-full text-base font-semibold transition-all duration-200 shadow-sm ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                style={{ minWidth: 120 }}
              >
                {src.charAt(0).toUpperCase() + src.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

// ===================== RekapData2SectionFilter =====================
export const RekapData2SectionFilter = ({ sectionOptionsBySource, selectedSections, onToggleSection, sectionFilterOpen, setSectionFilterOpen, onResetSections }) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sectionFilterOpen && !e.target.closest('.section-dropdown-container')) {
        setSectionFilterOpen(false);
      }
    };
    if (sectionFilterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sectionFilterOpen, setSectionFilterOpen]);

  return (
    <div className="px-4 mt-6 mb-4">
      <div className="relative section-dropdown-container max-w-sm">
        <button onClick={() => setSectionFilterOpen((v) => !v)} className="w-full sm:w-80 flex items-center justify-between rounded-xl px-4 py-2 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
          <span>Filter section (opsional)</span>
          <ChevronDown size={16} />
        </button>
        {sectionFilterOpen && (
          <div className="absolute top-full left-0 mt-2 w-full sm:w-[420px] rounded-xl border bg-white shadow-lg p-4 max-h-[320px] overflow-y-auto z-40">
            {SOURCE_ORDER.map((source) => {
              const sections = sectionOptionsBySource[source];
              if (!sections || sections.length === 0) return null;
              return (
                <div key={source}>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">{source}</div>
                  <div className="space-y-1">
                    {sections.map((sec) => {
                      const checked = selectedSections[source]?.includes(sec) ?? false;
                      return (
                        <label key={sec} className="flex items-start gap-2 text-sm hover:bg-gray-50 px-2 py-1 rounded-md">
                          <input type="checkbox" className="mt-0.5" checked={checked} onChange={() => onToggleSection(source, sec)} />
                          <span>{sec}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="pt-3 mt-3 border-t flex justify-end gap-2">
              <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onResetSections}>
                Reset
              </button>
              <button className="text-sm font-semibold text-blue-600" onClick={() => setSectionFilterOpen(false)}>
                Terapkan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================== RekapData2QuarterFilter =====================
export const RekapData2QuarterFilter = ({ selectedQuarters, onToggleQuarter }) => (
  <div className="px-4 mt-6 mb-6">
    <div className="relative rounded-2xl bg-white/75 backdrop-blur-md border border-white/40 shadow-[0_10px_28px_rgba(0,0,0,0.10)] p-5 max-w-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-white/70 rounded-t-2xl" />
      <div className="text-sm font-semibold text-gray-700 mb-4">Filter Triwulan (opsional)</div>
      <div className="flex flex-wrap gap-6">
        {QUARTER_ORDER.map((q) => {
          const checked = selectedQuarters.includes(q);
          return (
            <label key={q} className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer select-none">
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-blue-500' : 'border-blue-400'}`}>{checked && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}</span>
              <input type="checkbox" className="hidden" checked={checked} onChange={() => onToggleQuarter(q)} />
              <span>
                {QUARTER_LABEL[q]} ({q})
              </span>
            </label>
          );
        })}
      </div>
      {selectedQuarters.length > 0 && <div className="mt-4 text-xs text-gray-500">Menampilkan: {selectedQuarters.join(', ')}</div>}
    </div>
  </div>
);

// ===================== NumberInput Component =====================
const NumberInput = ({ value, onChange, placeholder = '0', className = '' }) => {
  const [localValue, setLocalValue] = React.useState(() => fmtInputNumber(value));

  React.useEffect(() => {
    setLocalValue(fmtInputNumber(value));
  }, [value]);

  const handleBlur = () => {
    if (localValue === '' || localValue === '-') {
      onChange('');
      return;
    }
    const cleaned = String(localValue).replace(/\./g, '').replace(/,/g, '.');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      onChange(String(num));
      setLocalValue(new Intl.NumberFormat('id-ID').format(num));
    } else {
      setLocalValue('');
      onChange('');
    }
  };

  const handleFocus = () => {
    if (value !== null && value !== undefined && value !== '') {
      setLocalValue(String(value));
    }
  };

  return <input type="text" inputMode="decimal" className={className} value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} onFocus={handleFocus} placeholder={placeholder} />;
};

// ===================== RekapData2TriwulanTable =====================
export const RekapData2TriwulanTable = ({ visibleGroups, year, quarter, periodeLabel, handleChangeValue }) => {
  if (visibleGroups.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 w-20 text-base font-semibold"></th>
                <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 text-center text-base font-semibold" colSpan={2}>
                  Parameter atau Indikator
                </th>
                <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 text-center w-44 text-base font-semibold">{periodeLabel}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="border px-4 py-8 text-center text-gray-500">
                  Tidak ada data untuk sumber dan section yang dipilih.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  const bySource = {};
  visibleGroups.forEach((g) => {
    bySource[g.source] = bySource[g.source] || [];
    bySource[g.source].push(g);
  });
  const sourcesOrder = SOURCE_ORDER.filter((s) => bySource[s] && bySource[s].length);

  const renderedSourceCells = new Set();
  const renderedSectionCells = new Set();

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 w-20 text-base font-semibold"></th>
              <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 text-center text-base font-semibold" colSpan={2}>
                Parameter atau Indikator
              </th>
              <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 text-center w-44 text-base font-semibold">{periodeLabel}</th>
            </tr>
          </thead>
          <tbody>
            {sourcesOrder.flatMap((source) => {
              const indicators = bySource[source];
              const bySection = {};
              indicators.forEach((ind) => {
                const key = ind.sectionName;
                if (!bySection[key]) bySection[key] = [];
                bySection[key].push(ind);
              });

              const totalRowsForSource = calculateTotalRowsForSource(indicators);
              let isFirstRowInSource = true;

              return Object.entries(bySection).flatMap(([sectionName, sectionIndicators]) => {
                const rowsInSection = calculateTotalRowsForSection(sectionIndicators);
                let isFirstRowInSection = true;

                return sectionIndicators.flatMap((g, indicatorIndex) => {
                  const r = g.mainRow || {};
                  const mode = r.mode ?? 'RASIO';
                  const hasilDisplay = normalizeHasilDisplay(r.hasil ?? r.result ?? '', r.isPercent);
                  const rowKey = makeRowKey({ ...r, source });

                  const stableKey = `${source}-${sectionName}-${g.indikatorLabel}-${indicatorIndex}-${year}-${quarter}`;
                  const shouldRenderSource = isFirstRowInSource && !renderedSourceCells.has(source);
                  const shouldRenderSection = isFirstRowInSection && !renderedSectionCells.has(`${source}-${sectionName}`);

                  if (shouldRenderSource) renderedSourceCells.add(source);
                  if (shouldRenderSection) renderedSectionCells.add(`${source}-${sectionName}`);

                  const currentIsFirstSource = isFirstRowInSource;
                  const currentIsFirstSection = isFirstRowInSection;
                  isFirstRowInSource = false;
                  isFirstRowInSection = false;

                  const rows = [
                    <tr key={`${stableKey}-hasil`} className="bg-[#cfe2f3]">
                      {currentIsFirstSource && (
                        <td
                          rowSpan={totalRowsForSource}
                          className="border border-gray-300 px-2 py-2 align-middle text-center font-bold text-base bg-[#e6f4ff]"
                          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.18em', transform: 'rotate(180deg)', width: 80, minWidth: 80 }}
                        >
                          {source}
                        </td>
                      )}
                      {currentIsFirstSection && (
                        <td rowSpan={rowsInSection} className="border border-gray-300 px-2 py-2 align-middle text-left bg-[#e6f4ff]" style={{ width: '300px', maxWidth: '300px' }}>
                          <div className="text-base font-semibold text-gray-900 leading-tight">{sectionName}</div>
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-3 align-top">
                        <div className="text-base font-bold text-gray-700 leading-relaxed">{g.indikatorLabel}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {mode === 'TEKS' ? (
                          <input
                            type="text"
                            className="w-full text-right border rounded-md px-2 py-1 text-sm bg-white"
                            value={r.hasilText ?? ''}
                            onChange={(e) => handleChangeValue(rowKey, 'hasilText', e.target.value)}
                            placeholder="Masukkan teks atau angka..."
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{hasilDisplay || (r.isPercent ? '0,00%' : '0,00')}</span>
                        )}
                      </td>
                    </tr>,
                  ];

                  if (mode === 'RASIO') {
                    rows.push(
                      <tr key={`${stableKey}-pembilang`} className="bg-white">
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="text-sm text-gray-600">{r.numeratorLabel || r.pembilangLabel || 'Pembilang'}</span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right bg-white">
                          <NumberInput
                            value={r.numeratorValue ?? r.pembilangValue ?? ''}
                            onChange={(val) => handleChangeValue(rowKey, 'numeratorValue', val)}
                            placeholder="0"
                            className="w-full text-right border rounded-md px-2 py-1 text-sm bg-white"
                          />
                        </td>
                      </tr>,
                    );
                  }

                  if (mode !== 'TEKS') {
                    rows.push(
                      <tr key={`${stableKey}-penyebut`} className="bg-white">
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="text-sm text-gray-600">{r.denominatorLabel || r.penyebutLabel || 'Penyebut'}</span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right bg-white">
                          <NumberInput
                            value={r.denominatorValue ?? r.penyebutValue ?? ''}
                            onChange={(val) => handleChangeValue(rowKey, 'denominatorValue', val)}
                            placeholder="0"
                            className="w-full text-right border rounded-md px-2 py-1 text-sm bg-white"
                          />
                        </td>
                      </tr>,
                    );
                  }

                  return rows;
                });
              });
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ===================== RekapData2TahunanTable =====================
export const RekapData2TahunanTable = ({ annualGroups, year, filters }) => {
  if (annualGroups.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm overflow-visible">
        <div className="p-6 text-center text-gray-500">Tidak ada data untuk sumber dan section yang dipilih pada tahun {year}.</div>
      </section>
    );
  }

  const bySource = {};
  annualGroups.forEach((item) => {
    bySource[item.source] = bySource[item.source] || [];
    bySource[item.source].push(item);
  });
  const sourcesOrder = SOURCE_ORDER.filter((s) => bySource[s] && bySource[s].length);

  const filteredQuarters = QUARTER_ORDER.filter((q) => filters.selectedQuarters.length === 0 || filters.selectedQuarters.includes(q));

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 w-20 text-base font-semibold"></th>
              <th className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 text-center text-base font-semibold" colSpan={2}>
                Parameter atau Indikator
              </th>
              {filteredQuarters.map((q) => (
                <th key={q} className="border border-gray-300 bg-[#1f4e79] text-white px-2 py-2 text-center w-40 text-base font-semibold">
                  {QUARTER_LABEL[q]} {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sourcesOrder.flatMap((source) => {
              const indicators = bySource[source];
              const totalRowsForSource = indicators.length * 3;
              let firstForSource = true;

              return indicators.flatMap((indicator, indicatorIndex) => {
                const isFirst = firstForSource;
                firstForSource = false;
                const stableKey = makeStableKey(source, indicator.sectionName, indicator.indikatorLabel, indicator.no, indicator.subNo, indicatorIndex);

                return [
                  <tr key={`${stableKey}-hasil`} className="bg-[#cfe2f3]">
                    {isFirst && (
                      <td
                        rowSpan={totalRowsForSource}
                        className="border border-gray-300 px-2 py-2 align-middle text-center font-bold text-base bg-[#e6f4ff]"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.18em', width: 80, minWidth: 80 }}
                      >
                        {source}
                      </td>
                    )}
                    <td rowSpan={3} className="border border-gray-300 px-2 py-2 align-middle text-left bg-[#e6f4ff]" style={{ width: '300px', maxWidth: '300px' }}>
                      <div className="text-base font-semibold text-gray-900 leading-tight">{indicator.sectionName}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="text-base font-bold text-gray-700 leading-relaxed">{indicator.indikatorLabel}</div>
                    </td>
                    {filteredQuarters.map((q) => {
                      const d = indicator.quarters[q];
                      return (
                        <td key={`${stableKey}-hasil-${q}`} className="border border-gray-300 px-4 py-3 text-right bg-[#e6f4ff]">
                          {d ? (d.isPercent ? `${(Number(d.hasil) * 100).toFixed(2)}%` : fmtNumber(d.hasil)) : '-'}
                        </td>
                      );
                    })}
                  </tr>,
                  <tr key={`${stableKey}-pembilang`} className="bg-white">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">{indicator.quarters.Q1?.numeratorLabel || 'Pembilang'}</td>
                    {filteredQuarters.map((q) => {
                      const d = indicator.quarters[q];
                      return (
                        <td key={`${stableKey}-num-${q}`} className="border border-gray-300 px-3 py-2 text-right">
                          {d?.numeratorValue != null ? fmtNumber(d.numeratorValue) : '-'}
                        </td>
                      );
                    })}
                  </tr>,
                  <tr key={`${stableKey}-penyebut`} className="bg-white">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">{indicator.quarters.Q1?.denominatorLabel || 'Penyebut'}</td>
                    {filteredQuarters.map((q) => {
                      const d = indicator.quarters[q];
                      return (
                        <td key={`${stableKey}-den-${q}`} className="border border-gray-300 px-3 py-2 text-right">
                          {d?.denominatorValue != null ? fmtNumber(d.denominatorValue) : '-'}
                        </td>
                      );
                    })}
                  </tr>,
                ];
              });
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ===================== RekapData2ExportDialog =====================
export const RekapData2ExportDialog = ({ options, setOptions, onConfirm, onCancel }) => {
  const handleChange = (field, value) => {
    const updated = { ...options, [field]: value };
    setOptions(updated);
    localStorage.setItem('rekapData2ExportFormat', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Export Excel - Pilih Format</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Format Hasil:</label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="hasilFormat" value="smart" checked={options.hasilFormat === 'smart'} onChange={(e) => handleChange('hasilFormat', e.target.value)} className="mt-1" />
              <div>
                <span className="font-semibold">Smart Auto (0, 5, 0.5)</span>
                <span className="text-blue-600 text-xs block ml-4">- RECOMMENDED</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="hasilFormat" value="4decimal" checked={options.hasilFormat === '4decimal'} onChange={(e) => handleChange('hasilFormat', e.target.value)} className="mt-1" />
              <div>
                <span className="font-semibold">Selalu 4 Desimal (0.0000, 5.0000)</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="hasilFormat" value="integer" checked={options.hasilFormat === 'integer'} onChange={(e) => handleChange('hasilFormat', e.target.value)} className="mt-1" />
              <div>
                <span className="font-semibold">Tanpa Desimal (0, 5, 100)</span>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Format Pemisah:</label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="pemisahFormat" value="indonesia" checked={options.pemisahFormat === 'indonesia'} onChange={(e) => handleChange('pemisahFormat', e.target.value)} className="mt-1" />
              <div>
                <span className="font-semibold">Indonesia (1.000.000)</span>
                <span className="text-blue-600 text-xs block ml-4">- DEFAULT</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="pemisahFormat" value="standar" checked={options.pemisahFormat === 'standar'} onChange={(e) => handleChange('pemisahFormat', e.target.value)} className="mt-1" />
              <div>
                <span className="font-semibold">Standar (1000000)</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
            Batal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium">
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};
