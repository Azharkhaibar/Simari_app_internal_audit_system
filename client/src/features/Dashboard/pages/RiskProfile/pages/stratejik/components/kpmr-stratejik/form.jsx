import React, { useMemo } from 'react';
import { TextField, TextAreaField, NumberField, ReadOnlyField, RiskField } from './input-stratejik';
import { computeWeighted } from '../../utils/stratejik/calc';
import { Plus, Save, X, Calculator, Target, BarChart3 } from 'lucide-react';

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

export default function FormStratejik({ form: incomingForm, setForm = () => {}, onAdd = () => {}, onSave = () => {}, onReset = () => {}, editing = false, title = 'Form Stratejik' }) {
  const form = { ...FALLBACK_FORM, ...(incomingForm || {}) };

  const autoWeighted = useMemo(() => computeWeighted(Number(form.bobotSection || 0), Number(form.bobotIndikator || 0), Number(form.peringkat || 0)) || '', [form.bobotSection, form.bobotIndikator, form.peringkat]);

  const previewHasilPercent = useMemo(() => {
    const num = Number(form.numeratorValue || 0);
    const den = Number(form.denominatorValue || 0);
    const r = den ? num / den : 0;
    return (r * 100).toFixed(2) + '%';
  }, [form.numeratorValue, form.denominatorValue]);

  const handleChange = (k, v) => setForm((prev) => ({ ...(prev || FALLBACK_FORM), [k]: v }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Data Stratejik' : 'Input Data Baru'}</h2>
              <p className="text-sm text-gray-600 mt-1">Isi form berikut untuk {editing ? 'mengedit' : 'menambahkan'} data stratejik</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-600">Periode: </span>
            <span className="text-sm font-semibold text-blue-600">
              {form.year}-{form.quarter}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full"></div>
                <span className="text-sm font-medium">Informasi Dasar</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="No" value={form.no} onChange={(v) => handleChange('no', v)} placeholder="1" />
                <TextField label="No Parameter" value={form.subNo} onChange={(v) => handleChange('subNo', v)} placeholder="1.1" />
              </div>
              <TextField label="Parameter" value={form.sectionLabel} onChange={(v) => handleChange('sectionLabel', v)} placeholder="Nama parameter" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Analisis Risiko</span>
              </div>
              <TextAreaField label="Sumber Risiko" value={form.sumberRisiko} onChange={(v) => handleChange('sumberRisiko', v)} placeholder="Deskripsi sumber risiko" rows={2} />
              <TextAreaField label="Dampak" value={form.dampak} onChange={(v) => handleChange('dampak', v)} placeholder="Deskripsi dampak risiko" rows={2} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Perhitungan</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Faktor Pembilang" value={form.numeratorLabel} onChange={(v) => handleChange('numeratorLabel', v)} placeholder="Label pembilang" />
                <TextField label="Total Pembilang" value={form.numeratorValue} onChange={(v) => handleChange('numeratorValue', v)} placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Faktor Penyebut" value={form.denominatorLabel} onChange={(v) => handleChange('denominatorLabel', v)} placeholder="Label penyebut" />
                <TextField label="Total Penyebut" value={form.denominatorValue} onChange={(v) => handleChange('denominatorValue', v)} placeholder="0" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Bobot & Indikator</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Bobot Section" value={form.bobotSection} onChange={(v) => handleChange('bobotSection', v)} placeholder="0" />
                <NumberField label="Bobot Indikator" value={form.bobotIndikator} onChange={(v) => handleChange('bobotIndikator', v)} placeholder="0" />
              </div>
              <TextAreaField label="Indikator" value={form.indikator} onChange={(v) => handleChange('indikator', v)} placeholder="Deskripsi indikator..." rows={3} />
            </div>

            {/* Results */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                <span className="text-sm font-medium">Hasil & Peringkat</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <ReadOnlyField label="Hasil (%)" value={previewHasilPercent} />
                <NumberField label="Peringkat" value={form.peringkat} onChange={(v) => handleChange('peringkat', v)} min={1} max={5} placeholder="1-5" />
                <ReadOnlyField label="Weighted" value={form.weighted !== '' ? `${form.weighted}%` : autoWeighted !== '' ? `${autoWeighted}%` : '-'} />
              </div>
            </div>

            {/* Risk Scale */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Skala Risiko</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <RiskField label="Low" value={form.low} onChange={(v) => handleChange('low', v)} color="#B7E1A1" textColor="#0B3D2E" placeholder="≤1%" />
                <RiskField label="Low-Mod" value={form.lowToModerate} onChange={(v) => handleChange('lowToModerate', v)} color="#CFE0FF" textColor="#0B2545" placeholder="1-2%" />
                <RiskField label="Mod" value={form.moderate} onChange={(v) => handleChange('moderate', v)} color="#FFEEAD" textColor="#4B3A00" placeholder="2-3%" />
                <RiskField label="Mod-High" value={form.moderateToHigh} onChange={(v) => handleChange('moderateToHigh', v)} color="#FAD2A7" textColor="#5A2E00" placeholder="3-4%" />
                <RiskField label="High" value={form.high} onChange={(v) => handleChange('high', v)} color="#E57373" textColor="#FFFFFF" placeholder=">4%" />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <TextAreaField label="Keterangan" value={form.keterangan} onChange={(v) => handleChange('keterangan', v)} placeholder="Tambahkan keterangan tambahan..." rows={2} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
          {!editing ? (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Tambah Data
            </button>
          ) : (
            <>
              <button onClick={onReset} className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium">
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                onClick={onSave}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Save className="w-4 h-4" />
                Update Data
              </button>
            </>
          )}
        </div>

        {/* Hint */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">Tips Produktivitas</p>
              <p className="text-sm text-blue-600 mt-1">
                Gunakan <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">Tab</kbd> untuk navigasi cepat dan <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">Enter</kbd>{' '}
                untuk menyimpan data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}