// src/features/Dashboard/pages/RiskProfile/hooks/riskprofilerepository-ojk.hook.js
import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useRiskProfileRepositoryOjk = ({ initialFilters, initialPagination, autoFetch = true }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters || {});
  const [pagination, setPagination] = useState(initialPagination || { page: 1, limit: 100 });
  
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, []);

  const fetchRepositoryData = useCallback(async () => {
    // Cegah duplicate fetch
    const fetchKey = JSON.stringify({ filters, pagination });
    if (loadingRef.current || fetchKey === lastFetchRef.current) {
      console.log('⏳ [OJK Hook] Skipping duplicate fetch');
      return data;
    }
    
    loadingRef.current = true;
    lastFetchRef.current = fetchKey;
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.year) params.append('year', filters.year);
      if (filters.quarter) params.append('quarter', filters.quarter);
      
      // Module types (array)
      if (filters.moduleTypes && filters.moduleTypes.length > 0) {
        filters.moduleTypes.forEach(m => params.append('moduleTypes[]', m));
      }
      
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      
      // Pagination
      params.append('page', pagination.page || 1);
      params.append('limit', pagination.limit ?? 100);

      // URL tanpa /api/v1 karena sudah ada di main.ts backend
      const url = `${API_BASE_URL}/risk-profile-repository-ojk?${params.toString()}`;
      
      console.log('🔄 [OJK Hook] Fetching:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!mountedRef.current) return [];
      
      // Handle response format
      let responseData = [];
      if (result?.data) {
        responseData = result.data;
      } else if (Array.isArray(result)) {
        responseData = result;
      }
      
      console.log(`✅ [OJK Hook] Fetched ${responseData.length} records`);
      
      if (mountedRef.current) {
        setData(responseData);
      }
      
      return responseData;
    } catch (err) {
      if (!mountedRef.current) return [];
      
      const errorMsg = err.message || 'Gagal memuat data OJK';
      console.error('❌ [OJK Hook] Error:', errorMsg);
      
      if (mountedRef.current) {
        setError(errorMsg);
      }
      return [];
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, pagination, data]);

  // Auto fetch when filters/pagination change
  useEffect(() => {
    if (autoFetch && mountedRef.current) {
      const timeoutId = setTimeout(() => {
        fetchRepositoryData();
      }, 150); // Debounce 150ms
      return () => clearTimeout(timeoutId);
    }
  }, [
    filters.year, 
    filters.quarter, 
    JSON.stringify(filters.moduleTypes), 
    filters.searchQuery, 
    pagination.page, 
    pagination.limit
  ]);

  const setYearFilter = useCallback((year) => {
    setFilters(prev => ({ ...prev, year }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset page
  }, []);

  const setQuarterFilter = useCallback((quarter) => {
    setFilters(prev => ({ ...prev, quarter }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset page
  }, []);

  const setModuleTypesFilter = useCallback((moduleTypes) => {
    setFilters(prev => ({ ...prev, moduleTypes }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset page
  }, []);

  const setSearchFilter = useCallback((searchQuery) => {
    setFilters(prev => ({ ...prev, searchQuery }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset page
  }, []);

  const setPageSize = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 })); // Reset page
  }, []);

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters || {});
    setPagination(initialPagination || { page: 1, limit: 100 });
    lastFetchRef.current = ''; // Reset fetch cache
  }, [initialFilters, initialPagination]);

  // Manual refresh
  const refresh = useCallback(() => {
    lastFetchRef.current = ''; // Reset fetch cache
    return fetchRepositoryData();
  }, [fetchRepositoryData]);

  return {
    data,
    loading,
    error,
    filters,
    pagination,
    fetchRepositoryData,
    refresh,
    setYearFilter,
    setQuarterFilter,
    setModuleTypesFilter,
    setSearchFilter,
    setPageSize,
    setPage,
    resetFilters,
  };
};

export default useRiskProfileRepositoryOjk;