import { create } from 'zustand';
import axios from 'axios';

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export const useSprintStore = create((set, get) => ({
  sprints: [],
  activeSprint: null,
  sprintStats: null,
  loading: false,
  error: null,

  fetchSprints: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/sprints/project/${projectId}`);
      const sprints = res.data.sprints || [];
      const active = sprints.find(s => s.status === 'Active') || null;
      
      set({ 
        sprints, 
        activeSprint: active,
        loading: false 
      });

      if (active) {
        get().fetchSprintProgress(active._id);
      } else {
        set({ sprintStats: null });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch sprints', loading: false });
    }
  },

  createSprint: async (name, goal, projectId) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/sprints`, { name, goal, projectId });
      const newSprint = res.data.sprint;
      set(state => ({
        sprints: [...state.sprints, newSprint],
        loading: false
      }));
      return { success: true, sprint: newSprint };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create sprint';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  startSprint: async (sprintId, startDate, endDate) => {
    set({ loading: true });
    try {
      const res = await axios.put(`${API_URL}/sprints/${sprintId}/start`, { startDate, endDate });
      const updated = res.data.sprint;

      set(state => ({
        sprints: state.sprints.map(s => s._id === sprintId ? updated : s),
        activeSprint: updated,
        loading: false
      }));

      get().fetchSprintProgress(sprintId);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to start sprint';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  completeSprint: async (sprintId) => {
    set({ loading: true });
    try {
      const res = await axios.put(`${API_URL}/sprints/${sprintId}/complete`);
      const updated = res.data.sprint;

      set(state => ({
        sprints: state.sprints.map(s => s._id === sprintId ? updated : s),
        activeSprint: null,
        sprintStats: null,
        loading: false
      }));

      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to complete sprint';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchSprintProgress: async (sprintId) => {
    try {
      const res = await axios.get(`${API_URL}/sprints/${sprintId}/progress`);
      set({ sprintStats: res.data.stats });
    } catch (err) {
      console.error('Failed to fetch sprint stats:', err);
    }
  }
}));
