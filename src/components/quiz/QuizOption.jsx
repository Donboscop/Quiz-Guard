import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getOptionLetter } from '../../utils/quizUtils';

export const QuizOption = ({
  optionText,
  index,
  isSelected,
  onSelect,
  isMultiple = false,
  disabled = false
}) => {
  const letter = getOptionLetter(index);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.005 }}
      whileTap={{ scale: disabled ? 1 : 0.995 }}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-4 focus:outline-none ${
        isSelected
          ? 'bg-white/10 border-white text-white shadow-sm ring-1 ring-white'
          : 'bg-zinc-950/80 border-white/[0.08] text-zinc-300 hover:bg-zinc-900 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg font-mono font-bold text-xs transition-colors ${
          isSelected
            ? 'bg-white text-black shadow'
            : 'bg-zinc-900 text-zinc-400 border border-white/10'
        }`}>
          {letter}
        </div>
        <span className="text-xs sm:text-sm font-medium leading-relaxed">
          {optionText}
        </span>
      </div>

      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
        isMultiple ? 'rounded' : 'rounded-full'
      } ${
        isSelected
          ? 'bg-white border-white text-black scale-105'
          : 'border-white/20 bg-zinc-950'
      }`}>
        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
    </motion.button>
  );
};
