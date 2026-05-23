import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KanbanSquare, Mail, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { navigate } from '../utils/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { login, googleLogin, loading, error: storeError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleGoogleCallback = async (response) => {
    setLocalError('');
    const result = await googleLogin(response.credential);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    let checkInterval;
    const initGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '292824033411-448s81o71c86ag50um1lkbcrfn14idoc.apps.googleusercontent.com',
          callback: handleGoogleCallback,
        });
        
        const container = document.getElementById('googleSignInDiv');
        if (container) {
          window.google.accounts.id.renderButton(
            container,
            { 
              theme: 'filled_black', 
              size: 'large', 
              text: 'signin_with',
              shape: 'rectangular',
              width: '382'
            }
          );
          clearInterval(checkInterval);
        }
      }
    };

    initGoogleBtn();
    checkInterval = setInterval(initGoogleBtn, 300);

    return () => clearInterval(checkInterval);
  }, []);

  const autofillDemo = (demoType) => {
    if (demoType === 'admin') {
      setEmail('admin@agile.com');
      setPassword('password123');
    } else if (demoType === 'manager') {
      setEmail('manager@agile.com');
      setPassword('password123');
    } else if (demoType === 'member') {
      setEmail('alice@agile.com');
      setPassword('password123');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-darkBg text-slate-100 px-4">
      <div className="glow-spot top-[10%] left-[10%]" />
      <div className="glow-spot-indigo bottom-[10%] right-[10%]" />

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
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-brand-500 p-3 rounded-xl shadow-premium inline-flex items-center justify-center cursor-pointer" onClick={handleBackToLanding}>
            <KanbanSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white">Welcome back</h2>
          <p className="text-sm text-slate-400">Log in to manage sprints and collaborate</p>
        </div>

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
            <label className="text-xs font-semibold text-slate-400 tracking-wide">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-darkBorder rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 tracking-wide">PASSWORD</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-darkBorder rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-premium transition-all duration-200 disabled:opacity-50 hover:shadow-premium-hover flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="space-y-4">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-darkBorder/40"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-darkBorder/40"></div>
          </div>
          
          <div className="w-full flex justify-center">
            <div id="googleSignInDiv" className="w-full"></div>
          </div>
        </div>

        <div className="pt-4 border-t border-darkBorder/40">
          <p className="text-[10px] text-center text-slate-500 uppercase tracking-wider font-bold mb-3">
            Quick-access Seed Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => autofillDemo('admin')}
              className="py-1.5 px-2 bg-darkSurface hover:bg-darkBorder border border-darkBorder rounded text-[10px] font-bold text-red-400 transition-colors"
            >
              👑 Admin
            </button>
            <button
              onClick={() => autofillDemo('manager')}
              className="py-1.5 px-2 bg-darkSurface hover:bg-darkBorder border border-darkBorder rounded text-[10px] font-bold text-indigo-400 transition-colors"
            >
              👔 Manager
            </button>
            <button
              onClick={() => autofillDemo('member')}
              className="py-1.5 px-2 bg-darkSurface hover:bg-darkBorder border border-darkBorder rounded text-[10px] font-bold text-emerald-400 transition-colors"
            >
              💻 Dev
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-brand-400 hover:text-brand-300 font-semibold"
          >
            Create account
          </button>
        </p>
      </motion.div>
    </div>
  );
}
