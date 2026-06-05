// src/ojk/rekap/hook/utils.js
import computeDerived from '../../../utils/compute/compute-derived';

/**
 * Format angka ke persentase
 * @param {number|null|undefined} value
 * @returns {string}
 */
export const formatPercent = (value) => {
  if (value == null || isNaN(value)) return '-';
  return `${Number(value).toFixed(2)}%`;
};

/**
 * Mendapatkan list nilai dari parameter
 * @param {Object} param
 * @returns {Array}
 */
export const getItemList = (param) => {
  return Array.isArray(param.nilaiList) ? param.nilaiList : [];
};

/**
 * Filter parameter berdasarkan kategori
 * @param {Object} param
 * @param {Object} filterKategori
 * @returns {boolean}
 */
export const shouldIncludeInFilter = (param, filterKategori) => {
  const kategori = param.kategori || {};
  let shouldInclude = true;

  if (filterKategori.model && kategori.model !== filterKategori.model) {
    shouldInclude = false;
  }

  if (filterKategori.prinsip && kategori.model !== 'tanpa_model') {
    if (kategori.prinsip !== filterKategori.prinsip) {
      shouldInclude = false;
    }
  }

  if (filterKategori.jenis && kategori.model === 'open_end') {
    if (kategori.jenis !== filterKategori.jenis) {
      shouldInclude = false;
    }
  }

  if (Array.isArray(filterKategori.underlying) && filterKategori.underlying.length > 0 && kategori.model === 'terstruktur') {
    const paramUnderlying = Array.isArray(kategori.underlying) ? kategori.underlying : [];
    const hasOverlap = filterKategori.underlying.some((value) => paramUnderlying.includes(value));
    if (!hasOverlap) shouldInclude = false;
  }

  return shouldInclude;
};

/**
 * Menghitung summary global
 * @param {Object} dataMap - Map data per kategori
 * @param {string[]} selectedPages - Kategori yang dipilih
 * @param {Object} filterKategori - Filter kategori
 * @returns {Object} - { totalWeighted, summaryBg, count }
 */
export const calculateGlobalSummary = (dataMap, selectedPages, filterKategori = { model: '', prinsip: '', jenis: '', underlying: [] }) => {
  let totalWeighted = 0;
  let count = 0;

  Object.entries(dataMap).forEach(([catId, params]) => {
    if (!selectedPages.includes(catId)) return;

    params.forEach((param) => {
      if (!shouldIncludeInFilter(param, filterKategori)) return;

      const itemList = getItemList(param);
      itemList.forEach((item) => {
        const derived = item.derived;
        if (derived && derived.weighted && !isNaN(derived.weighted)) {
          totalWeighted += derived.weighted;
          count++;
        }
      });
    });
  });

  const avgWeighted = count > 0 ? totalWeighted / count : 0;

  let summaryBg = '';
  if (avgWeighted >= 0 && avgWeighted < 2) summaryBg = 'bg-[#2ECC71] text-white';
  else if (avgWeighted >= 2 && avgWeighted < 3) summaryBg = 'bg-[#A3E635] text-black';
  else if (avgWeighted >= 3 && avgWeighted < 4) summaryBg = 'bg-[#FACC15] text-black';
  else if (avgWeighted >= 4 && avgWeighted < 5) summaryBg = 'bg-[#F97316] text-black';
  else if (avgWeighted >= 5) summaryBg = 'bg-[#FF0000] text-white';

  return {
    totalWeighted: avgWeighted,
    summaryBg,
    count,
  };
};

/**
 * Normalisasi item nilai dengan derived
 * @param {Object} item
 * @param {Object} param
 * @returns {Object|null}
 */
export const normalizeItemWithDerived = (item, param) => {
  if (!item) return null;

  const judul = item?.judul || {};

  const normalizedItem = {
    id: item.id,
    nomor: item.nomor || '',
    bobot: Number(item.bobot ?? 0),
    portofolio: item.portofolio || '',
    keterangan: item.keterangan || '',
    judul: {
      type: judul?.type || 'Tanpa Faktor',
      text: judul?.text || '',
      value: judul?.value ?? null,
      pembilang: judul?.pembilang || '',
      valuePembilang: judul?.valuePembilang ?? null,
      penyebut: judul?.penyebut || '',
      valuePenyebut: judul?.valuePenyebut ?? null,
      formula: judul?.formula || '',
      percent: judul?.percent || false,
    },
    riskindikator: item?.riskindikator || {},
    orderIndex: item.orderIndex || 0,
  };

  normalizedItem.derived = computeDerived(normalizedItem, param);
  return normalizedItem;
};

/**
 * Normalisasi rows rekap dengan derived
 * @param {Array} rows
 * @returns {Array}
 */
export const normalizeRekapRows = (rows) => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((r) => {
      if (!r) return null;

      return {
        id: r.id,
        categoryId: r.categoryId,
        categoryLabel: r.categoryLabel,
        year: r.year,
        quarter: r.quarter,
        nomor: r.nomor || '',
        judul: r.judul || '',
        bobot: Number(r.bobot ?? 0),
        kategori: r.kategori || {
          model: '',
          prinsip: '',
          jenis: '',
          underlying: [],
        },
        orderIndex: r.orderIndex || 0,
        nilaiList: Array.isArray(r.nilaiList) ? r.nilaiList.map((item) => normalizeItemWithDerived(item, r)).filter(Boolean) : [],
      };
    })
    .filter(Boolean);
};
