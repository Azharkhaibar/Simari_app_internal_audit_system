import computeDerived from "../../../utils/compute/compute-derived";
export const getRiskColor = (level) => {
  if (level >= 0 && level < 2) return 'bg-[#2ECC71] text-white';
  if (level >= 2 && level < 3) return 'bg-[#A3E635] text-black';
  if (level >= 3 && level < 4) return 'bg-[#FACC15] text-black';
  if (level >= 4 && level < 5) return 'bg-[#F97316] text-black';
  if (level >= 5) return 'bg-[#FF0000] text-white';
  return 'bg-gray-200 text-gray-700';
};

export const getRiskIndicator = (level) => {
  if (level >= 0 && level < 2) return 'Low';
  if (level >= 2 && level < 3) return 'Low To Moderate';
  if (level >= 3 && level < 4) return 'Moderate';
  if (level >= 4 && level < 5) return 'Moderate To High';
  if (level >= 5) return 'High';
  return 'N/A';
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'string') return value;
  const num = Number(value);
  if (isNaN(num)) return '-';
  return num % 1 !== 0 ? num.toFixed(2) : num.toString();
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (isNaN(num)) return '-';
  return `${num}%`;
};

export const calculateTotalWeighted = (data) => {
  if (!Array.isArray(data)) return 0;
  let totalWeighted = 0;
  let count = 0;
  data.forEach((param) => {
    param?.nilaiList?.forEach((item) => {
      if (item?.derived?.weighted !== undefined && !isNaN(item.derived.weighted)) {
        totalWeighted += item.derived.weighted;
        count++;
      }
    });
  });
  return count > 0 ? totalWeighted / count : 0;
};

export const normalizeAndComputeDerived = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((param) => {
      if (!param) return null;
      const normalizedParam = {
        ...param,
        id: param.id || crypto.randomUUID(),
        bobot: Number(param.bobot) || 0,
        kategori: normalizeKategori(param.kategori),
      };
      normalizedParam.nilaiList = normalizeNilaiList(param.nilaiList, normalizedParam);
      return normalizedParam;
    })
    .filter(Boolean);
};

const normalizeKategori = (kategori) => {
  if (!kategori || typeof kategori !== 'object') {
    return { model: '', prinsip: '', jenis: '', underlying: [] };
  }
  return {
    model: kategori.model || '',
    prinsip: kategori.prinsip || '',
    jenis: kategori.jenis || '',
    underlying: Array.isArray(kategori.underlying) ? kategori.underlying : [],
  };
};

const normalizeNilaiList = (nilaiList, normalizedParam) => {
  if (!Array.isArray(nilaiList)) return [];
  return nilaiList
    .map((item) => {
      if (!item) return null;
      const judul = item?.judul || {};
      const normalizedItem = {
        ...item,
        id: item?.id || crypto.randomUUID(),
        bobot: Number(item?.bobot) || 0,
        portofolio: item?.portofolio || 0,
        judul: {
          ...judul,
          text: judul?.text || judul?.label || '',
          pembilang: judul?.pembilang || '',
          penyebut: judul?.penyebut || '',
          type: judul?.type || 'Tanpa Faktor',
          value: judul?.value !== undefined ? judul.value : judul?.valuePembilang,
          valuePembilang: judul?.valuePembilang !== undefined ? judul.valuePembilang : '',
          valuePenyebut: judul?.valuePenyebut !== undefined ? judul.valuePenyebut : '',
        },
      };
      normalizedItem.derived = computeDerived(normalizedItem, normalizedParam);
      return normalizedItem;
    })
    .filter(Boolean);
};

export const filterRowsByKategori = (rows, filter) => {
  if (!Array.isArray(rows)) return [];
  return rows.filter((param) => {
    const kategori = param.kategori || {};
    if (filter.model && kategori.model !== filter.model) return false;
    if (filter.prinsip && kategori.model !== 'tanpa_model' && kategori.prinsip !== filter.prinsip) return false;
    if (filter.jenis && kategori.model === 'open_end' && kategori.jenis !== filter.jenis) return false;
    if (Array.isArray(filter.underlying) && filter.underlying.length > 0) {
      if (kategori.model === 'terstruktur') {
        const paramUnderlying = Array.isArray(kategori.underlying) ? kategori.underlying : [];
        if (!filter.underlying.some((v) => paramUnderlying.includes(v))) return false;
      } else if (kategori.model !== 'tanpa_model') {
        return false;
      }
    }
    return true;
  });
};
