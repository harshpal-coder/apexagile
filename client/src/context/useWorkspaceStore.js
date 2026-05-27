import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  projects: [],
  activeProject: null,
  projectMembers: [],
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/projects/workspaces`);
      const workspaces = res.data.workspaces || [];
      
      set({ 
        workspaces, 
        loading: false 
      });

      // Auto-set first workspace if none is active
      if (workspaces.length > 0 && !get().activeWorkspace) {
        get().setActiveWorkspace(workspaces[0]);
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch workspaces', loading: false });
    }
  },

  createWorkspace: async (name, description) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/projects/workspaces`, { name, description });
      const newWs = res.data.workspace;
      set(state => ({
        workspaces: [...state.workspaces, newWs],
        activeWorkspace: state.activeWorkspace ? state.activeWorkspace : newWs,
        loading: false
      }));
      if (!get().activeWorkspace) {
        get().setActiveWorkspace(newWs);
      }
      return { success: true, workspace: newWs };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create workspace';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace, projects: [], activeProject: null });
    if (workspace) {
      get().fetchProjects(workspace._id);
    }
  },

  fetchProjects: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/projects/workspace/${workspaceId}`);
      const projects = res.data.projects || [];
      set({ projects, loading: false });
      
      // Auto-set first project if none active
      if (projects.length > 0 && !get().activeProject) {
        get().setActiveProject(projects[0]);
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch projects', loading: false });
    }
  },

  createProject: async (name, description, workspaceId, key) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/projects`, { name, description, workspaceId, key });
      const newProj = res.data.project;
      set(state => ({
        projects: [...state.projects, newProj],
        activeProject: state.activeProject ? state.activeProject : newProj,
        loading: false
      }));
      if (!get().activeProject) {
        get().setActiveProject(newProj);
      }
      return { success: true, project: newProj };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create project';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  setActiveProject: async (project) => {
    set({ activeProject: project, loading: true });
    if (project) {
      try {
        const res = await axios.get(`${API_URL}/projects/${project._id}`);
        set({ 
          activeProject: res.data.project,
          projectMembers: res.data.project.memberDetails || [],
          loading: false 
        });
      } catch (err) {
        set({ projectMembers: [], loading: false });
      }
    } else {
      set({ projectMembers: [], loading: false });
    }
  },

  addProjectMember: async (projectId, email) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/projects/${projectId}/members`, { email });
      set({ loading: false });
      // Refresh active project to get fresh member lists
      if (get().activeProject && get().activeProject._id === projectId) {
        get().setActiveProject(get().activeProject);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add member';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  }
}));
