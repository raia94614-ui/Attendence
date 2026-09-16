import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';
import PrintableAttendanceSlip from '../components/reports/PrintableAttendanceSlip';
import BunkBadge from '../components/common/BunkBadge';
import { useToast } from '../context/ToastContext';
import {
  getStudentSubjects,
  getDailyAttendanceLogs,
  getStudentProfile,
  getSettings
} from '../utils/storage';
import {
  calculateOverallStudentMetrics,
  calculateSubjectBunkStats
} from '../utils/calculations';
import { downloadCSV } from '../utils/csvExport';
import { formatDate, getTodayDateString } from '../utils/dateUtils';

const REPORT_TABS = [
  { id: 'summary', label: 'Overall Summary', icon: TrendingUp },
  { id: 'subjects', label: 'Subject Breakdown', icon: BookOpen },
  { id: 'logs', label: 'Daily Class Logs', icon: Clock }
];

export default function ReportsPage({ onNavigate }) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('summary');
  const [subjects, setSubjects] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [profile, setProfile] = useState(getStudentProfile());
  const [settings, setSettings] = useState(getSettings());
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // Filters for logs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadData = () => {
    setSubjects(getStudentSubjects());
    setDailyLogs(getDailyAttendanceLogs());
    setProfile(getStudentProfile());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('attendx-attendance-updated', handleUpdate);
    return () => {
      window.removeEventListener('attendx-attendance-updated', handleUpdate);
    };
  }, []);

  const metrics = useMemo(() => {
    return calculateOverallStudentMetrics(subjects, settings.minAttendanceTarget || 75);
  }, [subjects, settings]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return dailyLogs.filter(log => {
      const matchSearch =
        !searchQuery ||
        (log.subjectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.date || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchSubject =
        filterSubject === 'ALL' ||
        log.subjectId === filterSubject ||
        (log.subjectName || '').toLowerCase() === filterSubject.toLowerCase();

      const matchStatus = filterStatus === 'ALL' || log.status === filterStatus;

      return matchSearch && matchSubject && matchStatus;
    });
  }, [dailyLogs, searchQuery, filterSubject, filterStatus]);

  // CSV Export for Subjects
  const handleExportSubjectsCSV = () => {
    if (subjects.length === 0) {
      toast.error('No subjects data to export.');
      return;
    }

    const headers = ['Subject Code', 'Subject Name', 'Faculty', 'Room', 'Attended', 'Total Classes', 'Attendance %', 'Status', 'Safe Bunks / Shortage'];
    const rows = metrics.subjects.map(s => [
      `"${s.code || ''}"`,
      `"${s.name || ''}"`,
      `"${s.teacher || ''}"`,
      `"${s.room || ''}"`,
      s.present,
      s.total,
      `${s.percentage}%`,
      s.percentage >= (s.target || 75) ? 'ELIGIBLE' : 'SHORTAGE',
      s.safeBunks > 0 ? `${s.safeBunks} safe bunks` : `${s.mustAttend} must attend`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, `Attendance_Summary_${getTodayDateString()}.csv`);
    toast.success('Subject summary CSV exported successfully! 📊');
  };

  // CSV Export for Daily Logs
  const handleExportLogsCSV = () => {
    if (dailyLogs.length === 0) {
      toast.error('No daily logs to export.');
      return;
    }

    const headers = ['Date', 'Day', 'Subject Name', 'Time Slot', 'Room', 'Status', 'Logged At'];
    const rows = dailyLogs.map(l => [
      `"${l.date || ''}"`,
      `"${l.day || ''}"`,
      `"${l.subjectName || ''}"`,
      `"${l.time || ''}"`,
      `"${l.room || ''}"`,
      `"${(l.status || '').toUpperCase()}"`,
      `"${l.timestamp || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, `Daily_Attendance_Logs_${getTodayDateString()}.csv`);
    toast.success('Daily attendance logs exported! 📅');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Attendance Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detailed performance breakdown, subject-wise statistics, and exportable attendance reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSlipOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-500" />
            <span>Print Official Slip</span>
          </button>

          <button
            type="button"
            onClick={activeTab === 'logs' ? handleExportLogsCSV : handleExportSubjectsCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERALL SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
              <p className={`text-3xl font-black ${metrics.isEligible ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metrics.overallPercentage}%
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Target: {settings.minAttendanceTarget || 75}% ({metrics.isEligible ? 'Eligible' : 'Shortage'})
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classes Attended</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {metrics.totalPresent} <span className="text-sm font-normal text-slate-400">/ {metrics.totalHeld}</span>
              </p>
              <p className="text-xs text-indigo-500 font-medium">
                {metrics.totalAbsent} missed sessions
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Safe Bunks</span>
              <p className="text-3xl font-black text-emerald-500">
                {metrics.overallSafeBunks}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Available without dropping below {settings.minAttendanceTarget || 75}%
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subjects Above Target</span>
              <p className="text-3xl font-black text-indigo-500">
                {metrics.subjectsAboveTarget} <span className="text-sm font-normal text-slate-400">/ {metrics.totalSubjects}</span>
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {metrics.subjectsBelowTarget} subject{metrics.subjectsBelowTarget === 1 ? '' : 's'} need attention
              </p>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border border-indigo-700/50 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-xl border border-white/20">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{profile.name || 'Student'}</h3>
                  <p className="text-xs text-indigo-200">
                    Roll: {profile.rollNumber || 'N/A'} • {profile.department || 'Computer Science'} • {profile.semester || 'Semester 5'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                    {profile.college || 'University Campus'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20">
                  {metrics.isEligible ? '✅ Exam Eligible' : '⚠️ Shortage Warning'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUBJECT BREAKDOWN */}
      {activeTab === 'subjects' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject-Wise Master Attendance Sheet ({subjects.length} Subjects)
            </h3>
            <button
              type="button"
              onClick={handleExportSubjectsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Faculty / Room</th>
                  <th className="py-3 px-3 text-center">Attended</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Percentage</th>
                  <th className="py-3 px-3 text-right">Bunk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.subjects.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: s.color || '#6366f1' }} />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {s.code || 'SUB'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      <p className="font-medium">{s.teacher || 'Faculty'}</p>
                      <p className="text-[10px] text-slate-400">{s.room || 'RJ310R'}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {s.present}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                      {s.total}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-black ${s.percentage >= (s.target || 75) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {s.percentage}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${s.percentage >= (s.target || 75) ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, s.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <BunkBadge stats={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY ATTENDANCE LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Attendance Logs ({filteredLogs.length} Records)
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search subject or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-48"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No attendance logs found matching filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-3">Date & Day</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Time Slot</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {log.date} <span className="text-slate-400 font-normal">({log.day})</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {log.subjectName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {log.time}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {log.room || '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            log.status === 'present'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : log.status === 'absent'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {log.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === 'absent' && <XCircle className="w-3 h-3" />}
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRINTABLE SLIP MODAL */}
      {isSlipOpen && (
        <PrintableAttendanceSlip
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          subjects={subjects}
          profile={profile}
          settings={settings}
        />
      )}

    </div>
  );
}
