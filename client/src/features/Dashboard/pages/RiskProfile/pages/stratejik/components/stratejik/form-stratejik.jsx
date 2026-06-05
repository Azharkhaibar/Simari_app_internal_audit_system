import React, { useMemo, useState } from 'react';
import { computeWeighted } from '../../utils/stratejik/calc';
import { useAuditLog } from '../../../../../audit-log/hooks/audit-log.hooks';
import { useAuditLogContext } from '../../../../../audit-log/context/audit-log-context';

const FALLBACK_FORM = {
  year: new Date().getFullYear(),
  quarter: 'Q1',
  no: '',
  subNo: '',
  sectionLabel: '',
  indikator: '',
  bobotSection: 0,
  bobotIndikator: 0,
  sumberRisiko: '',
  dampak: '',
  low: '',
  lowToModerate: '',
  moderate: '',
  moderateToHigh: '',
  high: '',
  numeratorLabel: '',
  numeratorValue: '',
  denominatorLabel: '',
  denominatorValue: '',
  hasil: '',
  peringkat: 1,
  weighted: '',
  keterangan: '',
};

export default function FormStratejik({ form: incomingForm, setForm = () => {}, onAdd = () => {}, onSave = () => {}, onReset = () => {}, editing = false, title = 'Form Stratejik', loading = false }) {
  const form = { ...FALLBACK_FORM, ...(incomingForm || {}) };
  const [submitting, setSubmitting] = useState(false);
  const autoWeighted = useMemo(() => computeWeighted(Number(form.bobotSection || 0), Number(form.bobotIndikator || 0), Number(form.peringkat || 0)) || '', [form.bobotSection, form.bobotIndikator, form.peringkat]);

  const previewHasilPercent = useMemo(() => {
    const num = Number(form.numeratorValue || 0);
    const den = Number(form.denominatorValue || 0);
    const r = den ? num / den : 0;
    return (r * 100).toFixed(2) + '%';
  }, [form.numeratorValue, form.denominatorValue]);

  const { logCreate, logUpdate } = useAuditLogContext();

  const handleChange = (k, v) => setForm((prev) => ({ ...(prev || FALLBACK_FORM), [k]: v }));

  const convertToServiceFormat = (formData) => {
    const num = Number(formData.numeratorValue || 0);
    const den = Number(formData.denominatorValue || 0);
    const hasil = den ? (num / den) * 100 : 0;

    const no_indikator = formData.subNo?.trim() || '1.1.1';

    return {
      no: Number(formData.no) || 0,
      parameter: formData.sectionLabel || '',
      bobot: Number(formData.bobotSection) || 0,
      no_indikator: no_indikator,
      indikator: formData.indikator || '',
      bobot_indikator: Number(formData.bobotIndikator) || 0,
      sumber_resiko: formData.sumberRisiko || '',
      dampak: formData.dampak || '',
      low: formData.low || '',
      low_to_moderate: formData.lowToModerate || '',
      moderate: formData.moderate || '',
      moderate_to_high: formData.moderateToHigh || '',
      high: formData.high || '',
      hasil: hasil,
      peringkat: Number(formData.peringkat) || 1,
      weighted: Number(autoWeighted) || 0,
      keterangan: formData.keterangan || '',
      total_pembilang: Number(formData.numeratorValue) || 0,
      total_penyebut: Number(formData.denominatorValue) || 0,
      nama_pembilang: formData.numeratorLabel || '',
      nama_penyebut: formData.denominatorLabel || '',
      pereview_hasil: hasil,
    };
  };

  const handleAdd = async () => {
    const validationErrors = [];

    if (!form.sectionLabel?.trim()) {
      validationErrors.push('Nama Parameter harus diisi');
    }
    if (!form.indikator?.trim()) {
      validationErrors.push('Indikator Kinerja harus diisi');
    }
    if (!form.no || isNaN(Number(form.no))) {
      validationErrors.push('Nomor harus berupa angka yang valid');
    }
    if (!form.subNo?.trim()) {
      validationErrors.push('Sub Nomor harus diisi');
    } else {
      const hierarchicalRegex = /^\d+(\.\d+)*$/;
      if (!hierarchicalRegex.test(form.subNo)) {
        validationErrors.push('Sub Nomor harus dalam format hierarchical seperti 1.1, 1.2.1, 2.3.4');
      }
    }

    if (validationErrors.length > 0) {
      alert('Silakan perbaiki kesalahan berikut:\n\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitting(true);

    try {
      const serviceData = convertToServiceFormat(form);
      const result = await onAdd(serviceData);

      if (logCreate && typeof logCreate === 'function') {
        await logCreate('STRATEJIK', `Menambahkan data stratejik baru - Parameter: "${form.sectionLabel}", Indikator: "${form.indikator}", Sub No: ${form.subNo}`, {
          endpoint: '/api/stratejik',
          isSuccess: true,
          metadata: {
            no_indikator: form.subNo,
            parameter: form.sectionLabel,
            indikator: form.indikator,
            stratejik_data: serviceData,
          },
        });
        console.log('Audit log created successfully');
      }

      onReset();
      alert('Data stratejik berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding stratejik:', error);

      if (logCreate && typeof logCreate === 'function') {
        await logCreate('STRATEJIK', `Gagal menambahkan data stratejik - Parameter: "${form.sectionLabel}", Indikator: "${form.indikator}"`, {
          endpoint: '/api/stratejik',
          isSuccess: false,
          metadata: {
            error: error.message,
            error_details: error.response?.data || error.toString(),
          },
        });
      }

      alert('Gagal menambahkan data stratejik: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);

    try {
      const serviceData = convertToServiceFormat(form);
      console.log('Saving data - no_indikator:', serviceData.no_indikator, 'type:', typeof serviceData.no_indikator);

      const result = await onSave(serviceData);

      if (logUpdate && typeof logUpdate === 'function') {
        await logUpdate('STRATEJIK', `Memperbarui data stratejik - Parameter: "${form.sectionLabel}", Indikator: "${form.indikator}", Sub No: ${form.subNo}`, {
          endpoint: `/api/stratejik/${form.id || serviceData.no_indikator}`,
          isSuccess: true,
          metadata: {
            no_indikator: form.subNo,
            parameter: form.sectionLabel,
            indikator: form.indikator,
          },
        });
      }

      alert('Data stratejik berhasil diperbarui!');
    } catch (error) {
      console.error('Error saving stratejik:', error);

      if (logUpdate && typeof logUpdate === 'function') {
        await logUpdate('STRATEJIK', `Gagal memperbarui data stratejik - Parameter: "${form.sectionLabel}", Indikator: "${form.indikator}"`, {
          endpoint: `/api/stratejik/${form.id || 'unknown'}`,
          isSuccess: false,
          metadata: {
            error: error.message,
          },
        });
      }

      alert('Gagal memperbarui data stratejik: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubNoChange = (value) => {
    if (!/^[0-9.]*$/.test(value)) return;

    if (value.includes('..')) return;
    if (value.startsWith('.') || value.endsWith('.')) return;

    handleChange('subNo', value);
  };

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">{title}</h2>
              <p className="text-black mt-1">Kelola data stratejik dan analisis risiko secara komprehensif</p>
            </div>
          </div>
          <div className="bg-white backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <span className="text-gray-600 text-sm font-medium">
              Periode:{' '}
              <span className="font-bold text-blue-600">
                {form.year}-{form.quarter}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Identifikasi Parameter
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor</label>
                  <input
                    type="number"
                    value={form.no}
                    onChange={(e) => handleChange('no', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Masukkan nomor"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Nomor</label>
                  <input
                    type="text"
                    value={form.subNo}
                    onChange={(e) => handleSubNoChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Contoh: 1.1.1, 1.2.1, 1.3.1"
                    pattern="^\d+(\.\d+)*$"
                    title="Format hierarchical: angka.angka.angka (contoh: 1.1.1, 1.2.1)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: angka dan titik (contoh: 1.1, 1.1.1, 2.3.4)</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Parameter</label>
                <input
                  type="text"
                  value={form.sectionLabel}
                  onChange={(e) => handleChange('sectionLabel', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Masukkan nama parameter"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Analisis Risiko
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sumber Risiko</label>
                  <textarea
                    value={form.sumberRisiko}
                    onChange={(e) => handleChange('sumberRisiko', e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm resize-none"
                    placeholder="Deskripsikan sumber risiko yang mungkin terjadi..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dampak Risiko</label>
                  <textarea
                    value={form.dampak}
                    onChange={(e) => handleChange('dampak', e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm resize-none"
                    placeholder="Jelaskan dampak yang mungkin timbul..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Bobot & Indikator
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bobot Section</label>
                  <input
                    type="number"
                    value={form.bobotSection}
                    onChange={(e) => handleChange('bobotSection', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bobot Indikator</label>
                  <input
                    type="number"
                    value={form.bobotIndikator}
                    onChange={(e) => handleChange('bobotIndikator', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Indikator Kinerja</label>
                <textarea
                  value={form.indikator}
                  onChange={(e) => handleChange('indikator', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm resize-none"
                  placeholder="Tentukan indikator kinerja yang akan diukur..."
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Perhitungan Rasio
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pembilang</label>
                  <input
                    type="text"
                    value={form.numeratorLabel}
                    onChange={(e) => handleChange('numeratorLabel', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                    placeholder="Label pembilang"
                  />
                  <input
                    type="number"
                    value={form.numeratorValue}
                    onChange={(e) => handleChange('numeratorValue', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-2 bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Nilai pembilang"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Penyebut</label>
                  <input
                    type="text"
                    value={form.denominatorLabel}
                    onChange={(e) => handleChange('denominatorLabel', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                    placeholder="Label penyebut"
                  />
                  <input
                    type="number"
                    value={form.denominatorValue}
                    onChange={(e) => handleChange('denominatorValue', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-2 bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Nilai penyebut"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Hasil & Peringkat</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasil Rasio</label>
                <div className="w-full rounded-xl bg-white border border-gray-300 px-4 py-3 text-lg font-bold text-blue-600 text-center shadow-sm">{previewHasilPercent || '0%'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peringkat (1-5)</label>
                <input
                  type="number"
                  value={form.peringkat}
                  onChange={(e) => handleChange('peringkat', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 shadow-sm text-center font-semibold"
                  placeholder="1-5"
                  min="1"
                  max="5"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Weighted Score</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{autoWeighted !== '' ? `${autoWeighted}%` : '0%'}</div>
              <p className="text-xs text-gray-600">Formula: (Bobot Section × Bobot Indikator × Peringkat) ÷ 10000</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Keterangan Tambahan</h4>
            <textarea
              value={form.keterangan}
              onChange={(e) => handleChange('keterangan', e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 shadow-sm resize-none"
              placeholder="Tambahkan catatan atau keterangan khusus..."
            />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            Skala Tingkat Risiko
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { level: 'low', label: 'Rendah', color: 'green', value: form.low, placeholder: 'x ≤ 1%' },
              { level: 'lowToModerate', label: 'Rendah-Menengah', color: 'blue', value: form.lowToModerate, placeholder: '1% < x ≤ 2%' },
              { level: 'moderate', label: 'Menengah', color: 'yellow', value: form.moderate, placeholder: '2% < x ≤ 3%' },
              { level: 'moderateToHigh', label: 'Menengah-Tinggi', color: 'orange', value: form.moderateToHigh, placeholder: '3% < x ≤ 4%' },
              { level: 'high', label: 'Tinggi', color: 'red', value: form.high, placeholder: 'x > 4%' },
            ].map(({ level, label, color, value, placeholder }) => (
              <div key={level} className={`rounded-xl border-2 border-${color}-300 bg-${color}-50 p-4 hover:shadow-md transition-all duration-200`}>
                <label className={`block text-sm font-semibold text-${color}-800 mb-3`}>{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(level, e.target.value)}
                  className={`w-full rounded-lg border border-${color}-200 px-3 py-2 bg-white focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500 transition-all duration-200 text-sm`}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          {!editing ? (
            <button
              onClick={handleAdd}
              disabled={loading}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Data Stratejik
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={onReset}
                disabled={loading}
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batalkan Edit
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
