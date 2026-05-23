import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  Settings,
  Database,
  UserCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import axios from 'axios';

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const isAdminOrManager = user && (user.role === 'Admin' || user.role === 'Manager');

  useEffect(() => {
    if (isAdminOrManager) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Users
      const usersRes = await axios.get(`${API_URL}/admin/users`);
      setUsersList(usersRes.data.users || []);

      // 2. Fetch platform statistics
      const statsRes = await axios.get(`${API_URL}/admin/analytics`);
      setAnalytics(statsRes.data.analytics || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied: Admin roles required.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    setUpdatingUserId(targetUserId);
    setActionMessage('');
    try {
      const res = await axios.put(`${API_URL}/admin/users/${targetUserId}/role`, { role: newRole });
      setActionMessage(res.data.message || 'User role updated successfully!');
      
      // Update local state list
      setUsersList(prev => prev.map(u => u._id === targetUserId ? { ...u, role: newRole } : u));
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  if (!isAdminOrManager) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500/80 mx-auto animate-pulse" />
        <h3 className="text-2xl font-extrabold tracking-tight">Access Restricted</h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          The Platform Administration settings and workspace analytics are restricted to 
          <span className="font-bold text-indigo-400 mx-1">Admin</span> or 
          <span className="font-bold text-brand-400 mx-1">Manager</span> accounts.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-darkBorder/40 pb-5">
        <h2 className="text-3xl font-extrabold tracking-tight">Workspace Administration</h2>
        <p className="text-slate-400 text-sm mt-1">Manage user authorization roles, audit registries, and inspect MERN system metrics</p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl text-xs max-w-md font-bold">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <span className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roster list - Promotors (left panel) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
              <h4 className="text-base font-bold flex items-center gap-1.5 border-b border-slate-100 dark:border-darkBorder/40 pb-3">
                <Users className="w-5 h-5 text-slate-500" /> Platform User Registry
              </h4>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {usersList.map((usr) => {
                  const isMe = usr._id === user?._id;
                  return (
                    <div
                      key={usr._id}
                      className="p-3 bg-slate-50 dark:bg-darkBg/20 border border-slate-200/40 dark:border-darkBorder/20 rounded-xl flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <img src={usr.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-700" />
                        <div className="truncate">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-800 dark:text-white truncate">{usr.username}</span>
                            {isMe && <span className="bg-slate-400/20 text-slate-500 px-1 text-[8px] font-bold rounded">YOU</span>}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5">{usr.email}</span>
                        </div>
                      </div>

                      {/* Dropdown to switch roles */}
                      {!isMe && user?.role === 'Admin' ? (
                        <select
                          disabled={updatingUserId === usr._id}
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                          className="py-1.5 px-3 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-lg font-bold text-[10px] focus:outline-none"
                        >
                          <option value="Member">Member (Dev)</option>
                          <option value="Manager">Manager (PM)</option>
                          <option value="Admin">Admin (Lead)</option>
                        </select>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-darkBg text-slate-500 rounded font-bold uppercase text-[9px]">
                          {usr.role}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Database Analytics side panel (right sidebar) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
              <h4 className="text-base font-bold flex items-center gap-1.5 border-b border-slate-100 dark:border-darkBorder/40 pb-3">
                <Database className="w-5 h-5 text-brand-400" /> Platform Statistics
              </h4>

              {analytics ? (
                <div className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200/50 dark:border-darkBorder/50">
                      <span className="text-[9px] text-slate-400 block uppercase">Workspaces</span>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{analytics.counters.workspaces}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200/50 dark:border-darkBorder/50">
                      <span className="text-[9px] text-slate-400 block uppercase">Projects</span>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{analytics.counters.projects}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200/50 dark:border-darkBorder/50 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>PLATFORM TASK RESOLUTION RATE</span>
                      <span>{analytics.taskCompletionRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-darkSurface rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${analytics.taskCompletionRate}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-darkBorder/30">
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Total Registered Users</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">{analytics.counters.users}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Total Active Issues</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">{analytics.counters.tasks}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs py-4 text-center">No platform metrics recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
