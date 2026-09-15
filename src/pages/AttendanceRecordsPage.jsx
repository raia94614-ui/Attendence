import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus
} from 'lucide-react';
import StatusBadge from '../components/attendance/StatusBadge';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  getAttendance,
  getSubjects,
  deleteAttendanceSession,
  saveAllAttendance
} from '../utils/storage';
import { exportAttendanceSessionsToCSV, exportDetailedAttendanceLogsToCSV } from '../utils/csvExport';
import { formatDate } from '../utils/dateUtils';

export default function AttendanceRecordsPage({ onNavigate }) {
  const toast = useToast();
  const { role } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterSection, setFilterSection] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected session for viewing details modal
  const [selectedSession, setSelectedSession] = useState(null);
  // Session to delete
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const loadData = () => {
    setAttendance(getAttendance());
    setSubjects(getSubjects());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSessions = useMemo(() => {
    return attendance.filter(sess => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        sess.subjectCode.toLowerCase().includes(q) ||
        (sess.subjectName || '').toLowerCase().includes(q) ||
        (sess.markedBy || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Subject filter
      if (filterSubject !== 'ALL' && sess.subjectCode !== filterSubject) return false;

      // Semester filter
      if (filterSemester !== 'ALL' && String(sess.semester) !== String(filterSemester)) return false;

      // Section filter
      if (filterSection !== 'ALL' && String(sess.section) !== String(filterSection)) return false;

      // Date range
      if (startDate && sess.date < startDate) return false;
      if (endDate && sess.date > endDate) return false;

      return true;
    });
  }, [attendance, searchQuery, filterSubject, filterSemester, filterSection, startDate, endDate]);

  const handleDelete = () => {
    if (!sessionToDelete) return;
    deleteAttendanceSession(sessionToDelete.id);
    setSessionToDelete(null);
    loadData();
    toast.success('Attendance session record deleted');
  };

  const handleExportSummaryCSV = () => {
    exportAttendanceSessionsToCSV(filteredSessions);
    toast.success(`Exported summary of ${filteredSessions.length} sessions to CSV`);
  };

  const handleExportDetailedLogsCSV = () => {
    exportDetailedAttendanceLogsToCSV(filteredSessions);
    toast.success(`Exported detailed logs for ${filteredSessions.length} sessions to CSV`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Attendance Records & Session Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, inspect, filter, or export historical lecture attendance sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportSummaryCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export Sessions CSV
          </button>
          <button
            onClick={handleExportDetailedLogsCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Detailed Logs CSV
          </button>
          <button
            onClick={() => onNavigate('marking')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            Take Attendance
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by course code, title, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Sections</option>
              {['A', 'B', 'C', 'D'].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="From Date"
              className="w-full px-2.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No attendance sessions found matching your criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or record a new session.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Session Date</th>
                  <th className="px-5 py-3.5">Course Code & Name</th>
                  <th className="px-5 py-3.5">Class Batch</th>
                  <th className="px-5 py-3.5">Marked By</th>
                  <th className="px-5 py-3.5 text-center">Roster Summary</th>
                  <th className="px-5 py-3.5 text-center">Attendance %</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSessions.map((sess) => {
                  let pres = 0;
                  let abs = 0;
                  let lte = 0;
                  const tot = sess.records ? sess.records.length : 0;
                  (sess.records || []).forEach(r => {
                    if (r.status === 'present') pres++;
                    else if (r.status === 'absent') abs++;
                    else if (r.status === 'late') lte++;
                  });
                  const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium">
                        {formatDate(sess.date)}
                        <span className="block text-[10px] text-slate-400">{sess.timeSlot || '09:00 AM - 10:00 AM'}</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {sess.subjectCode}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sess.subjectName}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                          Sem {sess.semester} • Sec {sess.section}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{sess.department}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {sess.markedBy || 'Faculty'}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span className="text-emerald-600 dark:text-emerald-400">{pres}P</span>
                          <span className="text-rose-600 dark:text-rose-400">{abs}A</span>
                          {lte > 0 && <span className="text-amber-500">{lte}L</span>}
                          <span className="text-slate-400">({tot} total)</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <Badge variant={pct >= 75 ? 'success' : 'danger'} size="sm">
                          {pct}%
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSession(sess)}
                            title="View Session Details"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate('marking', { editSessionId: sess.id })}
                            title="Edit Attendance"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {role === 'admin' && (
                            <button
                              onClick={() => setSessionToDelete(sess)}
                              title="Delete Session"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredSessions.length} total lecture sessions
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          title={`Lecture Roster: ${selectedSession.subjectCode} - ${selectedSession.subjectName}`}
          description={`Conducted on ${formatDate(selectedSession.date)} (${selectedSession.timeSlot || '09:00 AM - 10:00 AM'})`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block">Class:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Semester {selectedSession.semester} • Section {selectedSession.section}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Faculty:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSession.markedBy || 'Faculty'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Room:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSession.room || 'CS-Lab 2'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Students:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSession.records ? selectedSession.records.length : 0} enrolled
                </span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Roll No</th>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {(selectedSession.records || []).map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-mono font-bold text-slate-900 dark:text-white">
                        {r.rollNumber}
                      </td>
                      <td className="px-4 py-2 font-medium">{r.studentName}</td>
                      <td className="px-4 py-2 text-center">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400 italic">
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const id = selectedSession.id;
                  setSelectedSession(null);
                  onNavigate('marking', { editSessionId: id });
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Edit This Session
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Attendance Session"
        message={`Are you sure you want to delete the attendance record for ${sessionToDelete?.subjectCode} on ${sessionToDelete?.date}? This will remove attendance points for all enrolled students.`}
        confirmText="Delete Record"
        type="danger"
      />

    </div>
  );
}
