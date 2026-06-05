// src/modules/ringkasan/dto/ringkasan.dto.ts

export class RingkasanQueryDto {
  year: number;
  quarter: number;
  categoryIds: string[];
  model?: string;
  prinsip?: string;
  jenis?: string;
  underlying?: string[];
}

export class KategoriDto {
  model: string;
  prinsip: string;
  jenis: string;
  underlying: string[];
}

export class NilaiItemDto {
  id: string;
  nomor?: string;
  bobot: number;
  portofolio: number;
  judul: {
    text: string;
    pembilang: string;
    penyebut: string;
    type: string;
    value?: string | number | null;
    valuePembilang?: string | number | null;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };
  derived?: {
    weighted: number;
    riskLevel: number;
    hasilDisplay: string;
  };
}

export class SummaryItemDto {
  id: string;
  nomor?: string;
  judul: string;
  bobot: number;
  kategori: KategoriDto;
  nilaiList?: NilaiItemDto[];
}

export class PageDataDto {
  no: number;
  categoryId: string;
  categoryLabel: string;
  categoryCode: string;
  rows: SummaryItemDto[];
  totalWeighted: number;
  hasData: boolean;
  error?: string;
}
