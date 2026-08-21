import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, History, BookOpen, Info, Menu, X, Sparkles, AlertTriangle, PlusCircle, Users } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { getAttempts } from '../../utils/storage';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { sessionStatus, activeQuiz } = useQuiz();
  const attempts = getAttempts();

  // Hide navbar header during full test screen if desired, or show minimal test header
  const isTestingPage = location.pathname.includes('/test');

  if (isTestingPage) {
    return null; // The QuizTest screen renders its own dedicated focus header
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: ShieldCheck },
    { path: '/categories', label: 'Categories', icon: BookOpen },
    { path: '/ai-generator', label: 'AI Quiz', icon: Sparkles },
    { path: '/edit/new', label: 'Create Quiz', icon: PlusCircle },
    { path: '/contest', label: 'Live Arena', icon: Users },
    { path: '/history', label: 'Attempt History', icon: History, badge: attempts.length },
    { path: '/about', label: 'About & Security', icon: Info },
  ];


  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-[1px] shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                Quiz<span className="text-brand-400">Guard</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  PROCTOR
                </span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider">
                Focus Monitoring Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className={`px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {sessionStatus === 'in-progress' && activeQuiz ? (
              <Link
                to={`/quiz/${activeQuiz.id}/test`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all animate-pulse"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Resume Test in Progress
              </Link>
            ) : (
              <Link
                to="/categories"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow-sm hover:shadow-glow-md transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Quiz</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
                {link.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-500/20 text-brand-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Explore All Quizzes
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
