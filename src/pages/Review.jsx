import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { getQuizById } from '../data/quizzes';
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, BookOpen, Clock, CheckSquare } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatTime, getOptionLetter, isMultiAnswerQuestion, getCorrectAnswers, getUserAnswers, isQuestionAnswered, isQuestionCorrect } from '../utils/quizUtils';
import { motion } from 'framer-motion';

export const Review = () => {
  const { id } = useParams();
  const { latestResult } = useQuiz();
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unanswered'

  const quiz = getQuizById(id);
  const questions = latestResult?.questions || quiz?.questions || [];
  const userAnswers = latestResult?.answers || {};
  const questionTimes = latestResult?.questionTimes || {};

  const getStatus = (q) => {
    const userSelected = userAnswers[q.id];
    if (!isQuestionAnswered(q, userSelected)) return 'unanswered';
    if (isQuestionCorrect(q, userSelected)) return 'correct';
    return 'incorrect';
  };

  const filteredQuestions = questions.filter(q => {
    const status = getStatus(q);
    if (filter === 'correct') return status === 'correct';
    if (filter === 'incorrect') return status === 'incorrect';
    if (filter === 'unanswered') return status === 'unanswered';
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to={`/quiz/${id}/result`} className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Result Summary
          </Link>
          <Link to="/categories">
            <Button variant="ghost" size="sm" icon={BookOpen}>
              Quiz Catalog
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="metal" size="sm">{quiz?.category || 'Assessment'}</Badge>
            <span className="text-xs font-mono text-zinc-400">{questions.length} Questions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Detailed Answer Review
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Review your selected responses alongside correct solutions and expert explanations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-white/10">
          {[
            { key: 'all', label: `All Questions (${questions.length})` },
            { key: 'correct', label: '✓ Correct' },
            { key: 'incorrect', label: '✕ Incorrect' },
            { key: 'unanswered', label: '— Unanswered' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tab.key
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions Breakdown List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userSelected = userAnswers[q.id];
            const status = getStatus(q);
            const isMultiple = isMultiAnswerQuestion(q);
            const userSelectedArr = getUserAnswers(userSelected);
            const correctArr = getCorrectAnswers(q);

            return (
              <motion.div
                key={q.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="vesper-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {idx + 1}
                    </span>
                    {status === 'correct' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                        ✓ Correct
                      </span>
                    )}
                    {status === 'incorrect' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/80 text-red-300 border border-red-800/50">
                        ✕ Incorrect
                      </span>
                    )}
                    {status === 'unanswered' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                        — Skipped
                      </span>
                    )}
                    {q.sourceSlide && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                        {q.sourceSlide}
                      </span>
                    )}
                    {q.sourcePage && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                        {q.sourcePage}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-sm sm:text-base text-white leading-relaxed">
                  {q.question}
                </h3>

                {/* Options list */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = correctArr.includes(optIdx);
                    const isUserPick = userSelectedArr.includes(optIdx);

                    let borderClass = "border-white/[0.06] bg-zinc-950/60 text-zinc-400";
                    if (isCorrect) {
                      borderClass = "border-emerald-500/50 bg-emerald-950/30 text-emerald-200 font-medium";
                    } else if (isUserPick && !isCorrect) {
                      borderClass = "border-red-500/50 bg-red-950/30 text-red-200";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${borderClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center font-mono font-bold text-[10px]">
                            {getOptionLetter(optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        <div className="text-[11px] font-mono">
                          {isCorrect && <span className="text-emerald-400 font-semibold">Correct Answer</span>}
                          {isUserPick && !isCorrect && <span className="text-red-400 font-semibold">Your Selection</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-xs text-zinc-300 space-y-1">
                    <span className="font-semibold text-white block text-[11px]">Explanation:</span>
                    <p className="leading-relaxed text-zinc-400">{q.explanation}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
