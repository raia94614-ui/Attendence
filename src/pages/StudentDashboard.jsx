import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/attendance/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStudents, getSubjects, getAttendance, getSettings } from '../utils/storage';
import { calculateStudentStats } from '../utils/calculations';
import { exportStudentReportToCSV } from '../../src/utils/csvExport';
import { formatDate } from '../utils/dateUtils';

export default function StudentDashboard({ onNavigate }) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setStudents(getStudents());
    setSubjects(getSubjects());
    setAttendance(getAttendance());
    setSettings(getSettings());
  }, []);

  // Match student profile with logged in student or fallback to std-1
  const studentProfile = useMemo(() => {
    const studentId = currentUser?.studentId || 'std-1';
    const found = students.find(s => s.id === studentId || s.email === currentUser?.email);
    return found || students[0];
  }, [students, currentUser]);

  const stats = useMemo(() => {
    if (!studentProfile) return null;
    return calculateStudentStats(
      studentProfile.id,
      attendance,
      subjects,
      settings.minAttendanceThreshold || 75
    );
  }, [studentProfile, attendance, subjects, settings]);

  if (!studentProfile || !stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading student attendance records...
      </div>
    );
  }

  const isLow = stats.overallPercentage < settings.minAttendanceThreshold;

  const handleDownloadReport = () => {
    exportStudentReportToCSV(studentProfile, stats);
    toast.success('Attendance report exported to CSV successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-indigo-950/20 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <img
            src={studentProfile.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
            alt={studentProfile.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{studentProfile.name}</h1>
              <Badge variant={studentProfile.status === 'Active' ? 'success' : 'warning'} size="sm">
                {studentProfile.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Roll No: <span className="font-mono font-bold text-indigo-400">{studentProfile.rollNumber}</span> • {studentProfile.department} • Semester {studentProfile.semester} (Sec {studentProfile.section})
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0 no-print">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Download Slip (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.overallPercentage}%`}
          subtitle={`Required: ${settings.minAttendanceThreshold}% min`}
          icon={Award}
          color={isLow ? 'rose' : 'emerald'}
          trend={isLow ? 'Deficit' : 'Eligible'}
          trendType={isLow ? 'down' : 'up'}
        />
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          subtitle="Conducted this term"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Present"
          value={stats.present}
          subtitle="Classes attended"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Absent"
          value={stats.absent}
          subtitle="Missed lectures"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Late"
          value={stats.late}
          subtitle="Late check-ins"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Low Attendance Warning Alert */}
      {isLow && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 dark:text-rose-200">
            <strong className="font-bold block text-sm">Attendance Deficit Warning</strong>
            Your attendance is currently <span className="font-bold text-rose-600 dark:text-rose-400">{stats.overallPercentage}%</span>, which is below the university minimum requirement of {settings.minAttendanceThreshold}%.
            {stats.classesNeededOverall > 0 && (
              <p className="mt-1 font-semibold text-rose-700 dark:text-rose-300">
                You need to attend the next <strong>{stats.classesNeededOverall} consecutive classes</strong> to restore your attendance back to {settings.minAttendanceThreshold}%.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Subject-Wise Attendance Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Subject-Wise Attendance Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your attendance percentage and eligibility status for each course
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.subjectBreakdown.map((sub) => {
            const subIsLow = sub.percentage < settings.minAttendanceThreshold;

            return (
              <div
                key={sub.code}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                      {sub.code}
                    </span>
                    <Badge variant={subIsLow ? 'danger' : 'success'} size="sm">
                      {sub.percentage}%
                    </Badge>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                    {sub.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {sub.credits} Credit Hours
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">Attendance Rate</span>
                      <span className={subIsLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {sub.present} / {sub.total} classes
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          subIsLow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {sub.classesNeeded > 0 ? (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠️ Needs {sub.classesNeeded} more classes
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Requirement Satisfied
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Lecture Attendance History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed chronological logs of all recorded lectures
            </p>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <CalendarIcon className="w-3.5 h-3.5" /> View Calendar View
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800 pb-2">
              <tr>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Course Subject</th>
                <th className="py-2.5">Time Slot</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Remarks</th>
                <th className="py-2.5 text-right">Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {stats.sessionHistory.slice(0, 15).map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 font-mono font-medium">{formatDate(log.date)}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {log.subjectCode} - {log.subjectName}
                  </td>
                  <td className="py-3 text-slate-400">{log.timeSlot || '09:00 AM - 10:00 AM'}</td>
                  <td className="py-3">
                    <StatusBadge status={log.status} size="sm" />
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 italic">
                    {log.remarks || '—'}
                  </td>
                  <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                    {log.markedBy || 'Faculty'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
