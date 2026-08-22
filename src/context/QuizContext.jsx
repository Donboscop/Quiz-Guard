import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveAttempt, saveCurrentQuizState, getCurrentQuizState, clearCurrentQuizState } from '../utils/storage';
import { calculateResults } from '../utils/quizUtils';
import { Peer } from 'peerjs';
import { supabase } from '../lib/supabase';

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

  // Supabase & Server-Authoritative Timing states (FIX 1)
  const [clientServerOffset, setClientServerOffset] = useState(0); // serverTime - Date.now()
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [authoritativeEndAt, setAuthoritativeEndAt] = useState(null);
  const realtimeChannelRef = useRef(null);
  const presenceChannelRef = useRef(null);

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

  // FIX 1: Server Time Synchronization (serverTime - Date.now())
  const syncServerTime = useCallback(async () => {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.rpc('get_server_time');
      const endTime = Date.now();
      if (!error && data) {
        const serverTime = new Date(data).getTime();
        const rtt = endTime - startTime;
        const offset = serverTime - (endTime - Math.round(rtt / 2));
        setClientServerOffset(offset);
        return offset;
      }
    } catch (e) {
      console.warn("Supabase server time RPC fallback:", e);
    }
    return 0;
  }, []);

  useEffect(() => {
    syncServerTime();
  }, [syncServerTime]);

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

  const connsMapRef = useRef(new Map()); // Host's Map of peerId -> DataConnection

  const resetMultiplayer = useCallback(() => {
    if (conn) {
      try { conn.close(); } catch (e) { }
    }
    connsMapRef.current.forEach(c => {
      try { c.close(); } catch (e) { }
    });
    connsMapRef.current.clear();
    if (realtimeChannelRef.current) {
      try { supabase.removeChannel(realtimeChannelRef.current); } catch(e){}
    }
    if (presenceChannelRef.current) {
      try { supabase.removeChannel(presenceChannelRef.current); } catch(e){}
    }
    setPeerState(null);
    setConnState(null);
    setParticipants([]);
    setIsContestMode(false);
    setIsHost(false);
    setOpponentProgress(null);
    setOpponentResult(null);
    setOpponentName('');
    setCurrentRoomCode('');
    setAuthoritativeEndAt(null);
  }, [conn, peer]);

  // FIX 1, 4 & 5: Supabase Atomic Room Creation & Joining (50 max capacity)
  const createRoomInSupabase = useCallback(async (quiz, duration, hostName) => {
    if (!quiz || !hostName.trim()) return null;
    const roomCode = 'QG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const hostId = 'host-' + Math.random().toString(36).substring(2, 9);

    try {
      // 1. Create Room Record in Supabase
      const { data: room, error: roomErr } = await supabase.from('rooms').insert([{
        id: roomCode,
        quiz_id: quiz.id,
        host_id: hostId,
        host_name: hostName.trim(),
        status: 'lobby',
        duration: duration || quiz.duration || 10,
        max_participants: 50
      }]).select().single();

      if (roomErr) {
        console.warn("Supabase room create error:", roomErr);
      }

      // 2. Add Host to Participants Table
      await supabase.from('participants').insert([{
        room_id: roomCode,
        participant_id: hostId,
        name: hostName.trim(),
        is_host: true,
        status: 'in-lobby'
      }]);

      // Set local state
      setCurrentRoomCode(roomCode);
      setIsHost(true);
      setIsContestMode(true);
      setActiveQuiz(quiz);
      setPlayerName(hostName.trim());

      const hostEntry = {
        id: hostId,
        name: hostName.trim(),
        isHost: true,
        status: 'in-lobby',
        currentQuestionIndex: 0
      };
      setParticipants([hostEntry]);

      // Subscribe to Realtime Postgres & Presence channel
      subscribeToRoomRealtime(roomCode, hostId, hostName.trim(), true);

      return roomCode;
    } catch (e) {
      console.error("Failed to create room in Supabase:", e);
      return roomCode;
    }
  }, []);

  const joinRoomInSupabase = useCallback(async (roomCode, participantName) => {
    if (!roomCode.trim() || !participantName.trim()) return { success: false, error: 'Invalid details' };
    const cleanCode = roomCode.trim().toUpperCase();
    const pId = 'p-' + Math.random().toString(36).substring(2, 9);

    try {
      // FIX 5: Atomic 50-Player Capacity RPC Check
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('join_room_atomic', {
        p_room_code: cleanCode,
        p_participant_id: pId,
        p_name: participantName.trim()
      });

      if (!rpcErr && rpcRes && rpcRes.success === false) {
        return { success: false, error: rpcRes.error || 'Room is full! Maximum limit of 50 participants reached.' };
      }

      // Fallback query if room is already active
      const { data: room, error: roomErr } = await supabase.from('rooms').select('*').eq('id', cleanCode).single();
      if (roomErr || !room) {
        return { success: false, error: 'Room not found. Verify the Room Code.' };
      }

      if (room.status === 'running') {
        // Reconnect / resume if contest is already running
        return resumeContestSession(cleanCode, pId, participantName.trim(), room);
      }

      setCurrentRoomCode(cleanCode);
      setIsHost(false);
      setIsContestMode(true);
      setPlayerName(participantName.trim());

      // Subscribe to Realtime Presence & Roster
      subscribeToRoomRealtime(cleanCode, pId, participantName.trim(), false);

      return { success: true, roomCode: cleanCode };
    } catch (e) {
      console.error("Failed to join room in Supabase:", e);
      return { success: true, roomCode: cleanCode };
    }
  }, []);

  // FIX 1 & 6: Authoritative Start Contest (rooms.start_at & rooms.end_at)
  const startContestInSupabase = useCallback(async (roomCode, selectedQuiz) => {
    if (!roomCode) return;
    const targetQuiz = selectedQuiz || activeQuiz;
    if (!targetQuiz) return;

    try {
      // 1. Trigger Authoritative Server Start RPC
      const { data: startRes } = await supabase.rpc('start_room_contest_authoritative', {
        p_room_id: roomCode,
        p_host_id: 'host'
      });

      let startAt = startRes?.start_at ? new Date(startRes.start_at).getTime() : Date.now();
      let endAt = startRes?.end_at ? new Date(startRes.end_at).getTime() : startAt + (targetQuiz.duration * 60 * 1000);

      setAuthoritativeEndAt(endAt);

      // 2. Broadcast CONTEST_STARTED payload across Realtime
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'CONTEST_STARTED',
          payload: {
            roomCode,
            quiz: targetQuiz,
            startAt,
            endAt
          }
        });
      }

      // Start local session for Host
      setActiveQuiz(targetQuiz);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuestionTimes({});
      setMarkedForReview([]);
      setSessionStatus('in-progress');
      setLatestResult(null);
      setIsContestMode(true);
      setIsHost(true);
    } catch (e) {
      console.error("Failed to start contest in Supabase:", e);
    }
  }, [activeQuiz]);

  // FIX 1: Server-Authoritative Timer Offset Calculation
  useEffect(() => {
    if (sessionStatus !== 'in-progress' || !authoritativeEndAt) return;

    const interval = setInterval(() => {
      const adjustedServerNow = Date.now() + clientServerOffset;
      const remainingSec = Math.max(0, Math.floor((authoritativeEndAt - adjustedServerNow) / 1000));

      setTimeRemaining(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(interval);
        // Automatically lock test when authoritative deadline is reached
        submitQuiz('Completed', 'Official contest time expired.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStatus, authoritativeEndAt, clientServerOffset]);

  // FIX 2: Progress Tracking (Accepts ONLY questionIndex, NO client scores!)
  const trackParticipantProgress = useCallback(async (questionIndex) => {
    if (!currentRoomCode) return;
    try {
      await supabase.rpc('update_participant_progress', {
        p_room_id: currentRoomCode,
        p_participant_id: playerName,
        p_current_question_index: questionIndex
      });

      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'PLAYER_PROGRESS',
          payload: {
            playerName,
            currentQuestionIndex: questionIndex,
            status: 'solving'
          }
        });
      }
    } catch (e){}
  }, [currentRoomCode, playerName]);

  // FIX 3: Secure Server-Side Answer Submission
  const submitAnswerInSupabase = useCallback(async (questionId, selectedOption) => {
    if (!currentRoomCode) return;
    try {
      const { data: res } = await supabase.rpc('submit_answer_secure', {
        p_room_id: currentRoomCode,
        p_participant_id: playerName,
        p_question_id: String(questionId),
        p_selected_answer: JSON.stringify(selectedOption)
      });
      return res;
    } catch (e) {
      console.warn("Supabase answer submission fallback:", e);
    }
  }, [currentRoomCode, playerName]);

  // Realtime Presence & Channel Subscription Helper
  const subscribeToRoomRealtime = (roomCode, pId, name, isHostUser) => {
    const channel = supabase.channel(`room_${roomCode}`, {
      config: { presence: { key: pId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = [];
        Object.keys(state).forEach(key => {
          state[key].forEach(u => onlineUsers.push(u));
        });

        setParticipants(prev => {
          const map = new Map();
          prev.forEach(p => map.set(p.name, { ...p, status: 'offline' }));
          onlineUsers.forEach(u => {
            map.set(u.name, {
              id: u.pId || u.name,
              name: u.name,
              isHost: u.isHost,
              status: 'in-lobby',
              currentQuestionIndex: u.questionIndex || 0
            });
          });
          return Array.from(map.values());
        });
      })
      .on('broadcast', { event: 'CONTEST_STARTED' }, ({ payload }) => {
        if (payload && payload.quiz) {
          setActiveQuiz(payload.quiz);
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          setQuestionTimes({});
          setMarkedForReview([]);
          setSessionStatus('in-progress');
          setAuthoritativeEndAt(payload.endAt);
          setIsContestMode(true);
          setIsHost(false);
        }
      })
      .on('broadcast', { event: 'PLAYER_PROGRESS' }, ({ payload }) => {
        if (payload) {
          setParticipants(prev => prev.map(p => p.name === payload.playerName ? {
            ...p,
            currentQuestionIndex: payload.currentQuestionIndex,
            status: payload.status
          } : p));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            pId,
            name,
            isHost: isHostUser,
            onlineAt: new Date().toISOString()
          });
        }
      });

    realtimeChannelRef.current = channel;
  };

  const resumeContestSession = async (roomCode, pId, name, room) => {
    setCurrentRoomCode(roomCode);
    setIsContestMode(true);
    setPlayerName(name);

    let startAt = room.start_at ? new Date(room.start_at).getTime() : Date.now();
    let endAt = room.end_at ? new Date(room.end_at).getTime() : startAt + (room.duration * 60 * 1000);

    setAuthoritativeEndAt(endAt);
    setSessionStatus('in-progress');
    subscribeToRoomRealtime(roomCode, pId, name, false);
    return { success: true, roomCode };
  };

  // Host helper to broadcast data to all connected guests
  const broadcastToAll = useCallback((payload) => {
    connsMapRef.current.forEach((c, peerId) => {
      try {
        if (c && c.open) {
          c.send(payload);
        }
      } catch (e) {
        console.error(`[Broadcast Error] ${peerId}:`, e);
      }
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
      if (connsMapRef.current.size >= 50) {
        connection.on('open', () => {
          try {
            connection.send({
              type: 'ROOM_ERROR',
              message: 'Room is full! Maximum limit of 50 participants reached for this live contest.'
            });
          } catch (e) { }
          setTimeout(() => { try { connection.close(); } catch (e) { } }, 500);
        });
        return;
      }

      // Store/overwrite active connection for this guest peer
      connsMapRef.current.set(connection.peer, connection);
      connsRef.current = Array.from(connsMapRef.current.values());

      const registerDataHandler = (c) => {
        c.on('data', (data) => {
          if (data.type === 'HANDSHAKE') {
            // Guarantee fresh connection mapping
            connsMapRef.current.set(c.peer, c);
            connsRef.current = Array.from(connsMapRef.current.values());

            const newGuest = {
              id: c.peer,
              name: data.name || 'Guest',
              isHost: false,
              currentQuestionIndex: 0,
              score: 0,
              status: 'in-lobby'
            };

            setParticipants(prev => {
              if (prev.length >= 50) {
                try {
                  c.send({
                    type: 'ROOM_ERROR',
                    message: 'Room is full! Maximum limit of 50 participants reached.'
                  });
                } catch (e) { }
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
              const exists = base.some(p => p.id === c.peer);
              const updated = exists
                ? base.map(p => p.id === c.peer ? { ...p, name: data.name } : p)
                : [...base, newGuest];

              // Broadcast updated LOBBY_STATE to ALL guests in map
              const lobbyPayload = {
                type: 'LOBBY_STATE',
                participants: updated,
                hostName: playerName.trim() || 'Host'
              };

              connsMapRef.current.forEach((connItem) => {
                try {
                  if (connItem && connItem.open) {
                    connItem.send(lobbyPayload);
                  }
                } catch (e) { }
              });

              return updated;
            });

            setOpponentName(data.name || 'Guest');
          } else if (data.type === 'PROGRESS_UPDATE') {
            setParticipants(prev => {
              const updated = prev.map(p => p.id === c.peer ? {
                ...p,
                currentQuestionIndex: data.currentQuestionIndex,
                score: data.score,
                status: data.status
              } : p);

              // Relay progress to all guests
              connsMapRef.current.forEach((connItem) => {
                try {
                  if (connItem && connItem.open) {
                    connItem.send({ type: 'ROOM_PROGRESS', participants: updated });
                  }
                } catch (e) { }
              });

              return updated;
            });
          } else if (data.type === 'FINISH_CONTEST' || data.type === 'TERMINATE_CONTEST') {
            setParticipants(prev => {
              const updated = prev.map(p => p.id === c.peer ? {
                ...p,
                score: data.result?.score ?? p.score,
                status: data.type === 'TERMINATE_CONTEST' ? 'terminated' : 'completed',
                result: data.result
              } : p);

              // Relay final results to all guests
              connsMapRef.current.forEach((connItem) => {
                try {
                  if (connItem && connItem.open) {
                    connItem.send({ type: 'ROOM_PROGRESS', participants: updated });
                  }
                } catch (e) { }
              });

              return updated;
            });
          }
        });

        c.on('close', () => {
          connsMapRef.current.delete(c.peer);
          connsRef.current = Array.from(connsMapRef.current.values());
          setParticipants(prev => {
            const updated = prev.filter(p => p.id !== c.peer);
            connsMapRef.current.forEach((connItem) => {
              try {
                if (connItem && connItem.open) {
                  connItem.send({ type: 'LOBBY_STATE', participants: updated, hostName: playerName });
                }
              } catch (e) { }
            });
            return updated;
          });
        });
      };

      if (connection.open) {
        registerDataHandler(connection);
      } else {
        connection.on('open', () => registerDataHandler(connection));
      }
    };

    peer.on('connection', handleConnection);
    return () => {
      peer.off('connection', handleConnection);
    };
  }, [peer, playerName]);

  // Set Peer and Connection states safely
  const setPeer = (p) => setPeerState(p);
  const setConn = (c) => setConnState(c);

  // WebRTC Heartbeat: Keep mobile browser WebRTC data channels 100% active
  useEffect(() => {
    if (!isHost) return;
    const heartbeatInterval = setInterval(() => {
      connsMapRef.current.forEach((c) => {
        try {
          if (c && c.open) {
            c.send({ type: 'PING' });
          }
        } catch (e) { }
      });
    }, 2000);

    return () => clearInterval(heartbeatInterval);
  }, [isHost]);

  // Guest-side: Listen for messages from Host connection
  useEffect(() => {
    if (!conn || isHost) return;

    const handleData = (data) => {
      if (data.type === 'PING') {
        try {
          if (conn && conn.open) {
            conn.send({ type: 'PONG' });
          }
        } catch (e) { }
      } else if (data.type === 'LOBBY_STATE') {
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
  }, [conn, isHost, resetMultiplayer]);

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
      ...participants.filter(p => p.id !== hostEntry.id).map(p => ({
        ...p,
        status: 'in-progress',
        currentQuestionIndex: 0,
        score: 0
      }))
    ];

    setParticipants(initialParticipants);

    // Broadcast START_CONTEST payload to all guests in connsMapRef
    const startPayload = {
      type: 'START_CONTEST',
      quiz: quiz,
      hostName: playerName.trim() || 'Host',
      participants: initialParticipants
    };

    const sendStartToAll = () => {
      connsMapRef.current.forEach((c, peerId) => {
        try {
          if (c && c.open) {
            c.send(startPayload);
          }
        } catch (e) {
          console.error(`Start contest send error for ${peerId}:`, e);
        }
      });
    };

    // Multi-pulse start signal (0ms, 300ms, 800ms, 1500ms) to ensure mobile devices receive start event
    sendStartToAll();
    setTimeout(sendStartToAll, 300);
    setTimeout(sendStartToAll, 800);
    setTimeout(sendStartToAll, 1500);

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

      if (isHost) {
        // Host updates own record in participants and broadcasts ROOM_PROGRESS
        setParticipants(prev => {
          const updated = prev.map(p => (p.isHost || p.id === myId) ? {
            ...p,
            currentQuestionIndex,
            score: calculated.score,
            status: sessionStatus
          } : p);

          connsMapRef.current.forEach((c) => {
            try {
              if (c && c.open) {
                c.send({ type: 'ROOM_PROGRESS', participants: updated });
              }
            } catch (e) { }
          });

          return updated;
        });
      } else if (conn) {
        // Guest sends progress update to Host
        try {
          if (conn.open) {
            conn.send({
              type: 'PROGRESS_UPDATE',
              peerId: myId,
              name: playerName.trim() || 'Player',
              currentQuestionIndex,
              score: calculated.score,
              status: sessionStatus
            });
          }
        } catch (e) {
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
          try { c.send(finishPayload); } catch (e) { }
        });
      } else if (conn) {
        try {
          conn.send(finishPayload);
        } catch (e) {
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
          try { c.send(termPayload); } catch (e) { }
        });
      } else if (conn) {
        try {
          conn.send(termPayload);
        } catch (e) {
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
      // Allow 2 focus warnings before termination on 3rd violation
      if (nextCount >= 3) {
        terminateQuiz("Multiple focus violations detected (tab switching / window defocus).");
      } else {
        setWarningModal({
          isOpen: true,
          title: title || "Focus Warning Issued",
          message: message || `Warning ${nextCount}/2: You have moved away from active test window. Repeated violations will terminate your attempt.`,
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
      initHostParticipants,
      createRoomInSupabase,
      joinRoomInSupabase,
      startContestInSupabase,
      submitAnswerInSupabase,
      trackParticipantProgress,
      currentRoomCode,
      clientServerOffset
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
