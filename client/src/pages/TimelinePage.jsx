import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Lock, ArrowRight, Layers, CheckSquare, Clock } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useTaskStore } from '../context/useTaskStore';
import { useSaaSStore } from '../context/useSaaSStore';

export default function TimelinePage() {
  const { user } = useAuthStore();
  const { activeProject } = useWorkspaceStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { openUpgradeModal } = useSaaSStore();

  const isFree = user?.subscription?.plan === 'Free';

  useEffect(() => {
    if (activeProject) {
      fetchTasks(activeProject._id);
    }
  }, [activeProject]);

  // Generate mock start & end dates for tasks to build Gantt chart bars
  const timelineTasks = tasks.map((t, idx) => {
    const createdDate = new Date(t.createdAt || Date.now());
    const dueDate = t.dueDate ? new Date(t.dueDate) : new Date(createdDate.getTime() + (3 + (idx % 4)) * 24 * 60 * 60 * 1000);
    
    // Calculate total days from project start (mock project starts 2 days before first task created)
    return {
      ...t,
      startDate: createdDate,
      endDate: dueDate,
      durationDays: Math.max(2, Math.ceil((dueDate - createdDate) / (1000 * 60 * 60 * 24)))
    };
  });

  // Calculate grid weeks headers
  const getTimelineDays = () => {
    const days = [];
    const base = new Date();
    base.setDate(base.getDate() - 3); // Center around active period
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const daysHeader = getTimelineDays();

  // Find percentage offset inside our 14-day timeline view
  const calculateBarPosition = (task) => {
    const startView = daysHeader[0];
    const endView = daysHeader[daysHeader.length - 1];

    let startOffsetDays = (task.startDate - startView) / (1000 * 60 * 60 * 24);
    let spanDays = task.durationDays;

    // Bounds clipping
    if (startOffsetDays < 0) {
      spanDays += startOffsetDays;
      startOffsetDays = 0;
    }
    
    const maxDays = 14;
    const startPercent = Math.min(100, Math.max(0, (startOffsetDays / maxDays) * 100));
    const widthPercent = Math.min(100 - startPercent, Math.max(10, (spanDays / maxDays) * 100));

    return { left: `${startPercent}%`, width: `${widthPercent}%` };
  };

  const priorityColors = {
    Critical: 'from-red-500 to-rose-600',
    High: 'from-orange-500 to-amber-600',
    Medium: 'from-brand-500 to-blue-600',
    Low: 'from-slate-400 to-slate-500'
  };

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-darkBorder/40">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Timeline / Gantt</h2>
          <p className="text-slate-400 text-xs mt-0.5">Chronological scheduling, sprint horizons, and critical paths</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-500">14-Day rolling Sprint schedule</span>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkSurface shadow-sm overflow-hidden relative">
        
        {/* FROSTED UPGRADE LOCK OVERLAY */}
        {isFree && (
          <div className="absolute inset-0 bg-white/20 dark:bg-darkBg/60 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center space-y-6 select-none animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-glass">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm text-amber-500 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>ApexAgile Pro Premium Feature</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Unlock Interactive Gantt Charts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Supercharge your squad's capacity. Map milestones, visual dependencies, detect blocking tasks, and audit critical tracks in real-time.
              </p>
            </div>

            <button
              onClick={() => openUpgradeModal('Pro', null)}
              className="py-3 px-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-bold shadow-premium transition-all hover:scale-105 active:scale-95 text-xs flex items-center gap-2"
            >
              💎 Unlock Timeline View
            </button>
          </div>
        )}

        {/* Timeline Header Row (Days of the week) */}
        <div className="grid grid-cols-12 border-b border-slate-200 dark:border-darkBorder/40 bg-slate-50 dark:bg-darkBg/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
          <div className="col-span-4 p-4 border-r border-slate-200 dark:border-darkBorder/40 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-slate-500" />
            <span>Task / Issue Key & Description</span>
          </div>

          <div className="col-span-8 p-4 relative flex justify-between px-2 font-mono text-[9px]">
            {daysHeader.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center w-8 text-center">
                <span>{day.toLocaleDateString([], { weekday: 'short' })}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{day.getDate()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks rows */}
        <div className="divide-y divide-slate-100 dark:divide-darkBorder/30">
          {timelineTasks.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-semibold text-xs flex flex-col justify-center items-center gap-2">
              <Layers className="w-8 h-8 opacity-40 text-slate-400" />
              <span>No tasks registered in this project. Create issues on the Kanban board!</span>
            </div>
          ) : (
            timelineTasks.map((task) => {
              const position = calculateBarPosition(task);
              const color = priorityColors[task.priority] || priorityColors.Medium;

              return (
                <div key={task._id} className="grid grid-cols-12 text-xs font-semibold hover:bg-slate-50/50 dark:hover:bg-darkBg/10 transition-colors select-none">
                  
                  {/* Task Key & Title details (Left block) */}
                  <div className="col-span-4 p-4 border-r border-slate-200 dark:border-darkBorder/40 flex items-center gap-2 truncate">
                    <span className="font-mono text-[9px] bg-slate-100 dark:bg-darkBg px-1.5 py-0.5 rounded text-slate-500">
                      {task.key}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 truncate flex-1 block">
                      {task.title}
                    </span>
                  </div>

                  {/* Timeline Bar (Right block grid overlay) */}
                  <div className="col-span-8 p-4 relative flex items-center">
                    
                    {/* Background Day Grids */}
                    <div className="absolute inset-0 flex justify-between px-6 pointer-events-none opacity-20">
                      {daysHeader.map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-slate-400 dark:bg-slate-500" />
                      ))}
                    </div>

                    {/* Gantt Colored Timeline Bar */}
                    <div
                      className="absolute h-7 rounded-xl bg-gradient-to-r shadow-sm border border-white/10 flex items-center px-3 text-white overflow-hidden text-[9px] font-bold z-10 transition-all cursor-pointer select-none group/bar"
                      style={{ left: position.left, width: position.width }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${color}`} />
                      <div className="relative truncate z-10 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate group-hover/bar:inline">{task.priority} ({task.durationDays}d)</span>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Gantt legend */}
      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 justify-end pt-2">
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Priority</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Medium</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Low</span>
      </div>

    </div>
  );
}
