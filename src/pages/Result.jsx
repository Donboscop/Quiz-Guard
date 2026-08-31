import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatTime, isQuestionCorrect, isQuestionAnswered, getOptionLetter, getCorrectAnswers, getUserAnswers } from '../utils/quizUtils';
import { Trophy, CheckCircle2, XCircle, MinusCircle, Clock, BookOpen, RefreshCw, ArrowLeft, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export const Result = () => {
  const { id } = useParams();
  const { latestResult, isContestMode, opponentName, opponentResult, playerName, participants } = useQuiz();

  const result = latestResult || {
    score: 0,
    totalQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    percentage: 0,
    timeTakenSeconds: 0,
    quizTitle: 'Assessment',
    category: 'General',
    status: 'Completed'
  };

  useEffect(() => {
    // Trigger confetti on high performance
    if (result.percentage >= 70) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [result.percentage]);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Celebration Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="vesper-panel p-8 sm:p-12 text-center space-y-6 border-white/20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
            <Award className="w-3.5 h-3.5" />
            Evaluation Report • {result.status || 'Completed'}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              {result.quizTitle}
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Completed in {formatTime(result.timeTakenSeconds)} • Verified Submission
            </p>
          </div>

          {/* Big Score Display */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white">
              {result.percentage}%
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-2">
              {result.score} of {result.totalQuestions} Questions Correct
            </div>
          </div>

          {/* Quick Stat Pills */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.06] text-center">
              <span className="text-emerald-400 block font-bold text-base">{result.correctCount || 0}</span>
              <span className="text-zinc-500 text-[10px]">CORRECT</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.06] text-center">
              <span className="text-red-400 block font-bold text-base">{result.wrongCount || 0}</span>
              <span className="text-zinc-500 text-[10px]">INCORRECT</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.06] text-center">
              <span className="text-zinc-400 block font-bold text-base">{result.unansweredCount || 0}</span>
              <span className="text-zinc-500 text-[10px]">SKIPPED</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-white/[0.08]">
            <Link to={`/quiz/${id}/review`} className="w-full sm:w-auto">
              <Button variant="liquid" size="md" className="w-full sm:w-auto px-6" icon={BookOpen}>
                Detailed Answer Review
              </Button>
            </Link>
            <Link to={`/quiz/${id}/instructions`} className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto px-6" icon={RefreshCw}>
                Retake Assessment
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full sm:w-auto">
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
