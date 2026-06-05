import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

// CSS untuk scrollbar auto-hide (muncul saat hover)
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }
  .custom-scrollbar:hover {
    scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
    transition: background 0.3s;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

const fmtNumber = (v) => {
  if (v === '' || v == null) return '';

  const s = String(v).trim();

  // Untuk pembilang/penyebut yang berupa string dengan format Indonesia
  // tampilkan APA ADANYA tanpa konversi, untuk sinkronisasi dengan RekapData
  if (typeof v === 'string' && (s.includes('.') || s.includes(','))) {
    return s;
  }

  // Untuk number murni atau string tanpa format, parse dan format
  let n;
  if (typeof v === 'number') {
    n = v;
  } else {
    const cleaned = s.replace(/\./g, '').replace(/,/g, '.');
    n = parseFloat(cleaned);
  }

  if (isNaN(n)) return String(v);

  // Format dengan id-ID (titik sebagai ribuan, koma sebagai desimal)
  return new Intl.NumberFormat('id-ID').format(n);
};

const trimZeros = (str) => str.replace(/\.?0+$/, '');

// Helper function untuk menghitung jumlah baris berdasarkan mode
// TEKS mode: 1 baris (hanya indikator)
// NILAI_TUNGGAL mode: 2 baris (indikator + penyebut)
// RASIO mode: 3 baris (indikator + pembilang + penyebut)
const getRowCountForMode = (mode) => {
  switch (mode) {
    case 'TEKS':
      return 1;
    case 'NILAI_TUNGGAL':
      return 2;
    case 'RASIO':
    default:
      return 3;
  }
};

export default function DataTable({ rows, totalWeighted, viewYear, viewQuarter, startEdit, removeRow }) {
  const filtered = rows || [];

  const isInherited = (row) => row && row.inheritedFrom;

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

  return (
    <div className="w-full h-full">
      <style>{scrollbarStyles}</style>
      <table className="text-sm border border-gray-300 border-collapse" style={{ tableLayout: 'fixed', minWidth: '2550px' }}>
        <thead>
          <tr className="bg-[#1f4e79] text-white">
            <th className="border border-black px-3 py-2 text-left" style={{ width: 50 }}>
              No
            </th>
            <th className="border border-black px-3 py-2 text-left" style={{ width: 70 }}>
              Bobot
            </th>
            <th className="border border-black px-3 py-2 text-left" style={{ width: 220 }}>
              Parameter / Section
            </th>
            <th className="border border-black px-3 py-2 text-left" style={{ width: 230 }}>
              Indikator & Pembilang/Penyebut
            </th>
            <th className="border border-black px-3 py-2 text-center" style={{ width: 100 }}>
              Bobot Indikator
            </th>
            <th className="border border-black px-3 py-2 text-left" style={{ width: 220 }}>
              Sumber Risiko
            </th>
            <th className="border border-black px-3 py-2 text-left" style={{ width: 220 }}>
              Dampak
            </th>
            <th className="border border-black px-3 py-2 bg-[#2e7d32] text-center text-white font-bold" style={{ width: 135 }}>
              Low
            </th>
            <th className="border border-black px-3 py-2 bg-[#92D050] text-center text-black font-bold" style={{ width: 135 }}>
              Low to Moderate
            </th>
            <th className="border border-black px-3 py-2 bg-[#ffff00] text-center text-black font-bold" style={{ width: 135 }}>
              Moderate
            </th>
            <th className="border border-black px-3 py-2 bg-[#ffc000] text-center text-black font-bold" style={{ width: 135 }}>
              Moderate to High
            </th>
            <th className="border border-black px-3 py-2 bg-[#ff0000] text-center text-white font-bold" style={{ width: 135 }}>
              High
            </th>
            <th className="border border-black px-3 py-2 bg-[#2e75b6]" style={{ width: 90 }}>
              Hasil
            </th>
            <th className="px-3 py-2 bg-[#2e75b6] text-left border border-black" style={{ width: 70 }}>
              Peringkat
            </th>
            <th className="px-3 py-2 bg-[#2e75b6] text-left text-white border border-black" style={{ width: 80 }}>
              Weighted
            </th>
            <th className="border border-black px-3 py-2 bg-[#1f4e79] text-left" style={{ width: 100 }}>
              Keterangan
            </th>
            <th className="border border-black px-3 py-2 text-center" style={{ width: 70 }}>
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td className="border px-3 py-6 text-center text-gray-500" colSpan={17}>
                Belum ada data untuk {viewYear}-{viewQuarter}
              </td>
            </tr>
          ) : (
            groups.map((g, gi) => {
              if (!g.items.length) {
                return (
                  <tr key={gi} className="bg-[#e9f5e1]">
                    <td className="border px-3 py-3 text-center" style={{ height: 70 }}>
                      {g.no}
                    </td>
                    <td className="border px-3 py-3 text-center" style={{ height: 70 }}>
                      {g.bobotSection}%
                    </td>
                    <td className="border px-3 py-0">
                      <div style={{ minHeight: 70, padding: '12px 0' }}>{g.sectionLabel}</div>
                    </td>
                    <td className="border px-3 py-3 text-center" colSpan={14} style={{ height: 70 }}>
                      Belum ada indikator
                    </td>
                  </tr>
                );
              }

              return (
                <React.Fragment key={gi}>
                  {g.items.map((r, idx) => {
                    const mode = r.mode || 'RASIO';
                    const isPercent = !!r.isPercent;
                    const isFirstOfSection = idx === 0;
                    const isTeksMode = mode === 'TEKS';

                    // Hitung total baris yang sebenarnya untuk section ini
                    // dengan menjumlahkan actual rows berdasarkan mode masing-masing item
                    const totalSectionRows = g.items.reduce((sum, item) => {
                      return sum + getRowCountForMode(item.mode || 'RASIO');
                    }, 0);

                    let hasilDisplay = '';
                    if (isTeksMode) {
                      hasilDisplay = r.hasilText || '';
                    } else if (r.hasil !== '' && r.hasil != null && !isNaN(Number(r.hasil))) {
                      if (isPercent) {
                        const pct = Number(r.hasil) * 100;
                        if (!isFinite(pct) || isNaN(pct)) {
                          hasilDisplay = '';
                        } else {
                          hasilDisplay = pct.toFixed(2) + '%';
                        }
                      } else {
                        const s = Number(r.hasil).toFixed(4);
                        hasilDisplay = trimZeros(s);
                      }
                    }

                    const weightedDisplay = (typeof r.weighted === 'number' || (typeof r.weighted === 'string' && r.weighted !== '')) && r.weighted != null ? Number(r.weighted).toFixed(2) : '';

                    // ===== PERBAIKAN: Ambil nilai dengan fallback =====
                    const rawPembilang = r.pembilangValue !== undefined && r.pembilangValue !== '' ? r.pembilangValue : r.numeratorValue !== undefined && r.numeratorValue !== '' ? r.numeratorValue : '';

                    const rawPenyebut = r.penyebutValue !== undefined && r.penyebutValue !== '' ? r.penyebutValue : r.denominatorValue !== undefined && r.denominatorValue !== '' ? r.denominatorValue : '';

                    // Gunakan raw value untuk string dengan format (mengandung titik/koma)
                    // untuk sinkronisasi dengan RekapData
                    const numVal = rawPembilang === '' || rawPembilang == null ? '' : typeof rawPembilang === 'string' && (rawPembilang.includes('.') || rawPembilang.includes(',')) ? rawPembilang : fmtNumber(rawPembilang);

                    const denVal = rawPenyebut === '' || rawPenyebut == null ? '' : typeof rawPenyebut === 'string' && (rawPenyebut.includes('.') || rawPenyebut.includes(',')) ? rawPenyebut : fmtNumber(rawPenyebut);

                    // Label untuk pembilang dan penyebut (dengan fallback)
                    const pembilangLabel = r.pembilangLabel || r.numeratorLabel || '';
                    const penyebutLabel = r.penyebutLabel || r.denominatorLabel || '';

                    return (
                      <React.Fragment key={`${g.no}-${g.sectionLabel}-${r.subNo}-${idx}`}>
                        <tr className={isInherited(r) ? 'bg-yellow-50/50' : ''}>
                          {isFirstOfSection && (
                            <>
                              <td rowSpan={totalSectionRows} className="border px-3 py-3 align-top bg-[#d9eefb] text-center font-semibold">
                                {g.no}
                              </td>
                              <td rowSpan={totalSectionRows} className="border px-3 py-3 align-top bg-[#d9eefb] text-center">
                                {g.bobotSection}%
                              </td>
                              <td rowSpan={totalSectionRows} className="border px-3 py-0 align-top bg-[#d9eefb]">
                                <div style={{ minHeight: 70, padding: '12px 0' }}>{g.sectionLabel}</div>
                              </td>
                            </>
                          )}

                          <td className="border px-3 py-0 align-top bg-[#d9eefb]">
                            <div style={{ minHeight: 70, padding: '12px 0' }}>
                              <div className="font-medium">{r.indikator}</div>
                            </div>
                          </td>
                          <td className="border px-3 py-0 text-center align-top bg-[#d9eefb]">
                            <div style={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.bobotIndikator}%</div>
                          </td>
                          <td className="border px-3 py-0 align-top bg-[#d9eefb]">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', padding: '12px 0' }}>
                              {r.sumberRisiko}
                            </div>
                          </td>
                          <td className="border px-3 py-0 align-top bg-[#d9eefb]">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', padding: '12px 0' }}>
                              {r.dampak}
                            </div>
                          </td>

                          <td className="border px-3 py-0 text-center bg-green-700/10">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                              {r.low}
                            </div>
                          </td>
                          <td className="border px-3 py-0 text-center bg-green-700/10">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                              {r.lowToModerate}
                            </div>
                          </td>
                          <td className="border px-3 py-0 text-center bg-green-700/10">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                              {r.moderate}
                            </div>
                          </td>
                          <td className="border px-3 py-0 text-center bg-green-700/10">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                              {r.moderateToHigh}
                            </div>
                          </td>
                          <td className="border px-3 py-0 text-center bg-green-700/10">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                              {r.high}
                            </div>
                          </td>

                          <td className="border px-3 py-0 text-right bg-gray-400/20">
                            <div style={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px' }}>{hasilDisplay}</div>
                          </td>

                          <td
                            className="relative"
                            style={{
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            {!isTeksMode || (isTeksMode && r.peringkat && r.peringkat > 0) ? (
                              <>
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: r.peringkat === 1 ? '#2e7d32' : r.peringkat === 2 ? '#92D050' : r.peringkat === 3 ? '#ffff00' : r.peringkat === 4 ? '#ffc000' : '#ff0000',
                                    zIndex: 0,
                                  }}
                                />
                                <div
                                  style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '12px 8px',
                                    color: r.peringkat === 1 ? 'white' : r.peringkat === 2 ? 'black' : r.peringkat === 3 ? 'black' : r.peringkat === 4 ? 'black' : 'white',
                                    fontWeight: '700',
                                    fontSize: '18px',
                                  }}
                                >
                                  {r.peringkat}
                                </div>
                              </>
                            ) : (
                              // TEKS mode dengan peringkat 0/kosong → tampilkan N/A
                              <div
                                style={{
                                  position: 'relative',
                                  zIndex: 1,
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: '12px 8px',
                                  color: '#888',
                                  fontWeight: '400',
                                  fontSize: '14px',
                                }}
                              >
                                N/A
                              </div>
                            )}
                          </td>

                          <td className="border px-3 py-0 text-right bg-gray-400/20">
                            <div style={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px' }}>{weightedDisplay}</div>
                          </td>
                          <td className="border px-3 py-0">
                            <div className="custom-scrollbar" style={{ height: 70, overflowY: 'auto', padding: '12px 0' }}>
                              {r.keterangan}
                            </div>
                          </td>

                          <td className="border px-3 py-0 text-center">
                            <div style={{ minHeight: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              {isInherited(r) && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-300 cursor-help" title={`Di-clone dari ${r.inheritedFrom}`}>
                                  Di-clone
                                </span>
                              )}
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => startEdit && startEdit(r)} className="px-2 py-1 rounded border">
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={() => removeRow && removeRow(r)} className="px-2 py-1 rounded border text-red-600">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Pembilang row – hanya untuk mode RASIO */}
                        {mode === 'RASIO' && (
                          <tr className={isInherited(r) ? 'bg-yellow-50/50' : 'bg-white'}>
                            <td className="border px-3 py-0">
                              <div style={{ minHeight: 50, padding: '8px 0' }}>
                                <div className="text-sm text-gray-700 mt-1">{pembilangLabel || '-'}</div>
                              </div>
                            </td>

                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>

                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0 bg-[#c6d9a7] text-right">
                              <div style={{ minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px' }}>{numVal}</div>
                            </td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0 text-center" style={{ minHeight: 50 }}></td>
                          </tr>
                        )}

                        {/* Penyebut row - untuk RASIO dan NILAI_TUNGGAL */}
                        {mode !== 'TEKS' && (
                          <tr className={isInherited(r) ? 'bg-yellow-50/50' : 'bg-white'}>
                            <td className="border px-3 py-0">
                              <div style={{ minHeight: 50, padding: '8px 0' }}>
                                <div className="text-sm text-gray-700 mt-1">{penyebutLabel || '-'}</div>
                              </div>
                            </td>

                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>

                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0 bg-[#c6d9a7] text-right">
                              <div style={{ minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px' }}>{denVal}</div>
                            </td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0" style={{ minHeight: 50 }}></td>
                            <td className="border px-3 py-0 text-center" style={{ minHeight: 50 }}></td>
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

        <tfoot>
          <tr>
            <td className="border border-gray-400" colSpan={12}></td>
            <td className="border border-gray-400 text-white font-semibold text-center bg-[#0b3861]" colSpan={2}>
              Summary
            </td>
            <td className="border border-gray-400 text-white font-semibold text-center bg-[#8fce00]">{totalWeighted.toFixed(2)}</td>
            <td className="border border-gray-400" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
