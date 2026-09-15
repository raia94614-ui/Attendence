import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function AttendanceTrendChart({ data = [] }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No attendance trend data available yet.
      </div>
    );
  }

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="attendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="formattedDate"
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
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                    <p className="font-bold text-slate-200 mb-1">{item.date}</p>
                    <div className="space-y-1">
                      <p className="text-indigo-400 font-semibold">
                        Overall: {item.percentage}% Attendance
                      </p>
                      <p className="text-emerald-400">Present: {item.present}</p>
                      <p className="text-rose-400">Absent: {item.absent}</p>
                      {item.late > 0 && <p className="text-amber-400">Late: {item.late}</p>}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            name="Attendance %"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#attendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
