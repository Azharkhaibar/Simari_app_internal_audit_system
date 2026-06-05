// src/services/riskProfileRepositoryService.ts
import axios from 'axios';
// import { ModuleType, Quarter, CalculationMode } from '../types/riskProfileRepository.types';

import { ModuleType, Quarter, CalculationMode } from '../types/riskprofilerepository.types';

const API_BASE_URL = 'http://localhost:5530/api/v1';

export interface RepositoryFilters {
  year?: number;
  quarter?: Quarter;
  moduleTypes?: ModuleType[];
  searchQuery?: string;
  isValidated?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RepositoryStatistics {
  totalModules: number;
  totalIndicators: number;
  totalWeighted: number;
  byModule: Array<{
    module: string;
    count: number;
    totalWeighted: number;
    averageWeighted: number;
  }>;
  byQuarter: Array<{
    quarter: Quarter;
    count: number;
    totalWeighted: number;
  }>;
  validationStatus: {
    validated: number;
    notValidated: number;
  };
}

export interface RepositoryResponse {
  data: RiskProfileRepositoryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statistics: {
    totalModules: number;
    totalIndicators: number;
    totalWeighted: number;
    moduleBreakdown: Array<{
      module: string;
      count: number;
      totalWeighted: number;
    }>;
  };
}

export interface RiskProfileRepositoryDto {
  id: number;
  moduleType: ModuleType;
  moduleName: string;
  year: number;
  quarter: Quarter;
  no: string;
  bobotSection: number;
  parameter: string;
  sectionDescription: string | null;
  subNo: string;
  indikator: string;
  bobotIndikator: number;
  sumberRisiko: string | null;
  dampak: string | null;
  low: string | null;
  lowToModerate: string | null;
  moderate: string | null;
  moderateToHigh: string | null;
  high: string | null;
  mode: CalculationMode;
  formula: string | null;
  isPercent: boolean;
  pembilangLabel: string | null;
  pembilangValue: number | null;
  penyebutLabel: string | null;
  penyebutValue: number | null;
  hasil: number | null;
  hasilText: string | null;
  peringkat: number;
  weighted: number;
  keterangan: string | null;
  isValidated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleInfo {
  code: ModuleType;
  name: string;
  color: string;
}

export interface AvailablePeriod {
  year: number;
  quarters: Quarter[];
}

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

class RiskProfileRepositoryService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/risk-profile-repository`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private ojkApi = axios.create({
    baseURL: `${API_BASE_URL}/risk-profile-repository-ojk`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Get all repository data with filtering and pagination
   */
  async getRepositoryData(filters: RepositoryFilters, pagination: PaginationOptions): Promise<RepositoryResponse> {
    try {
      const params = this.buildQueryParams(filters, pagination);
      const response = await this.api.get<RepositoryResponse>('', { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch repository data');
    }
  }

  /**
   * Get repository data by specific module
   */
  async getRepositoryDataByModule(module: ModuleType, filters: RepositoryFilters, pagination: PaginationOptions): Promise<RepositoryResponse> {
    try {
      const params = this.buildQueryParams(filters, pagination);
      const response = await this.api.get<RepositoryResponse>(`module/${module}`, { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error, `Failed to fetch data for module: ${module}`);
    }
  }

  /**
   * Search across all modules
   */
  async searchRepositoryData(query: string, filters: RepositoryFilters, pagination: PaginationOptions): Promise<RepositoryResponse> {
    try {
      const params = this.buildQueryParams(filters, pagination);
      params.searchQuery = query;

      const response = await this.api.get<RepositoryResponse>('search', { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'Failed to search repository data');
    }
  }

  /**
   * Get repository statistics for a period
   */
  async getRepositoryStatistics(year: number, quarter: Quarter): Promise<RepositoryStatistics> {
    try {
      const response = await this.api.get<RepositoryStatistics>('statistics', {
        params: { year, quarter },
      });
      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch repository statistics');
    }
  }

  /**
   * Export repository data
   */
  async exportRepositoryData(filters: RepositoryFilters, format: 'csv' = 'csv'): Promise<void> {
    try {
      const params = this.buildQueryParams(filters);

      const response = await this.api.get('/export', {
        params: { ...params, format },
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or generate default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'risk-profile-export.csv';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      this.handleError(error, 'Failed to export repository data');
    }
  }

  /**
   * Get list of available modules
   */
  async getAvailableModules(): Promise<ModuleInfo[]> {
    try {
      const response = await this.api.get<{ modules: ModuleInfo[] }>('modules');
      return response.data.modules;
    } catch (error: any) {
      console.error('Failed to fetch available modules:', error);
      return [];
    }
  }

  /**
   * Get available periods in repository
   */
  async getAvailablePeriods(): Promise<AvailablePeriod[]> {
    try {
      const response = await this.api.get<AvailablePeriod[]>('periods');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch available periods:', error);
      return [];
    }
  }

  /**
   * Download CSV export (alias untuk exportRepositoryData)
   */
  async downloadCsvExport(filters: RepositoryFilters): Promise<void> {
    return this.exportRepositoryData(filters, 'csv');
  }

  /**
   * Get all OJK repository data with filtering and pagination
   */
  async getOjkRepositoryData(filters: any, pagination: any): Promise<any> {
    try {
      const params = this.buildQueryParams(filters, pagination);
      const response = await this.ojkApi.get('', { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch OJK repository data');
    }
  }

  /**
   * Get list of available OJK modules
   */
  async getOjkAvailableModules(): Promise<any[]> {
    try {
      const response = await this.ojkApi.get('modules');
      return response.data.modules;
    } catch (error: any) {
      console.error('Failed to fetch OJK available modules:', error);
      return [];
    }
  }

  /**
   * Get available periods in OJK repository
   */
  async getOjkAvailablePeriods(): Promise<any[]> {
    try {
      const response = await this.ojkApi.get('periods');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch OJK available periods:', error);
      return [];
    }
  }

  /**
   * Get OJK repository statistics for a period
   */
  async getOjkRepositoryStatistics(year: number, quarter: any): Promise<any> {
    try {
      const response = await this.ojkApi.get('statistics', {
        params: { year, quarter },
      });
      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch OJK repository statistics');
    }
  }

  // Private helper methods
  private buildQueryParams(filters: RepositoryFilters, pagination?: PaginationOptions): any {
    const params: any = {};

    // Add filters
    if (filters.year) params.year = filters.year;
    if (filters.quarter) params.quarter = filters.quarter;
    if (filters.moduleTypes?.length) {
      params.moduleTypes = Array.isArray(filters.moduleTypes) ? filters.moduleTypes : [filters.moduleTypes];
    }
    if (filters.searchQuery) params.searchQuery = filters.searchQuery;
    if (filters.isValidated !== undefined) params.isValidated = filters.isValidated;
    if (filters.startDate) params.startDate = filters.startDate.toISOString();
    if (filters.endDate) params.endDate = filters.endDate.toISOString();

    // Add pagination
    if (pagination) {
      params.page = pagination.page;
      params.limit = pagination.limit;
      if (pagination.sortBy) params.sortBy = pagination.sortBy;
      if (pagination.sortOrder) params.sortOrder = pagination.sortOrder;
    }

    return params;
  }

  private handleError(error: any, defaultMessage: string): never {
    console.error('API Error:', error);

    if (error.response) {
      const message = error.response.data?.message || defaultMessage;
      throw new Error(`${message} (${error.response.status})`);
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.message || defaultMessage);
    }
  }
}

export const riskProfileRepositoryService = new RiskProfileRepositoryService();
export default riskProfileRepositoryService;
