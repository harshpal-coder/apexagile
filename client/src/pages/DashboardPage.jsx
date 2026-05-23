import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Milestone,
  ArrowUpRight,
  Plus,
  MessageSquare,
  AlertTriangle,
  Flame,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useTaskStore } from '../context/useTaskStore';
import { useSprintStore } from '../context/useSprintStore';
import axios from 'axios';
import { navigate } from '../utils/router';

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeProject } = useWorkspaceStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { activeSprint, sprintStats } = useSprintStore();

  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Custom SVG chart mock coordinates for productivity (last 7 days)
  const chartData = [
    { day: 'Mon', value: 20 },
    { day: 'Tue', value: 35 },
    { day: 'Wed', value: 30 },
    { day: 'Thu', value: 55 },
    { day: 'Fri', value: 70 },
    { day: 'Sat', value: 65 },
    { day: 'Sun', value: 85 }
  ];

  // Map 7 values into coordinates inside an SVG viewbox of 500x200
  const padding = 30;
  const width = 500;
  const height = 200;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.value / 100) * chartHeight;
    return { x, y, val: d.value, day: d.day };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  // Fetch recent activity feed
  useEffect(() => {
    if (activeProject) {
      fetchTasks(activeProject._id);
      
      const fetchActivity = async () => {
        setLoadingActivity(true);
        try {
          const res = await axios.get(`${API_URL}/collaboration/activity/${activeProject._id}`);
          setActivities(res.data.activities || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingActivity(false);
        }
      };
      
      fetchActivity();
    }
  }, [activeProject]);

  // Aggregate dashboard stats
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Done').length;
  const activeCount = tasks.filter(t => t.status !== 'Done' && t.status !== 'Backlog').length;
  const criticalCount = tasks.filter(t => t.priority === 'Critical').length;

  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  // Calculate upcoming deadlines (tasks with due dates that are not Completed)
  const deadlines = tasks
    .filter(t => t.dueDate && t.status !== 'Done')
    .map(t => ({
      ...t,
      daysLeft: Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Hi, {user ? user.username : 'Developer'} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Here's what is happening in{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {activeProject ? activeProject.name : 'your project'}
            </span>{' '}
            workspace today.
          </p>
        </div>
        
        {activeSprint && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-xs font-bold text-brand-400">
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
            Active Sprint: {activeSprint.name}
          </div>
        )}
      </div>

      {/* Analytics Card Blocks */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm relative overflow-hidden group hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Issues</span>
            <h3 className="text-3xl font-extrabold mt-1">{completedCount}</h3>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold">
            {completionRate}% of total workspace scope
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm relative overflow-hidden group hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Issues</span>
            <h3 className="text-3xl font-extrabold mt-1 text-red-500">{criticalCount}</h3>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold">
            Require immediate developer triage
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm relative overflow-hidden group hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Flight Tasks</span>
            <h3 className="text-3xl font-extrabold mt-1">{activeCount}</h3>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold">
            Currently in progress or review columns
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm relative overflow-hidden group hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Velocity</span>
            <h3 className="text-3xl font-extrabold mt-1">42</h3>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold">
            Average tasks completed per iteration
          </div>
        </div>
      </motion.div>

      {/* Main Charts & Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Line Chart Card */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-darkBorder/40 pb-4">
            <div>
              <h4 className="text-lg font-bold">Productivity Index</h4>
              <p className="text-slate-500 text-xs mt-0.5">Calculated based on rolling task completion metrics</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>+18% this week</span>
            </div>
          </div>

          {/* Pure SVG Custom Chart */}
          <div className="relative py-6 flex justify-center items-center">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-lg h-auto overflow-visible select-none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(yVal => {
                const y = padding + chartHeight - (yVal / 100) * chartHeight;
                return (
                  <line
                    key={yVal}
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

              {/* Area Under the Line */}
              <path d={areaPath} fill="url(#areaGrad)" />

              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Bullet Coordinates */}
              {points.map((p, i) => (
                <g key={i} className="group/dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="#0ea5e9"
                    stroke="currentColor"
                    className="text-white dark:text-darkSurface"
                    strokeWidth={2}
                  />
                  <circle cx={p.x} cy={p.y} r={12} fill="#0ea5e9" opacity={0} className="hover:opacity-20 transition-opacity" />
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="hidden group-hover/dot:block text-[10px] font-bold fill-slate-700 dark:fill-slate-100"
                  >
                    {p.val}%
                  </text>
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-400 uppercase font-sans"
                >
                  {p.day}
                </text>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-darkBorder/40 pt-4 text-xs font-semibold text-slate-500">
            <span>Platform Database Engine: JSON Fallback DB</span>
            <button className="text-brand-500 hover:underline flex items-center gap-1" onClick={() => navigate('/board')}>
              Go to Kanban <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Upcoming Deadlines Widget */}
        <motion.div
          variants={cardVariants}
          className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col"
        >
          <div className="border-b border-slate-200 dark:border-darkBorder/40 pb-4 mb-4">
            <h4 className="text-lg font-bold">Upcoming Deadlines</h4>
            <p className="text-slate-500 text-xs mt-0.5">Issues requiring urgent attention</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[220px] pr-1">
            {deadlines.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-8 text-slate-400">
                <Calendar className="w-8 h-8 text-slate-500 mb-2 opacity-50" />
                <p className="text-xs font-semibold">No deadlines approaching!</p>
              </div>
            ) : (
              deadlines.map(task => {
                let badgeColor = 'bg-slate-500/10 text-slate-400';
                if (task.daysLeft <= 2) badgeColor = 'bg-red-500/10 text-red-400 font-extrabold animate-pulse';
                else if (task.daysLeft <= 5) badgeColor = 'bg-yellow-500/10 text-yellow-400 font-semibold';
                
                return (
                  <div
                    key={task._id}
                    onClick={() => {
                      navigate('/board');
                    }}
                    className="p-3 bg-slate-50 dark:bg-darkBg/30 border border-slate-200/50 dark:border-darkBorder/40 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 font-mono block">{task.key}</span>
                      <h5 className="font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">{task.title}</h5>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] flex-shrink-0 uppercase font-mono ${badgeColor}`}>
                      {task.daysLeft <= 0 ? 'Overdue' : `${task.daysLeft}d left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Lower Block: Recent Activity Feed */}
      <motion.div
        variants={cardVariants}
        className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm"
      >
        <div className="border-b border-slate-200 dark:border-darkBorder/40 pb-4 mb-6">
          <h4 className="text-lg font-bold">Recent Project Activity</h4>
          <p className="text-slate-500 text-xs mt-0.5">Chronological audit feed for active squad operations</p>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {loadingActivity ? (
            <div className="py-12 flex justify-center items-center">
              <span className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-8">No activities recorded yet.</p>
          ) : (
            activities.map(act => (
              <div key={act._id} className="flex items-start gap-4 text-xs">
                {/* Avatar icon */}
                <img
                  src={act.user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full bg-slate-700 mt-0.5"
                />
                
                {/* Description details */}
                <div className="flex-1 pb-4 border-b border-slate-200/50 dark:border-darkBorder/30 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-slate-900 dark:text-white mr-1.5">{act.user.username}</span>
                      {act.text}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                      {new Date(act.timestamp).toLocaleDateString()} at{' '}
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {act.badge && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-brand-500/10 text-brand-400 uppercase tracking-wide">
                      {act.badge}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
