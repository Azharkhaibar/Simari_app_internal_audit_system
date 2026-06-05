// components/rekap-data.components.jsx
import React, { useEffect } from 'react';
import { Search, ChevronDown, Download, Upload } from 'lucide-react';
import { SOURCE_ORDER, QUARTER_ORDER, QUARTER_LABEL, fmtNumber, fmtInputNumber, normalizeHasilDisplay, makeRowKey, makeStableKey, calculateTotalRowsForSource, calculateTotalRowsForSection } from '../utils/rekap-data.utils';

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

// ===================== RekapDataHeader =====================
export const RekapDataHeader = ({ year, setYear, quarter, setQuarter, query, setQuery, onExport, onImport, importing, mode, onCleanup }) => (
  <header className="px-4 py-4 flex items-center justify-between gap-3">
    <h2 className="text-xl sm:text-2xl font-semibold">{mode === 'triwulan' ? 'Rekap Data' : 'Rekap Data Tahunan'}</h2>
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
          <button onClick={onCleanup} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-orange-600 text-orange-600 hover:bg-orange-50" title="Hapus data duplikat">
            🧹 Clean Duplicates
          </button>
        )}
      </div>
    </div>
  </header>
);

// ===================== RekapDataFilterPills =====================
export const RekapDataFilterPills = ({ selectedSources, onToggleSource, periodeLabel, sources }) => (
  <div className="px-4 py-4">
    <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.08)] relative">
      <div className="absolute inset-x-0 top-0 h-px bg-white/70 rounded-t-2xl" />
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="font-semibold text-sm text-gray-800">REKAP DATA PROFIL RISIKO ({periodeLabel})</div>
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

// ===================== RekapDataSectionFilter =====================
export const RekapDataSectionFilter = ({ sectionOptionsBySource, selectedSections, onToggleSection, sectionFilterOpen, setSectionFilterOpen, onResetSections }) => {
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

// ===================== RekapDataQuarterFilter =====================
export const RekapDataQuarterFilter = ({ selectedQuarters, onToggleQuarter }) => (
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

// ===================== NumberInput Component (UNTUK ANGKA BESAR) =====================
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
    // Parse dan format
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
    // Tampilkan nilai mentah tanpa formatting
    if (value !== null && value !== undefined && value !== '') {
      setLocalValue(String(value));
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={localValue}
      onChange={(e) => {
        const raw = e.target.value;
        setLocalValue(raw);
        // Jangan langsung update parent saat mengetik (hindari refresh)
      }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
    />
  );
};

// ===================== RekapDataTriwulanTable =====================
export const RekapDataTriwulanTable = ({ visibleGroups, year, quarter, periodeLabel, handleChangeValue }) => {
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

// ===================== RekapDataTahunanTable =====================
export const RekapDataTahunanTable = ({ annualGroups, year, filters }) => {
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

// ===================== RekapDataExportDialog =====================
export const RekapDataExportDialog = ({ options, setOptions, onConfirm, onCancel }) => {
  const handleChange = (field, value) => {
    const updated = { ...options, [field]: value };
    setOptions(updated);
    localStorage.setItem('rekapDataExportFormat', JSON.stringify(updated));
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
