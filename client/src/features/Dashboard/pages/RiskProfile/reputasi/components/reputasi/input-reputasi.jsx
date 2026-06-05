import React from 'react';

function FieldWrap({ label, className = '', labelClassName = 'text-gray-600', children, hint }) {
  return (
    <label className={`block ${className}`}>
      <div className={`mb-1 text-sm ${labelClassName} font-medium`}>{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-gray-400">{hint}</div> : null}
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder, className = '' }) {
  return (
    <FieldWrap label={label} className={className}>
      <input className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </FieldWrap>
  );
}

export function TextAreaField({ label, value, onChange, className = '' }) {
  return (
    <FieldWrap label={label} className={className}>
      <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white min-h-[80px] focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" value={value} onChange={(e) => onChange(e.target.value)} />
    </FieldWrap>
  );
}

export function NumberField({ label, value, onChange, min, max, className = '' }) {
  return (
    <FieldWrap label={label} className={className}>
      <input
        type="number"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
        }}
      />
    </FieldWrap>
  );
}

export function ReadOnlyField({ label, value, hint, className = '' }) {
  return (
    <FieldWrap label={label} hint={hint} className={className}>
      <input className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-700" value={value} readOnly />
    </FieldWrap>
  );
}

export function QuarterSelect({ label = 'Triwulan', value, onChange, labelClassName }) {
  return (
    <FieldWrap label={label} labelClassName={labelClassName}>
      <select className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="Q1">Q1 (Jan–Mar)</option>
        <option value="Q2">Q2 (Apr–Jun)</option>
        <option value="Q3">Q3 (Jul–Sep)</option>
        <option value="Q4">Q4 (Okt–Des)</option>
      </select>
    </FieldWrap>
  );
}

export function YearInput({ label = 'Tahun', value, onChange, labelClassName }) {
  return (
    <FieldWrap label={label} labelClassName={labelClassName}>
      <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </FieldWrap>
  );
}

/* Input bergaya badge warna (tetap editable) */
/* RiskField: tetap API lama, tapi tampil 2-lapis (header warna + body hijau muda, editable) */
// Inputs.jsx — GANTI seluruh RiskField lama dengan ini
export function RiskField({
  label,
  value,
  onChange,
  color, // warna header (kotak judul)
  textColor = '#111827',
  placeholder,
  className = '',
}) {
  const handleInput = (e) => {
    // auto height textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className={className}>
      <div
        style={{
          border: '2px solid #0f1a0f',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#E9F7E6', // body hijau muda
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          // Tinggi total minimum agar semua seragam (header + divider + textarea)
          minHeight: 44 + 4 + 44, // header 44px + garis 4px + area isi minimal 44px
        }}
      >
        {/* Header berwarna — tinggi FIX 44px */}
        <div
          style={{
            background: color || '#93D24D',
            color: textColor === '#111827' ? '#111' : textColor,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            padding: '0 12px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={label}
        >
          {label}
        </div>

        {/* Garis pemisah tebal */}
        <div style={{ height: 4, background: '#0f1a0f', flex: '0 0 auto' }} />

        {/* Area isi — textarea auto tinggi */}
        <div style={{ padding: 8, flex: '1 0 auto' }}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onInput={handleInput}
            placeholder={placeholder}
            rows={2}
            style={{
              width: '100%',
              minHeight: 44, // minimal setinggi input lama
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 16,
              color: '#0f1a0f',
              background: '#E9F7E6',
              border: 'none',
              outline: 'none',
              borderRadius: 10,
              resize: 'none',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
            }}
          />
        </div>
      </div>
    </div>
  );
}
