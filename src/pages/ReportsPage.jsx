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
  ChevronRight
} from 'lucide-react';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/attendance/StatusBadge';
import { useToast } from '../context/ToastContext';
import {
  getStudents,
  getSubjects,
  getAttendance,
  getSettings
} from '../utils/storage';
import { calculateStudentStats } from '../utils/calculations';
import {
  downloadCSV,
  exportAttendanceSessionsToCSV,
  exportDetailedAttendanceLogsToCSV,
  exportStudentsToCSV
} from '../utils/csvExport';
import { formatDate, getTodayDateString } from '../utils/dateUtils';

const REPORT_TABS = [
  { id: 'daily', label: 'Daily Session Report' },
  { id: 'monthly', label: 'Monthly Summary' },
  { id: 'student', label: 'Student-Wise Report' },
  { id: 'subject', label: 'Subject-Wise Master' }
];

export default function ReportsPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('daily');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [settings, setSettings] = useState(getSettings());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setStudents(getStudents());
    setSubjects(getSubjects());
    setAttendance(getAttendance());
    setSettings(getSettings());
  }, []);

  // Filtered attendance for Daily report
  const dailySessions = useMemo(() => {
    return attendance.filter(sess => {
      if (selectedDate && sess.date !== selectedDate) return false;
      if (selectedSubject !== 'ALL' && sess.subjectCode !== selectedSubject) return false;
      if (selectedDept !== 'ALL' && sess.department !== selectedDept) return false;
      return true;
    });
  }, [attendance, selectedDate, selectedSubject, selectedDept]);

  // Student wise calculation table
  const studentReports = useMemo(() => {
    const threshold = settings.minAttendanceThreshold || 75;
    return students
      .filter(st => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q || st.name.toLowerCase().includes(q) || st.rollNumber.toLowerCase().includes(q);
        if (!matchSearch) return false;
        if (selectedDept !== 'ALL' && st.department !== selectedDept) return false;
        if (selectedSemester !== 'ALL' && String(st.semester) !== String(selectedSemester)) return false;
        return true;
      })
      .map(st => {
        const stats = calculateStudentStats(st.id, attendance, subjects, threshold);
        return {
          ...st,
          stats
        };
      });
  }, [students, attendance, subjects, settings, searchQuery, selectedDept, selectedSemester]);

  // Subject wise master calculation
  const subjectReports = useMemo(() => {
    return subjects.map(sub => {
      const sessions = attendance.filter(s => s.subjectCode === sub.code);
      let total = 0;
      let present = 0;
      let absent = 0;
      let late = 0;

      sessions.forEach(s => {
        (s.records || []).forEach(r => {
          total++;
          if (r.status === 'present') present++;
          else if (r.status === 'absent') absent++;
          else if (r.status === 'late') late++;
        });
      });

      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        ...sub,
        totalSessions: sessions.length,
        totalStudentsLogged: total,
        present,
        absent,
        late,
        percentage
      };
    });
  }, [subjects, attendance]);

  // Paginated Student reports
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return studentReports.slice(start, start + itemsPerPage);
  }, [studentReports, currentPage]);

  const totalPages = Math.ceil(studentReports.length / itemsPerPage) || 1;

  // CSV Export handlers
  const handleExportCSV = () => {
    if (activeTab === 'daily') {
      exportDetailedAttendanceLogsToCSV(dailySessions.length > 0 ? dailySessions : attendance);
      toast.success('Daily logs exported to CSV');
    } else if (activeTab === 'student') {
      const headers = ['Roll Number', 'Full Name', 'Department', 'Semester', 'Total Classes', 'Present', 'Absent', 'Attendance %', 'Eligibility'];
      const rows = studentReports.map(s => [
        `"${s.rollNumber}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        `"${s.semester}"`,
        s.stats.totalClasses,
        s.stats.present,
        s.stats.absent,
        `"${s.stats.overallPercentage}%"`,
        `"${s.stats.overallPercentage >= 75 ? 'ELIGIBLE' : 'DEFICIT'}"`
      ].join(','));
      downloadCSV(`AttendX_Student_Summary_${getTodayDateString()}`, [headers.join(','), ...rows].join('\r\n'));
      toast.success('Student attendance summary exported to CSV');
    } else if (activeTab === 'subject') {
      const headers = ['Course Code', 'Course Title', 'Department', 'Semester', 'Credits', 'Lectures Held', 'Attendance %'];
      const rows = subjectReports.map(s => [
        `"${s.code}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        `"${s.semester}"`,
        s.credits,
        s.totalSessions,
        `"${s.percentage}%"`
      ].join(','));
      downloadCSV(`AttendX_Subject_Summary_${getTodayDateString()}`, [headers.join(','), ...rows].join('\r\n'));
      toast.success('Subject summary exported to CSV');
    } else {
      exportAttendanceSessionsToCSV(attendance);
      toast.success('Attendance records exported to CSV');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Attendance Reports & Statements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate printable attendance slips, daily logs, and comprehensive CSV spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto no-print">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Filters Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {activeTab === 'daily' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          {activeTab === 'student' && (
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Search Student</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter student name or roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Printable Institution Header (Only shown during print or at top of statement) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {settings.institutionName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official Attendance Statement • Academic Term: {settings.currentSemester} • Minimum Threshold: {settings.minAttendanceThreshold}%
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* TAB 1: DAILY SESSION REPORT */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lecture Sessions on {formatDate(selectedDate)}
              </h3>
              <span className="text-xs text-slate-400">{dailySessions.length} sessions conducted</span>
            </div>

            {dailySessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No sessions recorded on {formatDate(selectedDate)}. Please choose another date or mark attendance.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Course Code</th>
                      <th className="px-4 py-2.5">Course Name</th>
                      <th className="px-4 py-2.5">Class Batch</th>
                      <th className="px-4 py-2.5">Instructor</th>
                      <th className="px-4 py-2.5 text-center">Present / Total</th>
                      <th className="px-4 py-2.5 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dailySessions.map((sess) => {
                      let pres = 0;
                      const tot = sess.records ? sess.records.length : 0;
                      (sess.records || []).forEach(r => { if (r.status === 'present') pres++; });
                      const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;

                      return (
                        <tr key={sess.id}>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{sess.subjectCode}</td>
                          <td className="px-4 py-3 font-medium">{sess.subjectName}</td>
                          <td className="px-4 py-3">Sem {sess.semester} - Sec {sess.section}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{sess.markedBy}</td>
                          <td className="px-4 py-3 text-center font-semibold">{pres} / {tot}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MONTHLY SUMMARY */}
        {activeTab === 'monthly' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Aggregated Monthly Attendance Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Roll No</th>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5 text-center">Conducted</th>
                    <th className="px-4 py-2.5 text-center">Present</th>
                    <th className="px-4 py-2.5 text-center">Absent</th>
                    <th className="px-4 py-2.5 text-right">Attendance %</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {studentReports.slice(0, 15).map(st => (
                    <tr key={st.id}>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-white">{st.rollNumber}</td>
                      <td className="px-4 py-2.5 font-medium">{st.name}</td>
                      <td className="px-4 py-2.5">{st.department}</td>
                      <td className="px-4 py-2.5 text-center font-semibold">{st.stats.totalClasses}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-600 font-semibold">{st.stats.present}</td>
                      <td className="px-4 py-2.5 text-center text-rose-600 font-semibold">{st.stats.absent}</td>
                      <td className="px-4 py-2.5 text-right font-black text-slate-900 dark:text-white">{st.stats.overallPercentage}%</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant={st.stats.overallPercentage >= 75 ? 'success' : 'danger'} size="sm">
                          {st.stats.overallPercentage >= 75 ? 'ELIGIBLE' : 'DEFICIT'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT-WISE DETAILED REPORT */}
        {activeTab === 'student' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Individual Student Roster & Eligibility Status
              </h3>
              <span className="text-xs text-slate-400">Total: {studentReports.length} students</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Roll No</th>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">Department & Semester</th>
                    <th className="px-4 py-2.5 text-center">Classes Attended</th>
                    <th className="px-4 py-2.5 text-center">Attendance %</th>
                    <th className="px-4 py-2.5 text-right">Exam Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {paginatedStudents.map(st => {
                    const eligible = st.stats.overallPercentage >= (settings.minAttendanceThreshold || 75);
                    return (
                      <tr key={st.id}>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{st.rollNumber}</td>
                        <td className="px-4 py-3 font-medium">{st.name}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {st.department} • Sem {st.semester}-{st.section}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {st.stats.present} / {st.stats.totalClasses}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-black text-xs ${eligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {st.stats.overallPercentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={eligible ? 'success' : 'danger'} size="sm">
                            {eligible ? 'Eligible' : 'Detained / Deficit'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs no-print">
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUBJECT-WISE MASTER */}
        {activeTab === 'subject' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Course Master Attendance Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Code</th>
                    <th className="px-4 py-2.5">Course Title</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5 text-center">Lectures Held</th>
                    <th className="px-4 py-2.5 text-center">Logged Records</th>
                    <th className="px-4 py-2.5 text-right">Average Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {subjectReports.map(sub => (
                    <tr key={sub.id}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{sub.code}</td>
                      <td className="px-4 py-3 font-medium">{sub.name}</td>
                      <td className="px-4 py-3 text-slate-500">{sub.department} (Sem {sub.semester})</td>
                      <td className="px-4 py-3 text-center font-semibold">{sub.totalSessions}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{sub.totalStudentsLogged}</td>
                      <td className="px-4 py-3 text-right font-black">
                        <span className={sub.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                          {sub.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
