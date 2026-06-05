// ===================== BRAND =====================
export const PNM_BRAND = {
  primary: '#0068B3',
  primarySoft: '#E6F1FA',
};

// ===================== STORAGE KEYS =====================
export const REKAP1_FINAL_KEY = 'rekap1_final_summary_v1';
export const BHZ_STORAGE_KEY = 'rekap1_bhz_config_v1';

// ===================== STORAGE KEYS UNTUK DATA =====================
export const STORAGE_KEYS = {
  investasi: 'rekap_investasi',
  pasar: 'pasarRows',
  likuiditas: 'rekap_likuiditas',
  operasional: 'rekap_operasional',
  hukum: 'rekap_hukum',
  strategis: 'rekap_stratejik',
  kepatuhan: 'rekap_kepatuhan',
  reputasi: 'rekap_reputasi',
};

export const KPMR_STORAGE_KEYS = {
  investasi: { def: 'kpmr_investasi_definitions_v1', score: 'kpmr_investasi_scores_v1' },
  pasar: { def: 'kpmr_pasar_definitions_v1', score: 'kpmr_pasar_scores_v1' },
  likuiditas: { def: 'kpmr_likuiditas_definitions_v1', score: 'kpmr_likuiditas_scores_v1' },
  operasional: { def: 'kpmr_operasional_definitions_v1', score: 'kpmr_operasional_scores_v1' },
  hukum: { def: 'kpmr_hukum_definitions_v1', score: 'kpmr_hukum_scores_v1' },
  strategis: { def: 'kpmr_stratejik_definitions_v1', score: 'kpmr_stratejik_scores_v1' },
  kepatuhan: { def: 'kpmr_kepatuhan_definitions_v1', score: 'kpmr_kepatuhan_scores_v1' },
  reputasi: { def: 'kpmr_reputasi_definitions_v1', score: 'kpmr_reputasi_scores_v1' },
};

// ===================== LEVEL COLOR CONFIG =====================
export const LEVEL_BG_COLOR = {
  1: 'bg-[#2e7d32]',
  2: 'bg-[#92D050]',
  3: 'bg-[#ffff00]',
  4: 'bg-[#ffc000]',
  5: 'bg-[#ff0000]',
};

export const LEVEL_TEXT_COLOR = {
  1: 'text-white',
  2: 'text-slate-900',
  3: 'text-slate-900',
  4: 'text-slate-900',
  5: 'text-white',
};

// ===================== BADGE STYLES =====================
export const BADGE_BASE_CLASS = `flex items-center justify-center w-[160px] h-8 rounded-full text-xs font-semibold`;
export const BADGE_DOT_CLASS = 'w-2 h-2 rounded-full mr-1.5';

// ===================== DEFAULT VALUES =====================
export const DEFAULT_BHZ = {
  investasi: 10,
  pasar: 10,
  likuiditas: 10,
  operasional: 20,
  hukum: 10,
  strategis: 20,
  kepatuhan: 10,
  reputasi: 10,
};

export const DEFAULT_BVT = 100;

export const RISK_LABELS = ['investasi', 'pasar', 'likuiditas', 'operasional', 'hukum', 'strategis', 'kepatuhan', 'reputasi'];
