import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveAttempt, saveCurrentQuizState, getCurrentQuizState, clearCurrentQuizState } from '../utils/storage';
import { calculateResults } from '../utils/quizUtils';
import { Peer } from 'peerjs';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [focusWarnings, setFocusWarnings] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('idle'); // 'idle' | 'in-progress' | 'completed' | 'terminated' | 'time-expired'
  const [terminationReason, setTerminationReason] = useState('');
  
  // Warning modal state
  const [warningModal, setWarningModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning' // 'warning' | 'boundary'
  });

  const [latestResult, setLatestResult] = useState(null);
  const timerRef = useRef(null);

  // Multiplayer Live Contest states
  const [peer, setPeerState] = useState(null);
  const [conn, setConnState] = useState(null);
  const [isContestMode, setIsContestMode] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');

  const resetMultiplayer = useCallback(() => {
    if (conn) {
      try { conn.close(); } catch(e){}
    }
    if (peer) {
      try { peer.destroy(); } catch(e){}
    }
    setPeerState(null);
    setConnState(null);
    setIsContestMode(false);
    setIsHost(false);
    setOpponentProgress(null);
    setOpponentResult(null);
    setOpponentName('');
  }, [conn, peer]);

  // Handle incoming P2P connections on Host
  useEffect(() => {
    if (!peer) return;

    const handleConnection = (connection) => {
      setConnState(connection);
    };

    peer.on('connection', handleConnection);
    return () => {
      peer.off('connection', handleConnection);
    };
  }, [peer]);

  // Set Peer and Connection states safely
  const setPeer = (p) => setPeerState(p);
  const setConn = (c) => setConnState(c);

  // Handle WebRTC messaging/sync events
  useEffect(() => {
    if (!conn) return;

    const handleData = (data) => {
      if (data.type === 'START_CONTEST') {
        setActiveQuiz(data.quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setMarkedForReview([]);
        setTimeRemaining(data.quiz.duration * 60);
        setFocusWarnings(0);
        setSessionStatus('in-progress');
        setTerminationReason('');
        setLatestResult(null);
        setIsContestMode(true);
        setIsHost(false);
        setOpponentName(data.hostName);
        setOpponentProgress({
          currentQuestionIndex: 0,
          score: 0,
          status: 'in-progress',
          name: data.hostName
        });
        setOpponentResult(null);
      } else if (data.type === 'PROGRESS_UPDATE') {
        setOpponentProgress(prev => prev ? {
          ...prev,
          currentQuestionIndex: data.currentQuestionIndex,
          score: data.score,
          status: data.status
        } : {
          currentQuestionIndex: data.currentQuestionIndex,
          score: data.score,
          status: data.status,
          name: opponentName
        });
      } else if (data.type === 'FINISH_CONTEST') {
        setOpponentResult(data.result);
        setOpponentProgress(prev => prev ? { ...prev, status: 'completed', score: data.result.score } : null);
      } else if (data.type === 'TERMINATE_CONTEST') {
        setOpponentResult(data.result);
        setOpponentProgress(prev => prev ? { ...prev, status: 'terminated' } : null);
      }
    };

    conn.on('data', handleData);
    conn.on('close', () => {
      console.warn("Lobby Connection closed.");
      setConnState(null);
    });

    return () => {
      conn.off('data', handleData);
    };
  }, [conn, opponentName]);

  // Broadcast progress updates during contest mode
  useEffect(() => {
    if (isContestMode && conn && sessionStatus === 'in-progress' && activeQuiz) {
      const calculated = calculateResults(
        activeQuiz.questions,
        userAnswers,
        activeQuiz.duration,
        timeRemaining
      );
      try {
        conn.send({
          type: 'PROGRESS_UPDATE',
          currentQuestionIndex,
          score: calculated.score,
          status: sessionStatus
        });
      } catch(e) {
        console.error("Failed to broadcast progress:", e);
      }
    }
  }, [currentQuestionIndex, userAnswers, isContestMode, conn, sessionStatus, activeQuiz, timeRemaining]);

  // Restore session from localStorage on mount if valid
  useEffect(() => {
    const saved = getCurrentQuizState();
    if (saved && saved.activeQuiz && saved.sessionStatus === 'in-progress') {
      setActiveQuiz(saved.activeQuiz);
      setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
      setUserAnswers(saved.userAnswers || {});
      setMarkedForReview(saved.markedForReview || []);
      setTimeRemaining(saved.timeRemaining || 0);
      setFocusWarnings(saved.focusWarnings || 0);
      setSessionStatus('in-progress');
    }
  }, []);

  // Save in-progress state to localStorage whenever answers/timer update
  useEffect(() => {
    if (sessionStatus === 'in-progress' && activeQuiz) {
      saveCurrentQuizState({
        activeQuiz,
        currentQuestionIndex,
        userAnswers,
        markedForReview,
        timeRemaining,
        focusWarnings,
        sessionStatus
      });
    }
  }, [activeQuiz, currentQuestionIndex, userAnswers, markedForReview, timeRemaining, focusWarnings, sessionStatus]);

  // Start new quiz session
  const startQuiz = useCallback((quiz) => {
    if (!quiz) return;
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setMarkedForReview([]);
    setTimeRemaining(quiz.duration * 60);
    setFocusWarnings(0);
    setSessionStatus('in-progress');
    setTerminationReason('');
    setLatestResult(null);
    setWarningModal({ isOpen: false, title: '', message: '', type: 'warning' });
  }, []);

  // Select an option for a question
  const selectOption = useCallback((questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  }, []);

  // Toggle mark for review
  const toggleMarkForReview = useCallback((questionId) => {
    setMarkedForReview(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const nextQuestion = useCallback(() => {
    if (!activeQuiz) return;
    setCurrentQuestionIndex(prev => Math.min(prev + 1, activeQuiz.questions.length - 1));
  }, [activeQuiz]);

  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToQuestion = useCallback((index) => {
    if (!activeQuiz) return;
    if (index >= 0 && index < activeQuiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [activeQuiz]);

  // Submit test (Completed or Time Expired)
  const submitQuiz = useCallback((status = 'Completed', customReason = null) => {
    if (!activeQuiz) return null;

    setSessionStatus(status);
    clearInterval(timerRef.current);

    const calculated = calculateResults(
      activeQuiz.questions,
      userAnswers,
      activeQuiz.duration,
      timeRemaining
    );

    const attemptData = {
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      category: activeQuiz.category,
      difficulty: activeQuiz.difficulty,
      score: calculated.score,
      totalQuestions: calculated.totalQuestions,
      correctCount: calculated.correctCount,
      wrongCount: calculated.wrongCount,
      unansweredCount: calculated.unansweredCount,
      percentage: calculated.percentage,
      status: status,
      reason: customReason,
      focusWarnings: focusWarnings,
      timeTakenSeconds: calculated.timeTakenSeconds,
      answers: userAnswers,
      questions: activeQuiz.questions // attach for review
    };

    const savedRecord = saveAttempt(attemptData);
    setLatestResult(savedRecord);
    clearCurrentQuizState();

    if (isContestMode && conn) {
      try {
        conn.send({
          type: 'FINISH_CONTEST',
          result: attemptData
        });
      } catch(e) {
        console.error("Failed to send final results payload:", e);
      }
    }

    return savedRecord;
  }, [activeQuiz, userAnswers, timeRemaining, focusWarnings, isContestMode, conn]);

  // Terminate test due to focus violation
  const terminateQuiz = useCallback((reason) => {
    if (!activeQuiz || sessionStatus !== 'in-progress') return null;

    setSessionStatus('terminated');
    setTerminationReason(reason);
    clearInterval(timerRef.current);

    const calculated = calculateResults(
      activeQuiz.questions,
      userAnswers,
      activeQuiz.duration,
      timeRemaining
    );

    const attemptData = {
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      category: activeQuiz.category,
      difficulty: activeQuiz.difficulty,
      score: calculated.score,
      totalQuestions: calculated.totalQuestions,
      correctCount: calculated.correctCount,
      wrongCount: calculated.wrongCount,
      unansweredCount: calculated.unansweredCount,
      percentage: calculated.percentage,
      status: 'Terminated',
      reason: reason,
      focusWarnings: focusWarnings + 1,
      timeTakenSeconds: calculated.timeTakenSeconds,
      answers: userAnswers,
      questions: activeQuiz.questions
    };

    const savedRecord = saveAttempt(attemptData);
    setLatestResult(savedRecord);
    clearCurrentQuizState();

    setWarningModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'warning'
    });

    if (isContestMode && conn) {
      try {
        conn.send({
          type: 'TERMINATE_CONTEST',
          result: attemptData
        });
      } catch(e) {
        console.error("Failed to send termination message:", e);
      }
    }

    return savedRecord;
  }, [activeQuiz, sessionStatus, userAnswers, timeRemaining, focusWarnings, isContestMode, conn]);

  // Issue focus warning (tab switch, etc.)
  const issueFocusWarning = useCallback((title, message) => {
    setFocusWarnings(prev => {
      const nextCount = prev + 1;
      // If repeat warning (e.g. 2nd tab switch), trigger immediate termination!
      if (nextCount >= 2) {
        terminateQuiz("Multiple focus violations detected (tab switching / window defocus).");
      } else {
        setWarningModal({
          isOpen: true,
          title: title || "Focus Warning Issued",
          message: message || "You have moved away from the active test window. Repeated actions will terminate your attempt.",
          type: "warning"
        });
      }
      return nextCount;
    });
  }, [terminateQuiz]);

  const closeWarningModal = useCallback(() => {
    setWarningModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <QuizContext.Provider value={{
      activeQuiz,
      currentQuestionIndex,
      userAnswers,
      markedForReview,
      timeRemaining,
      setTimeRemaining,
      focusWarnings,
      sessionStatus,
      terminationReason,
      warningModal,
      latestResult,
      startQuiz,
      selectOption,
      toggleMarkForReview,
      nextQuestion,
      prevQuestion,
      goToQuestion,
      submitQuiz,
      terminateQuiz,
      issueFocusWarning,
      closeWarningModal,
      peer,
      setPeer,
      conn,
      setConn,
      isContestMode,
      setIsContestMode,
      isHost,
      setIsHost,
      opponentProgress,
      setOpponentProgress,
      opponentResult,
      setOpponentResult,
      playerName,
      setPlayerName,
      opponentName,
      setOpponentName,
      resetMultiplayer
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
