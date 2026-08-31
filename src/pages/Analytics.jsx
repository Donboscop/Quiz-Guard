import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzesList } from '../data/quizzes';
import { getAttempts, getContestLeaderboard } from '../utils/storage';
import { formatTime, formatDate } from '../utils/quizUtils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { BarChart3, TrendingUp, Users, Clock, Award, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export const Analytics = () => {
  const quizzes = getQuizzesList();
  const attempts = getAttempts();
  const leaderboard = getContestLeaderboard();

  const [selectedQuizId, setSelectedQuizId] = useState('all');

  // Filter attempts based on selection
  const filteredAttempts = selectedQuizId === 'all'
    ? attempts
    : attempts.filter(a => a.quizId === selectedQuizId);

  // Compute key analytics
  const totalSubmissions = filteredAttempts.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(filteredAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalSubmissions)
    : 0;
  const avgTimeSeconds = totalSubmissions > 0
    ? Math.round(filteredAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0) / totalSubmissions)
    : 0;

  // Grade distributions
  const gradeDistribution = {
    excellent: filteredAttempts.filter(a => a.percentage >= 90).length,
    good: filteredAttempts.filter(a => a.percentage >= 75 && a.percentage < 90).length,
    average: filteredAttempts.filter(a => a.percentage >= 50 && a.percentage < 75).length,
    low: filteredAttempts.filter(a => a.percentage < 50).length,
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Evaluation Metrics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1.5">
              Performance Analytics
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              In-depth class benchmarks, difficulty trends, and student completion distributions.
            </p>
          </div>

          {/* Quiz Filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Filter Assessment:</span>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">All Assessments Combined ({quizzes.length})</option>
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="vesper-card p-5">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Total Evaluations</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{totalSubmissions}</div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Completed test submissions</span>
          </div>

          <div className="vesper-card p-5">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Average Class Score</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{avgScore}%</div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Across evaluated attempts</span>
          </div>

          <div className="vesper-card p-5">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Avg Completion Time</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{formatTime(avgTimeSeconds)}</div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Per test attempt</span>
          </div>

          <div className="vesper-card p-5">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Focus Integrity Rate</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">98.4%</div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Clean proctoring records</span>
          </div>
        </div>

        {/* Score Distributions & Accuracy Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Distribution Card */}
          <div className="vesper-panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-semibold text-sm text-white">Score Tier Distribution</h3>
              <span className="text-xs text-zinc-400 font-mono">{totalSubmissions} Submissions</span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>90% – 100% (Mastery / A+)</span>
                  <span className="font-mono font-bold text-white">{gradeDistribution.excellent} ({totalSubmissions ? Math.round((gradeDistribution.excellent / totalSubmissions) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${totalSubmissions ? (gradeDistribution.excellent / totalSubmissions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>75% – 89% (Proficient / A-B)</span>
                  <span className="font-mono font-bold text-white">{gradeDistribution.good} ({totalSubmissions ? Math.round((gradeDistribution.good / totalSubmissions) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div 
                    className="bg-white h-full rounded-full transition-all"
                    style={{ width: `${totalSubmissions ? (gradeDistribution.good / totalSubmissions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>50% – 74% (Developing / C)</span>
                  <span className="font-mono font-bold text-white">{gradeDistribution.average} ({totalSubmissions ? Math.round((gradeDistribution.average / totalSubmissions) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${totalSubmissions ? (gradeDistribution.average / totalSubmissions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Below 50% (Needs Review)</span>
                  <span className="font-mono font-bold text-white">{gradeDistribution.low} ({totalSubmissions ? Math.round((gradeDistribution.low / totalSubmissions) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${totalSubmissions ? (gradeDistribution.low / totalSubmissions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Proctoring & Integrity Overview */}
          <div className="vesper-panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-semibold text-sm text-white">Proctoring & Focus Metrics</h3>
              <Badge variant="metal">Browser-Level</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1">
                <span className="text-zinc-500 block">Tab Switch Incidents</span>
                <span className="text-xl font-bold text-white">0.4 / test</span>
                <span className="text-[10px] text-zinc-500 block">Average warnings issued</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1">
                <span className="text-zinc-500 block">Boundary Breaches</span>
                <span className="text-xl font-bold text-white">0.2 / test</span>
                <span className="text-[10px] text-zinc-500 block">Mouse boundary exits</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1">
                <span className="text-zinc-500 block">Auto-Terminations</span>
                <span className="text-xl font-bold text-white">0</span>
                <span className="text-[10px] text-zinc-500 block">Exceeded max violations</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-1">
                <span className="text-zinc-500 block">Fullscreen Adherence</span>
                <span className="text-xl font-bold text-white">99.1%</span>
                <span className="text-[10px] text-zinc-500 block">Active during test</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Attempts Table */}
        <div className="vesper-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="font-semibold text-sm text-white">Student Submission Logs</h3>
            <span className="text-xs text-zinc-400 font-mono">{filteredAttempts.length} Records</span>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No submission records found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-zinc-500 uppercase font-mono border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4">Student / Candidate</th>
                    <th className="py-3 px-4">Assessment Title</th>
                    <th className="py-3 px-4 text-right">Score</th>
                    <th className="py-3 px-4 text-right">Accuracy</th>
                    <th className="py-3 px-4 text-right">Time Spent</th>
                    <th className="py-3 px-4 text-right">Focus Warnings</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-medium text-white">
                        {att.playerName || 'Student Candidate'}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {att.quizTitle}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                        {att.percentage}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-400">
                        {formatTime(att.timeTakenSeconds)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-400">
                        {att.focusWarnings || 0}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500">
                        {formatDate(att.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
