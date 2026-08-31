import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { ShieldAlert, AlertTriangle, ArrowRight, Home, RefreshCw, Eye } from 'lucide-react';
import { Button } from '../components/common/Button';
import { motion } from 'framer-motion';

export const Terminated = () => {
  const { id } = useParams();
  const { latestResult, terminationReason } = useQuiz();

  const result = latestResult || {};

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="vesper-panel p-8 sm:p-10 text-center space-y-6 border-red-800/60 bg-red-950/20"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[11px] font-mono uppercase tracking-wider">
              Focus Protocol Breach
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">
              Assessment Attempt Terminated
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Your assessment session was automatically concluded because proctoring focus rules were exceeded.
            </p>
          </div>

          {/* Reason Card */}
          <div className="p-4 rounded-xl bg-black border border-red-900/40 text-left space-y-1">
            <div className="text-[10px] uppercase font-mono text-red-400">Recorded Reason:</div>
            <p className="text-xs font-mono text-zinc-300">
              "{result.reason || terminationReason || 'Mouse moved outside designated test boundary area or window defocused.'}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/[0.08]">
            <Link to={`/quiz/${id}/instructions`} className="w-full sm:w-auto">
              <Button variant="liquid" size="md" icon={RefreshCw} className="w-full sm:w-auto">
                Retake Assessment
              </Button>
            </Link>
            <Link to="/categories" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                Browse Quizzes
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full sm:w-auto">
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
