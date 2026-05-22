import { useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  useNotificationStore,
  Notification,
  NotificationType,
} from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for notifications functionality
 * Handles fetching, marking as read, and real-time updates
 */
export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateUnreadCount,
    setLoading,
    setError,
  } = useNotificationStore();
  const { user } = useAuthStore();

  /**
   * Fetch all notifications for the current user
   */
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select(
          `
            id,
            user_id,
            type,
            title,
            message,
            entity_type,
            entity_id,
            sender_id,
            is_read,
            created_at,
            sender:user_profiles!notifications_sender_id_fkey(
              id,
              full_name,
              display_name,
              profile_picture_url
            )
          `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        setError(fetchError.message);
        return { success: false };
      }

      const formattedNotifications: Notification[] = (data || []).map((notif: any) => ({
        id: notif.id,
        userId: notif.user_id,
        type: notif.type as NotificationType,
        title: notif.title,
        message: notif.message,
        entityType: notif.entity_type,
        entityId: notif.entity_id,
        senderId: notif.sender_id,
        senderName: notif.sender?.full_name || notif.sender?.display_name || null,
        senderAvatar: notif.sender?.profile_picture_url || null,
        isRead: notif.is_read,
        createdAt: notif.created_at,
      }));

      setNotifications(formattedNotifications);
      updateUnreadCount();
      return { success: true, data: formattedNotifications };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user, setNotifications, updateUnreadCount, setLoading, setError]);

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) {
        return { success: false };
      }

      try {
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        markAsRead(notificationId);
        updateUnreadCount();
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, markAsRead, updateUnreadCount, setError]
  );

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user?.id) {
      return { success: false };
    }

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) {
        setError(updateError.message);
        return { success: false };
      }

      markAllAsRead();
      updateUnreadCount();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
      return { success: false };
    }
  }, [user, markAllAsRead, updateUnreadCount, setError]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.id) {
        return { success: false };
      }

      try {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (deleteError) {
          setError(deleteError.message);
          return { success: false };
        }

        removeNotification(notificationId);
        updateUnreadCount();
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, removeNotification, updateUnreadCount, setError]
  );

  /**
   * Register device token for push notifications
   * Note: Requires expo-notifications package and proper FCM/APNs setup
   */
  const registerDeviceToken = useCallback(
    async (token: string, platform: 'ios' | 'android' | 'web') => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        // Check if token already exists
        const { data: existing } = await supabase
          .from('device_tokens')
          .select('id')
          .eq('user_id', user.id)
          .eq('token', token)
          .single();

        if (existing) {
          // Update timestamp
          await supabase
            .from('device_tokens')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existing.id);
          return { success: true };
        }

        // Insert new token
        const { error: insertError } = await supabase.from('device_tokens').insert({
          user_id: user.id,
          token,
          platform,
        });

        if (insertError) {
          throw insertError;
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register device token';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [user, setError]
  );

  /**
   * Unregister device token
   */
  const unregisterDeviceToken = useCallback(
    async (token: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { error: deleteError } = await supabase
          .from('device_tokens')
          .delete()
          .eq('user_id', user.id)
          .eq('token', token);

        if (deleteError) {
          throw deleteError;
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to unregister device token';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [user, setError]
  );

  /**
   * Get notification preferences (stored in user metadata)
   */
  const getNotificationPreferences = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const preferences = profile?.notification_preferences || {
        matchStart: true,
        scoreUpdate: true,
        teamInvite: true,
        challengeRequest: true,
        paymentUpdate: true,
        adminMessage: true,
      };

      return { success: true, data: preferences };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get notification preferences';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = useCallback(
    async (preferences: Record<string, boolean>) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ notification_preferences: preferences })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update notification preferences';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [user, setError]
  );

  /**
   * Subscribe to real-time notification updates
   */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Handle new notification
          const newNotif = payload.new as any;
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    registerDeviceToken,
    unregisterDeviceToken,
    getNotificationPreferences,
    updateNotificationPreferences,
  };
};

