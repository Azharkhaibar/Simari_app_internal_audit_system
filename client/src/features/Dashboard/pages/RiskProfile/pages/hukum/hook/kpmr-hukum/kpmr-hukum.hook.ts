// src/features/Dashboard/pages/RiskProfile/pages/Hukum/hooks/KPMR/kpmr-hukum.hook.ts

import { useState, useEffect, useCallback } from 'react';
import {
  kpmrHukumApiService,
  KPMRHukumAspect,
  KPMRHukumQuestion,
  KPMRHukumDefinition,
  KPMRHukumScore,
  KPMRHukumFullDataResponse,
  CreateKPMRHukumAspectData,
  UpdateKPMRHukumAspectData,
  CreateKPMRHukumQuestionData,
  UpdateKPMRHukumQuestionData,
  CreateKPMRHukumDefinitionData,
  UpdateKPMRHukumDefinitionData,
  CreateKPMRHukumScoreData,
  UpdateKPMRHukumScoreData,
  Period,
  DeleteResponse,
  transformFullDataToGroups,
} from '../../service/kpmr-hukum/kpmr-hukum.service';

// ===================== INTERFACES =====================

export interface KPMRHukumFilters {
  year?: number;
  quarter?: string;
  aspekNo?: string;
  query?: string;
}

export interface KPMRHukumGroup {
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  sections: Array<{
    sectionNo: string;
    sectionTitle: string;
    definitionId: number;
    level1: string | null;
    level2: string | null;
    level3: string | null;
    level4: string | null;
    level5: string | null;
    evidence: string | null;
    quarters: Record<
      string,
      {
        sectionSkor: number | null;
        id: number;
      }
    >;
  }>;
  quarterAverages: Record<string, number | null>;
}

export interface UseKpmrHukumReturn {
  // ========== STATE ==========
  aspects: KPMRHukumAspect[];
  questions: KPMRHukumQuestion[];
  definitions: KPMRHukumDefinition[];
  scores: KPMRHukumScore[];
  fullData: KPMRHukumFullDataResponse | null;
  groups: KPMRHukumGroup[];
  periods: Period[];
  years: number[];
  viewYear: number;
  viewQuarter: string;
  query: string;
  loading: boolean;
  error: string | null;

  // ========== STATE SETTERS ==========
  setViewYear: (year: number) => void;
  setViewQuarter: (quarter: string) => void;
  setQuery: (query: string) => void;
  clearError: () => void;

  // ========== DATA OPERATIONS ==========
  fetchAllData: (year?: number) => Promise<void>;
  fetchAspects: (year?: number) => Promise<void>;
  fetchQuestions: (year?: number) => Promise<void>;
  fetchDefinitions: (year?: number) => Promise<void>;
  fetchScores: (year?: number, quarter?: string) => Promise<void>;
  fetchFullData: (year: number) => Promise<void>;
  fetchPeriods: () => Promise<void>;
  fetchYears: () => Promise<void>;
  search: (year?: number, query?: string, aspekNo?: string) => Promise<KPMRHukumDefinition[]>;

  // ========== ASPECT CRUD ==========
  createAspect: (data: CreateKPMRHukumAspectData) => Promise<KPMRHukumAspect>;
  updateAspect: (id: number, data: UpdateKPMRHukumAspectData) => Promise<KPMRHukumAspect>;
  deleteAspect: (id: number) => Promise<DeleteResponse>;

  // ========== QUESTION CRUD ==========
  createQuestion: (data: CreateKPMRHukumQuestionData) => Promise<KPMRHukumQuestion>;
  updateQuestion: (id: number, data: UpdateKPMRHukumQuestionData) => Promise<KPMRHukumQuestion>;
  deleteQuestion: (id: number) => Promise<DeleteResponse>;

  // ========== DEFINITION CRUD ==========
  createOrUpdateDefinition: (data: CreateKPMRHukumDefinitionData) => Promise<KPMRHukumDefinition>;
  updateDefinition: (id: number, data: UpdateKPMRHukumDefinitionData) => Promise<KPMRHukumDefinition>;
  deleteDefinition: (definitionId: number, year: number) => Promise<DeleteResponse>;

  // ========== SCORE CRUD ==========
  createOrUpdateScore: (data: CreateKPMRHukumScoreData) => Promise<KPMRHukumScore>;
  updateScore: (id: number, data: UpdateKPMRHukumScoreData) => Promise<KPMRHukumScore>;
  deleteScore: (id: number) => Promise<DeleteResponse>;
  deleteScoreByTarget: (definitionId: number, year: number, quarter: string) => Promise<DeleteResponse>;

  // ========== UTILITIES ==========
  refetch: () => Promise<void>;
  resetState: () => void;
}

interface UseKpmrHukumOptions {
  initialYear?: number;
  initialQuarter?: string;
  autoLoad?: boolean;
}

// ===================== HOOK =====================

export const useKpmrHukum = (options?: UseKpmrHukumOptions): UseKpmrHukumReturn => {
  const { initialYear = new Date().getFullYear(), initialQuarter = 'Q1', autoLoad = true } = options || {};

  // ========== STATE ==========
  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewQuarter, setViewQuarter] = useState<string>(initialQuarter);
  const [query, setQuery] = useState<string>('');
  const [aspects, setAspects] = useState<KPMRHukumAspect[]>([]);
  const [questions, setQuestions] = useState<KPMRHukumQuestion[]>([]);
  const [definitions, setDefinitions] = useState<KPMRHukumDefinition[]>([]);
  const [scores, setScores] = useState<KPMRHukumScore[]>([]);
  const [fullData, setFullData] = useState<KPMRHukumFullDataResponse | null>(null);
  const [groups, setGroups] = useState<KPMRHukumGroup[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ========== UTILITIES ==========
  const clearError = useCallback(() => setError(null), []);

  const resetState = useCallback(() => {
    setAspects([]);
    setQuestions([]);
    setDefinitions([]);
    setScores([]);
    setFullData(null);
    setGroups([]);
    setPeriods([]);
    setYears([]);
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    console.error(`❌ Error during ${operation}:`, err);
    let errorMessage = 'Terjadi kesalahan';
    if (err instanceof Error) errorMessage = err.message;
    else if (typeof err === 'string') errorMessage = err;
    else if (err?.response?.data?.message) errorMessage = err.response.data.message;
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

  // ========== DATA FETCHING ==========
  const fetchAspects = useCallback(
    async (year?: number): Promise<void> => {
      try {
        const data = await withLoading(() => kpmrHukumApiService.getAllAspects(year));
        setAspects(data);
      } catch (err) {
        handleError(err, 'memuat aspek');
      }
    },
    [handleError, withLoading],
  );

  const fetchQuestions = useCallback(
    async (year?: number): Promise<void> => {
      try {
        const data = await withLoading(() => kpmrHukumApiService.getAllQuestions(year));
        setQuestions(data);
      } catch (err) {
        handleError(err, 'memuat pertanyaan');
      }
    },
    [handleError, withLoading],
  );

  const fetchDefinitions = useCallback(
    async (year?: number): Promise<void> => {
      try {
        const targetYear = year || viewYear;
        const data = await withLoading(() => kpmrHukumApiService.getDefinitionsByYear(targetYear));
        setDefinitions(data);
      } catch (err) {
        handleError(err, 'memuat definisi');
      }
    },
    [viewYear, handleError, withLoading],
  );

  const fetchScores = useCallback(
    async (year?: number, quarter?: string): Promise<void> => {
      try {
        const targetYear = year || viewYear;
        const data = await withLoading(() => kpmrHukumApiService.getScoresByPeriod(targetYear, quarter));
        setScores(data);
      } catch (err) {
        handleError(err, 'memuat skor');
      }
    },
    [viewYear, handleError, withLoading],
  );

  const fetchFullData = useCallback(async (year: number): Promise<void> => {
    if (!year || isNaN(year)) return;
    try {
      setLoading(true);
      const data = await kpmrHukumApiService.getFullData(year);
      setFullData(data);
      const transformedGroups = transformFullDataToGroups(data);
      setGroups(transformedGroups);
    } catch (err) {
      console.error(`❌ Error fetching data for year ${year}:`, err);
      setError(err?.response?.data?.message || err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPeriods = useCallback(async (): Promise<void> => {
    try {
      const data = await withLoading(() => kpmrHukumApiService.getPeriods());
      setPeriods(data);
    } catch (err) {
      handleError(err, 'memuat periode');
    }
  }, [handleError, withLoading]);

  const fetchYears = useCallback(async (): Promise<void> => {
    try {
      const data = await withLoading(() => kpmrHukumApiService.getAvailableYears());
      setYears(data);
    } catch (err) {
      handleError(err, 'memuat tahun');
    }
  }, [handleError, withLoading]);

  const fetchAllData = useCallback(
    async (year?: number): Promise<void> => {
      try {
        await withLoading(async () => {
          const targetYear = year || viewYear;
          await Promise.all([fetchAspects(targetYear), fetchQuestions(targetYear), fetchDefinitions(targetYear), fetchScores(targetYear), fetchFullData(targetYear), fetchPeriods(), fetchYears()]);
        });
      } catch (err) {
        handleError(err, 'memuat semua数据');
      }
    },
    [viewYear, fetchAspects, fetchQuestions, fetchDefinitions, fetchScores, fetchFullData, fetchPeriods, fetchYears, handleError, withLoading],
  );

  const search = useCallback(
    async (year?: number, searchQuery?: string, aspekNo?: string): Promise<KPMRHukumDefinition[]> => {
      try {
        return await withLoading(() => kpmrHukumApiService.searchKPMR(year, searchQuery || query, aspekNo));
      } catch (err) {
        handleError(err, 'mencari数据');
        return [];
      }
    },
    [query, handleError, withLoading],
  );

  // ========== INITIAL LOAD ==========
  const loadInitialData = useCallback(async () => {
    try {
      await withLoading(async () => {
        await Promise.all([fetchAspects(), fetchQuestions(), fetchPeriods(), fetchYears()]);
      });
    } catch (err) {
      handleError(err, 'memuat数据 awal');
    }
  }, [fetchAspects, fetchQuestions, fetchPeriods, fetchYears, handleError, withLoading]);

  useEffect(() => {
    if (autoLoad) loadInitialData();
  }, [autoLoad, loadInitialData]);

  useEffect(() => {
    if (autoLoad && viewYear) fetchFullData(viewYear);
  }, [autoLoad, viewYear, fetchFullData]);

  // ========== ASPECT CRUD ==========
  const createAspect = useCallback(
    async (data: CreateKPMRHukumAspectData): Promise<KPMRHukumAspect> => {
      try {
        const newAspect = await withLoading(() => kpmrHukumApiService.createAspect(data));
        setAspects((prev) => [...prev, newAspect]);
        return newAspect;
      } catch (err) {
        throw handleError(err, 'membuat aspek');
      }
    },
    [handleError, withLoading],
  );

  const updateAspect = useCallback(
    async (id: number, data: UpdateKPMRHukumAspectData): Promise<KPMRHukumAspect> => {
      try {
        const updatedAspect = await withLoading(() => kpmrHukumApiService.updateAspect(id, data));
        setAspects((prev) => prev.map((a) => (a.id === id ? updatedAspect : a)));
        return updatedAspect;
      } catch (err) {
        throw handleError(err, `mengupdate aspek ${id}`);
      }
    },
    [handleError, withLoading],
  );

  // HARD DELETE - Hanya ini yang digunakan
  const deleteAspect = useCallback(
    async (id: number): Promise<DeleteResponse> => {
      try {
        const result = await withLoading(() => kpmrHukumApiService.deleteAspect(id));
        if (result.success) {
          setAspects((prev) => prev.filter((a) => a.id !== id));
          await fetchFullData(viewYear);
        }
        return result;
      } catch (err) {
        throw handleError(err, `menghapus aspek ${id}`);
      }
    },
    [handleError, withLoading, fetchFullData, viewYear],
  );

  // ========== QUESTION CRUD ==========
  const createQuestion = useCallback(
    async (data: CreateKPMRHukumQuestionData): Promise<KPMRHukumQuestion> => {
      try {
        const newQuestion = await withLoading(() => kpmrHukumApiService.createQuestion(data));
        setQuestions((prev) => [...prev, newQuestion]);
        return newQuestion;
      } catch (err) {
        throw handleError(err, 'membuat pertanyaan');
      }
    },
    [handleError, withLoading],
  );

  const updateQuestion = useCallback(
    async (id: number, data: UpdateKPMRHukumQuestionData): Promise<KPMRHukumQuestion> => {
      try {
        const updatedQuestion = await withLoading(() => kpmrHukumApiService.updateQuestion(id, data));
        setQuestions((prev) => prev.map((q) => (q.id === id ? updatedQuestion : q)));
        return updatedQuestion;
      } catch (err) {
        throw handleError(err, `mengupdate pertanyaan ${id}`);
      }
    },
    [handleError, withLoading],
  );

  // HARD DELETE - Hanya ini yang digunakan
  const deleteQuestion = useCallback(
    async (id: number): Promise<DeleteResponse> => {
      try {
        console.log(`🗑️ Hook: Deleting question ${id}`);
        const result = await withLoading(() => kpmrHukumApiService.deleteQuestion(id));
        console.log(`✅ Hook: Delete result:`, result);

        if (result.success) {
          setQuestions((prev) => prev.filter((q) => q.id !== id));
          // Refresh full data setelah delete
          await fetchFullData(viewYear);
          await fetchDefinitions(viewYear);
          await fetchQuestions(viewYear);
        }
        return result;
      } catch (err) {
        console.error(`❌ Hook: Error deleting question ${id}:`, err);
        throw handleError(err, `menghapus pertanyaan ${id}`);
      }
    },
    [handleError, withLoading, fetchFullData, viewYear, fetchDefinitions, fetchQuestions],
  );

  // ========== DEFINITION CRUD ==========
  const createOrUpdateDefinition = useCallback(
    async (data: CreateKPMRHukumDefinitionData): Promise<KPMRHukumDefinition> => {
      try {
        const definition = await withLoading(() => kpmrHukumApiService.createOrUpdateDefinition(data));
        await fetchDefinitions(data.year);
        await fetchFullData(data.year);
        return definition;
      } catch (err) {
        throw handleError(err, 'membuat/mengupdate definisi');
      }
    },
    [fetchDefinitions, fetchFullData, handleError, withLoading],
  );

  const updateDefinition = useCallback(
    async (id: number, data: UpdateKPMRHukumDefinitionData): Promise<KPMRHukumDefinition> => {
      try {
        const cleanData: UpdateKPMRHukumDefinitionData = {};
        if (data.aspekTitle !== undefined) cleanData.aspekTitle = data.aspekTitle;
        if (data.aspekBobot !== undefined) cleanData.aspekBobot = data.aspekBobot;
        if (data.sectionTitle !== undefined) cleanData.sectionTitle = data.sectionTitle;
        if (data.level1 !== undefined) cleanData.level1 = data.level1;
        if (data.level2 !== undefined) cleanData.level2 = data.level2;
        if (data.level3 !== undefined) cleanData.level3 = data.level3;
        if (data.level4 !== undefined) cleanData.level4 = data.level4;
        if (data.level5 !== undefined) cleanData.level5 = data.level5;
        if (data.evidence !== undefined) cleanData.evidence = data.evidence;

        const updatedDefinition = await withLoading(() => kpmrHukumApiService.updateDefinition(id, cleanData));
        if (updatedDefinition?.year) {
          await fetchDefinitions(updatedDefinition.year);
          await fetchFullData(updatedDefinition.year);
        }
        return updatedDefinition;
      } catch (err) {
        throw handleError(err, `mengupdate definisi ${id}`);
      }
    },
    [fetchDefinitions, fetchFullData, handleError, withLoading],
  );

  const deleteDefinition = useCallback(
    async (definitionId: number, year: number): Promise<DeleteResponse> => {
      try {
        console.log(`🗑️ Hard deleting definition ${definitionId} for year ${year}`);
        const response = await withLoading(() => kpmrHukumApiService.deleteDefinitionPermanent(definitionId, year));
        console.log('✅ Delete response:', response);

        await fetchFullData(year);
        await fetchDefinitions(year);
        await fetchScores(year);

        return response;
      } catch (err: any) {
        console.error(`❌ Error deleting definition ${definitionId}:`, err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Gagal menghapus data';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchFullData, fetchDefinitions, fetchScores, withLoading],
  );

  // ========== SCORE CRUD ==========
  const createOrUpdateScore = useCallback(
    async (data: CreateKPMRHukumScoreData): Promise<KPMRHukumScore> => {
      try {
        const score = await withLoading(() => kpmrHukumApiService.createOrUpdateScore(data));
        await fetchScores(data.year);
        await fetchFullData(data.year);
        return score;
      } catch (err) {
        throw handleError(err, 'membuat/mengupdate skor');
      }
    },
    [fetchScores, fetchFullData, handleError, withLoading],
  );

  const updateScore = useCallback(
    async (id: number, data: UpdateKPMRHukumScoreData): Promise<KPMRHukumScore> => {
      try {
        const updatedScore = await withLoading(() => kpmrHukumApiService.updateScore(id, data));
        await fetchScores(updatedScore.year);
        await fetchFullData(updatedScore.year);
        return updatedScore;
      } catch (err) {
        throw handleError(err, `mengupdate skor ${id}`);
      }
    },
    [fetchScores, fetchFullData, handleError, withLoading],
  );

  const deleteScore = useCallback(
    async (id: number): Promise<DeleteResponse> => {
      try {
        const result = await withLoading(() => kpmrHukumApiService.deleteScore(id));
        await fetchScores(viewYear);
        await fetchFullData(viewYear);
        return result;
      } catch (err) {
        throw handleError(err, `menghapus skor ${id}`);
      }
    },
    [viewYear, fetchScores, fetchFullData, handleError, withLoading],
  );

  const deleteScoreByTarget = useCallback(
    async (definitionId: number, year: number, quarter: string): Promise<DeleteResponse> => {
      try {
        const response = await withLoading(() => kpmrHukumApiService.deleteScoreByTarget(definitionId, year, quarter));
        await fetchScores(year);
        await fetchFullData(year);
        return response;
      } catch (err) {
        throw handleError(err, `menghapus skor ${definitionId}-${year}-${quarter}`);
      }
    },
    [fetchScores, fetchFullData, handleError, withLoading],
  );

  const refetch = useCallback(async (): Promise<void> => {
    await fetchAllData(viewYear);
  }, [viewYear, fetchAllData]);

  // ========== RETURN ==========
  return {
    aspects,
    questions,
    definitions,
    scores,
    fullData,
    groups,
    periods,
    years,
    viewYear,
    viewQuarter,
    query,
    loading,
    error,
    setViewYear,
    setViewQuarter,
    setQuery,
    clearError,
    fetchAllData,
    fetchAspects,
    fetchQuestions,
    fetchDefinitions,
    fetchScores,
    fetchFullData,
    fetchPeriods,
    fetchYears,
    search,
    createAspect,
    updateAspect,
    deleteAspect,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createOrUpdateDefinition,
    updateDefinition,
    deleteDefinition,
    createOrUpdateScore,
    updateScore,
    deleteScore,
    deleteScoreByTarget,
    refetch,
    resetState,
  };
};
