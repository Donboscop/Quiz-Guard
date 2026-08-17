import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, HelpCircle, ArrowRight, Code2, Atom, Palette, Globe2, BrainCircuit, Cloud, Cpu, Edit3, Trash2 } from 'lucide-react';
import { deleteCustomQuiz } from '../../data/quizzes';

const categoryIcons = {
  Code2,
  Atom,
  Palette,
  Globe2,
  BrainCircuit,
  Cloud,
  Cpu
};

export const QuizCard = ({ quiz, onDelete }) => {
  const difficultyVariants = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger'
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the quiz "${quiz.title}"?`)) {
      deleteCustomQuiz(quiz.id);
      if (onDelete) {
        onDelete(quiz.id);
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <Card hoverEffect glass className="flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="brand" size="sm">
            {quiz.category}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Link
              to={`/edit/${quiz.id}`}
              className="p-1 rounded-md text-slate-400 hover:text-brand-300 hover:bg-slate-800/80 transition-colors"
              title="Edit Quiz"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>
            {quiz.isCustom && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Custom Quiz"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
            <Badge variant={difficultyVariants[quiz.difficulty] || 'neutral'} size="sm">
              {quiz.difficulty}
            </Badge>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {quiz.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1.5 line-clamp-2">
            {quiz.description}
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
            <span>{quiz.totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{quiz.duration} Mins</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 flex items-center gap-2">
        <Link to={`/quiz/${quiz.id}/instructions`} className="flex-1">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-between"
          >
            <span>Start Test</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link to={`/edit/${quiz.id}`}>
          <Button
            variant="secondary"
            size="md"
            icon={Edit3}
            title="Edit Quiz"
            className="px-3"
          />
        </Link>
        {quiz.isCustom && (
          <Button
            variant="secondary"
            size="md"
            icon={Trash2}
            title="Delete Quiz"
            onClick={handleDelete}
            className="px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30"
          />
        )}
      </div>
    </Card>
  );
};

