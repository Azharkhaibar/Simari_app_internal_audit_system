// useNotifications.hook.ts - FIXED VERSION
import { useAuth } from '../../../../auth/hooks/useAuth.hook';
import { useNotificationStore, Notification } from '../stores/notification.stores';
import { NotificationService, CreateNotificationDto } from '../services/notification.services';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

export interface NotificationInput {
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  category?: string;
  metadata?: Record<string, any> | null;
  action?: { label: string; onClick: () => void };
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
    system: number;
  };
  byCategory: Record<string, number>;
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  last7DaysActivities: number;
  loginActivities: number;
  logoutActivities: number;
  lastActivity: Date | null;
}

interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  unreadCount: number;
  hasNotifications: boolean;
  loginLogoutNotifications: Notification[];
  activityStats: ActivityStats;

  // UI State
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'unread' | 'read';
  categoryFilter: string;
  searchTerm: string;
  selectedNotifications: string[];
  showSettings: boolean;

  // Stats
  stats: NotificationStats;
  categories: string[];

  // Filtered Data
  filteredNotifications: Notification[];

  // Actions - CRUD
  addNotification: (notification: NotificationInput) => Promise<Notification | null>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  clearAll: () => Promise<void>;

  // Quick Actions
  addSuccessNotification: (title: string, message: string, category?: string, metadata?: Record<string, any>) => Promise<Notification | null>;
  addErrorNotification: (title: string, message: string, category?: string, metadata?: Record<string, any>) => Promise<Notification | null>;
  addWarningNotification: (title: string, message: string, category?: string, metadata?: Record<string, any>) => Promise<Notification | null>;
  addInfoNotification: (title: string, message: string, category?: string, metadata?: Record<string, any>) => Promise<Notification | null>;

  // UI Actions
  setFilter: (filter: 'all' | 'unread' | 'read') => void;
  setCategoryFilter: (category: string) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSelectedNotifications: (selected: string[]) => void;
  setShowSettings: (show: boolean) => void;

  // Bulk Actions
  handleBulkDelete: () => Promise<void>;
  handleSelectNotification: (id: string) => void;
  handleSelectAll: () => void;

  // Sync & Refresh
  refreshNotifications: () => Promise<void>;

  // WebSocket State
  isWebSocketConnected: boolean;

  // Utilities
  getNotificationIcon: (type: string) => { icon: string; color: string; bgColor: string };
  getTypeColor: (type: string) => string;
  formatTime: (date: Date) => string;

  // Debug
  debugState: () => void;
}

// Helper function
const isTemporaryId = (id: string): boolean => {
  return !id || id.startsWith('temp-') || isNaN(Number(id.replace('temp-', '')));
};

// Icon mapping
const NOTIFICATION_ICONS = {
  success: {
    icon: 'CheckCircle',
    color: 'text-green-500',
    bgColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  },
  warning: {
    icon: 'AlertTriangle',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  },
  error: {
    icon: 'AlertTriangle',
    color: 'text-red-500',
    bgColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  },
  system: {
    icon: 'Settings',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  info: {
    icon: 'Info',
    color: 'text-blue-500',
    bgColor: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  },
};

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Refs for cleanup
  const pollingRef = useRef<boolean>(false);
  const syncInProgressRef = useRef<boolean>(false);
  const lastSyncRef = useRef<number>(0);
  const socketListenersRef = useRef<Map<string, Function>>(new Map());
  const notificationServiceRef = useRef<NotificationService | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Zustand store
  const {
    notifications,
    addNotification: addToStore,
    markAsRead: markAsReadInStore,
    markAllAsRead: markAllAsReadInStore,
    removeNotification: removeFromStore,
    clearAll: clearAllInStore,
    getAllNotificationsForUser,
    getUnreadByUser,
    updateNotification: updateInStore,
    syncWithBackendData,
  } = useNotificationStore();

  const userId = user?.user_id ? Number(user.user_id) : null;

  // ==================== CORE DATA ====================

  const userNotifications = useMemo(() => {
    if (!userId) return [];
    return getAllNotificationsForUser(userId.toString());
  }, [notifications, userId, getAllNotificationsForUser]);

  const userUnreadCount = useMemo(() => {
    if (!userId) return 0;
    return getUnreadByUser(userId.toString());
  }, [notifications, userId, getUnreadByUser]);

  const filteredNotifications = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return userNotifications.filter((notif) => {
      // Filter by read status
      const matchesFilter = filter === 'all' || (filter === 'unread' && !notif.read) || (filter === 'read' && notif.read);

      // Filter by category
      const matchesCategory = categoryFilter === 'all' || notif.category === categoryFilter;

      // Filter by search term
      const matchesSearch = lowerSearchTerm === '' || notif.title?.toLowerCase().includes(lowerSearchTerm) || notif.message?.toLowerCase().includes(lowerSearchTerm);

      return matchesFilter && matchesCategory && matchesSearch;
    });
  }, [userNotifications, filter, categoryFilter, searchTerm]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    userNotifications.forEach((n) => {
      if (n.category) {
        categorySet.add(n.category);
      }
    });
    return Array.from(categorySet);
  }, [userNotifications]);

  const loginLogoutNotifications = useMemo(() => {
    if (!userId) return [];

    return userNotifications
      .filter((notif) => {
        const activityType = notif.metadata?.activity_type;
        const action = notif.metadata?.action;
        const title = notif.title?.toLowerCase() || '';
        const message = notif.message?.toLowerCase() || '';
        const category = notif.category?.toLowerCase() || '';

        const isLoginLogoutActivity =
          activityType === 'login' ||
          activityType === 'logout' ||
          action === 'login' ||
          action === 'logout' ||
          title.includes('login') ||
          title.includes('logout') ||
          title.includes('sign in') ||
          title.includes('sign out') ||
          message.includes('login') ||
          message.includes('logout') ||
          message.includes('sign in') ||
          message.includes('sign out') ||
          category === 'security' ||
          category === 'system' ||
          category === 'authentication' ||
          category === 'auth';

        return isLoginLogoutActivity;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [userNotifications, userId]);

  // ==================== STATS ====================

  const stats = useMemo<NotificationStats>(() => {
    const byType = {
      info: userNotifications.filter((n) => n.type === 'info').length,
      success: userNotifications.filter((n) => n.type === 'success').length,
      warning: userNotifications.filter((n) => n.type === 'warning').length,
      error: userNotifications.filter((n) => n.type === 'error').length,
      system: userNotifications.filter((n) => n.type === 'system').length,
    };

    const byCategory = userNotifications.reduce((acc, notif) => {
      const category = notif.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: userNotifications.length,
      unread: userUnreadCount,
      read: userNotifications.length - userUnreadCount,
      byType,
      byCategory,
    };
  }, [userNotifications, userUnreadCount]);

  const activityStats = useMemo<ActivityStats>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const todayActivities = loginLogoutNotifications.filter((notif) => new Date(notif.timestamp) >= today);

    const last7DaysActivities = loginLogoutNotifications.filter((notif) => new Date(notif.timestamp) >= sevenDaysAgo);

    const loginActivities = loginLogoutNotifications.filter((notif) => {
      const activityType = notif.metadata?.activity_type;
      const action = notif.metadata?.action;
      const title = notif.title?.toLowerCase() || '';
      const message = notif.message?.toLowerCase() || '';

      return activityType === 'login' || action === 'login' || title.includes('login') || title.includes('sign in') || message.includes('login') || message.includes('sign in');
    });

    const logoutActivities = loginLogoutNotifications.filter((notif) => {
      const activityType = notif.metadata?.activity_type;
      const action = notif.metadata?.action;
      const title = notif.title?.toLowerCase() || '';
      const message = notif.message?.toLowerCase() || '';

      return activityType === 'logout' || action === 'logout' || title.includes('logout') || title.includes('sign out') || message.includes('logout') || message.includes('sign out');
    });

    return {
      totalActivities: loginLogoutNotifications.length,
      todayActivities: todayActivities.length,
      last7DaysActivities: last7DaysActivities.length,
      loginActivities: loginActivities.length,
      logoutActivities: logoutActivities.length,
      lastActivity: loginLogoutNotifications[0] ? new Date(loginLogoutNotifications[0].timestamp) : null,
    };
  }, [loginLogoutNotifications]);

  // ==================== SYNC FUNCTION ====================

  const syncWithBackend = useCallback(async () => {
    if (!userId) {
      console.log('⏭️ No user ID, skipping sync');
      return;
    }

    // Prevent concurrent sync
    if (syncInProgressRef.current) {
      console.log('⏭️ Sync already in progress');
      return;
    }

    // Rate limiting (min 5 seconds between syncs)
    const now = Date.now();
    if (now - lastSyncRef.current < 5000) {
      console.log('⏭️ Rate limiting sync');
      return;
    }

    syncInProgressRef.current = true;
    lastSyncRef.current = now;

    console.log('🔄 Starting notification sync for user:', userId);
    setIsLoading(true);
    setError(null);

    try {
      // Pastikan service instance ada
      if (!notificationServiceRef.current) {
        notificationServiceRef.current = new NotificationService(`sync-${userId}`);
      }

      // Menggunakan method yang sesuai dengan service yang sudah diperbaiki
      const notifications = await notificationServiceRef.current.getUserNotifications(userId, {
        unreadOnly: false,
        limit: 50,
      });

      if (notifications && notifications.length > 0) {
        // Convert notifications to backend format
        const backendNotifications = notifications.map((notif) => ({
          notification_id: parseInt(notif.id),
          user_id: notif.userId === 'broadcast' ? null : parseInt(notif.userId),
          type: notif.type,
          title: notif.title,
          message: notif.message,
          read: notif.read,
          metadata: notif.metadata || null,
          category: notif.category || null,
          created_at: notif.timestamp.toISOString(),
          expires_at: notif.expires_at?.toISOString() || null,
        }));

        syncWithBackendData(backendNotifications);
        console.log('✅ Sync completed successfully:', {
          count: notifications.length,
        });
      } else {
        console.log('⏭️ No notifications to sync');
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to sync notifications';
      setError(msg);
      console.warn('⚠️ Sync failed:', msg);

      // Don't throw error, just log it
      // Use cached data if available
      console.log('🔄 Using cached notifications');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      syncInProgressRef.current = false;
    }
  }, [userId, syncWithBackendData]);

  // ==================== WEBSOCKET SETUP ====================

  const setupWebSocket = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('⏭️ No access token found in localStorage, skipping WebSocket setup');
      return;
    }

    if (!notificationServiceRef.current) {
      notificationServiceRef.current = new NotificationService(`ws-${userId}`);
    }

    try {
      // Connect WebSocket dengan token
      notificationServiceRef.current.connectSocket(token);

      // Setup event listeners
      const handleNotification = (notification: any) => {
        console.log('🔔 WebSocket notification received:', notification);
        // Note: NotificationService already adds this to useNotificationStore
        // so we don't need to do it again here.
      };

      const handleBroadcast = (notification: any) => {
        console.log('📢 WebSocket broadcast received:', notification);
        // Note: NotificationService already adds this to useNotificationStore
        // so we don't need to do it again here.
      };

      const handleConnected = () => {
        console.log('✅ WebSocket connected');
        if (isMountedRef.current) {
          setIsWebSocketConnected(true);
        }
      };

      const handleDisconnected = () => {
        console.log('🔌 WebSocket disconnected');
        if (isMountedRef.current) {
          setIsWebSocketConnected(false);
        }
      };

      const handleConnectionError = (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        if (isMountedRef.current) {
          setIsWebSocketConnected(false);
        }
      };

      // Register listeners menggunakan instance method
      notificationServiceRef.current.on('notification', handleNotification);
      notificationServiceRef.current.on('broadcast', handleBroadcast);
      notificationServiceRef.current.on('connected', handleConnected);
      notificationServiceRef.current.on('disconnected', handleDisconnected);
      notificationServiceRef.current.on('connection-error', handleConnectionError);

      // Store listeners for cleanup
      socketListenersRef.current.set('notification', handleNotification);
      socketListenersRef.current.set('broadcast', handleBroadcast);
      socketListenersRef.current.set('connected', handleConnected);
      socketListenersRef.current.set('disconnected', handleDisconnected);
      socketListenersRef.current.set('connection-error', handleConnectionError);
    } catch (error) {
      console.error('❌ WebSocket setup error:', error);
      if (isMountedRef.current) {
        setIsWebSocketConnected(false);
      }
    }
  }, [userId]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log('⏭️ No user ID, skipping notification setup');
      return;
    }

    console.log('🚀 Setting up notifications for user:', userId);

    // Initialize service instance
    notificationServiceRef.current = new NotificationService(`user-${userId}`);

    // Initial sync
    syncWithBackend();

    // Setup WebSocket connection jika ada token
    const token = localStorage.getItem('access_token');
    if (token) {
      setupWebSocket();
    }

    // Start polling sebagai fallback
    pollingRef.current = true;
    if (notificationServiceRef.current) {
      notificationServiceRef.current.startPolling(userId, 30000);
    }

    return () => {
      console.log('🧹 Cleaning up notifications for user:', userId);

      if (pollingRef.current && notificationServiceRef.current) {
        notificationServiceRef.current.stopPolling();
        pollingRef.current = false;
      }

      // Cleanup WebSocket listeners
      if (notificationServiceRef.current && socketListenersRef.current.size > 0) {
        socketListenersRef.current.forEach((callback, event) => {
          notificationServiceRef.current?.off(event, callback);
        });
        socketListenersRef.current.clear();
      }

      // Cleanup service instance
      if (notificationServiceRef.current) {
        notificationServiceRef.current.cleanup();
        notificationServiceRef.current = null;
      }

      syncInProgressRef.current = false;
    };
  }, [userId, syncWithBackend, setupWebSocket]);

  // ==================== ACTIONS ====================

  const addNotification = useCallback(
    async (notification: NotificationInput): Promise<Notification | null> => {
      if (!userId) {
        console.log('⏭️ No user ID, cannot add notification');
        return null;
      }

      try {
        // Pastikan service instance ada
        if (!notificationServiceRef.current) {
          notificationServiceRef.current = new NotificationService(`add-notif-${userId}`);
        }

        // Payload sesuai dengan CreateNotificationDto dari service
        const backendPayload: CreateNotificationDto = {
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          ...(notification.category && { category: notification.category }),
          ...(notification.metadata && { metadata: notification.metadata }),
        };

        console.log('📤 Creating notification:', backendPayload);
        const result = await notificationServiceRef.current.create(backendPayload);

        console.log('✅ Notification created on backend:', result);
        return result;
      } catch (err) {
        console.error('❌ Failed to create notification on backend:', err);

        // Fallback: create local notification only
        const localId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fallbackNotification = addToStore({
          ...notification,
          userId: userId.toString(),
          id: localId,
          timestamp: new Date(),
          read: false,
          metadata: notification.metadata || null,
        });

        console.log('📝 Created fallback notification:', fallbackNotification);
        return fallbackNotification;
      }
    },
    [userId, addToStore]
  );

  const markAsRead = useCallback(
    async (id: string): Promise<void> => {
      try {
        if (!isTemporaryId(id) && notificationServiceRef.current) {
          const notificationId = parseInt(id);
          if (!isNaN(notificationId)) {
            await notificationServiceRef.current.markAsRead(notificationId);
            console.log('✅ Marked as read on backend:', id);
          }
        } else {
          console.log('📝 Marking temporary notification as read:', id);
        }
      } catch (err) {
        console.error('⚠️ Failed to mark as read on backend:', err, id);
      } finally {
        markAsReadInStore(id);
        console.log('✅ Marked as read in store:', id);
      }
    },
    [markAsReadInStore]
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.log('⏭️ No user ID, cannot mark all as read');
      return;
    }

    try {
      if (notificationServiceRef.current) {
        await notificationServiceRef.current.markAllAsRead(userId);
        console.log('✅ Marked all as read on backend');
      }
    } catch (err) {
      console.error('⚠️ Failed to mark all as read on backend:', err);
    } finally {
      markAllAsReadInStore();
      console.log('✅ Marked all as read in store');
    }
  }, [userId, markAllAsReadInStore]);

  const removeNotification = useCallback(
    async (id: string): Promise<void> => {
      try {
        if (!isTemporaryId(id) && notificationServiceRef.current) {
          const notificationId = parseInt(id);
          if (!isNaN(notificationId)) {
            await notificationServiceRef.current.delete(notificationId);
            console.log('✅ Deleted notification on backend:', id);
          }
        } else {
          console.log('🗑️ Deleting temporary notification:', id);
        }
      } catch (err) {
        console.error('⚠️ Failed to delete notification on backend:', err, id);
        if (!isTemporaryId(id)) {
          throw err;
        }
      } finally {
        removeFromStore(id);
        console.log('✅ Removed notification from store:', id);
      }
    },
    [removeFromStore]
  );

  const clearAll = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.log('⏭️ No user ID, cannot clear all');
      return;
    }

    try {
      if (notificationServiceRef.current) {
        // Note: Backend tidak punya endpoint untuk delete all user notifications
        // Kita akan delete satu per satu
        const userNotificationsToDelete = userNotifications
          .filter((notif) => !isTemporaryId(notif.id))
          .map((notif) => parseInt(notif.id))
          .filter((id) => !isNaN(id));

        if (userNotificationsToDelete.length > 0) {
          // Delete in batches
          for (const id of userNotificationsToDelete) {
            try {
              await notificationServiceRef.current.delete(id);
            } catch (err) {
              console.error('⚠️ Failed to delete notification:', id, err);
            }
          }
        }
        console.log('✅ Cleared all notifications on backend');
      }
    } catch (err) {
      console.error('⚠️ Failed to clear all notifications on backend:', err);
    } finally {
      clearAllInStore();
      console.log('✅ Cleared all notifications in store');
    }
  }, [userId, clearAllInStore, userNotifications]);

  // Quick action helpers
  const addSuccessNotification = useCallback((title: string, message: string, category?: string, metadata?: Record<string, any>) => addNotification({ type: 'success', title, message, category, metadata }), [addNotification]);

  const addErrorNotification = useCallback((title: string, message: string, category?: string, metadata?: Record<string, any>) => addNotification({ type: 'error', title, message, category, metadata }), [addNotification]);

  const addWarningNotification = useCallback((title: string, message: string, category?: string, metadata?: Record<string, any>) => addNotification({ type: 'warning', title, message, category, metadata }), [addNotification]);

  const addInfoNotification = useCallback((title: string, message: string, category?: string, metadata?: Record<string, any>) => addNotification({ type: 'info', title, message, category, metadata }), [addNotification]);

  // ==================== UI ACTIONS ====================

  const handleBulkDelete = useCallback(async () => {
    if (selectedNotifications.length === 0) {
      console.log('⏭️ No notifications selected for bulk delete');
      return;
    }

    console.log('🗑️ Bulk deleting notifications:', selectedNotifications.length);

    try {
      // Delete in parallel but limit concurrency
      const promises = selectedNotifications.map((id) => removeNotification(id));
      await Promise.all(promises);
      setSelectedNotifications([]);
      console.log('✅ Bulk delete completed');
    } catch (error) {
      console.error('❌ Failed to delete notifications:', error);
    }
  }, [selectedNotifications, removeNotification]);

  const handleSelectNotification = useCallback((id: string) => {
    setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedNotifications((prev) => (prev.length === filteredNotifications.length ? [] : filteredNotifications.map((n) => n.id)));
  }, [filteredNotifications]);

  // ==================== UTILITIES ====================

  const getNotificationIcon = useCallback((type: string) => {
    return NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || NOTIFICATION_ICONS.info;
  }, []);

  const getTypeColor = useCallback((type: string) => {
    return NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS]?.bgColor || NOTIFICATION_ICONS.info.bgColor;
  }, []);

  const formatTime = useCallback((date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown';
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const debugState = useCallback(() => {
    console.log('🔔 Notification Hook State:');
    console.log('User ID:', userId);
    console.log('Total notifications:', userNotifications.length);
    console.log('Unread count:', userUnreadCount);
    console.log('Login/Logout notifications:', loginLogoutNotifications.length);
    console.log('Stats:', stats);
    console.log('Activity Stats:', activityStats);
    console.log('WebSocket connected:', isWebSocketConnected);
    console.log('Selected notifications:', selectedNotifications.length);
    console.log('NotificationService instance:', notificationServiceRef.current ? 'Exists' : 'None');
  }, [userId, userNotifications, userUnreadCount, loginLogoutNotifications, stats, activityStats, isWebSocketConnected, selectedNotifications]);

  // ==================== RETURN VALUE ====================

  return {
    // Data
    notifications: userNotifications,
    unreadCount: userUnreadCount,
    hasNotifications: userNotifications.length > 0,
    loginLogoutNotifications,
    activityStats,

    // UI State
    isLoading,
    error,
    filter,
    categoryFilter,
    searchTerm,
    selectedNotifications,
    showSettings,
    isWebSocketConnected,

    // Stats & Categories
    stats,
    categories,

    // Filtered Data
    filteredNotifications,

    // Actions - CRUD
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateNotification: updateInStore,
    clearAll,

    // Quick Actions
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
    addInfoNotification,

    // UI Actions
    setFilter,
    setCategoryFilter,
    setSearchTerm,
    setSelectedNotifications,
    setShowSettings,

    // Bulk Actions
    handleBulkDelete,
    handleSelectNotification,
    handleSelectAll,

    // Sync & Refresh
    refreshNotifications: syncWithBackend,

    // Utilities
    getNotificationIcon,
    getTypeColor,
    formatTime,

    // Debug
    debugState,
  };
};

// Export simplified versions
export const useNotificationPage = () => {
  const {
    notifications,
    filteredNotifications,
    categories,
    filter,
    categoryFilter,
    searchTerm,
    selectedNotifications,
    showSettings,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setFilter,
    setCategoryFilter,
    setSearchTerm,
    setSelectedNotifications,
    setShowSettings,
    handleBulkDelete,
    handleSelectNotification,
    handleSelectAll,
    refreshNotifications,
    getNotificationIcon,
    getTypeColor,
    formatTime,
    debugState,
    isWebSocketConnected,
    ...rest
  } = useNotifications();

  return {
    notifications,
    filteredNotifications,
    categories,
    filter,
    categoryFilter,
    searchTerm,
    selectedNotifications,
    showSettings,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setFilter,
    setCategoryFilter,
    setSearchTerm,
    setSelectedNotifications,
    setShowSettings,
    handleBulkDelete,
    handleSelectNotification,
    handleSelectAll,
    refreshNotifications,
    getNotificationIcon,
    getTypeColor,
    formatTime,
    debugState,
    isWebSocketConnected,
    ...rest,
  };
};

export const useNotificationStats = () => {
  const { stats, activityStats, loginLogoutNotifications } = useNotifications();

  return {
    notificationStats: stats,
    activityStats,
    loginLogoutNotifications,
  };
};

// Export untuk login form (tanpa WebSocket)
export const useUserNotifications = () => {
  const { refreshNotifications } = useNotifications();

  return {
    refreshNotifications,
  };
};
