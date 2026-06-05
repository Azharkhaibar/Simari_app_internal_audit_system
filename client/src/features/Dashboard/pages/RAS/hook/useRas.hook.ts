// src/hooks/useRas.ts
import { useState, useCallback, useEffect } from 'react';
import { rasApi } from '../service/rasService/ras.service';
import { RasData, FilterRasDto, CreateRasDto, UpdateRasDto, TindakLanjut } from '../types/ras.types';

export const useRas = () => {
  const [data, setData] = useState<RasData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Test connection sebelum fetch data
  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.testConnection();
      setIsConnected(result.success);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err: any) {
      setIsConnected(false);
      setError('Gagal menguji koneksi ke server');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all data dengan filter
  const fetchData = useCallback(async (filter?: FilterRasDto) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.getAll(filter);
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.message || 'Gagal mengambil data RAS';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch by year
  const fetchByYear = useCallback(async (year: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.getByYear(year); // ✅ Langsung pakai result
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.message || `Gagal mengambil data tahun ${year}`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch by year and month
  const fetchByYearAndMonth = useCallback(async (year: number, month?: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.getByYearAndMonth(year, month);
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.message || `Gagal mengambil data ${year}-${month}`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch yearly stats
  const fetchYearlyStats = useCallback(async (year: number) => {
    setLoading(true);
    setError(null);

    try {
      return await rasApi.getYearlyStats(year);
    } catch (err: any) {
      const message = err.message || `Gagal mengambil statistik`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single by ID
  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      return await rasApi.getById(id);
    } catch (err: any) {
      const message = err.message || `Gagal mengambil data`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create data
  const createData = useCallback(async (newData: CreateRasDto) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.create(newData);
      setData((prev) => [...prev, result]);
      return result;
    } catch (err: any) {
      const message = err.message || 'Gagal menambah data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update data
  const updateData = useCallback(async (id: string, updateData: UpdateRasDto) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.update(id, updateData);
      setData((prev) => prev.map((item) => (item.id === id ? result : item)));
      return result;
    } catch (err: any) {
      const message = err.message || 'Gagal mengupdate data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update monthly values
  const updateMonthlyValues = useCallback(async (id: string, month: number, values: { num?: number | null; den?: number | null; man?: number | null }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.updateMonthlyValues(id, month, values);
      setData((prev) => prev.map((item) => (item.id === id ? result : item)));
      return result;
    } catch (err: any) {
      const message = err.message || 'Gagal mengupdate nilai bulanan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update tindak lanjut
  const updateTindakLanjut = useCallback(async (id: string, tindakLanjut: TindakLanjut) => {
    setLoading(true);
    setError(null);

    try {
      const result = await rasApi.updateTindakLanjut(id, tindakLanjut);
      setData((prev) => prev.map((item) => (item.id === id ? result : item)));
      return result;
    } catch (err: any) {
      const message = err.message || 'Gagal mengupdate tindak lanjut';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete data
  const deleteData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await rasApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      const message = err.message || 'Gagal menghapus data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const result = await rasApi.getRiskCategories();
      setCategories(result);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
      setCategories(['Operational Risk', 'Financial Risk', 'Strategic Risk']); // Fallback
    }
  }, []);

  // Get follow-up items
  const getFollowUpItems = useCallback(async (year: number, month: number) => {
    try {
      return await rasApi.getFollowUpItems(year, month);
    } catch (err: any) {
      console.error('Gagal mengambil follow-up items:', err);
      throw err;
    }
  }, []);

  // Import data
  const importData = useCallback(
    async (params: { year: number; data: any[]; overrideExisting?: boolean; file?: File }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await rasApi.importData(params);
        // Refresh data
        await fetchData({ year: params.year });
        return result;
      } catch (err: any) {
        const message = err.message || 'Gagal mengimport data';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchData],
  );

  // Export data
  const exportData = useCallback(async (year: number, months: number[]) => {
    try {
      const blob = await rasApi.exportMonthly({ year, months });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAS_${year}_${months.join('_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal mengekspor data');
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Clear data
  const clearData = useCallback(() => {
    setData([]);
    clearError();
  }, [clearError]);

  // Initial fetch categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auto test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  return {
    // State
    data,
    loading,
    error,
    categories,
    isConnected,

    // Connection test
    testConnection,

    // Fetch methods
    fetchData,
    fetchByYear,
    fetchByYearAndMonth,
    fetchYearlyStats,
    fetchById,
    fetchCategories,
    getFollowUpItems,

    // CRUD methods
    createData,
    updateData,
    updateMonthlyValues,
    updateTindakLanjut,
    deleteData,

    // Import/Export
    importData,
    exportData,

    // Utility methods
    clearError,
    clearData,

    // State setters
    setData,
    setLoading,
    setError,
  };
};

export default useRas;
