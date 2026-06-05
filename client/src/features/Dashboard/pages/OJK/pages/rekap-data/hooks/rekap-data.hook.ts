// src/ojk/rekap/hooks/rekap-data.hook.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import rekapApiService from '../services/rekap-data.service';
import computeDerived from '../../../utils/compute/compute-derived';
import { normalizeRekapRows, shouldIncludeInFilter } from '../utils/rekap-data.utils';
import { CATEGORIES, PAGE_SIZE } from '../contants/rekap-data.contants';

// ==================== TYPES ====================
export interface UpdateRawValueParams {
  categoryId: string;
  paramId: number;
  itemId: number;
  field: 'value' | 'valuePembilang' | 'valuePenyebut';
  value: string | number | null;
}

export interface KategoriFilter {
  model: string;
  prinsip: string;
  jenis: string;
  underlying: string[];
}

export interface RekapNilaiItem {
  id: number;
  nomor: string;
  bobot: number;
  portofolio: string;
  keterangan: string;
  judul: {
    type?: string;
    text?: string;
    value?: string | number | null;
    pembilang?: string;
    valuePembilang?: string | number | null;
    penyebut?: string;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };
  riskindikator: {
    low?: string;
    lowToModerate?: string;
    moderate?: string;
    moderateToHigh?: string;
    high?: string;
  };
  orderIndex: number;
  derived?: {
    hasilDisplay?: string | number;
    weighted?: number;
    peringkat?: number;
  };
}

export interface RekapParameterItem {
  id: number;
  categoryId: string;
  categoryLabel: string;
  year: number;
  quarter: number;
  nomor: string;
  judul: string;
  bobot: number;
  kategori: {
    model?: string;
    prinsip?: string;
    jenis?: string;
    underlying?: string[];
  };
  orderIndex: number;
  nilaiList: RekapNilaiItem[];
}

// ==================== SCROLL DRAG HOOK ====================
export function useScrollDrag(kategoriScrollRef: React.RefObject<HTMLDivElement | null>) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!kategoriScrollRef.current) return;
      setIsDragging(true);
      setStartX(e.pageX - kategoriScrollRef.current.offsetLeft);
      setScrollLeft(kategoriScrollRef.current.scrollLeft);
      kategoriScrollRef.current.style.cursor = 'grabbing';
      kategoriScrollRef.current.style.userSelect = 'none';
    },
    [kategoriScrollRef],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !kategoriScrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - kategoriScrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      kategoriScrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft, kategoriScrollRef],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (kategoriScrollRef.current) {
      kategoriScrollRef.current.style.cursor = 'grab';
      kategoriScrollRef.current.style.removeProperty('user-select');
    }
  }, [kategoriScrollRef]);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (kategoriScrollRef.current) {
        kategoriScrollRef.current.style.cursor = 'grab';
      }
    }
  }, [isDragging, kategoriScrollRef]);

  return { isDragging, handleMouseDown, handleMouseLeave };
}

// ==================== HORIZONTAL SCROLL HOOK ====================
export function useHorizontalScroll(kategoriScrollRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = kategoriScrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (isInside && container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 2;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [kategoriScrollRef]);
}

// ==================== NORMALIZE FUNCTIONS ====================
export const normalizeItemWithDerived = (item: any, param: any): RekapNilaiItem | null => {
  if (!item) return null;

  const judul = item?.judul || {};

  const normalizedItem: RekapNilaiItem = {
    id: item.id,
    nomor: item.nomor || '',
    bobot: Number(item.bobot ?? 0),
    portofolio: item.portofolio || '',
    keterangan: item.keterangan || '',
    judul: {
      type: judul?.type || 'Tanpa Faktor',
      text: judul?.text || '',
      value: judul?.value ?? null,
      pembilang: judul?.pembilang || '',
      valuePembilang: judul?.valuePembilang ?? null,
      penyebut: judul?.penyebut || '',
      valuePenyebut: judul?.valuePenyebut ?? null,
      formula: judul?.formula || '',
      percent: judul?.percent || false,
    },
    riskindikator: item?.riskindikator || {},
    orderIndex: item.orderIndex || 0,
  };

  normalizedItem.derived = computeDerived(normalizedItem, param);
  return normalizedItem;
};

export const normalizeRekapRows = (rows: any[]): RekapParameterItem[] => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((r) => {
      if (!r) return null;

      return {
        id: r.id,
        categoryId: r.categoryId,
        categoryLabel: r.categoryLabel,
        year: r.year,
        quarter: r.quarter,
        nomor: r.nomor || '',
        judul: r.judul || '',
        bobot: Number(r.bobot ?? 0),
        kategori: r.kategori || { model: '', prinsip: '', jenis: '', underlying: [] },
        orderIndex: r.orderIndex || 0,
        nilaiList: Array.isArray(r.nilaiList) ? (r.nilaiList.map((item: any) => normalizeItemWithDerived(item, r)).filter(Boolean) as RekapNilaiItem[]) : [],
      };
    })
    .filter(Boolean) as RekapParameterItem[];
};

// ==================== MAIN REKAP HOOK ====================
export function useRekapData(year: number | null, quarter: number | null) {
  const [dataMap, setDataMap] = useState<Record<string, RekapParameterItem[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>(['operasional']);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<KategoriFilter>({
    model: '',
    prinsip: '',
    jenis: '',
    underlying: [],
  });
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showUnsaveModal, setShowUnsaveModal] = useState(false);

  // ==================== LOAD DATA ====================
  const loadData = useCallback(async () => {
    if (!year || !quarter) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📡 [useRekapData] Fetching data for ${selectedPages.length} categories...`);

      const response = await rekapApiService.getAllRekapData({
        year,
        quarter,
        categories: selectedPages,
        search: search || undefined,
        model: filter.model || undefined,
        prinsip: filter.prinsip || undefined,
        jenis: filter.jenis || undefined,
        underlying: filter.underlying.length > 0 ? filter.underlying : undefined,
      });

      if (response.success && response.data) {
        const normalizedMap: Record<string, RekapParameterItem[]> = {};
        Object.keys(response.data).forEach((catId) => {
          normalizedMap[catId] = normalizeRekapRows(response.data[catId] || []);
        });
        setDataMap(normalizedMap);
        setHasUnsavedChanges(false);
        console.log(`✅ [useRekapData] Data loaded for ${Object.keys(normalizedMap).length} categories`);
      } else {
        throw new Error(response.message || 'Gagal memuat data');
      }
    } catch (err: any) {
      console.error('❌ [useRekapData] Error:', err);
      setError(err.message || 'Gagal memuat data');
      setDataMap({});
    } finally {
      setIsLoading(false);
    }
  }, [year, quarter, selectedPages, search, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== REAL-TIME SYNC ====================
  useEffect(() => {
    const handleRealTimeSync = () => {
      loadData();
    };

    window.addEventListener('risk-data-updated', handleRealTimeSync);
    return () => {
      window.removeEventListener('risk-data-updated', handleRealTimeSync);
    };
  }, [loadData]);

  // ==================== UPDATE RAW VALUE (HANYA STATE, TIDAK SAVE) ====================
  const updateRawValue = useCallback(({ categoryId, paramId, itemId, field, value }: UpdateRawValueParams) => {
    setDataMap((prev) => {
      const newDataMap = structuredClone(prev);
      const categoryData = newDataMap[categoryId];
      if (!categoryData) return prev;

      const paramIndex = categoryData.findIndex((p) => p.id === paramId);
      if (paramIndex === -1) return prev;

      const itemIndex = categoryData[paramIndex].nilaiList.findIndex((n) => n.id === itemId);
      if (itemIndex === -1) return prev;

      const updatedItem = { ...categoryData[paramIndex].nilaiList[itemIndex] };

      if (field === 'value') {
        updatedItem.judul.value = value;
        updatedItem.judul.valuePembilang = value;
      } else if (field === 'valuePembilang') {
        updatedItem.judul.valuePembilang = value;
      } else if (field === 'valuePenyebut') {
        updatedItem.judul.valuePenyebut = value;
      }

      updatedItem.derived = computeDerived(updatedItem, categoryData[paramIndex]);

      const updatedNilaiList = [...categoryData[paramIndex].nilaiList];
      updatedNilaiList[itemIndex] = updatedItem;

      const updatedParam = { ...categoryData[paramIndex], nilaiList: updatedNilaiList };
      const updatedCategory = [...categoryData];
      updatedCategory[paramIndex] = updatedParam;

      newDataMap[categoryId] = updatedCategory;

      console.log('🚀 Updated raw value:', { categoryId, paramId, itemId, field, value });
      return newDataMap;
    });

    // HANYA set flag, TIDAK save per item
    setHasUnsavedChanges(true);
  }, []);

  // ==================== SAVE ALL CHANGES (BATCH SAVE) ====================
  const saveAllChanges = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [catId, params] of Object.entries(dataMap)) {
      for (const param of params) {
        for (const nilai of param.nilaiList) {
          try {
            await rekapApiService.updateNilaiValue({
              categoryId: catId,
              paramId: param.id,
              itemId: nilai.id,
              value: nilai.judul.value ?? undefined,
              valuePembilang: nilai.judul.valuePembilang ?? undefined,
              valuePenyebut: nilai.judul.valuePenyebut ?? undefined,
            });
            successCount++;
          } catch (err) {
            errorCount++;
            console.error(`Failed to save nilai ${nilai.id}:`, err);
          }
        }
      }
    }

    setHasUnsavedChanges(false);
    setIsLoading(false);

    // Notifikasi sync ke semua halaman
    window.dispatchEvent(new CustomEvent('risk-data-updated'));

    if (errorCount === 0) {
      alert(`Data berhasil disimpan! (${successCount} item)`);
    } else {
      alert(`⚠️ ${successCount} berhasil, ${errorCount} gagal`);
    }
  }, [dataMap, hasUnsavedChanges]);

  // ==================== FLATTENED ROWS ====================
  const flattenedRows = useMemo(() => {
    const result: (RekapParameterItem & { _categoryId: string; _categoryLabel: string })[] = [];

    Object.entries(dataMap).forEach(([catId, params]) => {
      if (!selectedPages.includes(catId)) return;

      params.forEach((param) => {
        if (search) {
          const s = search.toLowerCase();
          const hit = (param.judul || '').toLowerCase().includes(s) || String(param.nomor || '').includes(s);
          if (!hit) return;
        }

        if (!shouldIncludeInFilter(param, filter)) return;

        if (param.nilaiList && param.nilaiList.length > 0) {
          result.push({
            ...param,
            _categoryId: catId,
            _categoryLabel: CATEGORIES.find((c) => c.id === catId)?.label || catId,
          });
        }
      });
    });

    return result;
  }, [dataMap, selectedPages, search, filter]);

  // ==================== CATEGORY SELECTION ====================
  const selectAllPages = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setSelectedPages(CATEGORIES.map((c) => c.id));
        setHasUnsavedChanges(false);
      });
      setShowUnsaveModal(true);
    } else {
      setSelectedPages(CATEGORIES.map((c) => c.id));
    }
  }, [hasUnsavedChanges]);

  const deselectAllPages = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setSelectedPages([]);
        setHasUnsavedChanges(false);
      });
      setShowUnsaveModal(true);
    } else {
      setSelectedPages([]);
    }
  }, [hasUnsavedChanges]);

  const togglePage = useCallback(
    (id: string) => {
      if (hasUnsavedChanges) {
        setPendingAction(() => () => {
          setSelectedPages((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            return [...prev, id];
          });
          setHasUnsavedChanges(false);
        });
        setShowUnsaveModal(true);
      } else {
        setSelectedPages((prev) => {
          if (prev.includes(id)) return prev.filter((x) => x !== id);
          return [...prev, id];
        });
      }
    },
    [hasUnsavedChanges],
  );

  // ==================== FILTER ====================
  const updateFilter = useCallback((newFilter: Partial<KategoriFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  // ==================== REFRESH ====================
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // ==================== MODAL ====================
  const confirmAction = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowUnsaveModal(false);
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setShowUnsaveModal(false);
  }, []);

  return {
    // State
    dataMap,
    isLoading,
    error,
    selectedPages,
    hasUnsavedChanges,
    search,
    filter,
    flattenedRows,
    showUnsaveModal,
    pendingAction,

    // Data operations
    loadData,
    refreshData,
    updateRawValue,
    saveAllChanges,

    // Category selection
    selectAllPages,
    deselectAllPages,
    togglePage,
    setSelectedPages,

    // Filter & search
    updateFilter,
    setSearch,
    setFilter,

    // Modal (untuk main page)
    setHasUnsavedChanges,
    setShowUnsaveModal,
    setPendingAction,
    confirmAction,
    cancelAction,
  };
}

export default useRekapData;
