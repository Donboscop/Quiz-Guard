import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import { Link001, Link002, Link003, Link004 } from '../ui/skiper-ui/skiper40';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white font-bold">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">QuizGuard</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Modern EdTech quiz & real-time focus monitoring platform designed to test skills in a distraction-free, proctored environment.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link001 to="/" className="hover:text-brand-400">Home Landing</Link001></li>
              <li><Link001 to="/categories" className="hover:text-brand-400">Quiz Categories</Link001></li>
              <li><Link001 to="/history" className="hover:text-brand-400">Attempt History</Link001></li>
              <li><Link001 to="/about" className="hover:text-brand-400">About & Security Model</Link001></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">Quiz Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link002 to="/categories" className="hover:text-brand-400">JavaScript & ES6+</Link002></li>
              <li><Link002 to="/categories" className="hover:text-brand-400">React Architecture</Link002></li>
              <li><Link002 to="/categories" className="hover:text-brand-400">HTML5 & Modern CSS3</Link002></li>
              <li><Link002 to="/categories" className="hover:text-brand-400">Aptitude & Logic</Link002></li>
            </ul>
          </div>


          {/* Col 4: Disclaimer & Security Note */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Proctoring Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              QuizGuard's active focus monitoring ensures real-time anti-cheat proctoring and assessment security.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} QuizGuard Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-500">
            <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secure Assessment Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
