import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const Toast = ({
  message,
  type = 'info', // 'info' | 'success' | 'warning' | 'danger'
  isVisible,
  onClose
}) => {
  const icons = {
    info: <Info className="w-5 h-5 text-brand-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-400" />
  };

  const borders = {
    info: 'border-brand-500/40 bg-slate-900/95',
    success: 'border-emerald-500/40 bg-slate-900/95',
    warning: 'border-amber-500/40 bg-slate-900/95',
    danger: 'border-rose-500/40 bg-slate-900/95'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${borders[type]}`}
        >
          {icons[type]}
          <span className="text-sm font-medium text-slate-100">{message}</span>
          {onClose && (
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
