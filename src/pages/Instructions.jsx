import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizById } from '../data/quizzes';
import { useQuiz } from '../context/QuizContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ShieldAlert, Clock, HelpCircle, CheckSquare, ArrowRight, ArrowLeft, Eye, Lock, Users, Play, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Instructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startQuiz } = useQuiz();
  const [agreed, setAgreed] = useState(false);

  const quiz = getQuizById(id);

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Quiz Not Found</h2>
        <p className="text-xs text-slate-400">The requested quiz ID does not exist.</p>
        <Link to="/categories">
          <Button variant="primary">Return to Categories</Button>
        </Link>
      </div>
    );
  }

  const handleStartTest = () => {
    if (!agreed) return;
    startQuiz(quiz);
    navigate(`/quiz/${quiz.id}/test`);
  };

  const handleStartLiveArea = () => {
    if (!agreed) return;
    navigate(`/contest?quizId=${quiz.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Navigation */}
      <Link to="/categories" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </Link>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-8 shadow-2xl"
      >
        
        {/* Header Summary */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">{quiz.category}</Badge>
            <Badge variant={quiz.difficulty === 'Easy' ? 'success' : quiz.difficulty === 'Medium' ? 'warning' : 'danger'} size="sm">
              {quiz.difficulty}
            </Badge>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
            {quiz.title}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {quiz.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Duration: <strong className="text-white">{quiz.duration} Minutes</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Questions: <strong className="text-white">{quiz.totalQuestions} Questions</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Proctoring: <strong className="text-amber-300">Focus Boundary Active</strong></span>
            </div>
          </div>
        </div>

        {/* Rules & Guidelines */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-400" />
            Test Rules & Proctoring Protocols
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-300">
                <Clock className="w-4 h-4" />
                <span>1. Time Limit & Navigation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The test features a real-time countdown timer that does not pause when navigating between questions. Reaching 00:00 will auto-submit your attempt.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Eye className="w-4 h-4 text-rose-400" />
                <span>2. Mouse Boundary Enforcement</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your cursor must stay inside the active test area. Exiting the boundary gives a 4-second grace period; failing to return inside will immediately terminate the test.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>3. Tab Switching Prevention</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switching browser tabs or minimizing the window triggers a warning. A second tab switch will result in immediate test termination.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>4. Irreversible Termination</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Terminated attempts cannot be resumed or edited. Your current progress up to termination will be recorded in history.
              </p>
            </div>

          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3">
          <input
            type="checkbox"
            id="agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 accent-brand-500 cursor-pointer"
          />
          <label htmlFor="agreement" className="text-xs text-slate-200 cursor-pointer select-none leading-relaxed">
            <strong className="text-white">I have read, understood, and agree to the test instructions and proctoring rules.</strong> I promise to keep my cursor inside the designated test area and maintain active focus throughout the examination.
          </label>
        </div>

        {/* Mode Selection & Action Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Choose Test Mode to Proceed:
            </span>
            {!agreed && (
              <span className="text-[11px] text-amber-400 font-medium animate-pulse">
                * Please accept the guidelines above to unlock options
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Solo Test Button */}
            <button
              type="button"
              disabled={!agreed}
              onClick={handleStartTest}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                agreed
                  ? 'bg-brand-500/10 hover:bg-brand-500/20 border-brand-500/40 hover:border-brand-500 text-white cursor-pointer shadow-lg shadow-brand-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${agreed ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Start Test Now</h4>
                  <p className="text-[11px] text-slate-400">Solo proctored assessment attempt</p>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${agreed ? 'text-brand-400' : 'text-slate-600'}`} />
            </button>

            {/* Live Area Option Button */}
            <button
              type="button"
              disabled={!agreed}
              onClick={handleStartLiveArea}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                agreed
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/40 hover:border-indigo-400 text-white cursor-pointer shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-transform group-hover:scale-105 ${agreed ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                  <Users className="w-5 h-5" />
                  {agreed && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-sm text-white">Live Area Option</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase">LIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Host/Join real-time P2P duel arena</p>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${agreed ? 'text-indigo-400' : 'text-slate-600'}`} />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
