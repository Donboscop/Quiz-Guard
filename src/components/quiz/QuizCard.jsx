import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, HelpCircle, ArrowRight, Code2, Atom, Palette, Globe2, BrainCircuit, Cloud, Cpu } from 'lucide-react';

const categoryIcons = {
  Code2,
  Atom,
  Palette,
  Globe2,
  BrainCircuit,
  Cloud,
  Cpu
};

export const QuizCard = ({ quiz }) => {
  const difficultyVariants = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger'
  };

  return (
    <Card hoverEffect glass className="flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="brand" size="sm">
            {quiz.category}
          </Badge>
          <Badge variant={difficultyVariants[quiz.difficulty] || 'neutral'} size="sm">
            {quiz.difficulty}
          </Badge>
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

      {/* Start Button */}
      <div className="pt-6">
        <Link to={`/quiz/${quiz.id}/instructions`} className="block">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-between"
          >
            <span>Start Test</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
