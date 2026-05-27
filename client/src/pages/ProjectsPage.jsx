import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Users,
  ChevronRight,
  Plus,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useTaskStore } from '../context/useTaskStore';
import { useAuthStore } from '../context/useAuthStore';
import { navigate } from '../utils/router';
import axios from 'axios';
import { API_URL } from '../config';

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const {
    workspaces,
    activeWorkspace,
    projects,
    setActiveProject,
    createProject
  } = useWorkspaceStore();

  const [projectStats, setProjectStats] = useState({});
  const [createProjOpen, setCreateProjOpen] = useState(false);
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');
  const [projDesc, setProjDesc] = useState('');

  // Fetch task progress ratios for each project
  useEffect(() => {
    const fetchStats = async () => {
      const stats = {};
      await Promise.all(
        projects.map(async (p) => {
          try {
            const res = await axios.get(`${API_URL}/tasks/project/${p._id}`);
            const tasks = res.data.tasks || [];
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'Done').length;
            stats[p._id] = {
              total,
              completed,
              percent: total > 0 ? Math.round((completed / total) * 100) : 0
            };
          } catch (err) {
            stats[p._id] = { total: 0, completed: 0, percent: 0 };
          }
        })
      );
      setProjectStats(stats);
    };

    if (projects.length > 0) {
      fetchStats();
    }
  }, [projects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projName || !activeWorkspace) return;

    const res = await createProject(projName, projDesc, activeWorkspace._id, projKey);
    if (res.success) {
      setProjName('');
      setProjKey('');
      setProjDesc('');
      setCreateProjOpen(false);
    }
  };

  const handleSelectProject = (proj) => {
    setActiveProject(proj);
    navigate('/board');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-darkBorder/40 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Active Projects</h2>
          <p className="text-slate-400 text-sm mt-1">
            List of agile software and product projects inside the workspace:{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {activeWorkspace ? activeWorkspace.name : 'Apex Space'}
            </span>
          </p>
        </div>

        <button
          onClick={() => setCreateProjOpen(true)}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-darkBorder/60 p-8 space-y-4">
            <FolderKanban className="w-12 h-12 text-slate-500 opacity-50 mx-auto" />
            <h4 className="text-lg font-bold">No projects created yet!</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Sprints, Kanban boards, and issue backlogs exist under projects. Click "Create Project" above to get started!
            </p>
          </div>
        ) : (
          projects.map(proj => {
            const stats = projectStats[proj._id] || { total: 0, completed: 0, percent: 0 };
            return (
              <motion.div
                key={proj._id}
                variants={cardVariants}
                onClick={() => handleSelectProject(proj)}
                className="group p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-premium cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    {/* Key badge & Name */}
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-brand-500/10 text-brand-400 font-bold font-mono text-[10px] tracking-wide uppercase">
                        {proj.key}
                      </span>
                      <h4 className="text-xl font-bold group-hover:text-brand-500 transition-colors mt-1.5">
                        {proj.name}
                      </h4>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1.5 transition-all flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-2">
                    {proj.description || 'No description added to this project scope.'}
                  </p>
                </div>

                {/* Progress bar and members count */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-darkBorder/30">
                  {/* Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>PROJECT PROGRESS</span>
                      <span>{stats.percent}% ({stats.completed}/{stats.total} Issues)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-darkBg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Lead and actions */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                      <span>Lead: </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {proj.lead === user?._id ? 'You' : 'Sarah PM'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-brand-500 group-hover:underline flex items-center gap-1">
                      Open Board <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* CREATE PROJECT Modal popover */}
      <AnimatePresence>
        {createProjOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateProjOpen(false)}
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
                  <FolderKanban className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold">Add Project</h3>
                </div>
                <button
                  onClick={() => setCreateProjOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Mobile Redesign"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Project Key Prefix</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. ACM"
                    value={projKey}
                    onChange={(e) => setProjKey(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs uppercase"
                  />
                  <p className="text-[9px] text-slate-500">Auto prefix for issues (e.g. ACM-1, ACM-2).</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    placeholder="Describe this project scope..."
                    rows={3}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateProjOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium transition-all"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
