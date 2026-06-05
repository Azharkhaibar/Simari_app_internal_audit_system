// src/features/Dashboard/pages/Ringkasan/hooks/index.ts

import { useState, useEffect } from 'react';
import { useHeaderStore } from '../../../store/header';
import { calculateTotalWeighted, filterRowsByKategori } from '../utils/ringkasan.utils';
import { CATEGORIES } from '../contants/ringkasan.contants';
import { ringkasanService, normalizePageData, buildQueryParams, PageData, KategoriFilter } from '../services/ringkasan.service';

// ============================================================
// HOOK: useCategorySelection
// ============================================================

export const useCategorySelection = () => {
  const [selectedPages, setSelectedPages] = useState<string[]>(() => CATEGORIES.map((c: { id: string }) => c.id));

  const selectAll = () => setSelectedPages(CATEGORIES.map((c: { id: string }) => c.id));
  const deselectAll = () => setSelectedPages([]);
  const toggleAll = () => (selectedPages.length === CATEGORIES.length ? deselectAll() : selectAll());
  const togglePage = (id: string) => setSelectedPages((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return { selectedPages, selectAll, deselectAll, toggleAll, togglePage };
};

// ============================================================
// HOOK: useKategoriFilter
// ============================================================

export const useKategoriFilter = () => {
  const [filter, setFilter] = useState<KategoriFilter>({
    model: '',
    prinsip: '',
    jenis: '',
    underlying: [],
  });

  const resetFilter = () => setFilter({ model: '', prinsip: '', jenis: '', underlying: [] });

  const updateFilter = (key: keyof KategoriFilter, value: string | string[]) => {
    setFilter((prev) => {
      const newFilter = { ...prev, [key]: value };
      if (key === 'model') {
        if (value === 'tanpa_model') {
          return { ...newFilter, prinsip: '', jenis: '', underlying: [] };
        }
        return { ...newFilter, jenis: '', underlying: [] };
      }
      return newFilter;
    });
  };

  const toggleUnderlying = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      underlying: prev.underlying.includes(value) ? prev.underlying.filter((v) => v !== value) : [...prev.underlying, value],
    }));
  };

  return { filter, updateFilter, toggleUnderlying, resetFilter };
};

// ============================================================
// HOOK: useSummaryData
// ============================================================

export const useSummaryData = (selectedPages: string[], kategoriFilter: KategoriFilter) => {
  const { year, activeQuarter } = useHeaderStore();
  const [summaryData, setSummaryData] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPages.length === 0) {
      setSummaryData([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const queryParams = buildQueryParams(year, activeQuarter, selectedPages, kategoriFilter);
        const data = await ringkasanService.fetchRingkasan(queryParams);
        const normalized = normalizePageData(data, kategoriFilter, filterRowsByKategori, calculateTotalWeighted);
        setSummaryData(normalized);
      } catch (error) {
        console.error('Error fetching ringkasan data:', error);
        setSummaryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedPages, year, activeQuarter, kategoriFilter]);

  return { summaryData, isLoading };
};
