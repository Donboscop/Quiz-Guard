import React from 'react';

export const Badge = ({
  children,
  variant = 'brand', // 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  className = ''
}) => {
  const base = "inline-flex items-center gap-1 font-semibold rounded-full border transition-colors";

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs"
  };

  const variants = {
    brand: "bg-brand-500/10 text-brand-300 border-brand-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{children}</span>
    </span>
  );
};
