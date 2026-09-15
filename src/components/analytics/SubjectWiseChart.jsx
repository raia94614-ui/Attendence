import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function SubjectWiseChart({ data = [] }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No subject attendance data available yet.
      </div>
    );
  }

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="code"
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            stroke={textColor}
            fontSize={11}
            domain={[0, 100]}
            unit="%"
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                    <p className="font-bold text-slate-200">{item.code}: {item.fullName}</p>
                    <p className="text-indigo-400 font-semibold mt-1">
                      Attendance: {item.percentage}%
                    </p>
                    <div className="text-[11px] text-slate-300 mt-1 space-y-0.5">
                      <p>Total Records: {item.total}</p>
                      <p className="text-emerald-400">Present: {item.present}</p>
                      <p className="text-rose-400">Absent: {item.absent}</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={45}>
            {data.map((entry, index) => {
              let color = '#6366f1'; // Default Indigo
              if (entry.percentage >= 85) color = '#10b981'; // Emerald
              else if (entry.percentage < 75) color = '#ef4444'; // Rose
              else if (entry.percentage < 80) color = '#f59e0b'; // Amber
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
