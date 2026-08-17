import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAttempts, clearAllAttempts, deleteAttemptById } from '../utils/storage';
import { formatDate, formatTime } from '../utils/quizUtils';
import { History as HistoryIcon, Trash2, Eye, ShieldAlert, CheckCircle2, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { motion } from 'framer-motion';

export const History = () => {
  const [attempts, setAttempts] = useState(() => getAttempts());
  const [filter, setFilter] = useState('all'); // 'all' | 'Completed' | 'Terminated'
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const filtered = attempts.filter(a => {
    if (filter === 'Completed') return a.status === 'Completed';
    if (filter === 'Terminated') return a.status === 'Terminated';
    return true;
  });

  const handleClearHistory = () => {
    clearAllAttempts();
    setAttempts([]);
    setClearModalOpen(false);
  };

  const handleDeleteSingleAttempt = (attId) => {
    if (window.confirm("Are you sure you want to delete this attempt record?")) {
      deleteAttemptById(attId);
      setAttempts(prev => prev.filter(a => a.id !== attId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear All Attempt History?"
        type="danger"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to permanently delete all recorded quiz attempts from your local browser storage? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearHistory} icon={Trash2}>
              Delete All Records
            </Button>
          </div>
        </div>
      </Modal>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
            <HistoryIcon className="w-4 h-4" />
            <span>Local Attempt Records</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
            Quiz Attempt History
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            All your proctored assessment attempts stored securely in your browser session.
          </p>
        </div>

        {attempts.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setClearModalOpen(true)}
            icon={Trash2}
            className="text-rose-400 hover:text-rose-300 border-rose-900/40 hover:bg-rose-950/40"
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        {[
          { key: 'all', label: `All Attempts (${attempts.length})` },
          { key: 'Completed', label: 'Completed' },
          { key: 'Terminated', label: 'Terminated' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Attempts List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((att) => {
            const isCompleted = att.status === 'Completed';
            const isTerminated = att.status === 'Terminated';

            return (
              <motion.div
                key={att.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                
                {/* Left: Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand" size="sm">{att.category}</Badge>
                    <Badge
                      variant={isCompleted ? 'success' : isTerminated ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {att.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatDate(att.completedAt)}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white">
                    {att.quizTitle}
                  </h3>

                  {att.reason && (
                    <p className="text-xs text-rose-300/80 font-mono bg-rose-950/40 p-2 rounded-xl border border-rose-900/30">
                      Reason: "{att.reason}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      Time: {formatTime(att.timeTakenSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Warnings: {att.focusWarnings || 0}
                    </span>
                  </div>
                </div>

                {/* Right: Score Pill & Actions */}
                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="font-display font-bold text-2xl text-white">
                      {att.score} / {att.totalQuestions}
                    </div>
                    <div className={`text-xs font-semibold ${att.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {att.percentage}% Accuracy
                    </div>
                  </div>

                  <Link to={`/quiz/${att.quizId}/review`}>
                    <Button variant="outline" size="sm" icon={Eye}>
                      Review
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteSingleAttempt(att.id)}
                    className="p-2 rounded-xl bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all"
                    title="Delete Attempt Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-display font-bold text-xl text-white">No Attempt History Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't completed or attempted any quizzes yet. Take a quiz to record your proctored results here.
          </p>
          <Link to="/categories">
            <Button variant="primary" icon={BookOpen}>
              Start a Quiz Now
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
};
