import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';

export default function ProfilePage() {
  const { user, updateProfile, loading, error } = useAuthStore();

  const [username, setUsername] = useState(user ? user.username : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(user ? user.username : 'jira');
  
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    const updates = { username, email };
    
    // Custom avatar seed dicebear URL
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
    updates.avatar = avatar;

    if (password) {
      if (password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters', isError: true });
        return;
      }
      updates.password = password;
    }

    const res = await updateProfile(updates);
    if (res.success) {
      setPassword('');
      setMessage({ text: 'Profile updated successfully!', isError: false });
    } else {
      setMessage({ text: res.error || 'Failed to update profile', isError: true });
    }
  };

  const regenerateAvatar = () => {
    const seeds = ['bolt', 'quantum', 'matrix', 'neon', 'delta', 'alpha', 'cyber', 'agile', 'scrum', 'apex'];
    const random = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 100);
    setAvatarSeed(random);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">My Profile Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Configure your personal agile persona, update passwords, and adjust avatars</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-2xl shadow-sm space-y-6"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          {message.text && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                message.isError
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Avatar visual section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-darkBg/30 border border-slate-200/50 dark:border-darkBorder/40">
            <div className="relative group">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full bg-slate-700 p-0.5 border border-slate-200 dark:border-darkBorder"
              />
              <button
                type="button"
                onClick={regenerateAvatar}
                className="absolute bottom-0 right-0 p-1.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors shadow"
                title="Randomize avatar"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-center sm:text-left text-xs">
              <span className="font-bold text-sm block">Agile Avatar Persona</span>
              <p className="text-slate-500">Avatar generated automatically based on seed. Modify seed to change design.</p>
              <input
                type="text"
                placeholder="Avatar seed text"
                value={avatarSeed}
                onChange={(e) => setAvatarSeed(e.target.value)}
                className="mt-2 py-1 px-2 border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkSurface rounded-lg font-bold text-[10px]"
              />
            </div>
          </div>

          {/* Form details */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Change Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Leave blank to keep existing password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-premium hover:shadow-premium-hover transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
