import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow-sm hover:shadow-glow-md focus:ring-brand-500",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 hover:border-slate-600 focus:ring-slate-500",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500",
    danger: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-danger-glow focus:ring-rose-500",
    outline: "bg-transparent border border-brand-500/40 hover:border-brand-400 text-brand-300 hover:bg-brand-500/10 focus:ring-brand-500"
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      <span>{children}</span>
    </motion.button>
  );
};
