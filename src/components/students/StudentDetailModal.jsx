import React, { useMemo } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../attendance/StatusBadge';
import Badge from '../common/Badge';
import {
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  BookOpen,
  Clock
} from 'lucide-react';
import { calculateStudentStats } from '../../utils/calculations';
import { getAttendance, getSubjects, getSettings } from '../../utils/storage';
import { exportStudentReportToCSV } from '../../utils/csvExport';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dateUtils';

export default function StudentDetailModal({ isOpen, onClose, student }) {
  const toast = useToast();

  const stats = useMemo(() => {
    if (!student) return null;
    const attendance = getAttendance();
    const subjects = getSubjects();
    const settings = getSettings();
    return calculateStudentStats(student.id, attendance, subjects, settings.minAttendanceThreshold || 75);
  }, [student, isOpen]);

  if (!student || !stats) return null;

  const handleExport = () => {
    exportStudentReportToCSV(student, stats);
    toast.success(`Exported attendance report for ${student.name}`);
  };

  const isLow = stats.overallPercentage < 75;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Attendance Profile"
      description={`Detailed record & subject breakdown for ${student.name}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-slate-50 dark:from-indigo-950/30 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h3>
                <Badge variant={student.status === 'Active' ? 'success' : 'warning'} size="sm">
                  {student.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Roll No: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{student.rollNumber}</span> • {student.department} • Sem {student.semester}-{student.section}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Download Report (CSV)
          </button>
        </div>

        {/* Overall KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Overall Attendance</p>
            <p className={`text-2xl font-black mt-1 ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {stats.overallPercentage}%
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Classes</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalClasses}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Present</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.present}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-center">
            <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Absent</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.absent}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-center">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Late</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.late}</p>
          </div>
        </div>

        {/* Low Attendance Warning Alert */}
        {isLow && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200">
              <strong className="font-bold block text-sm">Low Attendance Warning:</strong>
              Student attendance is currently <span className="font-bold">{stats.overallPercentage}%</span> (Below required 75%).
              {stats.classesNeededOverall > 0 && (
                <span className="block mt-1 text-rose-700 dark:text-rose-300 font-semibold">
                  Action Required: Must attend at least {stats.classesNeededOverall} consecutive future classes to restore eligibility.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Subject-Wise Breakdown Table */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Subject-Wise Attendance Breakdown
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Subject Code & Name</th>
                  <th className="px-3 py-3 text-center">Held</th>
                  <th className="px-3 py-3 text-center">Present</th>
                  <th className="px-3 py-3 text-center">Absent</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3 text-right">Target Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {stats.subjectBreakdown.map((sub) => {
                  const subLow = sub.percentage < 75;
                  return (
                    <tr key={sub.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium">
                        <span className="font-bold text-slate-900 dark:text-white block">{sub.code}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{sub.name}</span>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold">{sub.total}</td>
                      <td className="px-3 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">{sub.present}</td>
                      <td className="px-3 py-3 text-center font-semibold text-rose-600 dark:text-rose-400">{sub.absent}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                            <div
                              className={`h-full rounded-full ${
                                sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, sub.percentage)}%` }}
                            />
                          </div>
                          <span className={`font-bold ${subLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {sub.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sub.classesNeeded > 0 ? (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            Needs {sub.classesNeeded} classes
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Satisfied
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Attendance Session Logs */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Attendance History Log (Recent Sessions)
          </h4>
          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 sticky top-0 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Remarks</th>
                  <th className="px-4 py-2.5">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {stats.sessionHistory.slice(0, 15).map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-2 font-mono font-medium">{formatDate(log.date)}</td>
                    <td className="px-4 py-2 font-medium">{log.subjectCode} - {log.subjectName}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={log.status} size="sm" />
                    </td>
                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400 italic">
                      {log.remarks || '—'}
                    </td>
                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                      {log.markedBy || 'Faculty'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Modal>
  );
}
