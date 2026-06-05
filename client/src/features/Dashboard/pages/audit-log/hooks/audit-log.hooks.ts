// src/audit-log/hooks/audit-log.hook.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import auditLogServices from '../services/audit-log.services';

// ==================== TYPES ====================

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  start_date?: string;
  end_date?: string;
  action?: string;
  module?: string;
  search?: string;
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

// ==================== CONSTANTS ====================

const DEFAULT_PAGE_SIZE = 20;

// ==================== MAIN HOOK ====================

export const useAuditLog = () => {
  // ==================== STATE ====================
  
  // List state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  });
  
  // Stats state
  const [stats, setStats] = useState<AuditLogStats>({
    today: [],
    week: [],
    month: [],
    modules: [],
  });
  
  // Shared state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const currentFiltersRef = useRef<Filters>({});
  const currentPageRef = useRef<number>(1);
  const pendingRequests = useRef<Set<string>>(new Set());
  const initialStatsLoadDone = useRef<boolean>(false);

  // ==================== FETCH FUNCTIONS ====================

  /**
   * Fetch audit logs dari backend
   */
  const fetchAuditLogs = useCallback(
    async (page: number = 1, filters: Filters = {}): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Update refs
        currentPageRef.current = page;
        currentFiltersRef.current = filters;

        // Build query params - hanya kirim yang ada nilainya
        const queryParams: Record<string, any> = {
          page,
          limit: DEFAULT_PAGE_SIZE,
        };

        if (filters.search?.trim()) {
          queryParams.search = filters.search.trim();
        }
        if (filters.action) {
          queryParams.action = filters.action;
        }
        if (filters.module) {
          queryParams.module = filters.module;
        }
        if (filters.start_date) {
          queryParams.start_date = filters.start_date;
        }
        if (filters.end_date) {
          queryParams.end_date = filters.end_date;
        }

        console.log('📡 [AUDIT] Fetching audit logs with params:', queryParams);

        const response: AuditLogListResponse = await auditLogServices.getAuditLogs(queryParams);

        console.log('✅ [AUDIT] Response received:', {
          dataCount: response.data?.length || 0,
          total: response.total,
          page: response.page,
          totalPages: response.totalPages,
          hasOJKModules: response.data?.some((log) => log.module?.includes('OJK')),
          ojkModules: response.data
            ?.filter((log) => log.module?.includes('OJK'))
            .map((log) => log.module),
        });

        // Debug: log sample data
        if (response.data && response.data.length > 0) {
          const sample = response.data[0];
          console.log('📝 [AUDIT] Sample log:', {
            id: sample.id,
            module: sample.module,
            action: sample.action,
            userId: sample.userId,
            hasUser: !!sample.user,
            userID: sample.user?.userID,
            userRole: sample.user?.role,
          });
        }

        setAuditLogs(response.data || []);
        setTotal(response.total || 0);
        setPagination({
          page: response.page || 1,
          limit: response.limit || DEFAULT_PAGE_SIZE,
          totalPages: response.totalPages || 1,
        });
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat data audit';
        setError(errorMessage);
        console.error('❌ [AUDIT] Error fetching audit logs:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get audit log statistics
   */
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [AUDIT] Fetching stats...');

      const result = await auditLogServices.getAuditLogStats();

      console.log('✅ [AUDIT] Stats loaded:', {
        todayCount: result.today?.length || 0,
        weekCount: result.week?.length || 0,
        monthCount: result.month?.length || 0,
        modulesCount: result.modules?.length || 0,
        ojkModules: result.modules?.filter((m) => m.includes('OJK')) || [],
        holdingModules: result.modules?.filter((m) => !m.includes('OJK')) || [],
      });

      setStats({
        today: result.today || [],
        week: result.week || [],
        month: result.month || [],
        modules: result.modules || [],
      });

      initialStatsLoadDone.current = true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat statistik';
      setError(errorMessage);
      console.error('❌ [AUDIT] Error loading stats:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get audit logs (public wrapper)
   */
  const getAuditLogs = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    module?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<AuditLogListResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditLogServices.getAuditLogs(params);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get stats (public wrapper)
   */
  const getStats = useCallback(async (): Promise<AuditLogStats> => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditLogServices.getAuditLogStats();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export audit logs to Excel/JSON
   */
  const exportToExcel = useCallback(async (params: {
    start_date?: string;
    end_date?: string;
    action?: string;
    module?: string;
    search?: string;
  } = {}): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditLogServices.exportAuditLogs(params);
      
      // Create downloadable file from JSON data
      const jsonStr = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== LOG HELPER FUNCTIONS ====================

  /**
   * Generic log creator
   */
  const createLog = useCallback(
    async (logData: AuditLogPayload): Promise<any> => {
      const requestKey = `${logData.action}_${logData.module}_${Date.now()}`;
      
      // Avoid duplicate requests
      if (pendingRequests.current.has(requestKey)) {
        console.warn('⚠️ [AUDIT] Duplicate request detected, skipping:', requestKey);
        return null;
      }
      
      pendingRequests.current.add(requestKey);
      
      try {
        const result = await auditLogServices.createAuditLog(logData);
        return result;
      } catch (error) {
        console.error('❌ [AUDIT] Failed to create audit log:', error);
        return null;
      } finally {
        pendingRequests.current.delete(requestKey);
      }
    },
    []
  );

  /**
   * Log CREATE action
   * API: logCreate(module, description, { userId?, isSuccess?, metadata? })
   */
  const logCreate = useCallback(
    async (
      module: string,
      description: string,
      additionalData: { userId?: number | null; isSuccess?: boolean; metadata?: Record<string, unknown>; endpoint?: string } = {}
    ): Promise<any> => {
      return createLog({
        action: 'CREATE',
        module,
        description,
        isSuccess: additionalData.isSuccess ?? true,
        userId: additionalData.userId,
        endpoint: additionalData.endpoint,
        metadata: additionalData.metadata,
      });
    },
    [createLog]
  );

  /**
   * Log UPDATE action
   * API: logUpdate(module, description, { userId?, isSuccess?, metadata? })
   */
  const logUpdate = useCallback(
    async (
      module: string,
      description: string,
      additionalData: { userId?: number | null; isSuccess?: boolean; metadata?: Record<string, unknown>; endpoint?: string } = {}
    ): Promise<any> => {
      return createLog({
        action: 'UPDATE',
        module,
        description,
        isSuccess: additionalData.isSuccess ?? true,
        userId: additionalData.userId,
        endpoint: additionalData.endpoint,
        metadata: additionalData.metadata,
      });
    },
    [createLog]
  );

  /**
   * Log DELETE action
   * API: logDelete(module, description, { userId?, isSuccess?, metadata? })
   */
  const logDelete = useCallback(
    async (
      module: string,
      description: string,
      additionalData: { userId?: number | null; isSuccess?: boolean; metadata?: Record<string, unknown>; endpoint?: string } = {}
    ): Promise<any> => {
      return createLog({
        action: 'DELETE',
        module,
        description,
        isSuccess: additionalData.isSuccess ?? true,
        userId: additionalData.userId,
        endpoint: additionalData.endpoint,
        metadata: additionalData.metadata,
      });
    },
    [createLog]
  );

  /**
   * Log VIEW action
   */
  const logView = useCallback(
    async (entity: string, description: string, metadata?: Record<string, unknown>): Promise<any> => {
      return createLog({
        action: 'VIEW',
        module: entity,
        description,
        isSuccess: true,
        metadata,
      });
    },
    [createLog]
  );

  /**
   * Log EXPORT action
   */
  const logExport = useCallback(
    async (entity: string, description: string, metadata?: Record<string, unknown>): Promise<any> => {
      return createLog({
        action: 'EXPORT',
        module: entity,
        description,
        isSuccess: true,
        metadata,
      });
    },
    [createLog]
  );

  /**
   * Log LOGIN action
   */
  const logLogin = useCallback(
    async (description: string, metadata?: Record<string, unknown>): Promise<any> => {
      return createLog({
        action: 'LOGIN',
        module: 'USER_MANAGEMENT',
        description,
        isSuccess: true,
        metadata,
      });
    },
    [createLog]
  );

  /**
   * Log LOGOUT action
   */
  const logLogout = useCallback(
    async (description: string, metadata?: Record<string, unknown>): Promise<any> => {
      return createLog({
        action: 'LOGOUT',
        module: 'USER_MANAGEMENT',
        description,
        isSuccess: true,
        metadata,
      });
    },
    [createLog]
  );

  // ==================== FILTER & PAGINATION ====================

  /**
   * Handle search input
   */
  const handleSearch = useCallback(
    (search: string): void => {
      console.log('🔍 [AUDIT] Search:', search);
      const newFilters = { ...currentFiltersRef.current, search };
      currentFiltersRef.current = newFilters;
      fetchAuditLogs(1, newFilters);
    },
    [fetchAuditLogs],
  );

  /**
   * Handle filter changes
   */
  const handleFilter = useCallback(
    (filters: Filters): void => {
      console.log('🔍 [AUDIT] Applying filters:', filters);
      currentFiltersRef.current = filters;
      fetchAuditLogs(1, filters);
    },
    [fetchAuditLogs],
  );

  /**
   * Handle page change
   */
  const handlePageChange = useCallback(
    (page: number): void => {
      console.log('📄 [AUDIT] Page change to:', page);
      currentPageRef.current = page;
      fetchAuditLogs(page, currentFiltersRef.current);
    },
    [fetchAuditLogs],
  );

  /**
   * Refresh stats (public method)
   */
  const refreshStats = useCallback((): void => {
    console.log('🔄 [AUDIT] Refreshing stats...');
    loadStats();
  }, [loadStats]);

  /**
   * Refresh current page
   */
  const refresh = useCallback((): void => {
    console.log('🔄 [AUDIT] Refreshing current page');
    fetchAuditLogs(currentPageRef.current, currentFiltersRef.current);
  }, [fetchAuditLogs]);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback((): void => {
    const resetFiltersState = {
      start_date: '',
      end_date: '',
      action: '',
      module: '',
      search: '',
    };
    currentFiltersRef.current = resetFiltersState;
    fetchAuditLogs(1, resetFiltersState);
  }, [fetchAuditLogs]);

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete single audit log by ID
   */
  const deleteAuditLog = useCallback(
    async (logId: number): Promise<{ message: string }> => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🗑️ [AUDIT] Deleting audit log ID: ${logId}`);

        const result = await auditLogServices.deleteAuditLog(logId);

        console.log('✅ [AUDIT] Audit log deleted:', result);

        // Refresh current page
        await fetchAuditLogs(currentPageRef.current, currentFiltersRef.current);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Gagal menghapus log audit';
        setError(errorMessage);
        console.error('❌ [AUDIT] Error deleting audit log:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAuditLogs],
  );

  /**
   * Delete multiple audit logs by IDs
   */
  const deleteMultipleAuditLogs = useCallback(
    async (logIds: number[]): Promise<DeleteMultipleResponse> => {
      try {
        setLoading(true);
        setError(null);

        if (!logIds || logIds.length === 0) {
          throw new Error('Tidak ada log yang dipilih untuk dihapus');
        }

        console.log(`🗑️ [AUDIT] Deleting ${logIds.length} audit logs:`, logIds);

        const result = await auditLogServices.deleteMultipleAuditLogs(logIds);

        console.log('✅ [AUDIT] Multiple audit logs deleted:', result);

        // Refresh current page
        await fetchAuditLogs(currentPageRef.current, currentFiltersRef.current);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Gagal menghapus log audit';
        setError(errorMessage);
        console.error('❌ [AUDIT] Error deleting multiple audit logs:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAuditLogs],
  );

  /**
   * Delete audit logs by filter
   */
  const deleteByFilter = useCallback(
    async (filters: Filters): Promise<DeleteMultipleResponse> => {
      try {
        setLoading(true);
        setError(null);

        console.log('🗑️ [AUDIT] Deleting audit logs by filter:', filters);

        const result = await auditLogServices.deleteByFilter(filters);

        console.log('✅ [AUDIT] Audit logs deleted by filter:', result);

        // Refresh current page
        await fetchAuditLogs(1, currentFiltersRef.current);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Gagal menghapus log berdasarkan filter';
        setError(errorMessage);
        console.error('❌ [AUDIT] Error deleting by filter:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAuditLogs],
  );

  /**
   * Delete all audit logs
   */
  const deleteAllAuditLogs = useCallback(async (): Promise<DeleteMultipleResponse> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗑️ [AUDIT] Deleting ALL audit logs');

      if (!window.confirm('⚠️ Apakah Anda yakin ingin menghapus SEMUA log audit? Tindakan ini tidak dapat dibatalkan!')) {
        throw new Error('Operasi dibatalkan oleh pengguna');
      }

      const result = await auditLogServices.deleteAllAuditLogs();

      console.log('✅ [AUDIT] All audit logs deleted:', result);

      // Refresh to page 1
      await fetchAuditLogs(1, currentFiltersRef.current);

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal menghapus semua log audit';
      setError(errorMessage);
      console.error('❌ [AUDIT] Error deleting all audit logs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAuditLogs]);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get user display name
   */
  const getUserDisplayName = useCallback((user: User | null): string => {
    if (!user) return 'System';
    if (user.userID) return user.userID;
    return `User ${user.user_id}`;
  }, []);

  /**
   * Get user role display
   */
  const getUserRoleDisplay = useCallback((user: User | null): string => {
    if (!user) return 'System';
    return user.role || 'User';
  }, []);

  /**
   * Format timestamp to Indonesian locale
   */
  const formatTimestamp = useCallback((timestamp: string): string => {
    if (!timestamp) return '-';
    try {
      return new Date(timestamp).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback((): void => {
    setLoading(false);
    setError(null);
    pendingRequests.current.clear();
    currentFiltersRef.current = {};
    currentPageRef.current = 1;
  }, []);

  // ==================== RETURN ====================

  return {
    // Data
    auditLogs,
    total,
    pagination,
    stats,

    // State
    loading,
    error,

    // Fetch functions
    getAuditLogs,
    getStats,
    exportToExcel,
    fetchAuditLogs,
    loadStats,

    // Filter & Pagination
    handleSearch,
    handleFilter,
    handlePageChange,
    resetFilters,
    refresh,
    refreshStats,

    // Log helpers
    logCreate,
    logUpdate,
    logDelete,
    logView,
    logExport,
    logLogin,
    logLogout,

    // Delete operations
    deleteAuditLog,
    deleteMultipleAuditLogs,
    deleteByFilter,
    deleteAllAuditLogs,

    // Utility
    getUserDisplayName,
    getUserRoleDisplay,
    formatTimestamp,
    clearError,
    reset,
  };
};

// Export all types
export type {
  Pagination,
  Filters,
  User,
  AuditLog,
  AuditLogListResponse,
  DeleteMultipleResponse,
  AuditLogStats,
  AuditLogPayload,
};