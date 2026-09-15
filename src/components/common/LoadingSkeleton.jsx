import React from 'react';

export default function LoadingSkeleton({ count = 5, type = 'table-row' }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800/60 rounded-2xl p-5" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="w-full h-72 bg-slate-200 dark:bg-slate-800/60 rounded-2xl animate-pulse p-6 flex items-end gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-full bg-slate-300 dark:bg-slate-700/60 rounded-t-lg"
            style={{ height: `${20 + (i * 13) % 70}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800/60 rounded-xl w-full" />
      ))}
    </div>
  );
}
