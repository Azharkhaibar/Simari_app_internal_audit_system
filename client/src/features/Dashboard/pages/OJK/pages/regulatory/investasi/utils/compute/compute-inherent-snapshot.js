import { computeDerived } from './computeDerived';

export function computeInherentSnapshot(rows = []) {
  const perParam = {};
  let summary = 0;

  rows.forEach((param) => {
    if (!param?.id) return;

    const nilaiList = Array.isArray(param.nilaiList) ? param.nilaiList : [];

    nilaiList.forEach((nilai) => {
      if (!nilai?.id) return;

      const derived = computeDerived(nilai, param);

      if (!perParam[param.id]) {
        perParam[param.id] = {};
      }

      perParam[param.id][nilai.id] = {
        hasil: derived.hasilDisplay ?? '',
        peringkat: derived.peringkat ?? null,
        weighted: derived.weighted ?? null,
      };

      if (Number.isFinite(derived.weighted)) {
        summary += derived.weighted;
      }
    });
  });

  return {
    perParam,
    summary: Number(summary.toFixed(2)),
    meta: {
      generatedAt: Date.now(),
    },
  };
}
