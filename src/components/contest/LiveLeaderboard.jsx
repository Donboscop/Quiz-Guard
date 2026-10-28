import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { formatTime } from '../../utils/quizUtils';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Trophy, Award, Download, RefreshCw, Users, CheckCircle2, Clock, 
  ArrowUpDown, ArrowUp, ArrowDown, Shield, Eye, EyeOff, AlertCircle, 
  Sparkles, Search, Check, Flame, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Normalizes participant records and calculates ranks with genuine tie-breaking.
 * Tie-break rule: Score descending -> Time Taken ascending -> Name ascending.
 */
export const computeLeaderboardRankings = (participantsList, totalQuestions = 10) => {
  if (!participantsList || participantsList.length === 0) return [];

  // 1. Normalize participant records
  const normalized = participantsList.map(p => {
    const res = p.result || {};
    const score = Number(p.score ?? res.score ?? 0);
    const totQ = Number(res.totalQuestions || totalQuestions || 10);
    const correctCount = Number(
      res.correctCount ?? (totQ > 0 ? Math.round(score / 10) : 0)
    );
    const percentage = Number(
      res.percentage ?? (totQ > 0 ? Math.round((correctCount / totQ) * 100) : 0)
    );
    const timeTaken = Number(res.timeTakenSeconds ?? 0);

    let displayStatus = 'Solving';
    const raw = (p.status || res.status || '').toLowerCase();

    if (raw === 'completed' || res.status === 'Completed') {
      displayStatus = 'Completed';
    } else if (raw === 'terminated' || res.status === 'Terminated') {
      displayStatus = 'Terminated';
    } else if (raw === 'did-not-start' || raw === 'in-lobby') {
      displayStatus = 'Did Not Start';
    } else if (raw === 'offline') {
      displayStatus = 'Offline';
    } else if (raw === 'in-progress' || raw === 'solving') {
      displayStatus = 'Solving';
    } else {
      displayStatus = 'Incomplete';
    }

    return {
      id: p.participant_id || p.id,
      name: p.name || 'Anonymous Student',
      isHost: Boolean(p.is_host),
      score,
      totalQuestions: totQ,
      correctCount,
      percentage,
      timeTakenSeconds: timeTaken,
      status: displayStatus,
      rawStatus: raw,
      joinedAt: p.joined_at,
      rawResult: res
    };
  });

  // 2. Sort primary: score descending, tie-breaker: time ascending, name ascending
  normalized.sort((a, b) => {
    // Did Not Start goes to bottom
    if (a.rawStatus === 'did-not-start' && b.rawStatus !== 'did-not-start') return 1;
    if (b.rawStatus === 'did-not-start' && a.rawStatus !== 'did-not-start') return -1;

    // Primary: Score (descending)
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-breaker 1: Time Taken (ascending - faster completion is better)
    if (a.timeTakenSeconds !== b.timeTakenSeconds) {
      return a.timeTakenSeconds - b.timeTakenSeconds;
    }
    // Tie-breaker 2: Alphabetical name (ascending)
    return a.name.localeCompare(b.name);
  });

  // 3. Assign ranks with genuine tie handling
  let currentRank = 1;
  const result = [];
  for (let i = 0; i < normalized.length; i++) {
    const p = normalized[i];
    if (i > 0) {
      const prev = result[i - 1];
      if (p.score === prev.score && p.timeTakenSeconds === prev.timeTakenSeconds) {
        result.push({ ...p, rank: prev.rank, isTie: true });
        continue;
      } else {
        currentRank = i + 1;
      }
    }
    result.push({ ...p, rank: currentRank, isTie: false });
  }
  return result;
};

/**
 * Exports leaderboard rankings to standard UTF-8 CSV with metadata.
 */
export const exportLeaderboardToCSV = (rankedData, roomCode, quizTitle = 'Assessment') => {
  if (!rankedData || rankedData.length === 0) return;

  const headers = [
    'Rank',
    'Participant Name',
    'Role',
    'Correct Answers',
    'Total Questions',
    'Score',
    'Percentage',
    'Time Taken (Formatted)',
    'Time Taken (Seconds)',
    'Status',
    'Joined At'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = rankedData.map(p => [
    p.rank,
    escapeCSV(p.name),
    p.isHost ? '"Educator Host"' : '"Student"',
    p.correctCount,
    p.totalQuestions,
    p.score,
    `"${p.percentage}%"`,
    escapeCSV(formatTime(p.timeTakenSeconds)),
    p.timeTakenSeconds,
    escapeCSV(p.status),
    escapeCSV(p.joinedAt ? new Date(p.joinedAt).toLocaleString() : 'N/A')
  ]);

  const metadata = [
    [`QuizGuard Live Assessment Official Leaderboard`],
    [`Room Code: ${roomCode}`, `Assessment: ${quizTitle}`],
    [`Generated: ${new Date().toLocaleString()}`],
    []
  ];

  const csvContent = [
    ...metadata.map(m => m.join(',')),
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `quizguard_leaderboard_${roomCode || 'session'}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const LiveLeaderboard = ({
  roomCode,
  isHost = false,
  currentUserName = '',
  currentParticipantId = '',
  title = 'Live Assessment Leaderboard',
  quizTitle = '',
  onBack = null
}) => {
  const [loading, setLoading] = useState(true);
  const [participantsData, setParticipantsData] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Sorting state: 'rank' | 'name' | 'score' | 'percentage' | 'time' | 'status'
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch official data from Supabase
  const fetchSessionData = useCallback(async () => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Room record
      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomCode)
        .maybeSingle();

      if (roomErr) {
        console.warn("Room fetch note:", roomErr);
      }
      setRoomData(room || null);

      // 2. Fetch all Participants for this room
      const { data: parts, error: partsErr } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomCode);

      if (partsErr) {
        throw new Error(partsErr.message || 'Failed to load participants');
      }

      setParticipantsData(parts || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(err.message || 'Unable to retrieve leaderboard from cloud database.');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  // Supabase Realtime subscription for live leaderboard updates
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase.channel(`leaderboard_${roomCode}_live`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `room_id=eq.${roomCode}`
      }, () => {
        fetchSessionData();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomCode}`
      }, (payload) => {
        if (payload.new) {
          setRoomData(payload.new);
        }
      })
      .on('broadcast', { event: 'PLAYER_FINISHED' }, () => {
        fetchSessionData();
      })
      .on('broadcast', { event: 'CONTEST_ENDED' }, () => {
        fetchSessionData();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, [roomCode, fetchSessionData]);

  // Compute canonical ranked participants
  const rankedParticipants = useMemo(() => {
    const totalQ = roomData?.quiz_id ? 10 : 10;
    return computeLeaderboardRankings(participantsData, totalQ);
  }, [participantsData, roomData]);

  // Privacy Policy Check (Requirement 12)
  // If session security setting showLiveLeaderboard is false:
  // Teacher/Host sees real names; Students see their own name and anonymized classmates
  const allowFullVisibility = isHost || (roomData?.security_settings?.showLiveLeaderboard !== false);

  // Apply privacy transformation if needed
  const displayList = useMemo(() => {
    return rankedParticipants.map((p, idx) => {
      const isSelf = (currentParticipantId && p.id === currentParticipantId) ||
                     (currentUserName && p.name.trim().toLowerCase() === currentUserName.trim().toLowerCase());

      if (allowFullVisibility || isSelf || p.isHost) {
        return { ...p, isSelf, displayName: p.name };
      }

      // Anonymized view for classmates
      return {
        ...p,
        isSelf: false,
        displayName: `Candidate #${p.rank}`
      };
    });
  }, [rankedParticipants, allowFullVisibility, currentParticipantId, currentUserName]);

  // Filtered by Search Query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return displayList;
    const query = searchQuery.trim().toLowerCase();
    return displayList.filter(p =>
      p.displayName.toLowerCase().includes(query) ||
      String(p.rank).includes(query) ||
      p.status.toLowerCase().includes(query)
    );
  }, [displayList, searchQuery]);

  // Interactive Sorting (Requirement 3)
  const sortedList = useMemo(() => {
    const items = [...filteredList];

    items.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'time') {
        valA = a.timeTakenSeconds;
        valB = b.timeTakenSeconds;
      }

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = String(valB).toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [filteredList, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to desc for score & percentage, asc for rank & name
      setSortDirection(field === 'score' || field === 'percentage' ? 'desc' : 'asc');
    }
  };

  // Summary Metrics (Requirement 5)
  const metrics = useMemo(() => {
    const total = rankedParticipants.length;
    if (total === 0) {
      return { total: 0, avgScore: 0, avgPct: 0, highScore: 0, highScoreName: '—', completedCount: 0, completionRate: 0 };
    }

    const completed = rankedParticipants.filter(p => p.status === 'Completed').length;
    const scores = rankedParticipants.map(p => p.score);
    const pcts = rankedParticipants.map(p => p.percentage);
    const sumScore = scores.reduce((a, b) => a + b, 0);
    const sumPct = pcts.reduce((a, b) => a + b, 0);
    const highScore = Math.max(...scores, 0);
    const topParticipant = rankedParticipants.find(p => p.score === highScore);

    return {
      total,
      avgScore: Math.round(sumScore / total),
      avgPct: Math.round(sumPct / total),
      highScore,
      highScoreName: topParticipant?.displayName || topParticipant?.name || '—',
      completedCount: completed,
      completionRate: Math.round((completed / total) * 100)
    };
  }, [rankedParticipants]);

  const handleExportCSV = () => {
    exportLeaderboardToCSV(rankedParticipants, roomCode, quizTitle || roomData?.quiz_id || 'Assessment');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="vesper-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Trophy className="w-3 h-3" />
                Live Arena Leaderboard
              </span>
              <span className="text-[11px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Room: <span className="font-bold text-white">{roomCode || 'QG-LIVE'}</span>
              </span>
              {roomData?.status && (
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                  roomData.status === 'completed' 
                    ? 'bg-zinc-900 text-zinc-300 border-white/10' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse'
                }`}>
                  {roomData.status === 'completed' ? 'Finalized' : 'Contest Active'}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-2">
              {title}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Authoritative results synchronized live with Supabase cloud database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSessionData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="liquid"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              disabled={rankedParticipants.length === 0}
            >
              Export CSV
            </Button>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Privacy Alert Banner if Anonymized for Students */}
        {!allowFullVisibility && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Class Privacy Active:</strong> The instructor has masked peer names on student devices. Your own rank and score are highlighted below.
              </span>
            </div>
            <Badge variant="metal">Restricted</Badge>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchSessionData}>
              Retry
            </Button>
          </div>
        )}

        {/* 4 Summary Metric Cards (Requirement 5) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. Total Candidates */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-500 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Total Candidates</span>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {metrics.total}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{metrics.completedCount} completed attempt{metrics.completedCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* 2. Class Average */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-500 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Average Score</span>
              <BarChart2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-baseline gap-1.5">
              <span>{metrics.avgPct}%</span>
              <span className="text-xs text-zinc-400 font-normal">({metrics.avgScore} pts)</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Class performance average
            </div>
          </div>

          {/* 3. Top Performer */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-500 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Top Score</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-baseline gap-1.5">
              <span>{metrics.highScore}</span>
              <span className="text-xs text-amber-300 font-normal">pts</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 truncate">
              Lead: <span className="font-semibold text-zinc-200">{metrics.highScoreName}</span>
            </div>
          </div>

          {/* 4. Completion Rate */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-500 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Completion Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {metrics.completionRate}%
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {metrics.completedCount} of {metrics.total} submitted
            </div>
          </div>

        </div>

        {/* Search Bar & Live Sync Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant name or rank..."
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced at {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LEADERBOARD TABLE (Requirement 3, 4, 8) */}
        {/* ------------------------------------------------------------- */}
        {sortedList.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                <span>Synchronizing live scores with Supabase...</span>
              </div>
            ) : (
              <span>No participants found matching this session.</span>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-zinc-950">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase text-zinc-400 bg-white/[0.03] border-b border-white/[0.08]">
                <tr>
                  {/* Rank Header */}
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rank</span>
                      {sortField === 'rank' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Name Header */}
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('displayName')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Participant Name</span>
                      {sortField === 'displayName' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Correct Answers */}
                  <th 
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('correctCount')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Correct Answers</span>
                      {sortField === 'correctCount' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Total Questions */}
                  <th 
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('totalQuestions')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Total Questions</span>
                      {sortField === 'totalQuestions' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Score */}
                  <th 
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Score</span>
                      {sortField === 'score' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Percentage */}
                  <th 
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('percentage')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Percentage</span>
                      {sortField === 'percentage' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Time Taken */}
                  <th 
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('time')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Time Taken</span>
                      {sortField === 'time' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>

                  {/* Completion Status */}
                  <th 
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Completion Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />
                      ) : <ArrowUpDown className="w-3 h-3 text-zinc-600" />}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {sortedList.map((p) => {
                  const isTop1 = p.rank === 1;
                  const isTop2 = p.rank === 2;
                  const isTop3 = p.rank === 3;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        p.isSelf 
                          ? 'bg-white/[0.08] hover:bg-white/[0.12] font-medium' 
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          {isTop1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="w-6 h-6 rounded-full bg-zinc-300/20 text-zinc-200 border border-zinc-300/40 flex items-center justify-center font-bold text-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-white/5 text-zinc-400 border border-white/10 flex items-center justify-center text-xs">
                              {p.rank}
                            </span>
                          )}
                          {p.isTie && (
                            <span className="text-[10px] text-zinc-500 font-normal">
                              (Tie)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Participant Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate max-w-[200px]">
                            {p.displayName}
                          </span>
                          {p.isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white text-black">
                              YOU
                            </span>
                          )}
                          {p.isHost && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-zinc-300 border border-white/10">
                              HOST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Correct Answers */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-zinc-200">
                        {p.correctCount}
                      </td>

                      {/* Total Questions */}
                      <td className="py-3 px-4 text-center font-mono text-zinc-400">
                        {p.totalQuestions}
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        {p.score}
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={
                          p.percentage >= 80 ? 'text-emerald-400 font-bold' :
                          p.percentage >= 60 ? 'text-zinc-200' :
                          'text-zinc-400'
                        }>
                          {p.percentage}%
                        </span>
                      </td>

                      {/* Time Taken */}
                      <td className="py-3 px-4 text-right font-mono text-zinc-400">
                        {p.timeTakenSeconds > 0 ? formatTime(p.timeTakenSeconds) : '—'}
                      </td>

                      {/* Completion Status */}
                      <td className="py-3 px-4 text-right">
                        {p.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Completed
                          </span>
                        ) : p.status === 'Solving' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Solving
                          </span>
                        ) : p.status === 'Terminated' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60">
                            Terminated
                          </span>
                        ) : p.status === 'Did Not Start' ? (
                          <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/10">
                            Did Not Start
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/10">
                            Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-2">
          <span>Ranking Criteria: Highest Score → Fast Completion Time → Alphabetical</span>
          <span>QuizGuard Server-Authoritative Timing</span>
        </div>
      </div>

    </div>
  );
};

export default LiveLeaderboard;
