import React, { useMemo, useState, useEffect } from 'react';
import { FileText, Eye, EyeOff, List, ListX, AlertTriangle } from 'lucide-react';
import { calculateRasValue, formatRasDisplayValue } from '../utils/ras-utils';

export default function RasYearlyTable({ rows, allData, year, onUpdate, loading }) {
  const [showStats, setShowStats] = useState(false);
  const [showNumDen, setShowNumDen] = useState(false);
  const [dataWarning, setDataWarning] = useState('');

  const yearMinus2 = year - 2;
  const yearMinus1 = year - 1;
  const currentYear = year;

  // Hitung total kolom
  const baseCols = 9; // kategori, no, statement, formulasi, tipe data, Y-2(RKAP+RAS), Y-1(RKAP+RAS)
  const statsCols = showStats ? 8 : 0; // 8 kolom statistik
  const currentCols = 2; // Y-0 (RKAP+RAS)
  const totalCols = baseCols + statsCols + currentCols;

  // Debug log
  useEffect(() => {
    console.log('📊 RasYearlyTable Debug:');
    console.log('- Year:', year);
    console.log('- Rows count:', rows?.length);
    console.log('- AllData count:', allData?.length);

    if (allData && allData.length > 0) {
      const uniqueYears = [...new Set(allData.map((d) => d.year))];
      console.log('- Tahun yang tersedia di allData:', uniqueYears.sort());

      const hasYearMinus2 = allData.some((d) => d.year === yearMinus2);
      const hasYearMinus1 = allData.some((d) => d.year === yearMinus1);

      if (!hasYearMinus2 || !hasYearMinus1) {
        setDataWarning(`Data historis untuk tahun ${yearMinus2} dan ${yearMinus1} tidak ditemukan. Statistik tidak dapat dihitung.`);
      } else {
        setDataWarning('');
      }
    }
  }, [rows, allData, year]);

  // --- IMPROVED getHistoricalItem dengan multiple fallbacks ---
  const getHistoricalItem = (currentItem, targetYear) => {
    if (!allData || allData.length === 0) return null;

    const strategies = [
      // Strategy 1: Group ID + Tahun
      () => {
        if (currentItem.groupId) {
          return allData.find((d) => d.year === targetYear && d.groupId === currentItem.groupId);
        }
        return null;
      },

      // Strategy 2: Parameter + Kategori + Tahun
      () => {
        return allData.find((d) => {
          const sameYear = d.year === targetYear;
          const sameCategory = d.riskCategory === currentItem.riskCategory;
          const sameParam = d.parameter && currentItem.parameter && d.parameter.trim().toLowerCase() === currentItem.parameter.trim().toLowerCase();
          return sameYear && sameCategory && sameParam;
        });
      },

      // Strategy 3: Parameter + Tahun (ignore category)
      () => {
        return allData.find((d) => {
          const sameYear = d.year === targetYear;
          const sameParam = d.parameter && currentItem.parameter && d.parameter.trim().toLowerCase() === currentItem.parameter.trim().toLowerCase();
          return sameYear && sameParam;
        });
      },

      // Strategy 4: Cari tahun terdekat (±1 tahun)
      () => {
        const yearsToCheck = [targetYear, targetYear - 1, targetYear + 1];
        for (const y of yearsToCheck) {
          const found = allData.find((d) => d.year === y && d.parameter && currentItem.parameter && d.parameter.trim().toLowerCase() === currentItem.parameter.trim().toLowerCase());
          if (found) return found;
        }
        return null;
      },

      // Strategy 5: Group ID dengan tahun berbeda
      () => {
        if (currentItem.groupId) {
          return allData.find((d) => d.groupId === currentItem.groupId);
        }
        return null;
      },
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) {
        console.log(`✅ Found historical data for ${currentItem.parameter} (target: ${targetYear}, found: ${result.year})`);
        return result;
      }
    }

    console.log(`❌ No historical data found for ${currentItem.parameter} in year ${targetYear}`);
    return null;
  };

  // --- IMPROVED calculateStats dengan graceful degradation ---
  const calculateStats = (currentItem) => {
    if (!allData || allData.length === 0) return null;

    const yearsToCheck = [year - 3, year - 2, year - 1];
    let allValues = [];
    let foundYears = [];

    yearsToCheck.forEach((y) => {
      const histItem = getHistoricalItem(currentItem, y);

      if (histItem) {
        foundYears.push(y);
        let valuesFromItem = [];

        // Sumber 1: Monthly values
        if (histItem.monthlyValues && typeof histItem.monthlyValues === 'object') {
          Object.values(histItem.monthlyValues).forEach((mVal) => {
            if (mVal && (mVal.num !== undefined || mVal.man !== undefined)) {
              let val = calculateRasValue(mVal.num, mVal.den, histItem.unitType || currentItem.unitType, mVal.man);

              if (val !== null && val !== undefined && val !== '') {
                val = parseFloat(val);

                // Normalisasi unit
                if (currentItem.unitType === 'X' && histItem.unitType === 'PERCENTAGE') {
                  val = val / 100;
                } else if (currentItem.unitType === 'PERCENTAGE' && histItem.unitType === 'X') {
                  val = val * 100;
                }

                valuesFromItem.push(val);
              }
            }
          });
        }

        // Sumber 2: Annual values (RKAP/RAS)
        if (valuesFromItem.length === 0) {
          const annualValue = histItem.rasLimit || histItem.rkapTarget;
          if (annualValue) {
            let val = parseFloat(annualValue);
            if (!isNaN(val)) {
              if (currentItem.unitType === 'X' && histItem.unitType === 'PERCENTAGE') {
                val = val / 100;
              } else if (currentItem.unitType === 'PERCENTAGE' && histItem.unitType === 'X') {
                val = val * 100;
              }
              valuesFromItem.push(val);
            }
          }
        }

        allValues.push(...valuesFromItem);
      }
    });

    console.log(`📈 Stats for ${currentItem.parameter}: Found ${allValues.length} values from years ${foundYears.join(', ')}`);

    if (allValues.length === 0) return null;

    const N = allValues.length;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const sum = allValues.reduce((a, b) => a + b, 0);
    const avg = sum / N;

    let stdev = 0;
    if (N > 1) {
      const squareDiffs = allValues.map((v) => Math.pow(v - avg, 2));
      const sumSquareDiff = squareDiffs.reduce((a, b) => a + b, 0);
      stdev = Math.sqrt(sumSquareDiff / (N - 1));
    }

    return {
      n: N,
      avg: avg,
      stdev: stdev,
      min: min,
      max: max,
      avg_min_1sd: avg - stdev,
      avg_plus_1sd: avg + stdev,
      avg_plus_2sd: avg + 2 * stdev,
      avg_plus_3sd: avg + 3 * stdev,
      sourceYears: foundYears,
    };
  };

  // Helper untuk display value
  const getDisplayValue = (data, field, unitType) => {
    if (!data || !data[field]) return '-';
    return formatRasDisplayValue(data[field], unitType);
  };

  const groupedData = useMemo(() => {
    if (!rows) return {};
    const sortedRows = [...rows].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));

    const groups = {};
    sortedRows.forEach((item) => {
      const cat = item.riskCategory || 'Lainnya';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [rows]);

  // Loading state
  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200 flex flex-col w-full h-full">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200 flex flex-col w-full h-full">
      {/* Warning Banner */}
      {dataWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">Data Historis Tidak Lengkap</p>
            <p>{dataWarning} Pastikan data untuk tahun-tahun sebelumnya sudah diinput.</p>
          </div>
        </div>
      )}

      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-end gap-3">
        <button
          onClick={() => setShowNumDen(!showNumDen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            showNumDen ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {showNumDen ? <ListX size={14} /> : <List size={14} />} {showNumDen ? 'Sembunyikan Pembilang & Penyebut' : 'Tampilkan Pembilang & Penyebut'}
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${showStats ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
        >
          {showStats ? <EyeOff size={14} /> : <Eye size={14} />} {showStats ? 'Sembunyikan Statistik & History' : 'Tampilkan Statistik & History'}
        </button>
      </div>

      <div className="flex-1 w-full overflow-x-auto max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-20rem)]">
        <table className="w-full min-w-[1400px] text-sm text-left border-collapse separate border-spacing-0">
          <thead className="bg-[#1f4e79] text-white">
            <tr>
              <th rowSpan={2} className="py-3 px-4 border border-black text-center align-middle font-semibold w-24">
                JENIS RISIKO
              </th>
              <th rowSpan={2} className="py-3 px-2 border border-black text-center align-middle font-semibold w-10">
                NO
              </th>
              <th rowSpan={2} className="py-3 px-4 border border-black text-center align-middle font-semibold min-w-[200px]">
                STATEMENT
              </th>
              <th rowSpan={2} className="py-3 px-4 border border-black text-center align-middle font-semibold w-40">
                FORMULASI
              </th>
              <th rowSpan={2} className="py-3 px-4 border border-black text-center align-middle font-semibold w-32">
                TIPE DATA
              </th>

              <th colSpan={2} className="py-2 px-2 border border-black text-center font-semibold bg-[#163a5c]">
                {yearMinus2}
              </th>
              <th colSpan={2} className="py-2 px-2 border border-black text-center font-semibold bg-[#163a5c]">
                {yearMinus1}
              </th>

              {showStats && (
                <th colSpan={8} className="py-2 px-2 border border-black text-center font-semibold bg-[#548235]">
                  Statistik Realisasi ({year - 3} - {year - 1})
                </th>
              )}

              <th colSpan={2} className="py-2 px-2 border border-black text-center font-semibold bg-[#2e75b6]">
                {currentYear}
              </th>
            </tr>
            <tr className="bg-[#1f4e79] text-white text-xs">
              <th className="py-2 px-2 border border-black text-center w-20">RKAP</th>
              <th className="py-2 px-2 border border-black text-center w-20">RAS</th>
              <th className="py-2 px-2 border border-black text-center w-20">RKAP</th>
              <th className="py-2 px-2 border border-black text-center w-20">RAS</th>
              {showStats && (
                <>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">AVG 3Y</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">STDEV</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">AVG-1SD</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">AVG+1SD</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">AVG+2SD</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">AVG+3SD</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">MIN</th>
                  <th className="py-2 px-2 border border-black text-center w-20 bg-[#548235]">MAX</th>
                </>
              )}
              <th className="py-2 px-2 border border-black text-center w-20 bg-[#2e75b6]">RKAP</th>
              <th className="py-2 px-2 border border-black text-center w-20 bg-[#2e75b6]">RAS</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {Object.keys(groupedData).length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="p-8 text-center text-gray-500 bg-gray-50">
                  <div className="inline-flex p-3 bg-white rounded-full mb-2 shadow-sm border border-gray-200">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p>Belum ada data RAS Tahunan untuk periode ini.</p>
                </td>
              </tr>
            ) : (
              Object.entries(groupedData).map(([category, items], gi) => {
                const totalRows = items.reduce((acc, it) => acc + 1 + (showNumDen && it.hasNumeratorDenominator ? 2 : 0), 0);
                return (
                  <React.Fragment key={gi}>
                    {items.map((item, idx) => {
                      const isFirst = idx === 0;
                      const hasCalc = item.hasNumeratorDenominator;
                      const itemSpan = showNumDen && hasCalc ? 3 : 1;
                      const dataYearMinus2 = getHistoricalItem(item, yearMinus2);
                      const dataYearMinus1 = getHistoricalItem(item, yearMinus1);
                      const stats = showStats ? calculateStats(item) : null;
                      const unitType = item.unitType;

                      return (
                        <React.Fragment key={item.id}>
                          {/* Main Row */}
                          <tr className="hover:bg-blue-50/50 transition-colors border-b border-gray-300">
                            {isFirst && (
                              <td rowSpan={totalRows} className="px-4 py-3 font-bold align-top bg-white border border-gray-400 text-gray-900">
                                {category}
                              </td>
                            )}
                            <td rowSpan={itemSpan} className="px-2 py-3 text-center align-top border border-gray-400 bg-[#d9eefb]">
                              {item.no || '-'}
                            </td>
                            <td className="px-3 py-3 text-sm align-top border border-gray-400 bg-[#d9eefb] text-justify min-w-[250px] font-medium">{item.parameter}</td>
                            <td rowSpan={itemSpan} className="px-1 py-1 align-top border border-gray-400 bg-white">
                              <textarea
                                value={item.formulasi || ''}
                                onChange={(e) => onUpdate(item.id, 'formulasi', e.target.value)}
                                className="w-full h-full min-h-[60px] bg-transparent text-xs italic focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 rounded p-1 resize-none"
                                placeholder="N/A"
                              />
                            </td>
                            <td rowSpan={itemSpan} className="px-2 py-3 text-xs text-center align-top border border-gray-400">
                              {item.dataTypeExplanation || '-'}
                            </td>

                            {/* Tahun Year-2 */}
                            <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400">
                              {getDisplayValue(dataYearMinus2, 'rkapTarget', unitType)}
                            </td>
                            <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400">
                              {getDisplayValue(dataYearMinus2, 'rasLimit', unitType)}
                            </td>

                            {/* Tahun Year-1 */}
                            <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400">
                              {getDisplayValue(dataYearMinus1, 'rkapTarget', unitType)}
                            </td>
                            <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400">
                              {getDisplayValue(dataYearMinus1, 'rasLimit', unitType)}
                            </td>

                            {/* Statistik */}
                            {showStats && (
                              <>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.avg, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.stdev, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.avg_min_1sd, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.avg_plus_1sd, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.avg_plus_2sd, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.avg_plus_3sd, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.min, unitType) : '-'}
                                </td>
                                <td rowSpan={itemSpan} className="px-2 py-3 text-center text-xs align-top border border-gray-400 bg-green-50">
                                  {stats ? formatRasDisplayValue(stats.max, unitType) : '-'}
                                </td>
                              </>
                            )}

                            {/* Tahun Current - Editable */}
                            <td rowSpan={itemSpan} className="px-1 py-1 text-center align-top border border-gray-400 bg-blue-50">
                              <input
                                type="text"
                                value={item.rkapTarget || ''}
                                onChange={(e) => onUpdate(item.id, 'rkapTarget', e.target.value)}
                                className="w-full bg-transparent text-center text-xs font-semibold text-blue-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 rounded px-1 py-2"
                                placeholder="N/A"
                              />
                            </td>
                            <td rowSpan={itemSpan} className="px-1 py-1 text-center align-top border border-gray-400 bg-blue-50">
                              <input
                                type="text"
                                value={item.rasLimit || ''}
                                onChange={(e) => onUpdate(item.id, 'rasLimit', e.target.value)}
                                className="w-full bg-transparent text-center text-xs font-bold text-red-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-400 rounded px-1 py-2"
                                placeholder="N/A"
                              />
                            </td>
                          </tr>

                          {/* Numerator Row */}
                          {showNumDen && hasCalc && (
                            <tr className="bg-indigo-50/50 text-xs text-gray-600 border-b border-gray-300">
                              <td className="px-4 py-2 border border-gray-400 italic text-black bg-indigo-50" colSpan={2}>
                                {item.numeratorLabel || 'Pembilang'}
                              </td>
                              {/* Placeholder cells untuk menjaga struktur tabel */}
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              {/* Statistik placeholder */}
                              {showStats && (
                                <>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                </>
                              )}
                              {/* Current year placeholder */}
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                            </tr>
                          )}

                          {/* Denominator Row */}
                          {showNumDen && hasCalc && (
                            <tr className="bg-indigo-50/50 text-xs text-gray-600 border-b border-gray-300">
                              <td className="px-4 py-2 border border-gray-400 italic text-black bg-indigo-50" colSpan={2}>
                                {item.denominatorLabel || 'Penyebut'}
                              </td>
                              {/* Placeholder cells */}
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              {/* Statistik placeholder */}
                              {showStats && (
                                <>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                  <td className="border border-gray-400 bg-indigo-50"></td>
                                </>
                              )}
                              {/* Current year placeholder */}
                              <td className="border border-gray-400 bg-indigo-50"></td>
                              <td className="border border-gray-400 bg-indigo-50"></td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
