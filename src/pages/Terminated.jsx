import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { ShieldAlert, AlertTriangle, ArrowRight, Home, RefreshCcw, Eye } from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/quiz/StatCard';
import { motion } from 'framer-motion';

export const Terminated = () => {
  const { id } = useParams();
  const { latestResult, terminationReason } = useQuiz();

  const result = latestResult || {};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl bg-rose-950/40 border-2 border-rose-500/60 text-center space-y-6 shadow-danger-glow"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-widest">
            Security Protocol Violation
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Test Attempt Terminated
          </h1>
          <p className="text-sm text-rose-200/80 max-w-lg mx-auto leading-relaxed">
            Your quiz attempt was automatically halted because proctoring security rules were violated.
          </p>
        </div>

        {/* Reason Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-900/40 text-left space-y-1">
          <div className="text-[11px] uppercase font-bold text-rose-400">Termination Reason:</div>
          <p className="text-xs font-mono text-slate-200">
            "{result.reason || terminationReason || 'Mouse moved outside designated test boundary area.'}"
          </p>
        </div>
      </motion.div>

      {/* Partial Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          title="Questions Attempted"
          value={Object.keys(result.answers || {}).length}
          suffix={` / ${result.totalQuestions || 0}`}
          icon={Eye}
          color="text-amber-400"
        />
        <StatCard
          title="Partial Score"
          value={result.score || 0}
          suffix={` (${result.percentage || 0}%)`}
          icon={AlertTriangle}
          color="text-rose-400"
        />
        <StatCard
          title="Warnings Issued"
          value={result.focusWarnings || 2}
          icon={ShieldAlert}
          color="text-purple-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {result.id && (
          <Link to={`/quiz/${id}/review`} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={Eye} className="w-full">
              Review Partial Answers
            </Button>
          </Link>
        )}
        <Link to="/categories" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" icon={RefreshCcw} className="w-full">
            Try Another Quiz
          </Button>
        </Link>
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="ghost" size="lg" icon={Home} className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>

    </div>
  );
};
