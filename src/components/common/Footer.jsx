import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Zap, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer role="contentinfo" aria-label="Site Footer" className="w-full border-t border-white/[0.08] bg-black text-zinc-300 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/20">
                <Shield className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">QUIZGUARD</span>
            </div>
            <p className="text-zinc-300 max-w-sm leading-relaxed text-xs">
              Live multiplayer assessments paired with client-side focus monitoring and AI quiz generation.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-zinc-300 pt-1">
              <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-zinc-200" aria-hidden="true" /> Focus-Monitored</span>
              <span className="inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-zinc-200" aria-hidden="true" /> Tab-Check</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-zinc-200" aria-hidden="true" /> Realtime</span>
            </div>
          </div>

          {/* Col 2 */}
          <nav aria-label="Platform navigation" className="space-y-2">
            <h2 className="font-semibold text-white text-xs uppercase tracking-wider">Platform</h2>
            <ul className="space-y-1">
              <li>
                <Link to="/dashboard" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/categories" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Quiz Catalog
                </Link>
              </li>
              <li>
                <Link to="/create" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Quiz Studio
                </Link>
              </li>
              <li>
                <Link to="/ai-generator" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  AI Generator
                </Link>
              </li>
              <li>
                <Link to="/contest" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Live Multiplayer
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 3 */}
          <nav aria-label="Resources navigation" className="space-y-2">
            <h2 className="font-semibold text-white text-xs uppercase tracking-wider">Resources</h2>
            <ul className="space-y-1">
              <li>
                <Link to="/join" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Join with Code
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/history" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Attempt Logs
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex items-center min-h-[30px] py-1 text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                  Security & Ethics
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-300 text-xs">
          <p>© {new Date().getFullYear()} QuizGuard Platform. Client-side focus tracking demo system.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="inline-flex items-center min-h-[28px] py-0.5 text-zinc-300 hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
              Proctoring Disclaimer
            </Link>
            <span aria-hidden="true" className="text-zinc-400">•</span>
            <Link to="/history" className="inline-flex items-center min-h-[28px] py-0.5 text-zinc-300 hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
              Local Storage
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
