import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'liquid' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient' | 'emerald' | 'cyan'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  as: Component = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none select-none tracking-tight";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  const variantStyles = {
    primary: "btn-liquid-metal focus:ring-indigo-400",
    liquid: "btn-liquid-metal focus:ring-indigo-400",
    secondary: "bg-zinc-900/90 text-zinc-100 border border-white/15 hover:border-indigo-500/50 hover:bg-zinc-800/90 shadow-sm hover:shadow-indigo-500/10 focus:ring-indigo-400",
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border border-white/20 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 focus:ring-purple-400",
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 focus:ring-emerald-400",
    cyan: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 focus:ring-cyan-400",
    ghost: "bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white border border-transparent focus:ring-zinc-500",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white border border-red-400/40 shadow-lg shadow-red-500/25 hover:brightness-110 focus:ring-red-500",
    outline: "bg-transparent border border-white/20 hover:border-indigo-400/50 text-white hover:bg-indigo-950/20 focus:ring-indigo-400"
  };

  if (Component === 'span') {
    return (
      <motion.span
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
        {...props}
      >
        {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
        <span>{children}</span>
      </motion.span>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      <span>{children}</span>
    </motion.button>
  );
};
