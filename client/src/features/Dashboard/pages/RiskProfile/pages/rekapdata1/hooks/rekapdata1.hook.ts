// hooks/rekapdata1.hook.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
// import { rekapDataAPI, BhzConfig, BvtConfig, RekapResult } from '../services/rekap-data-api.service';
import { rekapDataAPI, BhzConfig, BvtConfig, RekapResult } from '../service/rekap-data-api.service';
import { hitungSkorKPMR, hitungSummary, hitungSkorInheren, hitungPeringkatRisiko, hitungKompositA, hitungKompositB } from '../utils/utils';
import { DEFAULT_BHZ, DEFAULT_BVT, RISK_LABELS } from '../constants/constants';
import { validateBHZ } from '../../../reputasi/utils/validationhelper';

// Type definitions
type RiskLabel = (typeof RISK_LABELS)[number];

interface BobotState {
  investasi: number;
  pasar: number;
  likuiditas: number;
  operasional: number;
  hukum: number;
  strategis: number;
  kepatuhan: number;
  reputasi: number;
}

interface BobotErrorsState {
  investasi: string;
  pasar: string;
  likuiditas: string;
  operasional: string;
  hukum: string;
  strategis: string;
  kepatuhan: string;
  reputasi: string;
}

interface BvtState {
  investasi: number;
  pasar: number;
  likuiditas: number;
  operasional: number;
  hukum: number;
  strategis: number;
  kepatuhan: number;
  reputasi: number;
}

interface RiskRow {
  label: string;
  bvt: number;
  bobot: number;
  skor: number;
  summary: any;
}

interface RiskRowKPMR {
  label: string;
  bobot: number;
  skor: number;
}

// ===================== HOOK: BHZ CONFIG (FROM API) =====================
export const useBhzConfig = (year: number, quarter: string) => {
  const [bobot, setBobot] = useState<BobotState>(DEFAULT_BHZ);
  const [bobotErrors, setBobotErrors] = useState<BobotErrorsState>({
    investasi: '',
    pasar: '',
    likuiditas: '',
    operasional: '',
    hukum: '',
    strategis: '',
    kepatuhan: '',
    reputasi: '',
  });
  const [loading, setLoading] = useState(true);

  // Load from API
  useEffect(() => {
    const loadBhz = async () => {
      setLoading(true);
      try {
        const response = await rekapDataAPI.getBhz(year, quarter);
        if (response.data) {
          setBobot({
            investasi: response.data.investasi ?? DEFAULT_BHZ.investasi,
            pasar: response.data.pasar ?? DEFAULT_BHZ.pasar,
            likuiditas: response.data.likuiditas ?? DEFAULT_BHZ.likuiditas,
            operasional: response.data.operasional ?? DEFAULT_BHZ.operasional,
            hukum: response.data.hukum ?? DEFAULT_BHZ.hukum,
            strategis: response.data.strategis ?? DEFAULT_BHZ.strategis,
            kepatuhan: response.data.kepatuhan ?? DEFAULT_BHZ.kepatuhan,
            reputasi: response.data.reputasi ?? DEFAULT_BHZ.reputasi,
          });
        } else {
          setBobot(DEFAULT_BHZ);
        }
      } catch (error) {
        console.error('Error loading BHz config:', error);
        setBobot(DEFAULT_BHZ);
      } finally {
        setLoading(false);
      }
    };

    loadBhz();
  }, [year, quarter]);

  const setBobotField = (field: keyof BobotState, value: number) => {
    setBobot((prev) => ({ ...prev, [field]: value }));
  };

  const handleBobotChange = (field: keyof BobotState, value: string) => {
    const validation = validateBHZ(value);
    setBobotErrors((prev) => ({ ...prev, [field]: validation.error }));
    if (validation.isValid) setBobotField(field, Number(value));
  };

  // Save to API
  const saveBhzToAPI = useCallback(async () => {
    try {
      await rekapDataAPI.saveBhz({
        year,
        quarter,
        ...bobot,
        createdBy: 'user', // Bisa diganti dengan username dari auth
      });
    } catch (error) {
      console.error('Error saving BHz config:', error);
    }
  }, [year, quarter, bobot]);

  // Auto-save when bobot changes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        saveBhzToAPI();
      }, 500); // Debounce 500ms
      return () => clearTimeout(timer);
    }
  }, [bobot, loading, saveBhzToAPI]);

  return { bobot, bobotErrors, handleBobotChange, setBobotField, loading };
};

// ===================== HOOK: BVT CONFIG (FROM API) =====================
export const useBvtConfig = (year: number, quarter: string) => {
  const [bvt, setBvt] = useState<BvtState>({
    investasi: DEFAULT_BVT,
    pasar: DEFAULT_BVT,
    likuiditas: DEFAULT_BVT,
    operasional: DEFAULT_BVT,
    hukum: DEFAULT_BVT,
    strategis: DEFAULT_BVT,
    kepatuhan: DEFAULT_BVT,
    reputasi: DEFAULT_BVT,
  });
  const [loading, setLoading] = useState(true);

  // Load from API
  useEffect(() => {
    const loadBvt = async () => {
      setLoading(true);
      try {
        const response = await rekapDataAPI.getBvt(year, quarter);
        if (response.data) {
          setBvt({
            investasi: response.data.investasi ?? DEFAULT_BVT,
            pasar: response.data.pasar ?? DEFAULT_BVT,
            likuiditas: response.data.likuiditas ?? DEFAULT_BVT,
            operasional: response.data.operasional ?? DEFAULT_BVT,
            hukum: response.data.hukum ?? DEFAULT_BVT,
            strategis: response.data.strategis ?? DEFAULT_BVT,
            kepatuhan: response.data.kepatuhan ?? DEFAULT_BVT,
            reputasi: response.data.reputasi ?? DEFAULT_BVT,
          });
        }
      } catch (error) {
        console.error('Error loading BVT config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBvt();
  }, [year, quarter]);

  const setBvtField = (field: keyof BvtState, value: number) => {
    setBvt((prev) => ({ ...prev, [field]: value }));
  };

  // Save to API
  const saveBvtToAPI = useCallback(async () => {
    try {
      await rekapDataAPI.saveBvt({
        year,
        quarter,
        ...bvt,
        createdBy: 'user',
      });
    } catch (error) {
      console.error('Error saving BVT config:', error);
    }
  }, [year, quarter, bvt]);

  // Auto-save when bvt changes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        saveBvtToAPI();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bvt, loading, saveBvtToAPI]);

  return { bvt, setBvtField, loading };
};

// ===================== HOOK: RISK DATA (FROM API) =====================
export const useRiskData = (year: number, quarter: string, refreshCounter: number) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await rekapDataAPI.getAllData(year, quarter);

        const result: any = {};

        // Extract summaries
        RISK_LABELS.forEach((label) => {
          const key = `${label}Summary`;
          if (response.data[key]) {
            result[key] = response.data[key];
          }
        });

        // Extract KPMR data
        RISK_LABELS.forEach((label) => {
          const capitalizedName = label.charAt(0).toUpperCase() + label.slice(1);
          const key = `loadKPMR${capitalizedName}`;
          if (response.data[key]) {
            result[key] = response.data[key];
          }
        });

        setData(result);
      } catch (err) {
        console.error('Error fetching risk data:', err);
        setError('Gagal mengambil data dari server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, quarter, refreshCounter]);

  return { ...data, loading, error };
};

// ===================== HOOK: CALCULATIONS =====================
export const useCalculations = (summaries: Record<string, any>, kpmrData: Record<string, any>, bvt: BvtState, bobot: BobotState) => {
  // Summary values
  const summaryValues: Record<string, number> = {};
  RISK_LABELS.forEach((label: RiskLabel) => {
    const summaryData = summaries[`${label}Summary`] || [];
    summaryValues[`summary${label.charAt(0).toUpperCase() + label.slice(1)}`] = useMemo(() => hitungSummary(summaryData), [summaryData]);
  });

  // Skor KPMR
  const skorKPMR: Record<string, number> = {};
  RISK_LABELS.forEach((label: RiskLabel) => {
    const kpmrKey = `loadKPMR${label.charAt(0).toUpperCase() + label.slice(1)}`;
    skorKPMR[`skorKPMR${label.charAt(0).toUpperCase() + label.slice(1)}`] = useMemo(() => hitungSkorKPMR(kpmrData[kpmrKey] || []), [kpmrData[kpmrKey]]);
  });

  // Skor Inheren
  const skorInheren: Record<string, number> = {};
  RISK_LABELS.forEach((label: RiskLabel) => {
    const summaryKey = `summary${label.charAt(0).toUpperCase() + label.slice(1)}`;
    skorInheren[`skor${label.charAt(0).toUpperCase() + label.slice(1)}`] = useMemo(() => hitungSkorInheren(summaryValues[summaryKey], bvt[label]), [summaryValues[summaryKey], bvt[label]]);
  });

  // Peringkat Risiko
  const peringkat: Record<string, number> = {};
  RISK_LABELS.forEach((label: RiskLabel) => {
    const skorKey = `skor${label.charAt(0).toUpperCase() + label.slice(1)}`;
    const kpmrKey = `skorKPMR${label.charAt(0).toUpperCase() + label.slice(1)}`;
    peringkat[`peringkat${label.charAt(0).toUpperCase() + label.slice(1)}`] = useMemo(() => hitungPeringkatRisiko(skorInheren[skorKey], skorKPMR[kpmrKey]), [skorInheren[skorKey], skorKPMR[kpmrKey]]);
  });

  // Build riskRows
  const riskRows: RiskRow[] = useMemo(() => {
    return RISK_LABELS.map((label: RiskLabel) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      bvt: bvt[label],
      bobot: bobot[label],
      skor: skorInheren[`skor${label.charAt(0).toUpperCase() + label.slice(1)}`] || 0,
      summary: summaryValues[`summary${label.charAt(0).toUpperCase() + label.slice(1)}`] || 0,
    }));
  }, [bvt, bobot, skorInheren, summaryValues]);

  // Build riskRowsKPMR
  const riskRowsKPMR: RiskRowKPMR[] = useMemo(() => {
    return RISK_LABELS.map((label: RiskLabel) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      bobot: bobot[label],
      skor: skorKPMR[`skorKPMR${label.charAt(0).toUpperCase() + label.slice(1)}`] || 0,
    }));
  }, [bobot, skorKPMR]);

  // Komposit
  const peringkatKompositA = useMemo(() => hitungKompositA(riskRows), [riskRows]);
  const peringkatKompositB = useMemo(() => hitungKompositB(riskRowsKPMR), [riskRowsKPMR]);
  const totalPeringkat = useMemo(() => (peringkatKompositA + peringkatKompositB) / 2, [peringkatKompositA, peringkatKompositB]);

  return {
    summaryValues,
    skorKPMR,
    skorInheren,
    peringkat,
    riskRows,
    riskRowsKPMR,
    peringkatKompositA,
    peringkatKompositB,
    totalPeringkat,
  };
};

// ===================== HOOK: SAVE REKAP RESULT =====================
export const useSaveRekapResult = () => {
  const saveResult = useCallback(
    async (year: number, quarter: string, kompositA: number, kompositB: number, totalPeringkat: number, riskRows: RiskRow[], riskRowsKPMR: RiskRowKPMR[], skorInheren: Record<string, number>, skorKPMR: Record<string, number>) => {
      try {
        const riskDetails = RISK_LABELS.map((label) => {
          const labelName = label.charAt(0).toUpperCase() + label.slice(1);
          const peringkatValue = (skorInheren[`skor${labelName}`] + skorKPMR[`skorKPMR${labelName}`]) / 2;

          return {
            label: labelName,
            inherent: skorInheren[`skor${labelName}`] || 0,
            kpmr: skorKPMR[`skorKPMR${labelName}`] || 0,
            peringkat: peringkatValue,
          };
        });

        await rekapDataAPI.saveResult({
          year,
          quarter,
          kompositA,
          kompositB,
          totalPeringkat,
          riskDetails,
          createdBy: 'user',
        });
      } catch (error) {
        console.error('Error saving rekap result:', error);
      }
    },
    [],
  );

  return { saveResult };
};

// ===================== HOOK: EVENT LISTENERS =====================
export const useEventListeners = (setRefreshCounter: React.Dispatch<React.SetStateAction<number>>) => {
  useEffect(() => {
    const events = [
      'investasiRows:changed',
      'investasiKPMR:changed',
      'pasarRows:changed',
      'pasarKPMR:changed',
      'likuiditasRows:changed',
      'likuiditasKPMR:changed',
      'operasionalRows:changed',
      'operasionalKPMR:changed',
      'hukumRows:changed',
      'hukumKPMR:changed',
      'hukumSections:changed',
      'stratejikRows:changed',
      'stratejikKPMR:changed',
      'stratejikSections:changed',
      'kepatuhanRows:changed',
      'kepatuhanKPMR:changed',
      'reputasiRows:changed',
      'reputasiKPMR:changed',
    ];

    const handler = () => setRefreshCounter((prev) => prev + 1);
    events.forEach((event) => window.addEventListener(event, handler));

    return () => events.forEach((event) => window.removeEventListener(event, handler));
  }, [setRefreshCounter]);
};
