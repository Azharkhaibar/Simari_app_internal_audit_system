import * as XLSX from "xlsx-js-style";

// === Warna & style helper ===
const hexToARGB = (hex) => {
    const h = hex.replace("#", "").toUpperCase();
    const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
    return "FF" + full;
};

const borderThin = {
    top: { style: "thin", color: { rgb: "FF000000" } },
    bottom: { style: "thin", color: { rgb: "FF000000" } },
    left: { style: "thin", color: { rgb: "FF000000" } },
    right: { style: "thin", color: { rgb: "FF000000" } },
};

const headerStyle = (bg, fg = "#FFFFFF") => ({
    fill: { patternType: "solid", fgColor: { rgb: hexToARGB(bg) } },
    font: { bold: true, color: { rgb: hexToARGB(fg) }, size: 11 },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: borderThin,
});

const bodyStyle = {
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: borderThin,
    font: { size: 11 },
};

const bodyLeftStyle = {
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
    border: borderThin,
    font: { size: 11 },
};

const bodyRightStyle = {
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: borderThin,
    font: { size: 11 },
};

const setStyle = (ws, r, c, style) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (!ws[addr]) ws[addr] = { t: "s", v: "" };
    ws[addr].s = { ...(ws[addr].s || {}), ...style };
};

const setCellValue = (ws, r, c, value) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { t: typeof value === "number" ? "n" : "s", v: value };
};

// Risk level colors
const LEVEL_BG_COLOR = {
    1: '#2e7d32',
    2: '#92d050',
    3: '#ffff00',
    4: '#ffc000',
    5: '#ff0000',
};

const LEVEL_TEXT_COLOR = {
    1: '#ffffff',
    2: '#000000',
    3: '#000000',
    4: '#000000',
    5: '#ffffff',
};

const getRiskColors = (level) => {
    return {
        bg: LEVEL_BG_COLOR[level] || '#cccccc',
        text: LEVEL_TEXT_COLOR[level] || '#000000',
    };
};

const RISK_LABEL = {
    1: "Low",
    2: "Low to Moderate",
    3: "Moderate",
    4: "Moderate to High",
    5: "High",
};

const formatHasil = (value, isPercent = false, decimals = 4) => {
    if (value === "" || value == null) return "";

    const n = Number(value);
    if (!isFinite(n) || isNaN(n)) return "";

    if (isPercent) {
        const pct = n * 100;
        return Number.isInteger(pct)
            ? pct.toLocaleString("en-US") + "%"
            : pct.toFixed(2).replace(/\.?0+$/, "") + "%";
    }

    const fixed = n.toFixed(decimals);
    return fixed.replace(/\.?0+$/, "");
};

/**
 * Export Ringkasan ke Excel
 * @param {Object} groupedByRiskType - Data grouped by risk type (object with riskType keys)
 * @param {Object} riskTypeRowSpans - Row spans for each risk type
 * @param {number} year - Year
 * @param {string} quarter - Quarter (Q1-Q4)
 */
export function exportRingkasanToExcel(groupedByRiskType, riskTypeRowSpans, year, quarter) {
    const sheetName = `${year}-${quarter}`;
    const filePrefix = "RINGKASAN";

    const ws = {};
    ws["!merges"] = [];

    let currentRow = 0;
    const startCol = 0;

    // ============================================================
    // HEADER ROWS (3 rows)
    // ============================================================

    // Helper to convert quarter to month abbreviation
    const quarterToMonth = (q) => {
        const monthMap = { "Q1": "Mar", "Q2": "Jun", "Q3": "Sep", "Q4": "Dec" };
        return monthMap[q] || q;
    };

    const periodLabel = `${quarterToMonth(quarter)}-${String(year).slice(2)}`;

    // Row 0: Main header with merged columns
    // Columns: 0=No, 1=Jenis Risiko, 2=Bobot Section, 3=Group Parameter, 4=Indeks, 5=Parameter, 6-9=Hasil Risk Assessment
    const mainHeaders = [
        { col: 0, text: "No", width: 1 },
        { col: 1, text: "Jenis Risiko", width: 1 },
        { col: 2, text: "Bobot", width: 1 },
        { col: 3, text: "Group Parameter", width: 1 },
        { col: 4, text: "Indeks", width: 1 },
        { col: 5, text: "Parameter / Risiko Inheren", width: 1 },
        { col: 6, text: "Hasil Risk Assessment", width: 4 }, // Merge 4 columns
    ];

    mainHeaders.forEach(h => {
        setCellValue(ws, currentRow, h.col, h.text);
        if (h.width > 1) {
            ws["!merges"].push({ s: { r: currentRow, c: h.col }, e: { r: currentRow, c: h.col + h.width - 1 } });
            // Style merged cells
            for (let c = h.col; c < h.col + h.width; c++) {
                setStyle(ws, currentRow, c, headerStyle("#1e3a8a", "#FFFFFF"));
            }
        } else {
            setStyle(ws, currentRow, h.col, headerStyle("#1e3a8a", "#FFFFFF"));
        }
    });
    const headerRowStart = currentRow;
    currentRow++;

    // Row 1: Period label for "Hasil Risk Assessment" section
    setCellValue(ws, currentRow, 6, periodLabel);
    ws["!merges"].push({ s: { r: currentRow, c: 6 }, e: { r: currentRow, c: 9 } });
    for (let c = 6; c <= 9; c++) {
        setStyle(ws, currentRow, c, headerStyle("#1e3a8a", "#FFFFFF"));
    }
    currentRow++;

    // Row 2: Sub-headers for "Hasil Risk Assessment"
    const subHeaders = [
        { col: 6, text: "Bobot" },
        { col: 7, text: "Hasil Assessment" },
        { col: 8, text: "Risk Level" },
        { col: 9, text: "Risk Level" },
    ];

    subHeaders.forEach(h => {
        setCellValue(ws, currentRow, h.col, h.text);
        setStyle(ws, currentRow, h.col, headerStyle("#1e3a8a", "#FFFFFF"));
    });
    currentRow++;

    // Merge kolom A-F (0-5) dari row 1-3 (vertikal)
    for (let c = 0; c <= 5; c++) {
        ws["!merges"].push({ s: { r: headerRowStart, c: c }, e: { r: headerRowStart + 2, c: c } });
        // Style semua cell dalam merge
        for (let r = headerRowStart; r <= headerRowStart + 2; r++) {
            setStyle(ws, r, c, headerStyle("#1e3a8a", "#FFFFFF"));
        }
    }

    // ============================================================
    // DATA ROWS
    // ============================================================

    const RISK_TYPE_LABELS = {
        investasi: "Risiko Investasi",
        pasar: "Risiko Pasar",
        likuiditas: "Risiko Likuiditas",
        operasional: "Risiko Operasional",
        hukum: "Risiko Hukum",
        stratejik: "Risiko Stratejik",
        kepatuhan: "Risiko Kepatuhan",
        reputasi: "Risiko Reputasi"
    };

    const RISK_ORDER = [
        "investasi",
        "pasar",
        "likuiditas",
        "operasional",
        "hukum",
        "stratejik",
        "kepatuhan",
        "reputasi",
    ];

    const RISK_CODE = {
        investasi: "INV",
        pasar: "PAS",
        likuiditas: "LIK",
        operasional: "OPR",
        hukum: "HKM",
        stratejik: "STR",
        kepatuhan: "KPT",
        reputasi: "REP",
    };

    const buildRiskIndex = ({ riskType, sectionNo, indikatorIndex, subNo }) => {
        const code = RISK_CODE[riskType] || "UNK";
        if (riskType === "pasar") {
            return `R.${code}.${sectionNo}.${indikatorIndex}`;
        }
        if (riskType === "hukum" || riskType === "kepatuhan") {
            const index = subNo || indikatorIndex;
            return `R.${code}.${sectionNo}.${index}`;
        }
        return `R.${code}.${sectionNo}.${indikatorIndex}`;
    };

    let globalRiskNumber = 1;

    RISK_ORDER.forEach((riskType) => {
        const sections = groupedByRiskType[riskType] || [];

        if (sections.length === 0) return;

        const riskTypeName = RISK_TYPE_LABELS[riskType] || `Risiko ${riskType.charAt(0).toUpperCase() + riskType.slice(1)}`;
        const riskTypeTotal = sections.reduce((total, g) => total + g.items.length, 0);

        let firstItemOfRiskType = true;
        let currentSectionStartRow = currentRow;

        sections.forEach((g) => {
            const { items, sectionNo, sectionLabel, bobotSection } = g;

            let firstItemOfSection = true;

            items.forEach((r, ri) => {
                // Calculate indikatorIndex based on risk type
                let indikatorIndex;
                if (riskType === "pasar") {
                    indikatorIndex = ri + 1;
                } else if (riskType === "hukum") {
                    indikatorIndex = r.subNo || ri + 1;
                } else if (riskType === "stratejik" || riskType === "kepatuhan" || riskType === "reputasi") {
                    indikatorIndex = ri + 1;
                } else {
                    indikatorIndex = ri + 1;
                }

                // Calculate hasil display value
                let hasilDisplay = "";
                if (riskType === "stratejik" && r.mode === "TEKS") {
                    hasilDisplay = r.hasilText || "";
                } else if (riskType === "hukum") {
                    if (r.hasilText) {
                        hasilDisplay = r.hasilText;
                    } else if (r.hasil !== null && r.hasil !== undefined) {
                        if (r.isPercent) {
                            hasilDisplay = `${(Number(r.hasil) * 100).toFixed(2)}%`;
                        } else {
                            hasilDisplay = formatHasil(r.hasil, false, 4);
                        }
                    }
                } else if (riskType === "pasar") {
                    if (r.hasil !== null && r.hasil !== undefined) {
                        if (r.isPercent) {
                            hasilDisplay = `${(Number(r.hasil) * 100).toFixed(2)}%`;
                        } else {
                            hasilDisplay = formatHasil(r.hasil, false, 4);
                        }
                    }
                } else if (riskType === "kepatuhan") {
                    if (r.mode === "TEKS" && r.hasilText) {
                        hasilDisplay = r.hasilText;
                    } else if (r.hasil !== null && r.hasil !== undefined && r.hasil !== "") {
                        if (r.isPercent) {
                            hasilDisplay = `${(Number(r.hasil) * 100).toFixed(2)}%`;
                        } else {
                            hasilDisplay = formatHasil(r.hasil, false, 4);
                        }
                    }
                } else {
                    if (r.isPercent) {
                        hasilDisplay = `${(Number(r.hasil) * 100).toFixed(2)}%`;
                    } else {
                        hasilDisplay = formatHasil(r.hasil, false, 4);
                    }
                }

                // Bobot indikator display
                let bobotIndikatorDisplay = "";
                if (r.bobotIndikator) {
                    bobotIndikatorDisplay = `${r.bobotIndikator}%`;
                }

                const riskIndex = buildRiskIndex({
                    riskType,
                    sectionNo,
                    indikatorIndex,
                    subNo: indikatorIndex
                });

                const peringkat = r.peringkat;
                const riskLabel = RISK_LABEL[peringkat] || "";
                const riskColor = getRiskColors(peringkat);

                // Col 0: No (merge if first item of risk type)
                if (firstItemOfRiskType) {
                    setCellValue(ws, currentRow, 0, globalRiskNumber);
                    ws["!merges"].push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + riskTypeTotal - 1, c: 0 } });
                    // Style all merged cells
                    for (let rIdx = 0; rIdx < riskTypeTotal; rIdx++) {
                        setStyle(ws, currentRow + rIdx, 0, {
                            ...bodyStyle,
                            font: { bold: true, size: 11 }
                        });
                    }
                }

                // Col 1: Jenis Risiko (merge if first item of risk type)
                if (firstItemOfRiskType) {
                    setCellValue(ws, currentRow, 1, riskTypeName);
                    ws["!merges"].push({ s: { r: currentRow, c: 1 }, e: { r: currentRow + riskTypeTotal - 1, c: 1 } });
                    // Style all merged cells
                    for (let rIdx = 0; rIdx < riskTypeTotal; rIdx++) {
                        setStyle(ws, currentRow + rIdx, 1, {
                            ...bodyLeftStyle,
                            font: { bold: true, size: 11 }
                        });
                    }
                }

                // Col 2: Bobot Section (merge if first item of section)
                if (firstItemOfSection) {
                    const sectionSpan = items.length;
                    setCellValue(ws, currentRow, 2, bobotSection ? `${bobotSection}%` : "0%");
                    ws["!merges"].push({ s: { r: currentRow, c: 2 }, e: { r: currentRow + sectionSpan - 1, c: 2 } });
                    // Style all merged cells
                    for (let rIdx = 0; rIdx < sectionSpan; rIdx++) {
                        setStyle(ws, currentRow + rIdx, 2, bodyStyle);
                    }
                }

                // Col 3: Group Parameter (merge if first item of section)
                if (firstItemOfSection) {
                    const sectionSpan = items.length;
                    setCellValue(ws, currentRow, 3, sectionLabel);
                    ws["!merges"].push({ s: { r: currentRow, c: 3 }, e: { r: currentRow + sectionSpan - 1, c: 3 } });
                    // Style all merged cells
                    for (let rIdx = 0; rIdx < sectionSpan; rIdx++) {
                        setStyle(ws, currentRow + rIdx, 3, bodyLeftStyle);
                    }
                }

                // Col 4: Indeks
                setCellValue(ws, currentRow, 4, riskIndex);
                setStyle(ws, currentRow, 4, {
                    ...bodyStyle,
                    font: { family: "Courier New", size: 10 }
                });

                // Col 5: Parameter
                setCellValue(ws, currentRow, 5, r.indikator);
                setStyle(ws, currentRow, 5, bodyLeftStyle);

                // Col 6: Bobot Indikator
                setCellValue(ws, currentRow, 6, bobotIndikatorDisplay);
                setStyle(ws, currentRow, 6, bodyStyle);

                // Col 7: Hasil Assessment
                setCellValue(ws, currentRow, 7, hasilDisplay);
                setStyle(ws, currentRow, 7, bodyRightStyle);

                // Col 8-9: Risk Level
                const hasValidPeringkat = !isNaN(Number(peringkat)) && Number(peringkat) >= 1 && Number(peringkat) <= 5;

                if (riskType === "kepatuhan" && !hasValidPeringkat) {
                    setCellValue(ws, currentRow, 8, "");
                    setStyle(ws, currentRow, 8, bodyStyle);
                    setCellValue(ws, currentRow, 9, "");
                    setStyle(ws, currentRow, 9, bodyStyle);
                } else {
                    setCellValue(ws, currentRow, 8, peringkat);
                    setStyle(ws, currentRow, 8, {
                        ...bodyStyle,
                        font: { bold: true, size: 12 },
                        fill: { patternType: "solid", fgColor: { rgb: hexToARGB(riskColor.bg) } },
                        font: { bold: true, color: { rgb: hexToARGB(riskColor.text) }, size: 12 }
                    });

                    setCellValue(ws, currentRow, 9, riskLabel);
                    setStyle(ws, currentRow, 9, {
                        ...bodyStyle,
                        font: { bold: true, size: 10 },
                        fill: { patternType: "solid", fgColor: { rgb: hexToARGB(riskColor.bg) } },
                        font: { bold: true, color: { rgb: hexToARGB(riskColor.text) }, size: 10 }
                    });
                }

                currentRow++;
                firstItemOfSection = false;
            });

            currentSectionStartRow = currentRow;
        });

        firstItemOfRiskType = false;
        globalRiskNumber++;
    });

    // ============================================================
    // COLUMN WIDTHS
    // ============================================================
    ws["!cols"] = [
        { wch: 6 },   // Col 0 - No
        { wch: 20 },  // Col 1 - Jenis Risiko
        { wch: 10 },  // Col 2 - Bobot Section
        { wch: 30 },  // Col 3 - Group Parameter
        { wch: 18 },  // Col 4 - Indeks
        { wch: 40 },  // Col 5 - Parameter
        { wch: 10 },  // Col 6 - Bobot Indikator
        { wch: 15 },  // Col 7 - Hasil Assessment
        { wch: 12 },  // Col 8 - Risk Level (numeric)
        { wch: 20 },  // Col 9 - Risk Level (text)
    ];

    const range = { s: { c: 0, r: 0 }, e: { c: 9, r: currentRow - 1 } };
    ws["!ref"] = XLSX.utils.encode_range(range);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filePrefix}-${year}-${quarter}.xlsx`);
}