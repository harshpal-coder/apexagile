import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  Settings,
  Database,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Check,
  FileText,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  CheckCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useSaaSStore } from '../context/useSaaSStore';
import axios from 'axios';
import { API_URL } from '../config';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { usage, fetchUsage, openUpgradeModal, cancelSubscription, loading: billingLoading } = useSaaSStore();

  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const isAdminOrManager = user && (user.role === 'Admin' || user.role === 'Manager');
  
  // Tab control: Standard members can only access 'billing'
  const [activeTab, setActiveTab] = useState(isAdminOrManager ? 'roster' : 'billing');

  useEffect(() => {
    if (isAdminOrManager) {
      fetchAdminData();
    }
  }, [user]);

  useEffect(() => {
    // Load billing usage details
    fetchUsage(activeWorkspace?._id);
  }, [activeWorkspace]);

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

  const handleCancelSub = async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription plan? You will retain access until the current period ends.')) return;
    const res = await cancelSubscription();
    if (res.success) {
      setActionMessage('Subscription canceled. Your status has been updated to Canceled.');
    } else {
      setActionMessage('Failed to cancel subscription.');
    }
  };

  const downloadMockInvoice = (id, amount) => {
    alert(`Downloaded mock invoice PDF (${id}) for the amount of $${amount}.00 successfully!`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const activePlan = user?.subscription?.plan || 'Free';
  const activeStatus = user?.subscription?.status || 'Active';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-darkBorder/40 pb-5">
        <h2 className="text-3xl font-extrabold tracking-tight">Platform Settings</h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAdminOrManager 
            ? "Manage authorization roles, inspect metrics, and configure your SaaS subscription plans" 
            : "Review pricing models, track workspace usage capacities, and upgrade your billing plan"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-darkBorder/30 pb-px text-xs font-bold uppercase tracking-wider">
        {isAdminOrManager && (
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 px-1 border-b-2 transition-all ${
              activeTab === 'roster'
                ? 'border-brand-500 text-brand-500 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Roster & Analytics
          </button>
        )}
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-1 border-b-2 transition-all ${
            activeTab === 'billing'
              ? 'border-brand-500 text-brand-500 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Billing & Subscription
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl text-xs max-w-md font-bold">
          {actionMessage}
        </div>
      )}

      {/* Roster & Analytics Tab */}
      {activeTab === 'roster' && (
        <>
          {!isAdminOrManager ? (
            <div className="max-w-xl mx-auto py-16 text-center space-y-4">
              <ShieldAlert className="w-16 h-16 text-red-500/80 mx-auto animate-pulse" />
              <h3 className="text-2xl font-extrabold tracking-tight">Access Restricted</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                The Platform User Roster settings are restricted to Admin or Manager accounts.
              </p>
            </div>
          ) : loading ? (
            <div className="py-20 flex justify-center items-center">
              <span className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Roster list */}
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

              {/* Statistics Panel */}
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
                          <span>TASK RESOLUTION RATE</span>
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
        </>
      )}

      {/* Billing & Subscription Tab */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Subscription details and progress meters */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top overview row: Active Plan banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-brand-950 to-slate-900 border border-white/10 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-glass">
              <div className="absolute right-0 top-0 translate-x-[20%] translate-y-[-20%] w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2.5 z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase bg-brand-500 px-2 py-0.5 rounded-full">
                    {activePlan} Tier
                  </span>
                </div>
                <h3 className="text-xl font-extrabold">
                  {activePlan === 'Free' && "ApexAgile Starter Plan"}
                  {activePlan === 'Pro' && "ApexAgile Professional Plan"}
                  {activePlan === 'Enterprise' && "ApexAgile Enterprise Squad"}
                </h3>
                <p className="text-[11px] text-slate-300 max-w-md font-medium">
                  {activePlan === 'Free' && "Your workspace operates under free capacity limit caps. Invite members, assign issues, and run estimations."}
                  {activePlan === 'Pro' && `Paid professional rate active. Card ending in ••••${user?.subscription?.paymentCard || '4242'} is billed on the 30-day billing cycle.`}
                  {activePlan === 'Enterprise' && `Full enterprise authorization active. You have absolute administrative control, highest caps, and premium charts.`}
                </p>
                
                {activePlan !== 'Free' && user?.subscription?.currentPeriodEnd && (
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-200 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>NEXT RECURRING BILL DATE: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()} ({activeStatus})</span>
                  </div>
                )}
              </div>

              {/* Billing Action trigger */}
              <div className="flex-shrink-0 z-10 flex gap-2">
                {activePlan === 'Free' ? (
                  <button
                    onClick={() => openUpgradeModal('Pro', null)}
                    className="py-3 px-6 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-extrabold shadow transition-all hover:scale-[1.03] text-xs flex items-center gap-1.5"
                  >
                    💎 Go Pro ($29/mo)
                  </button>
                ) : activeStatus === 'Active' ? (
                  <button
                    onClick={handleCancelSub}
                    disabled={billingLoading}
                    className="py-2.5 px-4 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 rounded-xl font-bold transition-all text-xs"
                  >
                    Cancel Plan
                  </button>
                ) : (
                  <span className="py-2.5 px-4 bg-slate-800 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wide">
                    Canceled
                  </span>
                )}
              </div>
            </div>

            {/* Capacity Limit meters */}
            <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm space-y-6">
              <h4 className="text-base font-bold flex items-center gap-1.5 border-b border-slate-100 dark:border-darkBorder/40 pb-3">
                <Layers className="w-5 h-5 text-indigo-400" /> Subscription Limit Capacities
              </h4>

              {usage ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* workspaces meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>OWNED WORKSPACES</span>
                      <span>{usage.usage.workspaces.current} / {usage.usage.workspaces.limit === Infinity ? '∞' : usage.usage.workspaces.limit}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-darkBg border border-slate-200/40 dark:border-darkBorder/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${usage.usage.workspaces.percentage}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block leading-tight">
                      Limit caps: Free (1), Pro (5), Enterprise (Unlimited)
                    </span>
                  </div>

                  {/* members seat meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>MEMBERS ({usage.usage.members.activeWorkspaceName})</span>
                      <span>{usage.usage.members.current} / {usage.usage.members.limit === Infinity ? '∞' : usage.usage.members.limit}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-darkBg border border-slate-200/40 dark:border-darkBorder/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${usage.usage.members.percentage}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block leading-tight">
                      Workspace seats: Free (3), Pro (15), Enterprise (Unlimited)
                    </span>
                  </div>

                  {/* tasks workspace meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>WORKSPACE ISSUES</span>
                      <span>{usage.usage.tasks.current} / {usage.usage.tasks.limit === Infinity ? '∞' : usage.usage.tasks.limit}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-darkBg border border-slate-200/40 dark:border-darkBorder/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${usage.usage.tasks.percentage}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block leading-tight">
                      Issues limits: Free (10), Pro (Unlimited), Enterprise (Unlimited)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex justify-center">
                  <span className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Pricing card matrices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Free Plan */}
              <div className={`p-5 rounded-2xl bg-white dark:bg-darkSurface border shadow-sm relative overflow-hidden flex flex-col justify-between ${
                activePlan === 'Free' ? 'border-brand-500/40 ring-1 ring-brand-500/20' : 'border-slate-200 dark:border-darkBorder'
              }`}>
                {activePlan === 'Free' && (
                  <div className="absolute top-2 right-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-[8px] px-1.5 py-0.5 rounded">
                    CURRENT
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Starter</span>
                  <h4 className="text-lg font-extrabold mt-1 text-slate-700 dark:text-slate-200">Agile Free</h4>
                  <div className="flex items-baseline gap-0.5 mt-3 border-b border-slate-100 dark:border-darkBorder/30 pb-3">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">$0</span>
                    <span className="text-slate-400 text-[10px] font-semibold">/ forever</span>
                  </div>
                  <div className="space-y-2 mt-4 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" /><span>1 Workspace owned</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" /><span>3 Member seats</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" /><span>10 Workspace issues</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" /><span>Standard Kanban cards</span></div>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className={`p-5 rounded-2xl bg-white dark:bg-darkSurface border shadow-sm relative overflow-hidden flex flex-col justify-between ${
                activePlan === 'Pro' ? 'border-brand-500/40 ring-1 ring-brand-500/20' : 'border-slate-200 dark:border-darkBorder'
              }`}>
                {activePlan === 'Pro' && (
                  <div className="absolute top-2 right-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-[8px] px-1.5 py-0.5 rounded">
                    CURRENT
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Growth</span>
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-extrabold mt-1 text-slate-700 dark:text-slate-200">Agile Pro</h4>
                  <div className="flex items-baseline gap-0.5 mt-3 border-b border-slate-100 dark:border-darkBorder/30 pb-3">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">$29</span>
                    <span className="text-slate-400 text-[10px] font-semibold">/ month</span>
                  </div>
                  <div className="space-y-2 mt-4 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /><span>5 Workspaces owned</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /><span>15 Member seats</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /><span>Unlimited issues</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /><span>Burndown analytics</span></div>
                  </div>
                </div>
                {activePlan !== 'Pro' && activePlan !== 'Enterprise' && (
                  <button
                    onClick={() => openUpgradeModal('Pro', null)}
                    className="w-full mt-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all text-[10px]"
                  >
                    Upgrade Pro
                  </button>
                )}
              </div>

              {/* Enterprise Plan */}
              <div className={`p-5 rounded-2xl bg-white dark:bg-darkSurface border shadow-sm relative overflow-hidden flex flex-col justify-between ${
                activePlan === 'Enterprise' ? 'border-brand-500/40 ring-1 ring-brand-500/20' : 'border-slate-200 dark:border-darkBorder'
              }`}>
                {activePlan === 'Enterprise' && (
                  <div className="absolute top-2 right-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-[8px] px-1.5 py-0.5 rounded">
                    CURRENT
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Ultimate</span>
                  <h4 className="text-lg font-extrabold mt-1 text-slate-700 dark:text-slate-200">Enterprise</h4>
                  <div className="flex items-baseline gap-0.5 mt-3 border-b border-slate-100 dark:border-darkBorder/30 pb-3">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">$99</span>
                    <span className="text-slate-400 text-[10px] font-semibold">/ month</span>
                  </div>
                  <div className="space-y-2 mt-4 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /><span>Unlimited workspaces</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /><span>Unlimited member seats</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /><span>Timeline & Gantt views</span></div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /><span>Priority 24/7 support</span></div>
                  </div>
                </div>
                {activePlan !== 'Enterprise' && (
                  <button
                    onClick={() => openUpgradeModal('Enterprise', null)}
                    className="w-full mt-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-[10px]"
                  >
                    Upgrade Enterprise
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Billing Invoice audit feed */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
              <h4 className="text-base font-bold flex items-center gap-1.5 border-b border-slate-100 dark:border-darkBorder/40 pb-3">
                <FileText className="w-5 h-5 text-indigo-400" /> Invoice Receipts Registry
              </h4>

              {activePlan === 'Free' ? (
                <div className="py-8 text-center text-slate-400 font-semibold text-[11px] leading-relaxed">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-500 opacity-40 mb-2" />
                  <span>No premium invoice logs recorded. Starter accounts are billed at $0/mo.</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  
                  {/* Mock Invoice item 1 */}
                  <div className="p-3 bg-slate-50 dark:bg-darkBg/20 border border-slate-200/50 dark:border-darkBorder/20 rounded-xl flex justify-between items-center gap-4 text-[10px] font-semibold">
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-100">INV-9852</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded text-[8px] font-extrabold uppercase">PAID</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-0.5">ApexAgile {activePlan} Tier subscription</span>
                    </div>
                    
                    <button
                      onClick={() => downloadMockInvoice('INV-9852', activePlan === 'Pro' ? 29 : 99)}
                      className="text-brand-400 hover:text-brand-300 border border-brand-500/20 bg-brand-500/5 px-2 py-1 rounded-lg transition-all"
                    >
                      PDF
                    </button>
                  </div>

                  {/* Mock Invoice item 2 */}
                  <div className="p-3 bg-slate-50 dark:bg-darkBg/20 border border-slate-200/50 dark:border-darkBorder/20 rounded-xl flex justify-between items-center gap-4 text-[10px] font-semibold opacity-70">
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-100">INV-8411</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded text-[8px] font-extrabold uppercase">PAID</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Previous Billing Cycle renewal</span>
                    </div>
                    
                    <button
                      onClick={() => downloadMockInvoice('INV-8411', activePlan === 'Pro' ? 29 : 99)}
                      className="text-brand-400 hover:text-brand-300 border border-brand-500/20 bg-brand-500/5 px-2 py-1 rounded-lg transition-all"
                    >
                      PDF
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </motion.div>
  );
}
