import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizOption } from './QuizOption';
import { Button } from '../common/Button';
import { ArrowLeft, ArrowRight, Send, Clock, CheckSquare } from 'lucide-react';
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
  const { userAnswers, selectOption, activeQuiz, questionTimes, submitAnswerInSupabase } = useQuiz();
  const rawAnswer = userAnswers[question.id];
  const isMultiple = isMultiAnswerQuestion(question);
  const selectedArr = getUserAnswers(rawAnswer);
  const selectedOption = rawAnswer;

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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6"
        >
          {/* Question Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
                Question {questionIndex + 1} of {totalQuestions}
              </span>
              {isMultiple && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold animate-pulse">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                  Select Multiple Answers
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                ID #{question.id}
              </span>
            </div>

            {/* Per-Question Timeline Gap Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Quest Gap: {formatTime(secondsSpentOnCurrentQ)} / {formatTime(allocatedGap)}</span>
            </div>
          </div>

          {/* Question Timeline Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                gapProgress >= 100 ? 'bg-rose-500' : gapProgress > 75 ? 'bg-amber-400' : 'bg-brand-500'
              }`}
              style={{ width: `${gapProgress}%` }}
            />
          </div>

          {/* Question Prompt */}
          <h2 className="font-display font-semibold text-lg sm:text-xl text-white leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
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
              variant="primary"
              size="md"
              onClick={onSubmit}
              icon={Send}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="primary"
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
