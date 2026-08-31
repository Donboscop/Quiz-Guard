import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Sparkles, PlusCircle, Users, BarChart3, History, Menu, X, ArrowRight, LayoutDashboard, KeyRound } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { getAttempts } from '../../utils/storage';
import { Button } from './Button';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { sessionStatus, activeQuiz } = useQuiz();
  const attempts = getAttempts();

  // Hide navbar during active live test
  const isTestingPage = location.pathname.includes('/test');
  if (isTestingPage) return null;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/categories', label: 'Quizzes', icon: BookOpen },
    { path: '/ai-generator', label: 'AI Generator', icon: Sparkles },
    { path: '/create', label: 'Quiz Studio', icon: PlusCircle },
    { path: '/contest', label: 'Live Arena', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/history', label: 'History', icon: History, badge: attempts.length },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-white/20 to-white/5 border border-white/20 shadow-glow-sm group-hover:border-white/40 transition-all">
              <Shield className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-semibold text-lg tracking-tight text-white flex items-center gap-2">
                QUIZGUARD
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-white/10 text-zinc-300 border border-white/10">
                  PROCTOR
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-950/80 px-2 py-1 rounded-full border border-white/10 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/create' && (location.pathname.startsWith('/create') || location.pathname.startsWith('/edit')));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                      isActive ? 'bg-black text-white' : 'bg-white/10 text-zinc-300'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link to="/join">
              <Button variant="secondary" size="sm" icon={KeyRound}>
                Join Code
              </Button>
            </Link>

            {sessionStatus === 'in-progress' && activeQuiz ? (
              <Link
                to={`/quiz/${activeQuiz.id}/test`}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all animate-pulse"
              >
                Resume Active Test
              </Link>
            ) : (
              <Link to="/categories">
                <Button variant="liquid" size="sm" icon={ArrowRight}>
                  Start Quiz
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-black/95 backdrop-blur-3xl z-50 p-6 flex flex-col justify-between overflow-y-auto border-t border-white/10">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-white text-black' : 'text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-white/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              to="/join"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="secondary" size="md" className="w-full" icon={KeyRound}>
                Join with Room Code
              </Button>
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="liquid" size="md" className="w-full" icon={ArrowRight}>
                Explore All Quizzes
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
