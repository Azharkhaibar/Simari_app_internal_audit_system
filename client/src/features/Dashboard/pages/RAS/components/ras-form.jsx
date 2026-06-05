// ras-form.jsx (UPDATED)
import React, { useState, useEffect, useMemo } from 'react';
import { RISK_ATTITUDE_INFO, UNIT_TYPES, MONTH_OPTIONS, DEFAULT_RISK_CATEGORIES } from '../utils/ras-constant.js';
import { calculateRasValue, formatRasDisplayValue } from '../utils/ras-utils.js';
import { ChevronDown, History, Loader2 } from 'lucide-react';
import { rasApi } from '../service/rasService/ras.service.js';

const FormGroup = ({ label, children, required, subLabel }) => (
  <div className="mb-4">
    <div className="flex justify-between items-end mb-1.5">
      <label className="block text-sm font-semibold text-white">
        {label} {required && <span className="text-red-200">*</span>}
      </label>
      {subLabel && <span className="text-xs text-blue-100 italic">{subLabel}</span>}
    </div>
    {children}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input className={`w-full rounded-xl border-0 bg-white/90 px-4 py-2.5 text-gray-800 text-sm focus:ring-2 focus:ring-yellow-400 focus:bg-white shadow-sm transition-all placeholder:text-gray-400 ${className}`} {...props} />
);

const Select = ({ className = '', children, ...props }) => (
  <select className={`w-full rounded-xl border-0 bg-white/90 px-4 py-2.5 text-gray-800 text-sm focus:ring-2 focus:ring-yellow-400 focus:bg-white shadow-sm transition-all ${className}`} {...props}>
    {children}
  </select>
);

const TextArea = ({ className = '', ...props }) => (
  <textarea className={`w-full rounded-xl border-0 bg-white/90 px-4 py-2.5 text-gray-800 text-sm focus:ring-2 focus:ring-yellow-400 focus:bg-white shadow-sm transition-all resize-none ${className}`} {...props} />
);

const initialFormState = {
  riskCategory: '',
  isNewCategory: false,
  no: '',
  parameter: '',
  rkapTarget: '',
  dataTypeExplanation: '',
  rasLimit: '',
  riskStance: 'Moderat',
  statement: '',
  notes: '',
  unitType: 'PERCENTAGE',
  hasNumeratorDenominator: false,
  numeratorLabel: '',
  denominatorLabel: '',
  monthlyValues: {},
  groupId: null,
};

export default function RasForm({ existingCategories = [], onSubmit, onCancel, initialData = null, allData = [] }) {
  const [form, setForm] = useState(initialFormState);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [currentNum, setCurrentNum] = useState('');
  const [currentDen, setCurrentDen] = useState('');
  const [currentMan, setCurrentMan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalParams, setHistoricalParams] = useState([]);

  const availableCategories = useMemo(() => {
    const combined = new Set([...DEFAULT_RISK_CATEGORIES, ...existingCategories]);
    return Array.from(combined);
  }, [existingCategories, DEFAULT_RISK_CATEGORIES]);

  // Fetch historical data dari API
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!initialData) {
        try {
          // Fetch semua data untuk template
          const allHistoricalData = await rasApi.getAll();

          // Ambil parameter unik
          const uniqueMap = new Map();
          const sortedData = [...allHistoricalData].sort((a, b) => b.year - a.year || b.id - a.id);

          sortedData.forEach((item) => {
            const paramName = item.parameter?.trim();
            if (paramName && !uniqueMap.has(paramName)) {
              uniqueMap.set(paramName, item);
            }
          });

          setHistoricalParams(Array.from(uniqueMap.values()));
        } catch (err) {
          console.error('Gagal mengambil data historis:', err);
        }
      }
    };

    fetchHistoricalData();
  }, [initialData]);

  const handleTemplateSelect = (e) => {
    const selectedParamName = e.target.value;
    if (!selectedParamName) return;

    const templateItem = historicalParams.find((p) => p.parameter === selectedParamName);

    if (templateItem) {
      setForm((prev) => ({
        ...prev,
        riskCategory: templateItem.riskCategory,
        parameter: templateItem.parameter,
        no: '',
        rkapTarget: templateItem.rkapTarget,
        dataTypeExplanation: templateItem.dataTypeExplanation,
        rasLimit: templateItem.rasLimit,
        riskStance: templateItem.riskStance,
        statement: templateItem.statement,
        notes: templateItem.notes,
        unitType: templateItem.unitType || 'PERCENTAGE',
        hasNumeratorDenominator: templateItem.hasNumeratorDenominator || false,
        numeratorLabel: templateItem.numeratorLabel || '',
        denominatorLabel: templateItem.denominatorLabel || '',
        groupId: templateItem.groupId,
        monthlyValues: {},
        tindakLanjut: null,
      }));

      setCurrentNum('');
      setCurrentDen('');
      setCurrentMan('');
    }
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialFormState,
        ...initialData,
        isNewCategory: false,
        monthlyValues: initialData.monthlyValues || {}, // ✅ Pastikan object
      });
      const existingVals = initialData.monthlyValues?.[activeMonth] || {};
      setCurrentNum(existingVals.num || '');
      setCurrentDen(existingVals.den || '');
      setCurrentMan(existingVals.man || '');
    } else {
      if (!form.riskCategory && availableCategories.length > 0) {
        setForm((prev) => ({ ...initialFormState, riskCategory: availableCategories[0] }));
      }
    }
  }, [initialData, availableCategories]);

  useEffect(() => {
    const existingVals = form.monthlyValues?.[activeMonth] || {};
    setCurrentNum(existingVals.num || '');
    setCurrentDen(existingVals.den || '');
    setCurrentMan(existingVals.man || '');
  }, [activeMonth, form.monthlyValues]);

  const calculatedResult = useMemo(() => {
    if (!form.hasNumeratorDenominator) return null;
    const res = calculateRasValue(currentNum, currentDen, form.unitType, null);
    return formatRasDisplayValue(res, form.unitType);
  }, [currentNum, currentDen, form.unitType, form.hasNumeratorDenominator]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMonthValueChange = (field, value) => {
    if (field === 'num') setCurrentNum(value);
    if (field === 'den') setCurrentDen(value);
    if (field === 'man') setCurrentMan(value);

    setForm((prev) => ({
      ...prev,
      monthlyValues: {
        ...prev.monthlyValues,
        [activeMonth]: { ...prev.monthlyValues?.[activeMonth], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.parameter || !form.riskCategory) {
      alert('Parameter dan Kategori Risiko wajib diisi!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalMonthVal = {
        num: currentNum || null,
        den: currentDen || null,
        man: calculatedResult || currentMan || null,
      };

      const finalData = {
        ...form,
        monthlyValues: {
          ...form.monthlyValues,
          [activeMonth]: finalMonthVal,
        },
      };

      await onSubmit(finalData);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const isHourType = form.unitType === 'HOUR';

  return (
    <section className="bg-gradient-to-r from-[#0076C6]/95 via-[#00A3DA]/95 to-[#33C2B5]/95 rounded-2xl shadow-xl overflow-hidden mb-8 animate-fade-in">
      <div className="p-6 sm:p-8">
        <h2 className="text-white font-bold text-xl mb-6 border-b border-white/20 pb-4 flex items-center gap-2">
          {initialData ? 'Edit Data RAS' : 'Input Data RAS Baru'}
          {loading && <Loader2 className="animate-spin ml-2" size={20} />}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400 rounded-lg">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Category Section */}
              <div className="bg-white/10 p-5 rounded-xl border border-white/10">
                <FormGroup label="Kategori Risiko" required>
                  {!form.isNewCategory ? (
                    <Select name="riskCategory" value={form.riskCategory} onChange={(e) => (e.target.value === '__NEW__' ? setForm((prev) => ({ ...prev, isNewCategory: true, riskCategory: '' })) : handleChange(e))}>
                      <option value="" disabled>
                        -- Pilih --
                      </option>
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__NEW__" className="text-blue-600 font-bold">
                        + Tambah Baru...
                      </option>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input name="riskCategory" value={form.riskCategory} onChange={handleChange} placeholder="Nama Kategori..." autoFocus />
                      <button type="button" onClick={() => setForm((prev) => ({ ...prev, isNewCategory: false, riskCategory: availableCategories[0] || '' }))} className="px-3 bg-white/20 text-white rounded-xl text-sm">
                        Batal
                      </button>
                    </div>
                  )}
                </FormGroup>

                {/* Template Selection */}
                {!initialData && historicalParams.length > 0 && (
                  <div className="mb-4 bg-white/20 p-3 rounded-xl border border-white/20">
                    <div className="flex items-center gap-2 mb-2 text-white font-semibold text-sm">
                      <History size={16} />
                      <span>Isi Cepat dari Template (Data Lama)</span>
                    </div>
                    <select onChange={handleTemplateSelect} defaultValue="" className="w-full rounded-lg border-0 bg-white/90 px-3 py-2 text-gray-800 text-xs focus:ring-2 focus:ring-yellow-400 focus:bg-white shadow-sm">
                      <option value="" disabled>
                        -- Pilih Parameter Lama --
                      </option>
                      {historicalParams.map((p) => (
                        <option key={p.id} value={p.parameter}>
                          {p.parameter} (Tahun {p.year})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <FormGroup label="No">
                  <Input type="number" name="no" value={form.no} onChange={handleChange} placeholder="Auto (Kosongkan untuk urutan akhir)" />
                </FormGroup>

                <FormGroup label="Parameter" required>
                  <TextArea name="parameter" value={form.parameter} onChange={handleChange} rows={2} />
                </FormGroup>

                {/* Numerator/Denominator Toggle */}
                <div className="flex items-center gap-3 mb-4 bg-white/10 p-3 rounded-lg">
                  <input type="checkbox" disabled={isHourType} id="hasCalc" name="hasNumeratorDenominator" checked={form.hasNumeratorDenominator} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-yellow-400" />
                  <label htmlFor="hasCalc" className={`text-white text-sm font-medium select-none ${isHourType ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    {isHourType ? 'Pembilang/Penyebut tidak tersedia untuk Jam (Hour)' : 'Gunakan Pembilang & Penyebut'}
                  </label>
                </div>

                {form.hasNumeratorDenominator && !isHourType && (
                  <div className="space-y-3 pl-4 border-l-2 border-yellow-400/50">
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="numeratorLabel" value={form.numeratorLabel} onChange={handleChange} placeholder="Label Pembilang" />
                      <Input name="denominatorLabel" value={form.denominatorLabel} onChange={handleChange} placeholder="Label Penyebut" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 bg-black/10 p-3 rounded-lg">
                      <Input type="number" value={currentNum} onChange={(e) => handleMonthValueChange('num', e.target.value)} placeholder="Nilai Pembilang" />
                      <Input type="number" value={currentDen} onChange={(e) => handleMonthValueChange('den', e.target.value)} placeholder="Nilai Penyebut" />
                    </div>
                  </div>
                )}
              </div>

              {/* Target Section */}
              <div className="bg-white/10 p-5 rounded-xl border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Target RKAP">
                    <Input name="rkapTarget" value={form.rkapTarget} onChange={handleChange} placeholder="-" />
                  </FormGroup>
                  <FormGroup label="Limit RAS">
                    <Input name="rasLimit" value={form.rasLimit} onChange={handleChange} className="font-bold text-red-600" placeholder="-" />
                  </FormGroup>
                </div>
                <FormGroup label="Penjelasan Tipe Data">
                  <Input name="dataTypeExplanation" value={form.dataTypeExplanation} onChange={handleChange} placeholder="-" />
                </FormGroup>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Monthly Input Section */}
              <div className="bg-white/10 p-5 rounded-xl border border-white/10 border-l-4 border-l-green-400">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-lg">Input Realisasi Bulanan</h3>
                  <div className="w-40">
                    <Select value={activeMonth} onChange={(e) => setActiveMonth(Number(e.target.value))} className="bg-white text-blue-800 font-bold">
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Tipe Unit">
                    <Select name="unitType" value={form.unitType} onChange={handleChange}>
                      {UNIT_TYPES.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup label={`Hasil ${MONTH_OPTIONS[activeMonth].label}`}>
                    {form.unitType !== 'HOUR' && form.hasNumeratorDenominator ? (
                      <div className="w-full rounded-xl bg-black/20 px-4 py-2.5 text-white font-bold text-center border border-white/10 text-lg">{calculatedResult || '-'}</div>
                    ) : (
                      <Input value={currentMan} onChange={(e) => handleMonthValueChange('man', e.target.value)} className="font-bold text-blue-700 text-center" placeholder="-" />
                    )}
                  </FormGroup>
                </div>
              </div>

              {/* Risk Stance & Notes Section */}
              <div className="bg-white/10 p-5 rounded-xl border border-white/10">
                <FormGroup label="Sikap Terhadap Risiko">
                  <Select name="riskStance" value={form.riskStance} onChange={handleChange}>
                    {RISK_ATTITUDE_INFO.map((r) => (
                      <option key={r.label} value={r.label}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup label="Statement">
                  <TextArea name="statement" value={form.statement} onChange={handleChange} rows={4} placeholder="-" />
                </FormGroup>
                <FormGroup label="Keterangan">
                  <Input name="notes" value={form.notes} onChange={handleChange} placeholder="-" />
                </FormGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/20 mt-8">
                <button type="button" onClick={onCancel} className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all" disabled={loading}>
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center gap-2 ${
                    initialData ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 disabled:opacity-70' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 disabled:opacity-70'
                  }`}
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {initialData ? 'Edit Data' : 'Tambah Data'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
