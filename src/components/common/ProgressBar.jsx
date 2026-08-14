import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({
  progress = 0, // 0 to 100
  color = 'from-brand-500 to-indigo-500',
  height = 'h-2.5',
  showLabel = false,
  className = ''
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Progress</span>
          <span>{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${height} p-0.5 border border-slate-700/50`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
};
