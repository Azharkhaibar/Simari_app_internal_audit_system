// PeringkatKomposit.jsx
import React, { useEffect } from 'react';
import Header from '../../components/ui/header';
import { useHeaderStore } from '../../store/header';
import { useGlobalSummaryAdapter, useBhzValues, useTableData, useFooterData } from './hooks/peringkat-komposit.hook';
import { TableHeader, TableRow, TableFooter, LegendSection } from './components/peringkat-komposit.components';
import { exportPeringkatKompositToExcel } from './utils/exportExcelPeringkatKomposit';

export default function PeringkatKompositOjk() {
  const { year, activeQuarter, search, exportRequestId, resetExport } = useHeaderStore();
  const summaryData = useGlobalSummaryAdapter();
  const { bhzValues, handleBhzChange } = useBhzValues();
  const tableData = useTableData(summaryData, bhzValues, search);
  const footerData = useFooterData(tableData);

  // Listen to header export request
  useEffect(() => {
    if (!exportRequestId || tableData.length === 0) return;

    exportPeringkatKompositToExcel({
      tableData,
      footerData,
      year,
      quarter: activeQuarter
    });

    resetExport();
  }, [exportRequestId, tableData, footerData, year, activeQuarter, resetExport]);

  return (
    <div className="w-full min-h-screen p-4">
      <Header title="Komposit" />
      <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
        <TableHeader />
        <div className="max-h-[calc(80vh-280px)] overflow-y-auto">
          <div className="divide-y relative">
            {tableData.map((item) => (
              <TableRow key={item.id} item={item} onBhzChange={handleBhzChange} />
            ))}
          </div>
        </div>
        <TableFooter footerData={footerData} />
      </div>
      <LegendSection />
    </div>
  );
}
