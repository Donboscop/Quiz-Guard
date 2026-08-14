import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  maxWidth = 'max-w-md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const typeIcons = {
    warning: <AlertTriangle className="w-7 h-7 text-amber-400" />,
    danger: <ShieldAlert className="w-7 h-7 text-rose-400" />,
    info: <ShieldAlert className="w-7 h-7 text-brand-400" />,
    success: <CheckCircle2 className="w-7 h-7 text-emerald-400" />
  };

  const typeBorders = {
    warning: 'border-amber-500/40 bg-amber-500/5',
    danger: 'border-rose-500/40 bg-rose-500/5 shadow-danger-glow',
    info: 'border-brand-500/40 bg-brand-500/5',
    success: 'border-emerald-500/40 bg-emerald-500/5'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} rounded-2xl bg-slate-900 border p-6 shadow-2xl z-10 overflow-hidden ${typeBorders[type]}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  {typeIcons[type]}
                </div>
                {title && (
                  <h3 className="font-display font-bold text-lg text-white">
                    {title}
                  </h3>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="text-slate-300 text-sm leading-relaxed space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
