import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { formatNumber, getRiskLevel, getRiskLabel, getRiskColor } from '../../data/dashboard-data';
import { formatRiskCategories } from '../../data/sub-risk-data';

// ==========================================
// 1. DashboardSummary Component
// ==========================================
export function DashboardSummary({ kompositA, kompositB, total }) {
  const levelA = getRiskLevel(kompositA);
  const levelB = getRiskLevel(kompositB);
  const levelTotal = getRiskLevel(total);

  const colorA = getRiskColor(levelA);
  const colorB = getRiskColor(levelB);
  const colorTotal = getRiskColor(levelTotal);

  const Card = ({ title, subtitle, value, level, color, badge }) => (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-extrabold tracking-wide text-slate-500 uppercase">{title}</span>
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">{badge}</div>
        </div>

        {/* Content */}
        <div className="flex items-center gap-4">
          {/* Level Box */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: color.bg }}>
            {level}
          </div>

          {/* Score */}
          <div className="flex-1">
            <div className="text-2xl font-bold text-slate-900">{formatNumber(value, 2)}</div>
            <div className="text-base font-bold text-slate-500">{getRiskLabel(value)}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="Inherent Risk" subtitle="Risiko Inheren" value={kompositA} level={levelA} color={colorA} badge="A" />
      <Card title="KPMR" subtitle="Kualitas Penerapan Manajemen Risiko" value={kompositB} level={levelB} color={colorB} badge="B" />
      <Card title="Peringkat Komposit" subtitle="Final" value={total} level={levelTotal} color={colorTotal} badge="F" />
    </div>
  );
}

// ==========================================
// 2. TopRisksList Component
// ==========================================
export function TopRisksList({ riskData = [] }) {
  const topRisks = useMemo(() => {
    if (!riskData || !Array.isArray(riskData) || riskData.length === 0) {
      return [];
    }

    const sorted = [...riskData].sort((a, b) => b.skorRisiko - a.skorRisiko);
    const top3 = sorted.slice(0, 3);

    return top3;
  }, [riskData]);

  if (!topRisks || topRisks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">🎯 RISIKO TERTINGGI</h3>
        <p className="text-slate-500 text-sm">Belum ada data risiko</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
      <h3 className="text-2xl font-bold text-slate-700 mb-6">🎯 RISIKO TERTINGGI</h3>
      <div className="space-y-4">
        {topRisks.map((risk, index) => {
          const level = getRiskLevel(risk.skorRisiko);
          const color = getRiskColor(level);

          return (
            <div key={risk.type || index} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-base font-bold">{index + 1}</div>
                <span className="text-lg font-semibold text-slate-900">{risk.label}</span>
              </div>
              <div
                className="px-5 py-2 rounded-full text-xl font-bold"
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                }}
                title={`Peringkat ${level}`}
              >
                {formatNumber(risk.skorRisiko, 2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. RiskAttention Component
// ==========================================
export function RiskAttention({ riskData = [] }) {
  const attentionRisks = useMemo(() => {
    if (!riskData || riskData.length === 0) return [];

    const sorted = [...riskData].sort((a, b) => {
      // Primary: High count
      if (b.categories?.high !== a.categories?.high) {
        return (b.categories?.high || 0) - (a.categories?.high || 0);
      }
      // Secondary: Moderate-High count
      if (b.categories?.moderateHigh !== a.categories?.moderateHigh) {
        return (b.categories?.moderateHigh || 0) - (a.categories?.moderateHigh || 0);
      }
      // Tertiary: Moderate count
      if (b.categories?.moderate !== a.categories?.moderate) {
        return (b.categories?.moderate || 0) - (a.categories?.moderate || 0);
      }
      // Fallback: skor risiko tertinggi
      return (b.skorRisiko || 0) - (a.skorRisiko || 0);
    });

    return sorted.slice(0, 3);
  }, [riskData]);

  if (attentionRisks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">⚠️ RISIKO PERLU PERHATIAN</h3>
        <p className="text-slate-500 text-sm">Belum ada data risiko</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
      <h3 className="text-2xl font-bold text-slate-700 mb-6">⚠️ RISIKO PERLU PERHATIAN</h3>
      <div className="space-y-4">
        {attentionRisks.map((risk, index) => (
          <div key={risk.type || index} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-base font-bold">{index + 1}</div>
              <span className="text-lg font-semibold text-slate-900">{risk.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-700">
              {risk.categories ? formatRiskCategories(risk.categories) : '-'}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔴</span>
          <span className="font-medium">High (5)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🟠</span>
          <span className="font-medium">Mod-High (4)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🟡</span>
          <span className="font-medium">Moderate (3)</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. OjkSection Component
// ==========================================
export function OjkSection({ ojkData, year, setYear, quarter, setQuarter }) {
  const hasData = ojkData && Array.isArray(ojkData.risks) && ojkData.risks.length > 0;

  const dataToUse = hasData ? ojkData : {
    kompositA: 0,
    kompositB: 0,
    total: 0,
    risks: [],
  };

  return (
    <div className="space-y-6">
      {/* Header Section OJK */}
      <div className="relative rounded-xl overflow-hidden mb-4 shadow-sm bg-gradient-to-r from-[#1a4d8f]/90 via-[#2d6fb5]/90 to-[#1a4d8f]/90">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient-gradient(circle_at_80%_100%,white,transparent_35%)]" />

        <div className="relative px-4 py-5 sm:px-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">🏛️ OJK (BANK INDONESIA)</h1>
            <p className="mt-1 text-white/90 text-xs">Peringkat Risiko untuk Kepatuhan OJK</p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector year={year} setYear={setYear} quarter={quarter} setQuarter={setQuarter} />
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          {/* KPI Cards */}
          <DashboardSummary kompositA={dataToUse.kompositA} kompositB={dataToUse.kompositB} total={dataToUse.total} />

          {/* Top Risks dan Attention Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopRisksList riskData={dataToUse.risks} />
            <RiskAttention riskData={dataToUse.risks} />
          </div>

          {/* Info Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              📌 <strong>Koneksi Database Berhasil:</strong> Data OJK untuk periode {year} {quarter} berhasil dimuat dari database secara real-time.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 text-center">
          <p className="text-slate-500">
            Belum ada data OJK untuk periode {year} {quarter}. Silakan lakukan penilaian di menu OJK terlebih dahulu.
          </p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. PeriodSelector Component
// ==========================================
const REKAP1_FINAL_KEY = 'rekap1_final_summary_v1';

export function PeriodSelector({ year, setYear, quarter, setQuarter }) {
  const availableYears = useMemo(() => {
    try {
      const raw = localStorage.getItem(REKAP1_FINAL_KEY) || '{}';
      const parsed = JSON.parse(raw);
      const years = Object.keys(parsed)
        .map(Number)
        .sort((a, b) => a - b);
      return years.length > 0 ? years : [2023, 2024, 2025, 2026, 2027, 2028];
    } catch {
      return [2023, 2024, 2025, 2026, 2027, 2028];
    }
  }, []);

  const quarters = [
    { value: 'Q1', label: 'Triwulan 1 (Jan-Mar)' },
    { value: 'Q2', label: 'Triwulan 2 (Apr-Jun)' },
    { value: 'Q3', label: 'Triwulan 3 (Jul-Sep)' },
    { value: 'Q4', label: 'Triwulan 4 (Oct-Des)' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
      <Calendar className="w-4 h-4 text-white opacity-90" />
      <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer">
        {availableYears.map((y) => (
          <option key={y} value={y} className="text-slate-900">
            {y}
          </option>
        ))}
      </select>
      <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer">
        {quarters.map((q) => (
          <option key={q.value} value={q.value} className="text-slate-900">
            {q.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ==========================================
// 6. RecentActivity Component
// ==========================================
export function RecentActivity() {
  const activities = [
    { id: 1, icon: '✅', message: 'Risk mitigation completed for', target: 'Operational Risk', type: 'success' },
    { id: 2, icon: '📌', message: 'New risk assessment added in', target: 'Market Risk', type: 'info' },
    { id: 3, icon: '🔄', message: 'Credit risk data updated for', target: 'Q4', type: 'update' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-slate-700 mb-4">📊 Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-xl">{activity.icon}</span>
            <div>
              <p className="text-slate-700 text-sm">
                {activity.message} <strong className="text-slate-900 font-semibold">{activity.target}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
