import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = true,
  onClick,
  ...props
}) => {
  const base = "rounded-2xl p-6 relative overflow-hidden transition-all duration-300";
  const glassStyle = glass ? "glass-card" : "bg-slate-900 border border-slate-800";
  const hoverStyle = hoverEffect ? "glass-card-hover cursor-pointer" : "";

  return (
    <motion.div
      onClick={onClick}
      className={`${base} ${glassStyle} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
