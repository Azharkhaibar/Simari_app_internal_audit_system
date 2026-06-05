import { useState, useCallback, useEffect, useRef } from 'react';
import { AuthService } from '../services/auth.services';
import RIMS_API from '../api/auth.api';
import { AxiosError } from 'axios';
import { NotificationService } from '../../Dashboard/pages/notification/services/notification.services';
import { ProfileService } from '../../Dashboard/pages/profile/services/profile.services';
import { useNotificationStore } from '../../Dashboard/pages/notification/stores/notification.stores';

interface AuthUser {
  userID: string; // username login
  username: string; // pastikan ini string, bukan optional
  user_id: number; // pastikan ini number, bukan optional
  role?: string;
  email?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

  const userRef = useRef<AuthUser | null>(null);
  const loginNotificationSentRef = useRef<boolean>(false);
  const notificationServiceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Inisialisasi NotificationService
  useEffect(() => {
    if (!notificationServiceRef.current) {
      notificationServiceRef.current = new NotificationService('auth-hook');
    }

    return () => {
      if (notificationServiceRef.current) {
        notificationServiceRef.current.cleanup();
      }
    };
  }, []);

  const createLoginNotification = useCallback(async (userId: number, username: string) => {
    if (!userId || !username) return;

    if (loginNotificationSentRef.current) {
      console.log('⚠️ Login notification already sent');
      return;
    }

    loginNotificationSentRef.current = true;

    try {
      console.log('🔔 Creating login notifications...');

      // 1. Notification untuk user sendiri
      await NotificationService.createLoginNotification(userId, username);

      // 2. Broadcast untuk admin/other users
      await NotificationService.createUserStatusBroadcast(userId, username, 'login');

      console.log('✅ Login notifications created successfully');
    } catch (err) {
      console.error('❌ Login notification failed:', err);
      loginNotificationSentRef.current = false; // Reset jika gagal
    }
  }, []);

  const createLogoutNotification = useCallback(async (userId: number, username: string, accessToken?: string): Promise<boolean> => {
    if (!userId || !username) {
      console.log('⚠️ Cannot create logout notification: missing user info');
      return false;
    }

    // Reset login notification flag
    loginNotificationSentRef.current = false;

    try {
      console.log('🔔 Creating logout notifications...');

      // 1. Coba kirim ke backend dulu jika ada token
      if (accessToken) {
        try {
          await NotificationService.createLogoutNotification(userId, username);
          console.log('✅ Backend logout notification sent');
        } catch (backendErr) {
          console.warn('⚠️ Backend logout notification failed:', backendErr);
          // Continue to fallback
        }
      }

      // 2. Selalu buat broadcast notification untuk admin
      try {
        await NotificationService.createUserStatusBroadcast(userId, username, 'logout');
        console.log('✅ Logout broadcast notification sent');
      } catch (broadcastErr) {
        console.warn('⚠️ Logout broadcast notification failed:', broadcastErr);
      }

      // 3. Fallback: local store notification untuk user sendiri
      try {
        const store = useNotificationStore.getState();
        const notificationId = `logout-${userId}-${Date.now()}`;

        store.addNotification({
          id: notificationId,
          userId: String(userId),
          type: 'info',
          title: 'Logged Out',
          message: `You have successfully logged out.`,
          category: 'security',
          timestamp: new Date(),
          metadata: {
            activity_type: 'logout',
            action: 'logout',
            user_id: userId,
            username: username,
            logout_time: new Date().toISOString(),
            is_local: true,
          },
        });

        console.log('✅ Local logout notification created');
      } catch (storeErr) {
        console.error('❌ Local logout notification failed:', storeErr);
      }

      return true;
    } catch (err) {
      console.error('❌ Logout notification process failed:', err);
      return false;
    }
  }, []);

  const fetchUserLoginData = useCallback(async () => {
    console.log('🔄 Checking authentication status...');
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.log('ℹ️ No access token found, user is not authenticated');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching user data from /auth/me endpoint...');
      const res = await RIMS_API.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res.data;
      console.log('✅ User data fetched successfully:', {
        userID: userData.userID,
        user_id: userData.user_id,
        role: userData.role,
      });

      setUser(userData);

      const today = new Date().toDateString();
      const lastLoginKey = `last_login_${userData.user_id}`;
      const lastLoginDate = localStorage.getItem(lastLoginKey);

      if (lastLoginDate !== today) {
        console.log('🆕 First login today detected, will create notification on next actual login');
        localStorage.setItem(lastLoginKey, today);
      }
    } catch (err) {
      console.error('❌ Failed to fetch user data:', err);
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserLoginData();
  }, [fetchUserLoginData]);

  const login = useCallback(
    async (userID: string, password: string) => {
      setError(null);
      setLoading(true);

      try {
        const token = await AuthService.login({ userID, password });
        localStorage.setItem('access_token', token);

        const res = await RIMS_API.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Reset login notification flag agar bisa dikirim lagi
        loginNotificationSentRef.current = false;

        if (res.data.user_id) {
          await createLoginNotification(res.data.user_id, res.data.userID);
          localStorage.setItem(`last_login_${res.data.user_id}`, new Date().toDateString());
        }

        setUser(res.data);

        return token;
      } finally {
        setLoading(false);
      }
    },
    [createLoginNotification],
  );

  const register = useCallback(async (data: { userID: string; password: string; role: string; gender: string }) => {
    const registerId = `register-${Date.now()}`;
    console.log(`📝 [${registerId}] Starting registration process for user:`, data.userID);

    setError(null);
    setLoading(true);

    try {
      console.log(`📝 [${registerId}] Sending registration request...`);
      const res = await RIMS_API.post('/auth/register', data);
      console.log(`✅ [${registerId}] Registration successful:`, { user_id: res.data.user_id });

      if (res.data.user_id) {
        try {
          console.log(`📝 [${registerId}] Creating welcome notification...`);
          await NotificationService.createNotification({
            userId: res.data.user_id,
            type: 'success',
            title: 'Welcome to RIMS!',
            message: `Welcome to RIMS, ${data.userID}! Your account has been successfully created.`,
            category: 'system',
            metadata: {
              registration_time: new Date().toISOString(),
              activity_type: 'registration',
              register_id: registerId,
            },
          });
          console.log(`✅ [${registerId}] Welcome notification created successfully`);
        } catch (notifError) {
          console.error(`[${registerId}] Failed to create welcome notification:`, notifError);
        }
      }

      console.log(`🎉 [${registerId}] Registration process completed for user: ${data.userID}`);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        const responseData = err.response?.data;

        let errorMessage = 'Register gagal';

        if (responseData) {
          if (Array.isArray(responseData.message)) {
            errorMessage = responseData.message
              .map((msg: any) => {
                if (typeof msg === 'string') return msg;
                if (msg.constraints) {
                  return Object.values(msg.constraints).join(', ');
                }
                return JSON.stringify(msg);
              })
              .join(', ');
          } else if (typeof responseData.message === 'string') {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          }
        }

        console.error(`[${registerId}] Registration failed:`, errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const errorMessage = err instanceof Error ? err.message : 'Register gagal';
      console.error(`[${registerId}] Registration failed:`, errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const userData = userRef.current;
    const token = localStorage.getItem('access_token');

    // Hapus token dan reset user secara instan agar route guard langsung mengarahkan ke login
    localStorage.removeItem('access_token');
    if (userData?.user_id) {
      localStorage.removeItem(`last_login_${userData.user_id}`);
    }
    setUser(null);

    if (!userData?.user_id) {
      localStorage.clear();
      return;
    }

    const { user_id, userID } = userData;

    // MENGIRIM NOTIFIKASI LOGOUT DI BACKGROUND
    if (token) {
      try {
        // Coba kirim via endpoint logout backend agar diproses penuh oleh server
        await RIMS_API.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('✅ Backend logout successful');
      } catch (err) {
        console.warn('⚠️ Backend logout endpoint failed, falling back to client-side notification:', err);
        await createLogoutNotification(user_id, userID, token);
      }
    } else {
      await createLogoutNotification(user_id, userID, undefined);
    }
  }, [createLogoutNotification]);

  const quickLogout = useCallback(() => {
    const logoutId = `quick-logout-${Date.now()}`;
    console.log(`[${logoutId}] Starting quick logout process...`);

    const currentUser = userRef.current;
    const userId = currentUser?.user_id;
    const userID = currentUser?.userID;

    console.log(`[${logoutId}] Current user:`, { userId, userID: currentUser?.userID });

    const accessToken = localStorage.getItem('access_token');

    localStorage.removeItem('access_token');
    if (userId) {
      localStorage.removeItem(`last_login_${userId}`);
    }
    setUser(null);

    if (userId && userID) {
      setTimeout(() => {
        try {
          const store = useNotificationStore.getState();
          store.addNotification({
            userId: userId.toString(),
            type: 'info',
            title: 'Logout Successful',
            message: `You have successfully logged out.`,
            category: 'security',
            metadata: {
              logout_time: new Date().toISOString(),
              activity_type: 'logout',
              user_id: userId,
              username: userID,
              is_quick_logout: true,
            },
          });
          console.log(`✅ [${logoutId}] Quick logout notification created`);
        } catch (error) {
          console.error(`[${logoutId}] Quick logout notification failed:`, error);
        }
      }, 0);
    }

    console.log(`[${logoutId}] Quick logout completed`);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user?.user_id) {
      console.log('ga bisa fetch profile id : ga ada user id');
      return null;
    }

    console.log(`fetch profile : ${user.user_id}`);
    try {
      const res = await ProfileService.getProfile(user.user_id);
      console.log(` profile berhasil di update: ${user.user_id}`);
      return res;
    } catch (err) {
      console.error(`Failed to fetch profile for user ${user.user_id}:`, err);
      if (err instanceof Error) setError(err.message);
      return null;
    }
  }, [user?.user_id]);

  const updateProfile = useCallback(
    async (data: any) => {
      if (!user?.user_id) {
        throw new Error('User ID tidak ditemukan');
      }

      const updateId = `profile-update-${Date.now()}`;
      console.log(`✏️ [${updateId}] Starting profile update for user: ${user.user_id}`);

      setUpdating(true);
      setError(null);

      try {
        const updated = await ProfileService.updateProfile(user.user_id, data);
        console.log(`✅ [${updateId}] Profile updated successfully`);

        try {
          console.log(`✏️ [${updateId}] Creating profile update notification...`);
          await NotificationService.createNotification({
            userId: user.user_id,
            type: 'info',
            title: 'Profile Updated',
            message: 'Your profile information has been successfully updated.',
            category: 'user_activity',
            metadata: {
              update_time: new Date().toISOString(),
              activity_type: 'profile_update',
              update_id: updateId,
            },
          });
          console.log(`[${updateId}] Profile update notification created`);
        } catch (notifError) {
          console.error(`[${updateId}] Failed to create profile update notification:`, notifError);
        }

        return updated;
      } catch (err) {
        console.error(`❌ [${updateId}] Profile update failed:`, err);
        if (err instanceof Error) setError(err.message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [user?.user_id],
  );

  const changePassword = useCallback(
    async (passwordData: { currentPassword: string; newPassword: string }) => {
      const changePwdId = `change-pwd-${Date.now()}`;
      console.log(`🔑 [${changePwdId}] Starting password change process...`);

      setUpdating(true);
      setError(null);

      try {
        const res = await RIMS_API.put('/auth/change-password', passwordData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });

        console.log(`✅ [${changePwdId}] Password changed successfully`);

        if (user?.user_id) {
          try {
            console.log(`🔑 [${changePwdId}] Creating password change notification...`);
            await NotificationService.createNotification({
              userId: user.user_id,
              type: 'success',
              title: 'Password Changed',
              message: 'Your password has been successfully changed.',
              category: 'security',
              metadata: {
                change_time: new Date().toISOString(),
                activity_type: 'password_change',
                change_id: changePwdId,
              },
            });
            console.log(`✅ [${changePwdId}] Password change notification created`);
          } catch (notifError) {
            console.error(`❌ [${changePwdId}] Failed to create password change notification:`, notifError);
          }
        }

        return res.data;
      } catch (err) {
        console.error(`❌ [${changePwdId}] Password change failed:`, err);
        if (err instanceof AxiosError) {
          const errorMsg = err.response?.data?.message || 'Gagal mengubah password';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [user?.user_id],
  );

  const requestPasswordReset = useCallback(async (userID: string) => {
    const resetId = `pwd-reset-${Date.now()}`;
    console.log(`🔐 [${resetId}] Requesting password reset for user: ${userID}`);

    setLoading(true);
    setError(null);

    try {
      const res = await RIMS_API.post('/auth/forgot-password', { userID });
      console.log(`✅ [${resetId}] Password reset request sent successfully`);
      return res.data;
    } catch (err) {
      console.error(` [${resetId}] Password reset request failed:`, err);
      if (err instanceof AxiosError) {
        const errorMsg = err.response?.data?.message || 'Gagal meminta reset password';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackUserActivity = useCallback(
    async (activity: string, metadata?: any) => {
      if (!user?.user_id) {
        console.log('⚠️ Cannot track activity: no user ID');
        return;
      }

      const activityId = `activity-${Date.now()}`;
      console.log(`📊 [${activityId}] Tracking user activity:`, { activity, user_id: user.user_id });

      try {
        await NotificationService.createNotification({
          userId: user.user_id,
          type: 'info',
          title: 'User Activity',
          message: activity,
          category: 'user_activity',
          metadata: {
            activity_time: new Date().toISOString(),
            activity_type: 'user_action',
            activity_id: activityId,
            ...metadata,
          },
        });
        console.log(`✅ [${activityId}] Activity tracked successfully`);
      } catch (error) {
        console.error(`❌ [${activityId}] Failed to track user activity:`, error);
      }
    },
    [user?.user_id],
  );

  const testLogoutNotification = useCallback(async () => {
    if (!user?.user_id || !user?.userID) {
      console.error('❌ No user logged in to test logout notification');
      return;
    }

    const testId = `test-${Date.now()}`;
    console.log(`🧪 [${testId}] Testing logout notification...`);
    await createLogoutNotification(user.user_id, user.userID, localStorage.getItem('access_token') || undefined);

    setTimeout(() => {
      console.log(`🔍 [${testId}] Checking notification store...`);
      const store = useNotificationStore.getState();
      const logoutNotifications = store.notifications.filter((n) => n.metadata?.activity_type === 'logout');
      console.log(`📊 [${testId}] Logout notifications in store:`, logoutNotifications.length);
      console.log(`📋 [${testId}] Logout notifications details:`, logoutNotifications);
    }, 1000);
  }, [user, createLogoutNotification]);

  return {
    user,
    loading,
    updating,
    error,
    login,
    register,
    logout,
    quickLogout,
    fetchProfile,
    updateProfile,
    changePassword,
    requestPasswordReset,
    trackUserActivity,
    testLogoutNotification,
  };
};
