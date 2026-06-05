export const computeWeighted = (bobotSection, bobotIndikator, peringkat) => {
    const bs = Number(bobotSection || 0);
    const bi = Number(bobotIndikator || 0);
    const p = Number(peringkat || 0);
    return bs && bi && p ? Number((bs * bi * p / 10000).toFixed(2)) : "";
};

// template baris (fresh tiap kali dipakai)
import { getCurrentYear, getCurrentQuarter } from "./time";
export const makeEmptyRow = () => ({
    year: getCurrentYear(),
    quarter: getCurrentQuarter(),
    no: "1",
    sectionLabel: "Kualitas Dana Kelolaan",
    subNo: "1.1",
    indikator: "Rasio total Outstanding (OS) Emiten Non-Investment Grade terhadap total asset.",
    bobotSection: 20,
    bobotIndikator: 100,
    sumberRisiko: "",
    dampak: "",
    low: "x ≤ 1%",
    lowToModerate: "1% < x ≤ 2%",
    moderate: "2% < x ≤ 3%",
    moderateToHigh: "3% < x ≤ 4%",
    high: "x > 4%",
    numeratorLabel: "Total Outstanding (OS) Emiten Non-Investment Grade (Jutaan)",
    numeratorValue: "",
    denominatorLabel: "Total Asset (Jutaan)",
    denominatorValue: "",
    hasil: "",
    peringkat: 1,
    weighted: "",
    keterangan: "Leading",
});