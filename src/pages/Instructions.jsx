import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizById } from '../data/quizzes';
import { useQuiz } from '../context/QuizContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Shield, Clock, HelpCircle, CheckSquare, ArrowRight, ArrowLeft, Eye, Lock, Users, Play, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Instructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startQuiz } = useQuiz();
  const [agreed, setAgreed] = useState(false);

  const quiz = getQuizById(id);

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto my-20 vesper-panel p-8 text-center space-y-4">
        <h2 className="font-semibold text-lg text-white">Assessment Not Found</h2>
        <p className="text-xs text-zinc-400">The requested assessment ID does not exist.</p>
        <Link to="/categories">
          <Button variant="liquid" size="sm">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleStartTest = () => {
    if (!agreed) return;
    startQuiz(quiz);
    navigate(`/quiz/${quiz.id}/test`);
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <Link to="/categories" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </Link>

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="vesper-panel p-6 sm:p-10 space-y-8"
        >
          
          {/* Header Summary */}
          <div className="space-y-3 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Badge variant="metal" size="sm">{quiz.category || 'General'}</Badge>
              <span className="text-[11px] font-mono text-zinc-400">
                {quiz.difficulty}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {quiz.title}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {quiz.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Duration: <strong className="text-white">{quiz.duration} Minutes</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Questions: <strong className="text-white">{quiz.questions?.length || quiz.totalQuestions} Questions</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Focus Proctoring: <strong className="text-emerald-400">Active</strong></span>
              </div>
            </div>
          </div>

          {/* Rules & Guidelines */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-400" />
              Examination Rules & Focus Monitoring
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>1. Synchronized Timer</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The test runs on a fixed countdown timer. When the timer hits 00:00, your exam will auto-submit.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>2. Mouse Boundary Check</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Keep your mouse inside the test area. Leaving the container for &gt;4 seconds triggers auto-termination.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>3. Tab Switching Detection</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Switching tabs or minimizing the browser issues warnings. Exceeding 2 warnings terminates the test.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>4. Review & Submit</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You can mark questions for review and jump between questions using the question navigator.
                </p>
              </div>

            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex items-start gap-3">
            <input
              type="checkbox"
              id="agree-rules"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-zinc-900 border-white/20 text-white cursor-pointer"
            />
            <label htmlFor="agree-rules" className="text-xs text-zinc-300 cursor-pointer select-none leading-relaxed">
              I understand that this assessment is monitored for focus integrity. I agree not to switch tabs, leave the test area, or exit fullscreen.
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
            <Link to="/categories" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link to={`/contest?quizId=${quiz.id}`} className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full sm:w-auto" icon={Users}>
                  Host Live
                </Button>
              </Link>

              <Button
                variant="liquid"
                size="md"
                className="w-full sm:w-auto"
                disabled={!agreed}
                onClick={handleStartTest}
                icon={Play}
              >
                Begin Assessment
              </Button>
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
};
