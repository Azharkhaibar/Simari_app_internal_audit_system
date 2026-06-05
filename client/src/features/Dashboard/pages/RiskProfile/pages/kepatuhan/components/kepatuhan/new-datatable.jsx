import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const fmtNumber = (v) => {
  if (v === '' || v == null) return '';
  const n = Number(String(v).replace(/,/g, ''));
  if (isNaN(n)) return String(v);
  return new Intl.NumberFormat('en-US').format(n);
};

// helper untuk buang nol belakang
const trimZeros = (str) => str.replace(/\.?0+$/, '');

export default function DataTable({ rows, totalWeighted, viewYear, viewQuarter, startEdit, removeRow }) {
  const filtered = rows || [];

  // group per (No + Bobot Section + Section Label)
  const groups = React.useMemo(() => {
    if (!filtered.length) return [];

    const sorted = filtered.slice().sort((a, b) => {
      const noCmp = String(a.no || '').localeCompare(String(b.no || ''), undefined, { numeric: true });
      if (noCmp !== 0) return noCmp;

      const secCmp = String(a.sectionLabel || '').localeCompare(String(b.sectionLabel || ''));
      if (secCmp !== 0) return secCmp;

      return String(a.subNo || '').localeCompare(String(b.subNo || ''), undefined, { numeric: true });
    });

    const map = new Map();
    for (const r of sorted) {
      const key = `${r.no}|${r.bobotSection}|${r.sectionLabel}`;
      if (!map.has(key)) {
        map.set(key, {
          no: r.no,
          bobotSection: r.bobotSection,
          sectionLabel: r.sectionLabel,
          items: [],
        });
      }
      map.get(key).items.push(r);
    }
    return Array.from(map.values());
  }, [filtered]);

  // Menghitung distribusi risiko
  const riskDistribution = React.useMemo(() => {
    if (!filtered.length) {
      return {
        low: { count: 0, percentage: 0 },
        lowToModerate: { count: 0, percentage: 0 },
        moderate: { count: 0, percentage: 0 },
        moderateToHigh: { count: 0, percentage: 0 },
        high: { count: 0, percentage: 0 },
        total: 0,
      };
    }

    const distribution = {
      low: { count: 0, percentage: 0 },
      lowToModerate: { count: 0, percentage: 0 },
      moderate: { count: 0, percentage: 0 },
      moderateToHigh: { count: 0, percentage: 0 },
      high: { count: 0, percentage: 0 },
      total: 0,
    };

    let totalIndicators = 0;

    filtered.forEach((row) => {
      const mode = row.mode || 'RASIO';

      if (mode === 'RASIO') {
        const hasil = Number(row.hasil);
        if (!isNaN(hasil)) {
          const hasilPercent = hasil * 100;

          if (hasilPercent <= 1) {
            distribution.low.count++;
          } else if (hasilPercent > 1 && hasilPercent <= 2) {
            distribution.lowToModerate.count++;
          } else if (hasilPercent > 2 && hasilPercent <= 3) {
            distribution.moderate.count++;
          } else if (hasilPercent > 3 && hasilPercent <= 4) {
            distribution.moderateToHigh.count++;
          } else if (hasilPercent > 4) {
            distribution.high.count++;
          }

          totalIndicators++;
        }
      }
    });

    distribution.total = totalIndicators;

    if (distribution.total > 0) {
      distribution.low.percentage = ((distribution.low.count / distribution.total) * 100).toFixed(2);
      distribution.lowToModerate.percentage = ((distribution.lowToModerate.count / distribution.total) * 100).toFixed(2);
      distribution.moderate.percentage = ((distribution.moderate.count / distribution.total) * 100).toFixed(2);
      distribution.moderateToHigh.percentage = ((distribution.moderateToHigh.count / distribution.total) * 100).toFixed(2);
      distribution.high.percentage = ((distribution.high.count / distribution.total) * 100).toFixed(2);
    }

    return distribution;
  }, [filtered]);

  return (
    <section className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="w-full overflow-x-auto max-w-full">
        <table className="w-full min-w-[1800px] text-sm border border-gray-400 border-collapse">
          <thead>
            <tr className="text-white">
              <th rowSpan={2} className="border border-black px-3 py-2 bg-[#1f4e79] text-left">
                No
              </th>
              <th rowSpan={2} className="border border-black px-3 py-2 bg-[#1f4e79] text-left">
                Bobot
              </th>
              <th colSpan={3} className="px-3 py-2 border border-black bg-[#1f4e79] text-left">
                Parameter atau Indikator
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#1f4e79] text-left">
                Bobot
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#1f4e79] text-left">
                Sumber Risiko
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#1f4e79] text-left">
                Dampak
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#b7d7a8] text-center text-black">
                Low
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#c9daf8] text-center text-black">
                Low to Moderate
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#fff2cc] text-center text-black">
                Moderate
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#f9cb9c] text-center text-black">
                Moderate to High
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#e06666] text-center">
                High
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#2e75b6] text-right">
                Hasil
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#2e75b6] text-center">
                Peringkat
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#2e75b6] text-right text-white">
                Weighted
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#1f4e79] text-left">
                Keterangan
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-black bg-[#1f4e79] text-left">
                Aksi
              </th>
            </tr>
            <tr className="text-white">
              <th className="px-3 py-2 border border border-black bg-[#1f4e79] text-left" style={{ minWidth: '200px' }}>
                Section
              </th>
              <th className="px-3 py-2 border border-black bg-[#1f4e79] text-left" style={{ minWidth: '80px' }}>
                Sub No
              </th>
              <th className="px-3 py-2 border border-black bg-[#1f4e79] text-left" style={{ minWidth: '350px' }}>
                Indikator
              </th>
            </tr>
          </thead>

          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={18} className="px-3 py-6 text-center text-gray-500 border border-gray-400">
                  Belum ada data untuk {viewYear}-{viewQuarter}
                </td>
              </tr>
            ) : (
              groups.map((g, gi) => {
                const sectionRowSpan = g.items.reduce((acc, r) => {
                  const mode = r.mode || 'RASIO';
                  return acc + (mode === 'NILAI_TUNGGAL' ? 2 : 3);
                }, 0);

                return (
                  <React.Fragment key={gi}>
                    {g.items.map((r, idx) => {
                      const mode = r.mode || 'RASIO';
                      const isPercent = !!r.isPercent;
                      const isFirstOfSection = idx === 0;

                      // hasil di baris utama – hanya baca r.hasil
                      let hasilDisplay = '';
                      const raw = r.hasil === '' || r.hasil == null ? null : Number(String(r.hasil).replace(/,/g, ''));

                      if (raw != null && !isNaN(raw)) {
                        if (isPercent) {
                          const s = (raw * 100).toFixed(2);
                          hasilDisplay = `${trimZeros(s)}%`;
                        } else {
                          const s = raw.toFixed(4);
                          hasilDisplay = trimZeros(s);
                        }
                      } else if (typeof r.hasil === 'string') {
                        hasilDisplay = r.hasil;
                      }

                      // weighted tanpa persen
                      let weightedDisplay = '';
                      if (r.weighted !== '' && r.weighted != null && !isNaN(r.weighted)) {
                        weightedDisplay = String(Number(r.weighted));
                      }

                      const numVal = r.numeratorValue === '' || r.numeratorValue == null ? '' : fmtNumber(r.numeratorValue);
                      const denVal = r.denominatorValue === '' || r.denominatorValue == null ? '' : fmtNumber(r.denominatorValue);

                      return (
                        <React.Fragment key={`${g.no}-${g.sectionLabel}-${r.subNo}-${idx}`}>
                          {/* ---------- BARIS UTAMA INDIKATOR ---------- */}
                          <tr className="align-top hover:bg-gray-50">
                            {isFirstOfSection && (
                              <>
                                <td rowSpan={sectionRowSpan} className="border border-gray-400 px-3 py-2 bg-[#d9eefb]">
                                  {g.no}
                                </td>
                                <td rowSpan={sectionRowSpan} className="border border-gray-400 px-3 py-2 bg-[#d9eefb]">
                                  {String(g.bobotSection)}%
                                </td>
                                <td rowSpan={sectionRowSpan} className="border border-gray-400 px-3 py-2 bg-[#d9eefb]">
                                  {g.sectionLabel}
                                </td>
                              </>
                            )}

                            <td className="border border-gray-400 px-3 py-2 bg-[#d9eefb] text-center">{r.subNo}</td>

                            <td className="border border-gray-400 px-3 py-2 bg-[#d9eefb] align-top" style={{ minWidth: '350px' }}>
                              <div className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words pr-1">{r.indikator}</div>
                            </td>

                            <td className="border border-gray-400 px-3 py-2 text-center bg-[#d9eefb]">{String(r.bobotIndikator)}%</td>

                            <td className="border border-gray-400 px-3 py-2 align-top bg-[#d9eefb]" style={{ minWidth: '200px' }}>
                              <div className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words pr-1 ">{r.sumberRisiko}</div>
                            </td>
                            <td className="border border-gray-400 px-3 py-2 align-top bg-[#d9eefb]" style={{ minWidth: '200px' }}>
                              <div className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words pr-1">{r.dampak}</div>
                            </td>

                            <td className="border border-gray-400 px-2 py-2 text-center text-xs bg-green-700/10">{r.low}</td>
                            <td className="border border-gray-400 px-2 py-2 text-center text-xs bg-green-700/10">{r.lowToModerate}</td>
                            <td className="border border-gray-400 px-2 py-2 text-center text-xs bg-green-700/10">{r.moderate}</td>
                            <td className="border border-gray-400 px-2 py-2 text-center text-xs bg-green-700/10">{r.moderateToHigh}</td>
                            <td className="border border-gray-400 px-2 py-2 text-center text-xs bg-green-700/10">{r.high}</td>

                            <td className="border border-gray-400 px-3 py-2 text-right bg-gray-400/20">{hasilDisplay}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{String(r.peringkat ?? '')}</td>
                            <td className="border border-gray-400 px-3 py-2 text-right bg-gray-400/20">{weightedDisplay}</td>
                            <td className="border border-gray-400 px-3 py-2">{r.keterangan}</td>
                            <td className="border border-gray-400 px-3 py-2">
                              <div className="flex gap-1">
                                <button onClick={() => startEdit && startEdit(r)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50">
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button onClick={() => removeRow && removeRow(r)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-red-50 text-red-600">
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ---------- BARIS PEMBILANG (hanya RASIO) ---------- */}
                          {mode !== 'NILAI_TUNGGAL' && (
                            <tr>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2">{r.numeratorLabel}</td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2 bg-[#c6d9a7] text-right">{numVal}</td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                              <td className="border border-gray-300 px-3 py-2"></td>
                            </tr>
                          )}

                          {/* ---------- BARIS PENYEBUT (selalu) ---------- */}
                          <tr>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2">{r.denominatorLabel}</td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2 bg-[#c6d9a7] text-right">{denVal}</td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2"></td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr>
              <td className="border border-gray-400" colSpan={13}></td>
              <td className="border border-gray-400 text-white font-semibold text-center bg-[#0b3861]" colSpan={2}>
                Summary
              </td>
              <td className="border border-gray-400 text-white font-semibold text-center bg-[#8fce00]">{totalWeighted.toFixed(2)}</td>
              <td className="border border-gray-400"></td>
              <td className="border border-gray-400"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
