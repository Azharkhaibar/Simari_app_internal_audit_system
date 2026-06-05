// components/rekap-data-2.components.jsx
import React from 'react';
import { FileText } from 'lucide-react';
import { RISK_MATRIX, INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS } from '../contants/rekap-data-2.js';
import { getRiskIndicator, getMatrixIndicator } from '../utils/rekap-data-2.utils.js';

// IndicatorCell — tampil "-" kalau indicator null
export const IndicatorCell = ({ indicator, size = 'normal' }) => {
  const widthClass = size === 'normal' ? 'w-[220px]' : 'w-[120px]';
  const textClass = size === 'small' ? 'text-sm' : 'text-base';
  const paddingClass = size === 'small' ? 'px-3 py-2' : 'px-4 py-2.5';

  // Kalau tidak ada data, tampil "-"
  if (!indicator) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={`rounded-full ${paddingClass} font-bold ${textClass} ${widthClass} flex items-center justify-center whitespace-nowrap min-h-[40px] text-gray-400 bg-gray-200`}>-</div>
      </div>
    );
  }

  const score = indicator.score || 5;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`rounded-full ${paddingClass} font-bold ${textClass} ${widthClass} flex items-center justify-center whitespace-nowrap min-h-[40px] text-black`} style={{ backgroundColor: indicator.color }}>
        {score}
      </div>
    </div>
  );
};

// FooterIndicatorCell — tampil "-" kalau indicator null
export const FooterIndicatorCell = ({ indicator, size = 'normal' }) => {
  const widthClass = size === 'large' ? 'w-[120px]' : 'w-[220px]';
  const textClass = size === 'small' ? 'text-sm' : 'text-base';
  const paddingClass = size === 'small' ? 'px-3 py-2' : 'px-4 py-2.5';

  if (!indicator) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={`rounded-full ${paddingClass} font-bold ${textClass} ${widthClass} flex items-center justify-center whitespace-nowrap min-h-[40px] text-gray-400 bg-gray-200`}>-</div>
      </div>
    );
  }

  const score = indicator.score || 5;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`rounded-full ${paddingClass} font-bold ${textClass} ${widthClass} flex items-center justify-center whitespace-nowrap text-black min-h-[40px]`} style={{ backgroundColor: indicator.color }}>
        {score}
      </div>
    </div>
  );
};

// TableHeader — tetap
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

// TableRow — pakai NoDataCell kalau tidak ada data
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

// TableFooter — tetap
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

// RiskMatrix — tetap (hanya tampil kalau ada data)
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
          <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
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
          <span className="font-semibold">Hasil Matriks:</span> {footerDisplay.matrixIndicator ? `${footerDisplay.matrixIndicator.label} (${footerDisplay.matrixDisplay.toFixed(1)})` : '-'}
        </div>
      </div>
    </div>
  );
};

// LegendSection — tetap
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
