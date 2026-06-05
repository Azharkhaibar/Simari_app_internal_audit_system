// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/ReputasiPage.jsx
import React, { useState } from 'react';
// import { getCurrentQuarter, getCurrentYear } from '../utils/time';
// import { getCurrentQuarter, getCurrentYear } from './utils/reputasi/time';
// // import ReputasiInherent from './components/ReputasiInherent';
// import ReputasiInherent from './reputasi-page';
// import ReputasiKPMR from './kpmr_reputasi-page';

import { getCurrentQuarter, getCurrentYear } from './utils/time';
import ReputasiInherent from './reputasi-page';
import ReputasiKPMR from './kpmr-reputasi-page';

// ===================== Brand =====================
const PNM_BRAND = {
  primary: '#0068B3',
  primarySoft: '#E6F1FA',
  gradient: 'bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90',
};

export default function ReputasiPage() {
  // ====== Tabs ======
  const [activeTab, setActiveTab] = useState('reputasi');

  // ====== Periode + search (shared state) ======
  const [viewYear, setViewYear] = useState(getCurrentYear ? getCurrentYear() : new Date().getFullYear());
  const [viewQuarter, setViewQuarter] = useState(getCurrentQuarter ? getCurrentQuarter() : 'Q1');
  const [query, setQuery] = useState('');

  return (
    <div className="p-6 bg-[#f3f6f8] min-h-screen">
      {/* HERO / TITLE */}
      <div className={`relative rounded-2xl overflow-hidden mb-6 shadow-sm ${PNM_BRAND.gradient}`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Risk Form – Reputasi</h1>
          <p className="mt-1 text-white/90 text-sm">Input laporan lebih cepat, rapi, dan konsisten.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reputasi')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reputasi' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
          >
            Reputasi
          </button>

          <button
            onClick={() => setActiveTab('kpmr')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'kpmr' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
          >
            KPMR Reputasi
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* ================= TAB: REPUTASI (INHERENT) ================= */}
        {activeTab === 'reputasi' && <ReputasiInherent viewYear={viewYear} viewQuarter={viewQuarter} onViewYearChange={setViewYear} onViewQuarterChange={setViewQuarter} query={query} onQueryChange={setQuery} />}

        {/* ================= TAB: KPMR ================= */}
        {activeTab === 'kpmr' && <ReputasiKPMR viewYear={viewYear} viewQuarter={viewQuarter} onViewYearChange={setViewYear} query={query} onQueryChange={setQuery} />}
      </div>
    </div>
  );
}
