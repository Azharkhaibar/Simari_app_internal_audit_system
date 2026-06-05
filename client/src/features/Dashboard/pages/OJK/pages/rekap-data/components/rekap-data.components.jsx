import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { KATEGORI_OPTIONS } from '../contants/rekap-data.contants';
import { shouldIncludeInFilter } from '../utils/rekap-data.utils.js';

export function KategoriFilter({ filter, setFilter, onFilterChange }) {
  const [showUnderlyingDropdown, setShowUnderlyingDropdown] = useState(false);
  const underlyingDropdownRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  const isPrinsipDisabled = useMemo(() => {
    return !filter.model || filter.model === 'tanpa_model';
  }, [filter.model]);

  const isJenisDisabled = useMemo(() => {
    return filter.model !== 'open_end';
  }, [filter.model]);

  const isUnderlyingDisabled = useMemo(() => {
    return filter.model !== 'terstruktur';
  }, [filter.model]);

  const getUnderlyingDisplayText = useMemo(() => {
    if (!filter.underlying || filter.underlying.length === 0) {
      return 'Semua Underlying';
    }

    const labels = filter.underlying.map((value) => KATEGORI_OPTIONS.underlying.find((o) => o.value === value)?.label || value);

    return labels.join(', ');
  }, [filter.underlying]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilter = { ...filter };

      if (key === 'model') {
        newFilter.model = value;
        newFilter.prinsip = '';
        newFilter.jenis = '';
        newFilter.underlying = [];
      } else {
        newFilter[key] = value;
      }

      setFilter(newFilter);
      if (onFilterChange) onFilterChange(newFilter);
    },
    [filter, setFilter, onFilterChange],
  );

  const handleUnderlyingToggle = useCallback(
    (value) => {
      const current = Array.isArray(filter.underlying) ? filter.underlying : [];
      const newUnderlying = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

      const newFilter = { ...filter, underlying: newUnderlying };
      setFilter(newFilter);
      if (onFilterChange) onFilterChange(newFilter);
    },
    [filter, setFilter, onFilterChange],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (underlyingDropdownRef.current && !underlyingDropdownRef.current.contains(event.target)) {
        setShowUnderlyingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUnderlyingButtonClick = useCallback(() => {
    if (isUnderlyingDisabled) return;

    requestAnimationFrame(() => {
      setShowUnderlyingDropdown((prev) => !prev);
    });
  }, [isUnderlyingDisabled]);

  const UnderlyingDropdown = useMemo(() => {
    if (!showUnderlyingDropdown || isUnderlyingDisabled) return null;

    return (
      <div
        className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto animate-fadeIn"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease-out',
          transformOrigin: 'top center',
        }}
      >
        <div className="p-2 border-b">
          <button
            type="button"
            className="w-full text-left px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            onClick={() => {
              const newFilter = { ...filter, underlying: [] };
              setFilter(newFilter);
              if (onFilterChange) onFilterChange(newFilter);
              setShowUnderlyingDropdown(false);
            }}
          >
            Pilih Semua
          </button>
        </div>

        {KATEGORI_OPTIONS.underlying
          .filter((opt) => opt.value !== '')
          .map((opt) => {
            const isSelected = filter.underlying?.includes(opt.value);

            return (
              <div key={opt.value} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => handleUnderlyingToggle(opt.value)}>
                <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={isSelected} readOnly />
                <span className="text-sm">{opt.label}</span>
              </div>
            );
          })}
      </div>
    );
  }, [showUnderlyingDropdown, isUnderlyingDisabled, filter, handleUnderlyingToggle, onFilterChange, setFilter]);

  return (
    <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200 transition-all duration-200">
      <h3 className="font-semibold mb-3 text-blue-800">Filter Kategori</h3>
      <div className="flex flex-wrap gap-4">
        {/* Model Produk */}
        <div className="min-w-[500px] transition-all duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Produk</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={filter.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
          >
            {KATEGORI_OPTIONS.model.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prinsip */}
        <div className="min-w-[500px] transition-all duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prinsip</label>
          <select
            className={`w-full border rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              isPrinsipDisabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            value={filter.prinsip}
            onChange={(e) => handleFilterChange('prinsip', e.target.value)}
            disabled={isPrinsipDisabled}
          >
            {KATEGORI_OPTIONS.prinsip.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Reksa Dana */}
        <div className="min-w-[500px] transition-all duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Reksa Dana</label>
          <select
            className={`w-full border rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              isJenisDisabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            value={filter.jenis}
            onChange={(e) => handleFilterChange('jenis', e.target.value)}
            disabled={isJenisDisabled}
          >
            {KATEGORI_OPTIONS.jenis.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Aset Dasar */}
        <div className="min-w-[500px] relative transition-all duration-200" ref={underlyingDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aset Dasar</label>
          <div className="relative">
            <button
              type="button"
              className={`w-full border rounded-md px-3 py-2 text-sm text-left flex justify-between items-center transition-all duration-200 focus:outline-none focus:ring-2 ${
                isUnderlyingDisabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 hover:border-blue-400 focus:ring-blue-500 focus:border-blue-500'
              }`}
              onClick={handleUnderlyingButtonClick}
              disabled={isUnderlyingDisabled}
            >
              <span className="truncate">{getUnderlyingDisplayText}</span>
              <span className={`ml-2 transition-transform duration-200 ${showUnderlyingDropdown ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {UnderlyingDropdown}
          </div>
        </div>

        {/* Tombol Reset */}
        <div className="flex items-end transition-all duration-200">
          <button
            type="button"
            className="px-4 py-2 flex items-center bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              const newFilter = {
                model: '',
                prinsip: '',
                jenis: '',
                underlying: [],
              };
              setFilter(newFilter);
              if (onFilterChange) onFilterChange(newFilter);
              setShowUnderlyingDropdown(false);
            }}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}

export function SimpleTable({ rows, onUpdateRawValue, filterKategori }) {
  const filteredRows = useMemo(() => {
    if (!filterKategori.model && !filterKategori.prinsip && !filterKategori.jenis && (!Array.isArray(filterKategori.underlying) || filterKategori.underlying.length === 0)) {
      return rows;
    }

    return rows.filter((param) => shouldIncludeInFilter(param, filterKategori));
  }, [rows, filterKategori]);

  if (!Array.isArray(filteredRows) || filteredRows.length === 0) {
    return <div className="p-6 text-center text-gray-500 border rounded-xl">{rows.length > 0 ? 'Tidak ada data yang sesuai dengan filter kategori' : 'Tidak ada data'}</div>;
  }

  const flatRows = [];

  filteredRows.forEach((param) => {
    if (!param || !param.id) return;

    const itemList = Array.isArray(param.nilaiList) ? param.nilaiList : [];

    if (itemList.length === 0) {
      flatRows.push({
        type: 'empty',
        param,
        _categoryId: param._categoryId,
        _categoryLabel: param._categoryLabel,
      });
      return;
    }

    itemList.forEach((item) => {
      if (!item || !item.id) return;

      const itemType = item.judul?.type || 'Tanpa Faktor';

      let subKinds = ['main'];

      if (itemType === 'Satu Faktor') {
        subKinds = ['main', 'single'];
      } else if (itemType === 'Dua Faktor') {
        subKinds = ['main', 'frac-top', 'frac-bottom'];
      }

      subKinds.forEach((kind) => {
        flatRows.push({
          kind,
          isMain: kind === 'main',
          param,
          item,
          _categoryId: param._categoryId,
          _categoryLabel: param._categoryLabel,
          itemType: itemType,
        });
      });
    });
  });

  if (flatRows.length === 0) {
    return <div className="p-6 text-center text-gray-500 border rounded-xl">Tidak ada data untuk ditampilkan</div>;
  }

  const categoryRowSpan = {};
  const paramRowSpan = {};

  flatRows.forEach((r) => {
    if (!r._categoryId || !r.param || !r.param.id) return;
    categoryRowSpan[r._categoryId] = (categoryRowSpan[r._categoryId] || 0) + 1;
    const uniqueParamId = `${r._categoryId}-${r.param.id}`;
    paramRowSpan[uniqueParamId] = (paramRowSpan[uniqueParamId] || 0) + 1;
  });

  const renderedCategory = {};
  const renderedParam = {};

  return (
    <div className="w-full overflow-auto border shadow">
      <table className="table-fixed text-sm w-full ">
        <thead>
          <tr>
            <th className="border border-black px-2 py-2 bg-blue-900 text-white w-10">Jenis Risiko</th>
            <th className="border border-black px-2 py-2 bg-blue-900 text-white w-48">Parameter</th>
            <th className="border border-black px-2 py-2 bg-blue-900 text-white w-64">Nilai atau Indicator</th>
            <th className="border border-black px-2 py-2 bg-blue-900 text-white w-32">Hasil</th>
          </tr>
        </thead>

        <tbody>
          {flatRows.map((row, idx) => {
            const { param, item, kind, isMain, _categoryId, _categoryLabel, itemType } = row;

            if (!param || !item) return null;

            const uniqueParamId = `${_categoryId}-${param.id}`;
            const showCategory = !renderedCategory[_categoryId];
            const showParam = isMain && !renderedParam[uniqueParamId];

            if (showCategory) renderedCategory[_categoryId] = true;
            if (showParam) renderedParam[uniqueParamId] = true;

            let itemText = '-';
            if (kind === 'main') itemText = item?.judul?.text ?? '-';
            if (kind === 'single' || kind === 'frac-top') itemText = item?.judul?.pembilang ?? '-';
            if (kind === 'frac-bottom') itemText = item?.judul?.penyebut ?? '-';

            let inputValue = '';
            let fieldName = '';

            if (itemType === 'Tanpa Faktor' && kind === 'main') {
              const currentValue = item.judul?.value ?? item.judul?.valuePembilang;
              inputValue = currentValue !== null && currentValue !== undefined ? String(currentValue) : '';
              fieldName = 'value';
            } else if (itemType === 'Satu Faktor' && kind === 'single') {
              const currentValue = item.judul?.valuePembilang;
              inputValue = currentValue !== null && currentValue !== undefined ? String(currentValue) : '';
              fieldName = 'valuePembilang';
            } else if (itemType === 'Dua Faktor' && kind === 'frac-top') {
              const currentValue = item.judul?.valuePembilang;
              inputValue = currentValue !== null && currentValue !== undefined ? String(currentValue) : '';
              fieldName = 'valuePembilang';
            } else if (itemType === 'Dua Faktor' && kind === 'frac-bottom') {
              const currentValue = item.judul?.valuePenyebut;
              inputValue = currentValue !== null && currentValue !== undefined ? String(currentValue) : '';
              fieldName = 'valuePenyebut';
            }

            let hasilText = '-';
            if (kind === 'main') {
              const hasilDisplay = item.derived?.hasilDisplay;
              hasilText = hasilDisplay !== undefined && hasilDisplay !== null ? String(hasilDisplay) : '-';
            } else {
              hasilText = inputValue || '-';
            }

            const nilaiTextClass = isMain ? 'text-base font-bold' : 'text-base ';
            const editKey = `${item.id}:${kind}`;

            return (
              <tr key={`${idx}-${editKey}`}>
                {showCategory && (
                  <td
                    rowSpan={categoryRowSpan[_categoryId]}
                    className="align-middle text-center p-2 bg-[#E8F5FA] font-semibold border-2 border-black tracking-widest"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    <div className="flex items-center text-lg justify-center h-full">{_categoryLabel}</div>
                  </td>
                )}

                {showParam && (
                  <td rowSpan={paramRowSpan[uniqueParamId]} className="border px-2 align-middle text-lg text-center bg-[#E8F5FA] font-semibold" style={{ verticalAlign: 'middle' }}>
                    {param.judul || '-'}
                  </td>
                )}

                <td className={`border p-0 ${isMain ? 'bg-[#E8F5FA]' : ''}`}>
                  <div className="w-full h-full flex items-center">
                    <div className={nilaiTextClass}>
                      <div className="px-2 w-full">{itemText}</div>
                    </div>
                  </div>
                </td>

                <td className="border px-2 py-2">
                  {kind === 'main' ? (
                    itemType === 'Tanpa Faktor' ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-950 text-center">{hasilText}</div>
                        <input
                          type="text"
                          className="w-full bg-transparent text-center outline-none text-base border rounded"
                          value={inputValue}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (value === '') {
                              onUpdateRawValue({
                                categoryId: _categoryId,
                                paramId: param.id,
                                itemId: item.id,
                                field: fieldName,
                                value: null,
                              });
                              return;
                            }

                            const num = parseFloat(value);
                            const isNum = !isNaN(num) && !isNaN(parseFloat(value));

                            onUpdateRawValue({
                              categoryId: _categoryId,
                              paramId: param.id,
                              itemId: item.id,
                              field: fieldName,
                              value: isNum ? num : value,
                            });
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              onUpdateRawValue({
                                categoryId: _categoryId,
                                paramId: param.id,
                                itemId: item.id,
                                field: fieldName,
                                value: null,
                              });
                            }
                          }}
                          placeholder="Masukkan nilai"
                        />
                      </div>
                    ) : (
                      <div className="font-semibold text-gray-950 text-center">{hasilText}</div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        className="w-full bg-transparent text-center outline-none text-base border rounded"
                        value={inputValue}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === '') {
                            onUpdateRawValue({
                              categoryId: _categoryId,
                              paramId: param.id,
                              itemId: item.id,
                              field: fieldName,
                              value: null,
                            });
                            return;
                          }

                          const num = parseFloat(value);
                          const isNum = !isNaN(num) && !isNaN(parseFloat(value));

                          onUpdateRawValue({
                            categoryId: _categoryId,
                            paramId: param.id,
                            itemId: item.id,
                            field: fieldName,
                            value: isNum ? num : value,
                          });
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            onUpdateRawValue({
                              categoryId: _categoryId,
                              paramId: param.id,
                              itemId: item.id,
                              field: fieldName,
                              value: null,
                            });
                          }
                        }}
                        placeholder="Masukkan nilai"
                      />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
