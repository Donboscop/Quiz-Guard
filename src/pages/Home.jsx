import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Shield, Sparkles, Users, FileText, Layers, KeyRound, Play, 
  ArrowRight, Eye, CheckCircle2, Lock, Zap, BarChart3, Code
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Hero Overview" className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Radial Glow in Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-b from-white/[0.07] via-transparent to-transparent blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950 border border-white/20 text-xs text-zinc-200 shadow-inner"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
            <span className="font-medium tracking-tight">QUIZGUARD PLATFORM</span>
            <span className="text-zinc-400" aria-hidden="true">•</span>
            <span className="text-zinc-300 font-mono text-[11px]">AI + LIVE PROCTORING</span>
          </motion.div>

          {/* Hero Heading with Instrument Serif Italic */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-medium tracking-tight leading-[1.08] text-white">
              Assess knowledge.<br />
              <span className="font-serif italic font-normal text-white text-5xl sm:text-7xl lg:text-8xl">
                Protect focus.
              </span>
            </h1>

            <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
              Create AI-powered quizzes, host live assessments, and monitor focus in real time.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link to="/create" className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px]">
              <Button variant="liquid" size="lg" className="w-full sm:w-auto px-7" icon={Sparkles}>
                Create a Quiz
              </Button>
            </Link>
            <Link to="/join" className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px]">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-7" icon={KeyRound}>
                Join a Quiz
              </Button>
            </Link>
          </motion.div>

          {/* Core Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-12 grid grid-cols-3 max-w-lg mx-auto border-t border-white/15 text-center"
          >
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-mono font-bold text-white">50K+</div>
              <div className="text-xs text-zinc-300 font-medium">Questions answered</div>
            </div>
            <div className="space-y-1 border-x border-white/15">
              <div className="text-xl sm:text-2xl font-mono font-bold text-white">4.2M+</div>
              <div className="text-xs text-zinc-300 font-medium">Quiz interactions</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-mono font-bold text-white">180+</div>
              <div className="text-xs text-zinc-300 font-medium">Active educators</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* VALUE PILLARS & FEATURE GRID */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Core Architecture and Features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] bg-black">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Section Heading */}
          <div className="max-w-md space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-medium">Core Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Built for high-trust live evaluations.
            </h2>
          </div>

          {/* 3 Pillars Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1: AI & Multi-Format Studio */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-white">Universal Quiz Studio</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Generate high-caliber tests from prompt topics, PowerPoint (.pptx) slides with source citations, PDF documents, lecture notes, or manual visual authoring.
              </p>
              <div className="pt-2">
                <Link
                  to="/create"
                  className="inline-flex items-center min-h-[32px] py-1 text-xs font-medium text-white gap-1 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Live Multiplayer Arena */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-white">Live Multiplayer Arena</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Host synchronized assessments with 6-digit room codes. Realtime classroom synchronization with live rankings, participant rosters, and instant submission.
              </p>
              <div className="pt-2">
                <Link
                  to="/contest"
                  className="inline-flex items-center min-h-[32px] py-1 text-xs font-medium text-white gap-1 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  <span>Host Live Room</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Proctoring & Focus Monitoring */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-white">Browser Focus Monitoring</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Client-side focus tracking with mouse boundary confinement, visibility change (tab switch) detection, fullscreen enforcement, and violation counters.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center min-h-[32px] py-1 text-xs font-medium text-white gap-1 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  <span>View Proctoring Docs</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

          </div>

          {/* Quick Start Assessment Banner */}
          <div className="vesper-panel p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-white/20">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Ready to evaluate or take a test?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg">
                Explore our catalog of curated assessments across JavaScript, Cloud Computing, React Architecture, Aptitude, and Computer Science.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/categories" className="inline-flex items-center min-h-[40px]">
                <Button variant="liquid" size="md" icon={Play}>
                  Start Practice Quiz
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
