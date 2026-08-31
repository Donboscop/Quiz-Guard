import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizOption } from './QuizOption';
import { Button } from '../common/Button';
import { ArrowLeft, ArrowRight, Send, Clock, CheckSquare, Bookmark } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { formatTime, getQuestionTimelineGap, isMultiAnswerQuestion, getUserAnswers } from '../../utils/quizUtils';

export const QuestionCard = ({
  question,
  questionIndex,
  totalQuestions,
  onNext,
  onPrev,
  onSubmit
}) => {
  const { userAnswers, selectOption, activeQuiz, questionTimes, submitAnswerInSupabase, markedForReview, toggleMarkForReview } = useQuiz();
  const rawAnswer = userAnswers[question.id];
  const isMultiple = isMultiAnswerQuestion(question);
  const selectedArr = getUserAnswers(rawAnswer);
  const selectedOption = rawAnswer;
  const isMarked = markedForReview?.includes(question.id);

  const allocatedGap = getQuestionTimelineGap(activeQuiz);
  const secondsSpentOnCurrentQ = questionTimes[question.id] || 0;
  const gapProgress = Math.min(100, Math.round((secondsSpentOnCurrentQ / allocatedGap) * 100));

  const handleOptionSelect = (selectedIdx) => {
    selectOption(question.id, selectedIdx, isMultiple);
    if (submitAnswerInSupabase) {
      const newAnswer = isMultiple
        ? (selectedArr.includes(selectedIdx) ? selectedArr.filter(i => i !== selectedIdx) : [...selectedArr, selectedIdx].sort())
        : selectedIdx;
      submitAnswerInSupabase(question.id, newAnswer);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="vesper-panel p-6 sm:p-8 space-y-6"
        >
          {/* Question Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-mono">
                Question {questionIndex + 1} of {totalQuestions}
              </span>
              {isMultiple && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 text-xs">
                  <CheckSquare className="w-3 h-3 text-purple-400" />
                  Multiple Answers
                </span>
              )}
              {question.sourceSlide && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                  {question.sourceSlide}
                </span>
              )}
              {question.sourcePage && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                  {question.sourcePage}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleMarkForReview && toggleMarkForReview(question.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                isMarked
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50 font-medium'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Prompt */}
          <h2 className="font-semibold text-base sm:text-lg text-white leading-relaxed tracking-tight">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {question.options.map((option, idx) => (
              <QuizOption
                key={idx}
                index={idx}
                optionText={option}
                isMultiple={isMultiple}
                isSelected={isMultiple ? selectedArr.includes(idx) : selectedOption === idx}
                onSelect={handleOptionSelect}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Control Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onPrev}
          disabled={questionIndex === 0}
          icon={ArrowLeft}
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {questionIndex === totalQuestions - 1 ? (
            <Button
              variant="liquid"
              size="md"
              onClick={onSubmit}
              icon={Send}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              variant="liquid"
              size="md"
              onClick={onNext}
              icon={ArrowRight}
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
