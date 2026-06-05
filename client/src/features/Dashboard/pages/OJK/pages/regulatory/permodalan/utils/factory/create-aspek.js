export function createAspek() {
  return {
    id: crypto.randomUUID(),
    nomor: '',
    judul: '',
    bobot: 0,
    pertanyaanList: [],
  };
}
