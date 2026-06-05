// rekap-data-2.service.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5530/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ==================== TYPES ====================
export interface RekapData2QueryParams {
  year: number;
  quarter: number;
}

// SESUAI BACKEND: CategorySummaryDto (ARRAY LANGSUNG)
export interface CategorySummary {
  id: string;
  nama: string;
  inherentSummary: number;
  kpmrSummary: number;
}

// ==================== API SERVICE ====================
export const rekapData2ApiService = {
  async getRekapData(params: RekapData2QueryParams): Promise<CategorySummary[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('year', String(params.year));
      queryParams.append('quarter', String(params.quarter));

      const url = `/rekap-data-2?${queryParams.toString()}`;
      console.log(`📡 [RekapData2 API] Fetching: ${url}`);

      // Backend kirim ARRAY LANGSUNG: CategorySummary[]
      const response = await apiClient.get<CategorySummary[]>(url);

      console.log(`✅ [RekapData2 API] Response: ${response.data?.length} categories`);
      return response.data;
    } catch (error) {
      console.error('❌ [RekapData2 API] Error:', error);
      return []; // Return empty array, jangan throw
    }
  },
};

export default rekapData2ApiService;
