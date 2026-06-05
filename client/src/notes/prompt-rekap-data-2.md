componets

import React from 'react';
import { FileText } from 'lucide-react';
import { RISK_MATRIX, INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS } from '../constants';
import { getRiskIndicator, getMatrixIndicator } from '../utils';

// IndicatorCell Component
export const IndicatorCell = ({ indicator, size = 'normal' }) => {
const safeIndicator = indicator || getRiskIndicator(0, 'inherent');
const widthClass = size === 'normal' ? 'w-[220px]' : 'w-[120px]';
const textClass = size === 'small' ? 'text-sm' : 'text-base';
const paddingClass = size === 'small' ? 'px-3 py-2' : 'px-4 py-2.5';
const score = safeIndicator.score || 5;

return (
<div className="flex flex-col items-center justify-center">
<div className={`rounded-full ${paddingClass} font-bold ${textClass} ${widthClass} flex items-center justify-center whitespace-nowrap min-h-[40px] text-black`} style={{ backgroundColor: safeIndicator.color }}>
{score}
</div>
</div>
);
};

// FooterIndicatorCell Component
export const FooterIndicatorCell = ({ indicator, size = 'normal' }) => {
const safeIndicator = indicator || getRiskIndicator(0, 'inherent');
const widthClass = size === 'large' ? 'w-[120px]' : 'w-[220px]';
const textClass = size === 'small' ? 'text-sm' : 'text-base';
const paddingClass = size === 'small' ? 'px-3 py-2' : 'px-4 py-2.5';
const score = safeIndicator.score || 5;

return (
<div className="flex flex-col items-center justify-center">
<div className={`rounded-full ${paddingClass} font-bold ${textClass} ${widthClass} flex items-center justify-center whitespace-nowrap text-black min-h-[40px]`} style={{ backgroundColor: safeIndicator.color }}>
{score}
</div>
</div>
);
};

// TableHeader Component
export const TableHeader = () => {
return (
<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
<div className="grid grid-cols-12 p-4 font-bold text-lg">
<div className="col-span-3 flex items-center gap-2">
<FileText className="w-5 h-5" />
<span>Jenis Risiko</span>
</div>
<div className="col-span-3 text-center">Inherent Risk</div>
<div className="col-span-3 text-center">KPMR</div>
<div className="col-span-3 text-center">Net Risk</div>
</div>
</div>
);
};

// TableRow Component
export const TableRow = ({ item }) => {
return (
<div className="grid grid-cols-12 p-3 hover:bg-gray-50 transition-colors">
<div className="col-span-3 flex items-center gap-3">
<div className="p-2 bg-blue-50 rounded-lg">{item.Icon ? <item.Icon className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-blue-600" />}</div>
<span className="font-bold text-gray-800">{item.nama}</span>
</div>

      <div className="col-span-3 flex items-center justify-center">
        <IndicatorCell indicator={item.inherentIndicator} />
      </div>

      <div className="col-span-3 flex items-center justify-center">
        <IndicatorCell indicator={item.kpmrIndicator} />
      </div>

      <div className="col-span-3 flex items-center justify-center">
        <IndicatorCell indicator={item.matrixIndicator} />
      </div>
    </div>

);
};

// TableFooter Component
export const TableFooter = ({ footerDisplay }) => {
return (
<div className="bg-blue-900 border-t">
<div className="grid grid-cols-12 p-3 text-white font-bold">
<div className="col-span-3 text-white flex items-center ml-5 text-lg">Skor Profil Risiko</div>

        <div className="col-span-3 -ml-3 flex items-center justify-center">
          <FooterIndicatorCell indicator={footerDisplay.inherentIndicator} size="normal" />
        </div>

        <div className="col-span-3 -ml-5 flex items-center justify-center">
          <FooterIndicatorCell indicator={footerDisplay.kpmrIndicator} />
        </div>

        <div className="col-span-3 -ml-8 flex items-center justify-center">
          <FooterIndicatorCell indicator={footerDisplay.matrixIndicator} />
        </div>
      </div>
    </div>

);
};

// RiskMatrix Component
export const RiskMatrix = ({ inherentScore, kpmrScore, footerDisplay }) => {
const inherentIndex = inherentScore - 1;
const kpmrIndex = kpmrScore - 1;

const getRowLabel = (rowIndex) => {
const labels = {
0: 'Low (1)',
1: 'Low to Moderate (2)',
2: 'Moderate (3)',
3: 'Moderate to High (4)',
4: 'High (5)',
};
return labels[rowIndex] || '';
};

return (
<div className="bg-white rounded-lg shadow border p-4 h-full">
<div className="text-center mb-2">
<h3 className="font-bold text-gray-700 text-lg">Table Matrix Inherent Dan KPMR</h3>
</div>

      <div className="">
        <div>
          <h1 className="text-center">Kualitas Penerapan Manajemen Risiko</h1>
        </div>

        <div className="flex mb-4">
          <div
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}
          >
            <h1 className="text-center">Inherent Risiko</h1>
          </div>

          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>

            <thead>
              <tr>
                <th className="border p-2 bg-blue-800 text-sm font-medium w-16"></th>
                <th className="border border-black p-2 bg-blue-800 text-white text-center text-sm font-medium">
                  Strong
                  <br />
                  (1)
                </th>
                <th className="border border-black p-2 bg-blue-800 text-white text-center text-[13px] font-bold">
                  Satisfactory
                  <br />
                  (2)
                </th>
                <th className="border border-black p-2 bg-blue-800 text-white text-center text-sm font-medium">
                  Fair
                  <br />
                  (3)
                </th>
                <th className="border border-black p-2 bg-blue-800 text-white text-center text-sm font-medium">
                  Marginal
                  <br />
                  (4)
                </th>
                <th className="border border-black py-2 bg-blue-800 text-white text-center text-[12px] font-bold">
                  Unsatisfactory
                  <br />
                  (5)
                </th>
              </tr>
            </thead>

            <tbody>
              {RISK_MATRIX.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-black h-[70px] bg-blue-800 text-white font-medium text-center text-sm">{getRowLabel(rowIndex)}</td>
                  {row.map((cell, cellIndex) => {
                    const isActive = rowIndex === inherentIndex && cellIndex === kpmrIndex;
                    const cellIndicator = getMatrixIndicator(cell);

                    return (
                      <td key={cellIndex} className={`border p-3 text-center font-bold text-lg relative ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`} style={{ backgroundColor: cellIndicator.color }}>
                        {cell}
                        {isActive && <div className="absolute top-2 right-5 w-13 h-13 rounded-full border-4 border-black bg-transparent" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-base font-semibold text-gray-950">
            Posisi risiko saat ini (Inherent: {footerDisplay.inherentScoreForMatrix}, KPMR: {footerDisplay.kpmrScoreForMatrix})
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-950">
          <span className="font-semibold">Hasil Matriks:</span> {footerDisplay.matrixIndicator.label} ({footerDisplay.matrixDisplay.toFixed(1)})
        </div>
      </div>
    </div>

);
};

// LegendSection Component
export const LegendSection = () => {
return (
<div className="mt-6 rounded-lg border border-gray-200 bg-white p-3">
<div className="flex flex-col gap-3">
<div className="flex flex-wrap items-center gap-3">
<span className="text-xs font-semibold text-gray-700">Inherent:</span>
{INHERENT_RISK_INDICATORS.map((i, idx) => (
<div key={idx} className="flex items-center gap-1.5 text-xs">
<span className="w-3 h-3 rounded border" style={{ backgroundColor: i.color }} />
<span className="text-gray-600">
{i.label} ({i.min.toFixed(2)}–{i.max.toFixed(2)})
</span>
</div>
))}
</div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-gray-700">KPMR:</span>
          {KPMR_RISK_INDICATORS.map((i, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded border" style={{ backgroundColor: i.color }} />
              <span className="text-gray-600">
                {i.label} ({i.min.toFixed(2)}–{i.max.toFixed(2)})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

);
};

hooks

import { useState, useEffect, useCallback } from 'react';
import { useHeaderStore } from '../../../store/headerStore';
import { CATEGORIES } from '../constants';
import { fetchCategoryData } from '../utils';

interface SummaryItem {
id: string;
nama: string;
Icon: React.ComponentType<{
className?: string;
size?: number;
color?: string;
}>;
inherentSummary: number;
kpmrSummary: number;
}

export const useGlobalSummaryAdapter = (): SummaryItem[] => {
const { year, activeQuarter } = useHeaderStore();
const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);

const fetchData = useCallback(async (): Promise<void> => {
try {
const data = await Promise.all(CATEGORIES.map((category) => fetchCategoryData(category, year, activeQuarter)));

      setSummaryData(data as SummaryItem[]);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setSummaryData([]);
    }

}, [year, activeQuarter]);

useEffect(() => {
fetchData();

    const handleUpdate = (): void => {
      fetchData();
    };

    window.addEventListener('risk-data-updated', handleUpdate);

    return () => {
      window.removeEventListener('risk-data-updated', handleUpdate);
    };

}, [fetchData]);

return summaryData;
};

import { StoreIcon, HandCoins, BanknoteArrowUp, BrainCircuit, Scale, Cog, ClipboardCheck, CircleStar, BrainCog, Handshake, Sprout, TrendingUpDown, Earth } from 'lucide-react';

export const CATEGORIES = [
{ id: 'pasar-produk', label: 'Pasar Produk', Icon: StoreIcon },
{ id: 'likuiditas-produk', label: 'Likuiditas Produk', Icon: HandCoins },
{ id: 'kredit-produk', label: 'Kredit Produk', Icon: BanknoteArrowUp },
{ id: 'konsentrasi-produk', label: 'Konsentrasi Produk', Icon: BrainCircuit },
{ id: 'operasional', label: 'Operasional', Icon: Cog },
{ id: 'hukum-regulatory', label: 'Hukum', Icon: Scale },
{ id: 'kepatuhan-regulatory', label: 'Kepatuhan', Icon: ClipboardCheck },
{ id: 'reputasi-regulatory', label: 'Reputasi', Icon: CircleStar },
{ id: 'strategis-regulatory', label: 'Strategis', Icon: BrainCog },
{ id: 'investasi-regulatory', label: 'Investasi', Icon: Handshake },
{ id: 'rentabilitas-regulatory', label: 'Rentabilitas', Icon: TrendingUpDown },
{ id: 'permodalan-regulatory', label: 'Permodalan', Icon: Sprout },
{ id: 'tatakelola-regulatory', label: 'Tata Kelola', Icon: Earth },
];

export const INHERENT_RISK_INDICATORS = [
{ label: 'Low', value: 'low', color: '#2ECC71', min: 0, max: 1.49, score: 1 },
{ label: 'Low To Moderate', value: 'lowToModerate', color: '#A3E635', min: 1.5, max: 2.49, score: 2 },
{ label: 'Moderate', value: 'moderate', color: '#FACC15', min: 2.5, max: 3.49, score: 3 },
{ label: 'Moderate To High', value: 'moderateToHigh', color: '#F97316', min: 3.5, max: 4.49, score: 4 },
{ label: 'High', value: 'high', color: '#FF0000', min: 4.5, max: 5, score: 5 },
];

export const KPMR_RISK_INDICATORS = [
{ label: 'Strong', value: 'strong', color: '#2ECC71', min: 0, max: 1.49, score: 1 },
{ label: 'Satisfactory', value: 'satisfactory', color: '#A3E635', min: 1.5, max: 2.49, score: 2 },
{ label: 'Fair', value: 'fair', color: '#FACC15', min: 2.5, max: 3.49, score: 3 },
{ label: 'Marginal', value: 'marginal', color: '#F97316', min: 3.5, max: 4.49, score: 4 },
{ label: 'Unsatisfactory', value: 'unsatisfactory', color: '#FF0000', min: 4.5, max: 5, score: 5 },
];

export const RISK_MATRIX = [
[1, 1, 2, 3, 3],
[1, 2, 2, 3, 4],
[2, 2, 3, 4, 4],
[2, 3, 4, 4, 5],
[3, 3, 4, 5, 5],
];

utils
import { INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS, RISK_MATRIX } from '../constants';
import { loadKpmr, loadDerived } from '../../../utils/storage/riskStorageNilai';

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

/\*\*

- Normalize skor keys dari backend format ke frontend format
- Backend: KpmrPertanyaanOperasional.skor = { Q1: 3.5, Q2: 4.0, Q3: 2.5, Q4: 3.0 }
- Frontend expects: bisa akses dengan lowercase atau uppercase
  \*/
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

/\*\*

- Hitung KPMR summary dari data aspek dan pertanyaan
- Backend structure:
- KpmrOperasionalOjk -> aspekList: KpmrAspekOperasional[]
- KpmrAspekOperasional -> pertanyaanList: KpmrPertanyaanOperasional[]
- KpmrPertanyaanOperasional -> skor: { Q1?: number, Q2?: number, Q3?: number, Q4?: number }
  \*/
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

/\*\*

- Hitung inherent summary dari parameters dan nilaiList
- Backend structure:
- Operasional -> parameters: OperasionalParameter[]
- OperasionalParameter -> nilaiList: OperasionalNilai[]
- OperasionalNilai -> judul: { value?: string | number | null }
- OperasionalNilai -> bobot: number
  \*/
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

/\*\*

- Extract summary number dari berbagai format backend
- Backend Operasional.summary = {
- totalWeighted?: number;
- summaryBg?: string;
- computedAt?: Date;
- }
-
- Backend KpmrOperasionalOjk.summary = {
- totalScore?: number;
- averageScore?: number;
- rating?: string;
- computedAt?: Date;
- }
  \*/
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

/\*\*

- Fetch category data dari backend
- Menyesuaikan dengan entity backend:
- - Inherent: Operasional (parameters -> nilaiList)
- - KPMR: KpmrOperasionalOjk (aspekList -> pertanyaanList)
    \*/
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

page

import React, { useMemo } from 'react';
import Header from '../../components/header/Header';
import { useHeaderStore } from '../../store/headerStore';
import { useGlobalSummaryAdapter } from './hooks';
import { getRiskIndicator, getMatrixValue, getMatrixIndicator } from './utils';
import { TableHeader, TableRow, TableFooter, RiskMatrix, LegendSection } from './components';

export default function RekapData2() {
const { search } = useHeaderStore();
const summaryPerHalaman = useGlobalSummaryAdapter();

const filteredData = useMemo(() => {
if (!search) return summaryPerHalaman;
const s = search.toLowerCase();
return summaryPerHalaman.filter((h) => h.nama.toLowerCase().includes(s));
}, [search, summaryPerHalaman]);

const tableData = useMemo(() => {
return filteredData.map((item) => {
const inherentSummary = item.inherentSummary || 0;
const kpmrSummary = item.kpmrSummary || 0;

      const inherentIndicator = getRiskIndicator(inherentSummary, 'inherent');
      const kpmrIndicator = getRiskIndicator(kpmrSummary, 'kpmr');

      const matrixValue = getMatrixValue(inherentIndicator.score, kpmrIndicator.score);
      const matrixIndicator = getMatrixIndicator(matrixValue);

      return {
        ...item,
        inherentSummary,
        kpmrSummary,
        inherentIndicator,
        kpmrIndicator,
        matrixValue,
        matrixIndicator,
      };
    });

}, [filteredData]);

const peringkatKomposit = useMemo(() => {
if (summaryPerHalaman.length === 0) {
return { inherentValue: 0, kpmrValue: 0, matrixValue: 0 };
}

    let totalInherentValue = 0;
    let totalKpmrValue = 0;
    let totalMatrixValue = 0;
    let count = 0;

    summaryPerHalaman.forEach((item) => {
      const inherentSummary = item.inherentSummary || 0;
      const kpmrSummary = item.kpmrSummary || 0;

      const inherentIndicator = getRiskIndicator(inherentSummary, 'inherent');
      const kpmrIndicator = getRiskIndicator(kpmrSummary, 'kpmr');

      const matrixValue = getMatrixValue(inherentIndicator.score, kpmrIndicator.score);

      totalInherentValue += inherentSummary;
      totalKpmrValue += kpmrSummary;
      totalMatrixValue += matrixValue;
      count++;
    });

    const avgInherent = totalInherentValue / count;
    const avgKpmr = totalKpmrValue / count;
    const avgMatrix = totalMatrixValue / count;

    return { inherentValue: avgInherent, kpmrValue: avgKpmr, matrixValue: avgMatrix };

}, [summaryPerHalaman]);

const footerDisplay = useMemo(() => {
const inherentDisplay = peringkatKomposit.inherentValue;
const kpmrDisplay = peringkatKomposit.kpmrValue;
const matrixDisplay = peringkatKomposit.matrixValue;

    const inherentIndicator = getRiskIndicator(inherentDisplay, 'inherent');
    const kpmrIndicator = getRiskIndicator(kpmrDisplay, 'kpmr');
    const matrixIndicator = getMatrixIndicator(matrixDisplay);

    return {
      inherentDisplay,
      kpmrDisplay,
      matrixDisplay,
      inherentIndicator,
      kpmrIndicator,
      matrixIndicator,
      inherentScoreForMatrix: Math.floor(Math.min(Math.max(inherentIndicator.score, 1), 5)),
      kpmrScoreForMatrix: Math.floor(Math.min(Math.max(kpmrIndicator.score, 1), 5)),
    };

}, [peringkatKomposit]);

return (
<div className="w-full min-h-screen p-4">
<Header title="Rekap Data 2" />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mt-6">
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <TableHeader />

            <div className="divide-y max-h-[450px] overflow-y-auto">
              {tableData.map((item) => (
                <TableRow key={item.id} item={item} />
              ))}
            </div>

            <TableFooter footerDisplay={footerDisplay} />
          </div>
        </div>

        <div className="lg:col-span-4">
          <RiskMatrix inherentScore={footerDisplay.inherentScoreForMatrix} kpmrScore={footerDisplay.kpmrScoreForMatrix} footerDisplay={footerDisplay} />
        </div>
      </div>

      <LegendSection />
    </div>

);
}
