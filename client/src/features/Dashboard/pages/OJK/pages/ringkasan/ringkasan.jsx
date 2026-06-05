// src/features/Dashboard/pages/Ringkasan/Ringkasan.tsx

import React, { useEffect } from 'react';
import Header from '../../components/ui/header';
import { useCategorySelection, useKategoriFilter, useSummaryData } from './hooks/ringkasan.hook.ts';
import { KategoriFilter, CategorySelector, SummaryTable } from './components/ringkasan.components';
import { useHeaderStore } from '../../store/header';
import { exportRingkasanToExcel } from './utils/exportExcelRingkasan';

export default function RingkasanOjk({ hideHeader = false }) {
  const { selectedPages, toggleAll, togglePage } = useCategorySelection();
  const { filter, updateFilter, toggleUnderlying, resetFilter } = useKategoriFilter();
  const { summaryData, isLoading } = useSummaryData(selectedPages, filter);
  const { year, activeQuarter, search, exportRequestId, resetExport } = useHeaderStore();

  // Listen to header export request
  useEffect(() => {
    if (!exportRequestId || isLoading || summaryData.length === 0) return;

    exportRingkasanToExcel({
      summaryData,
      year,
      quarter: activeQuarter,
      search
    });

    resetExport();
  }, [exportRequestId, isLoading, summaryData, year, activeQuarter, search, resetExport]);

  return (
    <div className="space-y-4">
      {!hideHeader && <Header title="Ringkasan Risk Assessment" />}
      <div className="bg-white rounded-lg p-4 shadow space-y-4">
        <CategorySelector selectedPages={selectedPages} toggleAll={toggleAll} togglePage={togglePage} />
        {selectedPages.length > 0 && <KategoriFilter filter={filter} setFilter={{ updateFilter, toggleUnderlying, resetFilter }} />}
        <SummaryTable summaryData={summaryData} isLoading={isLoading} />
      </div>
    </div>
  );
}
