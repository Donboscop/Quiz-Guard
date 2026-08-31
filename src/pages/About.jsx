import React from 'react';
import { Shield, Info, Eye, Lock, Smartphone, AlertTriangle, Sparkles, Users, Cpu, FileText } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const About = () => {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
            Platform Architecture & Ethics
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            About QuizGuard
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Discover how QuizGuard pairs client-side focus proctoring, multi-format AI synthesis, and live classroom multiplayer.
          </p>
        </div>

        {/* HONESTY NOTE DISCLAIMER */}
        <div className="vesper-panel p-6 sm:p-8 space-y-3 border-amber-500/30 bg-amber-950/20 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-semibold text-sm text-amber-300 uppercase tracking-wider">
              Client-Side Proctoring Notice
            </h3>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed pl-8">
            QuizGuard's focus monitoring is a browser-based focus tracking system. Because evaluation rules operate within the browser DOM and HTML5 visibility APIs, it is designed for classroom engagement and formative evaluations, rather than high-stakes standardized credentialing.
          </p>
        </div>

        {/* Focus Monitoring Breakdown */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            Proctoring & Focus Monitoring Mechanisms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="vesper-panel p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white">
                Mouse Boundary Tracking
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Monitors cursor coordinates relative to the test container. If the cursor strays beyond the boundary, a countdown banner alerts the candidate to re-center within the grace period.
              </p>
            </div>

            <div className="vesper-panel p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white">
                HTML5 Visibility & Tab Switching
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Monitors browser tab visibility changes via the standard HTML5 Page Visibility API. Defocusing or navigating to another application generates warning strikes.
              </p>
            </div>

            <div className="vesper-panel p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white">
                Multi-Source AI Generation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generates canonical QuizGuard questions from topic prompts, PowerPoint (.pptx) presentations, PDF textbook pages, or raw lecture transcripts with source slide and page citations.
              </p>
            </div>

            <div className="vesper-panel p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white">
                Real-Time Live Arena
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Educators broadcast live room codes to synchronize entire classrooms on authoritative timers, live question navigation, and real-time leaderboards.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
