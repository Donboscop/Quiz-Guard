import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { getQuizById } from '../data/quizzes';
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, Lightbulb, BookOpen, Clock, CheckSquare } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to={`/quiz/${id}/result`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Result Summary
        </Link>
        <Link to="/categories">
          <Button variant="ghost" size="sm" icon={BookOpen}>
            Browse More Quizzes
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="brand">{quiz?.category || 'Quiz Review'}</Badge>
          <Badge variant="neutral">{questions.length} Questions</Badge>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
          Detailed Answer Breakdown
        </h1>
        <p className="text-slate-400 text-sm">
          Review your selected answers alongside correct solutions, time logs, and expert explanations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        {[
          { key: 'all', label: `All Questions (${questions.length})` },
          { key: 'correct', label: '✓ Correct Only' },
          { key: 'incorrect', label: '✕ Incorrect Only' },
          { key: 'unanswered', label: '— Unanswered Only' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => {
          const userSelected = userAnswers[q.id];
          const status = getStatus(q);
          const isMultiple = isMultiAnswerQuestion(q);
          const userSelectedArr = getUserAnswers(userSelected);
          const correctArr = getCorrectAnswers(q);
          const secondsSpent = questionTimes[q.id] || 0;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-lg"
            >
              
              {/* Question Status & Time Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-slate-400">
                    Question #{idx + 1}
                  </span>
                  {isMultiple && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                      <CheckSquare className="w-3 h-3 text-purple-400" />
                      Multiple Select Question
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{formatTime(secondsSpent)} spent</span>
                  </span>
                </div>

                {status === 'correct' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ Correct Answer</span>
                  </span>
                )}

                {status === 'incorrect' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>✕ Incorrect Answer</span>
                  </span>
                )}

                {status === 'unanswered' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    <MinusCircle className="w-4 h-4 text-amber-400" />
                    <span>— Not Answered</span>
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="font-display font-semibold text-lg text-white">
                {q.question}
              </h3>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isUserChoice = userSelectedArr.includes(oIdx);
                  const isCorrectChoice = correctArr.includes(oIdx);

                  let optionStyle = "bg-slate-950/60 border-slate-800 text-slate-400";
                  let badgeText = null;

                  if (isCorrectChoice && isUserChoice) {
                    optionStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium";
                    badgeText = "✓ Correct Choice";
                  } else if (isCorrectChoice && !isUserChoice) {
                    optionStyle = "bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-medium";
                    badgeText = "✓ Correct Answer (Missed)";
                  } else if (isUserChoice && !isCorrectChoice) {
                    optionStyle = "bg-rose-950/40 border-rose-500/60 text-rose-200 font-medium";
                    badgeText = "✕ Your Selection";
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {getOptionLetter(oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {badgeText && (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isCorrectChoice ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {badgeText}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {q.explanation && (
                <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/20 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-brand-300 uppercase tracking-wider block">
                      Explanation:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
