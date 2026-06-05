// Dashboard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, Download } from 'lucide-react';
import { useDarkMode } from '@/shared/components/Darkmodecontext';
import { getLastAvailablePeriod } from '../data/dashboard-data';
import RIMS_API from '../../auth/api/auth.api';

// Dashboard Components
import { DashboardSummary, TopRisksList, RiskAttention, OjkSection, RecentActivity, PeriodSelector } from '../components/dashboard/dashboard-component';

// RekapData2 Components (untuk Dashboard View)
import { HeaderWithFilter, SummaryCard as RiskSummaryCard, RiskTable, RiskMatrix, AlertBox } from '../../Dashboard/pages/RiskProfile/pages/rekapdata2/components/rekapdata2.component';

// RekapData2 Utils
import { RISK_SOURCES, RISK_LABEL, getRiskStyle } from '../../Dashboard/pages/RiskProfile/pages/rekapdata2/utils/rekapdata2.utils.js';

// Helper skor ke level
const skorToLevel = (skor) => {
  if (skor < 1.5) return 1;
  if (skor < 2.5) return 2;
  if (skor < 3.5) return 3;
  if (skor < 4.5) return 4;
  return 5;
};

// Label untuk KPMR
const kpmrLabel = (level) => {
  if (level === 1) return 'Strong';
  if (level === 2) return 'Satisfactory';
  if (level === 3) return 'Fair';
  if (level === 4) return 'Marginal';
  return 'Unsatisfactory';
};

export default function Dashboard() {
  const { darkMode } = useDarkMode();
  const loc = useLocation(); // ✅ UNTUK WELCOME DIALOG

  // ✅ WELCOME DIALOG STATE
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Initialize with last available period
  const lastPeriod = useMemo(() => getLastAvailablePeriod(), []);
  const [year, setYear] = useState(lastPeriod.year);
  const [quarter, setQuarter] = useState(lastPeriod.quarter);

  // Tab state: 'holding' or 'ojk' or 'rekap2'
  const [activeTab, setActiveTab] = useState('holding');

  // Load data dari backend API
  const [holdingData, setHoldingData] = useState(null);
  const [holdingLoading, setHoldingLoading] = useState(false);
  const [ojkData, setOjkData] = useState(null);
  const [ojkLoading, setOjkLoading] = useState(false);

  useEffect(() => {
    if (!year || !quarter) return;

    setHoldingLoading(true);
    RIMS_API.get(`/dashboard-holding?year=${year}&quarter=${quarter}`)
      .then((res) => setHoldingData(res.data))
      .catch((err) => console.error('Error fetching dashboard holding:', err))
      .finally(() => setHoldingLoading(false));

    setOjkLoading(true);
    RIMS_API.get(`/dashboard-ojk?year=${year}&quarter=${quarter}`)
      .then((res) => setOjkData(res.data))
      .catch((err) => console.error('Error fetching dashboard ojk:', err))
      .finally(() => setOjkLoading(false));
  }, [year, quarter]);

  // ✅ WELCOME DIALOG EFFECT
  useEffect(() => {
    if (loc.state?.fromLogin) {
      setDialogMessage('✅ Login berhasil! Selamat datang di Dashboard 👋');
      setShowDialog(true);
      const timer = setTimeout(() => setShowDialog(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loc.state]);

  // ===================== DATA UNTUK REKAP2 DASHBOARD VIEW =====================
  const rekap2DashboardData = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('rekap1_final_summary_v1') || '{}');
      const periodData = raw?.[year]?.[quarter];

      if (!periodData || !Array.isArray(periodData.risks)) {
        const emptyRows = RISK_SOURCES.map((label) => ({
          label: label.charAt(0).toUpperCase() + label.slice(1),
          inherent: 0,
          kpmr: 0,
          net: 0,
        }));
        return {
          rows: emptyRows,
          skorProfil: { inherent: 0, kpmr: 0, net: 0 },
          isEmpty: true,
        };
      }

      const { risks } = periodData;

      const rows = RISK_SOURCES.map((label) => {
        const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
        const found = risks.find((r) => r.label === displayLabel);

        if (!found) {
          return { label: displayLabel, inherent: 0, kpmr: 0, net: 0 };
        }

        const inherentScore = Number(found.inherent || 0);
        const kpmrScore = Number(found.kpmr || 0);
        const netScore = (inherentScore + kpmrScore) / 2;

        return {
          label: displayLabel,
          inherentScore,
          kpmrScore,
          netScore,
          inherent: skorToLevel(inherentScore),
          kpmr: skorToLevel(kpmrScore),
          net: skorToLevel(netScore),
        };
      });

      const avgInherent = risks.reduce((s, r) => s + r.inherent, 0) / risks.length;
      const avgKpmr = risks.reduce((s, r) => s + r.kpmr, 0) / risks.length;

      return {
        rows,
        skorProfil: {
          inherent: skorToLevel(avgInherent),
          kpmr: skorToLevel(avgKpmr),
          net: skorToLevel((avgInherent + avgKpmr) / 2),
        },
        isEmpty: false,
      };
    } catch {
      return {
        rows: [],
        skorProfil: { inherent: 0, kpmr: 0, net: 0 },
        isEmpty: true,
      };
    }
  }, [year, quarter]);

  // Handler export Rekap2
  const handleRekap2Export = () => {
    // TODO: Implement export for Rekap2 dashboard
    alert('Export Rekap2 Dashboard to Excel');
  };

  const welcomeCardStyle = {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  const tabButtonStyle = (isActive) => ({
    padding: '0.75rem 2rem',
    borderRadius: '0.75rem 0.75rem 0 0',
    fontWeight: '600',
    fontSize: '0.95rem',
    backgroundColor: isActive ? (darkMode ? '#1e40af' : '#2563eb') : darkMode ? '#374151' : '#e5e7eb',
    color: isActive ? 'white' : darkMode ? '#9ca3af' : '#6b7280',
    border: `1px solid ${isActive ? 'transparent' : darkMode ? '#4b5563' : '#d1d5db'}`,
    borderBottom: isActive ? 'none' : `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '-1px',
    position: 'relative',
    top: '1px',
  });

  // ✅ DIALOG STYLE
  const dialogStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    padding: '1.25rem',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    maxWidth: '380px',
    width: '100%',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    position: 'relative',
    overflow: 'hidden',
  };

  const progressBarStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    height: '3px',
    backgroundColor: '#10b981',
    width: '100%',
    transformOrigin: 'left',
  };

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'dark-mode-bg' : 'bg-gray-50'}`}>
      {/* Welcome Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={welcomeCardStyle}>
        <h2 className="text-2xl font-semibold">Welcome Back 👋</h2>
        <p className="text-blue-100 mt-1">Senang melihat Anda kembali. Semoga hari Anda produktif!</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('holding')} style={tabButtonStyle(activeTab === 'holding')} className="hover:shadow-md">
          🏢 HOLDING
        </button>
        <button onClick={() => setActiveTab('ojk')} style={tabButtonStyle(activeTab === 'ojk')} className="hover:shadow-md">
          🏛️ OJK
        </button>

      </div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {/* ===================== HOLDING TAB ===================== */}
          {activeTab === 'holding' && (
            <div className="mb-8">
              {/* Section Header */}
              <div className="relative rounded-xl overflow-hidden mb-4 shadow-sm bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
                <div className="relative px-4 py-5 sm:px-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">🏢 HOLDING</h1>
                    <p className="mt-1 text-white/90 text-xs">Peringkat Risiko Komposit</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PeriodSelector year={year} setYear={setYear} quarter={quarter} setQuarter={setQuarter} />
                  </div>
                </div>
              </div>

              {holdingData ? (
                <>
                  <DashboardSummary kompositA={holdingData.kompositA} kompositB={holdingData.kompositB} total={holdingData.total} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <TopRisksList riskData={holdingData.riskData} />
                    <RiskAttention riskData={holdingData.riskData} />
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 text-center">
                  <p className="text-slate-500">
                    Belum ada data untuk periode {year} {quarter}. Silakan input data di halaman Risk Profile terlebih dahulu.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ===================== OJK TAB ===================== */}
          {activeTab === 'ojk' && (
            <div className="mb-8">
              <OjkSection
                ojkData={ojkData}
                year={year}
                setYear={setYear}
                quarter={quarter}
                setQuarter={setQuarter}
              />
            </div>
          )}


        </motion.div>
      </AnimatePresence>

      {/* ===================== RECENT ACTIVITY ===================== */}
      <RecentActivity />

      {/* ===================== WELCOME DIALOG ===================== */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
          >
            <div style={dialogStyle} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">Welcome Back!</h3>
                  <p className="text-sm opacity-90 leading-relaxed">{dialogMessage}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Baru saja</span>
                  </div>
                </div>

                <button onClick={() => setShowDialog(false)} className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <motion.div style={progressBarStyle} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 4, ease: 'linear' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
