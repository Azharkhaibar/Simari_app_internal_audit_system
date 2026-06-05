// src/audit-log/services/audit-log.services.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5530/api/v1';

// ==================== TYPES ====================

interface AuditLogPayload {
  action: string;
  module: string;
  description: string;
  endpoint?: string;
  ip_address?: string;
  isSuccess?: boolean;
  userId?: number | null;
  metadata?: Record<string, unknown>;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  start_date?: string;
  end_date?: string;
}

interface User {
  user_id: number;
  userID: string;
  role: string;
  gender: string;
}

interface AuditLog {
  id: number;
  userId: number | null;
  user: User | null;
  action: string;
  module: string;
  description: string;
  endpoint: string | null;
  ip_address: string;
  isSuccess: boolean;
  timestamp: string;
  metadata: any;
}

interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DeleteMultipleResponse {
  message: string;
  deletedCount: number;
}

interface AuditLogStats {
  today: Array<{ action: string; count: string }>;
  week: Array<{ action: string; count: string }>;
  month: Array<{ action: string; count: string }>;
  modules: string[];
}

interface ExportResponse {
  success: boolean;
  data: AuditLog[];
  total: number;
  exportedAt: string;
  filters: PaginationParams;
}

// ==================== SERVICE CLASS ====================

class AuditLogService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - attach auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request untuk debugging (hanya di development)
        if (import.meta.env.DEV) {
          console.log(`📤 [AUDIT SERVICE] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ [AUDIT SERVICE] Request error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor - log response
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`📥 [AUDIT SERVICE] Response ${response.status} from ${response.config.url}`, {
            dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'N/A',
            total: response.data?.total,
          });
        }
        return response;
      },
      (error) => {
        console.error('❌ [AUDIT SERVICE] Response error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });
        return Promise.reject(error);
      },
    );
  }

  // ==================== CREATE ====================

  /**
   * Create audit log entry
   */
  async createAuditLog(auditLogData: AuditLogPayload): Promise<any> {
    try {
      // Get userId from JWT token stored in localStorage
      // Token key is 'access_token', JWT payload is { sub: user_id, userID: "ADM001", role: "ADMIN" }
      let userId: number | null = null;

      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Decode JWT payload (base64url)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            const jwtPayload = JSON.parse(payloadJson);
            // JWT payload: { sub: numeric_user_id, userID: "ADM001", role: "ADMIN" }
            if (jwtPayload.sub != null) {
              userId = Number(jwtPayload.sub);
            }
          }
        }
      } catch (tokenError) {
        console.warn('⚠️ [AUDIT SERVICE] Could not extract userId from token:', tokenError);
      }

      if (import.meta.env.DEV) {
        console.log('🔍 [AUDIT SERVICE] Extracted userId from JWT:', userId);
      }

      // Build payload matching CreateAuditLogDto
      const payload = {
        action: auditLogData.action,
        module: auditLogData.module,
        description: auditLogData.description,
        endpoint: auditLogData.endpoint || window.location.pathname,
        ip_address: auditLogData.ip_address || (await this.getClientIP()),
        isSuccess: auditLogData.isSuccess ?? true,
        // Use explicitly passed userId first (if it's a valid number), fallback to JWT-extracted userId
        userId: (auditLogData.userId != null && !isNaN(Number(auditLogData.userId))) ? Number(auditLogData.userId) : userId,
        metadata: auditLogData.metadata || null,
      };

      if (import.meta.env.DEV) {
        console.log('📝 [AUDIT SERVICE] Creating audit log payload:', payload);
      }

      const response = await this.api.post('/audit-logs', payload);

      if (import.meta.env.DEV) {
        console.log('✅ [AUDIT SERVICE] Audit log created successfully:', {
          id: response.data?.id,
          module: response.data?.module,
          action: response.data?.action,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ [AUDIT SERVICE] Failed to create audit log:', {
        message: error.message,
        response: error.response?.data,
      });
      // Don't throw - audit log failure shouldn't break the app
      return null;
    }
  }

  /**
   * Get client IP address using external service
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000),
        mode: 'cors',
      });

      if (response.ok) {
        const data = await response.json();
        return data.ip || 'unknown';
      }
      return 'unknown';
    } catch (error) {
      console.warn('⚠️ [AUDIT SERVICE] Could not detect client IP:', error);
      return 'unknown';
    }
  }

  // ==================== READ ====================

  /**
   * Get audit logs with pagination & filters
   */
  async getAuditLogs(params: PaginationParams = {}): Promise<AuditLogListResponse> {
    try {
      // Build query params, hanya kirim yang ada nilainya
      const queryParams: Record<string, any> = {};
      
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
      if (params.action) queryParams.action = params.action;
      if (params.module) queryParams.module = params.module;
      if (params.start_date) queryParams.start_date = params.start_date;
      if (params.end_date) queryParams.end_date = params.end_date;

      const response = await this.api.get('/audit-logs', { params: queryParams });

      const responseData = response.data;

      const normalizedResponse: AuditLogListResponse = {
        data: responseData.data || [],
        total: responseData.total || 0,
        page: responseData.page || params.page || 1,
        limit: responseData.limit || params.limit || 20,
        totalPages: responseData.totalPages || Math.ceil((responseData.total || 0) / (params.limit || 20)),
      };

      return normalizedResponse;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get audit log statistics
   */
  async getAuditLogStats(): Promise<AuditLogStats> {
    try {
      const response = await this.api.get('/audit-logs/stats');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(params: PaginationParams = {}): Promise<ExportResponse> {
    try {
      const queryParams: Record<string, any> = {};
      if (params.start_date) queryParams.start_date = params.start_date;
      if (params.end_date) queryParams.end_date = params.end_date;
      if (params.action) queryParams.action = params.action;
      if (params.module) queryParams.module = params.module;
      if (params.search) queryParams.search = params.search;

      const response = await this.api.get('/audit-logs/export', { params: queryParams });

      // Backend returns JSON with success, data, total, exportedAt, filters
      const responseData = response.data;

      return {
        success: responseData.success || true,
        data: responseData.data || [],
        total: responseData.total || 0,
        exportedAt: responseData.exportedAt || new Date().toISOString(),
        filters: responseData.filters || params,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== DELETE ====================

  /**
   * Delete single audit log by ID
   */
  async deleteAuditLog(logId: number): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(`/audit-logs/${logId}`);
      return response.data;
    } catch (err: any) {
      throw this.handleError(err);
    }
  }

  /**
   * Delete multiple audit logs by IDs
   */
  async deleteMultipleAuditLogs(logsIds: number[]): Promise<DeleteMultipleResponse> {
    try {
      const response = await this.api.delete('/audit-logs/batch/delete', {
        data: { ids: logsIds },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete audit logs by filter criteria
   */
  async deleteByFilter(filters: {
    start_date?: string;
    end_date?: string;
    action?: string;
    module?: string;
  }): Promise<DeleteMultipleResponse> {
    try {
      const queryParams: Record<string, any> = {};
      if (filters.start_date) queryParams.start_date = filters.start_date;
      if (filters.end_date) queryParams.end_date = filters.end_date;
      if (filters.action) queryParams.action = filters.action;
      if (filters.module) queryParams.module = filters.module;

      const response = await this.api.delete('/audit-logs/filter/delete', {
        params: queryParams,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete ALL audit logs
   */
  async deleteAllAuditLogs(): Promise<DeleteMultipleResponse> {
    try {
      const response = await this.api.delete('/audit-logs/all/delete');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== ERROR HANDLER ====================

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;

        switch (status) {
          case 400:
            return new Error(serverMessage || 'Permintaan tidak valid');
          case 401:
            // ✅ PERBAIKAN: Hapus semua kemungkinan token key
            localStorage.removeItem('access_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            return new Error('Sesi telah berakhir, silakan login kembali');
          case 403:
            return new Error('Anda tidak memiliki akses');
          case 404:
            return new Error('Data tidak ditemukan');
          case 500:
            return new Error(serverMessage || 'Terjadi kesalahan pada server');
          default:
            return new Error(serverMessage || `Terjadi kesalahan (${status})`);
        }
      } else if (error.request) {
        return new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        return new Error(error.message || 'Terjadi kesalahan dalam mengirim permintaan');
      }
    } else if (error instanceof Error) {
      return error;
    } else {
      return new Error('Terjadi kesalahan yang tidak diketahui');
    }
  }
}

// Export singleton instance
export default new AuditLogService();

// Export types
export type {
  AuditLogPayload,
  PaginationParams,
  User,
  AuditLog,
  AuditLogListResponse,
  DeleteMultipleResponse,
  AuditLogStats,
  ExportResponse,
};