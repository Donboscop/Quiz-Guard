import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, Home, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl"
      >
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="font-mono font-bold text-4xl text-white tracking-widest block">
            404
          </span>
          <h1 className="font-display font-bold text-2xl text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or test path you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" icon={Home} className="w-full">
              Go to Home
            </Button>
          </Link>
          <Link to="/categories" className="w-full sm:w-auto">
            <Button variant="secondary" icon={BookOpen} className="w-full">
              Explore Quizzes
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
