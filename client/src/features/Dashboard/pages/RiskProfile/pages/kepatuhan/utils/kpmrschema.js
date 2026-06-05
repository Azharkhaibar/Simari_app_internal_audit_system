// Schema generik untuk KPMR per risiko
export const KPMR_ASPEK = [
    { id: "A1", name: "Aspek 1 : Tata Kelola Risiko", bobot: 30 },
    // Tambahkan Aspek 2..n sesuai template kamu
];

export const SCALE_LEGEND = [
    { score: 1, label: "Strong" },
    { score: 2, label: "Satisfactory" },
    { score: 3, label: "Fair" },
    { score: 4, label: "Marginal" },
    { score: 5, label: "Unsatisfactory" },
];

// Struktur 1 baris KPMR
export function makeKPMRRow(overrides = {}) {
    return {
        aspekId: "A1",     // refer ke KPMR_ASPEK.id
        no: "",            // "1", "2", ...
        indikator: "",     // pertanyaan/deskripsi
        tw1: "",           // 1..5
        tw2: "",
        tw3: "",
        tw4: "",
        evidence: "",
        ...overrides,
    };
}

// hitung rata-rata aspek (hanya skor terisi)
export function averageScores(rows) {
    const toNums = v => (v === "" || v == null ? null : Number(v));
    const parts = ["tw1", "tw2", "tw3", "tw4"].map(k => {
        const vals = rows.map(r => toNums(r[k])).filter(v => v != null && !isNaN(v));
        const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        return avg;
    });
    return { tw1: parts[0], tw2: parts[1], tw3: parts[2], tw4: parts[3] };
}