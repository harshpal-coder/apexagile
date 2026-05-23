import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KanbanSquare, Zap, ShieldCheck, Users, Milestone, ArrowRight, Sparkles, 
  Check, ChevronDown, ChevronUp, Star, Award, Layers, BarChart4, MessageSquareCode,
  Lock, Globe, Rocket
} from 'lucide-react';
import { navigate } from '../utils/router';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [openFaq, setOpenFaq] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const faqs = [
    {
      q: "How does the dual-mode offline database engine work?",
      a: "ApexAgile features a dynamic database adapter. If a cloud MongoDB Atlas connection is not provided, the server instantly spins up an automatic, self-saving local JSON filesystem database in server/data/db.json. This allows developers to run, test, and seed the entire platform offline in 1 second without database configurations!"
    },
    {
      q: "Is Google OAuth2 login secure and fully verified?",
      a: "Yes. We use official Google Identity Services loaded asynchronously and verified securely on our Node.js server using google-auth-library. Upon one-click Google authentication, our system automatically provisions a matching workspace, downloads your Google profile avatar, and returns a high-security platform JWT."
    },
    {
      q: "Can I try all features out of the box?",
      a: "Absolutely! We built realistic quick-access demo credentials into our Login page. In one click, you can log in as a Platform Admin, Product Manager, or lead developer (Alice) to test team allocation graphs, sprint rolling completions, and interactive burndowns."
    },
    {
      q: "Are roles and permissions fully active?",
      a: "Yes! ApexAgile implements strict role-based capability layers. Admins can adjust workspace parameters; Managers can create and roll sprints; Developers have full drag-and-drop power on active boards with instantaneous visual feedback."
    }
  ];

  const tabs = {
    kanban: {
      title: "Interactive Kanban",
      desc: "Instantaneous drag-and-drop task routing with Zustand state synchronization and visual priority glow indicators.",
      badge: "High Performance",
      icon: KanbanSquare,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-darkBg/90">
          <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
              <span>TODO</span>
              <span className="bg-darkBorder px-1.5 py-0.5 rounded">2</span>
            </div>
            <div className="bg-darkSurface p-4 rounded-xl border border-darkBorder shadow space-y-2">
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
              <h4 className="text-xs font-semibold text-slate-100">Fix sidebar layout overlapping</h4>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 font-mono">APEX-6</span>
                <div className="w-5 h-5 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>
          <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
              <span>IN PROGRESS</span>
              <span className="bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded">1</span>
            </div>
            <div className="bg-darkSurface/80 p-4 rounded-xl border border-brand-500 shadow-premium space-y-2 scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 blur-xl rounded-full" />
              <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-bold">HIGH</span>
              <h4 className="text-xs font-semibold text-slate-100">Google OAuth2 authentication</h4>
              <p className="text-[10px] text-slate-500">Integrating GIS credentials verification...</p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-brand-400 font-mono">APEX-8</span>
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[10px] text-white font-bold">A</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 bg-darkSurface/30 p-3 rounded-xl border border-darkBorder/40">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
              <span>DONE</span>
              <span className="bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">1</span>
            </div>
            <div className="bg-darkSurface p-4 rounded-xl border border-darkBorder shadow space-y-2 opacity-50">
              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">MEDIUM</span>
              <h4 className="text-xs font-semibold text-slate-100">Configure Atlas cluster connection</h4>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 font-mono">APEX-2</span>
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">✓</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    sprints: {
      title: "Sprint Management",
      desc: "Plan backlogs, configure story points, and trigger sprint completion rollovers with custom Confetti alerts and automated burndown graphing.",
      badge: "Confetti Enabled",
      icon: Milestone,
      content: (
        <div className="p-6 bg-darkBg/95 space-y-4">
          <div className="flex justify-between items-center bg-darkSurface p-4 rounded-xl border border-darkBorder/60">
            <div>
              <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">Active Sprint</span>
              <h4 className="text-sm font-extrabold text-white mt-1">🚀 Apex Sprint 2 // Q2 Milestones</h4>
            </div>
            <button className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-lg transition-all shadow-premium">
              Complete Sprint
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-darkSurface p-3 rounded-lg border border-darkBorder/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Completed Tasks</span>
              <h5 className="text-lg font-bold text-slate-100 mt-1">8 / 11</h5>
            </div>
            <div className="bg-darkSurface p-3 rounded-lg border border-darkBorder/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Sprint Velocity</span>
              <h5 className="text-lg font-bold text-indigo-400 mt-1">73%</h5>
            </div>
            <div className="bg-darkSurface p-3 rounded-lg border border-darkBorder/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Overdue Issues</span>
              <h5 className="text-lg font-bold text-red-400 mt-1">1</h5>
            </div>
            <div className="bg-darkSurface p-3 rounded-lg border border-darkBorder/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Days Remaining</span>
              <h5 className="text-lg font-bold text-brand-400 mt-1">4 Days</h5>
            </div>
          </div>
        </div>
      )
    },
    analytics: {
      title: "Interactive Metrics",
      desc: "Track velocity and developer distribution metrics through beautiful, custom responsive SVG burndown area-line charts programmatically rendered on React 19.",
      badge: "Pure SVG Charts",
      icon: BarChart4,
      content: (
        <div className="p-6 bg-darkBg/95 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Interactive Burndown Velocity</span>
            <span className="text-xs text-brand-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Real-time active updates
            </span>
          </div>
          <div className="h-44 w-full bg-darkSurface rounded-xl border border-darkBorder/60 p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Points remaining</span>
              <span>Sprint progression (days)</span>
            </div>
            
            <div className="absolute inset-x-8 bottom-6 top-8">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M 0,0 L 25,25 L 50,60 L 75,70 L 100,100 L 100,100 L 0,100 Z" fill="url(#glowGrad)" />
                <line x1="0" y1="0" x2="100" y2="100" stroke="#475569" strokeDasharray="3,3" strokeWidth="1" />
                <path d="M 0,0 L 25,25 L 50,60 L 75,70 L 100,100" fill="none" stroke="#a855f7" strokeWidth="2.5" />
              </svg>
              <div className="absolute top-[25%] left-[25%] w-2 h-2 rounded-full bg-white border border-brand-500 shadow animate-ping" />
              <div className="absolute top-[25%] left-[25%] w-2 h-2 rounded-full bg-brand-500 border border-white" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-600 font-mono px-4">
              <span>Day 1</span>
              <span>Day 4</span>
              <span>Day 8</span>
              <span>Day 12</span>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-darkBg text-slate-100 selection:bg-brand-500 selection:text-white">
      <div className="glow-spot top-[-10%] left-[-10%] scale-150" />
      <div className="glow-spot-indigo top-[30%] right-[-10%] scale-125" />
      <div className="glow-spot bottom-[-10%] left-[20%] scale-110" />

      <header className="sticky top-0 z-50 px-6 py-4 glass-panel border-b border-darkBorder/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer animate-fade-in" onClick={() => navigate('/')}>
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

      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center flex flex-col items-center gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold tracking-wide text-brand-400 uppercase"
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
            ApexAgile combines the structural precision of Atlassian Jira with the modern speed, fluid Google identity SSO, and gorgeous glassmorphic design of startup productivity platforms.
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

        <section className="mt-20 py-8 border-y border-darkBorder/40 bg-darkSurface/20 backdrop-blur-sm rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-3xl font-extrabold text-white bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">14x</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Faster Issue Loadtimes</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">99.9%</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Sprint Uptime SLA</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-white bg-gradient-to-r from-pink-400 to-brand-400 bg-clip-text text-transparent">&lt; 100ms</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Real-time Sync Latency</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-white bg-gradient-to-r from-brand-400 to-indigo-500 bg-clip-text text-transparent">250,000+</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Issues Sync'd Globally</p>
          </div>
        </section>

        <section className="mt-32 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Full-Stack Capability</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Explore the rich agile interfaces powered by our lightweight Node/Express server and instant Zustand local memory stores.
            </p>
          </div>

          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {Object.keys(tabs).map((tabKey) => {
              const tab = tabs[tabKey];
              const Icon = tab.icon;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    activeTab === tabKey
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-premium'
                      : 'bg-darkSurface border-darkBorder text-slate-400 hover:text-white hover:bg-darkBorder/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.title}
                </button>
              );
            })}
          </div>

          <div className="p-2 rounded-2xl bg-gradient-to-b from-darkBorder to-darkBg border border-darkBorder/80 shadow-glass overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-darkBorder/40 bg-darkSurface/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 font-mono ml-4">APEX-4 // active_view.js</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-bold uppercase">
                  {tabs[activeTab].badge}
                </span>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabs[activeTab].content}
              </motion.div>
            </AnimatePresence>

            <div className="p-4 bg-darkSurface/30 border-t border-darkBorder/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <p className="text-xs text-slate-400 max-w-xl leading-normal">
                {tabs[activeTab].desc}
              </p>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-bold tracking-wide uppercase transition-colors"
              >
                Deploy this dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-32 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Built for High-Velocity Squads</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Ditch slow, clunky corporate tools. Welcome to the zero-refresh agile pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl bg-darkSurface border border-darkBorder/60 space-y-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-2xl rounded-full group-hover:bg-brand-500/10 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold">Blazing Velocity</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Experience dynamic state rendering. Moving tasks between lanes is instantaneous with zero screen flashes, instantly synchronizing with standard cloud adapters.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl bg-darkSurface border border-darkBorder/60 space-y-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Milestone className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold">Confetti Rollovers</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage backlog items and story allocations cleanly. Sprints roll over completed items into permanent archives while returning pending issues back to your backlog.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl bg-darkSurface border border-darkBorder/60 space-y-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-2xl rounded-full group-hover:bg-pink-500/10 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold">Offline JSON Fallback</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zero database configurations required to develop. The backend automatically switches to a localized JSON DB store in the absence of a live cloud MongoDB Atlas connection.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="mt-32 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Loved by Engineering Leads</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Read how engineering leads are simplifying issue workflows and sprint retrospectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-darkSurface/60 border border-darkBorder/40 space-y-4 flex flex-col justify-between">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-500 text-brand-500" />)}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "ApexAgile has completely replaced our clunky legacy Jira setups. Visualizing burndowns is fast, and our engineers love the instant drag-and-drop kanbans."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-darkBorder/30">
                <div className="w-9 h-9 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-white">SP</div>
                <div>
                  <h5 className="text-xs font-bold text-white">Sarah PM</h5>
                  <p className="text-[10px] text-slate-500">Lead Agile Coordinator</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-darkSurface/60 border border-darkBorder/40 space-y-4 flex flex-col justify-between">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-indigo-500 text-indigo-500" />)}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "The dual-database offline fallback configuration is spectacular. Our team spins up local development sandboxes in seconds without setting up complex Mongo credentials."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-darkBorder/30">
                <div className="w-9 h-9 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-white">AD</div>
                <div>
                  <h5 className="text-xs font-bold text-white">Alice Dev</h5>
                  <p className="text-[10px] text-slate-500">Principal Fullstack Architect</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-darkSurface/60 border border-darkBorder/40 space-y-4 flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-pink-500 text-pink-500" />)}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "One-click login with Google Auth was exactly what we needed. The onboarding automatically provisions a matching private workspace with dynamic avatar synchronization."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-darkBorder/30">
                <div className="w-9 h-9 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-white">HM</div>
                <div>
                  <h5 className="text-xs font-bold text-white">Harsh Pal</h5>
                  <p className="text-[10px] text-slate-500">VP of SaaS Operations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-32 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Flexible Pricing Plans</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Start completely free, and scale your workspaces as your engineering operations expand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-darkSurface border border-darkBorder/60 flex flex-col justify-between gap-6 hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-400 uppercase tracking-wide">Developer Sandbox</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-500">free forever</span>
                </div>
                <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                  Perfect for local dev experiments and zero-configuration offline sandbox teams.
                </p>
              </div>
              
              <ul className="space-y-3 text-xs text-slate-300 border-t border-darkBorder/40 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Persistent JSON Local DB Fallback</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 5 team members</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited sprints & comments</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1 workspace context</li>
              </ul>

              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-darkBorder hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Sign Up Free
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-darkSurface to-brand-500/5 border-2 border-brand-500 flex flex-col justify-between gap-6 relative overflow-hidden scale-[1.03]">
              <div className="absolute top-0 right-0 bg-brand-500 text-white font-bold text-[9px] uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
                POPULAR CHOICE
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-brand-400 uppercase tracking-wide">Apex Pro</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">$12</span>
                  <span className="text-xs text-slate-400">/ user / mo</span>
                </div>
                <p className="text-xs text-slate-300 pt-2 leading-relaxed">
                  Engineered for scaling engineering agencies, supporting cloud databases and GIS integrations.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-200 border-t border-brand-500/20 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-400" /> Full Google OAuth2 SSO Enabled</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-400" /> Unlimited Team Workspaces</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-400" /> Live MongoDB Atlas Integration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-400" /> Interactive SVG Metrics Burndown</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-400" /> Priority 24/7 Developer Support</li>
              </ul>

              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-premium hover:shadow-premium-hover"
              >
                Start Pro Trial
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-darkSurface border border-darkBorder/60 flex flex-col justify-between gap-6 hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-400 uppercase tracking-wide">Enterprise Scale</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                  For large multi-squad engineering branches demanding isolated server hosting.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 border-t border-darkBorder/40 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Single-Tenant Private Server Hosting</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Isolated Mongoose DB Sharding</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Strict Workspace Access Logs</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated SLA Account Manager</li>
              </ul>

              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-darkBorder hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Contact Operations
              </button>
            </div>
          </div>
        </section>

        <section className="mt-32 space-y-12 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Everything you need to know about the architecture, security, and onboarding flows.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-darkBorder/60 bg-darkSurface/30 overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white text-sm md:text-base gap-4"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-darkBorder/20 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 border border-brand-500 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)]" />
          <div className="space-y-3 relative z-10 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Upgrade Your Sprint Pipelines</h3>
            <p className="text-slate-200 max-w-xl text-xs md:text-sm leading-relaxed">
              Sign up today and experience the speed, fluidity, and advanced tracking dashboards of ApexAgile.
            </p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-premium hover:shadow-premium-hover hover:scale-[1.04] active:scale-[0.97] transition-all relative z-10 flex items-center gap-2 text-sm uppercase tracking-wide"
          >
            Create Your Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        <footer className="mt-32 pt-12 border-t border-darkBorder/40 text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-white text-sm">ApexAgile Platform</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            © 2026 ApexAgile Platforms Inc. All rights reserved.<br />
            Engineered with the MERN stack for high-performance engineering squads.
          </p>
        </footer>
      </main>
    </div>
  );
}
