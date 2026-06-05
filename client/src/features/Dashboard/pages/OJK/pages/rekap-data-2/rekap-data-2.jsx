// rekap-data-2.jsx
import React, { useMemo, useEffect } from 'react';
import Header from '../../components/ui/header';
import { useHeaderStore } from '../../store/header';
import { useGlobalSummaryAdapter } from './hooks/rekap-data-2.hook';
import { getRiskIndicator, getMatrixValue, getMatrixIndicator } from './utils/rekap-data-2.utils.js';
import { TableHeader, TableRow, TableFooter, RiskMatrix, LegendSection } from './components/rekap-data-2.components';
import { exportRekap2ToExcel } from './utils/exportExcelRekap2';

export default function RekapData2Ojk() {
  const { year, activeQuarter, search, exportRequestId, resetExport } = useHeaderStore();
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

      // Flag: data tersedia kalau summary > 0
      const hasInherent = inherentSummary > 0;
      const hasKpmr = kpmrSummary > 0;

      const inherentIndicator = hasInherent ? getRiskIndicator(inherentSummary, 'inherent') : null;
      const kpmrIndicator = hasKpmr ? getRiskIndicator(kpmrSummary, 'kpmr') : null;

      let matrixValue = null;
      let matrixIndicator = null;

      if (hasInherent && hasKpmr) {
        matrixValue = getMatrixValue(inherentIndicator.score, kpmrIndicator.score);
        matrixIndicator = getMatrixIndicator(matrixValue);
      }

      return {
        ...item,
        inherentSummary,
        kpmrSummary,
        inherentIndicator,
        kpmrIndicator,
        matrixValue,
        matrixIndicator,
        hasInherent,
        hasKpmr,
        hasData: hasInherent || hasKpmr,
      };
    });
  }, [filteredData]);

  const peringkatKomposit = useMemo(() => {
    if (summaryPerHalaman.length === 0) {
      return { inherentValue: 0, kpmrValue: 0, matrixValue: 0, hasData: false };
    }

    let totalInherentValue = 0;
    let totalKpmrValue = 0;
    let totalMatrixValue = 0;
    let count = 0;

    summaryPerHalaman.forEach((item) => {
      const inherentSummary = item.inherentSummary || 0;
      const kpmrSummary = item.kpmrSummary || 0;

      // Hanya hitung kalau ada data
      if (inherentSummary === 0 && kpmrSummary === 0) return;

      const inherentIndicator = getRiskIndicator(inherentSummary, 'inherent');
      const kpmrIndicator = getRiskIndicator(kpmrSummary, 'kpmr');
      const matrixValue = getMatrixValue(inherentIndicator.score, kpmrIndicator.score);

      totalInherentValue += inherentSummary;
      totalKpmrValue += kpmrSummary;
      totalMatrixValue += matrixValue;
      count++;
    });

    if (count === 0) {
      return { inherentValue: 0, kpmrValue: 0, matrixValue: 0, hasData: false };
    }

    return {
      inherentValue: totalInherentValue / count,
      kpmrValue: totalKpmrValue / count,
      matrixValue: totalMatrixValue / count,
      hasData: true,
    };
  }, [summaryPerHalaman]);

  const footerDisplay = useMemo(() => {
    if (!peringkatKomposit.hasData) {
      return {
        inherentDisplay: 0,
        kpmrDisplay: 0,
        matrixDisplay: 0,
        inherentIndicator: null,
        kpmrIndicator: null,
        matrixIndicator: null,
        inherentScoreForMatrix: 1,
        kpmrScoreForMatrix: 1,
        hasData: false,
      };
    }

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
      hasData: true,
    };
  }, [peringkatKomposit]);

  // Listen to header export request
  useEffect(() => {
    if (!exportRequestId || tableData.length === 0) return;

    exportRekap2ToExcel({
      tableData,
      footerDisplay,
      year,
      quarter: activeQuarter
    });

    resetExport();
  }, [exportRequestId, tableData, footerDisplay, year, activeQuarter, resetExport]);

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
