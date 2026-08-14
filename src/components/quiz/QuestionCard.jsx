import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizOption } from './QuizOption';
import { Button } from '../common/Button';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

export const QuestionCard = ({
  question,
  questionIndex,
  totalQuestions,
  onNext,
  onPrev,
  onSubmit
}) => {
  const { userAnswers, selectOption } = useQuiz();
  const selectedOption = userAnswers[question.id];

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
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID #{question.id}
            </span>
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
                isSelected={selectedOption === idx}
                onSelect={(selectedIdx) => selectOption(question.id, selectedIdx)}
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
