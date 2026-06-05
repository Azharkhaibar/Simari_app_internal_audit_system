import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

export default function KPMRTable({ groups, filtered, viewYear, viewQuarter, onStartEdit, onRemoveRow }) {
  return (
    <section className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-100 border-b">
        <div className="font-semibold">
          Data KPMR – Operasional ({viewYear}-{viewQuarter})
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1400px] text-sm border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-[#1f4e79] text-white">
              <th className="border px-3 py-2 text-left" colSpan={2}>
                KUALITAS PENERAPAN MANAJEMEN RISIKO OPERASIONAL
              </th>
              <th className="border px-3 py-2 text-center w-24" rowSpan={2}>
                Skor
              </th>
              <th className="border px-3 py-2 text-center w-40" rowSpan={2}>
                1 (Strong)
              </th>
              <th className="border px-3 py-2 text-center w-40" rowSpan={2}>
                2 (Satisfactory)
              </th>
              <th className="border px-3 py-2 text-center w-40" rowSpan={2}>
                3 (Fair)
              </th>
              <th className="border px-3 py-2 text-center w-40" rowSpan={2}>
                4 (Marginal)
              </th>
              <th className="border px-3 py-2 text-center w-44" rowSpan={2}>
                5 (Unsatisfactory)
              </th>
              <th className="border px-3 py-2 text-center w-[260px]" rowSpan={2}>
                Evidence
              </th>
              <th className="border px-3 py-2 text-center w-32" rowSpan={2}>
                Action
              </th>
            </tr>
            <tr className="bg-[#1f4e79] text-white">
              <th className="border px-3 py-2 w-20">No</th>
              <th className="border px-3 py-2">Pertanyaan / Indikator</th>
            </tr>
          </thead>

          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td className="border px-3 py-6 text-center text-gray-500" colSpan={10}>
                  Belum ada data
                </td>
              </tr>
            ) : (
              groups.map((g, gi) => {
                const vals = g.items.map((it) => (it.sectionSkor === '' ? null : Number(it.sectionSkor))).filter((v) => v != null && !isNaN(v));
                const skorAspek = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '';

                return (
                  <React.Fragment key={gi}>
                    {/* Baris Aspek */}
                    <tr className="bg-[#e9f5e1]">
                      <td className="border px-3 py-2 font-semibold" colSpan={2}>
                        {g.aspekNo} : {g.aspekTitle} <span className="text-gray-600">(Bobot: {g.aspekBobot}%)</span>
                       </td>
                      <td className="border px-3 py-2 text-center font-bold" style={{ backgroundColor: '#93d150' }}>
                        {skorAspek}
                       </td>
                      <td className="border px-3 py-2" colSpan={6}> </td>
                      <td className="border px-3 py-2"> </td>
                    </tr>

                    {/* Baris Section */}
                    {g.items.map((r, idx) => {
                      const filteredIndex = filtered.findIndex((x) => x.year === r.year && x.quarter === r.quarter && x.aspekNo === r.aspekNo && x.sectionNo === r.sectionNo && x.sectionTitle === r.sectionTitle);
                      return (
                        <tr key={`${gi}-${idx}`} className="align-top hover:bg-gray-50">
                          <td className="border px-2 py-2 text-center">{r.sectionNo}</td>
                          <td className="border px-2 py-2 whitespace-pre-wrap">{r.sectionTitle}</td>
                          <td className="border px-2 py-2 text-center">{r.sectionSkor}</td>
                          <td className="border px-2 py-2 whitespace-pre-wrap">{r.level1}</td>
                          <td className="border px-2 py-2 whitespace-pre-wrap">{r.level2}</td>
                          <td className="border px-2 py-2 whitespace-pre-wrap">{r.level3}</td>
                          <td className="border px-2 py-2 whitespace-pre-wrap">{r.level4}</td>
                          <td className="border px-2 py-2 whitespace-pre-wrap">{r.level5}</td>
                          <td className="border px-2 py-2">
                            <span className="whitespace-pre-wrap">{r.evidence}</span>
                          </td>
                          <td className="border px-2 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => onStartEdit(filteredIndex)} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 text-blue-600 whitespace-nowrap" title="Edit baris ini">
                                <Edit3 size={14} /> Edit
                              </button>
                              <button onClick={() => onRemoveRow(filteredIndex)} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 hover:bg-red-50 text-red-600 whitespace-nowrap" title="Hapus baris ini">
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}

            <tr className="bg-[#c9daf8] font-semibold">
              <td colSpan={2} className="border px-3 py-2"> </td>
              <td className="border px-3 py-2 text-center font-bold" style={{ backgroundColor: '#93d150' }}>
                {(() => {
                  if (!groups || groups.length === 0) return '';
                  const perAspek = groups
                    .map((g) => {
                      const vals = g.items.map((it) => (it.sectionSkor === '' ? null : Number(it.sectionSkor))).filter((v) => v != null && !isNaN(v));
                      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
                    })
                    .filter((v) => v != null && !isNaN(v));
                  return perAspek.length ? (perAspek.reduce((a, b) => a + b, 0) / perAspek.length).toFixed(2) : '';
                })()}
              </td>
              <td colSpan={7} className="border px-3 py-2"> </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}