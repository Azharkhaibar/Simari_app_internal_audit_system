// client/src/features/Dashboard/pages/RiskProfile/utils/exportExcelKPMR_Pasar.js
import { exportOperasionalToExcel } from './exportExcel';

/**
 * Export Risiko Pasar ke Excel dengan layout Investasi,
 * tapi merge No/Bobot/Section per Section (bisa multi indikator).
 */
export function exportKPMROperasionalToExcel({ year, quarter, sectionNo, sectionLabel, bobotSection, rows }) {
  const mapped = (rows || []).map((row, index) => ({
    no: sectionNo,
    bobotSection: `${bobotSection}%`,
    sectionLabel,
    // kalau memang tidak mau tampil Sub No, boleh dikosongkan:
    subNo: '',

    indikator: row.indikator,
    bobotIndikator: row.bobotIndikator,
    sumberRisiko: row.sumberRisiko,
    dampak: row.dampak,

    numeratorLabel: row.pembilangLabel,
    numeratorValue: row.pembilangValue,
    denominatorLabel: row.penyebutLabel,
    denominatorValue: row.penyebutValue,

    low: row.low,
    lowToModerate: row.lowToModerate,
    moderate: row.moderate,
    moderateToHigh: row.moderateToHigh,
    high: row.high,

    hasil: row.hasil === '' || row.hasil == null ? '' : Number(row.hasil),
    peringkat: row.peringkat,
    weighted: row.weighted === '' || row.weighted == null ? '' : Number(row.weighted),
    keterangan: row.keterangan,
  }));

  return exportOperasionalToExcel(mapped, year, quarter, {
    filePrefix: 'FORM-PASAR',
    sheetName: `KPMR-Pasar ${year}-${quarter}`,
    summaryLabel: 'Summary Risiko Pasar',
    groupBySection: true, // <= ini yang bikin merge per-section
  });
}
