// src/hooks/useRiskProfileRepository.ts
import { useState, useCallback, useEffect, useRef } from 'react';
// import riskProfileRepositoryService, { AvailablePeriod, ModuleInfo, PaginationOptions, RepositoryFilters, RepositoryResponse, RepositoryStatistics, RiskProfileRepositoryDto } from '../services/riskProfileRepositoryService';
// import { ModuleType, Quarter } from '../types/riskProfileRepository.types';
import { ModuleType, Quarter } from '../types/riskprofilerepository.types';

import riskProfileRepositoryService, { AvailablePeriod, ModuleInfo, PaginationOptions, RepositoryFilters, RepositoryResponse, RepositoryStatistics, RiskProfileRepositoryDto } from '../services/riskprofilerepository.service';
interface UseRiskProfileRepositoryOptions {
  initialFilters?: RepositoryFilters;
  initialPagination?: PaginationOptions;
  autoFetch?: boolean;
}

export const useRiskProfileRepository = (options: UseRiskProfileRepositoryOptions = {}) => {
  const { initialFilters = {}, initialPagination = { page: 1, limit: 100 }, autoFetch = true } = options;

  // State
  const [data, setData] = useState<RiskProfileRepositoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RepositoryFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);
  const [response, setResponse] = useState<RepositoryResponse | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [periods, setPeriods] = useState<AvailablePeriod[]>([]);
  const [statistics, setStatistics] = useState<RepositoryStatistics | null>(null);

  // Ref untuk mencegah multiple fetch
  const isFetching = useRef(false);

  // Memoized fetch function
  const fetchRepositoryData = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);

      const result = await riskProfileRepositoryService.getRepositoryData(filters, pagination);
      setResponse(result);
      setData(result.data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repository data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [filters, pagination]);

  // Memoized fetch by module function
  const fetchByModule = useCallback(
    async (module: ModuleType) => {
      try {
        setLoading(true);
        setError(null);
        const result = await riskProfileRepositoryService.getRepositoryDataByModule(module, filters, pagination);
        setResponse(result);
        setData(result.data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to fetch module ${module} data`;
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination]
  );

  // Memoized search function
  const searchData = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await riskProfileRepositoryService.searchRepositoryData(query, filters, pagination);
        setResponse(result);
        setData(result.data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search data';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination]
  );

  // Memoized fetch statistics function
  const fetchStatistics = useCallback(async (year: number, quarter: Quarter) => {
    try {
      setLoading(true);
      setError(null);
      const result = await riskProfileRepositoryService.getRepositoryStatistics(year, quarter);
      setStatistics(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized fetch modules function
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const result = await riskProfileRepositoryService.getAvailableModules();
      setModules(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setModules([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized fetch periods function
  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const result = await riskProfileRepositoryService.getAvailablePeriods();
      setPeriods(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch periods:', err);
      setPeriods([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized export function
  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      await riskProfileRepositoryService.downloadCsvExport(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Filter setters
  const updateFilter = useCallback((key: keyof RepositoryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setYearFilter = useCallback(
    (year?: number) => {
      updateFilter('year', year);
    },
    [updateFilter]
  );

  const setQuarterFilter = useCallback(
    (quarter?: Quarter) => {
      updateFilter('quarter', quarter);
    },
    [updateFilter]
  );

  const setModuleTypesFilter = useCallback(
    (moduleTypes?: ModuleType[]) => {
      updateFilter('moduleTypes', moduleTypes);
    },
    [updateFilter]
  );

  const setSearchFilter = useCallback(
    (searchQuery?: string) => {
      updateFilter('searchQuery', searchQuery);
    },
    [updateFilter]
  );

  const setValidationFilter = useCallback(
    (isValidated?: boolean) => {
      updateFilter('isValidated', isValidated);
    },
    [updateFilter]
  );

  const setDateRangeFilter = useCallback(
    (startDate?: Date, endDate?: Date) => {
      updateFilter('startDate', startDate);
      updateFilter('endDate', endDate);
    },
    [updateFilter]
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPagination(initialPagination);
  }, [initialFilters, initialPagination]);

  // Pagination setters
  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: 'ASC' | 'DESC' = 'ASC') => {
    setPagination((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const nextPage = useCallback(() => {
    if (response && response.page < response.totalPages) {
      goToPage(response.page + 1);
    }
  }, [response, goToPage]);

  const prevPage = useCallback(() => {
    if (response && response.page > 1) {
      goToPage(response.page - 1);
    }
  }, [response, goToPage]);

  // Effect untuk membersihkan fetch saat unmount
  useEffect(() => {
    return () => {
      isFetching.current = false;
    };
  }, []);

  // Effect for auto-fetch on filter/pagination change
  useEffect(() => {
    if (autoFetch) {
      fetchRepositoryData();
    }
  }, [filters, pagination, autoFetch, fetchRepositoryData]);

  // Effect for initial data loading
  useEffect(() => {
    if (autoFetch) {
      const loadInitialData = async () => {
        await Promise.all([fetchModules(), fetchPeriods()]);
      };
      loadInitialData();
    }
  }, [autoFetch]);

  // Utility functions
  const getModuleColor = (moduleType: ModuleType): string => {
    const module = modules.find((m) => m.code === moduleType);
    return module?.color || '#6B7280';
  };

  const getModuleName = (moduleType: ModuleType): string => {
    const module = modules.find((m) => m.code === moduleType);
    return module?.name || moduleType;
  };

  return {
    // Data
    data,
    response,
    modules,
    periods,
    statistics,

    // State
    loading,
    error,
    filters,
    pagination,

    // Actions
    fetchRepositoryData,
    fetchByModule,
    searchData,
    fetchStatistics,
    fetchModules,
    fetchPeriods,
    exportData,

    // Filter setters
    setYearFilter,
    setQuarterFilter,
    setModuleTypesFilter,
    setSearchFilter,
    setValidationFilter,
    setDateRangeFilter,
    resetFilters,
    updateFilter,

    // Pagination setters
    goToPage,
    setPageSize,
    setSort,
    nextPage,
    prevPage,

    // Utility functions
    getModuleColor,
    getModuleName,
  };
};

// Hook for module-specific data
export const useModuleRepository = (module: ModuleType, options?: UseRiskProfileRepositoryOptions) => {
  const repository = useRiskProfileRepository({
    ...options,
    initialFilters: {
      ...options?.initialFilters,
      moduleTypes: [module],
    },
  });

  return {
    ...repository,
    // Override resetFilters untuk reset ke module yang spesifik
    resetFilters: useCallback(() => {
      repository.setFilters({
        ...options?.initialFilters,
        moduleTypes: [module],
      });
      repository.setPagination(options?.initialPagination || { page: 1, limit: 100 });
    }, [repository, module, options]),
  };
};

export const useRiskProfileRepositoryOjk = (options: UseRiskProfileRepositoryOptions = {}) => {
  const { initialFilters = {}, initialPagination = { page: 1, limit: 100 }, autoFetch = true } = options;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>(initialFilters);
  const [pagination, setPagination] = useState<any>(initialPagination);
  const [response, setResponse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any | null>(null);

  const isFetching = useRef(false);

  const fetchRepositoryData = useCallback(async () => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);
      const result = await riskProfileRepositoryService.getOjkRepositoryData(filters, pagination);
      setResponse(result);
      setData(result.data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch OJK repository data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [filters, pagination]);

  const fetchStatistics = useCallback(async (year: number, quarter: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await riskProfileRepositoryService.getOjkRepositoryStatistics(year, quarter);
      setStatistics(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const result = await riskProfileRepositoryService.getOjkAvailableModules();
      setModules(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setModules([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const result = await riskProfileRepositoryService.getOjkAvailablePeriods();
      setPeriods(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch periods:', err);
      setPeriods([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setYearFilter = useCallback((year?: number) => { updateFilter('year', year); }, [updateFilter]);
  const setQuarterFilter = useCallback((quarter?: any) => { updateFilter('quarter', quarter); }, [updateFilter]);
  const setModuleTypesFilter = useCallback((moduleTypes?: any[]) => { updateFilter('moduleTypes', moduleTypes); }, [updateFilter]);
  const setSearchFilter = useCallback((searchQuery?: string) => { updateFilter('searchQuery', searchQuery); }, [updateFilter]);
  const resetFilters = useCallback(() => { setFilters(initialFilters); setPagination(initialPagination); }, [initialFilters, initialPagination]);

  const goToPage = useCallback((page: number) => { setPagination((prev) => ({ ...prev, page })); }, []);
  const setPageSize = useCallback((limit: number) => { setPagination((prev) => ({ ...prev, limit, page: 1 })); }, []);
  const setSort = useCallback((sortBy: string, sortOrder: 'ASC' | 'DESC' = 'ASC') => { setPagination((prev) => ({ ...prev, sortBy, sortOrder })); }, []);

  useEffect(() => {
    return () => { isFetching.current = false; };
  }, []);

  useEffect(() => {
    if (autoFetch) { fetchRepositoryData(); }
  }, [filters, pagination, autoFetch, fetchRepositoryData]);

  useEffect(() => {
    if (autoFetch) {
      const loadInitialData = async () => {
        await Promise.all([fetchModules(), fetchPeriods()]);
      };
      loadInitialData();
    }
  }, [autoFetch]);

  const getModuleColor = (moduleType: any): string => {
    const module = modules.find((m) => m.code === moduleType);
    return module?.color || '#6B7280';
  };

  const getModuleName = (moduleType: any): string => {
    const module = modules.find((m) => m.code === moduleType);
    return module?.name || moduleType;
  };

  return {
    data,
    response,
    modules,
    periods,
    statistics,
    loading,
    error,
    filters,
    pagination,
    fetchRepositoryData,
    fetchStatistics,
    fetchModules,
    fetchPeriods,
    setYearFilter,
    setQuarterFilter,
    setModuleTypesFilter,
    setSearchFilter,
    resetFilters,
    updateFilter,
    goToPage,
    setPageSize,
    setSort,
    getModuleColor,
    getModuleName,
  };
};
