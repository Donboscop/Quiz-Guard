import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAttempts, clearAllAttempts, deleteAttemptById } from '../utils/storage';
import { formatDate, formatTime } from '../utils/quizUtils';
import { History as HistoryIcon, Trash2, Eye, ShieldAlert, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { motion } from 'framer-motion';

export const History = () => {
  const [attempts, setAttempts] = useState(() => getAttempts());
  const [filter, setFilter] = useState('all'); // 'all' | 'Completed' | 'Terminated'
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
    setDeleteTargetId(attId);
  };

  const confirmDeleteSingle = () => {
    if (deleteTargetId) {
      deleteAttemptById(deleteTargetId);
      setAttempts(prev => prev.filter(a => a.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Clear All Confirmation Modal */}
        <Modal
          isOpen={clearModalOpen}
          onClose={() => setClearModalOpen(false)}
          title="Clear All Attempt History?"
          type="danger"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently delete all recorded quiz attempts from your local browser storage? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setClearModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleClearHistory} icon={Trash2}>
                Delete All Records
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Single Attempt Modal */}
        <Modal
          isOpen={Boolean(deleteTargetId)}
          onClose={() => setDeleteTargetId(null)}
          title="Delete Assessment Record?"
          type="danger"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently remove this attempt record from your history?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDeleteSingle} icon={Trash2}>
                Delete Record
              </Button>
            </div>
          </div>
        </Modal>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Local Evaluation Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">
              Assessment History
            </h1>
            <p className="text-xs text-zinc-400">
              Your past proctored test evaluations saved in local browser storage.
            </p>
          </div>

          {attempts.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setClearModalOpen(true)}
              icon={Trash2}
              className="text-red-400 hover:text-red-300"
            >
              Clear Logs
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-white/10 max-w-sm">
          {[
            { key: 'all', label: `All (${attempts.length})` },
            { key: 'Completed', label: 'Completed' },
            { key: 'Terminated', label: 'Terminated' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tab.key
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History Records List */}
        {filtered.length === 0 ? (
          <div className="vesper-panel p-12 text-center space-y-4">
            <HistoryIcon className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="font-semibold text-lg text-white">No Attempt History Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              You haven't completed any assessments in this category yet.
            </p>
            <div className="pt-2">
              <Link to="/categories">
                <Button variant="liquid" size="sm" icon={BookOpen}>
                  Browse Quizzes
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="vesper-panel p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-zinc-500 uppercase font-mono border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4">Assessment Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Score</th>
                    <th className="py-3 px-4 text-right">Accuracy</th>
                    <th className="py-3 px-4 text-right">Time Spent</th>
                    <th className="py-3 px-4 text-right">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((att) => (
                    <tr key={att.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-medium text-white">
                        {att.quizTitle}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {att.category || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {att.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                        {formatTime(att.timeTakenSeconds)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          att.status === 'Completed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                            : 'bg-red-950/80 text-red-300 border border-red-800/50'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-500 font-mono">
                        {formatDate(att.completedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/quiz/${att.quizId}/review?attemptId=${att.id}`}>
                            <Button variant="ghost" size="sm" className="px-2 py-1 text-xs">
                              Review
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleDeleteSingleAttempt(att.id)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
