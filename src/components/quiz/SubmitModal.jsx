import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, ArrowRight, X } from 'lucide-react';
import { formatTime } from '../../utils/quizUtils';

export const SubmitModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions = 0,
  answeredCount = 0,
  timeRemaining = 0
}) => {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const isFullyAnswered = unansweredCount === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-white/15 p-6 sm:p-7 shadow-2xl z-10 text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg sm:text-xl text-white">
                  Submit Assessment?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Confirm completion of your proctored assessment
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Assessment Summary Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Answered</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {answeredCount} <span className="text-xs font-normal text-zinc-500">/ {totalQuestions}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending</span>
              </div>
              <div className={`text-lg font-bold font-mono ${unansweredCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {unansweredCount}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Time Left</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Unanswered or Review Alert Banner */}
          {!isFullyAnswered ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-amber-300">You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}.</span> Unanswered questions will receive 0 points.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs text-emerald-300">
                All questions have been answered. Ready to calculate final score.
              </div>
            </div>
          )}

          {/* Notice */}
          <p className="text-xs text-zinc-400 leading-relaxed">
            Once submitted, your responses will be locked and detailed analysis will be generated. You cannot modify answers after submission.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
            >
              Review Answers
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Confirm & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
