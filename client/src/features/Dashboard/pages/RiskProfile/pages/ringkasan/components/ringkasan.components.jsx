// components/ringkasan.components.jsx
import React from "react";
import { Download } from "lucide-react";
// import { YearInput, QuarterSelect } from "../../../components/Inputs";
import { YearInput, QuarterSelect} from "../../hukum/components/hukum/input-hukum";
import { 
  RISK_ORDER, RISK_TYPE_LABELS, QUARTER_TO_MONTH, RISK_LABEL,
  buildRiskIndex, formatHasilDisplay, formatBobotDisplay, getRiskStyle 
} from "../utils/ringkasan.utils";

// ===================== RINGKASAN HEADER =====================
export const RingkasanHeader = ({ viewYear, setViewYear, viewQuarter, setViewQuarter, onExport }) => {
  const periodLabel = `${QUARTER_TO_MONTH[viewQuarter]}-${String(viewYear).slice(2)}`;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6 shadow-sm bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
      <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Risk Summary – Risk Assessment
          </h1>
          <p className="mt-1 text-white/90 text-sm">
            Ringkasan hasil pengukuran tingkat risiko per periode.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 transition-all duration-200 group"
            title="Export to Excel"
          >
            <Download className="w-4 h-4 text-white opacity-90 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-semibold">Export</span>
          </button>
        </div>
      </div>
      <div className="relative px-6 pb-7 sm:px-8 sm:pb-8">
        <div className="flex gap-3">
          <YearInput value={viewYear} onChange={setViewYear} labelClassName="text-white" />
          <QuarterSelect value={viewQuarter} onChange={setViewQuarter} labelClassName="text-white" />
        </div>
      </div>
    </div>
  );
};

// ===================== RINGKASAN TABLE ROW =====================
export const RingkasanTableRow = ({ 
  riskType, group, item, index, 
  isFirstGroup, isFirstItem, riskIndex, riskTypeTotal 
}) => {
  const r = item;
  const riskNumber = riskIndex + 1;
  const riskTypeName = RISK_TYPE_LABELS[riskType] || `Risiko ${riskType.charAt(0).toUpperCase() + riskType.slice(1)}`;
  
  let indikatorIndex = index + 1;
  if (riskType === "hukum") {
    indikatorIndex = r.subNo || index + 1;
  }

  const hasilDisplay = formatHasilDisplay(r, riskType);
  const bobotIndikatorDisplay = formatBobotDisplay(r, riskType);
  const riskStyle = getRiskStyle(r.peringkat);
  const hasValidPeringkat = !isNaN(Number(r.peringkat)) && Number(r.peringkat) >= 1 && Number(r.peringkat) <= 5;

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {isFirstGroup && isFirstItem && (
        <>
          <td rowSpan={riskTypeTotal} className="border border-gray-200 px-4 py-3 text-center font-bold bg-white">
            {riskNumber}
          </td>
          <td rowSpan={riskTypeTotal} className="border border-gray-200 px-4 py-3 font-semibold bg-white">
            {riskTypeName}
          </td>
        </>
      )}

      {index === 0 && (
        <>
          <td rowSpan={group.items.length} className="border border-gray-200 px-4 py-3 text-center bg-white">
            {group.bobotSection ? `${group.bobotSection}%` : "0%"}
          </td>
          <td rowSpan={group.items.length} className="border border-gray-200 px-4 py-3 bg-white">
            {group.sectionLabel}
          </td>
        </>
      )}

      <td className="border border-gray-200 px-4 py-3 text-center font-mono text-sm bg-white">
        {buildRiskIndex({
          riskFormId: riskType,
          sectionNo: group.sectionNo,
          indikatorIndex,
          subNo: indikatorIndex
        })}
      </td>

      <td className="border border-gray-200 px-4 py-3 bg-white text-sm">{r.indikator}</td>

      <td className="border border-gray-200 px-4 py-3 text-center bg-white text-sm">
        {bobotIndikatorDisplay}
      </td>

      <td className="border border-gray-200 px-4 py-3 text-right bg-white text-sm">
        {hasilDisplay}
      </td>

      {hasValidPeringkat ? (
        <>
          <td className="border border-gray-200 px-4 py-3 text-center font-bold text-sm">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${riskStyle.className}`}>
              {r.peringkat}
            </div>
          </td>
          <td className="border border-gray-200 px-4 py-3 text-center font-semibold text-sm">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${riskStyle.className}`}>
              {RISK_LABEL[r.peringkat]}
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="border border-gray-200 px-4 py-3 text-center bg-white text-sm"></td>
          <td className="border border-gray-200 px-4 py-3 text-center bg-white text-sm"></td>
        </>
      )}
    </tr>
  );
};

// ===================== RINGKASAN TABLE =====================
export const RingkasanTable = ({ groupedByRiskType, riskTypeTotals, viewYear, viewQuarter }) => {
  const periodLabel = `${QUARTER_TO_MONTH[viewQuarter]}-${String(viewYear).slice(2)}`;

  const allGroups = RISK_ORDER.flatMap(riskType => 
    groupedByRiskType[riskType]?.length ? groupedByRiskType[riskType] : []
  );

  if (allGroups.length === 0) {
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#1e3a8a] text-white">
              <th colSpan={10} className="border-b-2 border-gray-300 px-4 py-2">Risk Summary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={10} className="border border-gray-200 px-4 py-8 text-center text-gray-500 bg-gray-50">
                <div className="text-sm font-medium">Tidak ada data tersedia untuk periode ini</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#1e3a8a] text-white">
            <th rowSpan={3} className="w-[90px] border-b-2 border-gray-300 px-4 py-2">No</th>
            <th rowSpan={3} className="w-[160px] border-b-2 border-gray-300 px-4 py-2 text-left">Jenis Risiko</th>
            <th rowSpan={3} className="w-[90px] border-b-2 border-gray-300 px-4 py-2">Bobot</th>
            <th rowSpan={3} className="w-[240px] border-b-2 border-gray-300 px-4 py-2 text-left">Group Parameter</th>
            <th rowSpan={3} className="border-b-2 border-gray-300 px-4 py-2">Indeks</th>
            <th rowSpan={3} className="w-[420px] border-b-2 border-gray-300 px-4 py-2 text-left">
              Parameter / Risiko Inheren
            </th>
            <th colSpan={4} className="border-b-2 border-gray-300 px-4 py-2">Hasil Risk Assessment</th>
          </tr>
          <tr className="bg-[#1e3a8a] text-white">
            <th colSpan={4} className="border-b-2 border-gray-300 px-4 py-2">{periodLabel}</th>
          </tr>
          <tr className="bg-[#1e3a8a] text-white">
            <th className="border-b-2 border-gray-300 px-4 py-2">Bobot</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Hasil Assessment</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Risk Level</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Risk Level</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {RISK_ORDER.map((riskType, riskIndex) => {
            const riskTypeGroups = groupedByRiskType[riskType] || [];
            const riskTypeTotal = riskTypeTotals[riskType] || 0;
            
            if (riskType === "pasar" && riskTypeGroups.length === 0) return null;

            return riskTypeGroups.map((group, groupIndex) =>
              group.items.map((item, itemIndex) => (
                <RingkasanTableRow
                  key={`${riskType}-${groupIndex}-${itemIndex}`}
                  riskType={riskType}
                  group={group}
                  item={item}
                  index={itemIndex}
                  isFirstGroup={groupIndex === 0}
                  isFirstItem={itemIndex === 0}
                  riskIndex={riskIndex}
                  riskTypeTotal={riskTypeTotal}
                />
              ))
            );
          })}
        </tbody>
      </table>
    </div>
  );
};