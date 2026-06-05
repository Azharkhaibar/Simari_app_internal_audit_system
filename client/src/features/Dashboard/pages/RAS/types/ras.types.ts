// src/types/ras.types.ts
export enum RiskStance {
  TIDAK_TOLERAN = 'Tidak Toleran',
  KONSERVATIF = 'Konservatif',
  MODERAT = 'Moderat',
  STRATEGIS = 'Strategis',
}

export enum UnitType {
  PERCENTAGE = 'PERCENTAGE',
  RUPIAH = 'RUPIAH',
  X = 'X',
  REAL = 'REAL',
  HOUR = 'HOUR',
}

export enum TindakLanjutStatus {
  ON_PROGRESS = 'On Progress',
  DONE = 'Done',
}

export type MonthlyValue = {
  num?: number | null;
  den?: number | null;
  man?: number | null;
  calculatedValue?: number | null;
};

export type TindakLanjut = {
  korektifOwner?: string;
  antisipasiOwner?: string;
  korektifSupport?: string;
  antisipasiSupport?: string;
  statusKorektifOwner?: TindakLanjutStatus;
  targetKorektifOwner?: string;
  statusAntisipasiOwner?: TindakLanjutStatus;
  targetAntisipasiOwner?: string;
  statusKorektifSupport?: TindakLanjutStatus;
  targetKorektifSupport?: string;
  statusAntisipasiSupport?: TindakLanjutStatus;
  targetAntisipasiSupport?: string;
};

export interface RasData {
  id: number;
  year: number;
  groupId?: string;
  riskCategory: string;
  no?: number;
  parameter: string;
  statement?: string;
  formulasi?: string;
  riskStance: RiskStance | string;
  unitType: UnitType | string;
  dataTypeExplanation?: string;
  notes?: string;
  rkapTarget?: string;
  rasLimit?: string;
  hasNumeratorDenominator: boolean;
  numeratorLabel?: string;
  denominatorLabel?: string;
  monthlyValues: Record<number, MonthlyValue>;
  tindakLanjut?: TindakLanjut | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRasDto {
  year: number;
  riskCategory: string;
  no?: number;
  parameter: string;
  statement?: string;
  formulasi?: string;
  riskStance: string;
  unitType: string;
  dataTypeExplanation?: string;
  notes?: string;
  rkapTarget?: string;
  rasLimit?: string;
  hasNumeratorDenominator: boolean;
  numeratorLabel?: string;
  denominatorLabel?: string;
  monthlyValues?: Record<number, MonthlyValue>;
  groupId?: string;
}

export interface UpdateRasDto extends Partial<CreateRasDto> {
  tindakLanjut?: TindakLanjut;
}

export interface FilterRasDto {
  year?: number;
  riskCategory?: string;
  search?: string;
  month?: number;
  hasTindakLanjut?: boolean;
}

export interface RasStats {
  n: number;
  avg: number;
  stdev: number;
  min: number;
  max: number;
  avg_min_1sd: number;
  avg_plus_1sd: number;
  avg_plus_2sd: number;
  avg_plus_3sd: number;
}

export interface YearlyRasData extends RasData {
  stats?: RasStats | null;
  historicalData?: {
    [key: number]: RasData | null;
  };
}
