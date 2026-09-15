import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_VARIANTS = {
  indigo: {
    bg: 'from-indigo-500/10 to-indigo-500/5',
    border: 'hover:border-indigo-500/40',
    iconBg: 'bg-indigo-600 text-white shadow-indigo-600/30',
    badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
  },
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30',
    badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
  },
  rose: {
    bg: 'from-rose-500/10 to-rose-500/5',
    border: 'hover:border-rose-500/40',
    iconBg: 'bg-rose-600 text-white shadow-rose-600/30',
    badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-600 text-white shadow-amber-600/30',
    badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'hover:border-blue-500/40',
    iconBg: 'bg-blue-600 text-white shadow-blue-600/30',
    badge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'hover:border-purple-500/40',
    iconBg: 'bg-purple-600 text-white shadow-purple-600/30',
    badge: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
  }
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  trendType = 'up',
  onClick,
  className = ''
}) {
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300 ${
        variant.border
      } ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''} ${className}`}
    >
      {/* Subtle top gradient glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${variant.bg} opacity-60 pointer-events-none`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trendType === 'up'
                    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {trendType === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ${variant.iconBg}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
