// src/ojk/rekap/services/rekap-data1.service.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5530/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ [RekapData1 API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

// ==================== TYPES ====================
export interface RekapData1QueryParams {
  year?: number;
  quarter?: number;
}

export interface KategoriSummary {
  id: string;
  nama: string;
  inherentSummary: number;
  kpmrSummary: number;
}

export interface RekapData1Response {
  success: boolean;
  data: KategoriSummary[];
  totalCategories: number;
  message: string;
}

// ==================== API SERVICE ====================
export const rekapData1ApiService = {
  /**
   * Get summary data for RekapData1 (Inherent + KPMR per category)
   * @param params - Query parameters
   * @returns Summary data per category
   */
  async getSummaryData(params: RekapData1QueryParams = {}): Promise<RekapData1Response> {
    try {
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append('year', String(params.year));
      if (params.quarter) queryParams.append('quarter', String(params.quarter));

      const url = `/rekap1?${queryParams.toString()}`;
      console.log(`📡 [RekapData1 API] Fetching: ${url}`);

      const response = await apiClient.get<RekapData1Response>(url);

      console.log(`✅ [RekapData1 API] Response received:`, {
        success: response.data?.success,
        totalCategories: response.data?.totalCategories,
        dataCount: response.data?.data?.length,
      });

      return response.data;
    } catch (error) {
      console.error('❌ [RekapData1 API] Error:', error);
      throw error;
    }
  },
};

export default rekapData1ApiService;
