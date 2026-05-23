import { create } from 'zustand';
import axios from 'axios';

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  activeTask: null,
  activeComments: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId, sprintId = null, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = {};
      if (sprintId) params.sprintId = sprintId;
      if (filters.assignee) params.assignee = filters.assignee;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await axios.get(`${API_URL}/tasks/project/${projectId}`, { params });
      set({ tasks: res.data.tasks || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch tasks', loading: false });
    }
  },

  createTask: async (taskData) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/tasks`, taskData);
      const newTask = res.data.task;
      set(state => ({
        tasks: [newTask, ...state.tasks],
        loading: false
      }));
      return { success: true, task: newTask };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create task';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      // Find old task for revert potential or quick updates
      const oldTasks = [...get().tasks];
      
      // Update locally first (Optimistic)
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? { ...t, ...updates } : t),
        activeTask: state.activeTask && state.activeTask._id === taskId ? { ...state.activeTask, ...updates } : state.activeTask
      }));

      const res = await axios.put(`${API_URL}/tasks/${taskId}`, updates);
      
      // Sync with server results
      const updated = res.data.task;
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? updated : t),
        activeTask: state.activeTask && state.activeTask._id === taskId ? updated : state.activeTask
      }));

      return { success: true };
    } catch (err) {
      // Revert on failure
      const errMsg = err.response?.data?.message || 'Failed to update task';
      set({ error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  dragTask: async (taskId, newStatus) => {
    const oldTasks = [...get().tasks];
    
    // 1. Optimistic Update in Store
    set(state => ({
      tasks: state.tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t)
    }));

    try {
      // 2. Put status to server
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      return { success: true };
    } catch (err) {
      // 3. Rollback state if server returns error
      set({ tasks: oldTasks });
      const errMsg = err.response?.data?.message || 'Failed to move task';
      return { success: false, error: errMsg };
    }
  },

  deleteTask: async (taskId) => {
    set({ loading: true });
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== taskId),
        activeTask: state.activeTask && state.activeTask._id === taskId ? null : state.activeTask,
        loading: false
      }));
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete task';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchTaskDetails: async (taskId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_URL}/tasks/${taskId}`);
      set({ activeTask: res.data.task, loading: false });
      get().fetchComments(taskId);
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch details', loading: false });
    }
  },

  fetchComments: async (taskId) => {
    try {
      const res = await axios.get(`${API_URL}/tasks/${taskId}/comments`);
      set({ activeComments: res.data.comments || [] });
    } catch (err) {
      console.error('Comments error:', err);
    }
  },

  addComment: async (taskId, content) => {
    try {
      const res = await axios.post(`${API_URL}/tasks/${taskId}/comments`, { content });
      const newComment = res.data.comment;
      set(state => ({
        activeComments: [...state.activeComments, newComment]
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to post comment' };
    }
  },

  addAttachment: async (taskId, name, size) => {
    try {
      const res = await axios.post(`${API_URL}/tasks/${taskId}/attachments`, { name, size });
      const updatedTask = res.data.task;
      
      // Update local task
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? updatedTask : t),
        activeTask: state.activeTask && state.activeTask._id === taskId ? updatedTask : state.activeTask
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to attach file' };
    }
  }
}));
