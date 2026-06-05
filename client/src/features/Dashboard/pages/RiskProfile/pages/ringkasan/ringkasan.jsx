// Ringkasan.jsx
import React, { useState } from 'react';
import { getCurrentQuarter, getCurrentYear } from '../rekapdata/utils/time';
import { exportRingkasanToExcel } from './utils/ringkasan.utils';
import { useRingkasanData } from './hooks/ringkasan.hook';
import { RingkasanHeader, RingkasanTable } from './components/ringkasan.components';

export default function Ringkasan() {
  const [viewYear, setViewYear] = useState(getCurrentYear());
  const [viewQuarter, setViewQuarter] = useState(getCurrentQuarter());

  const { groupedByRiskType, riskTypeTotals, riskTypeRowSpans, loading, error, refresh } = useRingkasanData(viewYear, viewQuarter);

  const handleExportExcel = () => {
    exportRingkasanToExcel(groupedByRiskType, riskTypeRowSpans, viewYear, viewQuarter);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data ringkasan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <RingkasanHeader
        viewYear={viewYear}
        setViewYear={setViewYear}
        viewQuarter={viewQuarter}
        setViewQuarter={setViewQuarter}
        onExport={handleExportExcel}
      />

      <RingkasanTable
        groupedByRiskType={groupedByRiskType}
        riskTypeTotals={riskTypeTotals}
        viewYear={viewYear}
        viewQuarter={viewQuarter}
      />
    </div>
  );
}