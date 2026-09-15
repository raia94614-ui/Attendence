import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import StudentModal from '../components/students/StudentModal';
import StudentDetailModal from '../components/students/StudentDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  getStudents,
  deleteStudent,
  getAttendance,
  getSubjects,
  getSettings
} from '../utils/storage';
import { calculateStudentStats } from '../utils/calculations';
import { exportStudentsToCSV } from '../utils/csvExport';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function StudentsPage() {
  const toast = useToast();
  const { role } = useAuth();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(getSettings());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentForDetail, setStudentForDetail] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const loadData = () => {
    setStudents(getStudents());
    setAttendance(getAttendance());
    setSubjects(getSubjects());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-calculate attendance stats for each student
  const studentStatsMap = useMemo(() => {
    const map = {};
    const threshold = settings.minAttendanceThreshold || 75;
    students.forEach(st => {
      map[st.id] = calculateStudentStats(st.id, attendance, subjects, threshold);
    });
    return map;
  }, [students, attendance, subjects, settings]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        st.name.toLowerCase().includes(q) ||
        st.rollNumber.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        (st.studentId && st.studentId.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (selectedDept !== 'All Departments' && st.department !== selectedDept) return false;
      if (selectedSemester !== 'ALL' && String(st.semester) !== String(selectedSemester)) return false;
      if (selectedSection !== 'ALL' && String(st.section) !== String(selectedSection)) return false;

      return true;
    });
  }, [students, searchQuery, selectedDept, selectedSemester, selectedSection]);

  const handleDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    loadData();
    toast.success(`Student ${studentToDelete.name} has been removed.`);
  };

  const handleExportCSV = () => {
    exportStudentsToCSV(filteredStudents);
    toast.success(`Exported ${filteredStudents.length} student records to CSV`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Students Directory & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage student enrollments, academic batches, and view individual attendance summaries.
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
          {role === 'admin' && (
            <button
              onClick={() => {
                setStudentToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, roll number, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Department */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
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

          {/* Section */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Sections</option>
              {['A', 'B', 'C', 'D'].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No students match the current filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search bar or filter dropdowns.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Roll No & Student</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Class Batch</th>
                  <th className="px-5 py-3.5">Contact Info</th>
                  <th className="px-5 py-3.5 text-center">Attendance %</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredStudents.map((st) => {
                  const stat = studentStatsMap[st.id] || { overallPercentage: 100, present: 0, totalClasses: 0 };
                  const isLow = stat.overallPercentage < (settings.minAttendanceThreshold || 75);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Name & Roll No */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => setStudentForDetail(st)}>
                              {st.name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {st.rollNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {st.department}
                      </td>

                      {/* Batch */}
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                          Sem {st.semester} • Sec {st.section}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                        <span className="block">{st.email}</span>
                        {st.phone && <span className="text-[10px] block">{st.phone}</span>}
                      </td>

                      {/* Attendance % */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-bold text-xs ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {stat.overallPercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {stat.present}/{stat.totalClasses} classes
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <Badge variant={st.status === 'Active' ? 'success' : 'warning'} size="sm">
                          {st.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setStudentForDetail(st)}
                            title="View Full Profile & Attendance"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role === 'admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setStudentToEdit(st);
                                  setIsModalOpen(true);
                                }}
                                title="Edit Student"
                                className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setStudentToDelete(st)}
                                title="Delete Student"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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
          Showing {filteredStudents.length} of {students.length} registered students
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setStudentToEdit(null);
        }}
        student={studentToEdit}
        onSaved={loadData}
      />

      {/* Student Details Drawer / Modal */}
      <StudentDetailModal
        isOpen={!!studentForDetail}
        onClose={() => setStudentForDetail(null)}
        student={studentForDetail}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${studentToDelete?.name} (${studentToDelete?.rollNumber})? This will permanently remove their records from local storage.`}
        confirmText="Delete Student"
        type="danger"
      />

    </div>
  );
}
