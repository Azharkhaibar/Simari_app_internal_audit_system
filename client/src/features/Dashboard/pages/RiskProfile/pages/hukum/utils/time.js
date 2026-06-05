export const getCurrentYear = () => new Date().getFullYear();

export const getCurrentQuarter = () => {
  const m = new Date().getMonth();
  if (m <= 2) return 'Q1';
  if (m <= 5) return 'Q2';
  if (m <= 8) return 'Q3';
  return 'Q4';
};
