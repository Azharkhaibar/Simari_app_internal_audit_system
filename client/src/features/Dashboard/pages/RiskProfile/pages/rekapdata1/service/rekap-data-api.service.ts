// src/services/rekap-data-api.service.ts
import axios from 'axios';

// ✅ URL API Backend NestJS
const API_BASE_URL = 'http://localhost:5530/api/v1';

export interface BhzConfig {
  id?: number;
  year: number;
  quarter: string;
  investasi: number;
  pasar: number;
  likuiditas: number;
  operasional: number;
  hukum: number;
  strategis: number;
  kepatuhan: number;
  reputasi: number;
}

export interface BvtConfig {
  id?: number;
  year: number;
  quarter: string;
  investasi: number;
  pasar: number;
  likuiditas: number;
  operasional: number;
  hukum: number;
  strategis: number;
  kepatuhan: number;
  reputasi: number;
}

export interface RiskDetail {
  label: string;
  inherent: number;
  kpmr: number;
  peringkat: number;
}

export interface RekapResult {
  year: number;
  quarter: string;
  kompositA: number;
  kompositB: number;
  totalPeringkat: number;
  riskDetails: RiskDetail[];
  createdBy?: string;
}

export const rekapDataAPI = {
  // ===================== GET ALL DATA =====================
  getAllData: (year: number, quarter: string) =>
    axios.get(`${API_BASE_URL}/rekap-data-1/all`, {
      params: { year, quarter },
    }),

  // ===================== BHz CONFIG =====================
  getBhz: (year: number, quarter: string) =>
    axios.get(`${API_BASE_URL}/rekap-data-1/bhz`, {
      params: { year, quarter },
    }),

  saveBhz: (data: BhzConfig) => axios.post(`${API_BASE_URL}/rekap-data-1/bhz`, data),

  // ===================== BVT CONFIG =====================
  getBvt: (year: number, quarter: string) =>
    axios.get(`${API_BASE_URL}/rekap-data-1/bvt`, {
      params: { year, quarter },
    }),

  saveBvt: (data: BvtConfig) => axios.post(`${API_BASE_URL}/rekap-data-1/bvt`, data),

  // ===================== REKAP RESULT =====================
  getResult: (year: number, quarter: string) =>
    axios.get(`${API_BASE_URL}/rekap-data-1/result`, {
      params: { year, quarter },
    }),

  saveResult: (data: RekapResult) => axios.post(`${API_BASE_URL}/rekap-data-1/result`, data),
};
