// src/entities/repository/risk-profile-repository-ojk.entity.ts
import {
  PrimaryGeneratedColumn,
  ViewEntity,
  ViewColumn,
  Index,
} from 'typeorm';

export enum ModuleTypeOjk {
  PASAR = 'PASAR',
  LIKUIDITAS = 'LIKUIDITAS',
  OPERASIONAL = 'OPERASIONAL',
  HUKUM = 'HUKUM',
  STRATEGIK = 'STRATEGIK',
  KEPATUHAN = 'KEPATUHAN',
  REPUTASI = 'REPUTASI',
  KONSENTRASI = 'KONSENTRASI',
  KREDIT = 'KREDIT',
  PERMODALAN = 'PERMODALAN',
  RENTABILITAS = 'RENTABILITAS',
  TATAKELOLA = 'TATAKELOLA',
  INVESTASI = 'INVESTASI',
}

export enum CalculationMode {
  RASIO = 'RASIO',
  NILAI_TUNGGAL = 'NILAI_TUNGGAL',
  TEKS = 'TEKS',
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

@ViewEntity({
  name: 'risk_profile_repository_ojk_view',
  expression: `
    -- 1. PASAR
    SELECT 'PASAR', p.id, h.year, h.quarter, p.parameter_id, pp.nomor, pp.judul, pp.bobot,
      p.nomor, JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.text')), p.bobot, p.portofolio, p.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(p.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(p.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(p.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(p.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(p.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(p.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(p.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, p.created_at, p.updated_at, pp.judul, NULL
    FROM pasar_produk_nilai_ojk p
    LEFT JOIN pasar_produk_parameters_ojk pp ON p.parameter_id = pp.id
    LEFT JOIN pasar_produk_ojk h ON pp.pasar_produk_ojk_id = h.id
    
    UNION ALL
    -- 2. LIKUIDITAS
    SELECT 'LIKUIDITAS', l.id, h2.year, h2.quarter, l.parameter_id, lp.nomor, lp.judul, lp.bobot,
      l.nomor, JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.text')), l.bobot, l.portofolio, l.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(l.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(l.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(l.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(l.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(l.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(l.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(l.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, l.created_at, l.updated_at, lp.judul, NULL
    FROM likuiditas_nilai_ojk l
    LEFT JOIN likuiditas_parameters_ojk lp ON l.parameter_id = lp.id
    LEFT JOIN likuiditas_ojk h2 ON lp.likuiditas_ojk_id = h2.id
    
    UNION ALL
    -- 3. OPERASIONAL
    SELECT 'OPERASIONAL', o.id, h3.year, h3.quarter, o.parameter_id, op.nomor, op.judul, op.bobot,
      o.nomor, JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.text')), o.bobot, o.portofolio, o.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(o.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(o.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(o.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(o.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(o.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(o.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(o.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, o.created_at, o.updated_at, op.judul, NULL
    FROM operasional_nilai_ojk o
    LEFT JOIN operasional_parameters_ojk op ON o.parameter_id = op.id
    LEFT JOIN operasional_ojk h3 ON op.operasional_ojk_id = h3.id
    
    UNION ALL
    -- 4. HUKUM
    SELECT 'HUKUM', h.id, h4.year, h4.quarter, h.parameter_id, hp.nomor, hp.judul, hp.bobot,
      h.nomor, JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.text')), h.bobot, h.portofolio, h.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(h.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(h.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(h.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(h.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(h.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(h.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(h.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, h.created_at, h.updated_at, hp.judul, NULL
    FROM hukum_nilai_ojk h
    LEFT JOIN hukum_parameters_ojk hp ON h.parameter_id = hp.id
    LEFT JOIN hukum_ojk h4 ON hp.hukum_ojk_id = h4.id
    
    UNION ALL
    -- 5. STRATEGIK
    SELECT 'STRATEGIK', s.id, h5.year, h5.quarter, s.parameter_id, sp.nomor, sp.judul, sp.bobot,
      s.nomor, JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.text')), s.bobot, s.portofolio, s.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(s.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(s.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(s.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(s.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(s.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(s.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(s.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, s.created_at, s.updated_at, sp.judul, NULL
    FROM strategis_nilai_ojk s
    LEFT JOIN strategis_parameters_ojk sp ON s.parameter_id = sp.id
    LEFT JOIN strategis_ojk h5 ON sp.strategis_ojk_id = h5.id
    
    UNION ALL
    -- 6. KEPATUHAN
    SELECT 'KEPATUHAN', k.id, h6.year, h6.quarter, k.parameter_id, kp.nomor, kp.judul, kp.bobot,
      k.nomor, JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.text')), k.bobot, k.portofolio, k.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(k.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(k.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(k.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(k.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(k.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(k.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(k.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, k.created_at, k.updated_at, kp.judul, NULL
    FROM kepatuhan_nilai_ojk k
    LEFT JOIN kepatuhan_parameters_ojk kp ON k.parameter_id = kp.id
    LEFT JOIN kepatuhan_ojk h6 ON kp.kepatuhan_ojk_id = h6.id
    
    UNION ALL
    -- 7. REPUTASI
    SELECT 'REPUTASI', r.id, h7.year, h7.quarter, r.parameter_id, rp.nomor, rp.judul, rp.bobot,
      r.nomor, JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.text')), r.bobot, r.portofolio, r.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(r.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(r.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(r.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(r.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(r.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(r.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(r.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, r.created_at, r.updated_at, rp.judul, NULL
    FROM reputasi_nilai_ojk r
    LEFT JOIN reputasi_parameters_ojk rp ON r.parameter_id = rp.id
    LEFT JOIN reputasi_ojk h7 ON rp.reputasi_ojk_id = h7.id
    
    UNION ALL
    -- 8. KONSENTRASI
    SELECT 'KONSENTRASI', ko.id, h8.year, h8.quarter, ko.parameter_id, kop.nomor, kop.judul, kop.bobot,
      ko.nomor, JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.text')), ko.bobot, ko.portofolio, ko.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(ko.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(ko.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(ko.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(ko.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(ko.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(ko.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(ko.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, ko.created_at, ko.updated_at, kop.judul, NULL
    FROM konsentrasi_nilai_ojk ko
    LEFT JOIN konsentrasi_parameters_ojk kop ON ko.parameter_id = kop.id
    LEFT JOIN konsentrasi_produk_ojk h8 ON kop.konsentrasi_ojk_id = h8.id
    
    UNION ALL
    -- 9. KREDIT
    SELECT 'KREDIT', kr.id, h9.year, h9.quarter, kr.parameter_id, krp.nomor, krp.judul, krp.bobot,
      kr.nomor, JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.text')), kr.bobot, kr.portofolio, kr.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(kr.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(kr.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(kr.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(kr.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(kr.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(kr.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(kr.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, kr.created_at, kr.updated_at, krp.judul, NULL
    FROM kredit_nilai_ojk kr
    LEFT JOIN kredit_parameters_ojk krp ON kr.parameter_id = krp.id
    LEFT JOIN kredit_produk_ojk h9 ON krp.kredit_ojk_id = h9.id
    
    UNION ALL
    -- 10. PERMODALAN
    SELECT 'PERMODALAN', pm.id, h10.year, h10.quarter, pm.parameter_id, pmp.nomor, pmp.judul, pmp.bobot,
      pm.nomor, JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.text')), pm.bobot, pm.portofolio, pm.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(pm.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(pm.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(pm.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(pm.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(pm.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(pm.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(pm.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, pm.created_at, pm.updated_at, pmp.judul, NULL
    FROM permodalan_nilai_ojk pm
    LEFT JOIN permodalan_parameters_ojk pmp ON pm.parameter_id = pmp.id
    LEFT JOIN permodalan_ojk h10 ON pmp.permodalan_ojk_id = h10.id
    
    UNION ALL
    -- 11. RENTABILITAS
    SELECT 'RENTABILITAS', rb.id, h11.year, h11.quarter, rb.parameter_id, rbp.nomor, rbp.judul, rbp.bobot,
      rb.nomor, JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.text')), rb.bobot, rb.portofolio, rb.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(rb.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(rb.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(rb.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(rb.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(rb.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(rb.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(rb.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, rb.created_at, rb.updated_at, rbp.judul, NULL
    FROM rentabilitas_nilai_ojk rb
    LEFT JOIN rentabilitas_parameters_ojk rbp ON rb.parameter_id = rbp.id
    LEFT JOIN rentabilitas_ojk h11 ON rbp.rentabilitas_ojk_id = h11.id
    
    UNION ALL
    -- 12. TATAKELOLA
    SELECT 'TATAKELOLA', t.id, h12.year, h12.quarter, t.parameter_id, tp.nomor, tp.judul, tp.bobot,
      t.nomor, JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.text')), t.bobot, t.portofolio, t.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(t.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(t.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(t.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(t.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(t.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(t.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(t.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, t.created_at, t.updated_at, tp.judul, NULL
    FROM tatakelola_nilai_ojk t
    LEFT JOIN tatakelola_parameters_ojk tp ON t.parameter_id = tp.id
    LEFT JOIN tatakelola_ojk h12 ON tp.tatakelola_ojk_id = h12.id
    
    UNION ALL
    -- 13. INVESTASI
    SELECT 'INVESTASI', i.id, h13.year, h13.quarter, i.parameter_id, ip.nomor, ip.judul, ip.bobot,
      i.nomor, JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.text')), i.bobot, i.portofolio, i.keterangan,
      JSON_UNQUOTE(JSON_EXTRACT(i.riskindikator, '$.low')), JSON_UNQUOTE(JSON_EXTRACT(i.riskindikator, '$.lowToModerate')),
      JSON_UNQUOTE(JSON_EXTRACT(i.riskindikator, '$.moderate')), JSON_UNQUOTE(JSON_EXTRACT(i.riskindikator, '$.moderateToHigh')),
      JSON_UNQUOTE(JSON_EXTRACT(i.riskindikator, '$.high')),
      JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.type')), JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.formula')),
      COALESCE(JSON_EXTRACT(i.judul, '$.percent'), 'false') = 'true',
      JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.pembilang')), CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.valuePembilang')), JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.value'))) AS DECIMAL(20,4)),
      JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.penyebut')), CAST(JSON_UNQUOTE(JSON_EXTRACT(i.judul, '$.valuePenyebut')) AS DECIMAL(20,4)),
      NULL, NULL, 0, 0, NULL, FALSE, i.created_at, i.updated_at, ip.judul, NULL
    FROM investasi_nilai_ojk i
    LEFT JOIN investasi_parameters_ojk ip ON i.parameter_id = ip.id
    LEFT JOIN investasi_ojk h13 ON ip.investasi_ojk_id = h13.id
  `,
})
@Index('IDX_REPOSITORY_OJK_MODULE', ['moduleType'])
@Index('IDX_REPOSITORY_OJK_PERIOD', ['year', 'quarter'])
@Index('IDX_REPOSITORY_OJK_YEAR_QUARTER_MODULE', ['year', 'quarter', 'moduleType'])
export class RiskProfileRepositoryOjkView {
  @ViewColumn() moduleType: ModuleTypeOjk;
  @PrimaryGeneratedColumn() id: number;
  @ViewColumn() year: number;
  @ViewColumn() quarter: Quarter;
  @ViewColumn() sectionId: number;
  @ViewColumn() no: string;
  @ViewColumn() sectionLabel: string;
  @ViewColumn() bobotSection: number;
  @ViewColumn() subNo: string;
  @ViewColumn() indikator: string;
  @ViewColumn() bobotIndikator: number;
  @ViewColumn() sumberRisiko: string | null;
  @ViewColumn() dampak: string | null;
  @ViewColumn() low: string | null;
  @ViewColumn() lowToModerate: string | null;
  @ViewColumn() moderate: string | null;
  @ViewColumn() moderateToHigh: string | null;
  @ViewColumn() high: string | null;
  @ViewColumn() mode: string;
  @ViewColumn() formula: string | null;
  @ViewColumn() isPercent: boolean;
  @ViewColumn() pembilangLabel: string | null;
  @ViewColumn() pembilangValue: number | null;
  @ViewColumn() penyebutLabel: string | null;
  @ViewColumn() penyebutValue: number | null;
  @ViewColumn() hasil: number | null;
  @ViewColumn() hasilText: string | null;
  @ViewColumn() peringkat: number;
  @ViewColumn() weighted: number;
  @ViewColumn() keterangan: string | null;
  @ViewColumn() isValidated: boolean;
  @ViewColumn() createdAt: Date;
  @ViewColumn() updatedAt: Date;
  @ViewColumn() parameter: string;
  @ViewColumn() sectionDescription: string | null;
}