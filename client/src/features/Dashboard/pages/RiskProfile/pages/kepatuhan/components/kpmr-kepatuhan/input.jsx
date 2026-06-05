import React from 'react';

// 🔹 Wrapper umum untuk field (label + children + hint)
function FieldWrap({ label, hint, className = '', children }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      {children}
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  );
}

// 🔹 Input dasar (bisa dipakai ulang)
function BaseInput({ type = 'text', value, onChange, placeholder, readOnly = false, min, max }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      min={min}
      max={max}
      onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white 
        focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition 
        ${readOnly ? 'text-gray-600 bg-gray-50' : 'hover:border-gray-400'}`}
    />
  );
}

// 🔹 Text Field
export function TextField(props) {
  const { label, hint, className, ...inputProps } = props;
  return (
    <FieldWrap label={label} hint={hint} className={className}>
      <BaseInput {...inputProps} />
    </FieldWrap>
  );
}

// 🔹 Text Area
export function TextAreaField({ label, value, onChange, className = '', hint, rows = 3 }) {
  return (
    <FieldWrap label={label} hint={hint} className={className}>
      <textarea
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition
                   hover:border-gray-400 resize-none`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </FieldWrap>
  );
}

// 🔹 Number Field
export function NumberField({ label, value, onChange, min, max, className = '', hint }) {
  return (
    <FieldWrap label={label} hint={hint} className={className}>
      <BaseInput type="number" value={value} onChange={onChange} min={min} max={max} />
    </FieldWrap>
  );
}

// 🔹 Read Only Field
export function ReadOnlyField({ label, value, hint, className = '' }) {
  return (
    <FieldWrap label={label} hint={hint} className={className}>
      <div className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600">
        {value || '-'}
      </div>
    </FieldWrap>
  );
}

// 🔹 Select (Quarter)
export function QuarterSelect({ label = 'Triwulan', value, onChange, className }) {
  const options = [
    { value: 'Q1', label: 'Q1' },
    { value: 'Q2', label: 'Q2' },
    { value: 'Q3', label: 'Q3' },
    { value: 'Q4', label: 'Q4' },
  ];

  return (
    <FieldWrap label={label} className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

// 🔹 Year Input
export function YearInput({ label = 'Tahun', value, onChange, className }) {
  return (
    <FieldWrap label={label} className={className}>
      <BaseInput type="number" value={value} onChange={(v) => onChange(Number(v))} />
    </FieldWrap>
  );
}

// 🔹 RiskField (Minimalis)
export function RiskField({ label, value, onChange, color = '#93D24D', textColor = '#111827', placeholder, className = '' }) {
  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-center font-semibold text-xs h-7 px-2 truncate" 
        style={{ background: color, color: textColor }}
      >
        {label}
      </div>

      {/* Input */}
      <div className="p-1.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-center text-xs bg-white border-none outline-none rounded"
        />
      </div>
    </div>
  );
}