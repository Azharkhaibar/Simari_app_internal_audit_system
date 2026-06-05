// src/features/Dashboard/pages/audit-log/pages/AuditLog.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Download, User, Calendar, Activity, BarChart3, RefreshCw, X } from 'lucide-react';
import { useAuditLog } from '../hooks/audit-log.hooks';

// ==================== CONSTANTS ====================

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  VIEW: 'bg-gray-100 text-gray-800',
  EXPORT: 'bg-purple-100 text-purple-800',
  LOGIN: 'bg-indigo-100 text-indigo-800',
  LOGOUT: 'bg-orange-100 text-orange-800',
};

// Module RAS & Holding
const RAS_HOLDING_MODULES = [
  'RAS', 'INVESTASI', 'PASAR', 'LIKUIDITAS', 'OPERASIONAL',
  'HUKUM', 'STRATEJIK', 'KEPATUHAN', 'REPUTASI',
];

// Module OJK (13 modules)
const OJK_MODULES = [
  'HUKUM_OJK',
  'INVESTASI_OJK',
  'KEPATUHAN_OJK',
  'KONSENTRASI_OJK',
  'KREDIT_OJK',
  'LIKUIDITAS_OJK',
  'OPERASIONAL_OJK',
  'PASAR_OJK',
  'PERMODALAN_OJK',
  'RENTABILITAS_OJK',
  'REPUTASI_OJK',
  'STRATEGIS_OJK',
  'TATAKELOLA_OJK',
];

// Module display names
const MODULE_DISPLAY_NAMES = {
  // RAS & Holding
  RAS: 'RAS',
  INVESTASI: 'Investasi',
  PASAR: 'Pasar',
  LIKUIDITAS: 'Likuiditas',
  OPERASIONAL: 'Operasional',
  HUKUM: 'Hukum',
  STRATEJIK: 'Strategik',
  KEPATUHAN: 'Kepatuhan',
  REPUTASI: 'Reputasi',
  // OJK
  HUKUM_OJK: 'Hukum OJK',
  INVESTASI_OJK: 'Investasi OJK',
  KEPATUHAN_OJK: 'Kepatuhan OJK',
  KONSENTRASI_OJK: 'Konsentrasi OJK',
  KREDIT_OJK: 'Kredit Produk OJK',
  LIKUIDITAS_OJK: 'Likuiditas Produk OJK',
  OPERASIONAL_OJK: 'Operasional OJK',
  PASAR_OJK: 'Pasar Produk OJK',
  PERMODALAN_OJK: 'Permodalan OJK',
  RENTABILITAS_OJK: 'Rentabilitas OJK',
  REPUTASI_OJK: 'Reputasi OJK',
  STRATEGIS_OJK: 'Strategis OJK',
  TATAKELOLA_OJK: 'Tatakelola OJK',
  // System
  USER_MANAGEMENT: 'User Management',
  SYSTEM: 'System',
};

// Module colors
const MODULE_COLORS = {
  // RAS & Holding
  RAS: '#4F46E5',
  INVESTASI: '#8B5CF6',
  PASAR: '#795548',
  LIKUIDITAS: '#FF6B6B',
  OPERASIONAL: '#FFA726',
  HUKUM: '#607D8B',
  STRATEJIK: '#9C27B0',
  KEPATUHAN: '#0068B3',
  REPUTASI: '#00A3DA',
  // OJK
  HUKUM_OJK: '#607D8B',
  INVESTASI_OJK: '#9C27B0',
  KEPATUHAN_OJK: '#0068B3',
  KONSENTRASI_OJK: '#FF6B6B',
  KREDIT_OJK: '#4CAF50',
  LIKUIDITAS_OJK: '#FF9800',
  OPERASIONAL_OJK: '#FFA726',
  PASAR_OJK: '#795548',
  PERMODALAN_OJK: '#2196F3',
  RENTABILITAS_OJK: '#00BCD4',
  REPUTASI_OJK: '#00A3DA',
  STRATEGIS_OJK: '#9C27B0',
  TATAKELOLA_OJK: '#3F51B5',
  // System
  USER_MANAGEMENT: '#6B7280',
  SYSTEM: '#374151',
};

// All modules combined
const ALL_MODULES = [...RAS_HOLDING_MODULES, ...OJK_MODULES, 'USER_MANAGEMENT', 'SYSTEM'];

// ==================== SUB-COMPONENTS ====================

const UserDisplay = React.memo(({ log, getUserInfo }) => {
  const userInfo = getUserInfo(log);

  const getRoleStyles = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return { bg: 'bg-purple-100', text: 'text-purple-600', icon: '👑' };
      case 'SYSTEM':
        return { bg: 'bg-gray-100', text: 'text-gray-600', icon: '⚙️' };
      case 'USER':
        return { bg: 'bg-blue-100', text: 'text-blue-600', icon: '👤' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', icon: '❓' };
    }
  };

  const roleStyles = getRoleStyles(userInfo.role);

  return (
    <div className="flex items-center space-x-3">
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${roleStyles.bg}`}>
        <User className={`w-4 h-4 ${roleStyles.text}`} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
          <span className="truncate">{userInfo.displayName}</span>
          <span className="text-xs flex-shrink-0">{roleStyles.icon}</span>
        </div>
        <div className="text-xs text-gray-500 capitalize">{userInfo.roleDisplay}</div>
        {userInfo.userId && (
          <div className="text-xs text-gray-400 mt-0.5">ID: {userInfo.userId}</div>
        )}
      </div>
    </div>
  );
});

UserDisplay.displayName = 'UserDisplay';

const ModuleBadge = React.memo(({ moduleName }) => {
  const displayName = MODULE_DISPLAY_NAMES[moduleName] || moduleName;
  const color = MODULE_COLORS[moduleName] || '#6B7280';
  const isOJK = OJK_MODULES.includes(moduleName);

  if (!moduleName) {
    return <span className="text-red-500 italic text-xs">(No Module)</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOJK ? 'border border-dashed' : ''}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: isOJK ? color : 'transparent',
      }}
    >
      {displayName}
      {isOJK && <span className="ml-1 text-[10px] opacity-75">(OJK)</span>}
    </span>
  );
});

ModuleBadge.displayName = 'ModuleBadge';

const StatCard = React.memo(({ title, value, icon, bgColor, textColor }) => (
  <div className="rounded-xl p-6 shadow-sm border bg-white border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const SkeletonCard = () => (
  <div className="rounded-xl p-6 shadow-sm border bg-white border-gray-200">
    <div className="animate-pulse flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export const AuditLog = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Use hook for all audit log functionality
  const {
    // Data
    auditLogs,
    total,
    pagination,
    stats,
    // State
    loading,
    error,
    // Fetch functions
    fetchAuditLogs,
    loadStats,
    exportToExcel,
    // Filter & Pagination
    handleSearch,
    handleFilter,
    handlePageChange,
    resetFilters: resetAllFilters,
    refresh,
    // Utility
    getUserDisplayName,
    getUserRoleDisplay,
    formatTimestamp,
    clearError,
  } = useAuditLog();

  // Local filters state
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    action: '',
    module: '',
    search: '',
    module_category: 'all',
  });

  // Initial data load - called once on mount
  useEffect(() => {
    fetchAuditLogs(1);
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug logging
  useEffect(() => {
    if (auditLogs && auditLogs.length > 0 && !loading) {
      console.log('📋 [AuditLog] Data loaded:', {
        total: auditLogs.length,
        modules: [...new Set(auditLogs.map((log) => log.module))],
        ojkModules: auditLogs.filter((log) => OJK_MODULES.includes(log.module)).map((log) => log.module),
      });
    }
  }, [auditLogs, loading]);

  // Get available modules based on category filter
  const availableModules = useMemo(() => {
    const statsModules = stats?.modules || [];

    let baseModules;
    if (filters.module_category === 'ras_holding') {
      baseModules = RAS_HOLDING_MODULES;
    } else if (filters.module_category === 'ojk') {
      baseModules = OJK_MODULES;
    } else {
      baseModules = ALL_MODULES;
    }

    // Combine with modules from stats
    const combined = [...new Set([...baseModules, ...statsModules])];

    return combined.sort((a, b) => {
      // Sort: RAS & Holding first, then OJK, then System
      const aIsOJK = OJK_MODULES.includes(a);
      const bIsOJK = OJK_MODULES.includes(b);
      const aIsSystem = ['USER_MANAGEMENT', 'SYSTEM'].includes(a);
      const bIsSystem = ['USER_MANAGEMENT', 'SYSTEM'].includes(b);

      if (aIsSystem && !bIsSystem) return 1;
      if (!aIsSystem && bIsSystem) return -1;
      if (aIsOJK && !bIsOJK) return 1;
      if (!aIsOJK && bIsOJK) return -1;

      return (MODULE_DISPLAY_NAMES[a] || a).localeCompare(MODULE_DISPLAY_NAMES[b] || b);
    });
  }, [stats, filters.module_category]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value };

      // Reset module when changing category
      if (key === 'module_category') {
        newFilters.module = '';
      }

      setFilters(newFilters);

      // Apply filter to API
      if (key === 'search') {
        handleSearch(value);
      } else {
        const apiFilters = {};
        if (newFilters.start_date) apiFilters.start_date = newFilters.start_date;
        if (newFilters.end_date) apiFilters.end_date = newFilters.end_date;
        if (newFilters.action) apiFilters.action = newFilters.action;
        if (newFilters.module) apiFilters.module = newFilters.module;
        if (newFilters.search) apiFilters.search = newFilters.search;
        handleFilter(apiFilters);
      }
    },
    [filters, handleSearch, handleFilter],
  );

  // Reset filters
  const handleResetFilters = useCallback(() => {
    const resetState = {
      start_date: '',
      end_date: '',
      action: '',
      module: '',
      search: '',
      module_category: 'all',
    };
    setFilters(resetState);
    if (resetAllFilters) {
      resetAllFilters();
    } else {
      handleFilter({});
      handleSearch('');
    }
  }, [resetAllFilters, handleFilter, handleSearch]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      await exportToExcel({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        action: filters.action || undefined,
        module: filters.module || undefined,
        search: filters.search || undefined,
      });
    } catch (err) {
      console.error('❌ [AuditLog] Export failed:', err);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    }
  }, [exportToExcel, filters]);

  // Get total count from stats array
  const getTotalCount = useCallback((statsArray) => {
    if (!statsArray || !Array.isArray(statsArray)) return 0;
    return statsArray.reduce((acc, curr) => acc + parseInt(curr.count || '0', 10), 0);
  }, []);

  // Get user info from log
  const getUserInfo = useCallback(
    (log) => {
      // Priority 1: User object exists
      if (log.user && log.user.userID) {
        return {
          name: log.user.userID,
          role: log.user.role || 'User',
          displayName: getUserDisplayName(log.user),
          roleDisplay: getUserRoleDisplay(log.user),
          userId: log.user.user_id,
          source: 'user_object',
        };
      }

      // Priority 2: userId exists
      if (log.userId) {
        return {
          name: `User ${log.userId}`,
          role: 'User',
          displayName: `User ${log.userId}`,
          roleDisplay: 'User',
          userId: log.userId,
          source: 'user_id',
        };
      }

      // Priority 3: Metadata contains user info
      if (log.metadata) {
        const metaUserId = log.metadata.userId || log.metadata.userID;
        const metaUser = log.metadata.user || log.metadata.username;
        if (metaUserId || metaUser) {
          return {
            name: metaUser || `User ${metaUserId}`,
            role: 'User',
            displayName: metaUser || `User ${metaUserId}`,
            roleDisplay: 'User',
            userId: metaUserId,
            source: 'metadata',
          };
        }
      }

      // Priority 4: System actions/modules
      const systemActions = ['SYSTEM_START', 'AUTO_BACKUP', 'CRON_JOB', 'SYSTEM'];
      const systemModules = ['SYSTEM'];
      if (systemActions.includes(log.action) || systemModules.includes(log.module)) {
        return {
          name: 'System',
          role: 'System',
          displayName: 'System ⚙️',
          roleDisplay: 'System',
          source: 'system',
        };
      }

      // Priority 5: Local IP
      if (log.ip_address === '127.0.0.1' || log.ip_address === 'localhost') {
        return {
          name: 'Local System',
          role: 'System',
          displayName: 'Local System ⚙️',
          roleDisplay: 'System',
          source: 'local_ip',
        };
      }

      // Priority 6: User-triggered actions
      const userActions = ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'VIEW', 'LOGIN', 'LOGOUT'];
      if (userActions.includes(log.action)) {
        return {
          name: 'Unknown User',
          role: 'User',
          displayName: 'Unknown User 👤',
          roleDisplay: 'User',
          source: 'user_action',
        };
      }

      // Fallback
      return {
        name: 'Unknown',
        role: 'Unknown',
        displayName: 'Unknown',
        roleDisplay: 'Unknown',
        source: 'fallback',
      };
    },
    [getUserDisplayName, getUserRoleDisplay],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[95%] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
              <p className="text-gray-600 mt-2">Monitor semua aktivitas sistem secara real-time</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  RAS &amp; Holding
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-green-500 bg-green-50 text-green-700">
                  OJK Modules (13)
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={loading || !auditLogs || auditLogs.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm mt-1 text-red-700">{error}</p>
                </div>
              </div>
              <button onClick={clearError} className="text-red-600 hover:text-red-800 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {loading && !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Hari Ini"
              value={getTotalCount(stats.today)}
              icon={<Activity className="w-6 h-6" />}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            <StatCard
              title="Minggu Ini"
              value={getTotalCount(stats.week)}
              icon={<BarChart3 className="w-6 h-6" />}
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
            <StatCard
              title="Bulan Ini"
              value={getTotalCount(stats.month)}
              icon={<Calendar className="w-6 h-6" />}
              bgColor="bg-purple-100"
              textColor="text-purple-600"
            />
            <StatCard
              title="Total Module"
              value={stats.modules?.length || availableModules.length}
              icon={<User className="w-6 h-6" />}
              bgColor="bg-orange-100"
              textColor="text-orange-600"
            />
          </div>
        ) : null}

        {/* Filters */}
        <div className="rounded-xl shadow-sm border bg-white border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filter &amp; Pencarian</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan deskripsi, user, atau aksi..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100">
                {/* Kategori Module */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Kategori Module</label>
                  <select
                    value={filters.module_category}
                    onChange={(e) => handleFilterChange('module_category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-900"
                  >
                    <option value="all">Semua Module</option>
                    <option value="ras_holding">RAS &amp; Holding</option>
                    <option value="ojk">OJK (13 Modules)</option>
                  </select>
                </div>

                {/* Tanggal Mulai */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-900"
                  />
                </div>

                {/* Tanggal Akhir */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-900"
                  />
                </div>

                {/* Aksi */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Aksi</label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-900"
                  >
                    <option value="">Semua Aksi</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="VIEW">View</option>
                    <option value="EXPORT">Export</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                  </select>
                </div>

                {/* Module */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Module</label>
                  <select
                    value={filters.module}
                    onChange={(e) => handleFilterChange('module', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-900"
                  >
                    <option value="">Semua Module</option>
                    {availableModules.map((module) => (
                      <option key={module} value={module}>
                        {MODULE_DISPLAY_NAMES[module] || module}
                        {OJK_MODULES.includes(module) ? ' (OJK)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-xl shadow-sm border bg-white border-gray-200 overflow-hidden">
          {loading && (!auditLogs || auditLogs.length === 0) ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat data audit...</p>
            </div>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <div className="text-center py-16">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2 text-gray-900">Tidak ada data audit</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Tidak ada aktivitas yang tercatat untuk filter yang dipilih. Coba ubah filter atau refresh halaman.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Aksi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Module</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Deskripsi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <UserDisplay log={log} getUserInfo={getUserInfo} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                              ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ModuleBadge moduleName={log.module} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                          <div className="line-clamp-2">{log.description}</div>
                          {log.endpoint && (
                            <div className="text-xs mt-1 truncate text-gray-400 font-mono" title={log.endpoint}>
                              {log.endpoint}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <code className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-mono">
                            {log.ip_address || '-'}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              log.isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {log.isSuccess ? '✅ Berhasil' : '❌ Gagal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min((pagination.page - 1) * pagination.limit + 1, total)}
                    </span>{' '}
                    -{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(pagination.page * pagination.limit, total)}
                    </span>{' '}
                    dari{' '}
                    <span className="font-semibold text-gray-900">{total}</span> aktivitas
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1 || loading}
                      className="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium"
                    >
                      ← Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-600">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages || loading}
                      className="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;