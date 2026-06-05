import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

export default function DataTable({ rows, totalWeighted, viewYear, viewQuarter, startEdit, removeRow }) {
  const filtered = rows;

  return (
    <section className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] text-sm border border-gray-400 border-collapse">
          <thead>
            <tr className="text-white">
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                No
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                Bobot
              </th>
              <th colSpan={3} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                Parameter atau Indikator
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                Bobot
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                Sumber Risiko
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                Dampak
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#b7d7a8] text-left text-black">
                Low
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#c9daf8] text-left text-black">
                Low to Moderate
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#fff2cc] text-left text-black">
                Moderate
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#f9cb9c] text-left text-black">
                Moderate to High
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#e06666] text-left">
                High
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#2e75b6] text-left">
                Hasil
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#385723] text-left">
                Peringkat
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#d9d9d9] text-left text-black">
                Weighted
              </th>
              <th rowSpan={2} className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">
                Keterangan
              </th>
            </tr>
            <tr className="text-white">
              <th className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">Section</th>
              <th className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">Sub No</th>
              <th className="px-3 py-2 border border-gray-400 bg-[#1f4e79] text-left">Indikator</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={17} className="px-3 py-6 text-center text-gray-500 border border-gray-400">
                  Belum ada data untuk {viewYear}-{viewQuarter}
                </td>
              </tr>
            ) : (
              filtered
                .slice()
                .sort((a, b) => a.subNo.localeCompare(b.subNo, undefined, { numeric: true }))
                .map((r, i) => (
                  <React.Fragment key={`${r.year}-${r.quarter}-${i}-${r.subNo}`}>
                    <tr className="align-top hover:bg-gray-50">
                      <td className="border border-gray-400 px-3 py-2">{r.no}</td>
                      <td className="border border-gray-400 px-3 py-2">{String(r.bobotSection)}%</td>
                      <td className="border border-gray-400 px-3 py-2 bg-[#d9eefb]">{r.sectionLabel}</td>
                      <td className="border border-gray-400 px-3 py-2 bg-[#d9eefb]">{r.subNo}</td>
                      <td className="border border-gray-400 px-3 py-2 bg-[#d9eefb] whitespace-pre-wrap">{r.indikator}</td>
                      <td className="border border-gray-400 px-3 py-2">{String(r.bobotIndikator)}%</td>
                      <td className="border border-gray-400 px-3 py-2 whitespace-pre-wrap">{r.sumberRisiko}</td>
                      <td className="border border-gray-400 px-3 py-2 whitespace-pre-wrap">{r.dampak}</td>
                      <td className="border border-gray-400 px-3 py-2">{r.low}</td>
                      <td className="border border-gray-400 px-3 py-2">{r.lowToModerate}</td>
                      <td className="border border-gray-400 px-3 py-2">{r.moderate}</td>
                      <td className="border border-gray-400 px-3 py-2">{r.moderateToHigh}</td>
                      <td className="border border-gray-400 px-3 py-2">{r.high}</td>
                      <td className="border border-gray-400 px-3 py-2 text-right">{typeof r.hasil === 'number' ? (r.hasil * 100).toFixed(2) + '%' : r.hasil}</td>
                      <td className="border border-gray-400 px-3 py-2">{String(r.peringkat)}</td>
                      <td className="border border-gray-400 px-3 py-2 text-right">{r.weighted !== '' ? `${r.weighted}%` : ''}</td>
                      <td className="border border-gray-400 px-3 py-2">{r.keterangan}</td>
                    </tr>

                    {/* Pembilang */}
                    <tr>
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}></td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                      <td className="border border-gray-300 px-3 py-2">{r.numeratorLabel}</td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={8}></td>
                      <td className="border border-gray-300 px-3 py-2 bg-[#c6d9a7] text-right">{String(r.numeratorValue || 0)}</td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                    </tr>
                    {/* Penyebut */}
                    <tr>
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}></td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                      <td className="border border-gray-300 px-3 py-2">{r.denominatorLabel}</td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={8}></td>
                      <td className="border border-gray-300 px-3 py-2 bg-[#c6d9a7] text-right">{String(r.denominatorValue || 0)}</td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                    </tr>

                    {/* Aksi */}
                    <tr>
                      <td className="border border-gray-200 px-3 py-2" colSpan={17}>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(i)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                            <Edit3 size={16} /> Edit
                          </button>
                          <button onClick={() => removeRow(i)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600">
                            <Trash2 size={16} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
            )}
          </tbody>

          {/* Summary footer (Web) */}
          <tfoot>
            <tr>
              <td className="border border-gray-400" colSpan={13}></td>
              <td className="border border-gray-400 text-white font-semibold text-center bg-[#0b3861]" colSpan={2}>
                Summary
              </td>
              <td className="border border-gray-400 text-white font-semibold text-center bg-[#8fce00]">{totalWeighted.toFixed(2)}</td>
              <td className="border border-gray-400"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
