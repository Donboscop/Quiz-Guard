import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Bookmark, Check, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { isQuestionAnswered } from '../../utils/quizUtils';

export const QuestionNavigator = ({ questions = [] }) => {
  const {
    currentQuestionIndex,
    goToQuestion,
    userAnswers,
    markedForReview,
    toggleMarkForReview,
    activeQuiz
  } = useQuiz();

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = questions.filter(q => isQuestionAnswered(q, userAnswers[q.id])).length;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider">
          Question Navigator
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
          {answeredCount} / {questions.length} Answered
        </span>
      </div>

      {/* Mark for Review Button */}
      {currentQ && (
        <Button
          variant={markedForReview.includes(currentQ.id) ? "secondary" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => toggleMarkForReview(currentQ.id)}
          icon={Bookmark}
        >
          {markedForReview.includes(currentQ.id) ? "Marked for Review" : "Mark for Review"}
        </Button>
      )}

      {/* Grid Matrix */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentQuestionIndex;
          const isAnswered = isQuestionAnswered(q, userAnswers[q.id]);
          const isMarked = markedForReview.includes(q.id);

          let bgClass = "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800";
          if (isCurrent) {
            bgClass = "bg-brand-600 text-white font-bold border-brand-400 shadow-glow-sm ring-2 ring-brand-500/50";
          } else if (isMarked && isAnswered) {
            bgClass = "bg-purple-900/50 text-purple-200 border-purple-500/50 font-semibold";
          } else if (isMarked) {
            bgClass = "bg-amber-900/50 text-amber-200 border-amber-500/50 font-semibold";
          } else if (isAnswered) {
            bgClass = "bg-emerald-900/40 text-emerald-300 border-emerald-500/40 font-semibold";
          }

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={`relative h-10 rounded-xl border flex items-center justify-center font-mono text-xs transition-all ${bgClass}`}
            >
              <span>{idx + 1}</span>
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
          <span>Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-brand-600 border border-brand-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
};
