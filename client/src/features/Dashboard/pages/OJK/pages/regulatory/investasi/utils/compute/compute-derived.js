export function computeDerived(nilai, param) {
  try {
    if (!nilai) {
      return emptyResult();
    }

    const judul = nilai.judul || {};

    const paramBobotFraction = Number(param?.bobot ?? 0) / 100;
    const nilaiBobotFraction = Number(nilai?.bobot ?? 0) / 100;

    /* HELPERS */

    const parseNumber = (v) => {
      if (v == null || v === '' || v === undefined) return NaN;

      // Jika sudah number, return langsung
      if (typeof v === 'number') return v;

      if (typeof v === 'string') {
        let cleaned = v.trim();

        // Hapus spasi
        cleaned = cleaned.replace(/\s/g, '');

        // Tangani persen
        const isPercent = cleaned.includes('%');
        cleaned = cleaned.replace('%', '');

        cleaned = cleaned.replace(/\./g, '');
        cleaned = cleaned.replace(/,/g, '.');

        const num = Number(cleaned);

        if (!isNaN(num) && isPercent) {
          return num / 100;
        }

        return num;
      }

      return Number(v);
    };

    const normalize = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase();

    const evaluateFormula = (expr, subs = {}) => {
      if (!expr || typeof expr !== 'string' || expr.trim() === '') return NaN;

      let e = expr.trim();

      for (const [token, value] of Object.entries(subs)) {
        const re = new RegExp(`\\b${token}\\b`, 'gi');
        e = e.replace(re, String(value));
      }

      const safeRe = /^[0-9eE\.\+\-\*\/\(\)\s]+$/;
      if (!safeRe.test(e)) {
        console.warn('Formula contains unsafe characters:', e);
        return NaN;
      }

      try {
        const fn = new Function(`"use strict"; try { return (${e}); } catch(err) { return NaN; }`);
        const val = fn();

        // Pastikan hasilnya finite
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
          return val;
        }

        console.warn('Formula returned invalid result:', val);
        return NaN;
      } catch (error) {
        console.error('Formula evaluation error:', error);
        return NaN;
      }
    };

    let rawValue = NaN;
    let rawString = null;
    let hasilDisplay = '';
    let hasilRows = [];

    if (judul.type === 'Tanpa Faktor') {
      const v = judul.value;
      const formula = (judul.formula || '').trim();
      const parsed = parseNumber(v);
      if (!isNaN(parsed)) {
        rawValue = formula ? evaluateFormula(formula, { pem: parsed }) : parsed;
      } else if (typeof v === 'string' && v.trim() !== '') {
        rawString = normalize(v);
      }

      finalizeDisplay('Tanpa Faktor');
      hasilRows = [hasilDisplay, v ?? '', formula || ''];
    } else if (judul.type === 'Satu Faktor') {
      /* ========= SATU FAKTOR ========= */
      const v = judul.valuePembilang;
      const formula = (judul.formula || '').trim();
      const parsed = parseNumber(v);
      if (!isNaN(parsed)) {
        rawValue = formula ? evaluateFormula(formula, { pem: parsed }) : parsed;
      } else if (typeof v === 'string' && v.trim() !== '') {
        rawString = normalize(v);
      }

      finalizeDisplay('Satu Faktor');
      hasilRows = [hasilDisplay, v ?? '', formula || ''];
    } else if (judul.type === 'Dua Faktor') {
      /* ========= DUA FAKTOR ========= */
      const vPem = judul.valuePembilang;
      const vPen = judul.valuePenyebut;
      const formula = (judul.formula || '').trim();

      const pem = parseNumber(vPem);
      const pen = parseNumber(vPen);

      if (!isNaN(pem) && !isNaN(pen)) {
        rawValue = formula ? evaluateFormula(formula, { pem, pen }) : pen !== 0 ? pem / pen : NaN;
      } else if (typeof vPem === 'string' && vPem.trim() !== '') {
        rawString = normalize(vPem);
      }

      finalizeDisplay('Dua Faktor');
      hasilRows = [hasilDisplay, vPem ?? '', vPen ?? '', formula || 'pem / pen'];
    }

    /*  RANKING */

    let peringkat = null;
    let matchedIndex = null;

    const ri = nilai.riskindikator || {};
    const ranges = [
      { key: 'low', rank: 1 },
      { key: 'lowToModerate', rank: 2 },
      { key: 'moderate', rank: 3 },
      { key: 'moderateToHigh', rank: 4 },
      { key: 'high', rank: 5 },
    ];

    if (!isNaN(rawValue)) {
      for (const { key, rank } of ranges) {
        const rawText = String(ri[key] ?? '');
        const nums = rawText.match(/-?\d+(\.\d+)?/g);
        if (!nums || nums.length === 0) continue;

        let min = -Infinity;
        let max = Infinity;

        if (nums.length === 1) {
          let n = Number(nums[0]);
          if (rawText.includes('%')) {
            n = n / 100;
          }
          if (/≤|<=/.test(rawText)) max = n;
          else if (/≥|>=/.test(rawText)) min = n;
          else if (/^[xX]?\s*>|>\s*\d+/i.test(rawText)) {
            min = n;
            max = Infinity;
          } else if (/^[xX]?\s*<|<\s*\d+/i.test(rawText)) {
            min = -Infinity;
            max = n;
          } else {
            min = n;
            max = n;
          }
        } else {
          let n1 = Number(nums[0]);
          let n2 = Number(nums[1]);
          if (rawText.includes('%')) {
            n1 = n1 / 100;
            n2 = n2 / 100;
          }
          min = Math.min(n1, n2);
          max = Math.max(n1, n2);
        }

        if (rawValue >= min && rawValue <= max) {
          peringkat = rank;
          matchedIndex = 0;
          break;
        }
      }
    }

    if (isNaN(rawValue) && rawString) {
      for (const { key, rank } of ranges) {
        const riValue = normalize(ri[key]);
        if (!riValue) continue;

        if (riValue === rawString) {
          peringkat = rank;
          matchedIndex = 0;
          break;
        }
      }
    }

    const weighted = !isNaN(peringkat) ? paramBobotFraction * nilaiBobotFraction * peringkat : null;

    const weightedDisplay = !isNaN(weighted) ? weighted.toFixed(2) : '';

    return {
      hasilDisplay,
      hasilRows,
      peringkat,
      weighted,
      weightedDisplay,
      matchedIndex,
      _internal: {
        rawValue,
        rawString,
        paramBobotFraction,
        nilaiBobotFraction,
      },
    };

    function finalizeDisplay(type) {
      if (!isNaN(rawValue)) {
        if (judul.percent) {
          hasilDisplay = (rawValue * 100).toFixed(2) + '%';
        } else {
          hasilDisplay = rawValue.toFixed(2);
        }
        return;
      }

      if (rawString) {
        if (type === 'Tanpa Faktor') {
          hasilDisplay = judul.value ?? rawString;
        } else if (type === 'Satu Faktor') {
          hasilDisplay = judul.valuePembilang ?? rawString;
        } else if (type === 'Dua Faktor') {
          if (judul.formula && judul.formula.trim() !== '') {
            hasilDisplay = judul.formula;
          } else {
            hasilDisplay = judul.valuePembilang ? `${judul.valuePembilang} / ${judul.valuePenyebut || '?'}` : rawString;
          }
        }
        return;
      }

      // Fallback jika tidak ada nilai
      if (type === 'Tanpa Faktor' && judul.value) {
        hasilDisplay = judul.value;
      } else if (type === 'Satu Faktor' && judul.valuePembilang) {
        hasilDisplay = judul.valuePembilang;
      } else if (type === 'Dua Faktor') {
        hasilDisplay = judul.formula || `${judul.valuePembilang || ''} / ${judul.valuePenyebut || ''}`;
      } else {
        hasilDisplay = '';
      }
    }
  } catch (error) {
    console.error('Error in computeDerived:', error);
    return emptyResult();
  }
}

function emptyResult() {
  return {
    hasilDisplay: '',
    hasilRows: [],
    peringkat: null,
    weighted: null,
    weightedDisplay: '',
    matchedIndex: null,
    _internal: {
      rawValue: NaN,
      rawString: null,
      paramBobotFraction: 0,
      nilaiBobotFraction: 0,
    },
  };
}

export default computeDerived;
