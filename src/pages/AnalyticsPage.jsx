import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Calendar,
  Layers,
  BookOpen,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import StatCard from '../components/common/StatCard';
import AttendanceTrendChart from '../components/analytics/AttendanceTrendChart';
import SubjectWiseChart from '../components/analytics/SubjectWiseChart';
import StatusDonutChart from '../components/analytics/StatusDonutChart';
import { useTheme } from '../context/ThemeContext';
import {
  getAttendance,
  getSubjects,
  getStudents,
  getTeachers,
  getSettings
} from '../utils/storage';
import {
  calculateOverallStats,
  getAttendanceTrendChartData,
  getSubjectWiseChartData,
  getStatusDonutData
} from '../utils/calculations';

export default function AnalyticsPage() {
  const { isDark } = useTheme();

  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setAttendance(getAttendance());
    setSubjects(getSubjects());
    setStudents(getStudents());
    setTeachers(getTeachers());
    setSettings(getSettings());
  }, []);

  const stats = useMemo(() => {
    return calculateOverallStats(attendance, students, teachers, subjects, settings.minAttendanceThreshold || 75);
  }, [attendance, students, teachers, subjects, settings]);

  const trendData = useMemo(() => {
    return getAttendanceTrendChartData(attendance, 30);
  }, [attendance]);

  const subjectData = useMemo(() => {
    return getSubjectWiseChartData(attendance, subjects);
  }, [attendance, subjects]);

  const donutData = useMemo(() => {
    return getStatusDonutData(attendance);
  }, [attendance]);

  // Department comparison chart data
  const deptData = useMemo(() => {
    const map = {};
    attendance.forEach(s => {
      const dept = s.department || 'Computer Science';
      if (!map[dept]) {
        map[dept] = { department: dept, total: 0, present: 0 };
      }
      (s.records || []).forEach(r => {
        map[dept].total++;
        if (r.status === 'present') map[dept].present++;
      });
    });

    return Object.values(map).map(item => ({
      name: item.department.replace('Engineering', 'Eng.').replace('Electronics & Communication', 'ECE').replace('Information Technology', 'IT').replace('Computer Science', 'CSE'),
      fullName: item.department,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
      total: item.total
    }));
  }, [attendance]);

  // Weekday breakdown (Mon-Fri)
  const weekdayData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = {
      1: { name: 'Mon', total: 0, present: 0 },
      2: { name: 'Tue', total: 0, present: 0 },
      3: { name: 'Wed', total: 0, present: 0 },
      4: { name: 'Thu', total: 0, present: 0 },
      5: { name: 'Fri', total: 0, present: 0 }
    };

    attendance.forEach(s => {
      const d = new Date(s.date);
      const dayNum = d.getDay();
      if (dayStats[dayNum]) {
        (s.records || []).forEach(r => {
          dayStats[dayNum].total++;
          if (r.status === 'present') dayStats[dayNum].present++;
        });
      }
    });

    return Object.values(dayStats).map(d => ({
      day: d.name,
      percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
    }));
  }, [attendance]);

  // Best & Worst performing subjects
  const sortedSubjects = [...subjectData].sort((a, b) => b.percentage - a.percentage);
  const bestSubject = sortedSubjects[0];
  const lowestSubject = sortedSubjects[sortedSubjects.length - 1];

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Attendance Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep data visualization of student attendance patterns, department trends, and course metrics.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.overallPercentage}%`}
          subtitle="Institute-wide Average"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Top Performing Subject"
          value={bestSubject ? `${bestSubject.percentage}%` : '—'}
          subtitle={bestSubject ? `${bestSubject.code} (${bestSubject.name})` : 'N/A'}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Subject Needs Attention"
          value={lowestSubject ? `${lowestSubject.percentage}%` : '—'}
          subtitle={lowestSubject ? `${lowestSubject.code} (${lowestSubject.name})` : 'N/A'}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Total Marked Logs"
          value={stats.totalRecords}
          subtitle={`Across ${stats.totalSessions} sessions`}
          icon={Layers}
          color="blue"
        />
      </div>

      {/* 30-Day Trend Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            30-Day Attendance Timeline Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evolution of daily class attendance rates over the past month
          </p>
        </div>
        <AttendanceTrendChart data={trendData} />
      </div>

      {/* Two Column Grid: Subject Performance & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subject-Wise Bar Chart */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Course-by-Course Attendance Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Percentage of student attendance per registered curriculum subject
            </p>
          </div>
          <SubjectWiseChart data={subjectData} />
        </div>

        {/* Status Donut */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Attendance Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Present vs Absent vs Late proportions
            </p>
          </div>
          <StatusDonutChart data={donutData} />
        </div>

      </div>

      {/* Two Column Grid: Department Comparison & Weekday Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Comparison */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Department Attendance Rates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative student attendance across academic faculties
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
                <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} unit="%" tickLine={false} axisLine={{ stroke: gridColor }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                          <p className="font-bold text-slate-200">{item.fullName}</p>
                          <p className="text-indigo-400 font-semibold mt-1">Attendance: {item.percentage}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#6366f1' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of the Week Pattern */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weekday Attendance Pattern
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Average attendance rate by day of the week (Monday to Friday)
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" stroke={textColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
                <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} unit="%" tickLine={false} axisLine={{ stroke: gridColor }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                          <p className="font-bold text-slate-200">{item.day}</p>
                          <p className="text-emerald-400 font-semibold mt-1">Avg Attendance: {item.percentage}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
