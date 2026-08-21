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

  const [questionTimes, setQuestionTimes] = useState({});
  const [latestResult, setLatestResult] = useState(null);
  const timerRef = useRef(null);

  // Multiplayer Live Contest states
  const [peer, setPeerState] = useState(null);
  const [conn, setConnState] = useState(null); // Single connection for Guest -> Host
  const connsRef = useRef([]); // Host's connections array for all joined guests
  const [participants, setParticipants] = useState([]); // Master list of participants in room
  const [isContestMode, setIsContestMode] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');

  // Per-question timing ticker
  useEffect(() => {
    if (sessionStatus !== 'in-progress' || !activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    if (!currentQ) return;
    const qId = currentQ.id;

    const interval = setInterval(() => {
      setQuestionTimes(prev => ({
        ...prev,
        [qId]: (prev[qId] || 0) + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStatus, activeQuiz, currentQuestionIndex]);

  const resetMultiplayer = useCallback(() => {
    if (conn) {
      try { conn.close(); } catch(e){}
    }
    connsRef.current.forEach(c => {
      try { c.close(); } catch(e){}
    });
    connsRef.current = [];

    if (peer) {
      try { peer.destroy(); } catch(e){}
    }
    setPeerState(null);
    setConnState(null);
    setParticipants([]);
    setIsContestMode(false);
    setIsHost(false);
    setOpponentProgress(null);
    setOpponentResult(null);
    setOpponentName('');
  }, [conn, peer]);

  // Host helper to broadcast data to all connected guests
  const broadcastToAll = useCallback((payload) => {
    connsRef.current.forEach(c => {
      try { c.send(payload); } catch(e){}
    });
  }, []);

  // Helper to initialize Host participant entry
  const initHostParticipants = useCallback((hostPeerId, name) => {
    const hostEntry = {
      id: hostPeerId || 'host',
      name: name.trim() || 'Host',
      isHost: true,
      currentQuestionIndex: 0,
      score: 0,
      status: 'in-lobby'
    };
    setParticipants([hostEntry]);
  }, []);

  // Handle incoming P2P connections on Host
  useEffect(() => {
    if (!peer) return;

    const handleConnection = (connection) => {
      // Check maximum limit of 50 participants
      if (connsRef.current.length >= 50) {
        connection.on('open', () => {
          try {
            connection.send({
              type: 'ROOM_ERROR',
              message: 'Room is full! Maximum limit of 50 participants reached for this live contest.'
            });
          } catch(e){}
          setTimeout(() => { try { connection.close(); } catch(e){} }, 500);
        });
        return;
      }

      // Add connection to Host's list if not present
      if (!connsRef.current.some(c => c.peer === connection.peer)) {
        connsRef.current.push(connection);
      }
      setConnState(connection);

      // Listen for data from this guest
      connection.on('data', (data) => {
        if (data.type === 'HANDSHAKE') {
          const newGuest = {
            id: connection.peer,
            name: data.name || 'Guest',
            isHost: false,
            currentQuestionIndex: 0,
            score: 0,
            status: 'in-lobby'
          };

          setParticipants(prev => {
            // Reject if 50 limit reached
            if (prev.length >= 50) {
              try {
                connection.send({
                  type: 'ROOM_ERROR',
                  message: 'Room is full! Maximum limit of 50 participants reached.'
                });
              } catch(e){}
              return prev;
            }

            const hostEntry = {
              id: peer ? peer.id : 'host',
              name: playerName.trim() || 'Host',
              isHost: true,
              currentQuestionIndex: 0,
              score: 0,
              status: 'in-lobby'
            };

            const hasHost = prev.some(p => p.isHost);
            let base = hasHost ? prev : [hostEntry, ...prev];
            const exists = base.some(p => p.id === connection.peer);
            const updated = exists
              ? base.map(p => p.id === connection.peer ? { ...p, name: data.name } : p)
              : [...base, newGuest];

            // Host broadcasts updated LOBBY_STATE to ALL guests
            const lobbyPayload = {
              type: 'LOBBY_STATE',
              participants: updated,
              hostName: playerName.trim() || 'Host'
            };
            connsRef.current.forEach(c => {
              try { c.send(lobbyPayload); } catch(e){}
            });

            return updated;
          });

          setOpponentName(data.name || 'Guest');
        } else if (data.type === 'PROGRESS_UPDATE') {
          setParticipants(prev => {
            const updated = prev.map(p => p.id === connection.peer ? {
              ...p,
              currentQuestionIndex: data.currentQuestionIndex,
              score: data.score,
              status: data.status
            } : p);

            // Relay progress to all guests
            connsRef.current.forEach(c => {
              try { c.send({ type: 'ROOM_PROGRESS', participants: updated }); } catch(e){}
            });

            return updated;
          });
        } else if (data.type === 'FINISH_CONTEST' || data.type === 'TERMINATE_CONTEST') {
          setParticipants(prev => {
            const updated = prev.map(p => p.id === connection.peer ? {
              ...p,
              score: data.result?.score ?? p.score,
              status: data.type === 'TERMINATE_CONTEST' ? 'terminated' : 'completed',
              result: data.result
            } : p);

            // Relay results to all guests
            connsRef.current.forEach(c => {
              try { c.send({ type: 'ROOM_PROGRESS', participants: updated }); } catch(e){}
            });

            return updated;
          });
        }
      });

      connection.on('close', () => {
        connsRef.current = connsRef.current.filter(c => c.peer !== connection.peer);
        setParticipants(prev => {
          const updated = prev.filter(p => p.id !== connection.peer);
          connsRef.current.forEach(c => {
            try { c.send({ type: 'LOBBY_STATE', participants: updated, hostName: playerName }); } catch(e){}
          });
          return updated;
        });
      });
    };

    peer.on('connection', handleConnection);
    return () => {
      peer.off('connection', handleConnection);
    };
  }, [peer, playerName]);

  // Set Peer and Connection states safely
  const setPeer = (p) => setPeerState(p);
  const setConn = (c) => setConnState(c);

  // Guest-side: Listen for messages from Host connection
  useEffect(() => {
    if (!conn || isHost) return;

    const handleData = (data) => {
      if (data.type === 'LOBBY_STATE') {
        setParticipants(data.participants || []);
        if (data.hostName) setOpponentName(data.hostName);
      } else if (data.type === 'START_CONTEST') {
        setActiveQuiz(data.quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuestionTimes({});
        setMarkedForReview([]);
        setTimeRemaining(data.quiz.duration * 60);
        setFocusWarnings(0);
        setSessionStatus('in-progress');
        setTerminationReason('');
        setLatestResult(null);
        setIsContestMode(true);
        setIsHost(false);
        if (data.participants) setParticipants(data.participants);
        if (data.hostName) setOpponentName(data.hostName);
      } else if (data.type === 'ROOM_PROGRESS') {
        if (data.participants) {
          setParticipants(data.participants);
        }
      } else if (data.type === 'ROOM_ERROR') {
        alert(data.message || 'Room is full! Maximum limit of 50 participants reached.');
        resetMultiplayer();
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
  }, [conn, isHost]);

  // Host starts contest for ALL connected participants
  const startContest = useCallback((quiz) => {
    if (!quiz) return;

    // Ensure host is included in participants
    const hostEntry = {
      id: peer ? peer.id : 'host',
      name: playerName.trim() || 'Host',
      isHost: true,
      currentQuestionIndex: 0,
      score: 0,
      status: 'in-progress'
    };

    const initialParticipants = [
      hostEntry,
      ...participants.filter(p => p.id !== hostEntry.id)
    ];

    setParticipants(initialParticipants);

    // Broadcast START_CONTEST payload to all guests
    const startPayload = {
      type: 'START_CONTEST',
      quiz: quiz,
      hostName: playerName.trim() || 'Host',
      participants: initialParticipants
    };

    connsRef.current.forEach(c => {
      try { c.send(startPayload); } catch(e){}
    });

    // Start local quiz session for Host
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuestionTimes({});
    setMarkedForReview([]);
    setTimeRemaining(quiz.duration * 60);
    setFocusWarnings(0);
    setSessionStatus('in-progress');
    setTerminationReason('');
    setLatestResult(null);
    setIsContestMode(true);
    setIsHost(true);
  }, [peer, playerName, participants]);

  // Broadcast progress updates during contest mode
  useEffect(() => {
    if (isContestMode && sessionStatus === 'in-progress' && activeQuiz) {
      const calculated = calculateResults(
        activeQuiz.questions,
        userAnswers,
        activeQuiz.duration,
        timeRemaining
      );

      const myId = peer ? peer.id : (isHost ? 'host' : 'guest');
      const myName = playerName.trim() || (isHost ? 'Host' : 'Player');

      if (isHost) {
        // Host updates own record in participants and broadcasts ROOM_PROGRESS
        setParticipants(prev => {
          const updated = prev.map(p => (p.isHost || p.id === myId) ? {
            ...p,
            currentQuestionIndex,
            score: calculated.score,
            status: sessionStatus
          } : p);

          connsRef.current.forEach(c => {
            try { c.send({ type: 'ROOM_PROGRESS', participants: updated }); } catch(e){}
          });

          return updated;
        });
      } else if (conn) {
        // Guest sends progress update to Host
        try {
          conn.send({
            type: 'PROGRESS_UPDATE',
            peerId: myId,
            name: myName,
            currentQuestionIndex,
            score: calculated.score,
            status: sessionStatus
          });
        } catch(e) {
          console.error("Failed to send progress update:", e);
        }
      }
    }
  }, [currentQuestionIndex, userAnswers, isContestMode, conn, sessionStatus, activeQuiz, timeRemaining, isHost, peer, playerName]);

  // Restore session from localStorage on mount if valid
  useEffect(() => {
    const saved = getCurrentQuizState();
    if (saved && saved.activeQuiz && saved.sessionStatus === 'in-progress') {
      setActiveQuiz(saved.activeQuiz);
      setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
      setUserAnswers(saved.userAnswers || {});
      setQuestionTimes(saved.questionTimes || {});
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
        questionTimes,
        markedForReview,
        timeRemaining,
        focusWarnings,
        sessionStatus
      });
    }
  }, [activeQuiz, currentQuestionIndex, userAnswers, questionTimes, markedForReview, timeRemaining, focusWarnings, sessionStatus]);

  // Start new quiz session
  const startQuiz = useCallback((quiz) => {
    if (!quiz) return;
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuestionTimes({});
    setMarkedForReview([]);
    setTimeRemaining(quiz.duration * 60);
    setFocusWarnings(0);
    setSessionStatus('in-progress');
    setTerminationReason('');
    setLatestResult(null);
    setWarningModal({ isOpen: false, title: '', message: '', type: 'warning' });
  }, []);

  // Select an option for a question (supports single and multi-select)
  const selectOption = useCallback((questionId, optionIndex, isMultiple = false) => {
    setUserAnswers(prev => {
      const current = prev[questionId];
      if (isMultiple) {
        let currentArr = Array.isArray(current)
          ? [...current]
          : (current !== undefined && current !== null && current !== '' ? [current] : []);
        
        if (currentArr.includes(optionIndex)) {
          currentArr = currentArr.filter(i => i !== optionIndex);
        } else {
          currentArr.push(optionIndex);
        }
        currentArr.sort((a, b) => a - b);
        return {
          ...prev,
          [questionId]: currentArr
        };
      }
      return {
        ...prev,
        [questionId]: optionIndex
      };
    });
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
      questionTimes: questionTimes,
      isContest: isContestMode,
      playerName: playerName.trim() || 'Player',
      opponentName: opponentName || null,
      opponentResult: opponentResult || null,
      questions: activeQuiz.questions // attach for review
    };

    const savedRecord = saveAttempt(attemptData);
    setLatestResult(savedRecord);
    clearCurrentQuizState();

    if (isContestMode) {
      const finishPayload = {
        type: 'FINISH_CONTEST',
        result: attemptData
      };
      if (isHost) {
        connsRef.current.forEach(c => {
          try { c.send(finishPayload); } catch(e){}
        });
      } else if (conn) {
        try {
          conn.send(finishPayload);
        } catch(e) {
          console.error("Failed to send final results payload:", e);
        }
      }
    }

    return savedRecord;
  }, [activeQuiz, userAnswers, questionTimes, timeRemaining, focusWarnings, isContestMode, playerName, opponentName, opponentResult, conn, isHost]);

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
      questionTimes: questionTimes,
      isContest: isContestMode,
      playerName: playerName.trim() || 'Player',
      opponentName: opponentName || null,
      opponentResult: opponentResult || null,
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

    if (isContestMode) {
      const termPayload = {
        type: 'TERMINATE_CONTEST',
        result: attemptData
      };
      if (isHost) {
        connsRef.current.forEach(c => {
          try { c.send(termPayload); } catch(e){}
        });
      } else if (conn) {
        try {
          conn.send(termPayload);
        } catch(e) {
          console.error("Failed to send termination message:", e);
        }
      }
    }

    return savedRecord;
  }, [activeQuiz, sessionStatus, userAnswers, questionTimes, timeRemaining, focusWarnings, isContestMode, playerName, opponentName, opponentResult, conn, isHost]);

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
      questionTimes,
      markedForReview,
      timeRemaining,
      setTimeRemaining,
      focusWarnings,
      sessionStatus,
      terminationReason,
      warningModal,
      latestResult,
      startQuiz,
      startContest,
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
      participants,
      setParticipants,
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
      resetMultiplayer,
      initHostParticipants
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
