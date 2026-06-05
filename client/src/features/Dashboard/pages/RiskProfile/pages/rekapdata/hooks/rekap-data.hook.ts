// hooks/rekap-data.hook.ts
import { useState, useCallback, useEffect } from 'react';
import { RISK_SOURCES } from '../utils/rekap-data.utils';
import { rekapDataAPI } from '../services/rekap-data-api';

// ===================== TYPES =====================
export interface NormalizedRow {
  id: number;
  year: number;
  quarter: string;
  no: string;
  subNo: string;
  sectionLabel: string;
  indikator: string;
  numeratorLabel: string;
  numeratorValue: number | null;
  pembilangLabel: string;
  pembilangValue: number | null;
  denominatorLabel: string;
  denominatorValue: number | null;
  penyebutLabel: string;
  penyebutValue: number | null;
  isPercent: boolean;
  mode: string;
  formula: string;
  hasil: number | null;
  hasilText: string;
  low: string;
  lowToModerate: string;
  moderate: string;
  moderateToHigh: string;
  high: string;
  peringkat: number;
  weighted: number;
  bobotSection: number;
  bobotIndikator: number;
  sumberRisiko: string;
  dampak: string;
  keterangan: string;
}

export interface NormalizedSection {
  id: number;
  year: number;
  quarter: string;
  no: string;
  parameter: string;
  indicators: NormalizedRow[];
  [key: string]: unknown;
}

interface AllRows {
  INVESTASI: NormalizedRow[];
  PASAR: NormalizedRow[];
  LIKUIDITAS: NormalizedRow[];
  OPERASIONAL: NormalizedRow[];
  HUKUM: NormalizedRow[];
  STRATEJIK: NormalizedRow[];
  KEPATUHAN: NormalizedRow[];
  REPUTASI: NormalizedRow[];
}

interface Setters {
  INVESTASI: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  PASAR: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  LIKUIDITAS: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  OPERASIONAL: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  HUKUM: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  STRATEJIK: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  KEPATUHAN: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  REPUTASI: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  HUKUM_SECTIONS: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  OPERASIONAL_SECTIONS: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  STRATEJIK_SECTIONS: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  KEPATUHAN_SECTIONS: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  REPUTASI_SECTIONS: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
}

interface RekapDataStateReturn {
  investasiRows: NormalizedRow[];
  setInvestasiRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  pasarRows: NormalizedRow[];
  setPasarRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  likuiditasRows: NormalizedRow[];
  setLikuiditasRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  operasionalRows: NormalizedRow[];
  setOperasionalRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  hukumRows: NormalizedRow[];
  setHukumRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  stratejikRows: NormalizedRow[];
  setStratejikRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  kepatuhanRows: NormalizedRow[];
  setKepatuhanRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  reputasiRows: NormalizedRow[];
  setReputasiRows: React.Dispatch<React.SetStateAction<NormalizedRow[]>>;
  operasionalSections: NormalizedSection[];
  setOperasionalSections: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  hukumSections: NormalizedSection[];
  setHukumSections: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  stratejikSections: NormalizedSection[];
  setStratejikSections: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  kepatuhanSections: NormalizedSection[];
  setKepatuhanSections: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  reputasiSections: NormalizedSection[];
  setReputasiSections: React.Dispatch<React.SetStateAction<NormalizedSection[]>>;
  allRows: AllRows;
  setters: Setters;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface RekapDataFiltersReturn {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedSources: string[];
  setSelectedSources: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSections: Record<string, string[]>;
  setSelectedSections: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  selectedQuarters: string[];
  setSelectedQuarters: React.Dispatch<React.SetStateAction<string[]>>;
  sectionFilterOpen: boolean;
  setSectionFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSource: (src: string) => void;
  toggleSection: (source: string, sectionName: string) => void;
  toggleQuarter: (q: string) => void;
  resetSections: () => void;
}

interface RekapDataPersistReturn {
  reloadSections: () => void;
  updateRowAPI: (source: string, rowKey: string, field: string, value: unknown, year: number, quarter: string) => Promise<NormalizedRow>;
  importExcelAPI: (file: File, year: number, quarter: string) => Promise<{ totalImported: number }>;
  cleanupDuplicatesAPI: (year: number, quarter: string) => Promise<{ removed: number }>;
  saving: boolean;
}

// ===================== useRekapDataState =====================
export const useRekapDataState = (year: number, quarter: string, mode: string): RekapDataStateReturn => {
  const [investasiRows, setInvestasiRows] = useState<NormalizedRow[]>([]);
  const [pasarRows, setPasarRows] = useState<NormalizedRow[]>([]);
  const [likuiditasRows, setLikuiditasRows] = useState<NormalizedRow[]>([]);
  const [operasionalRows, setOperasionalRows] = useState<NormalizedRow[]>([]);
  const [hukumRows, setHukumRows] = useState<NormalizedRow[]>([]);
  const [stratejikRows, setStratejikRows] = useState<NormalizedRow[]>([]);
  const [kepatuhanRows, setKepatuhanRows] = useState<NormalizedRow[]>([]);
  const [reputasiRows, setReputasiRows] = useState<NormalizedRow[]>([]);

  const [operasionalSections, setOperasionalSections] = useState<NormalizedSection[]>([]);
  const [hukumSections, setHukumSections] = useState<NormalizedSection[]>([]);
  const [stratejikSections, setStratejikSections] = useState<NormalizedSection[]>([]);
  const [kepatuhanSections, setKepatuhanSections] = useState<NormalizedSection[]>([]);
  const [reputasiSections, setReputasiSections] = useState<NormalizedSection[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (mode === 'triwulan') {
        response = await rekapDataAPI.getTriwulanData(year, quarter);
      } else {
        response = await rekapDataAPI.getTahunanData(year);
      }

      const data = response.data;

      setInvestasiRows(data.investasiRows || []);
      setPasarRows(data.pasarRows || []);
      setLikuiditasRows(data.likuiditasRows || []);
      setOperasionalRows(data.operasionalRows || []);
      setHukumRows(data.hukumRows || []);
      setStratejikRows(data.stratejikRows || []);
      setKepatuhanRows(data.kepatuhanRows || []);
      setReputasiRows(data.reputasiRows || []);

      setOperasionalSections(data.operasionalSections || []);
      setHukumSections(data.hukumSections || []);
      setStratejikSections(data.stratejikSections || []);
      setKepatuhanSections(data.kepatuhanSections || []);
      setReputasiSections(data.reputasiSections || []);
    } catch (err: unknown) {
      console.error('Error fetching rekap data:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  }, [year, quarter, mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allRows: AllRows = {
    INVESTASI: investasiRows,
    PASAR: pasarRows,
    LIKUIDITAS: likuiditasRows,
    OPERASIONAL: operasionalRows,
    HUKUM: hukumRows,
    STRATEJIK: stratejikRows,
    KEPATUHAN: kepatuhanRows,
    REPUTASI: reputasiRows,
  };

  const setters: Setters = {
    INVESTASI: setInvestasiRows,
    PASAR: setPasarRows,
    LIKUIDITAS: setLikuiditasRows,
    OPERASIONAL: setOperasionalRows,
    HUKUM: setHukumRows,
    STRATEJIK: setStratejikRows,
    KEPATUHAN: setKepatuhanRows,
    REPUTASI: setReputasiRows,
    HUKUM_SECTIONS: setHukumSections,
    OPERASIONAL_SECTIONS: setOperasionalSections,
    STRATEJIK_SECTIONS: setStratejikSections,
    KEPATUHAN_SECTIONS: setKepatuhanSections,
    REPUTASI_SECTIONS: setReputasiSections,
  };

  return {
    investasiRows,
    setInvestasiRows,
    pasarRows,
    setPasarRows,
    likuiditasRows,
    setLikuiditasRows,
    operasionalRows,
    setOperasionalRows,
    hukumRows,
    setHukumRows,
    stratejikRows,
    setStratejikRows,
    kepatuhanRows,
    setKepatuhanRows,
    reputasiRows,
    setReputasiRows,
    operasionalSections,
    setOperasionalSections,
    hukumSections,
    setHukumSections,
    stratejikSections,
    setStratejikSections,
    kepatuhanSections,
    setKepatuhanSections,
    reputasiSections,
    setReputasiSections,
    allRows,
    setters,
    loading,
    error,
    refresh: fetchData,
  };
};

// ===================== useRekapDataFilters =====================
export const useRekapDataFilters = (): RekapDataFiltersReturn => {
  const [query, setQuery] = useState<string>('');
  const [selectedSources, setSelectedSources] = useState<string[]>(RISK_SOURCES);
  const [selectedSections, setSelectedSections] = useState<Record<string, string[]>>({});
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [sectionFilterOpen, setSectionFilterOpen] = useState<boolean>(false);

  const toggleSource = useCallback((src: string) => {
    setSelectedSources((prev) => (prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]));
  }, []);

  const toggleSection = useCallback((source: string, sectionName: string) => {
    setSelectedSections((prev) => {
      const current = prev[source] || [];
      const next = current.includes(sectionName) ? current.filter((s) => s !== sectionName) : [...current, sectionName];
      const updated = { ...prev, [source]: next };
      if (updated[source].length === 0) delete updated[source];
      return updated;
    });
  }, []);

  const toggleQuarter = useCallback((q: string) => {
    setSelectedQuarters((prev) => (prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]));
  }, []);

  const resetSections = useCallback(() => setSelectedSections({}), []);

  return {
    query,
    setQuery,
    selectedSources,
    setSelectedSources,
    selectedSections,
    setSelectedSections,
    selectedQuarters,
    setSelectedQuarters,
    sectionFilterOpen,
    setSectionFilterOpen,
    toggleSource,
    toggleSection,
    toggleQuarter,
    resetSections,
  };
};

// ===================== useRekapDataPersist =====================
export const useRekapDataPersist = (setters: Setters, refresh: () => void): RekapDataPersistReturn => {
  const [saving, setSaving] = useState<boolean>(false);

  const updateRowAPI = useCallback(
    async (source: string, rowKey: string, field: string, value: unknown, year: number, quarter: string): Promise<NormalizedRow> => {
      setSaving(true);
      try {
        const response = await rekapDataAPI.updateRow({
          source,
          year,
          quarter,
          rowKey,
          field,
          value,
        });

        refresh();

        return response.data;
      } catch (err) {
        console.error('Error updating row:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const importExcelAPI = useCallback(
    async (file: File, year: number, quarter: string): Promise<{ totalImported: number }> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', String(year));
      formData.append('quarter', quarter);

      try {
        const response = await rekapDataAPI.importExcel(formData);

        refresh();

        return response.data;
      } catch (err) {
        console.error('Error importing Excel:', err);
        throw err;
      }
    },
    [refresh],
  );

  const cleanupDuplicatesAPI = useCallback(
    async (year: number, quarter: string): Promise<{ removed: number }> => {
      try {
        const response = await rekapDataAPI.cleanupDuplicates(year, quarter);

        refresh();

        return response.data;
      } catch (err) {
        console.error('Error cleaning up duplicates:', err);
        throw err;
      }
    },
    [refresh],
  );

  const reloadSections = useCallback(() => {
    refresh();
  }, [refresh]);

  return {
    reloadSections,
    updateRowAPI,
    importExcelAPI,
    cleanupDuplicatesAPI,
    saving,
  };
};
