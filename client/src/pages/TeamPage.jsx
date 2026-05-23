import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Mail,
  UserCheck,
  Award,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useTaskStore } from '../context/useTaskStore';
import { useAuthStore } from '../context/useAuthStore';

export default function TeamPage() {
  const { user } = useAuthStore();
  const { activeProject, projectMembers, addProjectMember } = useWorkspaceStore();
  const { tasks } = useTaskStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ text: '', isError: false });

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeProject) return;

    setLoadingInvite(true);
    setInviteMessage({ text: '', isError: false });

    const res = await addProjectMember(activeProject._id, inviteEmail.trim());
    setLoadingInvite(false);
    
    if (res.success) {
      setInviteEmail('');
      setInviteMessage({ text: res.message || 'Successfully added member!', isError: false });
    } else {
      setInviteMessage({ text: res.error || 'Failed to add member', isError: true });
    }
  };

  const getMemberAllocations = (mId) => {
    const memberTasks = tasks.filter(t => t.assignee === mId);
    const completed = memberTasks.filter(t => t.status === 'Done').length;
    const pending = memberTasks.length - completed;
    return { total: memberTasks.length, completed, pending };
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
      className="space-y-8"
    >
      {/* Header & Invite block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-darkBorder/40 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Team Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Invite colleagues, check task allocations, and assign collaborative workspace roles
          </p>
        </div>

        {/* Invite input form */}
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="colleague@agile.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loadingInvite}
            className="py-2.5 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs shadow-premium flex items-center justify-center gap-1.5 transition-all flex-shrink-0 disabled:opacity-50"
          >
            {loadingInvite ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add to Project
              </>
            )}
          </button>
        </form>
      </div>

      {inviteMessage.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 max-w-md ${
            inviteMessage.isError
              ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-shake'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{inviteMessage.text}</span>
        </div>
      )}

      {/* Team Roster List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectMembers.map((member) => {
          const alloc = getMemberAllocations(member._id);
          const isMe = member._id === user?._id;
          
          return (
            <div
              key={member._id}
              className="p-6 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm relative overflow-hidden group hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={member.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full bg-slate-700 mt-0.5 group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <h4 className="font-extrabold text-slate-800 dark:text-white truncate">
                      {member.username}
                    </h4>
                    {isMe && (
                      <span className="bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate leading-none">{member.email}</p>
                </div>
              </div>

              {/* Task Allocations distribution stats */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-darkBorder/30 text-center">
                <div className="p-2 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200/40 dark:border-darkBorder/40">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Assigned</span>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{alloc.total}</p>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200/40 dark:border-darkBorder/40">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Pending</span>
                  <p className="text-base font-extrabold text-orange-400 mt-0.5">{alloc.pending}</p>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200/40 dark:border-darkBorder/40">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Done</span>
                  <p className="text-base font-extrabold text-emerald-500 mt-0.5">{alloc.completed}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
