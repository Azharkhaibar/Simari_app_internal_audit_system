// src/ojk/rekap/utils/api/rekapApiService.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5530/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ [Rekap API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export interface RekapQueryParams {
  year?: number;
  quarter?: number;
  categories?: string[];
  search?: string;
  model?: string;
  prinsip?: string;
  jenis?: string;
  underlying?: string[];
}

export interface UpdateNilaiValueData {
  categoryId: string;
  paramId: number;
  itemId: number;
  value?: string | number | null;
  valuePembilang?: string | number | null;
  valuePenyebut?: string | number | null;
}

export interface RekapApiResponse<T = any> {
  success: boolean;
  data: T;
  totalCategories?: number;
  totalParameters?: number;
  message?: string;
}

export const rekapApiService = {
  async getAllRekapData(params: RekapQueryParams = {}): Promise<RekapApiResponse<Record<string, any[]>>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append('year', String(params.year));
      if (params.quarter) queryParams.append('quarter', String(params.quarter));
      if (params.search) queryParams.append('search', params.search);
      if (params.model) queryParams.append('model', params.model);
      if (params.prinsip) queryParams.append('prinsip', params.prinsip);
      if (params.jenis) queryParams.append('jenis', params.jenis);

      if (params.categories && params.categories.length > 0) {
        queryParams.append('categories', params.categories.join(','));
      }

      if (params.underlying && params.underlying.length > 0) {
        queryParams.append('underlying', params.underlying.join(','));
      }

      const url = `/rekap?${queryParams.toString()}`;
      console.log(`📡 [Rekap API] Fetching: ${url}`);

      const response = await apiClient.get<RekapApiResponse<Record<string, any[]>>>(url);
      console.log(`✅ [Rekap API] Response received:`, {
        success: response.data?.success,
        totalCategories: response.data?.totalCategories,
        totalParameters: response.data?.totalParameters,
      });

      return response.data;
    } catch (error) {
      console.error('❌ [Rekap API] Error fetching rekap data:', error);
      throw error;
    }
  },

  async getCategoryData(categoryId: string, params: Pick<RekapQueryParams, 'year' | 'quarter'> = {}): Promise<RekapApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.year) queryParams.append('year', String(params.year));
      if (params.quarter) queryParams.append('quarter', String(params.quarter));

      const url = `/rekap/${categoryId}?${queryParams.toString()}`;
      console.log(`📡 [Rekap API] Fetching category: ${url}`);

      const response = await apiClient.get<RekapApiResponse<any[]>>(url);
      return response.data;
    } catch (error) {
      console.error(`❌ [Rekap API] Error fetching category ${categoryId}:`, error);
      throw error;
    }
  },

  async updateNilaiValue(data: UpdateNilaiValueData): Promise<RekapApiResponse> {
    try {
      console.log(`📝 [Rekap API] Updating nilai:`, data);

      const response = await apiClient.put<RekapApiResponse>('/rekap/nilai', data);
      console.log(`✅ [Rekap API] Nilai updated:`, response.data);

      return response.data;
    } catch (error) {
      console.error('❌ [Rekap API] Error updating nilai:', error);
      throw error;
    }
  },

  async getAvailableCategories(): Promise<RekapApiResponse<{ id: string; label: string }[]>> {
    try {
      const response = await apiClient.get<RekapApiResponse<{ id: string; label: string }[]>>('/rekap/meta/categories');
      return response.data;
    } catch (error) {
      console.error('❌ [Rekap API] Error fetching categories:', error);
      throw error;
    }
  },
};

export default rekapApiService;
