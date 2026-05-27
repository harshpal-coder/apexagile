import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      const res = await axios.get(`${API_URL}/collaboration/notifications`);
      const notifications = res.data.notifications || [];
      const unread = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount: unread });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_URL}/collaboration/notifications/${notificationId}/read`);
      set(state => {
        const updated = state.notifications.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      });
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  }
}));
