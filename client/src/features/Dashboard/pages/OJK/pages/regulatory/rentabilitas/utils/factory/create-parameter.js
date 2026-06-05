export function createParameter() {
  return {
    id: crypto.randomUUID(),
    nomor: '',
    bobot: '',
    judul: '',
    kategori: {
      model: '', // "open_end" | "terstruktur"
      prinsip: '', // "syariah" | "konvensional"
      jenis: '', // "pasar_uang" | "pendapatan_tetap" | "campuran" | "saham" | "indeks" | "etf"
      underlying: [], // ["obligasi", "indeks", "etf", "eba", "dinfra"]
    },
    nilaiList: [],
  };
}
