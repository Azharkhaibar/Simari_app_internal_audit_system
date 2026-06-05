// import { createAspek } from '../factory/createAspek';
// import { createPertanyaan } from '../factory/createPertanyaan';
import { createAspek } from '../factory/create-aspek';
import { createPertanyaan } from '../factory/create-pertanyaan';
export function normalizeKpmrRows(rows = []) {
  if (!Array.isArray(rows)) return [];

  return rows.map(normalizeKpmrAspek);
}

export function normalizeKpmrAspek(aspek) {
  if (!aspek) return createAspek();

  const base = createAspek();

  return {
    ...base,
    ...aspek,
    pertanyaanList: Array.isArray(aspek?.pertanyaanList) ? aspek.pertanyaanList.map(normalizeKpmrPertanyaan) : [],
  };
}

export function normalizeKpmrPertanyaan(pertanyaan) {
  if (!pertanyaan) return createPertanyaan();

  const base = createPertanyaan();

  return {
    ...base,
    ...pertanyaan,
    skor: {
      ...base.skor,
      ...(pertanyaan.skor || {}),
    },
    indicator: {
      ...base.indicator,
      ...(pertanyaan.indicator || {}),
    },
  };
}
