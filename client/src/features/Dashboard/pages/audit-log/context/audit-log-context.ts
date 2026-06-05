// src/features/Dashboard/pages/audit-log/context/audit-log-context.ts
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuditLog, AuditLog, AuditLogStats, AuditLogListResponse, Filters, Pagination } from '../hooks/audit-log.hooks';

// ==================== TYPES ====================

// Definisikan interface untuk context value (lebih lengkap)
export interface AuditLogContextType {
  // Data
  auditLogs: AuditLog[];
  total: number;
  pagination: Pagination;
  stats: AuditLogStats;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Fetch functions
  getAuditLogs: (params?: any) => Promise<AuditLogListResponse>;
  getStats: () => Promise<AuditLogStats>;
  exportToExcel: (params?: any) => Promise<void>;
  fetchAuditLogs: (page?: number, filters?: Filters) => Promise<void>;
  loadStats: () => Promise<void>;
  
  // Filter & Pagination
  handleSearch: (search: string) => void;
  handleFilter: (filters: Filters) => void;
  handlePageChange: (page: number) => void;
  resetFilters: () => void;
  refresh: () => void;
  refreshStats: () => void;
  
  // Log helpers - API: logCreate(module, description, { userId?, isSuccess?, metadata? })
  logCreate: (
    module: string,
    description: string,
    additionalData?: {
      userId?: number | null;
      isSuccess?: boolean;
      metadata?: Record<string, unknown>;
      endpoint?: string;
    }
  ) => Promise<any>;
  logUpdate: (
    module: string,
    description: string,
    additionalData?: {
      userId?: number | null;
      isSuccess?: boolean;
      metadata?: Record<string, unknown>;
      endpoint?: string;
    }
  ) => Promise<any>;
  logDelete: (
    module: string,
    description: string,
    additionalData?: {
      userId?: number | null;
      isSuccess?: boolean;
      metadata?: Record<string, unknown>;
      endpoint?: string;
    }
  ) => Promise<any>;
  logView: (entity: string, description: string, metadata?: Record<string, unknown>) => Promise<any>;
  logExport: (entity: string, description: string, metadata?: Record<string, unknown>) => Promise<any>;
  logLogin: (description: string, metadata?: Record<string, unknown>) => Promise<any>;
  logLogout: (description: string, metadata?: Record<string, unknown>) => Promise<any>;
  
  // Delete operations
  deleteAuditLog: (logId: number) => Promise<{ message: string }>;
  deleteMultipleAuditLogs: (logIds: number[]) => Promise<{ message: string; deletedCount: number }>;
  deleteByFilter: (filters: Filters) => Promise<{ message: string; deletedCount: number }>;
  deleteAllAuditLogs: () => Promise<{ message: string; deletedCount: number }>;
  
  // Utility
  getUserDisplayName: (user: any) => string;
  getUserRoleDisplay: (user: any) => string;
  formatTimestamp: (timestamp: string) => string;
  clearError: () => void;
  reset: () => void;
}

// Buat context dengan default value undefined
const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

// Custom hook untuk menggunakan context
export const useAuditLogContext = (): AuditLogContextType => {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error('useAuditLogContext must be used within AuditLogProvider');
  }
  return context;
};

// Props interface untuk provider
interface AuditLogProviderProps {
  children: ReactNode;
}

// ✅ Provider dengan useMemo & React.createElement (kompatibel dengan .ts)
export const AuditLogProvider: React.FC<AuditLogProviderProps> = ({ children }) => {
  const auditLog = useAuditLog();

  // Memoize context value agar referensi object stabil
  const contextValue = useMemo(() => auditLog, [
    auditLog.auditLogs,
    auditLog.total,
    auditLog.pagination,
    auditLog.stats,
    auditLog.loading,
    auditLog.error,
  ]);

  // Gunakan React.createElement karena file .ts tidak support JSX
  return React.createElement(
    AuditLogContext.Provider,
    { value: contextValue },
    children
  );
};

export default AuditLogContext;