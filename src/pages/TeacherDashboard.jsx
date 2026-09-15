import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  BookOpen,
  CalendarCheck,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/attendance/StatusBadge';
import StudentDetailModal from '../components/students/StudentDetailModal';
import { useAuth } from '../context/AuthContext';
import {
  getStudents,
  getSubjects,
  getAttendance,
  getTeachers,
  getSettings
} from '../utils/storage';
import { formatDate } from '../utils/dateUtils';

export default function TeacherDashboard({ onNavigate }) {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    setStudents(getStudents());
    setSubjects(getSubjects());
    setAttendance(getAttendance());
  }, []);

  // Determine which subjects belong to this teacher
  const teacherSubjects = useMemo(() => {
    const teacherId = currentUser?.teacherId || 'tch-1';
    return subjects.filter(s => s.teacherId === teacherId || s.code === 'CS401' || s.code === 'CS601');
  }, [subjects, currentUser]);

  // Attendance sessions marked for teacher's subjects
  const mySessions = useMemo(() => {
    const subjectCodes = teacherSubjects.map(s => s.code);
    return attendance.filter(a => subjectCodes.includes(a.subjectCode));
  }, [attendance, teacherSubjects]);

  // Teacher specific statistics
  const stats = useMemo(() => {
    let totalClasses = mySessions.length;
    let totalLogs = 0;
    let totalPresent = 0;

    mySessions.forEach(s => {
      (s.records || []).forEach(r => {
        totalLogs++;
        if (r.status === 'present') totalPresent++;
      });
    });

    const avgAttendance = totalLogs > 0 ? Math.round((totalPresent / totalLogs) * 100) : 0;

    return {
      totalClasses,
      totalSubjects: teacherSubjects.length,
      avgAttendance,
      totalStudentsEnrolled: students.filter(s => s.department === (currentUser?.department || 'Computer Science')).length
    };
  }, [mySessions, teacherSubjects, students, currentUser]);

  return (
    <div className="space-y-6">
      
      {/* Teacher Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Faculty Portal • {currentUser?.department || 'Computer Science'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hello, {currentUser?.name || 'Prof. Sarah Jenkins'}! 👨‍🏫
          </h1>
          <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
            You have <strong className="text-white font-semibold">{teacherSubjects.length} active courses</strong> assigned this semester. Quick take attendance or review past submission records.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('marking')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm shadow-lg hover:bg-blue-50 transition-all hover:scale-102"
          >
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Take Today's Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Courses"
          value={stats.totalSubjects}
          subtitle="Active curriculum classes"
          icon={BookOpen}
          color="blue"
          onClick={() => onNavigate('subjects')}
        />
        <StatCard
          title="Sessions Conducted"
          value={stats.totalClasses}
          subtitle="Logged in system"
          icon={CalendarCheck}
          color="indigo"
          onClick={() => onNavigate('records')}
        />
        <StatCard
          title="Class Average"
          value={`${stats.avgAttendance}%`}
          subtitle="Across your subjects"
          icon={CheckCircle2}
          color={stats.avgAttendance >= 75 ? 'emerald' : 'amber'}
          trend={stats.avgAttendance >= 75 ? 'Optimal' : 'Attention'}
          trendType={stats.avgAttendance >= 75 ? 'up' : 'down'}
        />
        <StatCard
          title="Students Enrolled"
          value={stats.totalStudentsEnrolled}
          subtitle={`${currentUser?.department || 'CS'} Department`}
          icon={Users}
          color="purple"
          onClick={() => onNavigate('students')}
        />
      </div>

      {/* Assigned Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              My Assigned Courses & Classes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a course to quickly start marking student attendance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherSubjects.map(sub => {
            const sessionsForSub = mySessions.filter(s => s.subjectCode === sub.code);
            let pres = 0;
            let tot = 0;
            sessionsForSub.forEach(s => {
              (s.records || []).forEach(r => {
                tot++;
                if (r.status === 'present') pres++;
              });
            });
            const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                      {sub.code}
                    </span>
                    <Badge variant={pct >= 75 ? 'success' : 'warning'} size="sm">
                      {pct > 0 ? `${pct}% Avg` : 'New Course'}
                    </Badge>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                    {sub.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {sub.department} • Semester {sub.semester} • {sub.credits} Credits
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {sessionsForSub.length} sessions held
                  </span>
                  <button
                    onClick={() => onNavigate('marking', { subjectCode: sub.code, semester: sub.semester })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Mark Class
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity by Teacher */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Recent Attendance Submissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review or edit recently taken lecture sessions
            </p>
          </div>
          <button
            onClick={() => onNavigate('records')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800 pb-2">
              <tr>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Course</th>
                <th className="py-2.5">Class Batch</th>
                <th className="py-2.5">Room</th>
                <th className="py-2.5 text-right">Attendance</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {mySessions.slice(0, 6).map((sess) => {
                let pres = 0;
                const tot = sess.records ? sess.records.length : 0;
                (sess.records || []).forEach(r => { if (r.status === 'present') pres++; });
                const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;

                return (
                  <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-medium">{formatDate(sess.date)}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {sess.subjectCode} - {sess.subjectName}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                        Sem {sess.semester} • Sec {sess.section}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{sess.room || 'Main Lab'}</td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {pct}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">{pres}/{tot} present</span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate('marking', { editSessionId: sess.id })}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                      >
                        Edit Session
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      <StudentDetailModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
      />

    </div>
  );
}
