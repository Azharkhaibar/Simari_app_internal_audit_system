export function createPertanyaan() {
  return {
    id: crypto.randomUUID(),
    nomor: '',
    pertanyaan: '',
    skor: {
      Q1: '',
      Q2: '',
      Q3: '',
      Q4: '',
    },
    indicator: {
      strong: '',
      satisfactory: '',
      fair: '',
      marginal: '',
      unsatisfactory: '',
    },
    evidence: '',
  };
}
