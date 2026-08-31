import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { isQuestionAnswered } from '../../utils/quizUtils';

export const QuestionNavigator = ({ questions = [] }) => {
  const {
    currentQuestionIndex,
    goToQuestion,
    userAnswers,
    markedForReview
  } = useQuiz();

  const answeredCount = questions.filter(q => isQuestionAnswered(q, userAnswers[q.id])).length;

  return (
    <div className="vesper-panel p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
          Navigator
        </h3>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10">
          {answeredCount}/{questions.length} Answered
        </span>
      </div>

      {/* Grid Matrix */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentQuestionIndex;
          const isAnswered = isQuestionAnswered(q, userAnswers[q.id]);
          const isMarked = markedForReview.includes(q.id);

          let bgClass = "bg-zinc-950 text-zinc-400 border-white/[0.08] hover:border-white/20";
          if (isCurrent) {
            bgClass = "bg-white text-black font-bold border-white shadow-sm ring-1 ring-white";
          } else if (isMarked && isAnswered) {
            bgClass = "bg-purple-950/60 text-purple-200 border-purple-800/60 font-semibold";
          } else if (isMarked) {
            bgClass = "bg-amber-950/60 text-amber-200 border-amber-800/60 font-semibold";
          } else if (isAnswered) {
            bgClass = "bg-emerald-950/60 text-emerald-200 border-emerald-800/60 font-semibold";
          }

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={`relative h-9 rounded-xl border flex items-center justify-center font-mono text-xs transition-all ${bgClass}`}
            >
              <span>{idx + 1}</span>
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};
