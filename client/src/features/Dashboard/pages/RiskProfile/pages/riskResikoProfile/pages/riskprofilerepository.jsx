// src/features/Dashboard/pages/RiskProfile/pages/Repository/RiskProfileRepository.jsx
import React, { useState } from 'react';
import { Building2, Shield } from 'lucide-react';
// import { RiskProfileRepositoryHolding } from './risk-profile-repository-holding.component';
import RiskProfileRepositoryHolding from '../components/risk-profile-repository-holding.component';
// import { RiskProfileRepositoryOjk } from './risk-profile-repository-ojk.component';

import RiskProfileRepositoryOjk from '../components/risk-profile-repository-ojk.component';

// ==================== CONSTANTS ====================
const TABS = [
  { 
    id: 'holding', 
    label: 'Holding', 
    icon: Building2, 
    description: 'Data modul Investasi, Pasar, Likuiditas, Operasional, Hukum, Strategik, Kepatuhan, dan Reputasi',
    activeBg: 'bg-blue-600',
    activeText: 'text-blue-600',
    activeBorder: 'border-blue-600',
    activeLight: 'bg-blue-50',
  },
  { 
    id: 'ojk', 
    label: 'OJK', 
    icon: Shield, 
    description: 'Ringkasan penilaian 13 modul risiko OJK',
    activeBg: 'bg-sky-600',
    activeText: 'text-sky-600',
    activeBorder: 'border-sky-600',
    activeLight: 'bg-sky-50',
  },
];

// ==================== COMPONENTS ====================

// Komponen Tab Navigation
const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 flex gap-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive 
                ? `${tab.activeBg} text-white shadow-md transform scale-[1.02]` 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
              <Icon size={20} />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-sm">{tab.label}</div>
              <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                {tab.description}
              </div>
            </div>
            {isActive && (
              <div className="ml-auto">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export const RiskProfileRepository = () => {
  const [activeTab, setActiveTab] = useState('holding');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Render komponen berdasarkan tab aktif */}
      {activeTab === 'holding' ? (
        <RiskProfileRepositoryHolding />
      ) : (
        <RiskProfileRepositoryOjk />
      )}
    </div>
  );
};

export default RiskProfileRepository;