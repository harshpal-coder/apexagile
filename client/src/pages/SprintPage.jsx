import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Milestone,
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Flame,
  Calendar,
  X,
  TrendingDown
} from 'lucide-react';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useSprintStore } from '../context/useSprintStore';
import { useTaskStore } from '../context/useTaskStore';
import { useAuthStore } from '../context/useAuthStore';
import confetti from 'canvas-confetti';
import { navigate } from '../utils/router';

export default function SprintPage() {
  const { user } = useAuthStore();
  const { activeProject } = useWorkspaceStore();
  const { sprints, activeSprint, sprintStats, fetchSprints, createSprint, startSprint, completeSprint } = useSprintStore();
  const { tasks, fetchTasks, updateTask } = useTaskStore();

  // Local Form states
  const [createOpen, setCreateOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [sprintToStart, setSprintToStart] = useState(null);

  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expand / collapse panels
  const [backlogExpanded, setBacklogExpanded] = useState(true);
  const [sprintsExpanded, setSprintsExpanded] = useState({});

  useEffect(() => {
    if (activeProject) {
      fetchSprints(activeProject._id);
      fetchTasks(activeProject._id);
    }
  }, [activeProject]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintName || !activeProject) return;

    const res = await createSprint(sprintName, sprintGoal, activeProject._id);
    if (res.success) {
      setSprintName('');
      setSprintGoal('');
      setCreateOpen(false);
    }
  };

  const handleStartSprintClick = (sprint) => {
    setSprintToStart(sprint);
    setSprintName(sprint.name);
    setSprintGoal(sprint.goal || '');
    
    // Auto set dates
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 14); // 2 weeks default
    
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end.toISOString().substring(0, 10));
    setStartOpen(true);
  };

  const handleConfirmStart = async (e) => {
    e.preventDefault();
    if (!sprintToStart || !startDate || !endDate) return;

    const res = await startSprint(sprintToStart._id, startDate, endDate);
    if (res.success) {
      setStartOpen(false);
      setSprintToStart(null);
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    if (!window.confirm('Are you sure you want to complete this sprint? Any incomplete issues will roll back to the backlog.')) return;
    
    const res = await completeSprint(sprintId);
    if (res.success) {
      // Fire celebration confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      // Refresh task boards
      fetchTasks(activeProject._id);
    }
  };

  // Move task to another sprint (drag fallback or simple dropdown click)
  const handleMoveToSprint = async (taskId, targetSprintId) => {
    await updateTask(taskId, { sprintId: targetSprintId || null });
    fetchTasks(activeProject._id);
  };

  const backlogTasks = tasks.filter(t => t.sprintId === null);

  // Burndown coordinates drawing
  const drawBurndownChart = () => {
    if (!sprintStats || sprintStats.total === 0) return null;
    
    const width = 350;
    const height = 150;
    const padding = 20;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const totalVal = sprintStats.total;
    const burndownData = sprintStats.burndown || [];

    if (burndownData.length === 0) {
      // Fallback to simple simulated start and end ideal line if no burndown dates mapped yet
      const idealStart = { x: padding, y: padding };
      const idealEnd = { x: padding + chartW, y: padding + chartH };
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[320px] h-auto overflow-visible select-none">
          <line
            x1={idealStart.x}
            y1={idealStart.y}
            x2={idealEnd.x}
            y2={idealEnd.y}
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <line
            x1={padding}
            y1={padding + chartH * (1 - (sprintStats.completed / totalVal))}
            x2={padding + chartW}
            y2={padding + chartH * (1 - (sprintStats.completed / totalVal))}
            stroke="#0ea5e9"
            strokeWidth={2}
          />
        </svg>
      );
    }

    // Map each daily point to SVG coordinate space
    const idealPoints = burndownData.map((d, i) => {
      const x = padding + (i / (burndownData.length - 1)) * chartW;
      const y = padding + (1 - Math.max(0, d.ideal / totalVal)) * chartH;
      return { x, y, val: d.ideal, day: d.day };
    });

    const actualPoints = burndownData
      .filter(d => d.actual !== null && d.actual !== undefined)
      .map((d) => {
        const origIndex = burndownData.findIndex(item => item.day === d.day);
        const x = padding + (origIndex / (burndownData.length - 1)) * chartW;
        const y = padding + (1 - Math.max(0, d.actual / totalVal)) * chartH;
        return { x, y, val: d.actual, day: d.day };
      });

    const idealPath = idealPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const actualPath = actualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[320px] h-auto overflow-visible select-none">
        {/* Ideal Line - Dotted Slate */}
        <path
          d={idealPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        
        {/* Actual Line - Brand Blue */}
        {actualPoints.length > 0 && (
          <path
            d={actualPath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {/* Ideal Points / Bullets */}
        {idealPoints.map((p, i) => (
          <circle
            key={`ideal-${i}`}
            cx={p.x}
            cy={p.y}
            r={2}
            fill="#94a3b8"
            className="opacity-40"
          />
        ))}

        {/* Actual Points / Bullets */}
        {actualPoints.map((p, i) => (
          <g key={`actual-${i}`} className="group/dot cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#0ea5e9"
              stroke="currentColor"
              className="text-white dark:text-darkSurface"
              strokeWidth={1}
            />
            <circle cx={p.x} cy={p.y} r={8} fill="#0ea5e9" opacity={0} className="hover:opacity-20 transition-opacity" />
            <title>{p.day}: {p.val} issues remaining</title>
          </g>
        ))}
      </svg>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Sprints backlog planning frame (left panel) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-darkBorder/40">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Sprint Planning</h2>
            <p className="text-slate-400 text-xs mt-0.5">Organize iterations, estimate issues, and start sprints</p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Sprint
          </button>
        </div>

        {/* 1. ACTIVE SPRINT BOX */}
        {activeSprint ? (
          <div className="p-5 bg-brand-500/5 border border-brand-500/20 rounded-2xl space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{activeSprint.name}</h4>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed max-w-md">{activeSprint.goal}</p>
              </div>

              {user?.role !== 'Member' && (
                <button
                  onClick={() => handleCompleteSprint(activeSprint._id)}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs shadow-premium flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Complete Sprint
                </button>
              )}
            </div>

            {/* Dates indicator */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>DURATION: {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border border-slate-200 dark:border-darkBorder/40 rounded-2xl bg-white dark:bg-darkSurface/30 text-xs font-semibold text-slate-500 flex flex-col justify-center items-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-500 opacity-60" />
            <span>No active sprint is currently running in this workspace.</span>
            {sprints.some(s => s.status === 'Planned') && (
              <p className="text-[10px] text-slate-400">Select and "Start" one of the planned sprints below to trigger Kanban columns.</p>
            )}
          </div>
        )}

        {/* 2. PLANNED SPRINT ITERATIONS LIST */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planned / Completed Sprints</h4>
          
          {sprints.filter(s => s.status !== 'Active').length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No planned sprints added. Plan future increments!</p>
          ) : (
            sprints
              .filter(s => s.status !== 'Active')
              .map(sprint => {
                const sprintTasks = tasks.filter(t => t.sprintId === sprint._id);
                const isCompleted = sprint.status === 'Completed';
                
                return (
                  <div
                    key={sprint._id}
                    className={`p-4 rounded-2xl border transition-colors bg-white dark:bg-darkSurface/50 ${
                      isCompleted ? 'border-slate-200 dark:border-darkBorder/20 opacity-60' : 'border-slate-200 dark:border-darkBorder/40'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-slate-400' : 'bg-yellow-400'}`} />
                          <h5 className="font-bold text-slate-800 dark:text-slate-100">{sprint.name}</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{sprint.goal || 'No goal specified.'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-slate-100 dark:bg-darkBg px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wide">
                          {sprint.status} ({sprintTasks.length} issues)
                        </span>

                        {!isCompleted && user?.role !== 'Member' && (
                          <button
                            onClick={() => handleStartSprintClick(sprint)}
                            className="py-1.5 px-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" /> Start
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sprints items listing */}
                    <div className="mt-3 space-y-1.5">
                      {sprintTasks.map(task => (
                        <div
                          key={task._id}
                          className="py-2 px-3 bg-slate-50 dark:bg-darkBg/20 border border-slate-200/40 dark:border-darkBorder/20 rounded-lg flex items-center justify-between text-xs hover:border-slate-400 dark:hover:border-slate-500 transition-all"
                        >
                          <span className="font-mono text-[9px] text-slate-500 w-12">{task.key}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate flex-1 ml-2">{task.title}</span>
                          
                          <select
                            value={task.sprintId || ''}
                            onChange={(e) => handleMoveToSprint(task._id, e.target.value)}
                            className="py-0.5 px-2 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded text-[9px] text-slate-500 font-bold focus:outline-none"
                          >
                            <option value={sprint._id}>{sprint.name.substring(0, 12)}...</option>
                            <option value="">Backlog</option>
                            {sprints.filter(s => s._id !== sprint._id).map(os => (
                              <option key={os._id} value={os._id}>{os.name.substring(0, 12)}...</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* 3. PRODUCT BACKLOG BOX */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder/40 bg-white dark:bg-darkSurface/50 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-darkBorder/30 pb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" /> Product Backlog ({backlogTasks.length} issues)
            </h4>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {backlogTasks.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">Backlog is completely empty! Add tasks to start planning.</p>
            ) : (
              backlogTasks.map(task => (
                <div
                  key={task._id}
                  className="py-2.5 px-3 bg-slate-50 dark:bg-darkBg/20 border border-slate-200/40 dark:border-darkBorder/20 rounded-xl flex items-center justify-between text-xs hover:border-slate-400 dark:hover:border-slate-500 transition-all"
                >
                  <span className="font-mono text-[9px] text-slate-500 w-12 flex-shrink-0">{task.key}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate flex-1 ml-2 mr-3">{task.title}</span>

                  <select
                    value=""
                    onChange={(e) => handleMoveToSprint(task._id, e.target.value)}
                    className="py-0.5 px-2 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded text-[9px] text-slate-500 font-bold focus:outline-none"
                  >
                    <option value="">Move to Sprint</option>
                    {sprints.filter(s => s.status !== 'Completed').map(s => (
                      <option key={s._id} value={s._id}>{s.name.substring(0, 15)}...</option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Burn-down & Velocity charts metrics panel (right sidebar) */}
      <div className="space-y-6 h-fit">
        {/* Burndown Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-darkBorder/40 pb-3 flex items-center justify-between">
            <h4 className="text-base font-bold flex items-center gap-1.5">
              <TrendingDown className="w-5 h-5 text-brand-400" /> Iteration Burndown
            </h4>
            {activeSprint && (
              <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-bold uppercase">
                Active
              </span>
            )}
          </div>

          {!activeSprint || !sprintStats ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>No active sprint metrics to plot.</p>
              <p className="text-[10px] text-slate-400 mt-1">Start a planned sprint to view burndown coordinates.</p>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              {drawBurndownChart()}
              
              <div className="w-full grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 text-center">
                <div className="p-2 bg-slate-50 dark:bg-darkBg rounded-lg border border-slate-200/40 dark:border-darkBorder/40">
                  <p className="text-[8px] uppercase text-slate-400">Total Scope</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{sprintStats.total} Issues</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-darkBg rounded-lg border border-slate-200/40 dark:border-darkBorder/40">
                  <p className="text-[8px] uppercase text-slate-400">Completed</p>
                  <p className="text-base font-extrabold text-green-500">{sprintStats.completed} Issues</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Velocity History Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-darkBorder/40 pb-3 flex items-center justify-between">
            <h4 className="text-base font-bold flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-400" /> Team Velocity
            </h4>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase">
              History
            </span>
          </div>

          {!sprintStats || !sprintStats.velocity || sprintStats.velocity.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>No sprint completion logs found.</p>
              <p className="text-[10px] text-slate-400 mt-1">Complete planned sprints to begin mapping historical velocity metrics!</p>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              {(() => {
                const width = 350;
                const height = 150;
                const padding = 20;
                const chartW = width - padding * 2;
                const chartH = height - padding * 2;
                const velocityData = sprintStats.velocity || [];

                const maxVal = Math.max(5, ...velocityData.map(v => v.totalCount));

                const barWidth = Math.max(12, Math.min(36, (chartW / velocityData.length) * 0.5));
                const spacing = (chartW - (barWidth * velocityData.length)) / (velocityData.length + 1);

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[320px] h-auto overflow-visible select-none">
                    {[0, 0.5, 1].map((r, idx) => {
                      const y = padding + r * chartH;
                      return (
                        <line
                          key={idx}
                          x1={padding}
                          y1={y}
                          x2={width - padding}
                          y2={y}
                          stroke="currentColor"
                          className="text-slate-200 dark:text-darkBorder/40"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {velocityData.map((data, index) => {
                      const x = padding + spacing + index * (barWidth + spacing);
                      
                      const completedH = (data.completedCount / maxVal) * chartH;
                      const completedY = padding + chartH - completedH;

                      const totalH = (data.totalCount / maxVal) * chartH;
                      const totalY = padding + chartH - totalH;

                      return (
                        <g key={index} className="group/bar cursor-pointer">
                          <rect
                            x={x}
                            y={totalY}
                            width={barWidth}
                            height={totalH}
                            rx={4}
                            className="fill-slate-100 dark:fill-darkBg/60 stroke stroke-slate-200 dark:stroke-darkBorder/40"
                            strokeWidth={1}
                          />

                          {completedH > 0 && (
                            <rect
                              x={x}
                              y={completedY}
                              width={barWidth}
                              height={completedH}
                              rx={4}
                              fill="#f97316"
                              className="fill-orange-500"
                            />
                          )}

                          <text
                            x={x + barWidth / 2}
                            y={totalY - 6}
                            textAnchor="middle"
                            className="hidden group-hover/bar:block text-[9px] font-extrabold fill-slate-800 dark:fill-slate-200 font-mono"
                          >
                            {data.completedCount}/{data.totalCount}
                          </text>

                          <text
                            x={x + barWidth / 2}
                            y={height - 2}
                            textAnchor="middle"
                            className="text-[8px] font-bold fill-slate-400"
                          >
                            {data.sprintName.length > 8 ? `${data.sprintName.substring(0, 7)}…` : data.sprintName}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
              
              <div className="w-full flex items-center justify-between text-[8px] font-extrabold text-slate-400 tracking-wider uppercase border-t border-slate-100 dark:border-darkBorder/40 pt-2">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#f97316]" /> Completed</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded border border-slate-400 bg-transparent" /> Total Scope</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE SPRINT MODAL POPUP */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
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
                  <Milestone className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold">Add Planned Sprint</h3>
                </div>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSprint} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sprint Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APEX Sprint 3: Core API"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sprint Goal</label>
                  <textarea
                    placeholder="e.g. Build backend routes and map relational DB controllers..."
                    rows={3}
                    value={sprintGoal}
                    onChange={(e) => setSprintGoal(e.target.value)}
                    className="w-full p-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium transition-all"
                  >
                    Save Sprint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* START SPRINT MODAL POPUP */}
      <AnimatePresence>
        {startOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setStartOpen(false)}
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
                  <Play className="w-5 h-5 text-brand-500 fill-current" />
                  <h3 className="text-lg font-bold">Start Sprint</h3>
                </div>
                <button
                  onClick={() => setStartOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmStart} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sprint Name</label>
                  <div className="py-2.5 px-3 bg-slate-100 dark:bg-darkBg rounded-xl border border-slate-200 dark:border-darkBorder font-bold text-slate-700 dark:text-slate-300">
                    {sprintName}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Goal</label>
                  <div className="py-2.5 px-3 bg-slate-100 dark:bg-darkBg rounded-xl border border-slate-200 dark:border-darkBorder font-medium text-slate-500 text-xs">
                    {sprintGoal || 'No goal set.'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-darkBorder bg-slate-100 dark:bg-darkBg rounded-xl focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-darkBorder bg-slate-100 dark:bg-darkBg rounded-xl focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStartOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-100 dark:hover:bg-darkBorder/60 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-premium transition-all"
                  >
                    Start Iteration
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
