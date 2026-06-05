// src/ojk/rekap/pages/rekap-data-1.js
import React from 'react';
import Header from '../../components/ui/header';
import useRekapData1 from './hooks/rekap-data-1.hook';
import { SummaryCards, DataTable, RiskLegend } from './components/rekap-data-1.components';
import { useHeaderStore } from '../../store/header';
import { exportRekap1ToExcel } from './utils/exportExcelRekap1';

export default function RekapData1Ojk() {
  const { tableData, footerDisplay, handleBhzChange, isLoading, error, refreshData } = useRekapData1();
  const { year, activeQuarter, exportRequestId, resetExport } = useHeaderStore();

  // Listen to header export request
  React.useEffect(() => {
    if (!exportRequestId || isLoading || tableData.length === 0) return;

    exportRekap1ToExcel({
      tableData,
      footerDisplay,
      year,
      quarter: activeQuarter
    });

    resetExport();
  }, [exportRequestId, isLoading, tableData, footerDisplay, year, activeQuarter, resetExport]);

  if (isLoading && tableData.length === 0) {
    return (
      <div className="w-full min-h-screen p-4">
        <Header title="Rekap Data 1" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data rekap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && tableData.length === 0) {
    return (
      <div className="w-full min-h-screen p-4">
        <Header title="Rekap Data 1" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Memuat Data</h3>
              <p className="text-red-700">{error}</p>
              <button onClick={refreshData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4">
      <Header title="Rekap Data 1" />
      <SummaryCards footerDisplay={footerDisplay} />
      <DataTable tableData={tableData} footerDisplay={footerDisplay} onBhzChange={handleBhzChange} />
      <RiskLegend />
    </div>
  );
}
