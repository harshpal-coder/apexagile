import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuthStore } from './useAuthStore';

export const useSaaSStore = create((set, get) => ({
  usage: null,
  upgradeModalOpen: false,
  targetTier: 'Pro',
  limitDetails: null, // 'workspace' | 'member' | 'task' | null
  loading: false,
  error: null,

  fetchUsage: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const url = workspaceId 
        ? `${API_URL}/billing/usage?workspaceId=${workspaceId}`
        : `${API_URL}/billing/usage`;
      const res = await axios.get(url);
      set({ usage: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch billing usage', loading: false });
    }
  },

  openUpgradeModal: (tier = 'Pro', limitType = null) => {
    set({ upgradeModalOpen: true, targetTier: tier, limitDetails: limitType });
  },

  closeUpgradeModal: () => {
    set({ upgradeModalOpen: false, limitDetails: null });
  },

  upgradeSubscription: async (plan, paymentCard, customerName) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/billing/upgrade`, { plan, paymentCard, customerName });
      
      // Update local usage state
      set({ loading: false });
      
      // Update auth store profile info so subscription displays correctly
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAuthStore.setState({
          user: {
            ...authUser,
            subscription: res.data.user.subscription
          }
        });
      }

      // Refresh billing details
      await get().fetchUsage();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to upgrade subscription';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  cancelSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/billing/cancel`);
      set({ loading: false });

      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAuthStore.setState({
          user: {
            ...authUser,
            subscription: res.data.user.subscription
          }
        });
      }

      await get().fetchUsage();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to cancel subscription';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  }
}));
