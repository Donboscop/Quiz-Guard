import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Zap, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-black text-zinc-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/20">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">QUIZGUARD</span>
            </div>
            <p className="text-zinc-500 max-w-sm leading-relaxed text-xs">
              Live multiplayer assessments paired with client-side focus monitoring and AI quiz generation.
            </p>
            <div className="flex items-center gap-4 text-zinc-500 pt-1">
              <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3 text-zinc-400" /> Focus-Monitored</span>
              <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-zinc-400" /> Tab-Check</span>
              <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3 text-zinc-400" /> Realtime</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Quiz Catalog</Link></li>
              <li><Link to="/create" className="hover:text-white transition-colors">Quiz Studio</Link></li>
              <li><Link to="/ai-generator" className="hover:text-white transition-colors">AI Generator</Link></li>
              <li><Link to="/contest" className="hover:text-white transition-colors">Live Multiplayer</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link to="/join" className="hover:text-white transition-colors">Join with Code</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Attempt Logs</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Security & Ethics</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[11px]">
          <p>© {new Date().getFullYear()} QuizGuard Platform. Client-side focus tracking demo system.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-zinc-400 transition-colors">Proctoring Disclaimer</Link>
            <span>•</span>
            <Link to="/history" className="hover:text-zinc-400 transition-colors">Local Storage</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
