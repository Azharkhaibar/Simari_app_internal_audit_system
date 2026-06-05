// peringkat-komposit.service.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5530/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ==================== TYPES ====================
export interface PeringkatKompositQueryParams {
  year: number;
  quarter: number;
}

export interface PeringkatKompositItem {
  id: string;
  nama: string;
  inherentSummary: number;
  kpmrSummary: number;
}

// ==================== API SERVICE ====================
export const peringkatKompositApiService = {
  async getPeringkatKomposit(params: PeringkatKompositQueryParams): Promise<PeringkatKompositItem[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('year', String(params.year));
      queryParams.append('quarter', String(params.quarter));

      const url = `/peringkat-komposit?${queryParams.toString()}`;
      console.log(`📡 [PeringkatKomposit API] Fetching: ${url}`);

      const response = await apiClient.get<PeringkatKompositItem[]>(url);
      console.log(`✅ [PeringkatKomposit API] Response: ${response.data?.length} categories`);
      return response.data;
    } catch (error) {
      console.error('❌ [PeringkatKomposit API] Error:', error);
      return [];
    }
  },
};

export default peringkatKompositApiService;
