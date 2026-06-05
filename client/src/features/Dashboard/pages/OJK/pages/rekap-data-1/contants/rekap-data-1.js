// src/ojk/rekap/constants/rekap-data1.constant.js
import { StoreIcon, HandCoins, BanknoteArrowUp, BrainCircuit, Scale, Cog, ClipboardCheck, CircleStar, BrainCog, Handshake, Sprout, TrendingUpDown, Earth } from 'lucide-react';

export const CATEGORIES = [
  { id: 'operasional', label: 'Operasional', Icon: Cog },
  { id: 'pasar-produk', label: 'Pasar Produk', Icon: StoreIcon },
  { id: 'likuiditas-produk', label: 'Likuiditas Produk', Icon: HandCoins },
  { id: 'kredit-produk', label: 'Kredit Produk', Icon: BanknoteArrowUp },
  { id: 'konsentrasi-produk', label: 'Konsentrasi Produk', Icon: BrainCircuit },
  { id: 'hukum-regulatory', label: 'Hukum', Icon: Scale },
  { id: 'kepatuhan-regulatory', label: 'Kepatuhan', Icon: ClipboardCheck },
  { id: 'reputasi-regulatory', label: 'Reputasi', Icon: CircleStar },
  { id: 'strategis-regulatory', label: 'Strategis', Icon: BrainCog },
  { id: 'investasi-regulatory', label: 'Investasi', Icon: Handshake },
  { id: 'rentabilitas-regulatory', label: 'Rentabilitas', Icon: TrendingUpDown },
  { id: 'permodalan-regulatory', label: 'Permodalan', Icon: Sprout },
  { id: 'tatakelola-regulatory', label: 'Tata Kelola', Icon: Earth },
];

export const INHERENT_RISK_INDICATORS = [
  { label: 'Low', value: 'low', color: '#2ECC71', min: 0, max: 1.49, score: 1 },
  { label: 'Low To Moderate', value: 'lowToModerate', color: '#A3E635', min: 1.5, max: 2.49, score: 2 },
  { label: 'Moderate', value: 'moderate', color: '#FACC15', min: 2.5, max: 3.49, score: 3 },
  { label: 'Moderate To High', value: 'moderateToHigh', color: '#F97316', min: 3.5, max: 4.49, score: 4 },
  { label: 'High', value: 'high', color: '#FF0000', min: 4.5, max: 5, score: 5 },
];

export const KPMR_RISK_INDICATORS = [
  { label: 'Strong', value: 'strong', color: '#2ECC71', min: 0, max: 1.49, score: 1 },
  { label: 'Satisfactory', value: 'satisfactory', color: '#A3E635', min: 1.5, max: 2.49, score: 2 },
  { label: 'Fair', value: 'fair', color: '#FACC15', min: 2.5, max: 3.49, score: 3 },
  { label: 'Marginal', value: 'marginal', color: '#F97316', min: 3.5, max: 4.49, score: 4 },
  { label: 'Unsatisfactory', value: 'unsatisfactory', color: '#FF0000', min: 4.5, max: 5, score: 5 },
];

export const PTK_INDICATORS = [
  { label: 'Peringkat 1', value: 'peringkat1', color: '#2ECC71', min: 0, max: 1.49, score: 1 },
  { label: 'Peringkat 2', value: 'peringkat2', color: '#A3E635', min: 1.5, max: 2.49, score: 2 },
  { label: 'Peringkat 3', value: 'peringkat3', color: '#FACC15', min: 2.5, max: 3.49, score: 3 },
  { label: 'Peringkat 4', value: 'peringkat4', color: '#F97316', min: 3.5, max: 4.49, score: 4 },
  { label: 'Peringkat 5', value: 'peringkat5', color: '#FF0000', min: 4.5, max: 5, score: 5 },
];

export const DEFAULT_BHZ_OPERATIONAL = 20;
export const DEFAULT_BHZ_NORMAL = 10;
export const DEFAULT_BVT = 100;
