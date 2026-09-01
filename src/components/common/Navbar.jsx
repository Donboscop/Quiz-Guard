import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Sparkles, PlusCircle, Users, BarChart3, History, Menu, X, ArrowRight, LayoutDashboard, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../context/QuizContext';
import { getAttempts } from '../../utils/storage';
import { Button } from './Button';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { sessionStatus, activeQuiz } = useQuiz();
  const attempts = getAttempts();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    <header role="banner" className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/90 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" aria-label="QuizGuard Homepage" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl p-1 -m-1">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-white/20 to-white/5 border border-white/20 shadow-glow-sm group-hover:border-white/40 transition-all">
              <Shield className="w-4 h-4 text-white group-hover:scale-105 transition-transform" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-semibold text-lg tracking-tight text-white flex items-center gap-2">
                QUIZGUARD
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white/15 text-zinc-200 border border-white/20">
                  PROCTOR
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 bg-zinc-950/90 px-2 py-1.5 rounded-full border border-white/15 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/create' && (location.pathname.startsWith('/create') || location.pathname.startsWith('/edit')));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 min-h-[32px] rounded-full text-xs font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full ${
                      isActive ? 'bg-black text-white' : 'bg-white/20 text-zinc-100'
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
            <Link to="/join" className="inline-flex items-center min-h-[36px]">
              <Button variant="secondary" size="sm" icon={KeyRound}>
                Join Code
              </Button>
            </Link>

            {sessionStatus === 'in-progress' && activeQuiz ? (
              <Link
                to={`/quiz/${activeQuiz.id}/test`}
                className="flex items-center gap-2 px-3.5 py-2 min-h-[36px] rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-medium hover:bg-amber-500/25 transition-all animate-pulse focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                Resume Active Test
              </Link>
            ) : (
              <Link to="/categories" className="inline-flex items-center min-h-[36px]">
                <Button variant="liquid" size="sm" icon={ArrowRight}>
                  Start Quiz
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-zinc-900 text-zinc-200 hover:text-white border border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-nav-menu"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100dvh - 4rem)' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden absolute top-full left-0 right-0 w-full bg-black/98 backdrop-blur-3xl z-50 p-6 flex flex-col justify-between overflow-y-auto border-t border-white/15 shadow-2xl"
            style={{ maxHeight: 'calc(100dvh - 4rem)' }}
          >
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path === '/create' && (location.pathname.startsWith('/create') || location.pathname.startsWith('/edit')));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 hover:text-white border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                      <span>{link.label}</span>
                    </div>
                    {link.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-mono rounded-full ${
                        isActive ? 'bg-black text-white' : 'bg-white/20 text-zinc-100'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 mt-6 border-t border-white/15 flex flex-col gap-3">
              <Link
                to="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="secondary" size="md" className="w-full justify-center" icon={KeyRound}>
                  Join with Room Code
                </Button>
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="liquid" size="md" className="w-full justify-center" icon={ArrowRight}>
                  Explore All Quizzes
                </Button>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
