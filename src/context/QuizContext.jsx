import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveAttempt, saveCurrentQuizState, getCurrentQuizState, clearCurrentQuizState } from '../utils/storage';
import { calculateResults, normalizeRoomCode } from '../utils/quizUtils';
import { Peer } from 'peerjs';
import { supabase, SUPABASE_STATUS, isSupabaseConfigured, checkSupabaseHealth } from '../lib/supabase';

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

  // Supabase Connection & Live State
  const [supabaseStatus, setSupabaseStatus] = useState(
    isSupabaseConfigured ? SUPABASE_STATUS.CONNECTING : SUPABASE_STATUS.ERROR
  );
  const [supabaseError, setSupabaseError] = useState(
    isSupabaseConfigured ? null : 'Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).'
  );
  const [currentParticipantId, setCurrentParticipantId] = useState('');

  // Server-Authoritative Timing states
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

  // Server Time Synchronization (serverTime - Date.now())
  const syncServerTime = useCallback(async () => {
    if (!isSupabaseConfigured) return 0;
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

  // Automatic Connection & Health Check Helper
  const refreshSupabaseConnection = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus(SUPABASE_STATUS.ERROR);
      setSupabaseError('Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).');
      return { ok: false, status: SUPABASE_STATUS.ERROR };
    }

    setSupabaseStatus(SUPABASE_STATUS.CONNECTING);
    setSupabaseError(null);

    const health = await checkSupabaseHealth();
    setSupabaseStatus(health.status);
    setSupabaseError(health.error);

    if (health.ok) {
      syncServerTime();
    }
    return health;
  }, [syncServerTime]);

  // Initial auto-connect and online/offline event listeners
  useEffect(() => {
    refreshSupabaseConnection();

    const handleOnline = () => {
      console.log("🌐 Network online: auto-reconnecting Supabase...");
      refreshSupabaseConnection();
    };

    const handleOffline = () => {
      console.warn("🌐 Network offline: Supabase disconnected.");
      setSupabaseStatus(SUPABASE_STATUS.DISCONNECTED);
      setSupabaseError('Network disconnected. Reconnecting automatically when internet restores...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshSupabaseConnection]);

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

  // Fetch participants for room directly from Supabase
  const fetchRoomParticipants = useCallback(async (code) => {
    if (!code || !isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', code);
      if (!error && data) {
        setParticipants(data.map(p => ({
          id: p.participant_id || p.id,
          name: p.name,
          isHost: p.is_host,
          status: p.status || 'in-lobby',
          currentQuestionIndex: p.current_question_index || 0,
          score: p.score || 0
        })));
      }
    } catch (e) {
      console.warn("fetchRoomParticipants fallback:", e);
    }
  }, []);

  // Supabase Realtime Subscription Helper with automatic cleanup and reconnection
  const subscribeToRoomRealtime = useCallback((roomCode, pId, name, isHostUser) => {
    if (!roomCode || !isSupabaseConfigured) return;

    // 1. Clean up existing channel if any
    if (realtimeChannelRef.current) {
      try {
        supabase.removeChannel(realtimeChannelRef.current);
      } catch (e) {}
      realtimeChannelRef.current = null;
    }

    // Load initial participants from database
    fetchRoomParticipants(roomCode);

    const channel = supabase.channel(`room_${roomCode}`, {
      config: { presence: { key: pId } }
    });

    // 2. Presence handling (instant online/offline tracking)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = [];
        Object.keys(state).forEach(key => {
          state[key].forEach(u => onlineUsers.push(u));
        });

        setParticipants(prev => {
          const map = new Map();
          // Keep existing from DB
          prev.forEach(p => map.set(p.name, { ...p, status: p.status || 'offline' }));
          // Overlay online users
          onlineUsers.forEach(u => {
            const existing = map.get(u.name);
            map.set(u.name, {
              id: u.pId || u.name,
              name: u.name,
              isHost: u.isHost,
              status: existing?.status === 'completed' || existing?.status === 'terminated'
                ? existing.status
                : (existing?.status === 'in-progress' ? 'in-progress' : 'in-lobby'),
              currentQuestionIndex: u.questionIndex ?? existing?.currentQuestionIndex ?? 0,
              score: existing?.score || 0
            });
          });
          return Array.from(map.values());
        });
      })
      // 3. Broadcast events
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
          setParticipants(prev => prev.map(p =>
            p.name === payload.playerName || p.id === payload.participantId ? {
              ...p,
              currentQuestionIndex: payload.currentQuestionIndex,
              status: payload.status || p.status
            } : p
          ));
        }
      })
      .on('broadcast', { event: 'PLAYER_FINISHED' }, ({ payload }) => {
        if (payload) {
          setParticipants(prev => prev.map(p =>
            p.name === payload.playerName || p.id === payload.participantId ? {
              ...p,
              status: payload.status || 'completed',
              score: payload.score ?? p.score
            } : p
          ));
        }
      })
      // 4. Postgres Changes listeners (when tables are in publication)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomCode}` }, () => {
        fetchRoomParticipants(roomCode);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomCode}` }, (payload) => {
        if (payload.new && payload.new.status === 'running' && !isHostUser) {
          if (payload.new.end_at) {
            setAuthoritativeEndAt(new Date(payload.new.end_at).getTime());
          }
        }
      })
      // 5. Subscription lifecycle & reconnection handling
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setSupabaseStatus(SUPABASE_STATUS.CONNECTED);
          setSupabaseError(null);
          try {
            await channel.track({
              pId,
              name,
              isHost: isHostUser,
              onlineAt: new Date().toISOString()
            });
          } catch (e) {}
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Realtime channel status: ${status}. Supabase attempting auto-reconnect...`);
          setSupabaseStatus(SUPABASE_STATUS.DISCONNECTED);
        } else if (status === 'CLOSED') {
          setSupabaseStatus(SUPABASE_STATUS.DISCONNECTED);
        }
      });

    realtimeChannelRef.current = channel;
  }, [fetchRoomParticipants]);

  // Robust Supabase Room Creation
  const createRoomInSupabase = useCallback(async (quiz, duration, hostName) => {
    if (!quiz || !hostName?.trim()) {
      return { success: false, error: 'Quiz and educator name are required.' };
    }

    if (!isSupabaseConfigured) {
      setSupabaseStatus(SUPABASE_STATUS.ERROR);
      setSupabaseError('Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).');
      return { success: false, error: 'Supabase configuration missing in environment variables.' };
    }

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
        max_participants: 50,
        security_settings: {
          maxViolations: 3,
          focusMonitoring: true,
          fullscreenEnforced: true
        }
      }]).select().single();

      if (roomErr) {
        console.error("Supabase room create error:", roomErr);
        setSupabaseStatus(SUPABASE_STATUS.ERROR);
        setSupabaseError(roomErr.message || "Failed to create room in database.");
        return { success: false, error: `Failed to create room: ${roomErr.message || 'Database error'}` };
      }

      // 2. Add Host to Participants Table
      const { error: partErr } = await supabase.from('participants').insert([{
        room_id: roomCode,
        participant_id: hostId,
        name: hostName.trim(),
        is_host: true,
        status: 'in-lobby',
        score: 0,
        current_question_index: 0
      }]);

      if (partErr) {
        console.warn("Supabase host participant create error:", partErr);
      }

      setSupabaseStatus(SUPABASE_STATUS.CONNECTED);
      setSupabaseError(null);

      // Set local state
      setCurrentRoomCode(roomCode);
      setCurrentParticipantId(hostId);
      setIsHost(true);
      setIsContestMode(true);
      setActiveQuiz(quiz);
      setPlayerName(hostName.trim());

      const hostEntry = {
        id: hostId,
        name: hostName.trim(),
        isHost: true,
        status: 'in-lobby',
        currentQuestionIndex: 0,
        score: 0
      };
      setParticipants([hostEntry]);

      // Subscribe to Realtime Postgres & Presence channel
      subscribeToRoomRealtime(roomCode, hostId, hostName.trim(), true);

      return { success: true, roomCode };
    } catch (e) {
      console.error("Failed to create room in Supabase:", e);
      setSupabaseStatus(SUPABASE_STATUS.ERROR);
      setSupabaseError(e.message || "Network error when creating room.");
      return { success: false, error: e.message || 'Network error creating room. Please try again.' };
    }
  }, [subscribeToRoomRealtime]);

  // Robust Supabase Room Joining
  const joinRoomInSupabase = useCallback(async (roomCode, participantName) => {
    if (!roomCode?.trim() || !participantName?.trim()) {
      return { success: false, error: 'Please enter both your name and the room code.' };
    }
    const cleanCode = normalizeRoomCode(roomCode);
    if (!cleanCode || cleanCode.length < 5) {
      return { success: false, error: 'Invalid room code format. Expected format: QG-XXXXX' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Cloud service is not configured. Missing environment variables.' };
    }

    const pId = 'p-' + Math.random().toString(36).substring(2, 9);

    try {
      // 1. Verify room exists and check status
      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', cleanCode)
        .maybeSingle();

      if (roomErr) {
        console.error("Error querying room:", roomErr);
        return { success: false, error: `Database error: ${roomErr.message || 'Unable to verify room'}` };
      }

      if (!room) {
        return { success: false, error: 'Room not found. Check code.' };
      }

      if (room.status === 'terminated' || room.status === 'completed') {
        return { success: false, error: 'This contest has already ended.' };
      }

      // 2. Try atomic join RPC if available (validates capacity)
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('join_room_atomic', {
          p_room_code: cleanCode,
          p_participant_id: pId,
          p_name: participantName.trim()
        });

        if (!rpcErr && rpcRes && rpcRes.success === false) {
          return { success: false, error: rpcRes.error || 'Room is full! Maximum limit of 50 participants reached.' };
        }
      } catch (rpcEx) {
        console.warn("Atomic RPC fallback:", rpcEx);
      }

      // 3. Insert or update participant row in database safely
      const initialStatus = room.status === 'running' ? 'in-progress' : 'in-lobby';
      const { data: existingPart } = await supabase
        .from('participants')
        .select('id')
        .eq('room_id', cleanCode)
        .eq('participant_id', pId)
        .maybeSingle();

      if (existingPart) {
        await supabase
          .from('participants')
          .update({ name: participantName.trim(), status: initialStatus })
          .eq('id', existingPart.id);
      } else {
        const { error: partErr } = await supabase
          .from('participants')
          .insert([{
            room_id: cleanCode,
            participant_id: pId,
            name: participantName.trim(),
            is_host: false,
            status: initialStatus,
            score: 0,
            current_question_index: 0
          }]);

        if (partErr) {
          console.warn("Participant insert note:", partErr);
        }
      }

      setSupabaseStatus(SUPABASE_STATUS.CONNECTED);
      setSupabaseError(null);

      // 4. Set state
      setCurrentRoomCode(cleanCode);
      setCurrentParticipantId(pId);
      setIsHost(false);
      setIsContestMode(true);
      setPlayerName(participantName.trim());

      // If contest is already running, resume
      if (room.status === 'running') {
        return resumeContestSession(cleanCode, pId, participantName.trim(), room);
      }

      // Subscribe to Realtime Presence & Channels
      subscribeToRoomRealtime(cleanCode, pId, participantName.trim(), false);

      return { success: true, roomCode: cleanCode };
    } catch (e) {
      console.error("Failed to join room in Supabase:", e);
      return { success: false, error: e.message || 'Failed to connect to room. Please check your connection and try again.' };
    }
  }, [subscribeToRoomRealtime]);

  const resumeContestSession = async (roomCode, pId, name, room) => {
    setCurrentRoomCode(roomCode);
    setCurrentParticipantId(pId);
    setIsContestMode(true);
    setPlayerName(name);

    let startAt = room.start_at ? new Date(room.start_at).getTime() : Date.now();
    let endAt = room.end_at ? new Date(room.end_at).getTime() : startAt + (room.duration * 60 * 1000);

    setAuthoritativeEndAt(endAt);
    setSessionStatus('in-progress');
    subscribeToRoomRealtime(roomCode, pId, name, false);
    return { success: true, roomCode };
  };

  // Authoritative Start Contest
  const startContestInSupabase = useCallback(async (roomCode, selectedQuiz) => {
    if (!roomCode) return;
    const targetQuiz = selectedQuiz || activeQuiz;
    if (!targetQuiz) return;

    try {
      const startAtTime = new Date().toISOString();
      const endAtTime = new Date(Date.now() + (targetQuiz.duration * 60 * 1000)).toISOString();

      // 1. Update rooms table in Supabase
      await supabase.from('rooms').update({
        status: 'running',
        start_at: startAtTime,
        end_at: endAtTime
      }).eq('id', roomCode);

      // 2. Trigger Authoritative Server Start RPC if present
      let startAt = new Date(startAtTime).getTime();
      let endAt = new Date(endAtTime).getTime();

      try {
        const { data: startRes } = await supabase.rpc('start_room_contest_authoritative', {
          p_room_id: roomCode,
          p_host_id: currentParticipantId || 'host'
        });
        if (startRes?.start_at) startAt = new Date(startRes.start_at).getTime();
        if (startRes?.end_at) endAt = new Date(startRes.end_at).getTime();
      } catch (rpcErr) {
        console.warn("RPC start_room_contest_authoritative fallback:", rpcErr);
      }

      setAuthoritativeEndAt(endAt);

      // 3. Update all joined participants in DB to 'in-progress'
      try {
        await supabase.from('participants').update({
          status: 'in-progress'
        }).eq('room_id', roomCode).eq('status', 'in-lobby');
      } catch (e) {}

      // 4. Broadcast CONTEST_STARTED payload across Realtime
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
  }, [activeQuiz, currentParticipantId]);

  // Server-Authoritative Timer Offset Calculation
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

  // Progress Tracking: updates Supabase participants table and broadcasts over Realtime
  const trackParticipantProgress = useCallback(async (questionIndex) => {
    if (!currentRoomCode) return;
    const pId = currentParticipantId || playerName;

    // 1. Broadcast over Realtime channel (instantaneous)
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'PLAYER_PROGRESS',
        payload: {
          playerName,
          participantId: pId,
          currentQuestionIndex: questionIndex,
          status: 'solving'
        }
      });
    }

    // 2. Persist to participants table in Supabase
    try {
      await supabase.from('participants').update({
        current_question_index: questionIndex,
        status: 'in-progress'
      }).match({ room_id: currentRoomCode, participant_id: pId });
    } catch (e) {
      try {
        await supabase.from('participants').update({
          current_question_index: questionIndex,
          status: 'in-progress'
        }).match({ room_id: currentRoomCode, name: playerName });
      } catch (err) {}
    }
  }, [currentRoomCode, currentParticipantId, playerName]);

  // Server-Side Answer Submission with table fallback
  const submitAnswerInSupabase = useCallback(async (questionId, selectedOption) => {
    if (!currentRoomCode) return;
    const pId = currentParticipantId || playerName;

    try {
      // 1. Try secure RPC if configured
      const { data: res, error: rpcErr } = await supabase.rpc('submit_answer_secure', {
        p_room_id: currentRoomCode,
        p_participant_id: pId,
        p_question_id: String(questionId),
        p_selected_answer: JSON.stringify(selectedOption)
      });
      if (!rpcErr && res) return res;

      // 2. Fallback: record answer in submissions table if exists
      try {
        await supabase.from('submissions').upsert({
          room_id: currentRoomCode,
          participant_id: pId,
          question_id: String(questionId),
          selected_answer: selectedOption,
          submitted_at: new Date().toISOString()
        }, { onConflict: 'room_id,participant_id,question_id' });
      } catch (subErr) {}
    } catch (e) {
      console.warn("submitAnswerInSupabase fallback:", e);
    }
  }, [currentRoomCode, currentParticipantId, playerName]);

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

    if (isContestMode && currentRoomCode) {
      const pId = currentParticipantId || playerName;

      // 1. Persist result and status to participants table in Supabase
      supabase.from('participants').update({
        status: status === 'terminated' ? 'terminated' : 'completed',
        score: calculated.score,
        result: attemptData
      }).match({ room_id: currentRoomCode, participant_id: pId })
      .then(({ error }) => {
        if (error) {
          supabase.from('participants').update({
            status: status === 'terminated' ? 'terminated' : 'completed',
            score: calculated.score,
            result: attemptData
          }).match({ room_id: currentRoomCode, name: playerName });
        }
      });

      // 2. Persist to results table if present in schema
      supabase.from('results').upsert({
        room_id: currentRoomCode,
        participant_id: pId,
        player_name: playerName.trim() || 'Player',
        score: calculated.score,
        total_questions: calculated.totalQuestions,
        correct_count: calculated.correctCount,
        wrong_count: calculated.wrongCount,
        percentage: calculated.percentage,
        time_taken_seconds: calculated.timeTakenSeconds,
        status: status
      }, { onConflict: 'room_id,participant_id' }).then(() => {}).catch(() => {});

      // 3. Broadcast PLAYER_FINISHED across Realtime
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'PLAYER_FINISHED',
          payload: {
            playerName: playerName.trim() || 'Player',
            participantId: pId,
            score: calculated.score,
            status: status
          }
        });
      }

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
  }, [activeQuiz, userAnswers, questionTimes, timeRemaining, focusWarnings, isContestMode, currentRoomCode, currentParticipantId, playerName, opponentName, opponentResult, conn, isHost]);

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

    if (isContestMode && currentRoomCode) {
      const pId = currentParticipantId || playerName;

      // 1. Update participants table in Supabase
      supabase.from('participants').update({
        status: 'terminated',
        score: calculated.score,
        result: attemptData
      }).match({ room_id: currentRoomCode, participant_id: pId })
      .then(({ error }) => {
        if (error) {
          supabase.from('participants').update({
            status: 'terminated',
            score: calculated.score,
            result: attemptData
          }).match({ room_id: currentRoomCode, name: playerName });
        }
      });

      // 2. Persist to results table if present
      supabase.from('results').upsert({
        room_id: currentRoomCode,
        participant_id: pId,
        player_name: playerName.trim() || 'Player',
        score: calculated.score,
        total_questions: calculated.totalQuestions,
        correct_count: calculated.correctCount,
        wrong_count: calculated.wrongCount,
        percentage: calculated.percentage,
        time_taken_seconds: calculated.timeTakenSeconds,
        status: 'Terminated'
      }, { onConflict: 'room_id,participant_id' }).then(() => {}).catch(() => {});

      // 3. Log to proctor_events table if present
      try {
        supabase.from('proctor_events').insert([{
          room_id: currentRoomCode,
          participant_id: pId,
          event_type: 'focus_terminated',
          violation_count: focusWarnings + 1
        }]).then(() => {}).catch(() => {});
      } catch (e) {}

      // 4. Broadcast across Realtime
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'PLAYER_FINISHED',
          payload: {
            playerName: playerName.trim() || 'Player',
            participantId: pId,
            score: calculated.score,
            status: 'terminated'
          }
        });
      }

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
  }, [activeQuiz, sessionStatus, userAnswers, questionTimes, timeRemaining, focusWarnings, isContestMode, currentRoomCode, currentParticipantId, playerName, opponentName, opponentResult, conn, isHost]);

  // Issue focus warning (tab switch, etc.)
  const issueFocusWarning = useCallback((title, message) => {
    setFocusWarnings(prev => {
      const nextCount = prev + 1;

      // Log violation to Supabase proctor_events if in multiplayer
      if (isContestMode && currentRoomCode) {
        try {
          supabase.from('proctor_events').insert([{
            room_id: currentRoomCode,
            participant_id: currentParticipantId || playerName,
            event_type: 'focus_warning',
            violation_count: nextCount
          }]).then(() => {}).catch(() => {});
        } catch (e) {}
      }

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
  }, [isContestMode, currentRoomCode, currentParticipantId, playerName, terminateQuiz]);

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
      currentParticipantId,
      clientServerOffset,
      supabaseStatus,
      supabaseError,
      refreshSupabaseConnection
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
