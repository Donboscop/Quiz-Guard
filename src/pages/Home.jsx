import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Clock, Eye, BarChart3, CheckCircle2, ArrowRight, Zap, Play, ChevronRight, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { QuizCard } from '../components/quiz/QuizCard';
import { getQuizzesList } from '../data/quizzes';


export const Home = () => {
  const featuredQuizzes = getQuizzesList().slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Glow Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/30 to-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold backdrop-blur-md shadow-glow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Next-Gen EdTech Focus Proctoring Platform</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]"
          >
            Test Your Knowledge.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Stay Focused.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Challenge yourself with interactive quizzes while our focus monitoring system keeps your test environment secure with real-time mouse boundary & tab switch proctoring.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/categories">
              <Button size="lg" variant="primary" icon={Play} className="w-full sm:w-auto">
                Explore Quizzes
              </Button>
            </Link>

            <Link to="/ai-generator">
              <Button size="lg" variant="secondary" icon={Sparkles} className="w-full sm:w-auto border-brand-500/30 text-brand-300 hover:bg-brand-500/10 shadow-glow-sm">
                Generate Quiz with AI ✨
              </Button>
            </Link>
          </motion.div>

          {/* Live Trust Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left"
          >
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="font-display font-bold text-2xl text-white">50+</div>
              <div className="text-xs text-slate-400">Curated Questions</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="font-display font-bold text-2xl text-brand-400">7</div>
              <div className="text-xs text-slate-400">Core Categories</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="font-display font-bold text-2xl text-emerald-400">100%</div>
              <div className="text-xs text-slate-400">Real-Time Focus Monitor</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="font-display font-bold text-2xl text-purple-400">Instant</div>
              <div className="text-xs text-slate-400">Result & Review</div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* FEATURE HIGHLIGHTS */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center space-y-4 mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Engineered for Integrity & Speed
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need for an engaging, authenticated testing experience.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Interactive Quizzes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diverse topics with options, instant feedback, explanations, and mark for review support.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Real-Time Timer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uninterrupted countdown timer with auto-submit protection on zero seconds.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Focus Monitoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pointer boundary tracking, grace countdown, and tab switch detection prevent distractions.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Instant Results</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive analytics, animated count-up metrics, accuracy breakdown, and history tracking.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* HOW QUIZGUARD WORKS (4 STEPS) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-12">
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
              Simple 4-Step Process
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              How QuizGuard Works
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Follow these simple steps to complete your test and track your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-glow-sm">
                1
              </div>
              <h4 className="font-display font-bold text-base text-white">Choose a Quiz</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select from JavaScript, React, CS, Aptitude, or Cloud topics matching your level.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-glow-sm">
                2
              </div>
              <h4 className="font-display font-bold text-base text-white">Read Rules</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understand the timer constraints, mouse boundary area, and proctoring rules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-glow-sm">
                3
              </div>
              <h4 className="font-display font-bold text-base text-white">Complete Test</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Answer questions inside the monitored test boundary without leaving the tab.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-glow-sm">
                4
              </div>
              <h4 className="font-display font-bold text-base text-white">Get Instant Result</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive your score breakdown, view explanations, and review your history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED QUIZZES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Popular Quizzes
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Start testing right away with our top trending assessments.
            </p>
          </div>
          <Link to="/categories">
            <Button variant="ghost" size="sm" icon={ChevronRight}>
              View All Categories
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-900/60 to-purple-900/60 border border-brand-500/30 text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Ready to Challenge Yourself?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Experience modern EdTech proctoring and test your skills in a secure focus environment.
            </p>
            <div className="pt-4">
              <Link to="/categories">
                <Button size="lg" variant="primary" icon={Sparkles}>
                  Explore All Quizzes Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
