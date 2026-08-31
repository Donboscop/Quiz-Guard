import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzesList, getCustomQuizzes } from '../data/quizzes';
import { getAttempts, getContestLeaderboard } from '../utils/storage';
import { formatTime, formatDate } from '../utils/quizUtils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Users, BookOpen, Sparkles, PlusCircle, Play, BarChart3, History, 
  ArrowRight, ShieldCheck, KeyRound, Trophy, CheckCircle, Clock, Eye, Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'
  
  const allQuizzes = getQuizzesList();
  const customQuizzes = getCustomQuizzes();
  const attempts = getAttempts();
  const contestLeaderboard = getContestLeaderboard();

  // Metrics calculations
  const totalQuizzes = allQuizzes.length;
  const completedAttemptsCount = attempts.length;
  const averageScore = completedAttemptsCount > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / completedAttemptsCount)
    : 0;
  const bestScore = completedAttemptsCount > 0
    ? Math.max(...attempts.map(a => a.percentage || 0))
    : 0;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header with Role Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                {role === 'teacher' ? 'Educator Command Center' : 'Student Learning Hub'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1.5">
              {role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {role === 'teacher' 
                ? 'Manage curriculum assessments, launch proctored live sessions, and analyze class performance.'
                : 'Track your test mastery, take practice assessments, and join live proctored quizzes.'}
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setRole('teacher')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                role === 'teacher' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Teacher View
            </button>
            <button
              onClick={() => setRole('student')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                role === 'student' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Student View
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TEACHER DASHBOARD VIEW */}
        {/* ------------------------------------------------------------- */}
        {role === 'teacher' && (
          <div className="space-y-8">
            
            {/* Stat Cards Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Total Assessments</span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{totalQuizzes}</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">{customQuizzes.length} custom created</span>
              </div>
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Live Sessions</span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{contestLeaderboard.length}</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Synchronized tests</span>
              </div>
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Class Average</span>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{averageScore}%</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Across all submissions</span>
              </div>
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Total Attempts</span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{completedAttemptsCount}</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Recorded evaluations</span>
              </div>
            </div>

            {/* Quick Action Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="vesper-panel p-6 flex flex-col justify-between space-y-4 border-white/20">
                <div>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-base">Quiz Studio & AI Synthesis</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Create new assessments using AI prompts, PowerPoint (.pptx) extraction, PDF uploads, or the visual question editor.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/create">
                    <Button variant="liquid" size="sm" icon={PlusCircle}>
                      Open Quiz Studio
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="vesper-panel p-6 flex flex-col justify-between space-y-4 border-white/20">
                <div>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Users className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-base">Host Live Arena Session</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Generate a room code for your class, broadcast questions in real time, and monitor focus breaches with live proctoring.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/contest">
                    <Button variant="secondary" size="sm" icon={Play}>
                      Launch Live Arena
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Quizzes & Assessments */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="font-semibold text-sm text-white">Assessment Catalog</h3>
                <Link to="/categories" className="text-xs text-zinc-400 hover:text-white">
                  View All ({totalQuizzes}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allQuizzes.slice(0, 6).map((quiz) => (
                  <div key={quiz.id} className="vesper-card p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="metal" size="sm">{quiz.category || 'General'}</Badge>
                        <span className="text-[11px] font-mono text-zinc-400">{quiz.difficulty}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-white line-clamp-1">{quiz.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{quiz.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-zinc-500">
                        {quiz.questions?.length || quiz.totalQuestions} Qs • {quiz.duration}m
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/contest?quizId=${quiz.id}`}>
                          <Button variant="secondary" size="sm" className="px-2.5 py-1 text-xs">
                            Live
                          </Button>
                        </Link>
                        <Link to={`/quiz/${quiz.id}/instructions`}>
                          <Button variant="liquid" size="sm" className="px-2.5 py-1 text-xs">
                            Test
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STUDENT DASHBOARD VIEW */}
        {/* ------------------------------------------------------------- */}
        {role === 'student' && (
          <div className="space-y-8">
            
            {/* Student Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Average Mastery</span>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{averageScore}%</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Overall performance</span>
              </div>
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Tests Completed</span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{completedAttemptsCount}</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Evaluated attempts</span>
              </div>
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Highest Score</span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{bestScore}%</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Peak result</span>
              </div>
              <div className="vesper-card p-5">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Focus Integrity</span>
                <div className="text-2xl sm:text-3xl font-bold text-zinc-200 mt-1">100%</div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Proctored compliance</span>
              </div>
            </div>

            {/* Student Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="vesper-panel p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <KeyRound className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-base">Join Live Exam with Code</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Have a 6-digit room code from your instructor? Enter the live lobby to participate.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/join">
                    <Button variant="liquid" size="sm" icon={ArrowRight}>
                      Enter Room Code
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="vesper-panel p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <BookOpen className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-base">Practice Assessments</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Test your knowledge self-paced in JavaScript, Cloud, React, Algorithms, and more.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/categories">
                    <Button variant="secondary" size="sm" icon={Play}>
                      Browse All Quizzes
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent History Table */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="font-semibold text-sm text-white">Your Recent Attempts</h3>
                <Link to="/history" className="text-xs text-zinc-400 hover:text-white">
                  Full History ({attempts.length}) →
                </Link>
              </div>

              {attempts.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  You haven't completed any assessments yet. Choose a quiz to get started!
                </div>
              ) : (
                <div className="space-y-2">
                  {attempts.slice(0, 5).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/[0.06] text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-white block">{att.quizTitle}</span>
                        <span className="text-[11px] text-zinc-500">
                          {formatDate(att.completedAt)} • {formatTime(att.timeTakenSeconds)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {att.percentage}%
                        </span>
                        <Link to={`/quiz/${att.quizId}/review?attemptId=${att.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs py-1 px-2.5">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
