
// REKAP 1

import React, { useEffect, useMemo, useState } from "react";
import { HelpCircle, ChevronDown, ChevronRight, Download } from "lucide-react";
import { validateBHZ } from "../utils/validationHelpers";
import { Calendar } from "lucide-react";
import { exportRekap1ToExcel } from "../utils/exportRekap1";

/* ===================== BRAND ===================== */
const PNM_BRAND = {
    primary: "#0068B3",
    primarySoft: "#E6F1FA",
};


const REKAP1_FINAL_KEY = "rekap1_final_summary_v1";

/* ===================== HELPERS ===================== */
const getCurrentYear = () => new Date().getFullYear();
const getCurrentQuarter = () => "Q4";

const fmt = (n) =>
    Number.isFinite(n) ? Number(n).toFixed(2) : "0.00";

// Color system for status badges

/* ===================== LEVEL COLOR CONFIG ===================== */
const LEVEL_BG_COLOR = {
    1: 'bg-[#2e7d32]',  // hijau tua
    2: 'bg-[#92D050]',  // hijau cerah
    3: 'bg-[#ffff00]',  // kuning
    4: 'bg-[#ffc000]',  // oranye
    5: 'bg-[#ff0000]',  // merah
};

const LEVEL_TEXT_COLOR = {
    1: 'text-white',
    2: 'text-slate-900',
    3: 'text-slate-900',
    4: 'text-slate-900',
    5: 'text-white',
};

/* ===================== SKOR → LEVEL ===================== */
const skorToLevel = (skor) => {
    if (skor < 1.5) return 1;
    if (skor < 2.5) return 2;
    if (skor < 3.5) return 3;
    if (skor < 4.5) return 4;
    return 5;
};

/* ===================== BADGE STYLE CONFIG ===================== */
const BADGE_BASE_CLASS = `
  flex items-center justify-center
  w-[160px] h-8
  rounded-full
  text-xs font-semibold
`;

const BADGE_DOT_CLASS = 'w-2 h-2 rounded-full mr-1.5';



/* ===================== COLOR BY LEVEL ===================== */
const getColorBySkor = (skor) => {
    const level = skorToLevel(skor);

    return {
        level,
        bg: LEVEL_BG_COLOR[level],
        text: LEVEL_TEXT_COLOR[level],
    };
};




const getStatusColor = (skor) => {
    if (skor < 1.80) {
        return {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300'
        };
    }
    if (skor < 2.60) {
        return {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-300'
        };
    }
    if (skor < 3.40) {
        return {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-300'
        };
    }
    if (skor < 4.20) {
        return {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-300'
        };
    }
    return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300'
    };
};



// ===================== STEP 1: STORAGE HELPER (BHz) =====================
const BHZ_STORAGE_KEY = "rekap1_bhz_config_v1";

const loadBhzConfig = (year, quarter) => {
    try {
        const raw = localStorage.getItem(BHZ_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed?.[year]?.[quarter] || {};
    } catch {
        return {};
    }
};

const saveBhzConfig = (year, quarter, data) => {
    try {
        const raw = JSON.parse(localStorage.getItem(BHZ_STORAGE_KEY) || "{}");

        if (!raw[year]) raw[year] = {};
        raw[year][quarter] = {
            ...(raw[year][quarter] || {}),
            ...data,
        };

        localStorage.setItem(BHZ_STORAGE_KEY, JSON.stringify(raw));
    } catch { }
};


// ===================== HELPER HITUNG SKOR KPMR =====================
const hitungSkorKPMR = (rows) => {
    if (!rows || rows.length === 0) {
        console.log('[REKAP1] hitungSkorKPMR: No rows provided');
        return 0;
    }

    console.log('[REKAP1] hitungSkorKPMR: Input rows:', rows);

    // Group by aspekNo (bukan sectionNo)
    const aspekGroups = {};
    rows.forEach((item) => {
        const key = item.aspekNo ?? "default";
        if (!aspekGroups[key]) aspekGroups[key] = [];

        // Ambil HANYA sectionSkor (skor KPMR yang diinput manual)
        const score = Number(item.sectionSkor ?? 0);
        console.log(`[REKAP1] Row aspekNo: ${key}, sectionSkor: ${score}`);
        aspekGroups[key].push(score);
    });

    console.log('[REKAP1] Aspek groups:', aspekGroups);

    // Rata-rata per aspek (Skor Aspek)
    const aspekAvg = Object.values(aspekGroups).map(
        (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
    );

    console.log('[REKAP1] Aspek averages:', aspekAvg);

    // Rata-rata semua aspek (Skor KPMR total)
    const result = aspekAvg.length > 0
        ? aspekAvg.reduce((a, b) => a + b, 0) / aspekAvg.length
        : 0;

    console.log('[REKAP1] Final KPMR score:', result);
    return result;
};




/* ===================== MAIN ===================== */
export default function Rekap1() {
    const [year, setYear] = useState(getCurrentYear());
    const [quarter, setQuarter] = useState(getCurrentQuarter());

    // Refresh counter untuk force re-render ketika data berubah
    const [refreshCounter, setRefreshCounter] = useState(0);

    // ===================== STEP 2: LOAD BHz CONFIG =====================
    const bhzInit = useMemo(() => {
        return loadBhzConfig(year, quarter);
    }, [year, quarter]);


    // Collapsible sections state
    const [openA, setOpenA] = useState(true);
    const [openB, setOpenB] = useState(true);
    const [openC, setOpenC] = useState(true); // Added state for C


    // ===================== STEP 3: BHz STATE (PERSISTENT) =====================
    const [bobotInvestasi, setBobotInvestasi] = useState(bhzInit.investasi ?? 10);
    const [bobotPasar, setBobotPasar] = useState(bhzInit.pasar ?? 10);
    const [bobotLikuiditas, setBobotLikuiditas] = useState(bhzInit.likuiditas ?? 10);
    const [bobotOperasional, setBobotOperasional] = useState(bhzInit.operasional ?? 20);
    const [bobotHukum, setBobotHukum] = useState(bhzInit.hukum ?? 10);
    const [bobotStrategis, setBobotStrategis] = useState(bhzInit.strategis ?? 20);
    const [bobotKepatuhan, setBobotKepatuhan] = useState(bhzInit.kepatuhan ?? 10);
    const [bobotReputasi, setBobotReputasi] = useState(bhzInit.reputasi ?? 10);

    // Validation states for BHZ inputs
    const [bobotErrors, setBobotErrors] = useState({
        investasi: "",
        pasar: "",
        likuiditas: "",
        operasional: "",
        hukum: "",
        strategis: "",
        kepatuhan: "",
        reputasi: "",
    });



    /* ---------- editable BVT ---------- */
    const [bvtInvestasiInput, setBvtInvestasiInput] = useState(100);
    const [bvtPasarInput, setBvtPasarInput] = useState(100);
    const [bvtLikuiditasInput, setBvtLikuiditasInput] = useState(100);
    const [bvtOperasionalInput, setBvtOperasionalInput] = useState(100);
    const [bvtHukumInput, setBvtHukumInput] = useState(100);
    const [bvtStrategisInput, setBvtStrategisInput] = useState(100);
    const [bvtKepatuhanInput, setBvtKepatuhanInput] = useState(100);
    const [bvtReputasiInput, setBvtReputasiInput] = useState(100);


    // Validation handlers for BHZ inputs
    const handleBobotChange = (field, value) => {
        const validation = validateBHZ(value);

        setBobotErrors(prev => ({
            ...prev,
            [field]: validation.error
        }));

        // Only update value if valid
        if (validation.isValid) {
            switch (field) {
                case 'investasi':
                    setBobotInvestasi(Number(value));
                    break;
                case 'pasar':
                    setBobotPasar(Number(value));
                    break;
                case 'likuiditas':
                    setBobotLikuiditas(Number(value));
                    break;
                case 'operasional':
                    setBobotOperasional(Number(value));
                    break;
                case 'hukum':
                    setBobotHukum(Number(value));
                    break;
                case 'strategis':
                    setBobotStrategis(Number(value));
                    break;
                case 'kepatuhan':
                    setBobotKepatuhan(Number(value));
                    break;
                case 'reputasi':
                    setBobotReputasi(Number(value));
                    break;
            }
        }
    };

    // ===================== STEP 4: AUTO SAVE BHz =====================
    useEffect(() => {
        saveBhzConfig(year, quarter, {
            investasi: bobotInvestasi,
            pasar: bobotPasar,
            likuiditas: bobotLikuiditas,
            operasional: bobotOperasional,
            hukum: bobotHukum,
            strategis: bobotStrategis,
            kepatuhan: bobotKepatuhan,
            reputasi: bobotReputasi,
        });
    }, [
        year,
        quarter,
        bobotInvestasi,
        bobotPasar,
        bobotLikuiditas,
        bobotOperasional,
        bobotHukum,
        bobotStrategis,
        bobotKepatuhan,
        bobotReputasi,
    ]);


    // ===================== STEP 5: RELOAD BHz SAAT PERIOD BERUBAH =====================
    useEffect(() => {
        const cfg = loadBhzConfig(year, quarter);

        setBobotInvestasi(cfg.investasi ?? 10);
        setBobotPasar(cfg.pasar ?? 10);
        setBobotLikuiditas(cfg.likuiditas ?? 10);
        setBobotOperasional(cfg.operasional ?? 20);
        setBobotHukum(cfg.hukum ?? 10);
        setBobotStrategis(cfg.strategis ?? 20);
        setBobotKepatuhan(cfg.kepatuhan ?? 10);
        setBobotReputasi(cfg.reputasi ?? 10);
    }, [year, quarter]);

    /* ---------- Listen for Hukum KPMR data changes ---------- */
    useEffect(() => {
        const handleHukumKPMRChanged = (e) => {
            console.log("[REKAP1] Hukum KPMR changed for", year, quarter);
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('hukumKPMR:changed', handleHukumKPMRChanged);

        return () => {
            window.removeEventListener('hukumKPMR:changed', handleHukumKPMRChanged);
        };
    }, [year, quarter]);




    /* ---------- Load summary data for each risk ---------- */
    const loadRiskSummary = (storageKey) => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return [];

            const parsed = JSON.parse(raw);
            return parsed.filter(
                (r) => r.year === year && r.quarter === quarter
            );
        } catch {
            return [];
        }
    };

    /* ---------- Load Operasional data for Risiko Inheren ---------- */
    const loadOperasionalRows = useMemo(() => {
        try {
            const raw = localStorage.getItem("operasionalRows");
            if (!raw) return [];

            const parsed = JSON.parse(raw);
            return parsed.filter(
                (r) => r.year === year && r.quarter === quarter
            );
        } catch {
            return [];
        }
    }, [year, quarter]);

    /* ---------- Load KPMR data for Investasi ---------- */
    const loadKPMRInvestasi = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_investasi_definitions_v1");
            if (!definitionsRaw) return [];
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_investasi_scores_v1");
            if (!scoresRaw) return [];
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                // Filter by selected year/quarter
                if (score.year !== year || score.quarter !== quarter) continue;

                // Find matching definition
                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                // Build row in format expected by hitungSkorKPMR
                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Investasi:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    /* ---------- Load KPMR data for Pasar ---------- */
    const loadKPMRPasar = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_pasar_definitions_v1");
            if (!definitionsRaw) return [];
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_pasar_scores_v1");
            if (!scoresRaw) return [];
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                // Filter by selected year/quarter
                if (score.year !== year || score.quarter !== quarter) continue;

                // Find matching definition
                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                // Build row in format expected by hitungSkorKPMR
                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Pasar:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    /* ---------- Load KPMR data for Operasional ---------- */
    const loadKPMROperasional = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_operasional_definitions_v1");
            if (!definitionsRaw) return [];
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_operasional_scores_v1");
            if (!scoresRaw) return [];
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                // Filter by selected year/quarter
                if (score.year !== year || score.quarter !== quarter) continue;

                // Find matching definition
                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                // Build row in format expected by hitungSkorKPMR
                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Operasional:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    /* ---------- Load KPMR data for Likuiditas ---------- */
    const loadKPMRLikuiditas = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_likuiditas_definitions_v1");
            if (!definitionsRaw) {
                console.log('[REKAP1] No KPMR Likuiditas definitions found');
                return [];
            }
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_likuiditas_scores_v1");
            if (!scoresRaw) {
                console.log('[REKAP1] No KPMR Likuiditas scores found');
                return [];
            }
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                // Filter by selected year/quarter
                if (score.year !== year || score.quarter !== quarter) continue;

                // Find matching definition
                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                // Build row in format expected by hitungSkorKPMR
                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            console.log('[REKAP1] Loaded KPMR Likuiditas data:', result.length, 'rows for', year, quarter);
            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Likuiditas:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    /* ---------- Load KPMR data for Hukum ---------- */
    const loadKPMRHukum = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_hukum_definitions_v1");
            if (!definitionsRaw) {
                console.log('[REKAP1] No KPMR Hukum definitions found');
                return [];
            }
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_hukum_scores_v1");
            if (!scoresRaw) {
                console.log('[REKAP1] No KPMR Hukum scores found');
                return [];
            }
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                // Filter by selected year/quarter
                if (score.year !== year || score.quarter !== quarter) continue;

                // Find matching definition
                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                // Build row in format expected by hitungSkorKPMR
                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            console.log('[REKAP1] Loaded KPMR Hukum data:', result.length, 'rows for', year, quarter);
            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Hukum:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    const loadKPMRStratejik = useMemo(() => {
        try {
            // Prefer modern storage: definitions + scores (year-level + quarter-level)
            const definitionsRaw = localStorage.getItem("kpmr_stratejik_definitions_v1");
            const scoresRaw = localStorage.getItem("kpmr_stratejik_scores_v1");

            if (definitionsRaw && scoresRaw) {
                const definitions = JSON.parse(definitionsRaw);
                const scores = JSON.parse(scoresRaw);

                const result = [];
                for (const score of scores) {
                    // only consider this year & quarter
                    if (score.year !== year || score.quarter !== quarter) continue;

                    const definition = definitions.find(d => d.id === score.definitionId);
                    if (!definition) continue;

                    result.push({
                        aspekNo: definition.aspekNo || "",
                        aspekTitle: definition.aspekTitle || "",
                        aspekBobot: definition.aspekBobot || 0,
                        sectionNo: definition.sectionNo || "",
                        sectionTitle: definition.sectionTitle || "",
                        sectionSkor: Number(score.sectionSkor ?? 0),
                        year: score.year,
                        quarter: score.quarter,
                    });
                }

                console.log('[REKAP1] Loaded KPMR Stratejik (defs+scores):', result.length, 'rows for', year, quarter);
                return result;
            }

            // Fallback: legacy flat rows (keberadaan key bervariasi in your app)
            const legacyRaw = localStorage.getItem("kpmr_stratejik_rows_v1") || localStorage.getItem("rekap_stratejik");
            if (!legacyRaw) {
                console.log('[REKAP1] No KPMR Stratejik data found (defs+scores or legacy)');
                return [];
            }

            const parsed = JSON.parse(legacyRaw);
            const filtered = parsed
                .filter(r => r.year === year && r.quarter === quarter)
                .map(r => ({
                    aspekNo: r.aspekNo || r.no || "",
                    aspekTitle: r.aspekTitle || r.sectionLabel || "",
                    aspekBobot: r.aspekBobot || r.bobotSection || 0,
                    sectionNo: r.sectionNo || r.subNo || "",
                    sectionTitle: r.sectionTitle || r.indikator || "",
                    // try common fields: sectionSkor (preferred) — fallback to peringkat if present
                    sectionSkor: Number(r.sectionSkor ?? r.peringkat ?? 0),
                    year: r.year,
                    quarter: r.quarter,
                }));

            console.log('[REKAP1] Loaded KPMR Stratejik (legacy):', filtered.length, 'rows for', year, quarter);
            return filtered;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Stratejik:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);


    const loadKPMRKepatuhan = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_kepatuhan_definitions_v1");
            if (!definitionsRaw) return [];
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_kepatuhan_scores_v1");
            if (!scoresRaw) return [];
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                // Filter by selected year/quarter
                if (score.year !== year || score.quarter !== quarter) continue;

                // Find matching definition
                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                // Build row in format expected by hitungSkorKPMR
                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Kepatuhan:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    const loadKPMRReputasi = useMemo(() => {
        try {
            // Load definitions (year-level data)
            const definitionsRaw = localStorage.getItem("kpmr_reputasi_definitions_v1");
            if (!definitionsRaw) return [];
            const definitions = JSON.parse(definitionsRaw);

            // Load scores (quarter-level data)
            const scoresRaw = localStorage.getItem("kpmr_reputasi_scores_v1");
            if (!scoresRaw) return [];
            const scores = JSON.parse(scoresRaw);

            // Join definitions and scores for the selected year/quarter
            const result = [];
            for (const score of scores) {
                if (score.year !== year || score.quarter !== quarter) continue;

                const definition = definitions.find(d => d.id === score.definitionId);
                if (!definition) continue;

                result.push({
                    aspekNo: definition.aspekNo || "",
                    aspekTitle: definition.aspekTitle || "",
                    aspekBobot: definition.aspekBobot || 0,
                    sectionNo: definition.sectionNo || "",
                    sectionTitle: definition.sectionTitle || "",
                    sectionSkor: score.sectionSkor || 0,
                    year: score.year,
                    quarter: score.quarter
                });
            }

            return result;
        } catch (err) {
            console.error('[REKAP1] Error loading KPMR Reputasi:', err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    /* ---------- Calculate KPMR Investasi Score (Average by Aspek) ---------- */
    const skorKPMRInvestasi = useMemo(() => {
        if (loadKPMRInvestasi.length === 0) return 0;

        // Group by aspekNo
        const aspekGroups = {};
        loadKPMRInvestasi.forEach(item => {
            if (!aspekGroups[item.aspekNo]) {
                aspekGroups[item.aspekNo] = [];
            }
            aspekGroups[item.aspekNo].push(item.sectionSkor);
        });

        // Calculate average for each aspek
        const aspekAverages = Object.values(aspekGroups).map(scores => {
            const sum = scores.reduce((a, b) => a + b, 0);
            return sum / scores.length;
        });

        // Calculate overall average (Skor KPMR Investasi)
        const totalAspekSum = aspekAverages.reduce((a, b) => a + b, 0);
        return totalAspekSum / aspekAverages.length;
    }, [loadKPMRInvestasi]);

    /* ---------- Determine Kualitas Label from Score (Untuk KPMR / Tabel B) ---------- */
    const getKualitasLabel = (skor) => {
        if (skor < 1.50) return "Strong";
        if (skor < 2.50) return "Satisfactory";
        if (skor < 3.50) return "Fair";
        if (skor < 4.50) return "Marginal";
        return "Unsatisfactory";
    };

    /* ---------- Determine Kualitas Inheren Label from Score (Untuk Risiko Inheren / Tabel A) ---------- */
    const getKualitasInherenLabel = (skor) => {
        if (skor < 1.50) return "Low";
        if (skor < 2.50) return "Low to Moderate";
        if (skor < 3.50) return "Moderate";
        if (skor < 4.50) return "Moderate to High";
        return "High";
    };

    // Get quality label for Investasi
    const kualitasInvestasi = useMemo(() => {
        return getKualitasLabel(skorKPMRInvestasi);
    }, [skorKPMRInvestasi]);

    /* ---------- Calculate KPMR Pasar Score (Average by Aspek) ---------- */
    const skorKPMRPasar = useMemo(() => {
        if (loadKPMRPasar.length === 0) return 0;

        // Group by aspekNo
        const aspekGroups = {};
        loadKPMRPasar.forEach(item => {
            if (!aspekGroups[item.aspekNo]) {
                aspekGroups[item.aspekNo] = [];
            }
            aspekGroups[item.aspekNo].push(item.sectionSkor);
        });

        // Calculate average for each aspek
        const aspekAverages = Object.values(aspekGroups).map(scores => {
            const sum = scores.reduce((a, b) => a + b, 0);
            return sum / scores.length;
        });

        // Calculate overall average (Skor KPMR Pasar)
        const totalAspekSum = aspekAverages.reduce((a, b) => a + b, 0);
        return totalAspekSum / aspekAverages.length;
    }, [loadKPMRPasar]);

    // Get quality label for Pasar
    const kualitasPasar = useMemo(() => {
        return getKualitasLabel(skorKPMRPasar);
    }, [skorKPMRPasar]);

    /* ---------- Calculate KPMR Operasional Score (Average by Aspek) ---------- */
    const skorKPMROperasional = useMemo(() => {
        if (loadKPMROperasional.length === 0) return 0;

        // Group by aspekNo
        const aspekGroups = {};
        loadKPMROperasional.forEach(item => {
            if (!aspekGroups[item.aspekNo]) {
                aspekGroups[item.aspekNo] = [];
            }
            aspekGroups[item.aspekNo].push(item.sectionSkor);
        });

        // Calculate average for each aspek
        const aspekAverages = Object.values(aspekGroups).map(scores => {
            const sum = scores.reduce((a, b) => a + b, 0);
            return sum / scores.length;
        });

        // Calculate overall average (Skor KPMR Operasional)
        const totalAspekSum = aspekAverages.reduce((a, b) => a + b, 0);
        return totalAspekSum / aspekAverages.length;
    }, [loadKPMROperasional]);

    // Get quality label for Operasional
    const kualitasOperasional = useMemo(() => {
        return getKualitasLabel(skorKPMROperasional);
    }, [skorKPMROperasional]);

    /* ---------- Calculate KPMR Likuiditas Score (Average by Aspek) ---------- */
    const skorKPMRLikuiditas = useMemo(() => {
        if (loadKPMRLikuiditas.length === 0) return 0;

        // Group by aspekNo
        const aspekGroups = {};
        loadKPMRLikuiditas.forEach(item => {
            if (!aspekGroups[item.aspekNo]) {
                aspekGroups[item.aspekNo] = [];
            }
            aspekGroups[item.aspekNo].push(item.sectionSkor);
        });

        // Calculate average for each aspek
        const aspekAverages = Object.values(aspekGroups).map(scores => {
            const sum = scores.reduce((a, b) => a + b, 0);
            return sum / scores.length;
        });

        // Calculate overall average (Skor KPMR Likuiditas)
        const totalAspekSum = aspekAverages.reduce((a, b) => a + b, 0);
        return totalAspekSum / aspekAverages.length;
    }, [loadKPMRLikuiditas]);

    // Get quality label for Likuiditas
    const kualitasLikuiditas = useMemo(() => {
        return getKualitasLabel(skorKPMRLikuiditas);
    }, [skorKPMRLikuiditas]);


    const investasiSummary = useMemo(() => loadRiskSummary("rekap_investasi"), [year, quarter, refreshCounter]);
    const pasarSummary = useMemo(() => {
        const result = loadRiskSummary("pasarRows");
        console.log('[REKAP1] Loaded Pasar data for', year, quarter, ':', result.length, 'rows');
        return result;
    }, [year, quarter, refreshCounter]);
    const likuiditasSummary = useMemo(() => loadRiskSummary("rekap_likuiditas"), [year, quarter, refreshCounter]);
    const operasionalSummary = useMemo(() => loadRiskSummary("rekap_operasional"), [year, quarter, refreshCounter]);
    const kepatuhanSummary = useMemo(() => {
        const result = loadRiskSummary("rekap_kepatuhan");
        console.log('[REKAP1] Loaded Kepatuhan data for', year, quarter, ':', result.length, 'rows');
        return result;
    }, [year, quarter, refreshCounter]);
    const reputasiSummary = useMemo(() => {
        const result = loadRiskSummary("rekap_reputasi");
        console.log('[REKAP1] Loaded Reputasi data for', year, quarter, ':', result.length, 'rows');
        return result;
    }, [year, quarter, refreshCounter]);

    /* ---------- Load Hukum data directly from hukum_sections_v1 ---------- */
    /* ---------- Load Hukum data directly from hukum_sections_v1 ---------- */
    /* ---------- Load Hukum data from rekap_hukum ---------- */
    const loadHukumData = useMemo(() => {
        try {
            const raw = localStorage.getItem("rekap_hukum");
            if (!raw) {
                console.log("[REKAP1] No rekap_hukum data found");
                return [];
            }

            const parsed = JSON.parse(raw);
            console.log("[REKAP1] Raw Hukum data:", parsed);

            // Filter berdasarkan Year & Quarter yang SEDANG AKTIF
            const filtered = parsed.filter(
                (r) => r.year === year && r.quarter === quarter
            );

            console.log("[REKAP1] Filtered Hukum data for", year, quarter, ":", filtered.length, "rows");
            console.log("[REKAP1] Sample Hukum row:", filtered[0]);

            return filtered;
        } catch (err) {
            console.warn("[REKAP1] Failed to load Hukum data", err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    // Use loaded Hukum data instead of rekap_hukum
    const hukumSummary = useMemo(() => loadHukumData, [loadHukumData]);

    /* ---------- Load Stratejik data directly from stratejik_sections_v1 ---------- */
    /* ---------- Load Stratejik data from rekap_stratejik (FLAT STRUCTURE) ---------- */
    const loadStratejikData = useMemo(() => {
        try {
            // ✅ BACA dari rekap_stratejik yang sudah di-generate oleh Stratejik.jsx
            const raw = localStorage.getItem("rekap_stratejik");
            if (!raw) {
                console.log("[REKAP1] No rekap_stratejik data found");
                return [];
            }

            const parsed = JSON.parse(raw);
            console.log("[REKAP1] Raw Stratejik data:", parsed);

            // Filter berdasarkan Year & Quarter yang SEDANG AKTIF
            const filtered = parsed.filter(
                (r) => r.year === year && r.quarter === quarter
            );

            console.log("[REKAP1] Filtered Stratejik data for", year, quarter, ":", filtered.length, "rows");
            console.log("[REKAP1] Sample Stratejik row:", filtered[0]);

            return filtered;
        } catch (err) {
            console.warn("[REKAP1] Failed to load Stratejik data", err);
            return [];
        }
    }, [year, quarter, refreshCounter]);

    // Use loaded Stratejik data
    const strategisSummary = useMemo(() => loadStratejikData, [loadStratejikData]);

    // ===================== KPMR RISIKO LAIN =====================
    const skorKPMRHukum = useMemo(() => {
        console.log('[REKAP1] Calculating KPMR Hukum from:', loadKPMRHukum);
        const score = hitungSkorKPMR(loadKPMRHukum);
        console.log('[REKAP1] KPMR Hukum score:', score);
        return score;
    }, [loadKPMRHukum]);

    const skorKPMRStrategis = useMemo(() => {
        const score = hitungSkorKPMR(loadKPMRStratejik); // ← ubah dari strategisSummary
        return score;
    }, [loadKPMRStratejik]); // ← ubah dependency

    const skorKPMRKepatuhan = useMemo(() => {
        const score = hitungSkorKPMR(loadKPMRKepatuhan); // ← ubah dari strategisSummary
        return score;
    }, [loadKPMRKepatuhan]); // ← ubah dependency

    const skorKPMRReputasi = useMemo(() => {
        const score = hitungSkorKPMR(loadKPMRReputasi); // ← ubah dari strategisSummary
        return score;
    }, [loadKPMRReputasi]); // ← ubah dependency


    // ===================== ROWS KPMR (B) =====================
    const riskRowsKPMR = useMemo(() => [
        { label: "Investasi", bobot: bobotInvestasi, skor: skorKPMRInvestasi },
        { label: "Pasar", bobot: bobotPasar, skor: skorKPMRPasar },
        { label: "Likuiditas", bobot: bobotLikuiditas, skor: skorKPMRLikuiditas },
        { label: "Operasional", bobot: bobotOperasional, skor: skorKPMROperasional },
        { label: "Hukum", bobot: bobotHukum, skor: skorKPMRHukum },
        { label: "Strategis", bobot: bobotStrategis, skor: skorKPMRStrategis },
        { label: "Kepatuhan", bobot: bobotKepatuhan, skor: skorKPMRKepatuhan },
        { label: "Reputasi", bobot: bobotReputasi, skor: skorKPMRReputasi },
    ], [
        bobotInvestasi, bobotPasar, bobotLikuiditas, bobotOperasional,
        bobotHukum, bobotStrategis, bobotKepatuhan, bobotReputasi,
        skorKPMRInvestasi, skorKPMRPasar, skorKPMRLikuiditas, skorKPMROperasional,
        skorKPMRHukum, skorKPMRStrategis, skorKPMRKepatuhan, skorKPMRReputasi
    ]);


    /* ---------- Calculate Summary for each risk ---------- */
    const summaryInvestasi = useMemo(() => {
        return investasiSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [investasiSummary]);

    const summaryPasar = useMemo(() => {
        return pasarSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [pasarSummary]);

    const summaryLikuiditas = useMemo(() => {
        return likuiditasSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [likuiditasSummary]);

    const summaryOperasional = useMemo(() => {
        return operasionalSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [operasionalSummary]);

    const summaryHukum = useMemo(() => {
        return hukumSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [hukumSummary]);

    const summaryStrategis = useMemo(() => {
        return strategisSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [strategisSummary]);

    const summaryKepatuhan = useMemo(() => {
        return kepatuhanSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [kepatuhanSummary]);

    const summaryReputasi = useMemo(() => {
        return reputasiSummary.reduce((sum, r) => {
            const w = Number(r.weighted || 0);
            return sum + (Number.isFinite(w) ? w : 0);
        }, 0);
    }, [reputasiSummary]);

    /* ---------- Calculate risk scores (Summary × BVT%) ---------- */
    const skorInvestasi = useMemo(() => {
        return summaryInvestasi * (bvtInvestasiInput / 100);
    }, [summaryInvestasi, bvtInvestasiInput]);

    const skorPasar = useMemo(() => {
        return summaryPasar * (bvtPasarInput / 100);
    }, [summaryPasar, bvtPasarInput]);

    const skorLikuiditas = useMemo(() => {
        return summaryLikuiditas * (bvtLikuiditasInput / 100);
    }, [summaryLikuiditas, bvtLikuiditasInput]);

    const skorOperasional = useMemo(() => {
        return summaryOperasional * (bvtOperasionalInput / 100);
    }, [summaryOperasional, bvtOperasionalInput]);

    const skorHukum = useMemo(() => {
        return summaryHukum * (bvtHukumInput / 100);
    }, [summaryHukum, bvtHukumInput]);

    const skorStrategis = useMemo(() => {
        return summaryStrategis * (bvtStrategisInput / 100);
    }, [summaryStrategis, bvtStrategisInput]);

    const skorKepatuhan = useMemo(() => {
        return summaryKepatuhan * (bvtKepatuhanInput / 100);
    }, [summaryKepatuhan, bvtKepatuhanInput]);

    const skorReputasi = useMemo(() => {
        return summaryReputasi * (bvtReputasiInput / 100);
    }, [summaryReputasi, bvtReputasiInput]);


    const riskRows = useMemo(() => [
        {
            label: "Investasi",
            bvt: bvtInvestasiInput,
            setBvt: setBvtInvestasiInput,
            bobot: bobotInvestasi,
            setBobot: (value) => handleBobotChange('investasi', value),
            skor: skorInvestasi,
            summary: summaryInvestasi
        },
        {
            label: "Pasar",
            bvt: bvtPasarInput,
            setBvt: setBvtPasarInput,
            bobot: bobotPasar,
            setBobot: (value) => handleBobotChange('pasar', value),
            skor: skorPasar,
            summary: summaryPasar
        },
        {
            label: "Likuiditas",
            bvt: bvtLikuiditasInput,
            setBvt: setBvtLikuiditasInput,
            bobot: bobotLikuiditas,
            setBobot: (value) => handleBobotChange('likuiditas', value),
            skor: skorLikuiditas,
            summary: summaryLikuiditas
        },
        {
            label: "Operasional",
            bvt: bvtOperasionalInput,
            setBvt: setBvtOperasionalInput,
            bobot: bobotOperasional,
            setBobot: (value) => handleBobotChange('operasional', value),
            skor: skorOperasional,
            summary: summaryOperasional
        },
        {
            label: "Hukum",
            bvt: bvtHukumInput,
            setBvt: setBvtHukumInput,
            bobot: bobotHukum,
            setBobot: (value) => handleBobotChange('hukum', value),
            skor: skorHukum,
            summary: summaryHukum
        },
        {
            label: "Strategis",
            bvt: bvtStrategisInput,
            setBvt: setBvtStrategisInput,
            bobot: bobotStrategis,
            setBobot: (value) => handleBobotChange('strategis', value),
            skor: skorStrategis,
            summary: summaryStrategis
        },
        {
            label: "Kepatuhan",
            bvt: bvtKepatuhanInput,
            setBvt: setBvtKepatuhanInput,
            bobot: bobotKepatuhan,
            setBobot: (value) => handleBobotChange('kepatuhan', value),
            skor: skorKepatuhan,
            summary: summaryKepatuhan
        },
        {
            label: "Reputasi",
            bvt: bvtReputasiInput,
            setBvt: setBvtReputasiInput,
            bobot: bobotReputasi,
            setBobot: (value) => handleBobotChange('reputasi', value),
            skor: skorReputasi,
            summary: summaryReputasi
        },
    ], [
        bvtInvestasiInput, bvtPasarInput, bvtLikuiditasInput, bvtOperasionalInput,
        bvtHukumInput, bvtStrategisInput, bvtKepatuhanInput, bvtReputasiInput,
        bobotInvestasi, bobotPasar, bobotLikuiditas, bobotOperasional,
        bobotHukum, bobotStrategis, bobotKepatuhan, bobotReputasi,
        skorInvestasi, skorPasar, skorLikuiditas, skorOperasional,
        skorHukum, skorStrategis, skorKepatuhan, skorReputasi,
        summaryInvestasi, summaryPasar, summaryLikuiditas, summaryOperasional,
        summaryHukum, summaryStrategis, summaryKepatuhan, summaryReputasi
    ]);



    /* ---------- Peringkat Komposit A (Risiko Inheren) ---------- */
    const peringkatKompositA = useMemo(() => {
        return riskRows.reduce((sum, r) => {
            const bobot = Number(r.bobot || 0);
            const skor = Number(r.skor || 0);

            if (bobot > 0 && Number.isFinite(skor)) {
                return sum + skor * (bobot / 100);
            }
            return sum;
        }, 0);
    }, [riskRows]);

    /* ---------- Peringkat Komposit B (KPMR) - INTERNAL USE ---------- */
    const peringkatKompositB = useMemo(() => {
        return riskRowsKPMR.reduce((sum, r) => {
            if (r.bobot > 0 && Number.isFinite(r.skor)) {
                return sum + r.skor * (r.bobot / 100);
            }
            return sum;
        }, 0);
    }, [riskRowsKPMR]);




    /* ---------- Get Peringkat Label ---------- */
    const getPeringkatLabel = (skor) => {
        if (skor < 1.50) return "Peringkat 1";
        if (skor < 2.50) return "Peringkat 2";
        if (skor < 3.50) return "Peringkat 3";
        if (skor < 4.50) return "Peringkat 4";
        return "Peringkat 5";
    };

    /* ---------- Peringkat Investasi for Table C ---------- */
    const peringkatInvestasi = useMemo(() => {
        // Formula: (skorInvestasi + skorKPMRInvestasi) / 2
        return (skorInvestasi + skorKPMRInvestasi) / 2;
    }, [skorInvestasi, skorKPMRInvestasi]);

    /* ---------- Peringkat Pasar for Table C ---------- */
    const peringkatPasar = useMemo(() => {
        // Formula: (skorPasar + skorKPMRPasar) / 2
        return (skorPasar + skorKPMRPasar) / 2;
    }, [skorPasar, skorKPMRPasar]);

    /* ---------- Peringkat Operasional for Table C ---------- */
    const peringkatOperasional = useMemo(() => {
        // Formula: (skorOperasional + skorKPMROperasional) / 2
        return (skorOperasional + skorKPMROperasional) / 2;
    }, [skorOperasional, skorKPMROperasional]);

    // ===================== ADDED: 5 MISSING PERINGKAT CALCULATIONS =====================
    const peringkatLikuiditas = useMemo(() => {
        return (skorLikuiditas + skorKPMRLikuiditas) / 2;
    }, [skorLikuiditas, skorKPMRLikuiditas]);

    const peringkatHukum = useMemo(() => {
        return (skorHukum + skorKPMRHukum) / 2;
    }, [skorHukum, skorKPMRHukum]);

    const peringkatStrategis = useMemo(() => {
        return (skorStrategis + skorKPMRStrategis) / 2;
    }, [skorStrategis, skorKPMRStrategis]);

    const peringkatKepatuhan = useMemo(() => {
        return (skorKepatuhan + skorKPMRKepatuhan) / 2;
    }, [skorKepatuhan, skorKPMRKepatuhan]);

    const peringkatReputasi = useMemo(() => {
        return (skorReputasi + skorKPMRReputasi) / 2;
    }, [skorReputasi, skorKPMRReputasi]);

    /* ---------- Data Rows for Table C ---------- */
    const tableCRows = useMemo(() => [
        { label: "Investasi", bhz: bobotInvestasi, val: peringkatInvestasi },
        { label: "Pasar", bhz: bobotPasar, val: peringkatPasar },
        { label: "Likuiditas", bhz: bobotLikuiditas, val: peringkatLikuiditas },
        { label: "Operasional", bhz: bobotOperasional, val: peringkatOperasional },
        { label: "Hukum", bhz: bobotHukum, val: peringkatHukum },
        { label: "Strategis", bhz: bobotStrategis, val: peringkatStrategis },
        { label: "Kepatuhan", bhz: bobotKepatuhan, val: peringkatKepatuhan },
        { label: "Reputasi", bhz: bobotReputasi, val: peringkatReputasi },
    ], [
        bobotInvestasi, bobotPasar, bobotLikuiditas, bobotOperasional,
        bobotHukum, bobotStrategis, bobotKepatuhan, bobotReputasi,
        peringkatInvestasi, peringkatPasar, peringkatLikuiditas, peringkatOperasional,
        peringkatHukum, peringkatStrategis, peringkatKepatuhan, peringkatReputasi
    ]);

    /* ---------- Total Peringkat Tingkat Risiko (Composite) ---------- */
    const totalPeringkatTingkatRisiko = useMemo(() => {
        return (peringkatKompositA + peringkatKompositB) / 2;
    }, [peringkatKompositA, peringkatKompositB]);


    useEffect(() => {
        const payload = {
            [year]: {
                [quarter]: {
                    kompositA: peringkatKompositA,
                    kompositB: peringkatKompositB,
                    risks: [
                        {
                            label: "Investasi",
                            inherent: skorInvestasi,
                            kpmr: skorKPMRInvestasi,
                        },
                        {
                            label: "Pasar",
                            inherent: skorPasar,
                            kpmr: skorKPMRPasar,
                        },
                        {
                            label: "Likuiditas",
                            inherent: skorLikuiditas,
                            kpmr: skorKPMRLikuiditas,
                        },
                        {
                            label: "Operasional",
                            inherent: skorOperasional,
                            kpmr: skorKPMROperasional,
                        },
                        {
                            label: "Hukum",
                            inherent: skorHukum,
                            kpmr: skorKPMRHukum,
                        },
                        {
                            label: "Strategis",
                            inherent: skorStrategis,
                            kpmr: skorKPMRStrategis,
                        },
                        {
                            label: "Kepatuhan",
                            inherent: skorKepatuhan,
                            kpmr: skorKPMRKepatuhan,
                        },
                        {
                            label: "Reputasi",
                            inherent: skorReputasi,
                            kpmr: skorKPMRReputasi,
                        },
                    ],
                },
            },
        };

        const raw = JSON.parse(localStorage.getItem(REKAP1_FINAL_KEY) || "{}");

        const next = {
            ...raw,
            [year]: {
                ...(raw[year] || {}),
                [quarter]: payload[year][quarter],
            },
        };

        localStorage.setItem(REKAP1_FINAL_KEY, JSON.stringify(next));

    }, [
        year,
        quarter,
        peringkatKompositA,
        peringkatKompositB,
        skorInvestasi,
        skorPasar,
        skorLikuiditas,
        skorOperasional,
        skorHukum,
        skorStrategis,
        skorKepatuhan,
        skorReputasi,
        skorKPMRInvestasi,
        skorKPMRPasar,
        skorKPMRLikuiditas,
        skorKPMROperasional,
        skorKPMRHukum,
        skorKPMRStrategis,
        skorKPMRKepatuhan,
        skorKPMRReputasi,
    ]);




    /* ---------- Listen for Investasi data changes ---------- */
    useEffect(() => {
        const handleInvestasiRowsChanged = (e) => {
            // Force re-render when Investasi data changes
            console.log("[REKAP1] Investasi rows changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handleInvestasiKPMRChanged = (e) => {
            // Force re-render when Investasi KPMR changes
            console.log("[REKAP1] Investasi KPMR changed");
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('investasiRows:changed', handleInvestasiRowsChanged);
        window.addEventListener('investasiKPMR:changed', handleInvestasiKPMRChanged);

        return () => {
            window.removeEventListener('investasiRows:changed', handleInvestasiRowsChanged);
            window.removeEventListener('investasiKPMR:changed', handleInvestasiKPMRChanged);
        };
    }, []);

    /* ---------- Listen for Hukum data changes ---------- */
    useEffect(() => {
        const handleHukumSectionsChanged = (e) => {
            console.log("[REKAP1] Hukum sections changed for", year, quarter);
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('hukumSections:changed', handleHukumSectionsChanged);

        return () => {
            window.removeEventListener('hukumSections:changed', handleHukumSectionsChanged);
        };
    }, []);

    /* ---------- Listen for Pasar data changes ---------- */
    useEffect(() => {
        const handlePasarRowsChanged = () => {
            console.log("[REKAP1] Pasar rows changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handlePasarKPMRChanged = () => {
            console.log("[REKAP1] Pasar KPMR changed");
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('pasarRows:changed', handlePasarRowsChanged);
        window.addEventListener('pasarKPMR:changed', handlePasarKPMRChanged);

        return () => {
            window.removeEventListener('pasarRows:changed', handlePasarRowsChanged);
            window.removeEventListener('pasarKPMR:changed', handlePasarKPMRChanged);
        };
    }, []);

    /* ---------- Listen for Likuiditas data changes ---------- */
    useEffect(() => {
        const handleLikuiditasRowsChanged = () => {
            console.log("[REKAP1] Likuiditas rows changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handleLikuiditasKPMRChanged = () => {
            console.log("[REKAP1] Likuiditas KPMR changed");
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('likuiditasRows:changed', handleLikuiditasRowsChanged);
        window.addEventListener('likuiditasKPMR:changed', handleLikuiditasKPMRChanged);

        return () => {
            window.removeEventListener('likuiditasRows:changed', handleLikuiditasRowsChanged);
            window.removeEventListener('likuiditasKPMR:changed', handleLikuiditasKPMRChanged);
        };
    }, []);

    /* ---------- Listen for Stratejik data changes ---------- */
    useEffect(() => {
        const handleStratejikSectionsChanged = (e) => {
            console.log("[REKAP1] Stratejik sections changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handleStratejikRowsChanged = (e) => {
            console.log("[REKAP1] Stratejik rows changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handleStratejikKPMRChanged = (e) => {
            console.log("[REKAP1] Stratejik KPMR changed");
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('stratejikSections:changed', handleStratejikSectionsChanged);
        window.addEventListener('stratejikRows:changed', handleStratejikRowsChanged);
        window.addEventListener('stratejikKPMR:changed', handleStratejikKPMRChanged);

        return () => {
            window.removeEventListener('stratejikSections:changed', handleStratejikSectionsChanged);
            window.removeEventListener('stratejikRows:changed', handleStratejikRowsChanged);
            window.removeEventListener('stratejikKPMR:changed', handleStratejikKPMRChanged);
        };
    }, []);

    /* ---------- Listen for Kepatuhan data changes ---------- */
    useEffect(() => {
        const handleKepatuhanRowsChanged = (e) => {
            console.log("[REKAP1] Kepatuhan rows changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handleKepatuhanKPMRChanged = (e) => {
            console.log("[REKAP1] Kepatuhan KPMR changed");
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('kepatuhanRows:changed', handleKepatuhanRowsChanged);
        window.addEventListener('kepatuhanKPMR:changed', handleKepatuhanKPMRChanged);

        return () => {
            window.removeEventListener('kepatuhanRows:changed', handleKepatuhanRowsChanged);
            window.removeEventListener('kepatuhanKPMR:changed', handleKepatuhanKPMRChanged);
        };
    }, []);

    /* ---------- Listen for Reputasi data changes ---------- */
    useEffect(() => {
        const handleReputasiRowsChanged = (e) => {
            console.log("[REKAP1] Reputasi rows changed");
            setRefreshCounter(prev => prev + 1);
        };

        const handleReputasiKPMRChanged = (e) => {
            console.log("[REKAP1] Reputasi KPMR changed");
            setRefreshCounter(prev => prev + 1);
        };

        window.addEventListener('reputasiRows:changed', handleReputasiRowsChanged);
        window.addEventListener('reputasiKPMR:changed', handleReputasiKPMRChanged);

        return () => {
            window.removeEventListener('reputasiRows:changed', handleReputasiRowsChanged);
            window.removeEventListener('reputasiKPMR:changed', handleReputasiKPMRChanged);
        };
    }, []);

    /* ---------- Auto-load latest year/quarter ---------- */
    useEffect(() => {
        const raw = JSON.parse(localStorage.getItem("rekap_investasi") || "[]");
        if (!raw.length) return;

        const last = raw[raw.length - 1];
        setYear(last.year);
        setQuarter(last.quarter);
    }, []);

    const kompositAColor = getColorBySkor(peringkatKompositA);
    const kompositBColor = getColorBySkor(peringkatKompositB);
    const kompositTotalColor = getColorBySkor(totalPeringkatTingkatRisiko);

    // Handler untuk export Excel
    const handleExportExcel = () => {
        exportRekap1ToExcel(
            riskRows,
            riskRowsKPMR,
            peringkatKompositA,
            peringkatKompositB,
            totalPeringkatTingkatRisiko,
            year,
            quarter
        );
    };




    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* ================= HEADER ================= */}
            <div className="relative rounded-xl overflow-hidden mb-4 shadow-sm bg-gradient-to-r from-[#0076C6]/90 via-[#00A3DA]/90 to-[#33C2B5]/90">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_35%)]" />
                <div className="relative px-4 py-5 sm:px-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Title */}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
                            Rekap 1
                        </h1>
                        <p className="mt-1 text-white/90 text-xs">
                            Risiko Inheren, KPMR & Peringkat Risiko
                        </p>
                    </div>

                    {/* Actions: Filter & Export */}
                    <div className="flex items-center gap-3">
                        {/* Export Button */}
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 transition-all duration-200 group"
                            title="Export to Excel"
                        >
                            <Download className="w-4 h-4 text-white opacity-90 group-hover:scale-110 transition-transform" />
                            <span className="text-white text-sm font-semibold">Export</span>
                        </button>

                        {/* Filter pill */}
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                            <Calendar className="w-4 h-4 text-white opacity-90" />

                            <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-20 bg-transparent text-white placeholder-white/60 text-sm font-semibold focus:outline-none"
                        />

                        <select
                            value={quarter}
                            onChange={(e) => setQuarter(e.target.value)}
                            className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
                        >
                            <option className="text-slate-900" value="Q1">Q1</option>
                            <option className="text-slate-900" value="Q2">Q2</option>
                            <option className="text-slate-900" value="Q3">Q3</option>
                            <option className="text-slate-900" value="Q4">Q4</option>
                        </select>
                    </div>
                    </div>
                </div>
            </div>


            {/* ================= REKAP 1 - COMBINED TABLE ================= */}
            <div className="rounded-xl bg-white shadow-lg overflow-hidden backdrop-blur-sm">
                <div
                    className="px-6 py-4 font-semibold text-white flex justify-between items-center cursor-pointer bg-gradient-to-r from-sky-700 via-sky-800 to-sky-900 hover:from-sky-600 hover:to-sky-800 transition-all duration-300 shadow-md"
                    onClick={() => {
                        setOpenA(!openA);
                        setOpenB(!openB);
                        setOpenC(!openC);
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg tracking-wide">Tabel Risiko</span>
                        <span className="text-sm opacity-90 font-medium">Risiko Inheren • KPMR • Peringkat</span>
                    </div>
                    {openA ? <ChevronDown size={20} className="transition-transform" /> : <ChevronRight size={20} className="transition-transform" />}
                </div>

                {(openA || openB || openC) && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-separate border-spacing-0">
                                <thead className="sticky top-0 z-10 shadow-sm">
                                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                                        <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-left font-bold text-sm uppercase tracking-wider">Jenis Risiko</th>
                                        <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">BVT</th>
                                        <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">BHz</th>
                                        <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">Risiko Inheren</th>
                                        <th className="border-r border-slate-200 text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">KPMR</th>
                                        <th className="text-slate-700 px-5 py-4 text-center font-bold text-sm uppercase tracking-wider">Peringkat Risiko</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {riskRows.map((row, idx) => {
                                        const riskLabel = row.label;
                                        const riskInherenValue = row.skor;
                                        const kpmrData = riskRowsKPMR.find(r => r.label === riskLabel);
                                        const kpmrValue = kpmrData ? kpmrData.skor : 0;
                                        const peringkatValue = (riskInherenValue + kpmrValue) / 2;

                                        const colorSchemeInheren = getColorBySkor(riskInherenValue);
                                        const colorSchemeKPMR = getColorBySkor(kpmrValue);
                                        const colorSchemePeringkat = getColorBySkor(peringkatValue);
                                        const isLastRow = idx === riskRows.length - 1;

                                        return (
                                            <tr
                                                key={idx}
                                                className={`${row.summary > 0 ? "hover:bg-slate-100/70 transition-all duration-200" : "opacity-40"} ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"} ${!isLastRow ? "border-b border-slate-200" : ""}`}
                                            >
                                                <td className="border-r border-slate-200 px-6 py-5">
                                                    <div className="text-slate-900 font-bold text-lg leading-snug min-h-[3rem] flex items-center">
                                                        {riskLabel}
                                                    </div>
                                                </td>

                                                <td className="border-r border-slate-200 px-5 py-4 text-center">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={row.bvt}
                                                            onChange={(e) => row.setBvt(Number(e.target.value || 0))}
                                                            className="w-20 border-0 border-b-2 border-slate-200 bg-transparent px-2 py-1 text-center font-medium text-slate-700 focus:outline-none focus:border-sky-500 focus:bg-sky-50/50 transition-all duration-200"
                                                            disabled={row.summary === 0}
                                                        />
                                                        <span className="absolute right-2 top-1.5 text-slate-400 text-xs font-medium">%</span>
                                                    </div>
                                                </td>

                                                <td className="border-r border-slate-200 px-5 py-4 text-center">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={row.bobot}
                                                            onChange={(e) =>
                                                                row.setBobot(Number(e.target.value || 0))
                                                            }
                                                            className={`w-20 border-0 border-b-2 px-2 py-1 text-center font-medium bg-transparent focus:outline-none transition-all duration-200 ${bobotErrors[row.label.toLowerCase()]
                                                                ? 'border-b-red-500 focus:border-red-600 focus:bg-red-50/50'
                                                                : 'border-b-slate-200 focus:border-sky-500 focus:bg-sky-50/50'
                                                                }`}
                                                            disabled={row.bvt === 0}
                                                        />
                                                        <span className="absolute right-2 top-1.5 text-slate-400 text-xs font-medium">%</span>
                                                        {bobotErrors[row.label.toLowerCase()] && (
                                                            <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-600 text-center whitespace-nowrap">
                                                                {bobotErrors[row.label.toLowerCase()]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="border-r border-slate-200 px-5 py-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-lg font-semibold text-slate-800">{fmt(riskInherenValue)}</span>
                                                        <span className={`${BADGE_BASE_CLASS} ${colorSchemeInheren.bg} ${colorSchemeInheren.text}`}>
                                                            <span className={`${BADGE_DOT_CLASS} ${colorSchemeInheren.bg}`} />
                                                            <span className="leading-none text-center">
                                                                {getKualitasInherenLabel(riskInherenValue)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="border-r border-slate-200 px-5 py-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-lg font-semibold text-slate-800">{fmt(kpmrValue)}</span>
                                                        <span className={`${BADGE_BASE_CLASS} ${colorSchemeKPMR.bg} ${colorSchemeKPMR.text}`}>
                                                            <span className={`${BADGE_DOT_CLASS} ${colorSchemeKPMR.bg}`} />
                                                            <span className="leading-none text-center">
                                                                {getKualitasLabel(kpmrValue)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="border-r border-slate-200 px-5 py-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-lg font-semibold text-slate-800">{fmt(peringkatValue)}</span>
                                                        <span className={`${BADGE_BASE_CLASS} ${colorSchemePeringkat.bg} ${colorSchemePeringkat.text}`}>
                                                            <span className={`${BADGE_DOT_CLASS} ${colorSchemePeringkat.bg}`} />
                                                            <span className="leading-none text-center">
                                                                {getPeringkatLabel(peringkatValue)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Composite Row */}
                                    <tr className="
  relative
  backdrop-blur-[16px]
  backdrop-saturate-180
  bg-[rgba(190,190,190,0.75)]
  rounded-[12px]
  border border-[rgba(209,213,219,0.3)]
  shadow-lg
  border-t-2 border-slate-300
  my-4
">
                                        <td className="
    border-r border-slate-200/60
    px-5 py-4 
    font-bold text-slate-900 uppercase tracking-wider
  ">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-extrabold">Komposit</span>
                                            </div>
                                        </td>

                                        <td className="border-r border-slate-200/60 px-5 py-4 text-center">
                                            <span className="text-slate-600/80 font-medium text-lg">—</span>
                                        </td>

                                        <td className="border-r border-slate-200/60 px-5 py-4 text-center">
                                            <span className="text-slate-600/80 font-medium text-lg">—</span>
                                        </td>

                                        <td className="border-r border-slate-200/60 px-5 py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="
        text-2xl font-black text-slate-900
        backdrop-blur-[4px]
        bg-white/30
        px-4 py-1
        rounded-lg
        border border-white/40
      ">
                                                    {fmt(peringkatKompositA)}
                                                </span>
                                                <span className={`
        ${BADGE_BASE_CLASS} 
        ${kompositAColor.bg} 
        ${kompositAColor.text}
        backdrop-blur-[8px]
        backdrop-saturate-150
        border border-white/40
        bg-gradient-to-b from-white/20 to-transparent
        shadow-lg
      `}>
                                                    <span className={`${BADGE_DOT_CLASS} ${kompositAColor.bg} backdrop-blur-[4px]`} />
                                                    <span className="leading-none text-center font-semibold">
                                                        {getKualitasInherenLabel(peringkatKompositA)}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>

                                        <td className="border-r border-slate-200/60 px-5 py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="
        text-2xl font-black text-slate-900
        backdrop-blur-[4px]
        bg-white/30
        px-4 py-1
        rounded-lg
        border border-white/40
      ">
                                                    {fmt(peringkatKompositB)}
                                                </span>
                                                <span className={`
        ${BADGE_BASE_CLASS} 
        ${kompositBColor.bg} 
        ${kompositBColor.text}
      `}>
                                                    <span className={`${BADGE_DOT_CLASS} ${kompositBColor.bg} backdrop-blur-[4px]`} />
                                                    <span className="leading-none text-center font-semibold">
                                                        {getKualitasLabel(peringkatKompositB)}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>

                                        <td className="border-r border-slate-200/60 px-5 py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="
        text-2xl font-black text-slate-900
        backdrop-blur-[4px]
        bg-white/30
        px-4 py-1
        rounded-lg
        border border-white/40
      ">
                                                    {fmt(totalPeringkatTingkatRisiko)}
                                                </span>
                                                <span className={`
        ${BADGE_BASE_CLASS} 
        ${kompositTotalColor.bg} 
        ${kompositTotalColor.text}
      `}>
                                                    <span className={`${BADGE_DOT_CLASS} ${kompositTotalColor.bg} backdrop-blur-[4px]`} />
                                                    <span className="leading-none text-center font-semibold">
                                                        Peringkat {kompositTotalColor.level}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>




                    </>
                )}
            </div>

            {/* ================= DEBUG INFO =================
            <details className="bg-gray-50 rounded-lg p-4 text-xs">
                <summary className="cursor-pointer font-semibold mb-2">Debug Info</summary>
                <pre className="overflow-auto">
                    {`Investasi: Summary=${fmt(summaryInvestasi)}, BVT=${bvtInvestasiInput}%, Skor=${fmt(skorInvestasi)}, Kualitas=${getKualitasInherenLabel(skorInvestasi)}
Pasar: Summary=${fmt(summaryPasar)}, BVT=${bvtPasarInput}%, Skor=${fmt(skorPasar)}, Kualitas=${getKualitasInherenLabel(skorPasar)}
Likuiditas: Summary=${fmt(summaryLikuiditas)}, BVT=${bvtLikuiditasInput}%, Skor=${fmt(skorLikuiditas)}, Kualitas=${getKualitasInherenLabel(skorLikuiditas)}
Operasional: Summary=${fmt(summaryOperasional)}, BVT=${bvtOperasionalInput}%, Skor=${fmt(skorOperasional)}, Kualitas=${getKualitasInherenLabel(skorOperasional)}
Hukum: Summary=${fmt(summaryHukum)}, BVT=${bvtHukumInput}%, Skor=${fmt(skorHukum)}, Kualitas=${getKualitasInherenLabel(skorHukum)}
Strategis: Summary=${fmt(summaryStrategis)}, BVT=${bvtStrategisInput}%, Skor=${fmt(skorStrategis)}, Kualitas=${getKualitasInherenLabel(skorStrategis)}
Kepatuhan: Summary=${fmt(summaryKepatuhan)}, BVT=${bvtKepatuhanInput}%, Skor=${fmt(skorKepatuhan)}, Kualitas=${getKualitasInherenLabel(skorKepatuhan)}
Reputasi: Summary=${fmt(summaryReputasi)}, BVT=${bvtReputasiInput}%, Skor=${fmt(skorReputasi)}, Kualitas=${getKualitasInherenLabel(skorReputasi)}

--- KPMR ---
Investasi: KPMR=${fmt(skorKPMRInvestasi)}, Kualitas=${kualitasInvestasi}, BHz=${bobotInvestasi}%
Pasar: KPMR=${fmt(skorKPMRPasar)}, Kualitas=${kualitasPasar}, BHz=${bobotPasar}%
Operasional: KPMR=${fmt(skorKPMROperasional)}, Kualitas=${kualitasOperasional}, BHz=${bobotOperasional}%

--- Peringkat Komposit ---
Peringkat Komposit A (from table scores): ${fmt(peringkatKompositA)}
Peringkat Komposit B (internal): ${fmt(peringkatKompositB)}
Active risks (BHz > 0): ${riskRows.filter(r => r.bobot > 0).map(r => r.label).join(', ')}

--- Peringkat Tingkat Risiko (Table C) ---
Peringkat Investasi: ${fmt(peringkatInvestasi)}
Label: ${getPeringkatLabel(peringkatInvestasi)}
Formula: (skorInvestasi + skorKPMRInvestasi) / 2

Peringkat Pasar: ${fmt(peringkatPasar)}
Label: ${getPeringkatLabel(peringkatPasar)}
Formula: (skorPasar + skorKPMRPasar) / 2

Peringkat Operasional: ${fmt(peringkatOperasional)}
Label: ${getPeringkatLabel(peringkatOperasional)}
Formula: (skorOperasional + skorKPMROperasional) / 2

Peringkat Likuiditas: ${fmt(peringkatLikuiditas)}
Label: ${getPeringkatLabel(peringkatLikuiditas)}
Formula: (skorLikuiditas + skorKPMRLikuiditas) / 2

Peringkat Hukum: ${fmt(peringkatHukum)}
Label: ${getPeringkatLabel(peringkatHukum)}
Formula: (skorHukum + skorKPMRHukum) / 2

Peringkat Strategis: ${fmt(peringkatStrategis)}
Label: ${getPeringkatLabel(peringkatStrategis)}
Formula: (skorStrategis + skorKPMRStrategis) / 2

Peringkat Kepatuhan: ${fmt(peringkatKepatuhan)}
Label: ${getPeringkatLabel(peringkatKepatuhan)}
Formula: (skorKepatuhan + skorKPMRKepatuhan) / 2

Peringkat Reputasi: ${fmt(peringkatReputasi)}
Label: ${getPeringkatLabel(peringkatReputasi)}
Formula: (skorReputasi + skorKPMRReputasi) / 2

Peringkat Komposit Final (Average of Komposit A & B): ${fmt(totalPeringkatTingkatRisiko)}
Label: ${getPeringkatLabel(totalPeringkatTingkatRisiko)}
Formula: (Peringkat Komposit A + Peringkat Komposit B) / 2`}
                </pre>
            </details> */}
        </div>
    );
}