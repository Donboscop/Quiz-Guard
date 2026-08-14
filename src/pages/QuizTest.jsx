import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { getQuizById } from '../data/quizzes';
import { FocusMonitor } from '../components/quiz/FocusMonitor';
import { WarningModal } from '../components/quiz/WarningModal';
import { QuizTimer } from '../components/quiz/QuizTimer';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { QuestionNavigator } from '../components/quiz/QuestionNavigator';
import { FullscreenButton } from '../components/quiz/FullscreenButton';
import { MobileNotice } from '../components/quiz/MobileNotice';
import { ProgressBar } from '../components/common/ProgressBar';
import { ShieldCheck, AlertCircle, Users } from 'lucide-react';

export const QuizTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quizContainerRef = useRef(null);

  const {
    activeQuiz,
    currentQuestionIndex,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    sessionStatus,
    startQuiz,
    issueFocusWarning,
    isContestMode,
    opponentName,
    opponentProgress
  } = useQuiz();

  // If no active quiz loaded in context, reload from quizzes database
  useEffect(() => {
    if (!activeQuiz && id) {
      const found = getQuizById(id);
      if (found) {
        startQuiz(found);
      } else {
        navigate('/categories', { replace: true });
      }
    }
  }, [activeQuiz, id, startQuiz, navigate]);

  // Route automatically if status changes to terminated or completed
  useEffect(() => {
    if (sessionStatus === 'terminated' && id) {
      navigate(`/quiz/${id}/terminated`, { replace: true });
    } else if (sessionStatus === 'completed' && id) {
      navigate(`/quiz/${id}/result`, { replace: true });
    }
  }, [sessionStatus, id, navigate]);

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading test environment...
      </div>
    );
  }

  const currentQ = activeQuiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

  const handleSubmit = () => {
    if (window.confirm("Are you sure you want to submit your quiz? You cannot edit your answers after submitting.")) {
      submitQuiz('Completed');
      navigate(`/quiz/${activeQuiz.id}/result`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      
      {/* Focus Monitoring Engine */}
      <FocusMonitor quizContainerRef={quizContainerRef} isActive={true} />
      <WarningModal />

      {/* Top Proctoring Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm sm:text-base text-white line-clamp-1">
                {activeQuiz.title}
              </h1>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Active Proctored Session
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FullscreenButton onExitFullscreen={() => {
              issueFocusWarning("Fullscreen Mode Exited", "Exiting fullscreen during a proctored assessment is recorded.");
            }} />
            <QuizTimer />
          </div>

        </div>
      </header>

      {/* Progress Line */}
      <ProgressBar progress={progressPercent} height="h-1.5" className="sticky top-[61px] z-30" />

      {/* MAIN TEST CONTAINER BOUNDARY BOX */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <MobileNotice />

        {isContestMode && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <Users className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Quiz Duel</span>
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-around">
              {/* User Progress */}
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">You</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Q {currentQuestionIndex + 1}/{activeQuiz.questions.length}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 capitalize">
                    {sessionStatus === 'in-progress' ? 'Solving' : sessionStatus}
                  </span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

              {/* Opponent Progress */}
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{opponentName || "Opponent"}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    Q {(opponentProgress?.currentQuestionIndex ?? 0) + 1}/{activeQuiz.questions.length}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border capitalize ${
                    opponentProgress?.status === 'terminated'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : opponentProgress?.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {opponentProgress?.status === 'in-progress' ? 'Solving' : (opponentProgress?.status || 'Joining...')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Proctored Test Area — Keep Cursor Inside
          </span>
        </div>

        {/* Boundary Area Ref */}
        <div
          ref={quizContainerRef}
          className="relative rounded-3xl p-4 sm:p-8 bg-slate-950/80 border-2 border-brand-500/30 shadow-glow-sm transition-all"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Question Card */}
            <div className="lg:col-span-2">
              {currentQ && (
                <QuestionCard
                  question={currentQ}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={activeQuiz.questions.length}
                  onNext={nextQuestion}
                  onPrev={prevQuestion}
                  onSubmit={handleSubmit}
                />
              )}
            </div>

            {/* Right 1 Col: Question Navigator Matrix */}
            <div className="lg:col-span-1">
              <QuestionNavigator questions={activeQuiz.questions} />
            </div>

          </div>
        </div>

      </main>

      {/* Bottom Footer Notice */}
      <footer className="py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        QuizGuard Proctoring Active • All responses auto-saved to session state.
      </footer>
    </div>
  );
};
