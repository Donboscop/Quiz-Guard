import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { getQuizzesList } from '../data/quizzes';
import { useQuiz } from '../context/QuizContext';
import { getContestLeaderboard } from '../utils/storage';
import { formatTime, formatDate, normalizeRoomCode } from '../utils/quizUtils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { supabase } from '../lib/supabase';
import { LiveLeaderboard } from '../components/contest/LiveLeaderboard';
import { 
  Users, Copy, Check, Play, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, 
  Trophy, Shield, Eye, Lock, Settings2, Share2, Sparkles, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ContestLobby = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { roomCode: routeRoomCode } = useParams();
  const quizIdParam = searchParams.get('quizId');
  const tabParam = searchParams.get('tab');
  const codeParam = searchParams.get('roomCode') || routeRoomCode;
  const quizzes = getQuizzesList();
  
  const initialQuizId = quizzes.find(q => q.id === quizIdParam)?.id || quizzes[0]?.id || '';
  
  const {
    participants,
    isContestMode,
    playerName,
    setPlayerName,
    resetMultiplayer,
    createRoomInSupabase,
    joinRoomInSupabase,
    startContestInSupabase,
    currentRoomCode,
    currentParticipantId,
    isHost,
    activeQuiz,
    sessionStatus,
    supabaseStatus,
    supabaseError,
    refreshSupabaseConnection
  } = useQuiz();

  const [activeTab, setActiveTab] = useState(codeParam || tabParam === 'leaderboard' ? 'leaderboard' : 'host'); // 'host' | 'join' | 'leaderboard'
  const [selectedQuizId, setSelectedQuizId] = useState(initialQuizId);
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [leaderboardRoomInput, setLeaderboardRoomInput] = useState(codeParam || currentRoomCode || '');
  const [selectedLeaderboardRoom, setSelectedLeaderboardRoom] = useState(codeParam || currentRoomCode || '');
  const [recentRooms, setRecentRooms] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lobbyError, setLobbyError] = useState(null);
  const [hostNickname, setHostNickname] = useState(playerName || 'Educator Host');
  const [studentNickname, setStudentNickname] = useState(playerName || '');

  // Live Exam Security Settings (Configurable by Educator)
  const [securitySettings, setSecuritySettings] = useState({
    focusMonitoring: true,
    fullscreenEnforced: true,
    tabSwitchWarning: true,
    maxViolations: 3,
    randomizeQuestions: false,
    randomizeOptions: false,
    showLiveLeaderboard: true
  });

  const [isLobbyActive, setIsLobbyActive] = useState(false);

  // Sync param
  useEffect(() => {
    if (quizIdParam) {
      const match = quizzes.find(q => q.id === quizIdParam);
      if (match) setSelectedQuizId(match.id);
    }
  }, [quizIdParam]);

  // Fetch recent Supabase rooms when entering leaderboard tab
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const fetchRooms = async () => {
        try {
          setLoadingRecent(true);
          const { data, error } = await supabase
            .from('rooms')
            .select('id, quiz_id, host_name, status, created_at, start_at')
            .order('created_at', { ascending: false })
            .limit(6);

          if (!error && data) {
            setRecentRooms(data);
            if (!selectedLeaderboardRoom && data.length > 0) {
              setSelectedLeaderboardRoom(currentRoomCode || data[0].id);
              setLeaderboardRoomInput(currentRoomCode || data[0].id);
            }
          }
        } catch (e) {
          console.warn("Recent rooms fetch note:", e);
        } finally {
          setLoadingRecent(false);
        }
      };
      fetchRooms();
    }
  }, [activeTab, currentRoomCode, selectedLeaderboardRoom]);

  // Navigate when test starts
  useEffect(() => {
    if (isContestMode && sessionStatus === 'in-progress' && activeQuiz) {
      navigate(`/quiz/${activeQuiz.id}/test`);
    }
  }, [isContestMode, sessionStatus, activeQuiz, navigate]);

  const handleCopyCode = () => {
    const code = roomCode || currentRoomCode;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareUrl = () => {
    const code = roomCode || currentRoomCode;
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Host creates live session
  const handleHostRoom = async () => {
    if (!hostNickname.trim()) {
      setLobbyError("Please enter your educator/host nickname.");
      return;
    }
    setLoading(true);
    setLobbyError(null);

    const targetQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];
    const res = await createRoomInSupabase(targetQuiz, targetQuiz?.duration || 10, hostNickname.trim());
    const generatedCode = typeof res === 'string' ? res : res?.roomCode;

    if (generatedCode) {
      setRoomCode(generatedCode);
      setIsLobbyActive(true);
      setLoading(false);
    } else {
      setLobbyError(res?.error || "Failed to initialize live room. Please check cloud connection.");
      setLoading(false);
    }
  };

  // Host triggers synchronized start
  const handleStartExam = async () => {
    setLoading(true);
    const targetQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];
    await startContestInSupabase(roomCode || currentRoomCode, targetQuiz);
  };

  // Student joins
  const handleJoinRoom = async () => {
    if (!studentNickname.trim()) {
      setLobbyError("Please enter your nickname.");
      return;
    }
    if (!inputCode.trim()) {
      setLobbyError("Please enter the room code.");
      return;
    }
    const cleanCode = normalizeRoomCode(inputCode);
    if (!cleanCode || cleanCode.length < 5) {
      setLobbyError("Please enter a valid room code (e.g. QG-03NX8).");
      return;
    }
    setLoading(true);
    setLobbyError(null);

    const res = await joinRoomInSupabase(cleanCode, studentNickname.trim());
    if (res && res.success) {
      navigate(`/join/${cleanCode}`);
    } else {
      setLobbyError(res?.error || "Failed to join room. Verify code.");
      setLoading(false);
    }
  };

  const leaderboardAttempts = getContestLeaderboard();

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                Real-Time Synchronization
              </span>

              {/* Supabase Connection State Indicator */}
              {supabaseStatus === 'connected' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Connected
                </span>
              )}
              {supabaseStatus === 'connecting' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
                  Connecting to Supabase...
                </span>
              )}
              {supabaseStatus === 'disconnected' && (
                <button
                  type="button"
                  onClick={refreshSupabaseConnection}
                  title="Click to reconnect"
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-orange-950/80 text-orange-300 border border-orange-800/60 hover:bg-orange-900/80 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Disconnected (Retry)
                </button>
              )}
              {supabaseStatus === 'error' && (
                <button
                  type="button"
                  onClick={refreshSupabaseConnection}
                  title={supabaseError || "Click to retry connection"}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900/80 cursor-pointer"
                >
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  Cloud Error (Retry)
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1.5">
              Live Multiplayer Arena
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Host synchronized classroom assessments with real-time focus monitoring and live leaderboards.
            </p>
          </div>

          {/* Tab Switcher */}
          {!isLobbyActive && (
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { setActiveTab('host'); setLobbyError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'host' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Host Session
              </button>
              <button
                onClick={() => { setActiveTab('join'); setLobbyError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'join' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Join Room
              </button>
              <button
                onClick={() => { setActiveTab('leaderboard'); setLobbyError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'leaderboard' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Past Contests
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {lobbyError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{lobbyError}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* HOST LOBBY ACTIVE (WAITING FOR PARTICIPANTS) */}
        {/* ------------------------------------------------------------- */}
        {isLobbyActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Stage: Room Code & Controls */}
            <div className="lg:col-span-2 space-y-6">
              <div className="vesper-panel p-8 text-center space-y-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-3 py-1 rounded-full">
                    🟢 Live Room Ready
                  </span>
                  <h2 className="text-xl font-semibold text-white mt-3">
                    {quizzes.find(q => q.id === selectedQuizId)?.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Direct your students to <span className="font-mono text-zinc-200">quizguard.com/join</span> or share the code below.
                  </p>
                </div>

                {/* Big Room Code Box */}
                <div className="max-w-sm mx-auto p-6 rounded-2xl bg-zinc-950 border border-white/10 shadow-glow-sm">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Room Code</span>
                  <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-white my-2">
                    {roomCode || currentRoomCode}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={handleCopyCode}>
                      {copied ? 'Copied Code' : 'Copy Code'}
                    </Button>
                    <Button variant="secondary" size="sm" icon={Share2} onClick={handleCopyShareUrl}>
                      Copy Direct Link
                    </Button>
                  </div>
                </div>

                {/* Start Test CTA */}
                <div className="pt-4 max-w-sm mx-auto">
                  <Button
                    variant="liquid"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                    icon={loading ? RefreshCw : Play}
                    onClick={handleStartExam}
                  >
                    {loading ? 'Starting Examination...' : `Start Test for All (${participants.length} Ready)`}
                  </Button>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Students will automatically enter the synchronized test interface upon clicking Start.
                  </p>
                </div>
              </div>

              {/* Security Configuration Active in this Session */}
              <div className="vesper-panel p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-zinc-400" />
                    Enforced Proctoring & Security
                  </h3>
                  <Badge variant="metal">Educator Configured</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.06]">
                    <span className="text-zinc-500 block">Focus Monitoring</span>
                    <span className="font-semibold text-white">Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.06]">
                    <span className="text-zinc-500 block">Fullscreen Mode</span>
                    <span className="font-semibold text-white">Enforced</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/[0.06]">
                    <span className="text-zinc-500 block">Max Violations</span>
                    <span className="font-semibold text-white">3 Breaches</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Live Participants Roster */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  Participants ({participants.length})
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {participants.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Waiting for students to join with room code...
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.06] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-medium text-white">{p.name}</span>
                        {p.isHost && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/10 text-zinc-300">
                            Host
                          </span>
                        )}
                      </div>
                      <span className="text-zinc-500 text-[11px]">Ready</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.08]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-zinc-500 hover:text-red-400"
                  onClick={() => {
                    resetMultiplayer();
                    setIsLobbyActive(false);
                  }}
                >
                  Cancel Session
                </Button>
              </div>
            </div>

          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* TABS: HOST CREATOR / STUDENT JOIN / PAST LEADERBOARDS */
          /* ------------------------------------------------------------- */
          <div>
            
            {/* TAB 1: HOST SESSION SETUP */}
            {activeTab === 'host' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Setup Form */}
                <div className="lg:col-span-2 vesper-panel p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Create Live Assessment Room</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Select an assessment from your catalog and configure real-time proctoring rules.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Educator Nickname / Title
                      </label>
                      <input
                        type="text"
                        value={hostNickname}
                        onChange={(e) => setHostNickname(e.target.value)}
                        placeholder="e.g. Prof. Davis"
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Select Assessment from Catalog
                      </label>
                      <select
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40"
                      >
                        {quizzes.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title} ({q.questions?.length || q.totalQuestions} Questions • {q.duration || 10} min)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Security Settings Accordion */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Settings2 className="w-3.5 h-3.5" />
                      Live Proctoring & Security Controls
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      {/* Toggle 1: Focus Monitoring */}
                      <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/[0.08] cursor-pointer">
                        <div>
                          <span className="font-medium text-white block">Focus Monitoring</span>
                          <span className="text-[11px] text-zinc-500">Track mouse boundary & defocus</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={securitySettings.focusMonitoring}
                          onChange={(e) => setSecuritySettings(s => ({ ...s, focusMonitoring: e.target.checked }))}
                          className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                        />
                      </label>

                      {/* Toggle 2: Fullscreen */}
                      <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/[0.08] cursor-pointer">
                        <div>
                          <span className="font-medium text-white block">Fullscreen Enforcement</span>
                          <span className="text-[11px] text-zinc-500">Require browser fullscreen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={securitySettings.fullscreenEnforced}
                          onChange={(e) => setSecuritySettings(s => ({ ...s, fullscreenEnforced: e.target.checked }))}
                          className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                        />
                      </label>

                      {/* Toggle 3: Tab Switch Warning */}
                      <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/[0.08] cursor-pointer">
                        <div>
                          <span className="font-medium text-white block">Tab Switch Warnings</span>
                          <span className="text-[11px] text-zinc-500">Log visibilitychange events</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={securitySettings.tabSwitchWarning}
                          onChange={(e) => setSecuritySettings(s => ({ ...s, tabSwitchWarning: e.target.checked }))}
                          className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                        />
                      </label>

                      {/* Toggle 4: Randomize Options */}
                      <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/[0.08] cursor-pointer">
                        <div>
                          <span className="font-medium text-white block">Randomize Options</span>
                          <span className="text-[11px] text-zinc-500">Shuffle A/B/C/D order</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={securitySettings.randomizeOptions}
                          onChange={(e) => setSecuritySettings(s => ({ ...s, randomizeOptions: e.target.checked }))}
                          className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                        />
                      </label>

                    </div>
                  </div>

                  {/* Launch Button */}
                  <div className="pt-2">
                    <Button
                      variant="liquid"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                      icon={loading ? RefreshCw : Users}
                      onClick={handleHostRoom}
                    >
                      {loading ? 'Initializing Live Room...' : 'Create Live Session & Room Code'}
                    </Button>
                  </div>
                </div>

                {/* Right Col: Summary Panel */}
                <div className="vesper-panel p-6 space-y-4">
                  <h3 className="font-semibold text-sm text-white">How Live Assessments Work</h3>
                  <div className="space-y-3 text-xs text-zinc-400">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold shrink-0">1</span>
                      <p>Generate a unique 6-digit Room Code and share it with your students.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold shrink-0">2</span>
                      <p>Students join in real time and wait in the lobby until you click Start.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold shrink-0">3</span>
                      <p>All participants receive synchronized timers and client-side focus monitoring.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] text-xs space-y-1">
                    <span className="font-semibold text-white block">Need a new assessment?</span>
                    <p className="text-zinc-500">Create or import one using our AI Quiz Studio.</p>
                    <div className="pt-2">
                      <Link to="/create">
                        <Button variant="secondary" size="sm" className="w-full">
                          Open Quiz Studio
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: STUDENT JOIN */}
            {activeTab === 'join' && (
              <div className="max-w-md mx-auto vesper-panel p-8 space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mt-2">Join with Room Code</h2>
                  <p className="text-xs text-zinc-400">
                    Enter the code given by your teacher to connect to the live room.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={studentNickname}
                      onChange={(e) => setStudentNickname(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Room Code</label>
                    <input
                      type="text"
                      maxLength={20}
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="e.g. QG-03NX8 or 03NX8"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-white uppercase focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <Button
                    variant="liquid"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                    icon={ArrowRight}
                    onClick={handleJoinRoom}
                  >
                    {loading ? 'Joining Room...' : 'Connect to Live Session'}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: LIVE SESSION & PAST CONTEST LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                
                {/* Room Lookup Card */}
                <div className="vesper-panel p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Live & Historical Leaderboards</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Inspect authoritative rankings, accurate tie-breaking, and class metrics directly from Supabase.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={leaderboardRoomInput}
                        onChange={(e) => setLeaderboardRoomInput(e.target.value.toUpperCase())}
                        placeholder="Enter Room Code (e.g. QG-XXXXX)"
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 uppercase"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const clean = normalizeRoomCode(leaderboardRoomInput);
                          if (clean) setSelectedLeaderboardRoom(clean);
                        }}
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>

                  {/* Recent Sessions Quick Selector */}
                  {recentRooms.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                        Recent Active & Concluded Sessions
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {recentRooms.map((r) => {
                          const isSelected = selectedLeaderboardRoom === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setSelectedLeaderboardRoom(r.id);
                                setLeaderboardRoomInput(r.id);
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all ${
                                isSelected
                                  ? 'bg-white/15 border-white/30 text-white shadow-sm'
                                  : 'bg-zinc-950 border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <span className="font-bold">{r.id}</span>
                              <span className="text-[10px] text-zinc-500 truncate max-w-[100px]">{r.host_name}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                r.status === 'running' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                              }`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Authoritative Supabase Leaderboard */}
                {selectedLeaderboardRoom ? (
                  <LiveLeaderboard
                    roomCode={selectedLeaderboardRoom}
                    isHost={isHost}
                    currentUserName={playerName}
                    currentParticipantId={currentParticipantId}
                  />
                ) : (
                  <div className="vesper-panel p-12 text-center text-xs text-zinc-500">
                    Please select or enter a Room Code above to display the live class leaderboard.
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
