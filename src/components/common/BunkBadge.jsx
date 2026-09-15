import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export default function BunkBadge({ stats }) {
  if (!stats) return null;

  const { percentage, target, safeBunks, mustAttend } = stats;

  if (percentage < target) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800/50 shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
        <span>Attend next <strong>{mustAttend}</strong> {mustAttend === 1 ? 'class' : 'classes'} for {target}%</span>
      </div>
    );
  }

  if (safeBunks > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Can bunk <strong>{safeBunks}</strong> more {safeBunks === 1 ? 'class' : 'classes'}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/50 shadow-2xs">
      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      <span>Exactly on track ({percentage}%) • Don't bunk!</span>
    </div>
  );
}
