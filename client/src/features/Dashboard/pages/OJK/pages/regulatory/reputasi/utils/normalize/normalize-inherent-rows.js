// import { createParameter } from '../factory/createParameter';
// import { createNilai } from '../factory/createNilai';
import { createParameter } from "../factory/create-parameter";
import { createNilai } from "../factory/create-nilai";
export function normalizeInherentRows(rows = []) {
  if (!Array.isArray(rows)) return [];

  return rows.map(normalizeInherentParameter);
}

export function normalizeInherentParameter(param) {
  if (!param) return createParameter();

  const base = createParameter();

  return {
    ...base,
    ...param,
    kategori: {
      ...base.kategori,
      ...(param?.kategori || {}),
      underlying: Array.isArray(param?.kategori?.underlying) ? param.kategori.underlying : [],
    },
    nilaiList: Array.isArray(param?.nilaiList) ? param.nilaiList.map(normalizeInherentNilai) : [],
  };
}

function normalizeInherentNilai(nilai) {
  if (!nilai) return createNilai('Tanpa Faktor');

  const base = createNilai(nilai.judul?.type || 'Tanpa Faktor');

  return {
    ...base,
    ...nilai,
    judul: {
      ...base.judul,
      ...(nilai.judul || {}),
    },
    riskindikator: {
      ...base.riskindikator,
      ...(nilai.riskindikator || {}),
    },
  };
}
