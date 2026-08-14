import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const QuizOption = ({
  optionText,
  index,
  isSelected,
  onSelect,
  disabled = false
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const letter = letters[index] || (index + 1);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
        isSelected
          ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow-sm ring-1 ring-brand-500'
          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-xl font-mono font-bold text-xs transition-colors ${
          isSelected
            ? 'bg-brand-500 text-white shadow'
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {letter}
        </div>
        <span className="text-sm sm:text-base font-medium leading-relaxed">
          {optionText}
        </span>
      </div>

      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
        isSelected
          ? 'bg-brand-500 border-brand-400 text-white scale-110'
          : 'border-slate-700 bg-slate-950/50'
      }`}>
        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>
    </motion.button>
  );
};
