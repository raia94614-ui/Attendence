import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/attendance/StatusBadge';
import AttendanceTrendChart from '../components/analytics/AttendanceTrendChart';
import SubjectWiseChart from '../components/analytics/SubjectWiseChart';
import StatusDonutChart from '../components/analytics/StatusDonutChart';
import StudentDetailModal from '../components/students/StudentDetailModal';
import StudentModal from '../components/students/StudentModal';
import SubjectModal from '../components/subjects/SubjectModal';
import {
  getStudents,
  getTeachers,
  getSubjects,
  getAttendance,
  getSettings
} from '../utils/storage';
import {
  calculateOverallStats,
  getAttendanceTrendChartData,
  getSubjectWiseChartData,
  getStatusDonutData
} from '../utils/calculations';
import { formatDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate }) {
  const { currentUser } = useAuth();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [settings, setSettings] = useState(getSettings());

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const loadData = () => {
    setStudents(getStudents());
    setTeachers(getTeachers());
    setSubjects(getSubjects());
    setAttendance(getAttendance());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return calculateOverallStats(
      attendance,
      students,
      teachers,
      subjects,
      settings.minAttendanceThreshold || 75
    );
  }, [attendance, students, teachers, subjects, settings]);

  const trendData = useMemo(() => {
    return getAttendanceTrendChartData(attendance, 14);
  }, [attendance]);

  const subjectChartData = useMemo(() => {
    return getSubjectWiseChartData(attendance, subjects);
  }, [attendance, subjects]);

  const donutData = useMemo(() => {
    return getStatusDonutData(attendance);
  }, [attendance]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        {/* Glow pattern background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {settings.institutionName} • {settings.currentSemester}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p className="text-sm text-indigo-100/80 mt-1 max-w-xl">
            Live institutional overview: Real-time class attendance rate is currently standing at{' '}
            <strong className="text-white font-bold">{stats.overallPercentage}%</strong> across all departments.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('marking')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition-all hover:scale-102"
          >
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            Mark Attendance
          </button>
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled across 5 departments"
          icon={GraduationCap}
          color="indigo"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Overall Attendance"
          value={`${stats.overallPercentage}%`}
          subtitle={`Target: ${settings.minAttendanceThreshold}% minimum`}
          icon={CalendarCheck}
          color={stats.overallPercentage >= 75 ? 'emerald' : 'rose'}
          trend={stats.overallPercentage >= 75 ? 'Optimal' : 'Needs Attention'}
          trendType={stats.overallPercentage >= 75 ? 'up' : 'down'}
          onClick={() => onNavigate('analytics')}
        />
        <StatCard
          title="Faculty Members"
          value={stats.totalTeachers}
          subtitle={`${stats.totalSubjects} active courses`}
          icon={Users}
          color="blue"
          onClick={() => onNavigate('teachers')}
        />
        <StatCard
          title="Low Attendance Alert"
          value={stats.lowAttendanceCount}
          subtitle="Students below 75% threshold"
          icon={AlertTriangle}
          color="amber"
          trend={`${stats.lowAttendanceCount} Students`}
          trendType="down"
          onClick={() => onNavigate('reports')}
        />
      </div>

      {/* Today's / Latest Session Snapshot Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
            %
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {stats.today.isLatestDay ? 'Latest Session Attendance' : "Today's Attendance"}
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats.today.percentage}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Present Today</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.today.present} <span className="text-xs font-normal text-slate-400">students</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Absent Today</p>
            <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats.today.absent} <span className="text-xs font-normal text-slate-400">students</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Late Entries</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.today.late} <span className="text-xs font-normal text-slate-400">students</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Area Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Institutional Attendance Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily aggregate attendance percentage across all lecture sessions
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <AttendanceTrendChart data={trendData} />
        </div>

        {/* Status Breakdown Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Status Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All-time marked student attendance logs
            </p>
          </div>
          <StatusDonutChart data={donutData} />
        </div>

      </div>

      {/* Subject-Wise Attendance Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Course & Subject-Wise Attendance Rates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparison of student presence across active academic courses (Green: ≥85%, Indigo: 80-84%, Amber: 75-79%, Red: &lt;75%)
            </p>
          </div>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage Courses <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <SubjectWiseChart data={subjectChartData} />
      </div>

      {/* Bottom Row: Low Attendance Action List & Recent Marked Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Attendance Watchlist (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Low Attendance Watchlist</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Below 75% minimum threshold</p>
              </div>
            </div>
            <Badge variant="danger" size="sm">
              {stats.lowAttendanceCount} Students
            </Badge>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {stats.lowAttendanceStudents.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400">
                🎉 Excellent! No students are currently below the attendance threshold.
              </div>
            ) : (
              stats.lowAttendanceStudents.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentForDetail(st)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-100 dark:border-slate-700/60 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {st.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {st.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {st.rollNumber} • {st.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                      {st.percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {st.presentClasses}/{st.totalClasses} classes
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Marked Sessions (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Attendance Sessions</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Recently logged lecture attendance records</p>
            </div>
            <button
              onClick={() => onNavigate('records')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              All Records <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800 pb-2">
                <tr>
                  <th className="py-2.5">Date & Subject</th>
                  <th className="py-2.5">Batch</th>
                  <th className="py-2.5">Faculty</th>
                  <th className="py-2.5 text-right">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {attendance.slice(0, 5).map((sess) => {
                  let pres = 0;
                  const tot = sess.records ? sess.records.length : 0;
                  (sess.records || []).forEach(r => { if (r.status === 'present') pres++; });
                  const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-medium">
                        <span className="font-bold text-slate-900 dark:text-white block">{sess.subjectCode}</span>
                        <span className="text-[11px] text-slate-400">{formatDate(sess.date)}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                          Sem {sess.semester}-{sess.section}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {sess.markedBy || 'Faculty'}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-bold text-xs ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {pct}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">{pres}/{tot} present</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Student Details Drawer / Modal */}
      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        student={selectedStudentForDetail}
      />

      {/* Add Student Modal */}
      <StudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSaved={loadData}
      />

      {/* Add Subject Modal */}
      <SubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSaved={loadData}
      />

    </div>
  );
}
