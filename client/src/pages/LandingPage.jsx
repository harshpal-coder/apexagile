import React from 'react';
import { motion } from 'framer-motion';
import { KanbanSquare, Zap, ShieldCheck, Users, Milestone, ArrowRight, Sparkles } from 'lucide-react';
import { navigate } from '../utils/router';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-darkBg text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Decorative Glowing Spotlights */}
      <div className="glow-spot top-[-10%] left-[-10%] scale-150" />
      <div className="glow-spot-indigo top-[30%] right-[-10%] scale-125" />
      <div className="glow-spot bottom-[-10%] left-[20%] scale-110" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 px-6 py-4 glass-panel border-b border-darkBorder/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-brand-500 p-2.5 rounded-xl shadow-premium flex items-center justify-center">
              <KanbanSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
              ApexAgile
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white hover:from-brand-600 hover:to-indigo-700 hover:shadow-premium-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center flex flex-col items-center gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold tracking-wide text-brand-400 uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Agile Engineering Teams
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] text-white"
          >
            Reimagine Project Tracking.
            <span className="block mt-2 bg-gradient-to-r from-brand-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Deliver Code at Warp Speed.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed mt-2"
          >
            ApexAgile combines the structural precision of Atlassian Jira with the modern speed, fluidity, and beautiful design of startup productivity platforms.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white hover:from-brand-600 hover:to-indigo-700 hover:shadow-premium-hover hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Try ApexAgile Free
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-base font-semibold rounded-xl bg-darkSurface border border-darkBorder hover:bg-darkBorder/40 hover:border-slate-500 transition-all duration-200"
            >
              Explore Interactive Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Product Dashboard Visual Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="mt-20 relative p-2 rounded-2xl bg-gradient-to-b from-darkBorder to-darkBg border border-darkBorder/80 shadow-glass overflow-hidden"
        >
          {/* Dashboard Header Bar mock */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-darkBorder/40 bg-darkSurface/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-slate-500 font-mono ml-4">APEX-4 // Active Board</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="font-semibold text-brand-400">⚡ Sprint 2 Active</span>
              <span>Backlog</span>
              <span>Timeline</span>
            </div>
          </div>

          {/* Kanban columns mockup */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-darkBg/90">
            {/* Col 1 */}
            <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
                <span>BACKLOG</span>
                <span className="bg-darkBorder px-1.5 py-0.5 rounded">3</span>
              </div>
              <div className="bg-darkSurface p-4 rounded-xl border border-darkBorder shadow space-y-2">
                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
                <h4 className="text-xs font-semibold text-slate-100">OAuth2 Integration via Google</h4>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">APEX-8</span>
                  <div className="w-5 h-5 rounded-full bg-slate-700" />
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
                <span>TODO</span>
                <span className="bg-darkBorder px-1.5 py-0.5 rounded">2</span>
              </div>
              <div className="bg-darkSurface p-4 rounded-xl border border-darkBorder shadow space-y-2">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">LOW</span>
                <h4 className="text-xs font-semibold text-slate-100">Fix sidebar overlapping</h4>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">APEX-6</span>
                  <div className="w-5 h-5 rounded-full bg-slate-700" />
                </div>
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
                <span>IN PROGRESS</span>
                <span className="bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded">1</span>
              </div>
              <div className="bg-darkSurface/80 p-4 rounded-xl border border-brand-500 shadow-premium space-y-2 scale-[1.02]">
                <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-bold">HIGH</span>
                <h4 className="text-xs font-semibold text-slate-100">Framer Motion Board Dragging</h4>
                <p className="text-[10px] text-slate-500">Integrating custom drag handles...</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-brand-400 font-mono">APEX-4</span>
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[10px] text-white font-bold">A</div>
                </div>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
                <span>DONE</span>
                <span className="bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">8</span>
              </div>
              <div className="bg-darkSurface p-4 rounded-xl border border-darkBorder shadow space-y-2 opacity-50">
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">MEDIUM</span>
                <h4 className="text-xs font-semibold text-slate-100">Setup backend auth JWT</h4>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">APEX-2</span>
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            className="p-6 rounded-2xl bg-darkSurface border border-darkBorder/60 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-xl font-bold">Blazing Velocity</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience dynamic rendering and zero-refresh updates. Moving issues between columns is instantaneous with stateful Zustand storage.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="p-6 rounded-2xl bg-darkSurface border border-darkBorder/60 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Milestone className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold">Agile Sprint Rollovers</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transition tasks effortlessly. Completed sprints log historical data to draw velocity indicators, rolling incomplete tasks back to your backlog.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="p-6 rounded-2xl bg-darkSurface border border-darkBorder/60 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold">Fluid Mentions & Chat</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Discuss issues in contextual threads. Use @username tags in text fields to parse, highlight, and fire active workspace notifications automatically.
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-darkBorder/40 text-center text-slate-500 text-xs">
          <p>© 2026 ApexAgile Platforms Inc. Engineered for Agile Squads.</p>
        </footer>
      </main>
    </div>
  );
}
