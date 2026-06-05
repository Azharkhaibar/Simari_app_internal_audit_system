import { INHERENT_RISK_INDICATORS, KPMR_RISK_INDICATORS } from '../contants/peringkat-komposit.contants';

export const getIndicatorNumber = (score) => {
  if (score === undefined || score === null || isNaN(score)) return 5;
  if (score >= 0 && score <= 1.5) return 1;
  if (score > 1.5 && score <= 2.5) return 2;
  if (score > 2.5 && score <= 3.5) return 3;
  if (score > 3.5 && score <= 4.5) return 4;
  return 5;
};

export const getRiskIndicator = (score, type = 'inherent') => {
  if (score === undefined || score === null) {
    const indicators = type === 'kpmr' ? KPMR_RISK_INDICATORS : INHERENT_RISK_INDICATORS;
    return { ...indicators[indicators.length - 1], score: 5 };
  }

  const indicators = type === 'kpmr' ? KPMR_RISK_INDICATORS : INHERENT_RISK_INDICATORS;

  for (const indicator of indicators) {
    if (score >= indicator.min && score <= indicator.max) return indicator;
  }

  const fallback = type === 'kpmr' ? KPMR_RISK_INDICATORS : INHERENT_RISK_INDICATORS;
  return { ...fallback[fallback.length - 1], score: 5 };
};

export const formatScore = (value) => {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num.toFixed(2);
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
