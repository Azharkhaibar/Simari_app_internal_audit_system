// hooks/rekap-data2.hook.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { RISK_SOURCES } from '../utils/rekapdata2.utils';

const API_BASE_URL = 'http://localhost:5530/api/v1';

// Helper untuk logging
const logRequest = (method, url, data = null) => {
  console.log(`🌐 ${method} ${url}`, data || '');
};

const logResponse = (url, status, data) => {
  if (status >= 200 && status < 300) {
    console.log(`✅ ${url} - ${status}`, data);
  } else {
    console.error(`❌ ${url} - ${status}`, data);
  }
};

// ===================== useRekapData2State =====================
export const useRekapData2State = (year, quarter) => {
  const [investasiRows, setInvestasiRows] = useState([]);
  const [pasarRows, setPasarRows] = useState([]);
  const [likuiditasRows, setLikuiditasRows] = useState([]);
  const [operasionalRows, setOperasionalRows] = useState([]);
  const [hukumRows, setHukumRows] = useState([]);
  const [stratejikRows, setStratejikRows] = useState([]);
  const [kepatuhanRows, setKepatuhanRows] = useState([]);
  const [reputasiRows, setReputasiRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!year || !quarter) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/triwulan/all?year=${year}&quarter=${quarter}`;
    logRequest('GET', url);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Data received:', {
        investasi: data.investasiRows?.length || 0,
        pasar: data.pasarRows?.length || 0,
        likuiditas: data.likuiditasRows?.length || 0,
        operasional: data.operasionalRows?.length || 0,
        hukum: data.hukumRows?.length || 0,
        stratejik: data.stratejikRows?.length || 0,
        kepatuhan: data.kepatuhanRows?.length || 0,
        reputasi: data.reputasiRows?.length || 0,
      });

      setInvestasiRows(data.investasiRows || []);
      setPasarRows(data.pasarRows || []);
      setLikuiditasRows(data.likuiditasRows || []);
      setOperasionalRows(data.operasionalRows || []);
      setHukumRows(data.hukumRows || []);
      setStratejikRows(data.stratejikRows || []);
      setKepatuhanRows(data.kepatuhanRows || []);
      setReputasiRows(data.reputasiRows || []);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('❌ Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, quarter]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const allRows = {
    INVESTASI: investasiRows,
    PASAR: pasarRows,
    LIKUIDITAS: likuiditasRows,
    OPERASIONAL: operasionalRows,
    HUKUM: hukumRows,
    STRATEJIK: stratejikRows,
    KEPATUHAN: kepatuhanRows,
    REPUTASI: reputasiRows,
  };

  const setters = {
    INVESTASI: setInvestasiRows,
    PASAR: setPasarRows,
    LIKUIDITAS: setLikuiditasRows,
    OPERASIONAL: setOperasionalRows,
    HUKUM: setHukumRows,
    STRATEJIK: setStratejikRows,
    KEPATUHAN: setKepatuhanRows,
    REPUTASI: setReputasiRows,
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
    allRows,
    setters,
    loading,
    error,
    refresh: fetchData,
  };
};

// ===================== useRekapData2Tahunan =====================
export const useRekapData2Tahunan = (year) => {
  const [tahunanData, setTahunanData] = useState({
    investasiRows: [],
    pasarRows: [],
    likuiditasRows: [],
    operasionalRows: [],
    hukumRows: [],
    stratejikRows: [],
    kepatuhanRows: [],
    reputasiRows: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchTahunanData = useCallback(async () => {
    if (!year) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/tahunan/all?year=${year}`;
    logRequest('GET', url);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setTahunanData(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('❌ Error fetching tahunan data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchTahunanData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTahunanData]);

  return {
    tahunanData,
    loading,
    error,
    refresh: fetchTahunanData,
  };
};

// ===================== useRekapData2Dashboard =====================
export const useRekapData2Dashboard = (year, quarter) => {
  const [dashboardData, setDashboardData] = useState({
    rows: [],
    skorProfil: { inherent: 0, kpmr: 0, net: 0 },
    isEmpty: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    if (!year || !quarter) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/dashboard?year=${year}&quarter=${quarter}`;
    logRequest('GET', url);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Dashboard data received:', data);
      setDashboardData(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, quarter]);

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

// ===================== useRekapData2Filters =====================
export const useRekapData2Filters = () => {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState(RISK_SOURCES);
  const [selectedSections, setSelectedSections] = useState({});
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [sectionFilterOpen, setSectionFilterOpen] = useState(false);

  const toggleSource = useCallback((src) => {
    setSelectedSources((prev) => (prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]));
  }, []);

  const toggleSection = useCallback((source, sectionName) => {
    setSelectedSections((prev) => {
      const current = prev[source] || [];
      const next = current.includes(sectionName) ? current.filter((s) => s !== sectionName) : [...current, sectionName];
      const updated = { ...prev, [source]: next };
      if (updated[source].length === 0) delete updated[source];
      return updated;
    });
  }, []);

  const toggleQuarter = useCallback((q) => {
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

// ===================== useUpdateRow =====================
export const useUpdateRow = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateRow = useCallback(async (source, year, quarter, rowKey, field, value) => {
    setUpdating(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/update`;
    const body = { source, year, quarter, rowKey, field, value };
    logRequest('POST', url, body);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('❌ Error updating row:', err);
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    updateRow,
    updating,
    error,
  };
};

// ===================== useImportExcel =====================
export const useImportExcel = () => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  const importExcel = useCallback(async (file, year, quarter) => {
    setImporting(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/import`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year.toString());
    formData.append('quarter', quarter);

    logRequest('POST', url, { fileName: file.name, year, quarter });

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('❌ Error importing excel:', err);
      setError(err.message);
      throw err;
    } finally {
      setImporting(false);
    }
  }, []);

  return {
    importExcel,
    importing,
    error,
  };
};

// ===================== useCleanupDuplicates =====================
export const useCleanupDuplicates = () => {
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState(null);

  const cleanupDuplicates = useCallback(async (year, quarter) => {
    setCleaning(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/cleanup?year=${year}&quarter=${quarter}`;
    logRequest('DELETE', url);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('❌ Error cleaning up duplicates:', err);
      setError(err.message);
      throw err;
    } finally {
      setCleaning(false);
    }
  }, []);

  return {
    cleanupDuplicates,
    cleaning,
    error,
  };
};

// ===================== useGetSections =====================
export const useGetSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSections = useCallback(async (source, year, quarter) => {
    setLoading(true);
    setError(null);

    const url = `${API_BASE_URL}/rekap-data2/sections/${source}?year=${year}&quarter=${quarter}`;
    logRequest('GET', url);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      logResponse(url, response.status, null);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setSections(data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching sections:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sections,
    loading,
    error,
    fetchSections,
  };
};
