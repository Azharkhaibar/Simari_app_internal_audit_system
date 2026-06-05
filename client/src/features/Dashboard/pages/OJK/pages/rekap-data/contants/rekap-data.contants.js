// src/ojk/rekap/hook/constants.js
import { StoreIcon, HandCoins, BanknoteArrowUp, BrainCircuit, Cog, Scale, ClipboardCheck, CircleStar, BrainCog, Handshake, TrendingUpDown, Sprout, Earth } from 'lucide-react';

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
    { value: 'terproteksi', label: 'Terproteksi' },
  ],
  underlying: [
    { value: '', label: 'Semua Underlying' },
    { value: 'indeks', label: 'Indeks' },
    { value: 'eba', label: 'Efek Beragun Aset (EBA)' },
    { value: 'dinfra', label: 'DinFra' },
    { value: 'obligasi', label: 'Obligasi' },
  ],
};

export const PAGE_SIZE = 7;
