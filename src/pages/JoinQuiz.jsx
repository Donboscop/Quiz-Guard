import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Shield, Users, KeyRound, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const JoinQuiz = () => {
  const navigate = useNavigate();
  const { roomCode: paramCode } = useParams();
  
  const {
    joinRoomInSupabase,
    currentRoomCode,
    isContestMode,
    sessionStatus,
    activeQuiz,
    participants,
    playerName,
    setPlayerName,
    resetMultiplayer
  } = useQuiz();

  const [inputName, setInputName] = useState(playerName || '');
  const [inputCode, setInputCode] = useState(paramCode || '');
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isInWaitingLobby, setIsInWaitingLobby] = useState(false);

  // Sync route param code
  useEffect(() => {
    if (paramCode) {
      setInputCode(paramCode.toUpperCase());
    }
  }, [paramCode]);

  // Navigate when contest starts
  useEffect(() => {
    if (isContestMode && sessionStatus === 'in-progress' && activeQuiz) {
      navigate(`/quiz/${activeQuiz.id}/test`);
    }
  }, [isContestMode, sessionStatus, activeQuiz, navigate]);

  const handleJoin = async (e) => {
    e?.preventDefault();
    if (!inputName.trim()) {
      setErrorMessage('Please enter your name or student ID.');
      return;
    }
    if (!inputCode.trim()) {
      setErrorMessage('Please enter the 6-character room code.');
      return;
    }

    setIsJoining(true);
    setErrorMessage(null);

    const cleanCode = inputCode.trim().toUpperCase();
    const result = await joinRoomInSupabase(cleanCode, inputName.trim());

    if (result && result.success) {
      setPlayerName(inputName.trim());
      setIsInWaitingLobby(true);
      setIsJoining(false);
    } else {
      setErrorMessage(result?.error || 'Failed to join room. Please check the code or contact host.');
      setIsJoining(false);
    }
  };

  const handleLeaveLobby = () => {
    resetMultiplayer();
    setIsInWaitingLobby(false);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        
        {!isInWaitingLobby ? (
          /* Join Form */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="vesper-panel p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white shadow-glow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Join Live Quiz</h1>
              <p className="text-xs text-zinc-400">
                Enter your name and the room code provided by your educator.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Your Full Name / Nickname <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  6-Digit Room Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. QG4829"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 uppercase"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="liquid"
                  size="lg"
                  className="w-full"
                  disabled={isJoining}
                  icon={isJoining ? RefreshCw : ArrowRight}
                >
                  {isJoining ? 'Connecting to Room...' : 'Enter Assessment Room'}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-white/[0.06] text-center">
              <Link to="/categories" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Looking for self-paced practice? Browse Quizzes →
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Waiting for Host Lobby */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="vesper-panel p-8 space-y-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Connected to Room {currentRoomCode}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                Waiting for Educator to Start
              </h2>
              <p className="text-xs text-zinc-400">
                The test will launch automatically on your screen the moment the host begins.
              </p>
            </div>

            {/* Room Info Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 text-left space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-zinc-400">Your Student ID:</span>
                <span className="font-semibold text-white">{inputName}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-zinc-400">Live Participants:</span>
                <span className="font-semibold text-emerald-400">{participants.length} online</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Focus Monitoring:</span>
                <span className="text-zinc-300 flex items-center gap-1 font-mono">
                  <Eye className="w-3 h-3 text-zinc-400" /> Active on Launch
                </span>
              </div>
            </div>

            {/* Participant Roster */}
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Joined Classmates ({participants.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {participants.map((p, idx) => (
                  <span
                    key={p.id || idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {p.name}
                    {p.name === inputName && ' (You)'}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-zinc-500 hover:text-zinc-300"
                onClick={handleLeaveLobby}
              >
                Leave Room
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
