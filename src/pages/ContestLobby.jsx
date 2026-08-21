import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuizzesList } from '../data/quizzes';
import { useQuiz } from '../context/QuizContext';
import { getContestLeaderboard } from '../utils/storage';
import { formatTime, formatDate } from '../utils/quizUtils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Peer } from 'peerjs';
import { ShieldCheck, Users, Copy, Check, Play, LogIn, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContestLobby = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('quizId');
  const quizzes = getQuizzesList();
  
  const initialQuizId = quizzes.find(q => q.id === quizIdParam)?.id || quizzes[0]?.id || '';
  
  const {
    peer,
    setPeer,
    conn,
    setConn,
    participants,
    isContestMode,
    setIsContestMode,
    setIsHost,
    opponentName,
    setOpponentName,
    playerName,
    setPlayerName,
    startQuiz,
    startContest,
    resetMultiplayer,
    initHostParticipants
  } = useQuiz();

  const [lobbyMode, setLobbyMode] = useState('select'); // 'select' | 'host' | 'join'
  const [selectedQuizId, setSelectedQuizId] = useState(initialQuizId);
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lobbyError, setLobbyError] = useState(null);

  // Sync preselected quizId if searchParam changes
  useEffect(() => {
    if (quizIdParam) {
      const match = quizzes.find(q => q.id === quizIdParam);
      if (match) setSelectedQuizId(match.id);
    }
  }, [quizIdParam]);

  // Clean up any old multiplayer connections when loading the lobby
  useEffect(() => {
    resetMultiplayer();
  }, []);

  // Navigate both players when test starts
  const { activeQuiz, sessionStatus } = useQuiz();
  useEffect(() => {
    if (isContestMode && sessionStatus === 'in-progress' && activeQuiz) {
      navigate(`/quiz/${activeQuiz.id}/test`);
    }
  }, [isContestMode, sessionStatus, activeQuiz, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Host a room
  const handleHostRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your nickname first.");
      return;
    }
    setLoading(true);
    setLobbyError(null);

    // Instantiate PeerJS client
    // Generates a random alphanumeric ID
    const newPeer = new Peer();

    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setRoomCode(id);
      setLobbyMode('host');
      setLoading(false);
      setIsContestMode(true);
      setIsHost(true);
      initHostParticipants(id, playerName);
    });

    newPeer.on('error', (err) => {
      console.error(err);
      setLobbyError("Failed to initialize WebRTC Peer network. Try refreshing.");
      setLoading(false);
    });
  };

  // Join a room
  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your nickname first.");
      return;
    }
    if (!inputCode.trim()) {
      alert("Please enter the Lobby Code.");
      return;
    }
    setLoading(true);
    setLobbyError(null);

    // Guest instantiates their own Peer to connect to Host
    const guestPeer = new Peer();

    guestPeer.on('open', () => {
      setPeer(guestPeer);
      
      const connection = guestPeer.connect(inputCode.trim(), { reliable: true });
      
      connection.on('open', () => {
        setConn(connection);
        setIsContestMode(true);
        setIsHost(false);
        setLobbyMode('join');
        setLoading(false);

        // Send nickname handshake to Host
        connection.send({
          type: 'HANDSHAKE',
          name: playerName.trim()
        });

        // Backup retry send after 350ms to guarantee Host registers guest name
        setTimeout(() => {
          try {
            if (connection.open) {
              connection.send({
                type: 'HANDSHAKE',
                name: playerName.trim()
              });
            }
          } catch(e){}
        }, 350);
      });

      connection.on('error', (err) => {
        console.error(err);
        setLobbyError("Failed to connect to the Host. Verify the Lobby Code is correct.");
        setLoading(false);
        guestPeer.destroy();
        resetMultiplayer();
      });
    });

    guestPeer.on('error', (err) => {
      console.error(err);
      setLobbyError("Network error. Could not join room.");
      setLoading(false);
    });
  };

  // Handle handshakes and other control messages at the lobby level
  useEffect(() => {
    if (!conn) return;

    const handleLobbyData = (data) => {
      if (data.type === 'HANDSHAKE') {
        // Host receives guest's nickname
        setOpponentName(data.name);
        // Host responds with their own nickname
        conn.send({
          type: 'HANDSHAKE_RESPONSE',
          name: playerName.trim()
        });
      } else if (data.type === 'HANDSHAKE_RESPONSE') {
        // Guest receives host's nickname
        setOpponentName(data.name);
      }
    };

    conn.on('data', handleLobbyData);
    return () => {
      conn.off('data', handleLobbyData);
    };
  }, [conn, playerName, setOpponentName]);

  // Host starts the quiz
  const handleStartContest = () => {
    if (!conn) return;
    const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
    if (!selectedQuiz) return;

    // 1. Broadcast START_CONTEST to Guest
    conn.send({
      type: 'START_CONTEST',
      quiz: selectedQuiz,
      hostName: playerName.trim()
    });

    // 2. Start Host's own quiz session
    startQuiz(selectedQuiz);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Back breadcrumb */}
      <button
        onClick={() => navigate('/categories')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </button>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Real-Time P2P WebRTC Contest</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
          QuizGuard Live Arena
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Host a quiz competition or join your friend's room. Complete the quiz synchronously under active focus proctoring and compare results live.
        </p>
      </div>

      {/* LOBBY INTERACTION PANEL */}
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* Error message */}
        {lobbyError && (
          <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{lobbyError}</span>
          </div>
        )}

        {/* STEP 0: NICKNAME SELECTOR */}
        {lobbyMode === 'select' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Enter Your Nickname</label>
              <input
                type="text"
                maxLength="12"
                placeholder="e.g. CodeNinja / Alice"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-700 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              {/* Host button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleHostRoom}
                className="p-6 rounded-2xl bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-brand-500/40 text-center space-y-3 transition-all focus:outline-none flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Host a Match</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">Generate a room code and invite a friend.</p>
                </div>
              </button>

              {/* Join button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setLobbyMode('join-input')}
                className="p-6 rounded-2xl bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-brand-500/40 text-center space-y-3 transition-all focus:outline-none flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Join a Room</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">Enter a friend's Lobby Code to enter.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1A: HOSTING SCREEN */}
        {lobbyMode === 'host' && (
          <div className="space-y-6 text-center">
            
            {/* Lobby code box */}
            <div className="space-y-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lobby Code</span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono font-black text-xl text-brand-400 select-all tracking-wider">
                  {roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
                  title="Copy Lobby Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                Send this code to your friend. They must paste it into the "Join Room" console to link up.
              </p>
            </div>

            {/* Live Joined Participants Roster Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-left shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Live Room Roster ({participants.length > 0 ? participants.length : 1} Joined)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Waiting for Players
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participants.map(p => {
                  const isHostUser = p.isHost;
                  return (
                    <div
                      key={p.id || p.name}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isHostUser
                          ? 'bg-brand-500/10 border-brand-500/40 shadow-glow-sm'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs uppercase ${
                          isHostUser
                            ? 'bg-brand-500 text-white'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {p.name ? p.name.charAt(0) : 'P'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block truncate max-w-[120px]">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Connected
                          </span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        isHostUser
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isHostUser ? 'HOST (YOU)' : 'JOINED & READY'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {participants.filter(p => !p.isHost).length === 0 && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    No friends connected yet
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Share the 36-character Lobby Code above with your friends. As soon as they enter it, their names will appear here live!
                  </p>
                </div>
              )}
            </div>

            {/* Host Quiz Selection Form */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80 text-left">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Choose Assessment topic</label>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  {quizzes.map(quiz => (
                    <option key={quiz.id} value={quiz.id}>{quiz.title} ({quiz.category})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  onClick={handleStartContest}
                  variant="primary"
                  size="lg"
                  icon={Play}
                >
                  Start Live Contest ({participants.length > 0 ? participants.length : 1} Players)
                </Button>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                resetMultiplayer();
                setLobbyMode('select');
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white underline pt-2 block mx-auto focus:outline-none"
            >
              Cancel and Close Room
            </button>

          </div>
        )}

        {/* STEP 1B: GUEST JOIN CODE INPUT */}
        {lobbyMode === 'join-input' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Paste Lobby Code</label>
              <input
                type="text"
                placeholder="Enter 36-character Host ID..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setLobbyMode('select')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={loading}
                onClick={handleJoinRoom}
                className="flex-1"
                icon={LogIn}
              >
                {loading ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1C: GUEST WAITING SCREEN */}
        {lobbyMode === 'join' && (
          <div className="space-y-6 text-center">
            
            {/* Joined connection status */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-white">Lobby Connection Successful!</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Connected to host <strong className="text-brand-400">{opponentName || "Host"}</strong>'s Room.
              </p>
            </div>

            {/* Room Participants Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Joined Room Players ({participants.length > 0 ? participants.length : 1})
                </span>
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Waiting for Host to start
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {participants.map(p => (
                  <div key={p.id || p.name} className={`p-2.5 rounded-xl border flex items-center justify-between ${p.name === playerName ? 'bg-brand-500/10 border-brand-500/40' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-white">{p.name}</span>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.isHost ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : (p.name === playerName ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-slate-800 text-slate-400')}`}>
                      {p.isHost ? 'HOST' : (p.name === playerName ? 'YOU' : 'READY')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetMultiplayer();
                setLobbyMode('select');
              }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline pt-2 block mx-auto focus:outline-none"
            >
              Disconnect from Lobby
            </button>

          </div>
        )}

      </div>

      {/* LIVE ARENA HISTORICAL LEADERBOARD */}
      <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">Live Arena Global Leaderboard</h3>
              <p className="text-xs text-slate-400">Top rankings and recent match scores across all live contests.</p>
            </div>
          </div>
          <Badge variant="brand" size="sm">
            {getContestLeaderboard().length} Contest Records
          </Badge>
        </div>

        {getContestLeaderboard().length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-slate-700 opacity-60" />
            <p>No live contest duels completed yet. Host or join a match above to claim top spot on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getContestLeaderboard().map((record, idx) => (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl font-mono font-bold flex items-center justify-center text-xs ${
                    idx === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40 shadow-glow-sm' :
                    idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                    idx === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      {record.playerName || 'Anonymous Duelist'}
                      {record.opponentName && (
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                          vs {record.opponentName}
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {record.quizTitle} • {formatDate(record.completedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Score</span>
                    <span className="font-black text-sm text-brand-400">
                      {record.score}/{record.totalQuestions} ({record.percentage}%)
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Time</span>
                    <span className="font-bold text-xs text-slate-300">
                      {formatTime(record.timeTakenSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
