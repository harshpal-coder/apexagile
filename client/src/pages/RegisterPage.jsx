import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KanbanSquare, Mail, Lock, User, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { navigate } from '../utils/router';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [localError, setLocalError] = useState('');

  const { register, loading, error: storeError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = await register(username, email, password, role);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-darkBg text-slate-100 px-4 py-12">
      {/* Background Lights */}
      <div className="glow-spot top-[10%] right-[10%]" />
      <div className="glow-spot-indigo bottom-[10%] left-[10%]" />

      <button
        onClick={handleBackToLanding}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to marketing
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel border border-darkBorder/60 shadow-glass space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-brand-500 p-3 rounded-xl shadow-premium inline-flex items-center justify-center cursor-pointer" onClick={handleBackToLanding}>
            <KanbanSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white">Create Account</h2>
          <p className="text-sm text-slate-400">Join ApexAgile to plan and track issues</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(localError || storeError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{localError || storeError}</span>
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">USERNAME</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="developer_ninja"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-darkBorder rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="ninja@agile.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-darkBorder rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-darkBorder rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 tracking-wide flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              SELECT PLATFORM ROLE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Member', 'Manager', 'Admin'].map((r) => {
                const colors = {
                  Member: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
                  Manager: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
                  Admin: 'border-red-500/20 text-red-400 bg-red-500/5'
                };
                const activeColors = {
                  Member: 'border-emerald-500 text-white bg-emerald-500/25',
                  Manager: 'border-indigo-500 text-white bg-indigo-500/25',
                  Admin: 'border-red-500 text-white bg-red-500/25'
                };
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold text-center transition-all ${
                      role === r ? activeColors[r] : colors[r] + ' hover:bg-darkSurface/50'
                    }`}
                  >
                    {r === 'Admin' ? '👑 Admin' : r === 'Manager' ? '👔 PM' : '💻 Dev'}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Admin grants user role changes; PM enables starting/ending sprints; Dev handles issue dragging.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-premium transition-all duration-200 disabled:opacity-50 hover:shadow-premium-hover flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Redirect */}
        <p className="text-xs text-center text-slate-400 mt-4">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-brand-400 hover:text-brand-300 font-semibold"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}
