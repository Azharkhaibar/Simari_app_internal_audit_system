// utils/riskCalculator.js

/**
 * ================================================================
 * UNIVERSAL RISK CALCULATOR
 * Sistem perhitungan peringkat otomatis berdasarkan hasil & risk level
 * Dapat digunakan untuk semua form: Investasi, Pasar, Likuiditas, dll
 * FIXED: Support untuk angka negatif
 * ================================================================
 */

// Parse numeric value dari berbagai format
export const parseRiskValue = (text) => {
  if (!text || typeof text !== 'string') return null;

  const str = text.trim();
  if (!str) return null;

  // Pattern 1: Percentages "5%", "-5%", "10%"
  const percentMatch = str.match(/(-?\d+(?:[.,]\d+)?)\s*%/);
  if (percentMatch) {
    const num = parseFloat(percentMatch[1].replace(',', '.'));
    return { type: 'percentage', value: num };
  }

  // Pattern 2: Pure numbers "5", "-10.5", "10.5"
  const numberMatch = str.match(/^(-?\d+(?:[.,]\d+)?)$/);
  if (numberMatch) {
    const num = parseFloat(numberMatch[1].replace(',', '.'));
    return { type: 'number', value: num };
  }

  return null;
};

/**
 * Evaluasi kondisi risk level
 * Format yang didukung:
 * - "x ≤ 1%" atau "x <= 1%"
 * - "1% < x ≤ 2%" atau "1% < x <= 2%"
 * - "x > 4%"
 * - Reverse: "2% >= x > 1%"
 * - NEGATIVE: "-3% < x < 0", "x < -7%", etc.
 */
export const evaluateRiskCondition = (hasilPercent, condition) => {
  if (hasilPercent === null || hasilPercent === undefined) return false;
  if (!condition || typeof condition !== 'string') return false;

  try {
    // Normalize: remove spaces, convert unicode symbols
    let normalized = String(condition).replace(/\s+/g, '');
    normalized = normalized.replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/＞/g, '>').replace(/＜/g, '<').replace(/＝/g, '=');
    // FIXED: Support negative numbers
    const parseNumber = (str) => {
      const cleaned = str.replace('%', '').replace(',', '.');
      const num = parseFloat(cleaned);
      return num;
    };

    // FIXED: Update regex patterns to support negative numbers
    // Pattern 1: REVERSED RANGE "20% >= x > 17.5%" or "0 >= x > -3%"
    const reversedRangePattern = /^(-?[\d.,]+)%?([><=]+)x([><=]+)(-?[\d.,]+)%?$/;
    const reversedMatch = normalized.match(reversedRangePattern);

    if (reversedMatch) {
      const upperBound = parseNumber(reversedMatch[1]);
      const upperOp = reversedMatch[2];
      const lowerOp = reversedMatch[3];
      const lowerBound = parseNumber(reversedMatch[4]);
      // FIXED: Handle both positive and negative ranges
      if (upperBound > lowerBound || (upperBound >= 0 && lowerBound < 0)) {
        let upperCheck = false;
        let lowerCheck = false;

        if (upperOp === '>=') upperCheck = hasilPercent <= upperBound;
        else if (upperOp === '>') upperCheck = hasilPercent < upperBound;
        else if (upperOp === '<=') upperCheck = hasilPercent >= upperBound;
        else if (upperOp === '<') upperCheck = hasilPercent > upperBound;

        if (lowerOp === '>') lowerCheck = hasilPercent > lowerBound;
        else if (lowerOp === '>=') lowerCheck = hasilPercent >= lowerBound;
        else if (lowerOp === '<') lowerCheck = hasilPercent < lowerBound;
        else if (lowerOp === '<=') lowerCheck = hasilPercent <= lowerBound;

        const result = upperCheck && lowerCheck;
        return result;
      }
    }

    // Pattern 2: NORMAL RANGE "1% < x <= 2%" or "-5% < x < -3%"
    const normalRangePattern = /^(-?[\d.,]+)%?([<>=]+)x([<>=]+)(-?[\d.,]+)%?$/;
    const normalMatch = normalized.match(normalRangePattern);

    if (normalMatch) {
      const lowerBound = parseNumber(normalMatch[1]);
      const lowerOp = normalMatch[2];
      const upperOp = normalMatch[3];
      const upperBound = parseNumber(normalMatch[4]);
      // FIXED: Handle both positive and negative ranges
      // For negative numbers: -5 < -3, so lowerBound < upperBound still works
      if (lowerBound < upperBound) {
        let lowerCheck = false;
        let upperCheck = false;

        if (lowerOp === '<') lowerCheck = lowerBound < hasilPercent;
        else if (lowerOp === '<=') lowerCheck = lowerBound <= hasilPercent;

        if (upperOp === '<') upperCheck = hasilPercent < upperBound;
        else if (upperOp === '<=') upperCheck = hasilPercent <= upperBound;

        const result = lowerCheck && upperCheck;
        return result;
      }
    }

    // Pattern 3: SINGLE COMPARISON (x first) "x > 15%" or "x < -7%"
    const singleXFirstPattern = /^x([><=]+)(-?[\d.,]+)%?$/;
    const singleXFirstMatch = normalized.match(singleXFirstPattern);

    if (singleXFirstMatch) {
      const operator = singleXFirstMatch[1];
      const threshold = parseNumber(singleXFirstMatch[2]);
      let result = false;
      if (operator === '>') result = hasilPercent > threshold;
      else if (operator === '<') result = hasilPercent < threshold;
      else if (operator === '>=') result = hasilPercent >= threshold;
      else if (operator === '<=') result = hasilPercent <= threshold;
      else if (operator === '=' || operator === '==') result = Math.abs(hasilPercent - threshold) < 0.0001;
      return result;
    }

    // Pattern 4: SINGLE COMPARISON (value first - REVERSED) "15% < x" or "-7% > x"
    const singleValueFirstPattern = /^(-?[\d.,]+)%?([><=]+)x$/;
    const singleValueFirstMatch = normalized.match(singleValueFirstPattern);

    if (singleValueFirstMatch) {
      const threshold = parseNumber(singleValueFirstMatch[1]);
      const operator = singleValueFirstMatch[2];
      // Reverse the operator
      let result = false;
      if (operator === '>') result = hasilPercent < threshold;
      else if (operator === '<') result = hasilPercent > threshold;
      else if (operator === '>=') result = hasilPercent <= threshold;
      else if (operator === '<=') result = hasilPercent >= threshold;
      else if (operator === '=' || operator === '==') result = Math.abs(hasilPercent - threshold) < 0.0001;
      return result;
    }
    return false;
  } catch (err) {
    console.error('[EVAL] ✗ ERROR:', err);
    return false;
  }
};

/**
 * Deteksi apakah risk level menggunakan format persentase
 * @param {object} riskLevels - Object berisi {low, lowToModerate, moderate, moderateToHigh, high}
 * @returns {boolean} true jika ada % dalam kondisi, false jika nilai absolut
 */
const isPercentRiskLevels = (riskLevels = {}) => {
  const levelKeys = ['low', 'lowToModerate', 'moderate', 'moderateToHigh', 'high'];
  for (const key of levelKeys) {
    const value = riskLevels[key];
    if (value && typeof value === 'string' && value.includes('%')) {
      return true; // Menggunakan persentase
    }
  }
  return false; // Nilai absolut
};

/**
 * Hitung peringkat otomatis berdasarkan hasil dan risk levels
 * @param {number} hasilValue - Hasil perhitungan (bisa decimal atau percentage)
 * @param {object} riskLevels - Object dengan key: low, lowToModerate, moderate, moderateToHigh, high
 * @param {boolean} isPercent - Apakah hasil sudah dalam format persen (true) atau desimal (false)
 * @param {string} mode - Mode input: 'TEKS', 'RASIO', 'NILAI_TUNGGAL', dll
 * @returns {number} Peringkat 1-5
 */
export const calculatePeringkat = (hasilValue, riskLevels = {}, isPercent = false, mode = 'RASIO') => {
  // Validasi input
  if (hasilValue === '' || hasilValue == null) return 1;

  const vRaw = Number(hasilValue);
  if (!isFinite(vRaw) || Number.isNaN(vRaw)) return 1;

  // DETEKSI OTOMATIS: Cek apakah risk level menggunakan % atau nilai absolut
  const usesPercentageFormat = isPercentRiskLevels(riskLevels);

  // Hitung hasilPercent berdasarkan format risk level dan mode
  let hasilPercent;
  if (usesPercentageFormat) {
    // Risk level dalam format persentase (x ≤ 1%, dst)
    // FIXED: Support both positive and negative percentages
    if (mode === 'TEKS' || mode === 'KUALITATIF') {
      // TEKS mode: input sudah dalam format persen yang diinginkan (e.g., 63.60 untuk 63.60%)
      // Jangan kalikan 100 lagi
      hasilPercent = vRaw;
    } else {
      // RASIO/NILAI_TUNGGAL mode: hasil perhitungan perlu dikonversi (e.g., 1.52 → 152%)
      hasilPercent = vRaw * 100;
    }
  } else {
    // Risk level dalam format nilai absolut (x ≤ 16, dst) - TANPA dikali 100
    hasilPercent = vRaw;
  }

  // Risk fields in order (Low = 1, High = 5)
  const riskFields = ['low', 'lowToModerate', 'moderate', 'moderateToHigh', 'high'];

  // PRIORITY 1: Cek setiap risk level dari HIGH ke LOW (reverse order)
  // IMPORTANT: Untuk angka negatif, urutan tetap sama (5→1) karena:
  // - High risk (-8%) lebih kecil dari Low risk (1%)
  // - evaluateRiskCondition sudah handle comparison dengan benar
  for (let i = riskFields.length - 1; i >= 0; i--) {
    const field = riskFields[i];
    const condition = riskLevels[field];

    if (!condition || String(condition).trim() === '') continue;
    // Evaluasi kondisi
    const conditionMet = evaluateRiskCondition(hasilPercent, String(condition).trim());

    if (conditionMet) {
      return i + 1;
    } else {
    }
  }

  // PRIORITY 2: Fallback
  // FIXED: Handle negative values in fallback
  if (hasilPercent <= 0) return 1;
  if (hasilPercent <= 5) return 1;
  if (hasilPercent <= 10) return 2;
  if (hasilPercent <= 15) return 3;
  if (hasilPercent <= 20) return 4;
  return 5;
};

/**
 * Hitung peringkat berdasarkan matching teks (kualitatif/TEKS mode)
 * @param {string} hasilText - Teks hasil dari input user
 * @param {object} riskLevels - Object berisi {low, lowToModerate, moderate, moderateToHigh, high}
 * @returns {number} Peringkat 1-5, atau 0 jika tidak ada match
 */
export const calculatePeringkatFromText = (hasilText, riskLevels = {}) => {
  if (!hasilText || typeof hasilText !== 'string') {
    return 0;
  }

  // Normalize: trim, lowercase
  const normalizedInput = hasilText.trim().toLowerCase();

  // Mapping field ke peringkat
  const levelMapping = [
    { field: 'high', rank: 5 },
    { field: 'moderateToHigh', rank: 4 },
    { field: 'moderate', rank: 3 },
    { field: 'lowToModerate', rank: 2 },
    { field: 'low', rank: 1 },
  ];

  // Cek match untuk setiap level
  for (const { field, rank } of levelMapping) {
    const levelValue = riskLevels[field];
    if (!levelValue || typeof levelValue !== 'string') continue;

    // Normalize level value (bisa berupa teks langsung atau interval)
    // Jika mengandung operator matematika (<, >, ≤, ≥, =), itu interval angka → skip
    if (/[<>≤≥=]/.test(levelValue)) {
      continue;
    }

    // Case-insensitive exact match
    if (levelValue.trim().toLowerCase() === normalizedInput) {
      return rank;
    }
  }
  return 0; // No match found
};

/**
 * Deteksi apakah risk level menggunakan operator numerik
 * @param {object} riskLevels - Object berisi {low, lowToModerate, moderate, moderateToHigh, high}
 * @returns {boolean} true jika menggunakan numeric operator, false jika text murni
 */
export const isNumericRiskLevels = (riskLevels = {}) => {
  // Cek semua risk levels
  const levelKeys = ['low', 'lowToModerate', 'moderate', 'moderateToHigh', 'high'];

  // Jika ada SATU SAJA yang menggunakan operator numeric → return true
  for (const key of levelKeys) {
    const value = riskLevels[key];
    if (value && typeof value === 'string' && /[<>=]/.test(value)) {
      return true; // Menggunakan operator numerik
    }
  }

  // Jika semua risk levels kosong → default ke numeric (untuk compatibility)
  const allEmpty = levelKeys.every((key) => !riskLevels[key]);
  if (allEmpty) return true;

  // Default → text murni
  return false;
};

/**
 * Helper untuk format display hasil
 */
export const formatHasil = (value, isPercent = false, decimals = 4) => {
  if (value === '' || value == null) return '';

  const n = Number(value);
  if (!isFinite(n) || isNaN(n)) return '';

  if (isPercent) {
    const pct = n * 100;
    return Number.isInteger(pct) ? pct.toLocaleString('en-US') + '%' : pct.toFixed(2).replace(/\.?0+$/, '') + '%';
  }

  const fixed = n.toFixed(decimals);
  return fixed.replace(/\.?0+$/, '');
};

/**
 * Export all functions
 */
export default {
  parseRiskValue,
  evaluateRiskCondition,
  calculatePeringkat,
  calculatePeringkatFromText,
  isNumericRiskLevels,
  formatHasil,
};
