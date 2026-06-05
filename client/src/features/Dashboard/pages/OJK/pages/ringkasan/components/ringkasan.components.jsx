// src/features/Dashboard/pages/Ringkasan/components/index.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useHeaderStore } from '../../../store/header';
import { CATEGORIES, KATEGORI_OPTIONS } from '../contants/ringkasan.contants.js';
import { getRiskColor, getRiskIndicator, formatNumber, formatPercent } from '../utils/ringkasan.utils.js';

// ==================== DRAG SCROLL HOOK ====================
function useDragScroll() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      const rect = container.getBoundingClientRect();
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (isInside && container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 2;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      if (!scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
        scrollRef.current.style.removeProperty('user-select');
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
        scrollRef.current.style.removeProperty('user-select');
      }
    }
  };

  return { scrollRef, handleMouseDown, handleMouseLeave };
}

// ==================== KATEGORI FILTER ====================
export function KategoriFilter({ filter, setFilter }) {
  const { updateFilter, toggleUnderlying, resetFilter } = setFilter;
  const [showUnderlyingDropdown, setShowUnderlyingDropdown] = useState(false);
  const underlyingDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (underlyingDropdownRef.current && !underlyingDropdownRef.current.contains(event.target)) {
        setShowUnderlyingDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUnderlyingDisplayText = () => {
    if (!filter.underlying || filter.underlying.length === 0) return 'Semua Underlying';
    return filter.underlying.map((v) => KATEGORI_OPTIONS.underlying.find((o) => o.value === v)?.label || v).join(', ');
  };

  return (
    <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="font-semibold mb-3 text-blue-800">Filter Kategori</h3>
      <div className="flex flex-wrap gap-4">
        <SelectFilter label="Model Produk" options={KATEGORI_OPTIONS.model} value={filter.model} onChange={(e) => updateFilter('model', e.target.value)} />
        {filter.model && filter.model !== 'tanpa_model' && <SelectFilter label="Prinsip" options={KATEGORI_OPTIONS.prinsip} value={filter.prinsip} onChange={(e) => updateFilter('prinsip', e.target.value)} />}
        {filter.model === 'open_end' && <SelectFilter label="Jenis Reksa Dana" options={KATEGORI_OPTIONS.jenis} value={filter.jenis} onChange={(e) => updateFilter('jenis', e.target.value)} />}
        {filter.model === 'terstruktur' && (
          <MultiSelectFilter
            label="Aset Dasar"
            options={KATEGORI_OPTIONS.underlying.filter((o) => o.value !== '')}
            selected={filter.underlying || []}
            onToggle={toggleUnderlying}
            onReset={() => updateFilter('underlying', [])}
            show={showUnderlyingDropdown}
            setShow={setShowUnderlyingDropdown}
            displayText={getUnderlyingDisplayText()}
            ref={underlyingDropdownRef}
          />
        )}
        <div className="flex items-end">
          <button onClick={resetFilter} className="px-4 py-2 flex items-center bg-blue-800 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}

const SelectFilter = ({ label, options, value, onChange }) => (
  <div className="min-w-[500px]">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" value={value} onChange={onChange}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const MultiSelectFilter = React.forwardRef(({ label, options, selected, onToggle, onReset, show, setShow, displayText }, ref) => (
  <div className="min-w-[500px] relative" ref={ref}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <button type="button" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-left flex justify-between items-center" onClick={() => setShow(!show)}>
      <span className="truncate">{displayText}</span>
      <span className="ml-2">▾</span>
    </button>
    {show && (
      <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
        <div className="p-2 border-b">
          <button
            type="button"
            className="w-full text-left px-2 py-1 text-xs text-blue-800 hover:bg-blue-50 rounded"
            onClick={() => {
              onReset();
              setShow(false);
            }}
          >
            Select All
          </button>
        </div>
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => onToggle(opt.value)}>
            <input type="checkbox" className="accent-blue-800" checked={selected.includes(opt.value)} readOnly />
            <span className="text-sm">{opt.label}</span>
          </div>
        ))}
      </div>
    )}
  </div>
));
MultiSelectFilter.displayName = 'MultiSelectFilter';

// ==================== CATEGORY SELECTOR ====================
export function CategorySelector({ selectedPages, toggleAll, togglePage }) {
  const { scrollRef, handleMouseDown, handleMouseLeave } = useDragScroll();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Kategori Halaman</h3>
        <button onClick={toggleAll} className="px-3 py-1.5 text-xs bg-sky-700 text-white rounded-md hover:bg-sky-900">
          {selectedPages.length === CATEGORIES.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="bg-gradient-to-r from-blue-700 to-sky-600 p-2 rounded-lg">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 cursor-grab scrollbar-thin" onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave}>
          {CATEGORIES.map((c) => {
            const Icon = c.Icon;
            const active = selectedPages.includes(c.id);
            return (
              <Button key={c.id} onClick={() => togglePage(c.id)} className={active ? 'bg-blue-900 text-white flex-shrink-0' : 'bg-white text-black flex-shrink-0'}>
                <Icon className="w-4 h-4 mr-2" />
                {c.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {selectedPages.length} dari {CATEGORIES.length} kategori terpilih
      </div>
    </div>
  );
}

// ==================== SUMMARY TABLE (DIPERBAIKI) ====================
export function SummaryTable({ summaryData, isLoading }) {
  const { search } = useHeaderStore();
  const searchLower = (search || '').toLowerCase().trim();

  // Pre-compute semua row + rowSpan sebelum render
  const allRows = React.useMemo(() => {
    if (isLoading || summaryData.length === 0) return [];

    const rows = [];

    summaryData.forEach((pageData) => {
      const { no, categoryLabel, categoryCode, rows: pageRows } = pageData;

      if (!Array.isArray(pageRows) || pageRows.length === 0) {
        rows.push({ type: 'no-data', categoryLabel });
        return;
      }

      // Hitung total rowSpan untuk kategori ini
      let totalCategoryRowSpan = 0;
      pageRows.forEach((param) => {
        totalCategoryRowSpan += param.nilaiList?.length || 0;
      });

      let isFirstParamInCategory = true;

      pageRows.forEach((param, paramIndex) => {
        const paramName = param.judul || 'Parameter';
        const paramNumber = param.nomor || (paramIndex + 1).toString();
        const nilaiCount = param.nilaiList?.length || 0;

        if (nilaiCount === 0) {
          rows.push({
            type: 'empty-param',
            no,
            categoryLabel,
            totalCategoryRowSpan,
            isFirstParamInCategory,
            param,
            paramName,
            indeks: `R.${categoryCode}.${paramNumber}`,
          });
          isFirstParamInCategory = false;
          return;
        }

        param.nilaiList.forEach((item, itemIndex) => {
          // Filter search
          if (searchLower) {
            const indikator = (item?.judul?.text || '').toLowerCase();
            const indeks = `R.${categoryCode}.${item?.nomor || ''}`.toLowerCase();
            const pName = paramName.toLowerCase();
            const cLabel = categoryLabel.toLowerCase();
            if (!indikator.includes(searchLower) && !pName.includes(searchLower) && !cLabel.includes(searchLower) && !indeks.includes(searchLower)) {
              return;
            }
          }

          const derived = item?.derived || {};
          const hasilAssessment = derived.hasilDisplay ?? derived.weighted ?? 0;
          const riskLevel = derived.riskLevel ?? derived.weighted ?? 0;

          rows.push({
            type: 'data',
            no,
            categoryLabel,
            totalCategoryRowSpan,
            isFirstParamInCategory: isFirstParamInCategory && itemIndex === 0,
            isFirstItemInParam: itemIndex === 0,
            param,
            paramName,
            nilaiCount,
            item,
            itemIndex,
            indeks: `R.${categoryCode}.${item?.nomor || paramNumber}`,
            hasilAssessment,
            riskLevel,
          });
          isFirstParamInCategory = false;
        });
      });
    });

    return rows;
  }, [summaryData, isLoading, searchLower]);

  // Render
  if (isLoading) {
    return (
      <div className="mt-6 overflow-x-auto">
        <TableHeader />
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <tbody>
            <tr>
              <td colSpan={11} className="border px-4 py-8 text-center">
                Memuat data...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (summaryData.length === 0) {
    return (
      <div className="mt-6 overflow-x-auto">
        <TableHeader />
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <tbody>
            <tr>
              <td colSpan={11} className="border px-4 py-8 text-center text-red-500">
                Pilih kategori halaman untuk menampilkan data ringkasan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <TableHeader />
        <tbody>
          {allRows.length === 0 ? (
            <tr>
              <td colSpan={11} className="border px-4 py-8 text-center text-red-500">
                {searchLower ? `Tidak ditemukan: "${search}"` : 'Data tidak ditemukan'}
              </td>
            </tr>
          ) : (
            allRows.map((row, idx) => {
              if (row.type === 'no-data') {
                return (
                  <tr key={idx}>
                    <td colSpan={11} className="border px-2 py-4 text-center text-red-500">
                      Data tidak ditemukan untuk Risiko {row.categoryLabel}
                    </td>
                  </tr>
                );
              }

              if (row.type === 'empty-param') {
                return (
                  <tr key={idx}>
                    {row.isFirstParamInCategory && (
                      <td rowSpan={row.totalCategoryRowSpan} className="border px-2 py-2 text-center bg-[#E8F5FA] align-top">
                        {row.no}
                      </td>
                    )}
                    {row.isFirstParamInCategory && (
                      <td rowSpan={row.totalCategoryRowSpan} className="border px-2 py-2 bg-[#E8F5FA] align-top">
                        Risiko {row.categoryLabel}
                      </td>
                    )}
                    <td className="border px-2 py-2 text-center bg-[#E8F5FA]">{formatPercent(row.param.bobot)}</td>
                    <td className="border px-2 py-2 bg-[#E8F5FA]">{row.paramName}</td>
                    <td className="border px-2 py-2 text-center font-mono bg-[#E8F5FA]">{row.indeks}</td>
                    <td className="border px-2 py-2 text-center bg-[#E8F5FA]">-</td>
                    <td className="border px-2 py-2 text-center">-</td>
                    <td className="border px-2 py-2 text-center">-</td>
                    <td className="border px-2 py-2 text-center">-</td>
                    <td className="border px-2 py-2 text-center">-</td>
                  </tr>
                );
              }

              // Data row
              const { no, categoryLabel, totalCategoryRowSpan, isFirstParamInCategory, isFirstItemInParam, param, paramName, nilaiCount, item, indeks, hasilAssessment, riskLevel } = row;

              return (
                <tr key={idx}>
                  {isFirstParamInCategory && (
                    <td rowSpan={totalCategoryRowSpan} className="border px-2 py-2 text-center bg-[#E8F5FA] align-top">
                      {no}
                    </td>
                  )}
                  {isFirstParamInCategory && (
                    <td rowSpan={totalCategoryRowSpan} className="border px-2 py-2 bg-[#E8F5FA] align-top">
                      Risiko {categoryLabel}
                    </td>
                  )}
                  {isFirstItemInParam && (
                    <td rowSpan={nilaiCount} className="border px-2 py-2 text-center bg-[#E8F5FA] align-top">
                      {formatPercent(param.bobot)}
                    </td>
                  )}
                  {isFirstItemInParam && (
                    <td rowSpan={nilaiCount} className="border px-2 py-2 bg-[#E8F5FA] align-top">
                      {paramName}
                    </td>
                  )}
                  <td className="border px-2 py-2 text-center font-mono bg-[#E8F5FA]">{indeks}</td>
                  <td className="border px-2 py-2 bg-[#E8F5FA] break-words max-w-[500px]">{item?.judul?.text || '-'}</td>
                  <td className="border px-2 py-2 text-center">{formatPercent(item.bobot)}</td>
                  <td className="border px-2 py-2 text-center font-bold">{formatNumber(hasilAssessment)}</td>
                  <td className={`border px-2 py-2 text-center font-bold ${getRiskColor(riskLevel)}`}>{formatNumber(riskLevel)}</td>
                  <td className={`border px-2 py-2 text-center font-bold ${getRiskColor(riskLevel)}`}>{getRiskIndicator(riskLevel)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ==================== TABLE HEADER (DIPISAH) ====================
function TableHeader() {
  return (
    <thead>
      <tr>
        <th rowSpan={3} className="border border-gray-400 px-2 py-2 bg-blue-800 text-white min-w-[50px]">
          No
        </th>
        <th rowSpan={3} className="border border-gray-400 px-2 py-2 bg-blue-800 text-white min-w-[110px]">
          Jenis Resiko
        </th>
        <th rowSpan={3} className="border border-gray-400 px-2 py-2 bg-blue-800 text-white min-w-[30px]">
          Bobot
        </th>
        <th rowSpan={3} className="border border-gray-400 px-2 py-2 bg-blue-800 text-white min-w-[250px]">
          Parameter
        </th>
        <th rowSpan={3} className="border border-gray-400 px-2 py-2 bg-blue-800 text-white min-w-[100px]">
          Indeks
        </th>
        <th rowSpan={3} className="border border-gray-400 px-2 py-2 bg-blue-800 text-white min-w-[250px]">
          Indikator/Risiko Inheren
        </th>
        <th colSpan={4} className="border border-gray-400 px-2 py-2 bg-slate-700 text-white text-center">
          Hasil Risk Assessment
        </th>
      </tr>
      <tr>
        <th colSpan={4} className="border border-gray-400 px-2 py-2 bg-slate-700 text-white text-center">
          Active Quarter
        </th>
      </tr>
      <tr>
        <th className="border border-gray-400 px-2 py-2 bg-slate-700 text-white min-w-[40px]">Bobot</th>
        <th className="border border-gray-400 px-2 py-2 bg-slate-700 text-white min-w-[80px]">Hasil Assessment</th>
        <th className="border border-gray-400 px-2 py-2 bg-slate-700 text-white min-w-[80px]">Risk Level</th>
        <th className="border border-gray-400 px-2 py-2 bg-slate-700 text-white min-w-[80px]">Risk Indicator</th>
      </tr>
    </thead>
  );
}
