import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Calendar,
  BookOpen,
  Users,
  Search,
  Check,
  X,
  Clock,
  HelpCircle,
  Sparkles,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getStudents,
  getSubjects,
  getAttendance,
  saveAttendanceSession,
  addNotification
} from '../utils/storage';
import { getTodayDateString, formatDate } from '../utils/dateUtils';

export default function AttendanceMarkingPage({ params = {}, onNavigate }) {
  const { currentUser, role } = useAuth();
  const toast = useToast();

  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [attendanceSessions, setAttendanceSessions] = useState([]);

  // Session selector states
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(params.subjectCode || 'CS401');
  const [selectedSemester, setSelectedSemester] = useState(params.semester || '4');
  const [selectedSection, setSelectedSection] = useState(params.section || 'A');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [room, setRoom] = useState('CS-Lab 2');

  // Search & filter inside table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Attendance states for loaded students: map studentId -> { status: 'present'|'absent'|'late'|'excused', remarks: '' }
  const [recordsState, setRecordsState] = useState({});
  const [existingSessionId, setExistingSessionId] = useState(params.editSessionId || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadedSubs = getSubjects();
    const loadedStuds = getStudents();
    const loadedAtt = getAttendance();

    setSubjects(loadedSubs);
    setAllStudents(loadedStuds);
    setAttendanceSessions(loadedAtt);

    // If editSessionId passed via navigation
    if (params.editSessionId) {
      const sess = loadedAtt.find(s => s.id === params.editSessionId);
      if (sess) {
        setSelectedSubjectCode(sess.subjectCode);
        setSelectedSemester(sess.semester);
        setSelectedSection(sess.section);
        setSelectedDate(sess.date);
        setTimeSlot(sess.timeSlot || '09:00 AM - 10:00 AM');
        setRoom(sess.room || 'CS-Lab 2');
        setExistingSessionId(sess.id);

        const initialRecords = {};
        (sess.records || []).forEach(r => {
          initialRecords[r.studentId] = {
            status: r.status,
            remarks: r.remarks || ''
          };
        });
        setRecordsState(initialRecords);
      }
    }
  }, [params]);

  // Selected subject metadata
  const currentSubject = useMemo(() => {
    return subjects.find(s => s.code === selectedSubjectCode) || subjects[0];
  }, [subjects, selectedSubjectCode]);

  // Filter students belonging to this semester, section, and department
  const eligibleStudents = useMemo(() => {
    return allStudents.filter(s => {
      const matchDept = !currentSubject || s.department === currentSubject.department;
      const matchSem = String(s.semester) === String(selectedSemester);
      const matchSec = String(s.section) === String(selectedSection);
      return matchDept && matchSem && matchSec;
    });
  }, [allStudents, currentSubject, selectedSemester, selectedSection]);

  // Check if an existing session exists for this Date + Subject + Semester + Section
  useEffect(() => {
    if (params.editSessionId) return; // Handled explicitly

    const existing = attendanceSessions.find(s => 
      s.date === selectedDate &&
      s.subjectCode === selectedSubjectCode &&
      s.semester === selectedSemester &&
      s.section === selectedSection
    );

    if (existing) {
      setExistingSessionId(existing.id);
      const initialRecords = {};
      (existing.records || []).forEach(r => {
        initialRecords[r.studentId] = {
          status: r.status,
          remarks: r.remarks || ''
        };
      });
      setRecordsState(initialRecords);
    } else {
      setExistingSessionId(null);
      // Default all eligible students to present on first load
      const initialRecords = {};
      eligibleStudents.forEach(st => {
        initialRecords[st.id] = {
          status: 'present',
          remarks: ''
        };
      });
      setRecordsState(initialRecords);
    }
  }, [selectedDate, selectedSubjectCode, selectedSemester, selectedSection, attendanceSessions, eligibleStudents.length]);

  // Handle single student status toggle
  const handleStatusChange = (studentId, newStatus) => {
    setRecordsState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus
      }
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (studentId, remarks) => {
    setRecordsState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // Bulk actions
  const handleMarkAll = (status) => {
    const updated = { ...recordsState };
    eligibleStudents.forEach(st => {
      updated[st.id] = {
        ...updated[st.id],
        status
      };
    });
    setRecordsState(updated);
    toast.info(`Marked all ${eligibleStudents.length} students as ${status.toUpperCase()}`);
  };

  // Filtered student list for table rendering
  const displayedStudents = useMemo(() => {
    return eligibleStudents.filter(st => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || st.name.toLowerCase().includes(q) || st.rollNumber.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;

      const stStatus = recordsState[st.id]?.status || 'present';
      return stStatus.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [eligibleStudents, searchQuery, statusFilter, recordsState]);

  // Live Summary metrics
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    const total = eligibleStudents.length;

    eligibleStudents.forEach(st => {
      const stStatus = recordsState[st.id]?.status || 'present';
      if (stStatus === 'present') present++;
      else if (stStatus === 'absent') absent++;
      else if (stStatus === 'late') late++;
      else if (stStatus === 'excused') excused++;
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, percentage };
  }, [eligibleStudents, recordsState]);

  // Save session to LocalStorage
  const handleSaveAttendance = () => {
    if (eligibleStudents.length === 0) {
      toast.warning('No students are enrolled in this semester and section.');
      return;
    }

    setIsSaving(true);

    const recordPayload = eligibleStudents.map(st => ({
      studentId: st.id,
      studentName: st.name,
      rollNumber: st.rollNumber,
      status: recordsState[st.id]?.status || 'present',
      remarks: recordsState[st.id]?.remarks || ''
    }));

    const sessionPayload = {
      id: existingSessionId || `att-sess-${Date.now()}`,
      date: selectedDate,
      subjectCode: currentSubject?.code || selectedSubjectCode,
      subjectName: currentSubject?.name || selectedSubjectCode,
      teacherId: currentSubject?.teacherId || currentUser?.id,
      department: currentSubject?.department || 'Computer Science',
      semester: selectedSemester,
      section: selectedSection,
      timeSlot,
      room,
      markedBy: currentUser?.name || 'Faculty',
      records: recordPayload
    };

    saveAttendanceSession(sessionPayload);
    setExistingSessionId(sessionPayload.id);
    setAttendanceSessions(getAttendance());

    addNotification({
      title: 'Attendance Saved',
      message: `Marked ${summary.present}/${summary.total} present for ${sessionPayload.subjectCode} (Section ${selectedSection}) on ${formatDate(selectedDate)}.`,
      type: 'success'
    });

    setIsSaving(false);
    toast.success(`Attendance successfully saved! (${summary.percentage}% Present)`);

    // Trigger celebration confetti if attendance is >= 85%
    if (summary.percentage >= 85) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.85 }
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mark Class Attendance
            </h1>
            {existingSessionId ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Editing Saved Session
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> New Session
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select course curriculum, date, and batch to record student presence.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSaving || eligibleStudents.length === 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : existingSessionId ? 'Update Attendance Session' : 'Save Attendance Record'}
        </button>
      </div>

      {/* Session Configuration Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Session Parameters
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Subject Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Subject / Course
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {subjects.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {['A', 'B', 'C', 'D'].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Time Slot */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Lecture Time Slot
            </label>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="09:00 AM - 10:00 AM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

        </div>
      </div>

      {/* Live Session Counter Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md border border-slate-800">
        <div className="text-center p-2">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</p>
          <p className="text-xl font-black mt-0.5">{summary.total}</p>
        </div>
        <div className="text-center p-2 border-l border-slate-800">
          <p className="text-[10px] uppercase font-bold text-emerald-400">Present</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{summary.present}</p>
        </div>
        <div className="text-center p-2 border-l border-slate-800">
          <p className="text-[10px] uppercase font-bold text-rose-400">Absent</p>
          <p className="text-xl font-black text-rose-400 mt-0.5">{summary.absent}</p>
        </div>
        <div className="text-center p-2 border-l border-slate-800">
          <p className="text-[10px] uppercase font-bold text-amber-400">Late</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">{summary.late}</p>
        </div>
        <div className="text-center p-2 border-l border-slate-800">
          <p className="text-[10px] uppercase font-bold text-blue-400">Excused</p>
          <p className="text-xl font-black text-blue-400 mt-0.5">{summary.excused}</p>
        </div>
        <div className="text-center p-2 border-l border-slate-800 bg-indigo-600/20 rounded-xl">
          <p className="text-[10px] uppercase font-bold text-indigo-300">Rate</p>
          <p className="text-xl font-black text-indigo-300 mt-0.5">{summary.percentage}%</p>
        </div>
      </div>

      {/* Student List Table & Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Mark All Absent
            </button>
            <button
              onClick={() => handleMarkAll('late')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold border border-amber-200 dark:border-amber-800/50 transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Mark All Late
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>

        </div>

        {/* Student Rows Table */}
        {eligibleStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No students found matching this class filter.</p>
            <p className="text-xs text-slate-400 mt-1">
              Ensure you have registered students for {currentSubject?.department} (Semester {selectedSemester}, Section {selectedSection}).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 w-16">#</th>
                  <th className="px-5 py-3">Roll No & Student Name</th>
                  <th className="px-5 py-3 text-center">Attendance Status</th>
                  <th className="px-5 py-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {displayedStudents.map((st, idx) => {
                  const currentRec = recordsState[st.id] || { status: 'present', remarks: '' };
                  const stStatus = currentRec.status;

                  return (
                    <tr
                      key={st.id}
                      className={`transition-colors ${
                        stStatus === 'absent'
                          ? 'bg-rose-50/30 dark:bg-rose-950/10'
                          : stStatus === 'late'
                          ? 'bg-amber-50/30 dark:bg-amber-950/10'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Index */}
                      <td className="px-5 py-3 text-slate-400 font-mono">{idx + 1}</td>

                      {/* Student Profile Info */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {st.name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {st.rollNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              stStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" /> Present
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              stStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" /> Absent
                          </button>

                          {/* Late Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'late')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              stStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Late
                          </button>

                          {/* Excused Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'excused')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              stStatus === 'excused'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-950/50 hover:text-blue-700'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>

                      {/* Remarks Input */}
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          placeholder="Optional note (e.g. sick leave, late 10m)..."
                          value={currentRec.remarks || ''}
                          onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Bar */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {displayedStudents.length} of {eligibleStudents.length} students enrolled in Section {selectedSection}
          </p>
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving || eligibleStudents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>

      </div>

    </div>
  );
}
