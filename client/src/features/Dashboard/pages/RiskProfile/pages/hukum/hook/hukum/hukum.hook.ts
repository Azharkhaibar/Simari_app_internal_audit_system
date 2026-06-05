// src/features/Dashboard/pages/RiskProfile/pages/Hukum/hooks/useHukum.ts
import { useCallback, useEffect, useState } from 'react';
import {
  Quarter,
  computeHasil,
  computeWeightedAuto,
  CreateHukumData,
  CreateHukumSectionData,
  Period,
  HukumIndikator,
  HukumSection,
  hukumApiService,
  transformIndicatorToBackend,
  transformIndicatorToFrontend,
  transformSectionToBackend,
  UpdateHukumData,
  UpdateHukumSectionData,
  SectionsWithIndicatorsResponse,
  DeleteResponse,
} from '../../service/hukum/hukum.service';

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

interface UseHukumOptions {
  initialYear?: number;
  initialQuarter?: Quarter;
  autoLoad?: boolean;
}

interface UseHukumReturn {
  // ========== STATE ==========
  sections: HukumSection[];
  indikators: HukumIndikator[];
  sectionsWithIndicators: Array<HukumSection & { indicators: HukumIndikator[]; totalWeighted: number; indicatorCount: number }>;
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
  getSections: (isActive?: boolean) => Promise<HukumSection[]>;
  getAllIndikators: () => Promise<HukumIndikator[]>;
  getIndikatorsByPeriod: (year: number, quarter: Quarter) => Promise<HukumIndikator[]>;
  getSectionsWithIndicatorsByPeriod: (year: number, quarter: Quarter) => Promise<Array<HukumSection & { indicators: HukumIndikator[]; totalWeighted: number; indicatorCount: number }>>;
  getPeriods: () => Promise<Period[]>;
  searchIndikators: (query?: string, year?: number, quarter?: Quarter) => Promise<HukumIndikator[]>;
  getAllSections: (isActive?: boolean) => Promise<HukumSection[]>;

  // ========== CRUD OPERATIONS ==========
  createSection: (data: CreateHukumSectionData) => Promise<HukumSection>;
  getSectionById: (id: number) => Promise<HukumSection>;
  updateSection: (id: number, data: UpdateHukumSectionData) => Promise<HukumSection>;
  deleteSection: (id: number) => Promise<DeleteResponse>;
  createIndikator: (data: CreateHukumData) => Promise<HukumIndikator>;
  getIndikatorById: (id: number) => Promise<HukumIndikator>;
  updateIndikator: (id: number, data: UpdateHukumData) => Promise<HukumIndikator>;
  deleteIndikator: (id: number) => Promise<DeleteResponse>;

  // ========== HELPER OPERATIONS ==========
  getTotalWeightedByPeriod: (year: number, quarter: Quarter) => Promise<number>;
  calculateTotalWeighted: () => Promise<void>;
  duplicateIndikator: (sourceId: number, targetYear: number, targetQuarter: Quarter) => Promise<HukumIndikator>;
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

export const useHukum = (options?: UseHukumOptions): UseHukumReturn => {
  const { initialYear = new Date().getFullYear(), initialQuarter = 'Q1' as Quarter, autoLoad = true } = options || {};

  // ========== STATE ==========
  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewQuarter, setViewQuarter] = useState<Quarter>(initialQuarter);
  const [query, setQuery] = useState<string>('');

  const [sections, setSections] = useState<HukumSection[]>([]);
  const [indikators, setIndikators] = useState<HukumIndikator[]>([]);
  const [sectionsWithIndicators, setSectionsWithIndicators] = useState<Array<HukumSection & { indicators: HukumIndikator[]; totalWeighted: number; indicatorCount: number }>>([]);
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
  const getSections = useCallback(async (isActive?: boolean): Promise<HukumSection[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.getAllSections(isActive);
      setSections(data);
      return data;
    });
  }, []);

  const getAllSections = useCallback(async (isActive?: boolean): Promise<HukumSection[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.getAllSections(isActive);
      return data;
    });
  }, []);

  const getSectionById = useCallback(async (id: number): Promise<HukumSection> => {
    return withLoading(async () => {
      const data = await hukumApiService.getSectionById(id);
      return data;
    });
  }, []);

  const createSection = useCallback(async (data: CreateHukumSectionData): Promise<HukumSection> => {
    return withLoading(async () => {
      const newSection = await hukumApiService.createSection(data);
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

  const updateSection = useCallback(async (id: number, data: UpdateHukumSectionData): Promise<HukumSection> => {
    return withLoading(async () => {
      const updatedSection = await hukumApiService.updateSection(id, data);
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
      const result = await hukumApiService.deleteSection(id);

      if (result.success) {
        setSections((prev) => prev.filter((section) => section.id !== id));
        setSectionsWithIndicators((prev) => prev.filter((section) => section.id !== id));
      }

      return result;
    });
  }, []);

  // ========== INDIKATOR OPERATIONS ==========
  const getAllIndikators = useCallback(async (): Promise<HukumIndikator[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.getAllIndikators();
      setIndikators(data);
      return data;
    });
  }, []);

  const getIndikatorsByPeriod = useCallback(async (year: number, quarter: Quarter): Promise<HukumIndikator[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.getIndikatorsByPeriod(year, quarter);
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

        const response = await hukumApiService.getSectionsWithIndicatorsByPeriod(targetYear, targetQuarter);

        console.log('📦 Raw response:', response);

        let sectionsData = [];

        if (Array.isArray(response)) {
          sectionsData = response;
        } else if (response?.sections && Array.isArray(response.sections)) {
          sectionsData = response.sections;
        } else if (response?.data && Array.isArray(response.data)) {
          sectionsData = response.data;
        }

        console.log('📊 Extracted sectionsData:', sectionsData);

        sectionsData = sectionsData.map((section) => ({
          ...section,
          indicators: (section.indicators || []).map((ind) => ({
            id: ind.id,
            subNo: ind.subNo || '',
            indikator: ind.indikator || '',
            bobotIndikator: ind.bobotIndikator || 0,
            sumberRisiko: ind.sumberRisiko || '',
            dampak: ind.dampak || '',
            pembilangLabel: ind.pembilangLabel || '',
            pembilangValue: ind.pembilangValue !== null && ind.pembilangValue !== undefined ? ind.pembilangValue.toString() : '',
            penyebutLabel: ind.penyebutLabel || '',
            penyebutValue: ind.penyebutValue !== null && ind.penyebutValue !== undefined ? ind.penyebutValue.toString() : '',
            low: ind.low || '',
            lowToModerate: ind.lowToModerate || '',
            moderate: ind.moderate || '',
            moderateToHigh: ind.moderateToHigh || '',
            high: ind.high || '',
            mode: ind.mode || 'RASIO',
            formula: ind.formula || '',
            isPercent: Boolean(ind.isPercent),
            hasil: ind.hasil !== null ? ind.hasil.toString() : '',
            hasilText: ind.hasilText || '',
            peringkat: ind.peringkat || 1,
            weighted: ind.weighted || '',
            keterangan: ind.keterangan || '',
            sectionId: ind.sectionId || section.id,
            no: section.no,
            sectionLabel: section.parameter,
            bobotSection: section.bobotSection,
            year: section.year || targetYear,
            quarter: section.quarter || targetQuarter,
            isValidated: ind.isValidated || false,
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

  const searchIndikators = useCallback(async (searchQuery?: string, year?: number, quarter?: Quarter): Promise<HukumIndikator[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.searchIndikators(searchQuery, year, quarter);
      return data;
    });
  }, []);

  const getIndikatorById = useCallback(async (id: number): Promise<HukumIndikator> => {
    return withLoading(async () => {
      const data = await hukumApiService.getIndikatorById(id);
      return data;
    });
  }, []);

  const createIndikator = useCallback(async (data: CreateHukumData): Promise<HukumIndikator> => {
    return withLoading(async () => {
      const newIndikator = await hukumApiService.createIndikator(data);

      setIndikators((prev) => [...prev, newIndikator]);

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
    async (id: number, data: UpdateHukumData): Promise<HukumIndikator> => {
      return withLoading(async () => {
        if (data.mode === 'RASIO' && data.penyebutValue === 0) {
          throw new Error('Untuk mode RASIO, nilai penyebut harus lebih besar dari 0');
        }

        const updatedIndikator = await hukumApiService.updateIndikator(id, data);

        const oldIndikator = indikators.find((i) => i.id === id);

        setIndikators((prev) => prev.map((indikator) => (indikator.id === id ? updatedIndikator : indikator)));

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
        const result = await hukumApiService.deleteIndikator(id);

        if (result.success) {
          const deletedIndikator = indikators.find((i) => i.id === id);

          setIndikators((prev) => prev.filter((indikator) => indikator.id !== id));

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
      const total = await hukumApiService.getTotalWeightedByPeriod(year, quarter);
      return total;
    });
  }, []);

  const calculateTotalWeighted = useCallback(async () => {
    try {
      const total = await hukumApiService.getTotalWeightedByPeriod(viewYear, viewQuarter);
      setTotalWeighted(total);
    } catch (err) {
      setTotalWeighted(0);
      handleError(err, `menghitung total weighted periode ${viewYear}-${viewQuarter}`);
    }
  }, [viewYear, viewQuarter]);

  const getPeriods = useCallback(async (): Promise<Period[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.getAvailablePeriods();
      setPeriods(data);
      return data;
    });
  }, []);

  const getPeriodsWithCounts = useCallback(async (): Promise<(Period & { indicatorCount: number })[]> => {
    return withLoading(async () => {
      const data = await hukumApiService.getPeriodsWithCounts();
      return data;
    });
  }, []);

  const getIndikatorCount = useCallback(async (year: number, quarter: Quarter): Promise<number> => {
    return withLoading(async () => {
      const count = await hukumApiService.getIndikatorCount(year, quarter);
      return count;
    });
  }, []);

  const duplicateIndikator = useCallback(async (sourceId: number, targetYear: number, targetQuarter: Quarter): Promise<HukumIndikator> => {
    return withLoading(async () => {
      const newIndikator = await hukumApiService.duplicateIndikator(sourceId, targetYear, targetQuarter);

      setIndikators((prev) => [...prev, newIndikator]);

      return newIndikator;
    });
  }, []);

  // ========== RETURN ==========
  return {
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

    setViewYear,
    setViewQuarter,
    setQuery,
    clearError,

    getSections,
    getAllIndikators,
    getIndikatorsByPeriod,
    getSectionsWithIndicatorsByPeriod,
    getPeriods,
    searchIndikators,
    getAllSections,

    createSection,
    getSectionById,
    updateSection,
    deleteSection,
    createIndikator,
    getIndikatorById,
    updateIndikator,
    deleteIndikator,

    getTotalWeightedByPeriod,
    calculateTotalWeighted,
    duplicateIndikator,
    getIndikatorCount,
    getPeriodsWithCounts,

    transformToBackend: transformIndicatorToBackend,
    transformToFrontend: transformIndicatorToFrontend,
    transformSectionToBackend,
    computeHasil,
    computeWeightedAuto,

    emptyIndicator,
    emptySection,
  };
};
