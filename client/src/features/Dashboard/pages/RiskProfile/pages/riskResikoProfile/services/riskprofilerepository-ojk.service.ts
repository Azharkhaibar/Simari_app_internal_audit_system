// src/features/Dashboard/pages/RiskProfile/services/riskprofilerepository-ojk.service.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Service untuk Risk Profile Repository OJK
 * Backend sudah menambahkan prefix /api/v1 di main.ts
 */
class RiskProfileRepositoryOjkService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/risk-profile-repository-ojk`;
  }

  /**
   * Get repository data dengan filter dan pagination
   */
  async getRepositoryData({ year, quarter, moduleTypes, searchQuery, page = 1, limit = 100 }) {
    try {
      const params = new URLSearchParams();
      
      if (year) params.append('year', year);
      if (quarter) params.append('quarter', quarter);
      
      if (moduleTypes && moduleTypes.length > 0) {
        moduleTypes.forEach(m => params.append('moduleTypes[]', m));
      }
      
      if (searchQuery) params.append('searchQuery', searchQuery);
      
      params.append('page', page);
      params.append('limit', limit);

      const url = `${this.baseUrl}?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
        timeout: 30000, // 30 detik timeout
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(year, quarter) {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (quarter) params.append('quarter', quarter);

      const response = await axios.get(`${this.baseUrl}/statistics?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
        timeout: 30000,
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get available modules
   */
  async getAvailableModules() {
    try {
      const response = await axios.get(`${this.baseUrl}/modules`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get available periods
   */
  async getAvailablePeriods() {
    try {
      const response = await axios.get(`${this.baseUrl}/periods`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Centralized error handler
   */
  handleError(error) {
    console.error('❌ [OJK Service] Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data?.message || 'Bad Request - Periksa parameter filter');
        case 401:
          throw new Error('Unauthorized - Silakan login kembali');
        case 403:
          throw new Error('Forbidden - Anda tidak memiliki akses');
        case 404:
          throw new Error('Data tidak ditemukan');
        case 500:
          throw new Error('Internal Server Error - Silakan coba lagi');
        default:
          throw new Error(data?.message || `HTTP Error ${status}`);
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - Server tidak merespon');
    }
    
    if (error.request) {
      throw new Error('Tidak dapat terhubung ke server - Periksa koneksi');
    }
    
    throw error;
  }
}

// Singleton instance
export const riskProfileRepositoryOjkService = new RiskProfileRepositoryOjkService();

// Default export
export default riskProfileRepositoryOjkService;