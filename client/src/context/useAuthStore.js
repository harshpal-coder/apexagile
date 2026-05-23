import { create } from 'zustand';
import axios from 'axios';

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

// Setup axios default token if stored
const token = localStorage.getItem('jira_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: userToken, user } = res.data;
      
      localStorage.setItem('jira_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      set({ 
        token: userToken, 
        user, 
        isAuthenticated: true, 
        loading: false 
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  googleLogin: async (credential) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/google-login`, { credential });
      const { token: userToken, user } = res.data;
      
      localStorage.setItem('jira_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      set({ 
        token: userToken, 
        user, 
        isAuthenticated: true, 
        loading: false 
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Google Sign-in failed';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  register: async (username, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password, role });
      const { token: userToken, user } = res.data;

      localStorage.setItem('jira_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      set({
        token: userToken,
        user,
        isAuthenticated: true,
        loading: false
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('jira_token');
    delete axios.defaults.headers.common['Authorization'];
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  getProfile: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      // Token is likely invalid/expired
      localStorage.removeItem('jira_token');
      delete axios.defaults.headers.common['Authorization'];
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      set({ user: res.data.user, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Update failed';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  }
}));
