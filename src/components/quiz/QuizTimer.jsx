import React, { useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { formatTime } from '../../utils/quizUtils';
import { Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuizTimer = () => {
  const { timeRemaining, setTimeRemaining, sessionStatus, submitQuiz, activeQuiz } = useQuiz();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStatus !== 'in-progress') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired! Auto submit and navigate to result page
          submitQuiz('Time Expired', 'Time limit reached. Your test has been submitted automatically.');
          if (activeQuiz) {
            navigate(`/quiz/${activeQuiz.id}/result`, { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStatus, setTimeRemaining, submitQuiz, activeQuiz, navigate]);

  const isLowTime = timeRemaining <= 120; // under 2 mins
  const isCriticalTime = timeRemaining <= 30; // under 30s

  return (
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all ${
      isCriticalTime
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse shadow-danger-glow'
        : isLowTime
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
        : 'bg-slate-900/80 text-slate-200 border-slate-700'
    }`}>
      {isCriticalTime ? (
        <AlertCircle className="w-4 h-4 text-rose-400 animate-spin" />
      ) : (
        <Clock className={`w-4 h-4 ${isLowTime ? 'text-amber-400' : 'text-brand-400'}`} />
      )}
      <span className="font-mono font-bold text-sm tracking-wider">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};
