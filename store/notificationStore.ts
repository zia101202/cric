import { create } from 'zustand';

/**
 * Notification types
 */
export type NotificationType =
  | 'like'
  | 'comment'
  | 'team_join_request'
  | 'tournament_invite'
  | 'match_update'
  | 'score_approval'
  | 'admin_announcement'
  | 'message'
  | 'follow';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * Notifications state interface
 */
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  updateUnreadCount: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

/**
 * Zustand store for managing notifications
 * Provides global access to notifications with unread count tracking
 */
export const useNotificationStore = create<NotificationsState>((set, get) => ({
  ...initialState,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      error: null,
    }),

  addNotification: (notification) =>
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      const newNotifications = state.notifications.filter((n) => n.id !== notificationId);
      return {
        notifications: newNotifications,
        unreadCount: notification && !notification.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  updateUnreadCount: () =>
    set((state) => ({
      unreadCount: state.notifications.filter((n) => !n.isRead).length,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

