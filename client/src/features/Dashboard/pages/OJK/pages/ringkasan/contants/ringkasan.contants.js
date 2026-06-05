import { StoreIcon, HandCoins, BanknoteArrowUp, BrainCircuit, Scale, Cog, ClipboardCheck, CircleStar, BrainCog, Handshake, Sprout, TrendingUpDown, Earth } from 'lucide-react';

export const CATEGORIES = [
  { id: 'pasar-produk', label: 'Pasar Produk', code: 'PSR', Icon: StoreIcon },
  { id: 'likuiditas-produk', label: 'Likuiditas Produk', code: 'LKD', Icon: HandCoins },
  { id: 'kredit-produk', label: 'Kredit Produk', code: 'KRD', Icon: BanknoteArrowUp },
  { id: 'konsentrasi-produk', label: 'Konsentrasi Produk', code: 'KTS', Icon: BrainCircuit },
  { id: 'operasional', label: 'Operasional', code: 'OPS', Icon: Cog },
  { id: 'hukum-regulatory', label: 'Hukum', code: 'HKM', Icon: Scale },
  { id: 'kepatuhan-regulatory', label: 'Kepatuhan', code: 'KTH', Icon: ClipboardCheck },
  { id: 'reputasi-regulatory', label: 'Reputasi', code: 'RTS', Icon: CircleStar },
  { id: 'strategis-regulatory', label: 'Strategis', code: 'STG', Icon: BrainCog },
  { id: 'investasi-regulatory', label: 'Investasi', code: 'INV', Icon: Handshake },
  { id: 'rentabilitas-regulatory', label: 'Rentabilitas', code: 'RNT', Icon: TrendingUpDown },
  { id: 'permodalan-regulatory', label: 'Permodalan', code: 'PMDL', Icon: Sprout },
  { id: 'tatakelola-regulatory', label: 'Tata Kelola', code: 'TKL', Icon: Earth },
];

export const KATEGORI_OPTIONS = {
  model: [
    { value: '', label: 'Semua Model' },
    { value: 'tanpa_model', label: 'Tanpa Model' },
    { value: 'open_end', label: 'Open-End' },
    { value: 'terstruktur', label: 'Terstruktur' },
  ],
  prinsip: [
    { value: '', label: 'Semua Prinsip' },
    { value: 'syariah', label: 'Syariah' },
    { value: 'konvensional', label: 'Konvensional' },
  ],
  jenis: [
    { value: '', label: 'Semua Jenis' },
    { value: 'pasar_uang', label: 'Pasar Uang' },
    { value: 'pendapatan_tetap', label: 'Pendapatan Tetap' },
    { value: 'campuran', label: 'Campuran' },
    { value: 'saham', label: 'Saham' },
    { value: 'indeks', label: 'Indeks' },
    { value: 'etf', label: 'ETF' },
  ],
  underlying: [
    { value: '', label: 'Semua Underlying' },
    { value: 'obligasi', label: 'Obligasi' },
    { value: 'indeks', label: 'Indeks' },
    { value: 'etf', label: 'ETF' },
    { value: 'eba', label: 'EBA' },
    { value: 'dinfra', label: 'DINFRA' },
  ],
};
