import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import PersonalSubjectModal from '../components/subjects/PersonalSubjectModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BunkBadge from '../components/common/BunkBadge';
import { useToast } from '../context/ToastContext';
import {
  getStudentSubjects,
  deleteStudentSubject,
  adjustSubjectAttendance,
  getSettings
} from '../utils/storage';
import { calculateOverallStudentMetrics } from '../utils/calculations';

export default function PersonalSubjectsPage() {
  const toast = useToast();

  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(getSettings());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const loadData = () => {
    setSubjects(getStudentSubjects());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    return calculateOverallStudentMetrics(subjects, settings.minAttendanceTarget || 75);
  }, [subjects, settings]);

  const handleDelete = () => {
    if (!subjectToDelete) return;
    deleteStudentSubject(subjectToDelete.id);
    setSubjectToDelete(null);
    loadData();
    toast.success(`Subject ${subjectToDelete.name} has been removed.`);
  };

  const handleAdjust = (subjectId, isPresent) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;

    if (isPresent) {
      adjustSubjectAttendance(subjectId, 1, 1);
      toast.success(`+1 Present for ${sub.name}`);
    } else {
      adjustSubjectAttendance(subjectId, 0, 1);
      toast.warning(`+1 Absent / Bunk for ${sub.name}`);
    }
    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            My Subjects & Course Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add custom subjects, set target attendance percentages, and track your attendance progress.
          </p>
        </div>

        <button
          onClick={() => {
            setSubjectToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Subject
        </button>
      </div>

      {/* Subjects Cards List */}
      {subjects.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Subjects Added Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Add your college course subjects to start tracking your daily attendance and safe bunks.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {metrics.subjects.map((sub) => {
            const isBelow = sub.percentage < sub.target;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color || '#6366f1' }}
                      />
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {sub.code || 'SUB'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSubjectToEdit(sub);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Teacher */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {sub.name}
                  </h3>
                  {sub.teacher && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Teacher: {sub.teacher}
                    </p>
                  )}

                  {/* Percentage & Progress */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Attendance Status
                      </span>
                      <span className={`text-xl font-black ${isBelow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {sub.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isBelow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>Attended: <strong>{sub.present}</strong> / {sub.total}</span>
                      <span>Target: <strong>{sub.target}%</strong></span>
                    </div>
                  </div>

                  {/* Bunk Criteria Badge */}
                  <div className="mt-3">
                    <BunkBadge stats={sub} />
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Adjust:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjust(sub.id, true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                    >
                      +1 Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(sub.id, false)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold border border-rose-200 dark:border-rose-800/40 transition-colors"
                    >
                      +1 Bunk
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <PersonalSubjectModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSubjectToEdit(null);
          }}
          subject={subjectToEdit}
          onSaved={loadData}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete ${subjectToDelete?.name}? It will also be removed from your weekly routine.`}
        confirmText="Delete Subject"
        type="danger"
      />

    </div>
  );
}
