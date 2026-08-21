import React from 'react';
import { ShieldCheck, Info, Eye, Lock, Smartphone, Cpu, CheckCircle2, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { motion } from 'framer-motion';


export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
          <Info className="w-4 h-4" />
          <span>Platform Architecture & Security</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
          About QuizGuard
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Discover how our frontend proctoring engine maintains candidate focus during online assessments without server overhead.
        </p>
      </div>


      {/* MANDATORY HONESTY NOTE DISCLAIMER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-200 space-y-3 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <h3 className="font-display font-bold text-base text-amber-300 uppercase tracking-wider">
            Important Client-Side Proctoring Disclaimer
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed pl-9">
          QuizGuard's focus monitoring is a browser-based demonstration feature. Since all logic runs on the client side, it should not be considered a replacement for server-side examination security.
        </p>
      </motion.div>

      {/* Focus Monitoring Breakdown */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-400" />
          Core Focus Monitoring Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card glass className="space-y-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 w-fit">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Pointer Boundary Tracking
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors the cursor position relative to the proctored test container using <code className="text-brand-300 font-mono">getBoundingClientRect()</code>. If the cursor leaves the test boundary, a 4-second grace period activates before termination.
            </p>
          </Card>

          <Card glass className="space-y-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Tab Switch & Visibility Detection
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Utilizes the HTML5 <code className="text-indigo-300 font-mono">document.visibilityState</code> API to detect when a user switches tabs or minimizes the window. The first violation issues a warning; repeated switches terminate the attempt.
            </p>
          </Card>

          <Card glass className="space-y-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Fullscreen Mode Enforcement
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports the Fullscreen API to expand the test container to cover the display screen. Exiting fullscreen mode mid-test logs an event and issues a re-entry warning.
            </p>
          </Card>

          <Card glass className="space-y-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Mobile Responsive Fallback
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects touch screen viewports dynamically. Mouse boundary monitoring is automatically relaxed on mobile devices so candidates are not unfairly penalized by finger gestures.
            </p>
          </Card>

        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-brand-400" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-display font-semibold text-base text-white">
              How is my attempt data saved?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All quiz attempts, answers, scores, and focus warning logs are stored locally in your browser's <code className="text-brand-300 font-mono">localStorage</code>. No external data is sent over the network.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-display font-semibold text-base text-white">
              Can I pause a quiz during a test?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No. Once started, the timer runs continuously to simulate a live examination environment. If you close the browser, your session state will be restored upon return if time remains.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-display font-semibold text-base text-white">
              What happens if my internet disconnects?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Since QuizGuard is a 100% client-side single page application, network outages will not affect your test or score submission.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

