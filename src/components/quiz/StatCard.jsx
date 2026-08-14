import React from 'react';
import { Card } from '../common/Card';
import { CountUpNumber } from '../common/CountUpNumber';

export const StatCard = ({
  title,
  value,
  suffix = '',
  prefix = '',
  icon: Icon,
  color = 'text-brand-400',
  bgGradient = 'from-brand-500/10 to-indigo-500/5',
  subtitle
}) => {
  return (
    <Card className={`bg-gradient-to-br ${bgGradient} border-slate-800/80`}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className={`font-display font-bold text-3xl sm:text-4xl tracking-tight text-white mb-1 ${color}`}>
        {typeof value === 'number' ? (
          <CountUpNumber end={value} suffix={suffix} prefix={prefix} />
        ) : (
          `${prefix}${value}${suffix}`
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </Card>
  );
};
