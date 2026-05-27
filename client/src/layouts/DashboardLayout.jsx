import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  KanbanSquare,
  Milestone,
  Users,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
  FolderDot,
  CheckSquare,
  Search,
  Briefcase,
  Layers,
  ChevronLeft,
  ChevronsUpDown,
  Tag,
  Calendar,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useTaskStore } from '../context/useTaskStore';
import { useSprintStore } from '../context/useSprintStore';
import { useNotificationStore } from '../context/useNotificationStore';
import { useSaaSStore } from '../context/useSaaSStore';
import { navigate, usePath } from '../utils/router';
import axios from 'axios';

export default function DashboardLayout({ children }) {
  const currentPath = usePath();
  const { user, logout } = useAuthStore();
  const {
    workspaces,
    activeWorkspace,
    projects,
    activeProject,
    projectMembers,
    setActiveWorkspace,
    setActiveProject,
    createProject,
    createWorkspace,
    fetchWorkspaces
  } = useWorkspaceStore();

  const { createTask } = useTaskStore();
  const { openUpgradeModal } = useSaaSStore();
  const { fetchSprints } = useSprintStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();

  // Responsive / Collapsible States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // UI Dropdown States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  
  // Modals
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskLabels, setTaskLabels] = useState('');

  // New Project form state
  const [newProjName, setNewProjName] = useState('');
  const [newProjKey, setNewProjKey] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // New Workspace form state
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');

  // Refs for closing dropdowns
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const workspaceRef = useRef(null);
  const projectRef = useRef(null);

  // Theme Initializer
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click Outside Hook to close menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) setWorkspaceOpen(false);
      if (projectRef.current && !projectRef.current.contains(event.target)) setProjectOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch base structures
  useEffect(() => {
    fetchWorkspaces();
    fetchNotifications();

    // Mount global SaaS limit interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 402) {
          const message = error.response.data?.message || '';
          
          // Detect limit details
          let limitType = 'workspace';
          if (message.toLowerCase().includes('member')) limitType = 'member';
          else if (message.toLowerCase().includes('task')) limitType = 'task';
          
          // Open SaaS Upgrade Modal automatically!
          useSaaSStore.getState().openUpgradeModal('Pro', limitType);
        }
        return Promise.reject(error);
      }
    );

    // Set polling for notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      clearInterval(interval);
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Update active sprints when project switches
  useEffect(() => {
    if (activeProject) {
      fetchSprints(activeProject._id);
    }
  }, [activeProject]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !activeProject) return;

    const labelArray = taskLabels
      ? taskLabels.split(',').map(l => l.trim()).filter(Boolean)
      : [];

    const res = await createTask({
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      assigneeId: taskAssignee || null,
      projectId: activeProject._id,
      labels: labelArray
    });

    if (res.success) {
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('Medium');
      setTaskAssignee('');
      setTaskLabels('');
      setCreateTaskOpen(false);
      
      // Force reload page data
      if (currentPath === '/board' || currentPath === '/dashboard' || currentPath === '/sprint') {
        navigate(currentPath);
      }
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName || !activeWorkspace) return;

    const res = await createProject(newProjName, newProjDesc, activeWorkspace._id, newProjKey);
    if (res.success) {
      setNewProjName('');
      setNewProjKey('');
      setNewProjDesc('');
      setCreateProjectOpen(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName) return;

    const res = await createWorkspace(newWsName, newWsDesc);
    if (res.success) {
      setNewWsName('');
      setNewWsDesc('');
      setCreateWorkspaceOpen(false);
    }
  };

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Kanban Board', path: '/board', icon: KanbanSquare },
    { name: 'Sprints & Backlog', path: '/sprint', icon: Milestone },
    { name: 'Timeline & Gantt', path: '/timeline', icon: Calendar },
    { name: 'Team Collaboration', path: '/team', icon: Users },
    { name: 'User Profile', path: '/profile', icon: User },
    { name: 'Workspace Admin', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Sidebar - Desktop Collapsible */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 glass-panel border-r border-slate-200 dark:border-darkBorder/40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-200 dark:border-darkBorder/30">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-brand-500 p-2 rounded-xl flex-shrink-0">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
                ApexAgile
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-darkBorder/60 text-slate-500 dark:text-slate-400"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Workspace Switcher Panel */}
        {!sidebarCollapsed && (
          <div className="px-4 py-4 border-b border-slate-200 dark:border-darkBorder/30 space-y-2">
            {/* Workspace Selector */}
            <div className="relative" ref={workspaceRef}>
              <button
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-200/50 dark:bg-darkSurface/60 border border-slate-200 dark:border-darkBorder hover:bg-slate-200 dark:hover:bg-darkSurface transition-all text-xs font-semibold"
              >
                <div className="flex items-center gap-2 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">{activeWorkspace ? activeWorkspace.name : 'No Workspace'}</span>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              </button>
              <AnimatePresence>
                {workspaceOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass p-1 max-h-48 overflow-y-auto text-xs"
                  >
                    {workspaces.map(ws => (
                      <button
                        key={ws._id}
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setWorkspaceOpen(false);
                        }}
                        className={`w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder/40 transition-colors font-medium truncate flex items-center justify-between ${
                          activeWorkspace && activeWorkspace._id === ws._id ? 'text-brand-500 font-bold bg-brand-500/5' : ''
                        }`}
                      >
                        {ws.name}
                        {activeWorkspace && activeWorkspace._id === ws._id && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setWorkspaceOpen(false);
                        setCreateWorkspaceOpen(true);
                      }}
                      className="w-full text-left py-2 px-2.5 rounded-lg font-bold text-brand-500 hover:bg-brand-500/5 transition-colors border-t border-slate-200 dark:border-darkBorder/40 flex items-center gap-1.5 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Workspace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Project Selector */}
            <div className="relative" ref={projectRef}>
              <button
                onClick={() => setProjectOpen(!projectOpen)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-200/50 dark:bg-darkSurface/60 border border-slate-200 dark:border-darkBorder hover:bg-slate-200 dark:hover:bg-darkSurface transition-all text-xs font-semibold"
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderDot className="w-3.5 h-3.5 text-brand-400" />
                  <span className="truncate">{activeProject ? `${activeProject.key} - ${activeProject.name}` : 'No Project'}</span>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              </button>
              <AnimatePresence>
                {projectOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass p-1 max-h-48 overflow-y-auto text-xs"
                  >
                    {projects.map(p => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setActiveProject(p);
                          setProjectOpen(false);
                        }}
                        className={`w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder/40 transition-colors font-medium truncate flex items-center justify-between ${
                          activeProject && activeProject._id === p._id ? 'text-brand-500 font-bold bg-brand-500/5' : ''
                        }`}
                      >
                        <span className="truncate">[{p.key}] {p.name}</span>
                        {activeProject && activeProject._id === p._id && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setProjectOpen(false);
                        setCreateProjectOpen(true);
                      }}
                      className="w-full text-left py-2 px-2.5 rounded-lg font-bold text-brand-500 hover:bg-brand-500/5 transition-colors border-t border-slate-200 dark:border-darkBorder/40 flex items-center gap-1.5 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {sidebarLinks.map(link => {
            const isActive = currentPath === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl font-semibold transition-all text-sm group ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-premium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-darkBorder/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                {!sidebarCollapsed && <span>{link.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Gold SaaS Upgrade Promo banner in sidebar */}
        {!sidebarCollapsed && user?.subscription?.plan === 'Free' && (
          <div className="mx-4 my-2 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 text-xs space-y-2.5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>ApexAgile Free</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-normal">
              Unlock sprints, burndown charts, Gantt timelines, and invite up to 15 members!
            </p>
            <button
              onClick={() => openUpgradeModal('Pro', null)}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              💎 Upgrade to Pro
            </button>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-darkBorder/30">
          <button
            onClick={() => setCreateTaskOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium hover:shadow-premium-hover flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>Create Issue</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-darkSurface border-r border-slate-200 dark:border-darkBorder shadow-glass flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-darkBorder/40">
                <span className="font-extrabold text-lg bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
                  ApexAgile Mobile
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-darkBorder"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Switches */}
              <div className="p-4 border-b border-slate-200 dark:border-darkBorder/40 space-y-2">
                {/* Ws Selector */}
                <select
                  value={activeWorkspace?._id || ''}
                  onChange={(e) => {
                    const found = workspaces.find(ws => ws._id === e.target.value);
                    if (found) setActiveWorkspace(found);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-darkBorder bg-slate-100 dark:bg-darkBg text-xs font-semibold focus:outline-none"
                >
                  {workspaces.map(ws => (
                    <option key={ws._id} value={ws._id}>{ws.name}</option>
                  ))}
                </select>

                {/* Proj Selector */}
                <select
                  value={activeProject?._id || ''}
                  onChange={(e) => {
                    const found = projects.find(p => p._id === e.target.value);
                    if (found) setActiveProject(found);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-darkBorder bg-slate-100 dark:bg-darkBg text-xs font-semibold focus:outline-none"
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>[{p.key}] {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 px-3 py-6 space-y-1">
                {sidebarLinks.map(link => {
                  const isActive = currentPath === link.path;
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        navigate(link.path);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl font-semibold transition-all text-sm ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-premium'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-darkBorder/40'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-darkBorder/40">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setCreateTaskOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Issue
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="sticky top-0 z-30 px-6 py-4 glass-panel border-b border-slate-200 dark:border-darkBorder/30 flex items-center justify-between">
          {/* Left panel: Hamburger menu + breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-darkBorder/60 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={() => navigate('/dashboard')}>
                {activeWorkspace ? activeWorkspace.name : 'Workspace'}
              </span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-100 font-bold">
                {activeProject ? activeProject.name : 'Project'}
              </span>
            </div>
          </div>

          {/* Right panel: Search, Notifications, Theme, Profile */}
          <div className="flex items-center gap-4">
            {/* Search mock */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search issue..."
                className="pl-9 pr-4 py-1.5 bg-slate-200/50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder/70 rounded-full placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors text-xs font-semibold w-48 focus:w-60"
              />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-darkBorder/60 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-darkBorder/60 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 right-0 mt-3.5 w-80 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass p-4 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-darkBorder/40 pb-2">
                      <span className="font-bold text-sm">Notifications</span>
                      <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} Unread
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 py-1 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-center text-slate-500 py-6 font-medium">All caught up! No alerts.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            className={`p-2.5 rounded-xl border transition-colors relative flex items-start gap-2.5 ${
                              n.read
                                ? 'bg-slate-50 dark:bg-darkBg/20 border-slate-200/50 dark:border-darkBorder/20'
                                : 'bg-brand-500/5 dark:bg-brand-500/5 border-brand-500/20'
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.content}</p>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n._id)}
                                className="text-[9px] font-bold text-brand-400 hover:text-brand-300 flex-shrink-0"
                              >
                                Read
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-slate-200/40 dark:bg-darkSurface/40 p-1.5 pr-3 rounded-full hover:bg-slate-200/60 dark:hover:bg-darkSurface transition-all"
              >
                <img
                  src={user ? user.avatar : 'https://api.dicebear.com/7.x/adventurer/svg?seed=jira'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full bg-slate-700"
                />
                <div className="text-left hidden sm:block">
                  <h5 className="text-xs font-bold leading-none truncate max-w-20">{user ? user.username : 'User'}</h5>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wide uppercase leading-none mt-0.5 block">
                    {user ? user.role : 'Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 right-0 mt-3.5 w-52 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass p-1 text-xs"
                  >
                    <div className="px-3 py-3.5 border-b border-slate-200 dark:border-darkBorder/40">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{user ? user.username : 'Ninja User'}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{user ? user.email : 'ninja@agile.com'}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder/40 transition-colors font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" /> My Profile
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder/40 transition-colors font-medium flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-400" /> Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Pages Mount */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

      {/* Universal CREATE TASK Modal */}
      <AnimatePresence>
        {createTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateTaskOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl p-8 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass text-xs space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-darkBorder/40 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold">Create Task / Issue</h3>
                </div>
                <button
                  onClick={() => setCreateTaskOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!activeProject ? (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>No active projects found. Please create a project first!</span>
                </div>
              ) : (
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Project Target</label>
                    <div className="py-2.5 px-3 bg-slate-100 dark:bg-darkBg rounded-xl border border-slate-200 dark:border-darkBorder font-bold text-slate-700 dark:text-slate-300">
                      [{activeProject.key}] {activeProject.name}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Issue Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Implement OAuth login buttons"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                    <textarea
                      placeholder="Add detailed markdown or specifications..."
                      rows={4}
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 text-xs font-semibold"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assign Member</label>
                      <select
                        value={taskAssignee}
                        onChange={(e) => setTaskAssignee(e.target.value)}
                        className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 text-xs font-semibold"
                      >
                        <option value="">Unassigned</option>
                        {projectMembers.map(m => (
                          <option key={m._id} value={m._id}>{m.username}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      Tags / Labels (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. backend, bug, security"
                      value={taskLabels}
                      onChange={(e) => setTaskLabels(e.target.value)}
                      className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateTaskOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium hover:shadow-premium-hover transition-all"
                    >
                      Create Issue
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Universal CREATE PROJECT Modal */}
      <AnimatePresence>
        {createProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateProjectOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-8 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass text-xs space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-darkBorder/40 pb-3">
                <div className="flex items-center gap-2">
                  <FolderDot className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold">Add Project</h3>
                </div>
                <button
                  onClick={() => setCreateProjectOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Billing Dashboard"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Project Key Prefix</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. BILL"
                    value={newProjKey}
                    onChange={(e) => setNewProjKey(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs uppercase"
                  />
                  <p className="text-[9px] text-slate-500">Key prefix for sequentially auto-generated issues (e.g. BILL-1, BILL-2).</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    placeholder="Describe this project scope..."
                    rows={3}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateProjectOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium hover:shadow-premium-hover transition-all"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Universal CREATE WORKSPACE Modal */}
      <AnimatePresence>
        {createWorkspaceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateWorkspaceOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-8 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass text-xs space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-darkBorder/40 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold">Add Workspace</h3>
                </div>
                <button
                  onClick={() => setCreateWorkspaceOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Workspace Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Solutions"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    placeholder="Scope, vision, or details of this workspace..."
                    rows={3}
                    value={newWsDesc}
                    onChange={(e) => setNewWsDesc(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateWorkspaceOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium hover:shadow-premium-hover transition-all"
                  >
                    Save Workspace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
