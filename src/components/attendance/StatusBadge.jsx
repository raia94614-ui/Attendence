import React from 'react';
import { Check, X, Clock, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, showIcon = true, size = 'md' }) {
  const normStatus = (status || '').toLowerCase();

  let text = 'No Record';
  let bg = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  let icon = <HelpCircle className="w-3.5 h-3.5" />;

  if (normStatus === 'present') {
    text = 'Present';
    bg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40';
    icon = <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  } else if (normStatus === 'absent') {
    text = 'Absent';
    bg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40';
    icon = <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
  } else if (normStatus === 'late') {
    text = 'Late';
    bg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40';
    icon = <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
  } else if (normStatus === 'excused') {
    text = 'Excused';
    bg = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40';
    icon = <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-all ${bg} ${sizeClass}`}
    >
      {showIcon && icon}
      <span>{text}</span>
    </span>
  );
}
