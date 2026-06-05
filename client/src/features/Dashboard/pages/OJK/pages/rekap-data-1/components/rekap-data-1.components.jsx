// src/ojk/rekap/pages/rekap-data-1-components.jsx
import React from 'react';
import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS } from '../contants/rekap-data-1.js';
import { getIndicatorColor, getIndicatorNumber, getRiskIndicator, getPtkIndicator } from '../utils/rekap-data-1.utils.js';

// ==================== SCORE CELL ====================
function ScoreCell({ value, indicator, whiteText = false, hasData = true }) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const formattedValue = safeValue.toFixed(2);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>0.00</div>
        <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap bg-gray-400 text-white">Data Tidak Ditemukan</div>
      </div>
    );
  }

  const safeIndicator = indicator || getRiskIndicator(safeValue, 'inherent');

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>{formattedValue}</div>
      <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap text-black" style={{ backgroundColor: safeIndicator.color }}>
        {safeIndicator.label}
      </div>
    </div>
  );
}

// ==================== KOMPOSIT SCORE CELL ====================
function KompositScoreCell({ inherentValue, kpmrValue, dataStatus, whiteText = false }) {
  const safeInherentValue = typeof inherentValue === 'number' && !isNaN(inherentValue) ? inherentValue : 0;
  const safeKpmrValue = typeof kpmrValue === 'number' && !isNaN(kpmrValue) ? kpmrValue : 0;

  if (dataStatus === 'no-data') {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>0.00</div>
        <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap bg-gray-400 text-white">Data Tidak Ditemukan</div>
      </div>
    );
  }

  if (dataStatus === 'partial-data') {
    const availableValue = inherentValue > 0 ? inherentValue : kpmrValue;
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>{availableValue.toFixed(2)}</div>
        <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap bg-gray-200 text-gray-600">Data Belum Lengkap</div>
      </div>
    );
  }

  const kompositValue = (safeInherentValue + safeKpmrValue) / 2;
  const kompositIndicator = getRiskIndicator(kompositValue, 'inherent');

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>{kompositValue.toFixed(2)}</div>
      <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap text-black" style={{ backgroundColor: kompositIndicator.color }}>
        {kompositIndicator.label}
      </div>
    </div>
  );
}

// ==================== PTK FOOTER CELL ====================
function PtkFooterCell({ value, whiteText = false, hasData = true, isPartial = false }) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>0.00</div>
        <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap bg-gray-400 text-white">Data Tidak Ditemukan</div>
      </div>
    );
  }

  if (isPartial) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>{safeValue.toFixed(2)}</div>
        <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap bg-gray-200 text-gray-600">Data Belum Lengkap</div>
      </div>
    );
  }

  const ptkIndicator = getPtkIndicator(safeValue);
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`text-xl font-bold min-w-[80px] text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>{safeValue.toFixed(2)}</div>
      <div className="rounded-full px-4 py-2 font-bold text-base w-[240px] flex items-center justify-center whitespace-nowrap text-black" style={{ backgroundColor: ptkIndicator.color }}>
        {ptkIndicator.label}
      </div>
    </div>
  );
}

// ==================== SUMMARY CARDS ====================
function SummaryCards({ footerDisplay }) {
  const inherentNumber = getIndicatorNumber(footerDisplay.inherentDisplay, footerDisplay.hasInherentData);
  const kpmrNumber = getIndicatorNumber(footerDisplay.kpmrDisplay, footerDisplay.hasKpmrData);
  const ptkNumber = footerDisplay.hasCompleteData ? getIndicatorNumber(footerDisplay.ptkDisplay, true) : 0;

  return (
    <div className="mt-4 gap-4 w-full flex">
      {/* Card Inherent */}
      <div className="bg-white shadow-md border border-gray-300 flex-1 p-6 rounded-xl flex items-center gap-5">
        <div className={`w-20 h-20 rounded-lg flex items-center justify-center shadow ${getIndicatorColor(inherentNumber)}`}>
          <span className="text-2xl font-bold text-black">{inherentNumber}</span>
        </div>
        <div className="flex-1 text-center">
          <p className="text-lg font-semibold border-b border-black inline-block px-3 pb-1">Komposit Inherent : {footerDisplay.inherentDisplay.toFixed(2)}</p>
          <p className="text-lg font-bold mt-1">{footerDisplay.hasInherentData ? footerDisplay.inherentIndicator.label : 'Data Tidak Ditemukan'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {footerDisplay.categoriesWithInherentData} data dari total {footerDisplay.totalCategories || 1} data
          </p>
        </div>
      </div>

      {/* Card KPMR */}
      <div className="bg-white shadow-md border border-gray-300 flex-1 p-6 rounded-xl flex items-center gap-5">
        <div className={`w-20 h-20 rounded-lg flex items-center justify-center shadow ${getIndicatorColor(kpmrNumber)}`}>
          <span className="text-2xl font-bold text-black">{kpmrNumber}</span>
        </div>
        <div className="flex-1 text-center">
          <p className="text-lg font-semibold border-b border-black inline-block px-3 pb-1">KPMR Komposit : {footerDisplay.kpmrDisplay.toFixed(2)}</p>
          <p className="text-lg font-bold mt-1">{footerDisplay.hasKpmrData ? footerDisplay.kpmrIndicator.label : 'Data Tidak Ditemukan'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {footerDisplay.categoriesWithKpmrData} data dari total {footerDisplay.totalCategories || 1} data
          </p>
        </div>
      </div>

      {/* Card PTK */}
      <div className="bg-white shadow-md border border-gray-300 flex-1 p-6 rounded-xl flex items-center gap-5">
        <div className={`w-20 h-20 rounded-lg flex items-center justify-center shadow ${footerDisplay.hasNoData ? 'bg-gray-400' : footerDisplay.hasPartialData ? 'bg-gray-200' : getIndicatorColor(ptkNumber)}`}>
          <span className="text-2xl font-bold text-black">{footerDisplay.hasCompleteData ? ptkNumber : 0}</span>
        </div>
        <div className="flex-1 text-center">
          <p className="text-lg font-semibold border-b border-black inline-block px-3 pb-1">Komposit : {footerDisplay.ptkDisplay.toFixed(2)}</p>
          <p className="text-lg font-bold mt-1">{footerDisplay.hasNoData ? 'Data Tidak Ditemukan' : footerDisplay.hasPartialData ? 'Data Belum Lengkap' : footerDisplay.ptkIndicator.label}</p>
          <p className="text-sm text-gray-500 mt-1">{footerDisplay.hasCompleteData ? 'Data lengkap' : footerDisplay.hasPartialData ? 'Data parsial' : 'Tidak ada data'}</p>
        </div>
      </div>
    </div>
  );
}

// ==================== DATA TABLE ====================
function DataTable({ tableData, footerDisplay, onBhzChange }) {
  if (tableData.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center text-gray-500">Tidak ada data untuk periode ini</div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="grid grid-cols-12 p-4 font-bold text-lg">
          <div className="col-span-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>Jenis Risiko</span>
          </div>
          <div className="col-span-2 text-center">BVt</div>
          <div className="col-span-2 text-center">BHz</div>
          <div className="col-span-2 text-center">INHERENT</div>
          <div className="col-span-2 text-center">KPMR</div>
          <div className="col-span-2 text-center">Peringkat Tingkat Komposit</div>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y max-h-[450px] overflow-y-auto">
        {tableData.map((item) => (
          <div key={item.id} className="grid grid-cols-12 p-4 hover:bg-gray-50 transition-colors">
            {/* Jenis Risiko */}
            <div className="col-span-2 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">{item.Icon ? <item.Icon className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-blue-600" />}</div>
              <span className="font-bold text-lg text-gray-800">{item.nama}</span>
            </div>

            {/* BVt */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="bg-gray-100 rounded-lg px-4 py-2 font-semibold text-gray-700 min-w-[80px] text-center">{item.bvt}%</div>
            </div>

            {/* BHz */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="relative">
                <Input type="number" min="0" max="100" value={item.bhz} onChange={(e) => onBhzChange(item.id, e.target.value)} className="w-24 text-center bg-white border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>

            {/* Inherent */}
            <div className="col-span-2 flex items-center justify-center">
              <ScoreCell value={item.inherentSkor} indicator={item.inherentIndicator} hasData={item.hasInherentData} />
            </div>

            {/* KPMR */}
            <div className="col-span-2 flex items-center justify-center">
              <ScoreCell value={item.kpmrSkor} indicator={item.kpmrIndicator} hasData={item.hasKpmrData} />
            </div>

            {/* Komposit */}
            <div className="col-span-2 flex items-center justify-center">
              <KompositScoreCell inherentValue={item.inherentSkor} kpmrValue={item.kpmrSkor} dataStatus={item.dataStatus} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-blue-900 border-t">
        <div className="grid grid-cols-12 p-4 text-white font-bold">
          <div className="col-span-4 flex items-center text-2xl">Peringkat Komposit</div>
          <div className="col-span-1" />
          <div className="col-span-1" />
          <div className="col-span-2 flex items-center justify-center">
            <ScoreCell value={footerDisplay.inherentDisplay} indicator={footerDisplay.inherentIndicator} whiteText hasData={footerDisplay.hasInherentData} />
          </div>
          <div className="col-span-2 flex items-center justify-center">
            <ScoreCell value={footerDisplay.kpmrDisplay} indicator={footerDisplay.kpmrIndicator} whiteText hasData={footerDisplay.hasKpmrData} />
          </div>
          <div className="col-span-2 flex items-center justify-center">
            <PtkFooterCell value={footerDisplay.ptkDisplay} whiteText hasData={footerDisplay.hasInherentData || footerDisplay.hasKpmrData} isPartial={footerDisplay.hasPartialData} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== RISK LEGEND ====================
function RiskLegend() {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3">
        <LegendRow label="INHERENT" indicators={INHERENT_RISK_INDICATORS} />
        <LegendRow label="KPMR" indicators={KPMR_RISK_INDICATORS} />
      </div>
    </div>
  );
}

function LegendRow({ label, indicators }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">{label} :</span>
      {indicators.map((i, idx) => (
        <div key={idx} className="flex items-center gap-1.5 text-sm">
          <span className="w-4 h-4 rounded border" style={{ backgroundColor: i.color }} />
          <span className="text-gray-600">
            {i.label} ({i.min.toFixed(2)}–{i.max.toFixed(2)})
          </span>
        </div>
      ))}
    </div>
  );
}

// ==================== EXPORT ====================
export { ScoreCell, KompositScoreCell, PtkFooterCell, SummaryCards, DataTable, RiskLegend };
