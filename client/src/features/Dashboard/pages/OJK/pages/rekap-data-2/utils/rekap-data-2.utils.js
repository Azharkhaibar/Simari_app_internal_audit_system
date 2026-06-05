import { INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS, RISK_MATRIX } from '../contants/rekap-data-2';
import { loadKpmr, loadDerived } from '../../../utils/storage/risk-storage-nilai';

// ==================== RISK CALCULATION UTILS ====================

export const getIndicatorNumber = (score) => {
  if (score === undefined || score === null || isNaN(score)) {
    return 5;
  }

  if (score >= 0 && score <= 1.5) return 1;
  if (score > 1.5 && score <= 2.5) return 2;
  if (score > 2.5 && score <= 3.5) return 3;
  if (score > 3.5 && score <= 4.5) return 4;
  return 5;
};

export const getMatrixIndicator = (matrixValue) => {
  if (matrixValue <= 1.5) return { label: 'Low', color: '#2ECC71', value: matrixValue, score: 1 };
  if (matrixValue <= 2.5) return { label: 'Low to Moderate', color: '#A3E635', value: matrixValue, score: 2 };
  if (matrixValue <= 3.5) return { label: 'Moderate', color: '#FACC15', value: matrixValue, score: 3 };
  if (matrixValue <= 4.5) return { label: 'Moderate to High', color: '#F97316', value: matrixValue, score: 4 };
  return { label: 'High', color: '#FF0000', value: matrixValue, score: 5 };
};

export const getRiskIndicator = (score, type = 'inherent') => {
  const indicators = type === 'kpmr' ? KPMR_RISK_INDICATORS : INHERENT_RISK_INDICATORS;

  if (score === undefined || score === null) {
    return { ...indicators[indicators.length - 1], score: 5 };
  }

  for (const indicator of indicators) {
    if (score >= indicator.min && score <= indicator.max) {
      return indicator;
    }
  }

  return { ...indicators[indicators.length - 1], score: 5 };
};

export const getMatrixValue = (inherentScore, kpmrScore) => {
  const inherentIndex = Math.floor(Math.min(Math.max(inherentScore, 1), 5)) - 1;
  const kpmrIndex = Math.floor(Math.min(Math.max(kpmrScore, 1), 5)) - 1;

  if (inherentIndex >= 0 && inherentIndex < RISK_MATRIX.length && kpmrIndex >= 0 && kpmrIndex < RISK_MATRIX[0].length) {
    return RISK_MATRIX[inherentIndex][kpmrIndex];
  }

  return 3;
};



// ==================== DATA ADAPTER UTILS ====================

/**
 * Normalize skor keys dari backend format ke frontend format
 * Backend: KpmrPertanyaanOperasional.skor = { Q1: 3.5, Q2: 4.0, Q3: 2.5, Q4: 3.0 }
 * Frontend expects: bisa akses dengan lowercase atau uppercase
 */
const normalizeSkorKeys = (skor) => {
  if (!skor) return {};

  const normalized = {};

  Object.keys(skor).forEach((key) => {
    normalized[key] = skor[key];
    normalized[key.toLowerCase()] = skor[key];
    normalized[key.toUpperCase()] = skor[key];
  });

  return normalized;
};

/**
 * Hitung KPMR summary dari data aspek dan pertanyaan
 * Backend structure:
 *   KpmrOperasionalOjk -> aspekList: KpmrAspekOperasional[]
 *   KpmrAspekOperasional -> pertanyaanList: KpmrPertanyaanOperasional[]
 *   KpmrPertanyaanOperasional -> skor: { Q1?: number, Q2?: number, Q3?: number, Q4?: number }
 */
export const calculateKpmrSummary = (kpmrRows, activeQuarter) => {
  if (!Array.isArray(kpmrRows) || kpmrRows.length === 0) {
    return 0;
  }

  let total = 0;
  let count = 0;

  kpmrRows.forEach((aspek) => {
    // aspek = KpmrAspekOperasional
    aspek.pertanyaanList?.forEach((pertanyaan) => {
      // pertanyaan = KpmrPertanyaanOperasional
      // Backend quarter adalah number (1-4), convert ke format Q1, Q2, dll
      const quarterKey = typeof activeQuarter === 'number' ? `Q${activeQuarter}` : activeQuarter?.toString();

      // Normalisasi skor untuk kompatibilitas dengan berbagai format key
      // Backend: { Q1: 3.5, Q2: 4.0 }
      // Frontend bisa akses: skor['Q1'] atau skor['q1']
      const skor = normalizeSkorKeys(pertanyaan.skor || {});
      const value = skor[quarterKey] || skor[quarterKey?.toLowerCase()] || skor[quarterKey?.toUpperCase()];

      const num = Number(value);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        total += num;
        count++;
      }
    });
  });

  return count > 0 ? total / count : 0;
};

/**
 * Hitung inherent summary dari parameters dan nilaiList
 * Backend structure:
 *   Operasional -> parameters: OperasionalParameter[]
 *   OperasionalParameter -> nilaiList: OperasionalNilai[]
 *   OperasionalNilai -> judul: { value?: string | number | null }
 *   OperasionalNilai -> bobot: number
 */
const calculateInherentFromParameters = (parameters) => {
  if (!Array.isArray(parameters)) return 0;

  let totalWeighted = 0;
  let totalWeight = 0;

  parameters.forEach((param) => {
    // param = OperasionalParameter
    const weight = parseFloat(param.bobot) || 0;
    let value = 0;

    if (param.nilaiList && param.nilaiList.length > 0) {
      // nilai = OperasionalNilai
      const nilai = param.nilaiList[0];

      // Parse value dari judul.value (bisa string atau number)
      if (typeof nilai.judul?.value === 'number') {
        value = nilai.judul.value;
      } else if (typeof nilai.judul?.value === 'string') {
        value = parseFloat(nilai.judul.value) || 0;
      }
    }

    totalWeighted += value * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? totalWeighted / totalWeight : 0;
};

/**
 * Extract summary number dari berbagai format backend
 * Backend Operasional.summary = {
 *   totalWeighted?: number;
 *   summaryBg?: string;
 *   computedAt?: Date;
 * }
 *
 * Backend KpmrOperasionalOjk.summary = {
 *   totalScore?: number;
 *   averageScore?: number;
 *   rating?: string;
 *   computedAt?: Date;
 * }
 */
const extractSummaryNumber = (data) => {
  if (!data) return 0;

  // Jika summary adalah number (sudah dihitung)
  if (typeof data.summary === 'number') {
    return data.summary;
  }

  // Jika summary adalah object dari backend
  if (data.summary && typeof data.summary === 'object') {
    // Operasional: { totalWeighted, summaryBg, computedAt }
    if (typeof data.summary.totalWeighted === 'number') {
      return data.summary.totalWeighted;
    }
    // KPMR Operasional: { totalScore, averageScore, rating, computedAt }
    if (typeof data.summary.averageScore === 'number') {
      return data.summary.averageScore;
    }
    if (typeof data.summary.totalScore === 'number') {
      return data.summary.totalScore;
    }
  }

  // Jika ada parameters (Operasional), hitung dari situ
  if (Array.isArray(data.parameters)) {
    return calculateInherentFromParameters(data.parameters);
  }

  // Jika ada aspekList (KPMR Operasional), tidak relevan untuk inherent
  return 0;
};

/**
 * Fetch category data dari backend
 * Menyesuaikan dengan entity backend:
 * - Inherent: Operasional (parameters -> nilaiList)
 * - KPMR: KpmrOperasionalOjk (aspekList -> pertanyaanList)
 */
export const fetchCategoryData = async (category, year, activeQuarter) => {
  try {
    // ================= INHERENT =================
    // Backend: GET /api/inherent/{categoryId}?year=2024&quarter=1
    // Response: Operasional entity
    const derivedData = await loadDerived({
      categoryId: category.id,
      year,
      quarter: activeQuarter, // Backend quarter adalah number
    });

    // Extract summary number dari response backend
    const inherentSummary = extractSummaryNumber(derivedData);

    // ================= KPMR =================
    // Backend: GET /api/kpmr/{categoryId}?year=2024
    // Response: KpmrOperasionalOjk entity
    const kpmrData = await loadKpmr({
      categoryId: category.id,
      year,
    });

    // Handle berbagai format response backend
    let kpmrRows;
    if (Array.isArray(kpmrData)) {
      // Jika response langsung array KpmrAspekOperasional[]
      kpmrRows = kpmrData;
    } else if (kpmrData?.aspekList) {
      // Jika response KpmrOperasionalOjk dengan aspekList
      kpmrRows = kpmrData.aspekList;
    } else {
      kpmrRows = [];
    }

    // Hitung KPMR summary dari aspekList
    const kpmrSummary = calculateKpmrSummary(kpmrRows, activeQuarter);

    return {
      id: category.id,
      nama: category.label,
      Icon: category.Icon,
      inherentSummary,
      kpmrSummary,
    };
  } catch (error) {
    console.error(`Error fetching data for ${category.id}:`, error);
    return {
      id: category.id,
      nama: category.label,
      Icon: category.Icon,
      inherentSummary: 0,
      kpmrSummary: 0,
    };
  }
};
