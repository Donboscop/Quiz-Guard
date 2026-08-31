import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { getQuizById } from '../data/quizzes';
import { FocusMonitor } from '../components/quiz/FocusMonitor';
import { WarningModal } from '../components/quiz/WarningModal';
import { SubmitModal } from '../components/quiz/SubmitModal';
import { QuizTimer } from '../components/quiz/QuizTimer';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { QuestionNavigator } from '../components/quiz/QuestionNavigator';
import { FullscreenButton } from '../components/quiz/FullscreenButton';
import { MobileNotice } from '../components/quiz/MobileNotice';
import { ProgressBar } from '../components/common/ProgressBar';
import { isQuestionAnswered } from '../utils/quizUtils';
import { Shield, Eye, Users } from 'lucide-react';

export const QuizTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quizContainerRef = useRef(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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
    opponentProgress,
    participants,
    playerName,
    isHost,
    trackParticipantProgress,
    userAnswers,
    timeRemaining
  } = useQuiz();

  // Report progress to Realtime
  useEffect(() => {
    if (isContestMode && trackParticipantProgress) {
      trackParticipantProgress(currentQuestionIndex);
    }
  }, [isContestMode, currentQuestionIndex, trackParticipantProgress]);

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
      <div className="min-h-screen flex items-center justify-center text-zinc-500 bg-black text-xs font-mono">
        INITIALIZING PROCTORED ENVIRONMENT...
      </div>
    );
  }

  const currentQ = activeQuiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;
  const answeredCount = activeQuiz.questions.filter(q => isQuestionAnswered(q, userAnswers[q.id])).length;

  const handleOpenSubmitModal = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    submitQuiz('Completed');
    navigate(`/quiz/${activeQuiz.id}/result`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between select-none">
      
      {/* Focus Monitoring Engine */}
      <FocusMonitor quizContainerRef={quizContainerRef} isActive={true} />
      <WarningModal />

      {/* Modern Submit Assessment Confirmation Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        totalQuestions={activeQuiz.questions.length}
        answeredCount={answeredCount}
        timeRemaining={timeRemaining}
      />

      {/* Top Proctoring Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/90 backdrop-blur-2xl px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-xs sm:text-sm text-white line-clamp-1">
                {activeQuiz.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Monitored
                </span>
              </div>
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
      <ProgressBar progress={progressPercent} height="h-1" className="sticky top-[57px] z-30 bg-zinc-900" />

      {/* MAIN TEST CONTAINER BOUNDARY BOX */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <MobileNotice />

        {/* Live Multiplayer Participant Matrix */}
        {isContestMode && (
          <div className="mb-6 p-4 rounded-xl vesper-panel space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white font-medium">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Live Arena Synchronized Session ({participants.length || 1} Participants)</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Realtime Live</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
              {(participants.length > 0 ? participants : [
                { name: playerName || 'You', isUser: true, currentQuestionIndex, status: sessionStatus },
                { name: opponentName || 'Opponent', currentQuestionIndex: opponentProgress?.currentQuestionIndex ?? 0, status: opponentProgress?.status || 'in-progress' }
              ]).map((p) => {
                const isMe = p.name === playerName || p.isUser || (isHost && p.isHost);
                const qIdx = isMe ? currentQuestionIndex : (p.currentQuestionIndex ?? 0);
                const displayStatus = isMe ? sessionStatus : (p.status || 'in-progress');

                return (
                  <div key={p.id || p.name} className={`p-2 rounded-lg border text-xs ${isMe ? 'bg-white/10 border-white/30 text-white' : 'bg-zinc-950 border-white/[0.06] text-zinc-300'}`}>
                    <div className="flex items-center justify-between font-medium">
                      <span className="truncate max-w-[80px]">{p.name}</span>
                      {isMe && <span className="text-[9px] text-black font-bold bg-white px-1 rounded">YOU</span>}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-zinc-400">
                      <span>Q {qIdx + 1}/{activeQuiz.questions.length}</span>
                      <span className="text-emerald-400 capitalize">
                        {displayStatus === 'in-progress' ? 'Solving' : displayStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mb-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 px-3 py-1 rounded-full border border-white/10">
            Proctored Test Zone — Keep cursor inside boundary
          </span>
        </div>

        {/* Boundary Area Ref */}
        <div
          ref={quizContainerRef}
          className="relative rounded-2xl p-4 sm:p-6 bg-black border border-white/20 shadow-2xl transition-all"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Question Card */}
            <div className="lg:col-span-2">
              {currentQ && (
                <QuestionCard
                  question={currentQ}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={activeQuiz.questions.length}
                  onNext={nextQuestion}
                  onPrev={prevQuestion}
                  onSubmit={handleOpenSubmitModal}
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
      <footer className="py-3 border-t border-white/[0.06] text-center text-[11px] text-zinc-600 font-mono">
        QUIZGUARD FOCUS MONITORING ACTIVE • RESPONSES STORED LOCALLY & SYNCHRONIZED
      </footer>
    </div>
  );
};
