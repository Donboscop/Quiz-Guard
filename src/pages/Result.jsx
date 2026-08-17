import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { StatCard } from '../components/quiz/StatCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatTime, isQuestionCorrect, isQuestionAnswered } from '../utils/quizUtils';
import { Trophy, CheckCircle2, XCircle, MinusCircle, Clock, BookOpen, RefreshCw, ArrowLeft, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export const Result = () => {
  const { id } = useParams();
  const { latestResult, isContestMode, opponentName, opponentResult, playerName } = useQuiz();

  const result = latestResult || {
    score: 0,
    totalQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    percentage: 0,
    timeTakenSeconds: 0,
    quizTitle: 'Quiz Assessment',
    category: 'General',
    status: 'Completed'
  };

  useEffect(() => {
    // Trigger celebration confetti if user achieved >= 70%
    if (result.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log("Confetti trigger skipped");
      }
    }
  }, [result.percentage]);

  // Construct players array for contest leaderboard sorting
  const leaderboard = [];
  if (isContestMode) {
    leaderboard.push({
      name: playerName.trim() || 'You',
      score: result.score,
      percentage: result.percentage,
      timeTaken: result.timeTakenSeconds,
      status: result.status,
      isUser: true
    });

    if (opponentResult) {
      leaderboard.push({
        name: opponentName || 'Opponent',
        score: opponentResult.score,
        percentage: opponentResult.percentage,
        timeTaken: opponentResult.timeTakenSeconds,
        status: opponentResult.status,
        isUser: false
      });
    } else {
      leaderboard.push({
        name: opponentName || 'Opponent',
        score: 0,
        percentage: 0,
        timeTaken: 0,
        status: 'Solving...',
        isUser: false,
        isPending: true
      });
    }

    // Sort: Non-pending first, higher score first, lower time taken next
    leaderboard.sort((a, b) => {
      if (a.isPending) return 1;
      if (b.isPending) return -1;
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTaken - b.timeTaken;
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-[1px] mx-auto shadow-glow-md">
          <div className="w-full h-full bg-slate-950 rounded-[23px] flex items-center justify-center text-brand-400">
            <Trophy className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="brand">{result.category}</Badge>
            <Badge variant={result.status === 'Completed' ? 'success' : 'warning'}>
              {result.status}
            </Badge>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {isContestMode ? "Live Contest Finished!" : "Quiz Assessment Completed!"}
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            {result.quizTitle}
          </p>
        </div>

        {/* Big Score Radial Pill */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
          <Award className="w-6 h-6 text-brand-400" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-slate-400">Performance Grade</div>
            <div className="font-display font-bold text-lg text-white">
              {result.percentage >= 90 ? 'Mastery (A+)' : result.percentage >= 75 ? 'Proficient (A)' : result.percentage >= 50 ? 'Satisfactory (B)' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* MULTIPLAYER LEADERBOARD CARD */}
      {isContestMode && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-lg text-white">Contest Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player, idx) => {
              const isWinner = idx === 0 && !player.isPending;
              return (
                <div
                  key={player.name}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    player.isUser
                      ? 'bg-brand-500/10 border-brand-500/40 shadow-glow-sm'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center text-xs ${
                      idx === 0
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-display font-bold text-sm text-white flex items-center gap-2">
                        {player.name}
                        {player.isUser && <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-medium">You</span>}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block capitalize">
                        Status: {player.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Score</span>
                      <span className="font-black text-sm text-white">
                        {player.isPending ? '—' : `${player.score} pts (${player.percentage}%)`}
                      </span>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Time</span>
                      <span className="font-bold text-sm text-slate-300">
                        {player.isPending ? '—' : formatTime(player.timeTaken)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 border border-slate-800">
                      {isWinner ? (
                        <Trophy className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Award className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Score"
          value={result.score}
          suffix={` / ${result.totalQuestions}`}
          color="text-brand-400"
          bgGradient="from-brand-500/10 to-indigo-500/5"
        />
        <StatCard
          title="Accuracy"
          value={result.percentage}
          suffix="%"
          color="text-indigo-400"
          bgGradient="from-indigo-500/10 to-purple-500/5"
        />
        <StatCard
          title="Correct"
          value={result.correctCount}
          icon={CheckCircle2}
          color="text-emerald-400"
          bgGradient="from-emerald-500/10 to-teal-500/5"
        />
        <StatCard
          title="Wrong"
          value={result.wrongCount}
          icon={XCircle}
          color="text-rose-400"
          bgGradient="from-rose-500/10 to-red-500/5"
        />
        <StatCard
          title="Unanswered"
          value={result.unansweredCount}
          icon={MinusCircle}
          color="text-amber-400"
          bgGradient="from-amber-500/10 to-yellow-500/5"
        />
        <StatCard
          title="Time Taken"
          value={formatTime(result.timeTakenSeconds)}
          icon={Clock}
          color="text-cyan-400"
          bgGradient="from-cyan-500/10 to-blue-500/5"
        />
      </div>

      {/* QUESTION TIMELINE & TIME SPENT BREAKDOWN */}
      {Array.isArray(result.questions) && result.questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-lg text-white">Per-Question Time Breakdown</h3>
            </div>
            <Badge variant="brand" size="sm">
              Gap Limit: {formatTime(Math.max(10, Math.round(((latestResult?.duration || 10) * 60) / result.questions.length)))} / Quest
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.questions.map((q, idx) => {
              const userChoice = result.answers?.[q.id];
              const isCorrect = isQuestionCorrect(q, userChoice);
              const isUnanswered = !isQuestionAnswered(q, userChoice);
              const timeSpentSec = result.questionTimes?.[q.id] || 0;
              const allocatedGap = Math.max(10, Math.round(((latestResult?.duration || 10) * 60) / result.questions.length));
              const fillPct = Math.min(100, Math.round((timeSpentSec / allocatedGap) * 100));

              return (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      Q{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      isUnanswered ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isCorrect ? '✓ Correct' : isUnanswered ? '— Skipped' : '✕ Wrong'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                    {q.question}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Time Spent: <strong className="text-white">{formatTime(timeSpentSec)}</strong></span>
                      <span>Target Gap: {formatTime(allocatedGap)}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all ${
                          fillPct > 90 ? 'bg-rose-500' : fillPct > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to={`/quiz/${id}/review`} className="w-full sm:w-auto">
          <Button size="lg" variant="primary" icon={BookOpen} className="w-full">
            Review Answers & Explanations
          </Button>
        </Link>
        <Link to={`/quiz/${id}/instructions`} className="w-full sm:w-auto">
          <Button size="lg" variant="secondary" icon={RefreshCw} className="w-full">
            Try Quiz Again
          </Button>
        </Link>
        <Link to="/categories" className="w-full sm:w-auto">
          <Button size="lg" variant="ghost" icon={ArrowLeft} className="w-full">
            Back to All Quizzes
          </Button>
        </Link>
      </div>

    </div>
  );
};
