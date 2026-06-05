// components/peringkat-komposit.components.jsx
import React from 'react';
import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS } from '../contants/peringkat-komposit.contants.js';
import { getRiskIndicator, formatScore } from '../utils/peringkat-komposit.utils.js';

// ==================== IndicatorCell ====================
export const IndicatorCell = ({ indicator, whiteText = false }) => {
  const safeIndicator = indicator || getRiskIndicator(0, 'inherent');
  const score = safeIndicator.score || 5;

  return (
    <div
      className={`rounded-full px-3 py-2 font-bold text-lg w-full flex items-center justify-center whitespace-nowrap min-h-[40px] ${whiteText ? 'text-white' : score >= 4 ? 'text-white' : 'text-black'}`}
      style={{ backgroundColor: safeIndicator.color }}
    >
      {score}
    </div>
  );
};

// ==================== ScoreCell (DIPERBAIKI) ====================
export const ScoreCell = ({ value, whiteText = false }) => {
  // Kalau value bukan number (string "-"), tampilin langsung
  const display = typeof value === 'number' ? formatScore(value) : value;
  return <div className={`font-semibold text-center ${whiteText ? 'text-white' : 'text-gray-800'}`}>{display}</div>;
};

// ==================== NoDataCell (BARU) ====================
export const NoDataCell = () => (
  <div className="flex items-center justify-center w-full">
    <span className="text-xs text-gray-400 italic whitespace-nowrap">Data tidak tersedia</span>
  </div>
);

// ==================== TableHeader (TETAP) ====================
export const TableHeader = () => (
  <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
    <div className="grid grid-cols-16 p-4 font-bold text-lg relative">
      <div className="absolute left-[calc((4/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />
      <div className="col-span-4 flex items-center justify-center">
        <FileText className="w-5 h-5 mr-2" />
        <span>Jenis Risiko</span>
      </div>
      <div className="absolute left-[calc((5.9/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />
      <div className="col-span-2 flex items-center justify-center">
        <span>BHz</span>
      </div>
      <div className="col-span-5 flex items-center justify-center">
        <span>INHERENT</span>
      </div>
      <div className="absolute left-[calc((10.8/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />
      <div className="col-span-5 flex items-center justify-center">
        <span>KUALITAS PENERAPAN MANAJEMEN RISIKO</span>
      </div>
    </div>

    <div className="sticky top-[64px] z-9 grid grid-cols-16 p-2 text-sm bg-blue-700 relative">
      <div className="absolute left-[calc((4/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />
      <div className="col-span-4" />
      <div className="absolute left-[calc((5.9/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />
      <div className="col-span-2" />
      <div className="col-span-3 text-center border-r border-blue-400">Indicator</div>
      <div className="col-span-1 text-center border-r border-blue-400">Skor</div>
      <div className="col-span-1 text-center">Nilai</div>
      <div className="absolute left-[calc((10.8/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />
      <div className="col-span-3 text-center border-r border-blue-400">Indicator</div>
      <div className="col-span-1 text-center border-r border-blue-400">Skor</div>
      <div className="col-span-1 text-center">Nilai</div>
    </div>
  </div>
);

// ==================== TableRow (DIPERBAIKI) ====================
export const TableRow = ({ item, onBhzChange }) => {
  // Cek apakah data tersedia
  const hasInherent = item.inherentSummary > 0;
  const hasKpmr = item.kpmrSummary > 0;
  const hasAnyData = hasInherent || hasKpmr;

  return (
    <div className="grid grid-cols-16 p-3 hover:bg-gray-50 transition-colors items-center relative">
      {/* Divider */}
      <div className="absolute left-[calc((4/16)*100%)] top-0 bottom-0 w-[2px] bg-gray-300 z-10" />

      {/* Jenis Risiko */}
      <div className="col-span-4 flex items-center gap-4 pl-4">
        <div className="p-2 bg-blue-50 rounded-lg">{item.Icon ? <item.Icon className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-blue-600" />}</div>
        <span className="font-bold text-gray-800">{item.nama}</span>
      </div>

      {/* Divider */}
      <div className="absolute left-[calc((5.9/16)*100%)] top-0 bottom-0 w-[2px] bg-gray-300 z-10" />

      {/* BHz */}
      <div className="col-span-2 flex items-center justify-center">
        <div className="relative">
          <Input
            type="number"
            min="0"
            max="100"
            value={item.bhz}
            onChange={(e) => onBhzChange(item.id, e.target.value)}
            className="w-16 text-center bg-white border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            disabled={!hasAnyData}
          />
          <span className="absolute right-2 top-1.5 text-gray-500 text-sm">%</span>
        </div>
      </div>

      {/* Divider */}
      <div className="absolute left-[calc((10.9/16)*100%)] top-0 bottom-0 w-[2px] bg-gray-300 z-10" />

      {/* INHERENT - Indicator */}
      <div className="col-span-3 flex items-center justify-center px-1">{hasInherent ? <IndicatorCell indicator={item.inherentIndicator} /> : <NoDataCell />}</div>
      {/* INHERENT - Skor */}
      <div className="col-span-1 flex items-center justify-center">
        <ScoreCell value={hasInherent ? item.inherentSkor : '-'} />
      </div>
      {/* INHERENT - Nilai */}
      <div className="col-span-1 flex items-center justify-center">
        <ScoreCell value={hasInherent ? item.inherentNilai : '-'} />
      </div>

      {/* KPMR - Indicator */}
      <div className="col-span-3 flex items-center justify-center px-1">{hasKpmr ? <IndicatorCell indicator={item.kpmrIndicator} /> : <NoDataCell />}</div>
      {/* KPMR - Skor */}
      <div className="col-span-1 flex items-center justify-center">
        <ScoreCell value={hasKpmr ? item.kpmrSkor : '-'} />
      </div>
      {/* KPMR - Nilai */}
      <div className="col-span-1 flex items-center justify-center">
        <ScoreCell value={hasKpmr ? item.kpmrNilai : '-'} />
      </div>
    </div>
  );
};

// ==================== TableFooter (DIPERBAIKI) ====================
export const TableFooter = ({ footerData }) => (
  <div className="sticky bottom-0 z-10 bg-blue-900 border-t relative">
    <div className="grid grid-cols-16 p-3 text-white font-bold items-center">
      <div className="absolute left-[calc((4/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />

      {/* Peringkat Komposit */}
      <div className="col-span-4 text-white flex items-center justify-center pl-4 text-lg">
        Peringkat Komposit
        {footerData.activeCount !== undefined && footerData.totalCount !== undefined && (
          <span className="text-xs font-normal ml-2 opacity-70">
            ({footerData.activeCount}/{footerData.totalCount} modul aktif)
          </span>
        )}
      </div>

      <div className="absolute left-[calc((5.9/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />

      {/* Total BHz */}
      <div className="col-span-2 text-center text-lg">{footerData.totalBhz}%</div>

      {/* INHERENT Footer */}
      <div className="col-span-3 flex items-center justify-center">
        {footerData.activeCount > 0 ? <IndicatorCell indicator={footerData.IndicatoravgInherentNilai} /> : <span className="text-xs text-gray-300 italic">Tidak ada data</span>}
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <h4>Avg Nilai :</h4>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <div className="font-bold text-white">{footerData.activeCount > 0 ? footerData.avgInherentNilai.toFixed(2) : '-'}</div>
      </div>

      <div className="absolute left-[calc((10.8/16)*100%)] top-0 bottom-0 w-[2px] bg-white/50 z-20" />

      {/* KPMR Footer */}
      <div className="col-span-3 flex items-center justify-center">{footerData.activeCount > 0 ? <IndicatorCell indicator={footerData.IndicatoravgkpmrNilai} /> : <span className="text-xs text-gray-300 italic">Tidak ada data</span>}</div>
      <div className="col-span-1 flex items-center justify-end">
        <h4>Avg Nilai :</h4>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <div className="font-bold text-white">{footerData.activeCount > 0 ? footerData.avgKpmrNilai.toFixed(2) : '-'}</div>
      </div>
    </div>
  </div>
);

// ==================== LegendSection (TETAP) ====================
export const LegendSection = () => (
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
