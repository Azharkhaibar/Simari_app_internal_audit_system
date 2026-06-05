// src/features/Dashboard/pages/RAS/service/rasService/ras.service.ts
import api_ras from '../rasApi.service';
import { CreateRasDto, UpdateRasDto, FilterRasDto, RasData, TindakLanjut } from '../../types/ras.types';

export interface ExportMonthlyParams {
  year: number;
  months: number[];
}

export interface ImportRasParams {
  year: number;
  data: any[];
  overrideExisting?: boolean;
  file?: File;
}

export const rasApi = {
  // ========== TEST CONNECTION ==========

  /**
   * Test koneksi ke backend
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    url?: string;
  }> {
    try {
      console.log('🔌 Testing connection to:', api_ras.defaults.baseURL);
      await api_ras.get('/');
      return {
        success: true,
        message: '✅ Berhasil terhubung ke server',
        url: api_ras.defaults.baseURL,
      };
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.message);
      return {
        success: false,
        message: `❌ Gagal terhubung: ${error.message}`,
        url: api_ras.defaults.baseURL,
      };
    }
  },

  // ========== CRUD OPERATIONS ==========

  /**
   * Get all RAS data dengan filter
   */
  async getAll(filter?: FilterRasDto): Promise<RasData[]> {
    try {
      const params = new URLSearchParams();

      if (filter?.year) params.append('year', filter.year.toString());
      if (filter?.riskCategory) params.append('riskCategory', filter.riskCategory);
      if (filter?.search) params.append('search', filter.search);
      if (filter?.month !== undefined) params.append('month', filter.month.toString());
      if (filter?.hasTindakLanjut !== undefined) {
        params.append('hasTindakLanjut', filter.hasTindakLanjut.toString());
      }

      const query = params.toString();
      const url = query ? `?${query}` : '';

      console.log('📡 Fetching RAS data:', url);

      const response = await api_ras.get(url);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching RAS data:', error.message);

      // Format error yang user-friendly
      let userMessage = 'Gagal mengambil data RAS';

      if (error.code === 'ERR_NETWORK') {
        userMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5530';
      } else if (error.response?.data?.message) {
        userMessage = error.response.data.message;
      }

      const formattedError = new Error(userMessage);
      (formattedError as any).originalError = error;
      throw formattedError;
    }
  },

  /**
   * Get RAS data by year (untuk yearly view)
   */
  async getByYear(year: number): Promise<RasData[]> {
    try {
      console.log(`📅 Fetching data for year ${year}`);
      const response = await api_ras.get(`/yearly/${year}`);
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching data for year ${year}:`, error.message);
      throw error;
    }
  },

  /**
   * Get RAS data by year and month (untuk monthly view)
   */
  async getByYearAndMonth(year: number, month?: number): Promise<RasData[]> {
    try {
      console.log(`📆 Fetching data for ${year}-${month}`);

      if (month !== undefined) {
        const response = await api_ras.get(`/monthly/${year}?month=${month}`);
        return response.data || [];
      } else {
        const response = await api_ras.get(`/monthly/${year}`);
        return response.data || [];
      }
    } catch (error: any) {
      console.error(`❌ Error fetching data for ${year}-${month}:`, error.message);
      throw error;
    }
  },

  /**
   * Get yearly statistics
   */
  async getYearlyStats(year: number): Promise<any[]> {
    try {
      const response = await api_ras.get(`/yearly-stats/${year}`);
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching stats for ${year}:`, error.message);
      throw error;
    }
  },

  /**
   * Get items needing follow-up
   */
  async getFollowUpItems(year: number, month: number): Promise<RasData[]> {
    try {
      const response = await api_ras.get(`/follow-up/${year}/${month}`);
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching follow-up items:`, error.message);
      throw error;
    }
  },

  /**
   * Get single RAS data by ID
   */
  async getById(id: string): Promise<RasData> {
    try {
      const response = await api_ras.get(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching data by ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Create new RAS data
   */
  async create(data: CreateRasDto): Promise<RasData> {
    try {
      console.log('➕ Creating new RAS data');
      const response = await api_ras.post('/', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating RAS data:', error.message);
      throw error;
    }
  },

  /**
   * Update RAS data
   */
  async update(id: string, data: UpdateRasDto): Promise<RasData> {
    try {
      console.log(`✏️ Updating data ID ${id}`);
      const response = await api_ras.patch(`/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error updating data ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Update monthly values
   */
  async updateMonthlyValues(id: string, month: number, values: { num?: number | null; den?: number | null; man?: number | null }): Promise<RasData> {
    try {
      console.log(`📝 Updating monthly values for ID ${id}, month ${month}`);
      const response = await api_ras.patch(`/${id}/monthly-values`, {
        month,
        ...values,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating monthly values:', error.message);
      throw error;
    }
  },

  /**
   * Update tindak lanjut
   */
  async updateTindakLanjut(id: string, tindakLanjut: TindakLanjut): Promise<RasData> {
    try {
      console.log(`📋 Updating tindak lanjut for ID ${id}`);
      const response = await api_ras.patch(`/${id}/tindak-lanjut`, tindakLanjut);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating tindak lanjut:', error.message);
      throw error;
    }
  },

  /**
   * Delete RAS data
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting data ID ${id}`);
      await api_ras.delete(`/${id}`);
    } catch (error: any) {
      console.error(`❌ Error deleting data ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Get risk categories
   */
  async getRiskCategories(): Promise<string[]> {
    try {
      console.log('🏷️ Fetching risk categories');
      const response = await api_ras.get('/categories');
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error.message);
      return []; // Return empty array instead of throwing
    }
  },

  /**
   * Export monthly data
   */
  async exportMonthly(params: ExportMonthlyParams): Promise<Blob> {
    try {
      const { year, months } = params;
      const monthsStr = months.join(',');

      console.log(`💾 Exporting data for ${year}, months: ${monthsStr}`);

      const response = await api_ras.get(`/export/monthly/${year}?months=${monthsStr}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error exporting data:', error.message);
      throw error;
    }
  },

  /**
   * Import data
   */
  async importData(params: ImportRasParams): Promise<RasData[]> {
    try {
      console.log(`📤 Importing data for year ${params.year}`);

      const formData = new FormData();
      formData.append('year', params.year.toString());
      formData.append('data', JSON.stringify(params.data));
      formData.append('overrideExisting', params.overrideExisting ? 'true' : 'false');

      if (params.file) {
        formData.append('file', params.file);
      }

      const response = await api_ras.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error importing data:', error.message);
      throw error;
    }
  },

  /**
   * Inline update field (untuk yearly table)
   */
  async inlineUpdate(id: string, field: string, value: any): Promise<RasData> {
    try {
      console.log(`⚡ Inline update: ${field} = ${value} for ID ${id}`);
      const updateData = { [field]: value };
      return await this.update(id, updateData);
    } catch (error: any) {
      console.error(`❌ Error inline updating ${field}:`, error.message);
      throw error;
    }
  },
};

// Utility functions
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  console.log(`📥 Downloaded: ${filename}`);
};

export const handleExportExcel = async (year: number, months: number[], filename: string = `RAS_${year}_${months.join('_')}.xlsx`) => {
  try {
    const blob = await rasApi.exportMonthly({ year, months });
    downloadFile(blob, filename);
    return true;
  } catch (error) {
    console.error('❌ Export to Excel error:', error);
    return false;
  }
};

export default rasApi;
