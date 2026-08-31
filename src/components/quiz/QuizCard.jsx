import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Clock, HelpCircle, ArrowRight, Edit3, Trash2, Users, Play } from 'lucide-react';
import { deleteCustomQuiz } from '../../data/quizzes';

export const QuizCard = ({ quiz, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteCustomQuiz(quiz.id);
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(quiz.id);
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Assessment?"
        type="danger"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            Are you sure you want to delete <span className="text-white font-semibold">"{quiz.title}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} icon={Trash2}>
              Delete Assessment
            </Button>
          </div>
        </div>
      </Modal>

      <div className="vesper-card p-6 flex flex-col justify-between h-full group">
        <div className="space-y-4">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="metal" size="sm">
              {quiz.category || 'General'}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400">
                {quiz.difficulty}
              </span>
              {quiz.isCustom && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-1 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete Custom Assessment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-base text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
            {quiz.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1 line-clamp-2">
            {quiz.description}
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>{quiz.questions?.length || quiz.totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{quiz.duration} Mins</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 flex items-center gap-2">
        <Link to={`/quiz/${quiz.id}/instructions`} className="flex-1">
          <Button
            variant="liquid"
            size="sm"
            className="w-full justify-between"
          >
            <span>Practice</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link to={`/contest?quizId=${quiz.id}`}>
          <Button
            variant="secondary"
            size="sm"
            title="Host Live Arena Session"
            className="px-3"
          >
            <Users className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Link to={`/edit/${quiz.id}`}>
          <Button
            variant="secondary"
            size="sm"
            icon={Edit3}
            title="Edit Assessment"
            className="px-3"
          />
        </Link>
      </div>
    </div>
    </>
  );
};
