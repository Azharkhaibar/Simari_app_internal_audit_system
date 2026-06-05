export function computeFormula(formula, ctx = {}) {
  if (!formula) return '';

  try {
    const fn = new Function(...Object.keys(ctx), `return ${formula}`);

    return fn(...Object.values(ctx));
  } catch (err) {
    console.warn('Formula error:', formula, err);
    return '';
  }
}
