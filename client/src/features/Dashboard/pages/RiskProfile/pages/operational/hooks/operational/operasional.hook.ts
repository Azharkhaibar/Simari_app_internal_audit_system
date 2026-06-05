// src/features/Dashboard/pages/RiskProfile/pages/Operasional/hooks/useOperasional.ts
import { useCallback, useEffect, useState } from 'react';
import {
  Quarter,
  computeHasil,
  computeWeightedAuto,
  CreateOperasionalData,
  CreateOperasionalSectionData,
  Period,
  OperasionalIndikator,
  OperasionalSection,
  operasionalApiService,
  transformIndicatorToBackend,
  transformIndicatorToFrontend,
  transformSectionToBackend,
  UpdateOperasionalData,
  UpdateOperasionalSectionData,
  SectionsWithIndicatorsResponse,
  DeleteResponse,
} from '../../services/operational/operasional.service';

// EMPTY TEMPLATES
export const emptyIndicator = {
  id: null,
  subNo: '',
  indikator: '',
  mode: 'RASIO' as const,
  formula: '',
  isPercent: false,
  bobotIndikator: 0,
  sumberRisiko: '',
  dampak: '',
  pembilangLabel: '',
  pembilangValue: '',
  penyebutLabel: '',
  penyebutValue: '',
  peringkat: 1,
  weighted: '',
  hasil: '',
  hasilText: '',
  keterangan: '',
  low: '',
  lowToModerate: '',
  moderate: '',
  moderateToHigh: '',
  high: '',
  sectionId: null,
  year: new Date().getFullYear(),
  quarter: 'Q1' as Quarter,
};

export const emptySection = {
  id: null,
  no: '',
  bobotSection: 100,
  parameter: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  year: new Date().getFullYear(),
  quarter: 'Q1' as Quarter,
};

interface UseOperasionalOptions {
  initialYear?: number;
  initialQuarter?: Quarter;
  autoLoad?: boolean;
}

interface UseOperasionalReturn {
  // ========== STATE ==========
  sections: OperasionalSection[];
  indikators: OperasionalIndikator[];
  sectionsWithIndicators: Array<OperasionalSection & { indicators: OperasionalIndikator[]; totalWeighted: number; indicatorCount: number }>;
  periods: Period[];
  viewYear: number;
  viewQuarter: Quarter;
  query: string;
  loading: boolean;
  error: string | null;
  totalWeighted: number;

  // ========== STATE SETTERS ==========
  setViewYear: (year: number) => void;
  setViewQuarter: (quarter: Quarter) => void;
  setQuery: (query: string) => void;
  clearError: () => void;

  // ========== DATA OPERATIONS ==========
  getSections: (isActive?: boolean) => Promise<OperasionalSection[]>;
  getAllIndikators: () => Promise<OperasionalIndikator[]>;
  getIndikatorsByPeriod: (year: number, quarter: Quarter) => Promise<OperasionalIndikator[]>;
  getSectionsWithIndicatorsByPeriod: (year: number, quarter: Quarter) => Promise<Array<OperasionalSection & { indicators: OperasionalIndikator[]; totalWeighted: number; indicatorCount: number }>>;
  getPeriods: () => Promise<Period[]>;
  searchIndikators: (query?: string, year?: number, quarter?: Quarter) => Promise<OperasionalIndikator[]>;
  getAllSections: (isActive?: boolean) => Promise<OperasionalSection[]>;

  // ========== CRUD OPERATIONS ==========
  createSection: (data: CreateOperasionalSectionData) => Promise<OperasionalSection>;
  getSectionById: (id: number) => Promise<OperasionalSection>;
  updateSection: (id: number, data: UpdateOperasionalSectionData) => Promise<OperasionalSection>;
  deleteSection: (id: number) => Promise<DeleteResponse>;
  createIndikator: (data: CreateOperasionalData) => Promise<OperasionalIndikator>;
  getIndikatorById: (id: number) => Promise<OperasionalIndikator>;
  updateIndikator: (id: number, data: UpdateOperasionalData) => Promise<OperasionalIndikator>;
  deleteIndikator: (id: number) => Promise<DeleteResponse>;

  // ========== HELPER OPERATIONS ==========
  getTotalWeightedByPeriod: (year: number, quarter: Quarter) => Promise<number>;
  calculateTotalWeighted: () => Promise<void>;
  duplicateIndikator: (sourceId: number, targetYear: number, targetQuarter: Quarter) => Promise<OperasionalIndikator>;
  getIndikatorCount: (year: number, quarter: Quarter) => Promise<number>;
  getPeriodsWithCounts: () => Promise<(Period & { indicatorCount: number })[]>;

  // ========== TRANSFORMATIONS ==========
  transformToBackend: typeof transformIndicatorToBackend;
  transformToFrontend: typeof transformIndicatorToFrontend;
  transformSectionToBackend: typeof transformSectionToBackend;
  computeHasil: typeof computeHasil;
  computeWeightedAuto: typeof computeWeightedAuto;

  // ========== TEMPLATES ==========
  emptyIndicator: typeof emptyIndicator;
  emptySection: typeof emptySection;
}

export const useOperasional = (options?: UseOperasionalOptions): UseOperasionalReturn => {
  const { initialYear = new Date().getFullYear(), initialQuarter = 'Q1' as Quarter, autoLoad = true } = options || {};

  // ========== STATE ==========
  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewQuarter, setViewQuarter] = useState<Quarter>(initialQuarter);
  const [query, setQuery] = useState<string>('');

  const [sections, setSections] = useState<OperasionalSection[]>([]);
  const [indikators, setIndikators] = useState<OperasionalIndikator[]>([]);
  const [sectionsWithIndicators, setSectionsWithIndicators] = useState<Array<OperasionalSection & { indicators: OperasionalIndikator[]; totalWeighted: number; indicatorCount: number }>>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [totalWeighted, setTotalWeighted] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (autoLoad) {
      loadInitialData();
    }
  }, []);

  useEffect(() => {
    if (autoLoad && viewYear && viewQuarter) {
      loadDataByPeriod();
    }
  }, [viewYear, viewQuarter]);

  // ========== UTILITIES ==========
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    console.error(`❌ Error during ${operation}:`, err);

    let errorMessage = 'Terjadi kesalahan';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    setError(errorMessage);
    throw err;
  }, []);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== DATA LOADING ==========
  const loadInitialData = useCallback(async () => {
    try {
      await withLoading(async () => {
        await Promise.all([getSections(), getPeriods(), getSectionsWithIndicatorsByPeriod(viewYear, viewQuarter)]);
      });
    } catch (err) {
      handleError(err, 'memuat data awal');
    }
  }, [viewYear, viewQuarter]);

  const loadDataByPeriod = useCallback(async () => {
    try {
      await withLoading(async () => {
        await getSectionsWithIndicatorsByPeriod(viewYear, viewQuarter);
        await calculateTotalWeighted();
      });
    } catch (err) {
      handleError(err, `memuat data periode ${viewYear}-${viewQuarter}`);
    }
  }, [viewYear, viewQuarter]);

  // ========== SECTION OPERATIONS ==========
  const getSections = useCallback(async (isActive?: boolean): Promise<OperasionalSection[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getAllSections(isActive);
      setSections(data);
      return data;
    });
  }, []);

  const getAllSections = useCallback(async (isActive?: boolean): Promise<OperasionalSection[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getAllSections(isActive);
      return data;
    });
  }, []);

  const getSectionById = useCallback(async (id: number): Promise<OperasionalSection> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getSectionById(id);
      return data;
    });
  }, []);

  const createSection = useCallback(async (data: CreateOperasionalSectionData): Promise<OperasionalSection> => {
    return withLoading(async () => {
      const newSection = await operasionalApiService.createSection(data);
      setSections((prev) => {
        if (prev.some((s) => s.id === newSection.id)) return prev;
        return [...prev, newSection];
      });
      setSectionsWithIndicators((prev) => {
        if (prev.some((s) => s.id === newSection.id)) return prev;
        return [
          ...prev,
          {
            ...newSection,
            indicators: [],
            totalWeighted: 0,
            indicatorCount: 0,
          },
        ];
      });
      return newSection;
    });
  }, []);

  const updateSection = useCallback(async (id: number, data: UpdateOperasionalSectionData): Promise<OperasionalSection> => {
    return withLoading(async () => {
      const updatedSection = await operasionalApiService.updateSection(id, data);
      setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...updatedSection } : section)));
      setSectionsWithIndicators((prev) =>
        prev.map((section) =>
          section.id === id
            ? { ...section, ...updatedSection }
            : section
        )
      );
      return updatedSection;
    });
  }, []);

  const deleteSection = useCallback(async (id: number): Promise<DeleteResponse> => {
    return withLoading(async () => {
      const result = await operasionalApiService.deleteSection(id);

      if (result.success) {
        setSections((prev) => prev.filter((section) => section.id !== id));
        setSectionsWithIndicators((prev) => prev.filter((section) => section.id !== id));
      }

      return result;
    });
  }, []);

  // ========== INDIKATOR OPERATIONS ==========
  const getAllIndikators = useCallback(async (): Promise<OperasionalIndikator[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getAllIndikators();
      setIndikators(data);
      return data;
    });
  }, []);

  const getIndikatorsByPeriod = useCallback(async (year: number, quarter: Quarter): Promise<OperasionalIndikator[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getIndikatorsByPeriod(year, quarter);
      setIndikators(data);
      return data;
    });
  }, []);

  const getSectionsWithIndicatorsByPeriod = useCallback(
    async (year: number, quarter: Quarter): Promise<any> => {
      return withLoading(async () => {
        const targetYear = Number(year);
        const targetQuarter = String(quarter) as Quarter;

        console.log(`📡 Hook: Calling getSectionsWithIndicatorsByPeriod for ${targetYear}-${targetQuarter}`);

        const response = await operasionalApiService.getSectionsWithIndicatorsByPeriod(targetYear, targetQuarter);

        console.log('📦 Raw response:', response);

        // ADAPTASI STRUKTUR RESPONSE
        let sectionsData = [];

        // Jika response langsung array
        if (Array.isArray(response)) {
          sectionsData = response;
        }
        // Jika response punya properti sections
        else if (response?.sections && Array.isArray(response.sections)) {
          sectionsData = response.sections;
        }
        // Jika response punya properti data
        else if (response?.data && Array.isArray(response.data)) {
          sectionsData = response.data;
        }

        console.log('📊 Extracted sectionsData:', sectionsData);

        // Mapping data yang lengkap
        sectionsData = sectionsData.map((section) => ({
          ...section,
          indicators: (section.indicators || []).map((ind) => ({
            id: ind.id,
            subNo: ind.subNo || '',
            indikator: ind.indikator || '',
            bobotIndikator: ind.bobotIndikator || 0,
            sumberRisiko: ind.sumberRisiko || '',
            dampak: ind.dampak || '',
            // === PEMBILANG & PENYEBUT ===
            pembilangLabel: ind.pembilangLabel || '',
            pembilangValue: ind.pembilangValue !== null && ind.pembilangValue !== undefined ? ind.pembilangValue.toString() : '',
            penyebutLabel: ind.penyebutLabel || '',
            penyebutValue: ind.penyebutValue !== null && ind.penyebutValue !== undefined ? ind.penyebutValue.toString() : '',
            // === RISK LEVELS ===
            low: ind.low || '',
            lowToModerate: ind.lowToModerate || '',
            moderate: ind.moderate || '',
            moderateToHigh: ind.moderateToHigh || '',
            high: ind.high || '',
            // === METODE & HASIL ===
            mode: ind.mode || 'RASIO',
            formula: ind.formula || '',
            isPercent: Boolean(ind.isPercent),
            hasil: ind.hasil !== null ? ind.hasil.toString() : '',
            hasilText: ind.hasilText || '',
            peringkat: ind.peringkat || 1,
            weighted: ind.weighted || '',
            keterangan: ind.keterangan || '',
            // === INFORMASI SECTION ===
            sectionId: ind.sectionId || section.id,
            no: section.no,
            sectionLabel: section.parameter,
            bobotSection: section.bobotSection,
            year: section.year || targetYear,
            quarter: section.quarter || targetQuarter,
            isValidated: ind.isValidated || false,
            // === FIELD KOMPATIBILITAS DENGAN DATATABLE ===
            numeratorLabel: ind.pembilangLabel || '',
            numeratorValue: ind.pembilangValue !== null && ind.pembilangValue !== undefined ? ind.pembilangValue.toString() : '',
            denominatorLabel: ind.penyebutLabel || '',
            denominatorValue: ind.penyebutValue !== null && ind.penyebutValue !== undefined ? ind.penyebutValue.toString() : '',
          })),
          totalWeighted: section.totalWeighted || 0,
          indicatorCount: section.indicatorCount || 0,
        }));

        console.log('📊 Data sections setelah mapping:', sectionsData);

        setSectionsWithIndicators(sectionsData);
        return sectionsData;
      });
    },
    [withLoading],
  );

  const searchIndikators = useCallback(async (searchQuery?: string, year?: number, quarter?: Quarter): Promise<OperasionalIndikator[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.searchIndikators(searchQuery, year, quarter);
      return data;
    });
  }, []);

  const getIndikatorById = useCallback(async (id: number): Promise<OperasionalIndikator> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getIndikatorById(id);
      return data;
    });
  }, []);

  const createIndikator = useCallback(async (data: CreateOperasionalData): Promise<OperasionalIndikator> => {
    return withLoading(async () => {
      const newIndikator = await operasionalApiService.createIndikator(data);

      // Update indikators list
      setIndikators((prev) => [...prev, newIndikator]);

      // Update sections with indicators
      setSectionsWithIndicators((prev) => {
        const sectionIndex = prev.findIndex((s) => s.id === data.sectionId);
        if (sectionIndex !== -1) {
          const updated = [...prev];
          const section = updated[sectionIndex];
          const mappedIndikator = {
            ...newIndikator,
            sectionId: newIndikator.sectionId || section.id,
            no: section.no,
            sectionLabel: section.parameter,
            bobotSection: section.bobotSection,
            year: section.year,
            quarter: section.quarter,
            numeratorLabel: newIndikator.pembilangLabel || '',
            numeratorValue: newIndikator.pembilangValue !== null && newIndikator.pembilangValue !== undefined ? newIndikator.pembilangValue.toString() : '',
            denominatorLabel: newIndikator.penyebutLabel || '',
            denominatorValue: newIndikator.penyebutValue !== null && newIndikator.penyebutValue !== undefined ? newIndikator.penyebutValue.toString() : '',
          };
          updated[sectionIndex] = {
            ...section,
            indicators: [...section.indicators, mappedIndikator],
            indicatorCount: section.indicatorCount + 1,
            totalWeighted: section.totalWeighted + (newIndikator.weighted || 0),
          };
          return updated;
        }
        return prev;
      });

      return newIndikator;
    });
  }, []);

  const updateIndikator = useCallback(
    async (id: number, data: UpdateOperasionalData): Promise<OperasionalIndikator> => {
      return withLoading(async () => {
        if (data.mode === 'RASIO' && data.penyebutValue === 0) {
          throw new Error('Untuk mode RASIO, nilai penyebut harus lebih besar dari 0');
        }

        const updatedIndikator = await operasionalApiService.updateIndikator(id, data);

        // Find old indikator untuk adjust totalWeighted
        const oldIndikator = indikators.find((i) => i.id === id);

        // Update indikators list
        setIndikators((prev) => prev.map((indikator) => (indikator.id === id ? updatedIndikator : indikator)));

        // Update sections with indicators
        setSectionsWithIndicators((prev) =>
          prev.map((section) => {
            const indicatorIndex = section.indicators.findIndex((i) => i.id === id);
            if (indicatorIndex !== -1) {
              const newIndicators = [...section.indicators];
              const mappedIndikator = {
                ...newIndicators[indicatorIndex],
                ...updatedIndikator,
                sectionId: updatedIndikator.sectionId || section.id,
                no: section.no,
                sectionLabel: section.parameter,
                bobotSection: section.bobotSection,
                year: section.year,
                quarter: section.quarter,
                numeratorLabel: updatedIndikator.pembilangLabel || '',
                numeratorValue: updatedIndikator.pembilangValue !== null && updatedIndikator.pembilangValue !== undefined ? updatedIndikator.pembilangValue.toString() : '',
                denominatorLabel: updatedIndikator.penyebutLabel || '',
                denominatorValue: updatedIndikator.penyebutValue !== null && updatedIndikator.penyebutValue !== undefined ? updatedIndikator.penyebutValue.toString() : '',
              };
              newIndicators[indicatorIndex] = mappedIndikator;

              // Recalculate totalWeighted
              const newTotalWeighted = newIndicators.reduce((sum, ind) => sum + (ind.weighted || 0), 0);

              return {
                ...section,
                indicators: newIndicators,
                totalWeighted: newTotalWeighted,
              };
            }
            return section;
          }),
        );

        return updatedIndikator;
      });
    },
    [indikators],
  );

  const deleteIndikator = useCallback(
    async (id: number): Promise<DeleteResponse> => {
      return withLoading(async () => {
        const result = await operasionalApiService.deleteIndikator(id);

        if (result.success) {
          // Find indikator untuk adjust totalWeighted
          const deletedIndikator = indikators.find((i) => i.id === id);

          // Update indikators list
          setIndikators((prev) => prev.filter((indikator) => indikator.id !== id));

          // Update sections with indicators
          setSectionsWithIndicators((prev) =>
            prev.map((section) => {
              const newIndicators = section.indicators.filter((i) => i.id !== id);
              const newTotalWeighted = newIndicators.reduce((sum, ind) => sum + (ind.weighted || 0), 0);

              return {
                ...section,
                indicators: newIndicators,
                indicatorCount: newIndicators.length,
                totalWeighted: newTotalWeighted,
              };
            }),
          );
        }

        return result;
      });
    },
    [indikators],
  );

  // ========== HELPER OPERATIONS ==========
  const getTotalWeightedByPeriod = useCallback(async (year: number, quarter: Quarter): Promise<number> => {
    return withLoading(async () => {
      const total = await operasionalApiService.getTotalWeightedByPeriod(year, quarter);
      return total;
    });
  }, []);

  const calculateTotalWeighted = useCallback(async () => {
    try {
      const total = await operasionalApiService.getTotalWeightedByPeriod(viewYear, viewQuarter);
      setTotalWeighted(total);
    } catch (err) {
      setTotalWeighted(0);
      handleError(err, `menghitung total weighted periode ${viewYear}-${viewQuarter}`);
    }
  }, [viewYear, viewQuarter]);

  const getPeriods = useCallback(async (): Promise<Period[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getAvailablePeriods();
      setPeriods(data);
      return data;
    });
  }, []);

  const getPeriodsWithCounts = useCallback(async (): Promise<(Period & { indicatorCount: number })[]> => {
    return withLoading(async () => {
      const data = await operasionalApiService.getPeriodsWithCounts();
      return data;
    });
  }, []);

  const getIndikatorCount = useCallback(async (year: number, quarter: Quarter): Promise<number> => {
    return withLoading(async () => {
      const count = await operasionalApiService.getIndikatorCount(year, quarter);
      return count;
    });
  }, []);

  const duplicateIndikator = useCallback(async (sourceId: number, targetYear: number, targetQuarter: Quarter): Promise<OperasionalIndikator> => {
    return withLoading(async () => {
      const newIndikator = await operasionalApiService.duplicateIndikator(sourceId, targetYear, targetQuarter);

      setIndikators((prev) => [...prev, newIndikator]);

      return newIndikator;
    });
  }, []);

  // ========== RETURN ==========
  return {
    // State
    sections,
    indikators,
    sectionsWithIndicators,
    periods,
    viewYear,
    viewQuarter,
    query,
    loading,
    error,
    totalWeighted,

    // State setters
    setViewYear,
    setViewQuarter,
    setQuery,
    clearError,

    // Data operations
    getSections,
    getAllIndikators,
    getIndikatorsByPeriod,
    getSectionsWithIndicatorsByPeriod,
    getPeriods,
    searchIndikators,
    getAllSections,

    // CRUD operations
    createSection,
    getSectionById,
    updateSection,
    deleteSection,
    createIndikator,
    getIndikatorById,
    updateIndikator,
    deleteIndikator,

    // Helper operations
    getTotalWeightedByPeriod,
    calculateTotalWeighted,
    duplicateIndikator,
    getIndikatorCount,
    getPeriodsWithCounts,

    // Transformations
    transformToBackend: transformIndicatorToBackend,
    transformToFrontend: transformIndicatorToFrontend,
    transformSectionToBackend,
    computeHasil,
    computeWeightedAuto,

    // Templates
    emptyIndicator,
    emptySection,
  };
};
