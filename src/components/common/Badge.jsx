import React from 'react';

export const Badge = ({
  children,
  variant = 'brand', // 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan' | 'metal'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  className = ''
}) => {
  const base = "inline-flex items-center gap-1 font-medium rounded-full border transition-colors tracking-tight";

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs"
  };

  const variants = {
    brand: "bg-white/10 text-white border-white/20",
    metal: "bg-gradient-to-r from-zinc-800 to-zinc-900 text-zinc-200 border-zinc-700",
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
    warning: "bg-amber-950/60 text-amber-300 border-amber-800/40",
    danger: "bg-red-950/60 text-red-300 border-red-800/40",
    neutral: "bg-zinc-900/80 text-zinc-300 border-zinc-800",
    cyan: "bg-cyan-950/60 text-cyan-300 border-cyan-800/40"
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.brand} ${className}`}>
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{children}</span>
    </span>
  );
};
