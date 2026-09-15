import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export default function StatusDonutChart({ data = [] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No attendance records found to plot distribution.
      </div>
    );
  }

  return (
    <div className="w-full h-72 relative flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                    <p className="font-semibold text-slate-200">{item.name}</p>
                    <p className="font-bold text-indigo-300">
                      {item.value} records ({pct}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value, entry) => {
              const item = data.find(d => d.name === value);
              const pct = total > 0 && item ? Math.round((item.value / total) * 100) : 0;
              return (
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-1">
                  {value} ({pct}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label inside donut */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
          {total}
        </p>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
          Total Logs
        </p>
      </div>
    </div>
  );
}
